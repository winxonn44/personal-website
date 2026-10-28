import { useEffect, useRef } from 'react'

// A "ticket": notched card that tilts in 3D toward the cursor and carries an
// amber glint that tracks the pointer. Notches, perforation and glint styling
// live in index.css (.ticket / .ticket-glint). Honours prefers-reduced-motion;
// pass tilt={false} when the card holds something interactive, like an iframe.
export default function TicketCard({ as = 'div', className = '', tilt = true, children, ...rest }) {
  const ref = useRef(null)
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Flatten the card when tilt is switched off mid-hover.
  useEffect(() => {
    if (tilt || !ref.current) return
    ref.current.style.setProperty('--rx', '0deg')
    ref.current.style.setProperty('--ry', '0deg')
  }, [tilt])

  const onMove = (e) => {
    const el = ref.current
    if (!el || reduce || !tilt) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${px * 6}deg`)
    el.style.setProperty('--rx', `${py * -5}deg`)
    el.style.setProperty('--gx', `${px * 100 + 50}%`)
    el.style.setProperty('--gy', `${py * 100 + 50}%`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const Comp = as
  return (
    <Comp
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`ticket ${className}`}
      {...rest}
    >
      <span className="ticket-glint" aria-hidden="true" />
      {children}
    </Comp>
  )
}
