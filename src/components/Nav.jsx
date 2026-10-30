import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'
import useActiveSection from '../hooks/useActiveSection.js'
import { DUR, EASE_ENTER, EASE_EXIT, STAGGER } from '../motion/tokens.js'

// Navigation (DESIGN-v2 §6, N1–N5).
// N1 floating pill with a sliding amber dot (layoutId, needs domMax),
// N2 hide on scroll down / show on scroll up, N4 full-screen mobile sheet,
// N5 the name link's per-letter lift + underline sweep (CSS in index.css).

const NAME = 'Winxon Nguyen'
const RESUME_PDF = `${import.meta.env.BASE_URL}resume.pdf`

// Pill items. `ids` are the sections that light the item's dot.
const PRIMARY = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Work', href: '#projects', id: 'projects' },
  { label: 'Résumé', href: '#resume', id: 'resume' },
]
const MORE = [
  { label: 'Off the clock', href: '#hobbies', id: 'hobbies' },
  { label: 'Contact', href: '#contact', id: 'contact' },
]
const MORE_IDS = MORE.map((l) => l.id)

// Mobile sheet: every section with a one-line description (N4).
const SHEET = [
  { label: 'Home', href: '#home', id: 'home', desc: 'Start at the top' },
  { label: 'About', href: '#about', id: 'about', desc: 'Background, the math, how I work' },
  { label: 'Work', href: '#projects', id: 'projects', desc: 'VoroNav, VoroLens, research' },
  { label: 'Résumé', href: '#resume', id: 'resume', desc: 'Experience and roles' },
  { label: 'Off the clock', href: '#hobbies', id: 'hobbies', desc: 'Music, and where the math started' },
  { label: 'Contact', href: '#contact', id: 'contact', desc: 'Email, GitHub, LinkedIn' },
]

const TOP_ZONE = 80 // px: always visible this close to the top
const JITTER = 4 // px: ignore tiny scroll wobbles

const linkCls =
  'relative block rounded-full py-2 pl-[18px] pr-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors duration-200'

// The amber dot. One instance at a time; layoutId slides it between items.
function Dot() {
  return (
    <m.span
      layoutId="nav-dot"
      aria-hidden="true"
      transition={{ duration: DUR.micro, ease: EASE_ENTER }}
      className="absolute left-[8px] top-1/2 -mt-[2px] h-1 w-1 rounded-full bg-amber"
    />
  )
}

export default function Nav() {
  const { active } = useActiveSection()
  const reduce = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  // N2: compare against the previous scroll position.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    if (y < TOP_ZONE) setHidden(false)
    else if (y > prev + JITTER) setHidden(true)
    else if (y < prev - JITTER) setHidden(false)
  })
  // Reduced motion: the nav simply stays put.
  const shown = reduce || !hidden || menuOpen || moreOpen

  const moreActive = MORE_IDS.includes(active)

  return (
    <>
      <m.header
        initial={false}
        animate={{ y: shown ? '0%' : '-100%' }}
        transition={{ duration: DUR.component, ease: EASE_EXIT }}
        // A keyboard user tabbing into a hidden nav brings it back.
        onFocusCapture={() => setHidden(false)}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-5 pt-4 md:px-8"
      >
        <div className="relative flex h-12 items-center justify-between gap-4 [&>*]:pointer-events-auto">
        <a
          href="#home"
          onClick={() => setMenuOpen(false)}
          className="name-link relative font-mono text-[0.78rem] uppercase tracking-[0.18em] text-muted"
        >
          <span className="mr-1 text-amber">§</span>
          {NAME.split('').map((ch, i) => (
            <span key={i} className="name-letter" style={{ transitionDelay: `${i * 22}ms` }}>
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
          <span className="name-sweep" aria-hidden="true" />
        </a>

        {/* N1: centered pill (desktop) */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-ink/60 p-1 backdrop-blur-md md:block"
        >
          <ul className="flex items-center">
            {PRIMARY.map((l) => {
              const on = active === l.id
              return (
                <li key={l.id}>
                  <a
                    href={l.href}
                    aria-current={on ? 'location' : undefined}
                    className={`${linkCls} ${on ? 'text-bone' : 'text-muted hover:text-bone'}`}
                  >
                    {on && <Dot />}
                    {l.label}
                  </a>
                </li>
              )
            })}
            <More active={active} moreActive={moreActive} open={moreOpen} setOpen={setMoreOpen} />
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={RESUME_PDF}
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted transition-colors hover:text-amber md:inline-flex"
          >
            Résumé<span aria-hidden="true">&nbsp;↗</span>
            <span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>

          {/* Mobile toggle */}
          <MenuToggle open={menuOpen} setOpen={setMenuOpen} />
        </div>
        </div>
      </m.header>

      <AnimatePresence>
        {menuOpen && <Sheet active={active} reduce={reduce} close={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

// `+ More` item: opens on hover (mouse), keyboard focus, or tap; closes on
// Escape, outside click, or focus leaving it.
function More({ active, moreActive, open, setOpen }) {
  const wrap = useRef(null)
  const btn = useRef(null)
  const timer = useRef(0)
  const openedBy = useRef(null)
  const skipFocusOpen = useRef(false) // Escape returns focus without reopening

  const show = useCallback(
    (how) => {
      clearTimeout(timer.current)
      if (!open) openedBy.current = how
      setOpen(true)
    },
    [open, setOpen],
  )
  const hide = useCallback(() => {
    clearTimeout(timer.current)
    openedBy.current = null
    setOpen(false)
  }, [setOpen])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) hide()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        hide()
        skipFocusOpen.current = true
        btn.current?.focus()
        skipFocusOpen.current = false
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, hide])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <li
      ref={wrap}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && show('hover')}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse' || openedBy.current !== 'hover') return
        timer.current = setTimeout(hide, 160)
      }}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget)) hide()
      }}
    >
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="nav-more"
        onFocus={(e) => {
          if (!skipFocusOpen.current && e.currentTarget.matches(':focus-visible')) show('focus')
        }}
        onClick={() => {
          // A click right after a hover/focus-open keeps it open (pins it).
          if (open && openedBy.current !== 'click') openedBy.current = 'click'
          else if (open) hide()
          else show('click')
        }}
        className={`${linkCls} ${moreActive ? 'text-bone' : 'text-muted hover:text-bone'}`}
      >
        {moreActive && <Dot />}
        <span aria-hidden="true">+&nbsp;</span>More
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id="nav-more"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: DUR.micro, ease: EASE_ENTER } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.18, ease: EASE_EXIT } }}
            className="absolute right-0 top-full pt-2"
          >
            <ul className="min-w-[180px] rounded-2xl border border-line bg-ink/90 p-1 backdrop-blur-md">
              {MORE.map((l) => {
                const on = active === l.id
                return (
                  <li key={l.id}>
                    <a
                      href={l.href}
                      onClick={hide}
                      aria-current={on ? 'location' : undefined}
                      className={`block rounded-xl px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-surface hover:text-bone ${
                        on ? 'text-amber' : 'text-muted'
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function MenuToggle({ open, setOpen }) {
  return (
    <button
      id="menu-toggle"
      type="button"
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      aria-controls="mobile-menu"
      onClick={() => setOpen((v) => !v)}
      className="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line bg-ink/60 backdrop-blur-md md:hidden"
    >
      <span
        className={`block h-px w-4 origin-center bg-bone transition-transform duration-300 ${
          open ? 'translate-y-[3px] rotate-45' : ''
        }`}
      />
      <span
        className={`block h-px w-4 origin-center bg-bone transition-transform duration-300 ${
          open ? '-translate-y-[3px] -rotate-45' : ''
        }`}
      />
    </button>
  )
}

// N4: full-screen sheet. Locks body scroll, moves focus in, traps Tab between
// the sheet and the toggle, restores focus on close, Escape closes.
function Sheet({ active, reduce, close }) {
  const ref = useRef(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const toggle = document.getElementById('menu-toggle')
    const returnTo = document.activeElement
    ref.current?.querySelector('a')?.focus({ preventScroll: true })

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const items = [toggle, ...(ref.current?.querySelectorAll('a') ?? [])].filter(Boolean)
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      // Back to whatever opened the menu (the toggle), unless a link moved on.
      const target = returnTo instanceof HTMLElement ? returnTo : toggle
      target?.focus({ preventScroll: true })
    }
  }, [close])

  const list = {
    hidden: {},
    show: { transition: { staggerChildren: STAGGER.items, delayChildren: 0.08 } },
  }
  const item = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: DUR.component, ease: EASE_ENTER } } }
    : {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: DUR.component, ease: EASE_ENTER } },
      }

  return (
    <m.div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: DUR.micro, ease: EASE_ENTER } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_EXIT } }}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-6 pb-10 pt-24 md:hidden"
    >
      <m.ul variants={list} initial="hidden" animate="show" className="flex flex-col">
        {SHEET.map((l, i) => {
          const on = active === l.id
          return (
            <m.li key={l.id} variants={item} className={`border-b border-line ${i === 0 ? 'border-t' : ''}`}>
              <a
                href={l.href}
                onClick={close}
                aria-current={on ? 'location' : undefined}
                className="group flex items-baseline gap-4 py-4"
              >
                <span className={`w-6 shrink-0 font-mono text-[0.7rem] ${on ? 'text-amber' : 'text-muted'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex flex-col gap-1">
                  <span
                    className={`font-display text-[clamp(1.9rem,8.5vw,2.6rem)] font-[350] leading-none tracking-[-0.02em] transition-colors group-hover:text-amber ${
                      on ? 'text-amber' : 'text-bone'
                    }`}
                  >
                    {l.label}
                  </span>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">{l.desc}</span>
                </span>
              </a>
            </m.li>
          )
        })}
        <m.li variants={item} className="pt-8">
          <a
            href={RESUME_PDF}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-amber"
          >
            Résumé PDF<span aria-hidden="true">&nbsp;↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </m.li>
      </m.ul>
    </m.div>
  )
}
