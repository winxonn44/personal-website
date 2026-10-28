import { useCallback, useEffect, useRef, useState } from 'react'

// Live harmonic analyzer for the music hobby card. Audio goes through an
// AnalyserNode; YIN finds the fundamental f0 on the time-domain buffer, then the
// spectral peak near each k·f0 (k = 1..12) becomes one bar, in dB relative to the
// strongest harmonic. The relative heights are the tone's timbre.
//
// Sample: B♭ trumpet, non-vibrato, mf, concert B♭3 (plays ~230 Hz, slightly flat),
// cut from "Trumpet.novib.mf.E3B3.aiff" of the University of Iowa Electronic Music
// Studios Musical Instrument Samples, https://theremin.music.uiowa.edu/MISBbtrumpet.html
// License (https://theremin.music.uiowa.edu/MIS.html): "freely available ... and may
// be downloaded and used for any projects, without restrictions." The steady part
// was crossfade-looped to ~7 s and encoded to AAC.
const SAMPLE_URL = `${import.meta.env.BASE_URL}hobbies/trumpet-bb3.m4a`

const N = 12
const FLOOR_DB = 48 // bar is empty this many dB below the strongest harmonic
const MIN_F = 55
const MAX_F = 1000
const YIN_W = 2048
const FFT_SIZE = 16384
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

function noteLabel(f) {
  const midi = Math.round(69 + 12 * Math.log2(f / 440))
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1} · ${Math.round(f)} Hz`
}

// YIN pitch estimate on buf[start .. start + W + tauMax). Returns Hz or null.
function yin(buf, start, sr) {
  const tauMin = Math.floor(sr / MAX_F)
  const tauMax = Math.min(Math.ceil(sr / MIN_F), buf.length - start - YIN_W - 1)
  if (tauMax <= tauMin) return null
  const d = new Float32Array(tauMax + 2)
  let running = 0
  let best = -1
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let s = 0
    for (let i = 0; i < YIN_W; i++) {
      const diff = buf[start + i] - buf[start + i + tau]
      s += diff * diff
    }
    running += s
    d[tau] = running ? (s * tau) / running : 1
  }
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (d[tau] < 0.15) {
      while (tau < tauMax && d[tau + 1] < d[tau]) tau++
      best = tau
      break
    }
  }
  if (best < 0) {
    for (let tau = tauMin; tau <= tauMax; tau++) if (best < 0 || d[tau] < d[best]) best = tau
    if (d[best] > 0.3) return null
  }
  // Parabolic interpolation around the dip for sub-sample period.
  const a = d[best - 1] ?? d[best]
  const c = d[best + 1] ?? d[best]
  const den = a - 2 * d[best] + c
  const shift = den ? (0.5 * (a - c)) / den : 0
  return sr / (best + Math.max(-1, Math.min(1, shift)))
}

function rms(buf, start, len) {
  let s = 0
  for (let i = start; i < start + len; i++) s += buf[i] * buf[i]
  return Math.sqrt(s / len)
}

function toLevels(db) {
  const max = Math.max(...db)
  return db.map((v) => Math.max(0, Math.min(1, 1 + (v - max) / FLOOR_DB)))
}

// Goertzel power of a windowed frame at one frequency.
function power(frame, f, sr) {
  const coeff = 2 * Math.cos((2 * Math.PI * f) / sr)
  let s1 = 0
  let s2 = 0
  for (let i = 0; i < frame.length; i++) {
    const s0 = frame[i] + coeff * s1 - s2
    s2 = s1
    s1 = s0
  }
  return s1 * s1 + s2 * s2 - coeff * s1 * s2
}

// Idle profile: average a few steady frames of the decoded sample.
function profileOf(buffer) {
  const sr = buffer.sampleRate
  const data = buffer.getChannelData(0)
  const L = 8192
  const win = new Float32Array(L).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (L - 1)))
  const pw = new Array(N).fill(0)
  const f0s = []
  for (const t of [1.5, 3, 4.5]) {
    const start = Math.floor(t * sr)
    if (start + L > data.length) continue
    const f0 = yin(data, start, sr)
    if (!f0) continue
    f0s.push(f0)
    const frame = new Float32Array(L)
    for (let i = 0; i < L; i++) frame[i] = data[start + i] * win[i]
    for (let k = 1; k <= N; k++) {
      let p = 0
      for (let s = -4; s <= 4; s++) p = Math.max(p, power(frame, k * f0 * (1 + s * 0.005), sr))
      pw[k - 1] += p
    }
  }
  if (!f0s.length) return null
  const f0 = f0s.reduce((a, b) => a + b) / f0s.length
  return { f0, levels: toLevels(pw.map((p) => 10 * Math.log10(p + 1e-20))) }
}

const btn = 'rounded-sm px-4 py-2.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] transition-[filter,color,border-color]'

export default function HarmonicAnalyzer() {
  const [mode, setMode] = useState('idle') // idle | sample | mic
  const [msg, setMsg] = useState('')
  const [ready, setReady] = useState(false)

  const figRef = useRef(null)
  const barRefs = useRef([])
  const noteRef = useRef(null)
  const live = useRef({
    ctx: null, analyser: null, source: null, stream: null, buffer: null, profile: null,
    levels: new Array(N).fill(0), targets: new Array(N).fill(0),
    time: null, freq: null, misses: 0, f0: 0, lastText: 0, lastFrame: 0,
    raf: 0, visible: false, active: false,
  })
  const reduce = useRef(false)

  const setNote = (text) => {
    if (noteRef.current && noteRef.current.textContent !== text) noteRef.current.textContent = text
  }

  const frame = useCallback((now) => {
    const s = live.current
    s.raf = 0
    if (!s.visible) return
    // Reduced motion: sample ~8x/s and snap, instead of easing every frame.
    if (reduce.current && now - s.lastFrame < 120) {
      s.raf = requestAnimationFrame(frame)
      return
    }
    s.lastFrame = now

    if (s.active && s.analyser) {
      const sr = s.ctx.sampleRate
      s.analyser.getFloatTimeDomainData(s.time)
      const start = s.time.length - YIN_W - Math.ceil(sr / MIN_F) - 2
      const f0 = rms(s.time, start, YIN_W + 800) > 0.004 ? yin(s.time, start, sr) : null
      if (f0) {
        s.misses = 0
        s.f0 = f0
        s.analyser.getFloatFrequencyData(s.freq)
        const binHz = sr / FFT_SIZE
        const db = []
        for (let k = 1; k <= N; k++) {
          const c = (k * f0) / binHz
          const half = Math.max(2, c * 0.03)
          let m = -Infinity
          for (let b = Math.max(0, Math.round(c - half)); b <= Math.min(s.freq.length - 1, Math.round(c + half)); b++) m = Math.max(m, s.freq[b])
          db.push(m)
        }
        s.targets = Math.max(...db) > -90 ? toLevels(db) : new Array(N).fill(0)
        if (now - s.lastText > 150) {
          setNote(noteLabel(f0))
          s.lastText = now
        }
      } else if (++s.misses > 6) {
        // Hold briefly through dropouts, then let the bars fall to rest. The
        // first ~0.5 s of silence (sample pre-roll, mic warm-up) stays "Listening".
        s.targets = new Array(N).fill(0)
        if (s.f0 || s.misses > 30) setNote('No clear pitch')
      }
    }

    let moving = false
    s.levels = s.levels.map((v, i) => {
      const t = s.targets[i]
      const next = reduce.current ? t : v + (t - v) * (t > v ? 0.35 : 0.12)
      if (Math.abs(next - t) > 0.002) moving = true
      return Math.abs(next - t) > 0.002 ? next : t
    })
    s.levels.forEach((v, i) => {
      const el = barRefs.current[i]
      if (el) el.style.transform = `scaleY(${v.toFixed(4)})`
    })
    if (s.active || moving) s.raf = requestAnimationFrame(frame)
  }, [])

  const kick = useCallback(() => {
    const s = live.current
    if (!s.raf && s.visible) s.raf = requestAnimationFrame(frame)
  }, [frame])

  const showIdle = useCallback(() => {
    const s = live.current
    if (s.profile) {
      s.targets = s.profile.levels.slice()
      setNote(noteLabel(s.profile.f0))
    } else {
      s.targets = new Array(N).fill(0)
    }
    kick()
  }, [kick])

  const stop = useCallback(() => {
    const s = live.current
    s.active = false
    try { s.source?.stop?.() } catch { /* already stopped */ }
    s.source?.disconnect()
    s.stream?.getTracks().forEach((t) => t.stop())
    s.ctx?.close()
    Object.assign(s, { ctx: null, analyser: null, source: null, stream: null, misses: 0 })
    setMode('idle')
    showIdle()
  }, [showIdle])

  const begin = (ctx) => {
    const s = live.current
    const analyser = ctx.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = 0.3
    // Bars drop to rest first, then rise with the live signal.
    Object.assign(s, {
      ctx, analyser, active: true, misses: 0, f0: 0, targets: new Array(N).fill(0),
      time: new Float32Array(FFT_SIZE), freq: new Float32Array(FFT_SIZE / 2),
    })
    return analyser
  }

  const playSample = async () => {
    stop()
    setMsg('')
    const s = live.current
    if (!s.buffer) return setMsg('Sample is still loading.')
    const AC = window.AudioContext || window.webkitAudioContext
    const ctx = new AC()
    const analyser = begin(ctx)
    const src = ctx.createBufferSource()
    src.buffer = s.buffer
    src.connect(analyser)
    analyser.connect(ctx.destination)
    src.onended = () => { if (live.current.source === src) stop() }
    s.source = src
    await ctx.resume()
    src.start()
    setMode('sample')
    setNote('Listening…')
    kick()
  }

  const startMic = async () => {
    stop()
    setMsg('')
    if (!navigator.mediaDevices?.getUserMedia) {
      return setMsg('Microphone input is not available in this browser.')
    }
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError'
      return setMsg(denied ? 'Microphone access was blocked. Allow it in your browser to try this.' : 'No usable microphone was found.')
    }
    const AC = window.AudioContext || window.webkitAudioContext
    const ctx = new AC()
    const analyser = begin(ctx)
    // Analyser only: the mic is never connected to the speakers.
    const src = ctx.createMediaStreamSource(stream)
    src.connect(analyser)
    Object.assign(live.current, { source: src, stream })
    await ctx.resume()
    setMode('mic')
    setNote('Listening…')
    kick()
  }

  // Decode the sample once the figure nears the viewport and precompute its
  // harmonic profile for the idle state. Also pause the loop while off-screen.
  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const s = live.current
    // The readout is written imperatively each frame, so React never owns its text.
    if (s.profile) showIdle()
    else setNote('Loading sample…')
    let cancelled = false
    let loading = false
    const load = async () => {
      loading = true
      try {
        const res = await fetch(SAMPLE_URL)
        const bytes = await res.arrayBuffer()
        const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext
        const buffer = await new OAC(1, 1, 44100).decodeAudioData(bytes)
        if (cancelled) return
        s.buffer = buffer
        s.profile = profileOf(buffer)
        setReady(true)
        if (!s.active) showIdle()
      } catch {
        if (!cancelled) setNote('Sample unavailable')
      }
    }
    const io = new IntersectionObserver(
      ([e]) => {
        s.visible = e.isIntersecting
        if (e.isIntersecting && !loading) load()
        if (e.isIntersecting) kick()
      },
      { rootMargin: '200px 0px' },
    )
    if (figRef.current) io.observe(figRef.current)
    return () => {
      cancelled = true
      io.disconnect()
      cancelAnimationFrame(s.raf)
      s.raf = 0
      s.active = false
      try { s.source?.stop?.() } catch { /* already stopped */ }
      s.stream?.getTracks().forEach((t) => t.stop())
      s.ctx?.close()
    }
  }, [kick, showIdle])

  const status = mode === 'sample' ? 'Live · sample' : mode === 'mic' ? 'Live · mic' : 'Sample profile'

  return (
    <figure ref={figRef} className="border border-line bg-ink px-5 py-5">
      <div className="flex items-baseline justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.12em]">
        <span className="min-w-0 truncate normal-case">
          <span className="text-muted">f₀ </span>
          <span ref={noteRef} className="tabular-nums text-bone" />
        </span>
        <span className={`shrink-0 ${mode === 'idle' ? 'text-muted' : 'text-amber'}`}>{status}</span>
      </div>

      <div className="mt-4 grid h-[140px] grid-cols-12 gap-1 border-b border-line sm:gap-1.5" aria-hidden="true">
        {Array.from({ length: N }, (_, i) => (
          <div key={i} className="flex h-full items-end">
            <div
              ref={(el) => (barRefs.current[i] = el)}
              className="h-full w-full origin-bottom bg-amber will-change-transform"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-12 gap-1 text-center font-mono text-[0.62rem] tabular-nums text-muted sm:gap-1.5" aria-hidden="true">
        {Array.from({ length: N }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={mode === 'sample' ? stop : playSample}
          disabled={!ready && mode !== 'sample'}
          className={`${btn} bg-amber text-ink hover:brightness-110 disabled:opacity-50`}
        >
          {mode === 'sample' ? 'Stop' : 'Play sample'}
        </button>
        <button
          type="button"
          onClick={mode === 'mic' ? stop : startMic}
          className={`${btn} border border-line text-bone hover:border-amber hover:text-amber`}
        >
          {mode === 'mic' ? 'Stop mic' : 'Use microphone'}
        </button>
      </div>
      {msg && (
        <p role="status" className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[#C4553B]">
          {msg}
        </p>
      )}

      <figcaption className="mt-4 font-mono text-[0.66rem] uppercase leading-[1.6] tracking-[0.12em] text-muted">
        Energy in harmonics 1–12 of the pitch. How a tone splits across them is its timbre.
        <span className="mt-1 block normal-case tracking-[0.04em]">
          Sample: B♭ trumpet, University of Iowa Electronic Music Studios (free to use, no restrictions).
        </span>
      </figcaption>
    </figure>
  )
}
