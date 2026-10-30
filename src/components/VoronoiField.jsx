import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { sectionIndex } from '../hooks/useActiveSection.js'
import { hasReadoutTarget, writeReadout } from '../hooks/fieldReadout.js'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')),
    )
  } catch {
    return false
  }
}

// Section states (DESIGN-v2 B2), in SECTION_IDS order. The render loop blends
// between neighbours using the continuous `sectionIndex`, then eases toward
// that blend each frame, so states cross-fade as you scroll.
//   opacity   canvas opacity
//   z, camY   camera dolly / height        panX  camera + target pan (right +)
//   parallax  cursor parallax strength     cursor  gravity well + cursor site (B3)
//   amber     near-edge colour, 1 amber → 0 bone
//   link      edge distance scale (< 1 = sparser)
//   flat      squash points onto y = 0 ("number line")
//   conv      pull points toward the arrival point and light it (Contact)
//   beacon    beacon brightness (B7)     speed  drift speed
const STATES = [
  // home: live math
  { opacity: 1.0, z: 15, camY: 0, panX: 0, parallax: 1, cursor: 1, amber: 1, link: 1, flat: 0, conv: 0, beacon: 1, speed: 1 },
  // about: dolly in, amber fades, quieter for reading
  { opacity: 0.7, z: 10, camY: 0, panX: 0, parallax: 0.6, cursor: 0, amber: 0.35, link: 1, flat: 0, conv: 0, beacon: 0.8, speed: 0.8 },
  // projects: pan right, sparser, bone edges only
  { opacity: 0.45, z: 13, camY: 0, panX: 4, parallax: 0.4, cursor: 0, amber: 0, link: 0.8, flat: 0, conv: 0, beacon: 0.6, speed: 0.6 },
  // resume: dimensional reduction onto a number line
  { opacity: 0.45, z: 13, camY: 1.6, panX: 0, parallax: 0.4, cursor: 0, amber: 0.2, link: 0.7, flat: 0.88, conv: 0, beacon: 0.6, speed: 0.6 },
  // off the clock
  { opacity: 0.55, z: 14, camY: 0, panX: -2, parallax: 0.5, cursor: 0, amber: 0.5, link: 0.95, flat: 0, conv: 0, beacon: 0.8, speed: 0.8 },
  // contact: zoom out, converge on one amber point, nearly still
  { opacity: 0.8, z: 18, camY: 0, panX: 0, parallax: 0.3, cursor: 0, amber: 1, link: 0.45, flat: 0, conv: 0.6, beacon: 0.4, speed: 0.25 },
]
const KEYS = Object.keys(STATES[0])
const LAST = STATES.length - 1

const DIM = 0.5 // below this canvas opacity, render at ~30 fps
const FOCAL = [0, 0, -6] // camera target

// Soft round sprite for beacons and the arrival point.
function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.08, 'rgba(255,255,255,0.95)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.32)')
  grd.addColorStop(0.5, 'rgba(255,255,255,0.08)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// A live 3D "Voronoi-inspired" field: drifting points with distance-linked
// edges (amber for near neighbours, bone for far), real depth via fog and
// perspective, and camera parallax on mouse + scroll for the fourth-wall feel.
// It sits fixed behind the whole page (see Background) and changes state per
// section. In the hero the cursor is a live site: a "gravity well" that pulls
// nearby points and grows amber edges toward the pointer.
//
// Performance: every buffer is allocated once at its maximum size and drawn
// with setDrawRange; the loop pauses while the tab is hidden and drops to
// ~30 fps when the field is dim. Reduced motion renders one static frame.
export default function VoronoiField() {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    if (!el || !supportsWebGL()) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = !reduce && !window.matchMedia('(hover: none), (pointer: coarse)').matches

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch (e) {
      return // no WebGL: leave the static near-black background
    }
    if (!renderer) return

    let vw = window.innerWidth
    let vh = window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(vw, vh, false)
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    el.appendChild(canvas)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.035)
    const cam = new THREE.PerspectiveCamera(60, vw / vh, 0.1, 100)
    cam.position.set(0, 0, 15)

    // Fewer points on small screens for performance.
    const mobile = vw < 720
    const N = mobile ? 60 : 120
    // Where Contact converges: beside the heading on desktop, below it on
    // phones, so the arrival point isn't hidden behind the text scrim.
    const ARRIVE = mobile ? [0, -6.5, -2] : [10, 1, -2]
    const pos = new Float32Array(N * 3) // simulated positions
    const vel = new Float32Array(N * 3)
    const home = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const o = i * 3
      pos[o] = (Math.random() - 0.5) * 34
      pos[o + 1] = (Math.random() - 0.5) * 22
      pos[o + 2] = -Math.random() * 22 + 2
      for (let a = 0; a < 3; a++) {
        vel[o + a] = (Math.random() - 0.5) * 0.02
        home[o + a] = pos[o + a]
      }
    }

    // Displayed positions: the simulation after the section transforms.
    const ptPos = new Float32Array(N * 3)
    const ptAttr = new THREE.BufferAttribute(ptPos, 3).setUsage(THREE.DynamicDrawUsage)
    const ptsGeo = new THREE.BufferGeometry()
    ptsGeo.setAttribute('position', ptAttr)
    const ptsMat = new THREE.PointsMaterial({ color: 0x9a958b, size: 0.13, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false })
    const points = new THREE.Points(ptsGeo, ptsMat)
    points.frustumCulled = false
    scene.add(points)

    // Edge layers, each pre-allocated for its worst case.
    const layers = []
    const lineLayer = (maxSegs, color, opacity) => {
      const arr = new Float32Array(maxSegs * 6)
      const attr = new THREE.BufferAttribute(arr, 3).setUsage(THREE.DynamicDrawUsage)
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', attr)
      geo.setDrawRange(0, 0)
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
      const seg = new THREE.LineSegments(geo, mat)
      seg.frustumCulled = false
      scene.add(seg)
      const layer = { arr, attr, geo, mat, n: 0 }
      layers.push(layer)
      return layer
    }
    const commit = (l) => {
      l.geo.setDrawRange(0, l.n * 2)
      if (!l.n) return
      // Upload only the part of the buffer in use this frame.
      l.attr.clearUpdateRanges()
      l.attr.addUpdateRange(0, l.n * 6)
      l.attr.needsUpdate = true
    }
    const pairs = (N * (N - 1)) / 2
    const near = lineLayer(pairs, 0xf0a227, 0.5)
    const far = lineLayer(pairs, 0x6e6e77, 0.2)
    // Bright edges drawn from the cursor to nearby points — the "gravity well".
    const grav = lineLayer(N, 0xf0a227, 0.72)

    // A small glowing marker sitting at the cursor's field position.
    const cursorGeo = new THREE.BufferGeometry()
    cursorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
    const cursorMat = new THREE.PointsMaterial({ color: 0xf0a227, size: 0.34, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false })
    const cursorPt = new THREE.Points(cursorGeo, cursorMat)
    cursorPt.frustumCulled = false
    scene.add(cursorPt)

    // Beacons (B7): a few points carry a soft glow that breathes in and out
    // of phase, so the field reads brighter without adding noise.
    const glow = glowTexture()
    const B = mobile ? 6 : 10
    // Beacons come from the nearer half of the field so fog doesn't swallow them.
    const nearPts = []
    for (let i = 0; i < N; i++) if (home[i * 3 + 2] > -12) nearPts.push(i)
    const pool = nearPts.length >= B ? nearPts : Array.from({ length: N }, (_, i) => i)
    const bIdx = Array.from({ length: B }, (_, b) => pool[Math.floor((b + 0.5) * (pool.length / B))])
    const bPos = new Float32Array(B * 3)
    const bCol = new Float32Array(B * 3)
    const bBase = Array.from({ length: B }, (_, b) => new THREE.Color(b % 3 === 0 ? 0xf0a227 : 0xedeae3))
    const bPhase = Array.from({ length: B }, () => Math.random() * Math.PI * 2)
    const bPeriod = Array.from({ length: B }, () => 4000 + Math.random() * 3000) // 4–7 s
    const bGeo = new THREE.BufferGeometry()
    const bPosAttr = new THREE.BufferAttribute(bPos, 3).setUsage(THREE.DynamicDrawUsage)
    const bColAttr = new THREE.BufferAttribute(bCol, 3).setUsage(THREE.DynamicDrawUsage)
    bGeo.setAttribute('position', bPosAttr)
    bGeo.setAttribute('color', bColAttr)
    const bMat = new THREE.PointsMaterial({
      size: mobile ? 1.6 : 2.0, map: glow, vertexColors: true, sizeAttenuation: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    const beacons = new THREE.Points(bGeo, bMat)
    beacons.frustumCulled = false
    scene.add(beacons)

    // The Contact "arrival" point the field converges on.
    const arrGeo = new THREE.BufferGeometry()
    arrGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARRIVE), 3))
    const arrMat = new THREE.PointsMaterial({
      color: 0xf0a227, size: 2.4, map: glow, sizeAttenuation: true, transparent: true,
      opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    const arrival = new THREE.Points(arrGeo, arrMat)
    arrival.frustumCulled = false
    scene.add(arrival)

    const mouse = { x: 0, y: 0 }
    let hasPointer = false
    const onMove = (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
      hasPointer = true
    }
    // Only a real exit from the window (mouseout also fires between elements).
    const onOut = (e) => {
      if (!e.relatedTarget) hasPointer = false
    }
    if (pointer) {
      window.addEventListener('mousemove', onMove, { passive: true })
      window.addEventListener('mouseout', onOut)
    }

    const NEAR = 3.4
    const FAR = 5.6
    const GRAV_R = 8.5 // radius of cursor influence
    const GRAV_EDGE = 6.0 // draw an edge to the cursor within this range
    const cursorWorld = new THREE.Vector3(0, 0, 0)
    const AMBER = new THREE.Color(0xf0a227)
    const BONE = new THREE.Color(0xedeae3)

    const cur = { ...STATES[0] } // eased state actually drawn
    const tgt = { ...STATES[0] } // blend of the two nearest section states
    const blend = (out) => {
      const s = Math.min(LAST, Math.max(0, sectionIndex.get()))
      const i = Math.floor(s)
      const f = s - i
      const a = STATES[i]
      const b = STATES[Math.min(i + 1, LAST)]
      for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * f
    }

    let shownOpacity = -1
    const setOpacity = (o) => {
      const r = Math.round(o * 100) / 100
      if (r === shownOpacity) return
      shownOpacity = r
      el.style.opacity = String(r)
    }

    let frameNo = 0
    // One frame. `k` = elapsed time in 60 fps frames; `animate` false draws
    // the current geometry without moving anything (reduced motion).
    function draw(now, k, animate) {
      const st = cur
      if (animate) setOpacity(st.opacity)
      const cursorOn = animate && pointer && hasPointer && st.cursor > 0.01

      if (animate) {
        // Cursor position projected onto the field plane (z ~ 0), smoothed.
        const ease = 1 - Math.pow(1 - 0.12, k)
        cursorWorld.x += (mouse.x * 30 - cursorWorld.x) * ease
        cursorWorld.y += (-mouse.y * 20 - cursorWorld.y) * ease
        const damp = Math.pow(0.985, k) // damping keeps velocities bounded
        const move = st.speed * k
        const pullK = 0.006 * st.cursor * k
        for (let i = 0; i < N; i++) {
          const o = i * 3
          // Gravity well: pull nearby points toward the cursor, ease others home.
          if (cursorOn) {
            const dx = cursorWorld.x - pos[o]
            const dy = cursorWorld.y - pos[o + 1]
            const dz = -pos[o + 2]
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            if (d < GRAV_R && d > 1e-4) {
              const f = ((1 - d / GRAV_R) * pullK) / d
              vel[o] += dx * f
              vel[o + 1] += dy * f
              vel[o + 2] += dz * f
            }
          }
          // gentle spring back to home so the field never collapses or drifts away
          for (let a = 0; a < 3; a++) {
            vel[o + a] = (vel[o + a] + (home[o + a] - pos[o + a]) * 0.0009 * k) * damp
            pos[o + a] += vel[o + a] * move
          }
          if (pos[o] > 17 || pos[o] < -17) vel[o] *= -1
          if (pos[o + 1] > 11 || pos[o + 1] < -11) vel[o + 1] *= -1
          if (pos[o + 2] > 2 || pos[o + 2] < -22) vel[o + 2] *= -1
        }
      }

      // Section transforms: flatten onto the number line, converge on the arrival point.
      const flatY = 1 - st.flat
      const conv = st.conv
      for (let i = 0; i < N; i++) {
        const o = i * 3
        const x = pos[o]
        const y = pos[o + 1] * flatY
        const z = pos[o + 2]
        ptPos[o] = x + (ARRIVE[0] - x) * conv
        ptPos[o + 1] = y + (ARRIVE[1] - y) * conv
        ptPos[o + 2] = z + (ARRIVE[2] - z) * conv
      }
      ptAttr.needsUpdate = true

      // Edges by distance (squared, no allocations).
      const n2 = (NEAR * st.link) ** 2
      const f2 = (FAR * st.link) ** 2
      const g2 = GRAV_EDGE * GRAV_EDGE
      const na = near.arr
      const fa = far.arr
      const ga = grav.arr
      let nn = 0
      let fn = 0
      let gn = 0
      for (let i = 0; i < N; i++) {
        const o = i * 3
        const ax = ptPos[o]
        const ay = ptPos[o + 1]
        const az = ptPos[o + 2]
        for (let j = i + 1; j < N; j++) {
          const p = j * 3
          const dx = ptPos[p] - ax
          const dy = ptPos[p + 1] - ay
          const dz = ptPos[p + 2] - az
          const d = dx * dx + dy * dy + dz * dz
          if (d >= f2) continue
          const arr = d < n2 ? na : fa
          const w = d < n2 ? nn++ * 6 : fn++ * 6
          arr[w] = ax
          arr[w + 1] = ay
          arr[w + 2] = az
          arr[w + 3] = ptPos[p]
          arr[w + 4] = ptPos[p + 1]
          arr[w + 5] = ptPos[p + 2]
        }
        if (cursorOn) {
          const dx = ax - cursorWorld.x
          const dy = ay - cursorWorld.y
          if (dx * dx + dy * dy + az * az < g2) {
            const w = gn++ * 6
            ga[w] = cursorWorld.x
            ga[w + 1] = cursorWorld.y
            ga[w + 2] = 0
            ga[w + 3] = ax
            ga[w + 4] = ay
            ga[w + 5] = az
          }
        }
      }
      near.n = nn
      far.n = fn
      grav.n = gn
      commit(near)
      commit(far)
      commit(grav)
      near.mat.color.copy(BONE).lerp(AMBER, st.amber)
      near.mat.opacity = 0.32 + 0.18 * st.amber
      grav.mat.opacity = 0.72 * st.cursor

      cursorGeo.attributes.position.setXYZ(0, cursorWorld.x, cursorWorld.y, 0)
      cursorGeo.attributes.position.needsUpdate = true
      cursorMat.opacity = cursorOn ? 0.9 * st.cursor : 0

      // Beacons follow their points and breathe (static under reduced motion).
      for (let b = 0; b < B; b++) {
        const o = bIdx[b] * 3
        const q = b * 3
        bPos[q] = ptPos[o]
        bPos[q + 1] = ptPos[o + 1]
        bPos[q + 2] = ptPos[o + 2]
        const breath = animate ? 0.6 + 0.4 * Math.sin((now / bPeriod[b]) * Math.PI * 2 + bPhase[b]) : 0.8
        const v = breath * st.beacon
        bCol[q] = bBase[b].r * v
        bCol[q + 1] = bBase[b].g * v
        bCol[q + 2] = bBase[b].b * v
      }
      bPosAttr.needsUpdate = true
      bColAttr.needsUpdate = true
      arrMat.opacity = Math.min(1, Math.max(0, (conv - 0.15) / 0.4)) * 0.95

      // Camera: cursor parallax (fourth wall), plus the section's dolly and pan.
      if (animate) {
        const ease = 1 - Math.pow(1 - 0.045, k)
        cam.position.x += (mouse.x * 5 * st.parallax + st.panX - cam.position.x) * ease
        cam.position.y += (-mouse.y * 3.4 * st.parallax + st.camY - cam.position.y) * ease
        cam.position.z = st.z
        cam.lookAt(FOCAL[0] + st.panX, FOCAL[1], FOCAL[2])
      } else {
        cam.lookAt(FOCAL[0], FOCAL[1], FOCAL[2])
      }
      renderer.render(scene, cam)

      // Hero readout, a few times a second is plenty.
      if (hasReadoutTarget() && frameNo++ % 4 === 0) {
        writeReadout('(' + (pos[0] / 17 * 0.5 + 0.5).toFixed(3) + ', ' + (pos[1] / 11 * 0.5 + 0.5).toFixed(3) + ')')
      }
    }

    let raf = 0
    let last = 0
    function loop(now) {
      raf = requestAnimationFrame(loop)
      const dt = last && now > last ? now - last : 16.67
      // Dim field: every other frame is enough.
      if (cur.opacity < DIM && last && now > last && dt < 30) return
      last = now
      const k = Math.min(dt / 16.67, 3)
      blend(tgt)
      const ease = 1 - Math.pow(1 - 0.08, k)
      for (const key of KEYS) cur[key] += (tgt[key] - cur[key]) * ease
      draw(now, k, true)
    }
    const start = () => {
      if (raf || reduce) return
      last = 0
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    // Pause entirely while the tab is hidden.
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    // Reduced motion: one static frame of the hero state; only the canvas
    // opacity follows the section as you scroll.
    let unsubSection = null
    const followSection = () => {
      blend(tgt)
      setOpacity(tgt.opacity)
    }
    if (reduce) {
      draw(performance.now(), 0, false)
      followSection()
      unsubSection = sectionIndex.on('change', followSection)
    } else if (!document.hidden) {
      start()
    }

    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      // Ignore mobile toolbar show/hide; the canvas stretches a few pixels.
      if (w === vw && Math.abs(h - vh) < 120) return
      vw = w
      vh = h
      cam.aspect = w / h
      cam.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      if (reduce) draw(performance.now(), 0, false)
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      if (unsubSection) unsubSection()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onOut)
      window.removeEventListener('resize', onResize)
      for (const l of layers) {
        l.geo.dispose()
        l.mat.dispose()
      }
      ;[ptsGeo, cursorGeo, bGeo, arrGeo, ptsMat, cursorMat, bMat, arrMat, glow].forEach((o) => o.dispose())
      renderer.dispose()
      if (canvas.parentNode === el) el.removeChild(canvas)
    }
  }, [])

  return <div ref={mount} className="absolute inset-0" aria-hidden="true" />
}
