import { useRef } from 'react'

// A "ticket": notched card that tilts in 3D toward the cursor and carries an
// amber glint that tracks the pointer. Notches, perforation and glint styling
// live in index.css (.ticket / .ticket-glint). Honours prefers-reduced-motion.
export default function TicketCard({ as = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e) => {
    const el = ref.current
    if (!el || reduce) return
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
