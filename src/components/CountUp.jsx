import { useEffect, useRef } from 'react'
import { animate, m, useInView, useReducedMotion } from 'motion/react'
import { EASE_EXIT, EASE_ENTER, DUR } from '../motion/tokens.js'

// Metric count-up (DESIGN-v2 S6). Real numbers count from 0 the first time
// they enter view (0.9 s, ease-exit), keeping their prefix/suffix and decimal
// places: "≤0.1%", "250 Hz", "1.38", "276×", "58K". Anything whose prefix has
// letters ("Aug ’27") or that has no number ("ODE") just fades in.
// Reduced motion shows the final value.
//
// The final text is laid out invisibly underneath, so the width never jitters.
const NUMERIC = /^([^\dA-Za-z]*)(\d[\d,]*(?:\.\d+)?)(.*)$/

export function parseMetric(text) {
  const match = NUMERIC.exec(text)
  if (!match) return null
  const [, prefix, num, suffix] = match
  const value = parseFloat(num.replace(/,/g, ''))
  const decimals = (num.split('.')[1] || '').length
  const grouped = num.includes(',')
  return { prefix, value, decimals, grouped, suffix }
}

function format(v, { prefix, decimals, grouped, suffix }) {
  const n = grouped
    ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : v.toFixed(decimals)
  return `${prefix}${n}${suffix}`
}

export default function CountUp({ value: text, className = '' }) {
  const ref = useRef(null)
  const live = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const parsed = parseMetric(text)

  useEffect(() => {
    if (!parsed || !live.current) return
    const node = live.current
    if (reduce) { node.textContent = text; return }
    if (!inView) { node.textContent = format(0, parsed); return }
    const controls = animate(0, parsed.value, {
      duration: 0.9,
      ease: EASE_EXIT,
      onUpdate: (v) => { node.textContent = format(v, parsed) },
      onComplete: () => { node.textContent = text },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, text])

  if (!parsed) {
    return (
      <m.span
        ref={ref}
        className={className}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: DUR.page, ease: EASE_ENTER }}
      >
        {text}
      </m.span>
    )
  }

  return (
    <span ref={ref} className={`inline-grid tabular-nums ${className}`} aria-label={text}>
      <span className="invisible [grid-area:1/1]" aria-hidden="true">{text}</span>
      <span ref={live} className="[grid-area:1/1]" aria-hidden="true">{reduce ? text : format(0, parsed)}</span>
    </span>
  )
}
