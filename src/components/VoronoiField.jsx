import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A live 3D "Voronoi-inspired" field: drifting points with distance-linked
// edges (amber for near neighbours, bone for far), real depth via fog and
// perspective, and camera parallax on mouse + scroll for the fourth-wall feel.
// Medium intensity — between the Calm and Bold preview settings.
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

    const N = 90
    const P = []
    for (let i = 0; i < N; i++) {
      P.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 22, -Math.random() * 22 + 2),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
      })
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
    const nearSeg = new THREE.LineSegments(nearGeo, new THREE.LineBasicMaterial({ color: 0xf0a227, transparent: true, opacity: 0.5, depthWrite: false }))
    const farSeg = new THREE.LineSegments(farGeo, new THREE.LineBasicMaterial({ color: 0x6e6e77, transparent: true, opacity: 0.14, depthWrite: false }))
    scene.add(nearSeg, farSeg)

    const mouse = { x: 0, y: 0 }
    const onMove = (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
    }
    const onResize = () => {
      cam.aspect = width() / height()
      cam.updateProjectionMatrix()
      renderer.setSize(width(), height())
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)

    const NEAR = 3.4
    const FAR = 5.6
    const nearArr = []
    const farArr = []
    let raf

    function frame() {
      for (const p of P) {
        if (!reduce) p.pos.add(p.vel)
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
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = P[i].pos
          const b = P[j].pos
          const d = a.distanceTo(b)
          if (d < NEAR) nearArr.push(a.x, a.y, a.z, b.x, b.y, b.z)
          else if (d < FAR) farArr.push(a.x, a.y, a.z, b.x, b.y, b.z)
        }
      }
      nearGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nearArr), 3))
      farGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(farArr), 3))

      cam.position.x += (mouse.x * 3 - cam.position.x) * 0.04
      cam.position.y += (-mouse.y * 2 - cam.position.y) * 0.04
      const heroH = el.clientHeight || window.innerHeight
      const prog = Math.min(1, Math.max(0, (window.scrollY || 0) / heroH))
      cam.position.z = 15 - prog * 4
      el.style.opacity = String(1 - prog * 0.9)
      cam.lookAt(0, 0, -6)
      renderer.render(scene, cam)

      if (coordRef && coordRef.current) {
        coordRef.current.textContent =
          '(' + (P[0].pos.x / 17 * 0.5 + 0.5).toFixed(3) + ', ' + (P[0].pos.y / 11 * 0.5 + 0.5).toFixed(3) + ')'
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [coordRef])

  return <div ref={mount} className="absolute inset-0 z-0" aria-hidden="true" />
}
