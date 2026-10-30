import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

// Label decode (DESIGN-v2 T3): letters and digits cycle through A–Z0–9 and
// settle left to right. Mono labels only, never body copy or headings.
//
//   <Scramble text="§02 / SELECTED WORK" />            plays when first in view
//   <Scramble text="34.0689° N" trigger="mount" />      plays on mount
//
// Spaces and punctuation never scramble, so the label's width stays put.
// Reduced motion shows the final text straight away.
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const scrambles = (ch) => /[A-Za-z0-9]/.test(ch)

export default function Scramble({ text, trigger = 'view', duration = 350, delay = 0, as: Comp = 'span', ...rest }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const reduce = useReducedMotion()
  const [out, setOut] = useState(text)
  const go = trigger === 'mount' || inView

  useEffect(() => {
    if (!go || reduce) { setOut(text); return }
    let raf = 0
    let t0 = 0
    const step = (now) => {
      if (!t0) t0 = now + delay
      const p = Math.max(0, (now - t0) / duration)
      const settled = Math.floor(p * text.length)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        s += i < settled || !scrambles(ch) ? ch : CHARS[(Math.random() * CHARS.length) | 0]
      }
      setOut(s)
      if (p < 1) raf = requestAnimationFrame(step)
      else setOut(text)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [go, reduce, text, duration, delay])

  return (
    <Comp ref={ref} aria-label={text} {...rest}>
      <span aria-hidden="true">{out}</span>
    </Comp>
  )
}
