import { useRef } from 'react'

// A "ticket": a card with two punched notches (true cut-outs, so they work over
// any section tone) and a cursor spotlight (DESIGN-v2 C1–C3, C6, C7).
//
// The component only tracks the pointer and writes --mx / --my; every visual
// state lives in index.css (.ticket*), so hover-in / hover-out timing, focus
// parity and the touch opt-out are pure CSS:
//   C1  .ticket-ring  amber glow masked to the 1px border ring + .ticket-glint fill
//   C2  .ticket-detail / .ticket-arrow / .ticket-metric  detail reveal
//   C3  .ticket-media  figure scale inside a fixed frame
//   C7  the same states on :has(:focus-visible)
// On pointer leave the vars are left alone, so the glow fades out where it was.
// The 3D tilt (old `tilt` prop) is gone per D3; the prop is still accepted and
// ignored so older callers keep working.
// eslint-disable-next-line no-unused-vars
export default function TicketCard({ as: Comp = 'div', className = '', tilt, children, ...rest }) {
  const ref = useRef(null)

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return // touch/pen: no spotlight
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Comp ref={ref} onPointerMove={onPointerMove} className={`ticket ${className}`} {...rest}>
      <span className="ticket-glint" aria-hidden="true" />
      <span className="ticket-ring" aria-hidden="true" />
      <span className="ticket-notch l" aria-hidden="true" />
      <span className="ticket-notch r" aria-hidden="true" />
      {children}
    </Comp>
  )
}
