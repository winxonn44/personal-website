import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'

// Scroll-lit paragraph (DESIGN-v2 S3, used once: the About statement). Each
// word goes from 18% to 100% opacity in reading order as the paragraph
// crosses the viewport (offset "start 0.8" → "end 0.45").
//
//   <ScrollLitText as="p" segments={[{ text: 'Plain words ' }, { text: 'loud', className: 'text-amber' }]} />
//
// Screen readers get the plain sentence; reduced motion shows it fully lit.
function Word({ progress, range, children, className }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <m.span style={{ opacity }} className={className} aria-hidden="true">
      {children}
    </m.span>
  )
}

export default function ScrollLitText({ as = 'p', segments, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.45'] })
  const Comp = as
  const plain = segments.map((s) => s.text).join('')

  const words = segments.flatMap((s) =>
    s.text.split(/(\s+)/).filter(Boolean).map((w) => ({ w, className: s.className })),
  )
  const count = words.filter((x) => x.w.trim()).length
  let i = 0

  return (
    <Comp ref={ref} className={className}>
      <span className="sr-only">{plain}</span>
      {words.map(({ w, className: cls }, k) => {
        if (!w.trim()) return w
        const n = i++
        if (reduce) return <span key={k} className={cls} aria-hidden="true">{w}</span>
        const start = n / count
        const end = Math.min(1, start + 1.5 / count)
        return (
          <Word key={k} progress={scrollYProgress} range={[start, end]} className={cls}>
            {w}
          </Word>
        )
      })}
    </Comp>
  )
}
