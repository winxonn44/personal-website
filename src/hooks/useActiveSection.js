import { useEffect, useSyncExternalStore } from 'react'
import { motionValue } from 'motion/react'

// Page section tracking, shared by everything that reacts to "where am I":
// the background field and tones now, the nav dot and tick rail later.
//
// One tracker for the whole page (ref-counted, started by the first user):
// - `active`: id of the section crossing the viewport's centre line, from a
//   single IntersectionObserver. React state; changes a handful of times.
// - `pageProgress`: MotionValue 0 → 1 over the whole document scroll.
// - `sectionIndex`: MotionValue, a continuous section position (0 = home,
//   1 = about, … 5 = contact). It holds whole numbers inside a section and
//   eases (smoothstep) to the next across a 20vh band around each boundary,
//   so anything keyed to it cross-fades instead of snapping. Read it with
//   `.get()` inside a render loop: no React re-renders.

export const SECTION_IDS = ['home', 'about', 'projects', 'resume', 'hobbies', 'contact']

export const pageProgress = motionValue(0)
export const sectionIndex = motionValue(0)

const BAND = 0.2 // boundary cross-fade, as a fraction of viewport height

let active = SECTION_IDS[0]
let users = 0
let stop = null
const listeners = new Set()

function setActive(id) {
  if (id === active) return
  active = id
  listeners.forEach((fn) => fn())
}

const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

function start() {
  const els = SECTION_IDS.map((id) => document.getElementById(id))
  let tops = [] // document-space tops of sections 1..n (the boundaries)
  let maxScroll = 1
  let raf = 0
  let seen = SECTION_IDS[0] // last section the observer saw at the centre line
  let atEnd = false
  const apply = () => setActive(atEnd ? SECTION_IDS[SECTION_IDS.length - 1] : seen)

  const measure = () => {
    const y = window.scrollY
    tops = els.slice(1).map((el) => (el ? el.getBoundingClientRect().top + y : Infinity))
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    update()
  }

  const update = () => {
    raf = 0
    const y = window.scrollY
    const vh = window.innerHeight
    pageProgress.set(Math.min(1, Math.max(0, y / maxScroll)))
    // Reference line sits at the viewport centre, then slides to the bottom
    // over the last half-screen of scroll so the final section always reaches
    // its own state, however short it is.
    const tail = smooth(1 - (maxScroll - y) / (vh * 0.5))
    const line = y + vh * (0.5 + 0.5 * tail)
    const band = vh * BAND
    let idx = 0
    for (const b of tops) idx += smooth((line - b) / band + 0.5)
    sectionIndex.set(idx)
    // Same end-of-page rule for the discrete id.
    atEnd = tail > 0.5 && idx > SECTION_IDS.length - 1.5
    apply()
  }

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update)
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) seen = e.target.id
      apply()
    },
    { rootMargin: '-50% 0px -50% 0px' },
  )
  els.forEach((el) => el && io.observe(el))

  // Sections change height (fonts, images, the live demo opening).
  const ro = new ResizeObserver(measure)
  ro.observe(document.body)

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure)
  measure()

  return () => {
    if (raf) cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', measure)
  }
}

// Start tracking without subscribing to React state (for render loops).
export function useSectionTracking() {
  useEffect(() => {
    if (users++ === 0) stop = start()
    return () => {
      if (--users === 0 && stop) {
        stop()
        stop = null
      }
    }
  }, [])
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const getActive = () => active

// { active, index, pageProgress, sectionIndex }. Re-renders only when the
// active section changes; bind the MotionValues for continuous effects.
export default function useActiveSection() {
  useSectionTracking()
  const id = useSyncExternalStore(subscribe, getActive, getActive)
  return { active: id, index: SECTION_IDS.indexOf(id), pageProgress, sectionIndex }
}
