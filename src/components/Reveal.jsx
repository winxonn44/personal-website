import { m, useReducedMotion } from 'motion/react'
import { reveal, revealReduced, stagger as staggerVariants, VIEWPORT } from '../motion/tokens.js'

// In-view reveal (DESIGN-v2 S2): content rises 24px and fades in the first
// time it scrolls 15% into the viewport. Replaces the old GSAP `data-reveal`.
//
//   <Reveal as="p">…</Reveal>                 one element
//   <Reveal stagger> <RevealItem/>… </Reveal> children follow at 0.04 s
//
// Reduced motion fades opacity only (MotionConfig would drop the transform
// anyway; the explicit variant keeps the intent readable).
export default function Reveal({ as = 'div', stagger = false, delay = 0, children, ...rest }) {
  const reduce = useReducedMotion()
  const Comp = m[as]
  const base = reduce ? revealReduced : reveal
  const variants = stagger
    ? staggerVariants(typeof stagger === 'number' ? stagger : undefined, delay)
    : delay
      ? { ...base, show: { ...base.show, transition: { ...base.show.transition, delay } } }
      : base
  return (
    <Comp initial="hidden" whileInView="show" viewport={VIEWPORT} variants={variants} {...rest}>
      {children}
    </Comp>
  )
}

// A child of <Reveal stagger>: inherits the parent's in-view trigger.
export function RevealItem({ as = 'div', children, ...rest }) {
  const reduce = useReducedMotion()
  const Comp = m[as]
  return (
    <Comp variants={reduce ? revealReduced : reveal} {...rest}>
      {children}
    </Comp>
  )
}
