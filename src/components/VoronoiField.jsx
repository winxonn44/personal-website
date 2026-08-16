import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A live 3D "Voronoi-inspired" field: drifting points with distance-linked
// edges (amber for near neighbours, bone for far), real depth via fog and
// perspective, and camera parallax on mouse + scroll for the fourth-wall feel.
// Intensity dialled up ~30% from the original: denser field, deeper parallax,
// and a cursor "gravity well" that pulls nearby points and grows live amber
// edges toward the pointer.
export default function VoronoiField({ coordRef }) {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch (e) {
      return // no WebGL: leave the static near-black background
    }
    if (!renderer) return

    const width = () => el.clientWidth || window.innerWidth
    const height = () => el.clientHeight || window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width(), height())
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.035)
    const cam = new THREE.PerspectiveCamera(60, width() / height(), 0.1, 100)
    cam.position.set(0, 0, 15)

    // Denser field on desktop, lighter on small screens for performance.
    const N = width() < 720 ? 80 : 120
    const P = []
    for (let i = 0; i < N; i++) {
      P.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 22, -Math.random() * 22 + 2),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
        home: null,
      })
      P[i].home = P[i].pos.clone()
    }

    const ptPos = new Float32Array(N * 3)
    const ptsGeo = new THREE.BufferGeometry()
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3))
    const points = new THREE.Points(
      ptsGeo,
      new THREE.PointsMaterial({ color: 0x9a958b, size: 0.13, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false }),
    )
    scene.add(points)

    const nearGeo = new THREE.BufferGeometry()
    const farGeo = new THREE.BufferGeometry()
    const gravGeo = new THREE.BufferGeometry()
    const nearSeg = new THREE.LineSegments(nearGeo, new THREE.LineBasicMaterial({ color: 0xf0a227, transparent: true, opacity: 0.5, depthWrite: false }))
    const farSeg = new THREE.LineSegments(farGeo, new THREE.LineBasicMaterial({ color: 0x6e6e77, transparent: true, opacity: 0.14, depthWrite: false }))
    // Bright edges drawn from the cursor to nearby points — the "gravity well".
    const gravSeg = new THREE.LineSegments(gravGeo, new THREE.LineBasicMaterial({ color: 0xf0a227, transparent: true, opacity: 0.72, depthWrite: false }))
    scene.add(nearSeg, farSeg, gravSeg)

    // A small glowing marker sitting at the cursor's field position.
    const cursorGeo = new THREE.BufferGeometry()
    cursorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
    const cursorPt = new THREE.Points(
      cursorGeo,
      new THREE.PointsMaterial({ color: 0xf0a227, size: 0.34, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false }),
    )
    scene.add(cursorPt)

    const mouse = { x: 0, y: 0 }
    let hasPointer = false
    const onMove = (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
      hasPointer = true
    }
    const onLeave = () => { hasPointer = false }
    const onResize = () => {
      cam.aspect = width() / height()
      cam.updateProjectionMatrix()
      renderer.setSize(width(), height())
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onLeave)
    window.addEventListener('resize', onResize)

    const NEAR = 3.4
    const FAR = 5.6
    const GRAV_R = 8.5 // radius of cursor influence
    const GRAV_EDGE = 6.0 // draw an edge to the cursor within this range
    const nearArr = []
    const farArr = []
    const gravArr = []
    const cursorWorld = new THREE.Vector3(0, 0, 0)
    const target = new THREE.Vector3()
    const pull = new THREE.Vector3()
    let raf

    function frame() {
      // Cursor position projected onto the field plane (z ~ 0), smoothed.
      target.set(mouse.x * 30, -mouse.y * 20, 0)
      cursorWorld.lerp(target, 0.12)

      for (const p of P) {
        if (!reduce) {
          // Gravity well: pull nearby points toward the cursor, ease others home.
          if (hasPointer) {
            const d = p.pos.distanceTo(cursorWorld)
            if (d < GRAV_R) {
              pull.subVectors(cursorWorld, p.pos).normalize()
              const f = (1 - d / GRAV_R) * 0.006
              p.vel.addScaledVector(pull, f)
            }
          }
          // gentle spring back to home so the field never collapses or drifts away
          pull.subVectors(p.home, p.pos)
          p.vel.addScaledVector(pull, 0.0009)
          p.vel.multiplyScalar(0.985) // damping keeps velocities bounded
          p.pos.add(p.vel)
        }
        if (p.pos.x > 17 || p.pos.x < -17) p.vel.x *= -1
        if (p.pos.y > 11 || p.pos.y < -11) p.vel.y *= -1
        if (p.pos.z > 2 || p.pos.z < -22) p.vel.z *= -1
      }
      for (let i = 0; i < N; i++) {
        ptPos[i * 3] = P[i].pos.x
        ptPos[i * 3 + 1] = P[i].pos.y
        ptPos[i * 3 + 2] = P[i].pos.z
      }
      ptsGeo.attributes.position.needsUpdate = true

      nearArr.length = 0
      farArr.length = 0
      gravArr.length = 0
      for (let i = 0; i < N; i++) {
        const a = P[i].pos
        for (let j = i + 1; j < N; j++) {
          const b = P[j].pos
          const d = a.distanceTo(b)
          if (d < NEAR) nearArr.push(a.x, a.y, a.z, b.x, b.y, b.z)
          else if (d < FAR) farArr.push(a.x, a.y, a.z, b.x, b.y, b.z)
        }
        if (hasPointer && !reduce) {
          const dc = a.distanceTo(cursorWorld)
          if (dc < GRAV_EDGE) gravArr.push(cursorWorld.x, cursorWorld.y, cursorWorld.z, a.x, a.y, a.z)
        }
      }
      nearGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nearArr), 3))
      farGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(farArr), 3))
      gravGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gravArr), 3))

      cursorGeo.attributes.position.setXYZ(0, cursorWorld.x, cursorWorld.y, cursorWorld.z)
      cursorGeo.attributes.position.needsUpdate = true
      cursorPt.material.opacity = hasPointer && !reduce ? 0.9 : 0

      // Deeper parallax: camera reacts harder to the pointer (fourth-wall).
      if (!reduce) {
        cam.position.x += (mouse.x * 5 - cam.position.x) * 0.045
        cam.position.y += (-mouse.y * 3.4 - cam.position.y) * 0.045
      }
      const heroH = el.clientHeight || window.innerHeight
      const prog = Math.min(1, Math.max(0, (window.scrollY || 0) / heroH))
      cam.position.z = 15 - prog * 5.5
      el.style.opacity = String(1 - prog * 0.9)
      cam.lookAt(0, 0, -6)
      renderer.render(scene, cam)

      if (coordRef && coordRef.current) {
        coordRef.current.textContent =
          '(' + (P[0].pos.x / 17 * 0.5 + 0.5).toFixed(3) + ', ' + (P[0].pos.y / 11 * 0.5 + 0.5).toFixed(3) + ')'
      }
      // Under reduced motion, render a single static frame and stop.
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [coordRef])

  return <div ref={mount} className="absolute inset-0 z-0" aria-hidden="true" />
}
