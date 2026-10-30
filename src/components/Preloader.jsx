import { useEffect, useRef, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { DUR, EASE_ENTER, EASE_EXIT } from '../motion/tokens.js'

// Preload hairline (DESIGN-v2 H2): a 1px amber bar across the very top that
// fills as three things land: web fonts, the field's first frame and the
// portrait decode. Then it fades and calls onDone, which starts the hero
// reveal (H4). Hard cap of 1.2 s so it never blocks. Fixed + transform-only,
// so it causes no layout shift. Reduced motion: no bar, done straight away.
const CAP = 1200 // ms

// The field mounts its canvas inside the fixed background layer and draws on
// the next animation frame; wait for the canvas, then two more frames.
function firstFieldFrame() {
  return new Promise((resolve) => {
    let n = 0
    let after = -1
    const tick = () => {
      n++
      if (after < 0 && document.querySelector('#field-underlay ~ div canvas')) after = n
      if ((after >= 0 && n - after >= 2) || n > 90) resolve() // no WebGL: give up quietly
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

function decode(src) {
  const img = new Image()
  img.src = src
  return (img.decode ? img.decode() : Promise.resolve()).catch(() => {})
}

export default function Preloader({ portraitSrc, onDone }) {
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(0.08)
  const [done, setDone] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (reduce) {
      setDone(true)
      doneRef.current?.()
      return
    }
    let alive = true
    let count = 0
    const tasks = [
      document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
      firstFieldFrame(),
      decode(portraitSrc),
    ]
    const finish = () => {
      if (!alive) return
      alive = false
      setProgress(1)
      // let the bar reach the end before handing over to the reveal
      setTimeout(() => {
        setDone(true)
        doneRef.current?.()
      }, DUR.micro * 1000)
    }
    tasks.forEach((t) =>
      t.then(() => {
        if (!alive) return
        count++
        setProgress(0.08 + (0.92 * count) / tasks.length)
        if (count === tasks.length) finish()
      }),
    )
    const cap = setTimeout(finish, CAP)
    return () => {
      alive = false
      clearTimeout(cap)
    }
  }, [reduce, portraitSrc])

  if (reduce) return null
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px origin-left bg-amber"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: progress, opacity: done ? 0 : 1 }}
      transition={{
        scaleX: { duration: DUR.micro, ease: EASE_ENTER },
        opacity: { duration: DUR.component, ease: EASE_EXIT },
      }}
    />
  )
}
