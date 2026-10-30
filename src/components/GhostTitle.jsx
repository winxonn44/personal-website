import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'

// Ghosted drifting section title (DESIGN-v2 S1, Instrument Serif per D1).
// A giant word at ghost opacity sits behind the section's content and drifts
// x 6% → −6% while the section crosses the viewport. It fills its section
// (which must be `relative`) and clips itself, so it never adds overflow.
// Content that should sit above it needs `relative`.
// Reduced motion: static.
export default function GhostTitle({ children, size = '22vw', className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
      <m.div
        style={{ x: reduce ? 0 : x, fontSize: size, color: 'var(--ghost)' }}
        className={`absolute left-0 right-0 top-[clamp(24px,4vw,64px)] whitespace-nowrap text-center font-hero leading-[0.84] tracking-[-0.025em] ${className}`}
      >
        {children}
      </m.div>
    </div>
  )
}
