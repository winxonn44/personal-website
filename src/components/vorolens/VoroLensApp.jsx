import { useEffect, useRef, useState } from 'react'
import sampleUrl from './sample.jpg'
import {
  computeField, densityCdf, mulberry32, sampleSeeds, buildGrid, assign, lloydStep,
  meanColors, renderMosaic, resampleMask,
} from './mosaic.js'

// VoroLens, rebuilt natively from the lab app (math-code-art/voronoi-app). Loaded with
// React.lazy only after "Launch", so neither this chunk nor the SlimSAM worker/model
// touches visitors who just scroll past.
//
// Working grid (density, sampling, Lloyd) is WORK_LONG px on the long side, the mosaic is
// painted at OUT_LONG; the lab app uses 220 / 512.
const WORK_LONG = 240
const OUT_LONG = 960
const ENCODE_LONG = 1024
const LLOYD_STEPS = 3
const GROW_MS = 1600
const GROW_START = 6
const SEED = 0x5eed
const MOSAIC_LINE = 'Voronoi mosaic · whole image'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Switch({ on, onClick, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted hover:text-bone"
    >
      <span
        className={`relative h-4 w-7 rounded-full border transition-colors ${on ? 'border-amber bg-amber/20' : 'border-line'}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full transition-[left,background-color] ${on ? 'left-[13px] bg-amber' : 'left-[2px] bg-muted'}`}
        />
      </span>
      {children}
    </button>
  )
}

function makeLayer(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  return { canvas, ctx, image: ctx.createImageData(w, h), mask: null }
}

export default function VoroLensApp({ onClose }) {
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const api = useRef(null)
  const [n, setN] = useState(250)
  const [showPts, setShowPts] = useState(false)
  const [sam, setSam] = useState(false)
  const [selected, setSelected] = useState(false)
  const [status, setStatus] = useState(MOSAIC_LINE)
  const [fileName, setFileName] = useState('sample image')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const src = document.createElement('canvas')
    const sctx = src.getContext('2d', { willReadFrequently: true })
    const enc = document.createElement('canvas')
    const ectx = enc.getContext('2d', { willReadFrequently: true })
    const s = {
      N: 250, showPts: false, sam: false, samStatus: '', img: null, W: 0, H: 0, MW: 0, MH: 0, rgba: null, field: null,
      mask: null, decoded: null, prompt: null, gen: 0, seeds: null, grid: null, colors: null,
      full: null, small: null, raf: 0, ready: false, encoded: false, failed: false, device: '',
      files: {}, dead: false,
    }

    // --- mosaic -------------------------------------------------------------------------
    // Seeds from the (masked) density field, then a few Lloyd steps toward cell centroids.
    function compute() {
      const { W, H, rgba, mask } = s
      const seeds = sampleSeeds(densityCdf(s.field, mask), W, s.N, mulberry32(SEED))
      for (let i = 0; i < LLOYD_STEPS; i++) {
        lloydStep(seeds, assign(buildGrid(seeds.x, seeds.y, s.N, W, H), rgba, W, H, mask), W, H, mask)
      }
      s.seeds = seeds
    }

    // Partition with the first k seeds and fill each cell with its mean colour.
    function finalize(k) {
      const { W, H, rgba, mask, seeds } = s
      s.grid = buildGrid(seeds.x, seeds.y, k, W, H)
      s.colors = meanColors(assign(s.grid, rgba, W, H, mask), seeds, rgba, W, H)
    }

    // With SlimSAM on and nothing selected, the original photo alone. Otherwise photo
    // underneath (only visible outside a selected object), mosaic on top, overlays last.
    const photoOnly = () => s.sam && !s.mask
    function draw({ clean = false, fast = false } = {}) {
      const { MW, MH, W, H } = s
      if (photoOnly()) {
        if (!s.img) return
        ctx.clearRect(0, 0, MW, MH)
        ctx.drawImage(s.img, 0, 0, MW, MH)
        if (!clean) drawPrompt()
        return
      }
      if (!s.grid) return
      ctx.clearRect(0, 0, MW, MH)
      if (s.mask) ctx.drawImage(s.img, 0, 0, MW, MH)
      const layer = fast ? s.small : s.full
      renderMosaic(s.grid, s.colors, W, H, layer.image, s.mask ? layer.mask : null)
      layer.ctx.putImageData(layer.image, 0, 0)
      ctx.imageSmoothingEnabled = !fast
      ctx.drawImage(layer.canvas, 0, 0, MW, MH)
      ctx.imageSmoothingEnabled = true
      const sx = MW / W, sy = MH / H
      if (s.showPts) {
        const { x, y } = s.seeds
        const r = Math.max(1.6, MW / 420)
        ctx.fillStyle = '#F0A227'
        ctx.strokeStyle = 'rgba(10,10,11,0.85)'
        ctx.lineWidth = 1
        for (let k = 0; k < s.grid.n; k++) {
          ctx.beginPath()
          ctx.arc(x[k] * sx, y[k] * sy, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
      }
      if (!clean) drawPrompt()
    }

    function drawPrompt() {
      const { MW, MH } = s
      if (s.prompt) {
        const px = s.prompt.nx * MW, py = s.prompt.ny * MH, r = Math.max(7, MW / 90)
        ctx.lineWidth = 4
        ctx.strokeStyle = 'rgba(10,10,11,0.6)'
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke()
        ctx.lineWidth = 2
        ctx.strokeStyle = '#F0A227'
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke()
      }
    }

    // Seeds appear coarse-to-fine (exponential count reads as steady sharpening), as in the lab app.
    function grow() {
      cancelAnimationFrame(s.raf)
      if (reduceMotion()) { finalize(s.N); draw(); return }
      const t0 = performance.now()
      const step = (now) => {
        const t = Math.min(1, (now - t0) / GROW_MS)
        const k = Math.min(s.N, Math.max(1, Math.round(GROW_START * Math.pow(s.N / GROW_START, t))))
        finalize(k)
        draw({ fast: t < 1 })
        if (t < 1) s.raf = requestAnimationFrame(step)
      }
      s.raf = requestAnimationFrame(step)
    }

    function update(animate) {
      cancelAnimationFrame(s.raf)
      if (photoOnly()) { draw(); return }
      compute()
      if (animate) grow()
      else { finalize(s.N); draw() }
    }

    // Output-resolution copies of the SAM mask for crisp object edges.
    function layerMasks() {
      const d = s.decoded
      for (const l of [s.full, s.small]) if (l) l.mask = d ? resampleMask(d.data, d.width, d.height, l.canvas.width, l.canvas.height) : null
    }

    // --- SAM ----------------------------------------------------------------------------
    // The worker (and its ~40 MB model) starts only the first time SlimSAM is switched on.
    let worker = null
    // SAM status is remembered while the toggle is off and shown again when it comes back on.
    const say = (msg) => { s.samStatus = msg; if (s.sam) setStatus(msg) }
    const deviceLabel = () => (s.device === 'webgpu' ? 'WebGPU' : 'WASM')
    const readyLine = () => `SlimSAM ready · ${deviceLabel()}`

    function encode() {
      if (!worker || !s.ready || !s.img || s.failed) return
      const iw = s.img.naturalWidth, ih = s.img.naturalHeight
      const k = Math.min(1, ENCODE_LONG / Math.max(iw, ih))
      enc.width = Math.max(1, Math.round(iw * k))
      enc.height = Math.max(1, Math.round(ih * k))
      ectx.drawImage(s.img, 0, 0, enc.width, enc.height)
      const id = ectx.getImageData(0, 0, enc.width, enc.height)
      s.encoded = false
      say(`Encoding image · ${deviceLabel()}…`)
      worker.postMessage({ type: 'encode', data: id.data.buffer, width: enc.width, height: enc.height }, [id.data.buffer])
    }

    function decode() {
      say('Segmenting…')
      worker.postMessage({ type: 'decode', nx: s.prompt.nx, ny: s.prompt.ny, gen: s.gen })
    }

    function onMessage({ data: m }) {
      if (m.type === 'progress') {
        s.files[m.file] = [m.loaded || 0, m.total || 0]
        let loaded = 0, total = 0
        for (const [l, t] of Object.values(s.files)) { loaded += l; total += t }
        if (total) say(`Downloading SlimSAM · ${(loaded / 1e6).toFixed(1)} / ${(total / 1e6).toFixed(1)} MB`)
      } else if (m.type === 'ready') {
        s.device = m.device
        if (!s.ready) { s.ready = true; encode() }
      } else if (m.type === 'encoded') {
        s.encoded = true
        if (s.prompt) decode() // a click that arrived while the model was loading
        else say(readyLine())
      } else if (m.type === 'mask') {
        if (m.gen !== s.gen) return // superseded by a newer click or image
        const mask = resampleMask(new Uint8Array(m.data), m.width, m.height, s.W, s.H)
        if (!mask.some(Boolean)) { say('Nothing found there · try another spot'); return }
        s.mask = mask
        s.decoded = { data: new Uint8Array(m.data), width: m.width, height: m.height }
        layerMasks()
        setSelected(true)
        say(readyLine())
        update(true)
      } else if (m.type === 'error') {
        s.failed = true
        s.prompt = null
        draw()
        say('Segmentation unavailable in this browser · turn SlimSAM off for the mosaic')
        console.warn('[VoroLens] SlimSAM:', m.message)
      }
    }

    function startSam() {
      if (worker) return
      say('Loading SlimSAM…')
      worker = new Worker(new URL('./sam.worker.js', import.meta.url), { type: 'module' })
      worker.onmessage = onMessage
      worker.postMessage({ type: 'load' })
    }

    // On: clear the mosaic back to the original photo and wait for a click.
    // Off: drop any selection and grow the whole-image mosaic again.
    function setSamOn(on) {
      s.sam = on
      s.gen++
      s.prompt = null
      s.mask = null
      s.decoded = null
      layerMasks()
      setSelected(false)
      if (on) {
        startSam()
        setStatus(s.samStatus)
      } else setStatus(MOSAIC_LINE)
      if (s.img) update(!on)
    }

    // --- image + interaction ------------------------------------------------------------
    function loadImage(img) {
      const ar = img.naturalWidth / img.naturalHeight
      s.W = ar >= 1 ? WORK_LONG : Math.max(24, Math.round(WORK_LONG * ar))
      s.H = ar >= 1 ? Math.max(24, Math.round(WORK_LONG / ar)) : WORK_LONG
      s.MW = ar >= 1 ? OUT_LONG : Math.round(OUT_LONG * ar)
      s.MH = ar >= 1 ? Math.round(OUT_LONG / ar) : OUT_LONG
      canvas.width = s.MW
      canvas.height = s.MH
      s.full = makeLayer(s.MW, s.MH)
      s.small = makeLayer(Math.round(s.MW / 2), Math.round(s.MH / 2))
      src.width = s.W
      src.height = s.H
      sctx.fillStyle = '#ffffff'
      sctx.fillRect(0, 0, s.W, s.H)
      sctx.drawImage(img, 0, 0, s.W, s.H)
      s.img = img
      s.rgba = sctx.getImageData(0, 0, s.W, s.H).data
      s.field = computeField(s.rgba, s.W, s.H)
      s.gen++
      s.prompt = null
      s.mask = null
      s.decoded = null
      setSelected(false)
      update(true)
      encode()
    }

    function loadUrl(url, onDone) {
      const img = new Image()
      img.onload = () => { if (s.dead) return; loadImage(img); onDone?.(true) }
      img.onerror = () => onDone?.(false)
      img.src = url
    }

    // Back to the whole-image mosaic.
    function reset() {
      if (!s.mask && !s.prompt) return
      s.gen++
      s.prompt = null
      s.mask = null
      s.decoded = null
      layerMasks()
      setSelected(false)
      if (s.ready && s.encoded) say(readyLine())
      update(true)
    }

    function onClick(e) {
      if (!s.img || !s.sam) return
      const r = canvas.getBoundingClientRect()
      const nx = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width))
      const ny = Math.min(0.999, Math.max(0, (e.clientY - r.top) / r.height))
      // Clicking inside the selected object again goes back to the whole image.
      if (s.mask?.[((ny * s.H) | 0) * s.W + ((nx * s.W) | 0)]) { reset(); return }
      if (s.failed) return
      s.gen++
      s.prompt = { nx, ny }
      if (s.encoded) decode()
      draw()
    }

    canvas.addEventListener('click', onClick)
    loadUrl(sampleUrl)

    api.current = {
      reset,
      setSam: setSamOn,
      setN(v) { s.N = v; if (!s.img) return; cancelAnimationFrame(s.raf); s.raf = requestAnimationFrame(() => update(false)) },
      setShowPts(v) { s.showPts = v; draw() },
      loadFile(file, done) {
        const url = URL.createObjectURL(file)
        loadUrl(url, (ok) => { URL.revokeObjectURL(url); done(ok) })
      },
      download() {
        if (!s.img) return
        cancelAnimationFrame(s.raf)
        if (!photoOnly()) finalize(s.N)
        draw({ clean: true })
        canvas.toBlob((blob) => {
          draw()
          if (!blob) return
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = 'vorolens-mosaic.png'
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(a.href), 1000)
        }, 'image/png')
      },
    }

    return () => {
      s.dead = true
      cancelAnimationFrame(s.raf)
      canvas.removeEventListener('click', onClick)
      worker?.terminate()
      api.current = null
    }
  }, [])

  useEffect(() => { api.current?.setN(n) }, [n])
  useEffect(() => { api.current?.setShowPts(showPts) }, [showPts])
  useEffect(() => { api.current?.setSam(sam) }, [sam])

  // Escape returns to the whole-image mosaic while an object is selected.
  useEffect(() => {
    if (!selected) return
    const onKey = (e) => { if (e.key === 'Escape') api.current?.reset() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const onFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    api.current?.loadFile(file, (ok) => setFileName(ok ? file.name : 'could not read that file'))
  }

  const btn =
    'rounded-sm border border-line px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors hover:border-amber hover:text-amber'

  return (
    <div className="border border-line bg-ink">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 font-mono text-[0.66rem] uppercase tracking-[0.12em]">
        <span className="flex min-w-0 items-center gap-2 text-amber">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
          <span className="truncate">VoroLens · live</span>
        </span>
        <button type="button" onClick={onClose} className="shrink-0 uppercase text-muted hover:text-bone">
          Close ✕
        </button>
      </div>

      <div className="flex justify-center px-3 pt-3 md:px-5 md:pt-5">
        <canvas
          ref={canvasRef}
          width={OUT_LONG}
          height={Math.round(OUT_LONG / 1.5)}
          aria-label="Voronoi mosaic. Turn on SlimSAM, then click an object to mosaic only that object."
          className={`block h-auto max-h-[72vh] w-auto max-w-full touch-manipulation border border-line ${sam ? 'cursor-crosshair' : ''}`}
        />
      </div>

      <div className="flex flex-col gap-1 px-3 pt-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] md:px-5">
        <p className="text-bone" role="status" aria-live="polite">
          <span className="text-amber">›</span> {status}
        </p>
        <p className="normal-case tracking-normal text-muted">
          {!sam
            ? 'Turn on SlimSAM to pick a single object to mosaic.'
            : selected
              ? 'Click the object again or press Esc to clear the selection.'
              : 'Click any object to segment it and mosaic only that object.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-3 py-4 md:px-5 md:py-5">
        <label className="flex w-full items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] sm:w-auto">
          <span className="shrink-0 text-muted">N Points</span>
          <input
            type="range"
            min="100"
            max="1200"
            step="50"
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="min-w-0 flex-1 accent-amber sm:w-48 sm:flex-none"
          />
          <output className="w-[4ch] shrink-0 text-right tabular-nums text-amber">{n}</output>
        </label>

        <Switch on={sam} onClick={() => setSam((v) => !v)}>SlimSAM</Switch>
        <Switch on={showPts} onClick={() => setShowPts((v) => !v)}>Show Points</Switch>

        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <button type="button" onClick={() => fileRef.current?.click()} className={`${btn} text-bone`}>
            Upload
          </button>
          <button type="button" onClick={() => api.current?.download()} className={`${btn} border-amber/50 text-amber`}>
            Download PNG
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
        <p className="w-full truncate font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
          {fileName} · images never leave your device
        </p>
      </div>
    </div>
  )
}
