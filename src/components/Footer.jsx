import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { DUR, EASE_ENTER, EASE_EXIT } from '../motion/tokens.js'
import Reveal from './Reveal.jsx'

// Footer (DESIGN-v2 F1–F5): status line, live LA clock + coordinates, build
// stamp, and the monument wordmark that rises into place and is cropped by
// the bottom of the page. The copy-email button (F3) is exported separately
// so Contact can use it next to its links.

const COORDS = '34.0689° N 118.4452° W'
// Injected by vite.config.js `define` (F5).
const BUILD_HASH = __BUILD_HASH__
const BUILD_DATE = __BUILD_DATE__

// ---- F4: live clock ---------------------------------------------------------
// hourCycle h23 avoids "24:00:00" at midnight; timeZoneName gives PDT/PST.
const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZoneName: 'short',
})
function laTime(d = new Date()) {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]))
  return `${p.hour}:${p.minute}:${p.second} ${p.timeZoneName}`
}

function Clock() {
  const ref = useRef(null)
  const inView = useInView(ref) // ticks only while on screen
  const [now, setNow] = useState(laTime)

  useEffect(() => {
    if (!inView) return
    let id = 0
    // Align ticks to the wall-clock second so the digits change on time.
    const tick = () => {
      setNow(laTime())
      id = setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    }
    tick()
    return () => clearTimeout(id)
  }, [inView])

  return (
    <span ref={ref} className="tabular-nums">
      Los Angeles <span className="text-bone">{now}</span>
      <span className="hidden sm:inline"> · </span>
      <span className="block sm:inline">{COORDS}</span>
    </span>
  )
}

// ---- F3: copy email ---------------------------------------------------------
// Click copies the address; the label swaps to "Copied ✓" for 1.6 s. If the
// Clipboard API is missing or refused, it falls back to opening a mail draft.
export function CopyEmail({ email, className = '' }) {
  const [copied, setCopied] = useState(false)
  const [announce, setAnnounce] = useState('')
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setAnnounce(`Email address ${email} copied to clipboard`)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        setCopied(false)
        setAnnounce('')
      }, 1600)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        title="Copy email address"
        aria-label={`Copy email address ${email}`}
        className={`group relative inline-flex items-baseline gap-3 text-left ${className}`}
      >
        {/* The invisible address sizes the button so the swap never shifts layout. */}
        <span className="relative block overflow-hidden border-b border-transparent text-amber transition-colors group-hover:border-amber">
          <span className="invisible block whitespace-nowrap">{email}</span>
          <span className="absolute inset-0 flex items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={copied ? 'copied' : 'email'}
                className="block whitespace-nowrap"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1, transition: { duration: DUR.micro, ease: EASE_ENTER } }}
                exit={{ y: '-100%', opacity: 0, transition: { duration: DUR.micro, ease: EASE_EXIT } }}
              >
                {copied ? 'Copied ✓' : email}
              </m.span>
            </AnimatePresence>
          </span>
        </span>
        <span aria-hidden="true" className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted transition-colors group-hover:text-bone">
          Copy
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
    </>
  )
}

// ---- F1: monument wordmark --------------------------------------------------
function Wordmark({ target }) {
  const reduce = useReducedMotion()
  // 0 when the footer's top enters the viewport, 1 at the page end: the
  // wordmark rises 10vh over the whole approach, not just its own height.
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['10vh', '0vh'])

  return (
    <div className="footer-crop" aria-hidden="true">
      <m.div style={{ y: reduce ? 0 : y }} className="footer-mark">
        Winxon Nguyen
      </m.div>
    </div>
  )
}

export default function Footer() {
  const ref = useRef(null)
  return (
    <footer ref={ref} className="relative mt-[100px]">
      <div className="mx-auto max-w-content px-8">
        <div className="flex flex-col gap-5 border-t border-line pt-8 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted md:flex-row md:items-start md:justify-between">
          <Reveal as="p" className="leading-[1.7] text-bone">
            <span className="hero-pulse mr-2 text-amber" aria-hidden="true">●</span>
            Available Summer 2027 · U.S. citizen
            {/* Two fixed lines read better than a wrap that starts on "·". */}
            <span className="sr-only"> · </span>
            <span className="block pl-[1.35em]">Los Angeles, CA · Open to relocation</span>
          </Reveal>
          <Reveal as="p" delay={0.04} className="flex flex-col gap-2 leading-[1.7] md:items-end md:text-right">
            <Clock />
            <span className="text-muted/80">
              © 2026 Winxon Nguyen<span className="hidden sm:inline"> · </span>
              <span className="block tabular-nums sm:inline">Build <span className="normal-case">{BUILD_HASH}</span> · {BUILD_DATE}</span>
            </span>
          </Reveal>
        </div>
      </div>
      <Wordmark target={ref} />
    </footer>
  )
}
