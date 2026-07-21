import { useState, useEffect } from 'react'

const links = [
  ['Home', '#home'],
  ['About', '#about'],
  ['Projects', '#projects'],
  ['Resume', '#resume'],
  ['Contact', '#contact'],
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-ink/70 px-8 py-[18px] backdrop-blur-md">
      <a href="#home" onClick={() => setOpen(false)} className="font-mono text-[0.78rem] uppercase tracking-[0.18em]">
        <span className="text-amber">§</span> Winxon&nbsp;Nguyen
      </a>

      {/* Desktop links */}
      <ul className="hidden gap-7 md:flex">
        {links.map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted transition-colors hover:text-bone"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile toggle */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-6 w-7 flex-col justify-center gap-[5px] md:hidden"
      >
        <span
          className={`block h-px w-full origin-center bg-bone transition-transform duration-300 ${
            open ? 'translate-y-[3px] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-px w-full origin-center bg-bone transition-transform duration-300 ${
            open ? '-translate-y-[3px] -rotate-45' : ''
          }`}
        />
      </button>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-center bg-ink px-8 transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-6">
          {links.map(([label, href], i) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="font-display text-[clamp(2.4rem,10vw,3.6rem)] font-[350] leading-none tracking-[-0.02em] text-bone transition-colors hover:text-amber"
              >
                <span className="mr-4 align-super font-mono text-[0.9rem] text-amber">
                  §0{i}
                </span>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
