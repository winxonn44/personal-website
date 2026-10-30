import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { m, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { setReadoutTarget } from '../hooks/fieldReadout.js'
import { DUR, EASE_ENTER, EASE_EXIT, STAGGER } from '../motion/tokens.js'
import Preloader from './Preloader.jsx'
import Scramble from './Scramble.jsx'
import BracketButton from './BracketButton.jsx'

const PORTRAIT = `${import.meta.env.BASE_URL}portrait.jpg`
const COORDS = '34.0689° N 118.4452° W'
const TICKER = `${COORDS} · UCLA · APPLIED MATH + STATS ’28`

// Desktop gets the full layer split (H1) and the full parallax table (H5).
const MQ = '(min-width: 768px)'
const subscribeMq = (cb) => {
  const mq = window.matchMedia(MQ)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useDesktop = () => useSyncExternalStore(subscribeMq, () => window.matchMedia(MQ).matches, () => true)

// ---- load reveal (H4, H6) --------------------------------------------------
// Name lines rise out of an overflow mask; everything else fades up after.
// 130% rather than 110%: the mask is padded for descenders, and at
// line-height 0.84 the glyph tops would otherwise peek into that padding.
const line = {
  hidden: { y: '130%' },
  show: (i = 0) => ({ y: '0%', transition: { duration: DUR.page, ease: EASE_EXIT, delay: i * STAGGER.lines } }),
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR.page, ease: EASE_ENTER, delay: 0.36 + i * STAGGER.items },
  }),
}
const plate = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: DUR.page + 0.3, ease: EASE_EXIT, delay: 0.1 } },
}
// The HUD ring around the plate only fades (it is positioned with transforms).
const ringIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.page, ease: EASE_ENTER, delay: 0.3 } },
}
// Reduced motion: opacity only, no masks or clip wipes.
const fadeOnly = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.page, ease: EASE_ENTER } },
}

// ---- scroll parallax (H5) --------------------------------------------------
// translateY at progress 1, in vh. Mobile runs two layers at half distance;
// reduced motion runs none (factor 0).
const TRAVEL = { nameA: -28, nameC: -18, plate: -8, lead: -12, frame: -4 }
const MOBILE = { name: -14, rest: -6 }

// One parallax layer: translateY in vh, live in progress, factor and mode.
function useTravel(p, k, mobile, desk, mob) {
  return useTransform([p, k, mobile], ([v, f, mo]) => `${v * f * (mo ? mob : desk)}vh`)
}

export default function Hero() {
  const reduce = useReducedMotion()
  const desktop = useDesktop()
  const [ready, setReady] = useState(false)
  const onLoaded = useCallback(() => setReady(true), [])

  const heroRef = useRef(null)
  const { scrollY, scrollYProgress: p } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  // Motion values (not closures) carry the mode, so transforms update live.
  const k = useMotionValue(1) // parallax factor: 1 desktop, 0 reduced
  const mobile = useMotionValue(desktop ? 0 : 1)
  useEffect(() => {
    k.set(reduce ? 0 : 1)
    mobile.set(desktop ? 0 : 1)
  }, [reduce, desktop, k, mobile])

  const nameAY = useTravel(p, k, mobile, TRAVEL.nameA, MOBILE.name)
  const nameCY = useTravel(p, k, mobile, TRAVEL.nameC, MOBILE.name)
  const plateY = useTravel(p, k, mobile, TRAVEL.plate, MOBILE.rest)
  const leadY = useTravel(p, k, mobile, TRAVEL.lead, MOBILE.rest)
  const frameY = useTravel(p, k, mobile, TRAVEL.frame, MOBILE.rest)
  const nameAScale = useTransform([p, k, mobile], ([v, f, mo]) => 1 + (mo ? 0 : 0.06 * v * f))
  const leadO = useTransform(p, [0, 0.6], [1, 0])
  const frameO = useTransform(p, [0, 0.4], [1, 0])
  const heroO = useTransform(p, [0, 0.7, 1], [1, 1, 0.15])

  // ---- H1: "Winxon" lives under the field canvas ---------------------------
  // An invisible in-flow copy reserves the layout; the visible copy is
  // portalled into Background's #field-underlay (beneath the canvas) and
  // placed over that copy every frame from scroll position + its own travel.
  const [slot, setSlot] = useState(null)
  useEffect(() => setSlot(document.getElementById('field-underlay')), [])
  const split = desktop && slot
  const anchorRef = useRef(null)
  const baseTop = useMotionValue(0)
  const baseLeft = useMotionValue(0)
  const vh = useMotionValue(typeof window === 'undefined' ? 800 : window.innerHeight)
  useLayoutEffect(() => {
    if (!split) return
    const el = anchorRef.current
    const measure = () => {
      const r = el.getBoundingClientRect()
      baseTop.set(r.top + window.scrollY)
      baseLeft.set(r.left + window.scrollX)
      vh.set(window.innerHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [split, baseTop, baseLeft, vh])
  const underY = useTransform([scrollY, baseTop, p, k, vh], ([s, b, v, f, h]) => b - s + (TRAVEL.nameA / 100) * v * f * h)

  const reveal = reduce ? fadeOnly : line
  const fade = reduce ? fadeOnly : fadeUp
  const wipe = reduce ? fadeOnly : plate
  const anim = ready ? 'show' : 'hidden'

  const winxonMasked = (
    <span className="hero-name block">
      <m.span className="hero-grad block font-normal" variants={reveal} custom={0}>
        Winxon
      </m.span>
    </span>
  )

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col overflow-x-clip pb-7 pt-24 md:pt-28"
    >
      <Preloader portraitSrc={PORTRAIT} onDone={onLoaded} />

      <m.div
        initial="hidden"
        animate={anim}
        style={{ opacity: heroO }}
        className="relative mx-auto flex w-full max-w-content flex-1 flex-col px-4 sm:px-8"
      >
        {/* H3: telemetry ticker */}
        <m.div style={{ y: frameY, opacity: frameO }}>
          <m.div
            variants={fade}
            custom={2}
            className="flex items-start justify-between gap-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted sm:text-[0.72rem]"
          >
            <span>
              <Scramble className="md:hidden" text={COORDS} trigger="mount" duration={400} />
              <Scramble className="hidden md:inline" text={TICKER} trigger="mount" duration={400} />
            </span>
            <span ref={setReadoutTarget} className="hidden shrink-0 tabular-nums text-amber sm:inline" aria-hidden="true">
              (0.000, 0.000)
            </span>
          </m.div>
        </m.div>

        <div className="relative mt-8 grid flex-1 items-center gap-y-8 md:mt-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-8">
          {/* H1: layered name. Screen readers get one plain heading. */}
          <h1 className="relative">
            <span className="sr-only">Winxon Nguyen</span>
            <span aria-hidden="true" className="block">
              {/* layer A: behind the field on desktop */}
              <m.span className="block origin-bottom-left" style={split ? undefined : { y: nameAY }}>
                <span ref={anchorRef} className={split ? 'invisible block' : 'block'}>
                  {winxonMasked}
                </span>
              </m.span>
              {/* layer C: in front of the field */}
              <m.span className="block" style={{ y: nameCY }}>
                <span className="hero-name block ml-[0.5em]">
                  <m.span className="block italic text-bone" variants={reveal} custom={1}>
                    Nguyen
                  </m.span>
                </span>
              </m.span>
            </span>
          </h1>

          {/* H6: portrait plate, farther back, with the HUD range ring */}
          <m.figure
            style={{ y: plateY }}
            className="relative mx-auto w-[min(52vw,220px)] md:mx-0 md:w-[min(24vw,300px)]"
          >
            <RangeRing />
            <m.div variants={wipe} className="relative overflow-hidden border border-line bg-surface">
              <img
                src={PORTRAIT}
                alt="Winxon Nguyen"
                loading="eager"
                fetchpriority="high"
                className="block aspect-[4/5] w-full object-cover object-top"
              />
              <span className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 border-l border-t border-amber" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b border-r border-amber" />
            </m.div>
            <m.figcaption
              variants={fade}
              custom={3}
              className="mt-3 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted"
            >
              <span><span className="text-amber">PLATE 01</span><span className="hidden sm:inline"> · Winxon Nguyen</span></span>
              <span>UCLA ’28</span>
            </m.figcaption>
          </m.figure>
        </div>

        {/* Lead (T2) + CTAs */}
        <m.div style={{ y: leadY, opacity: leadO }} className="relative mt-8">
          <div className="hero-scrim">
            <m.p
              variants={fade}
              custom={0}
              className="max-w-[34ch] font-body text-[clamp(1.12rem,1.9vw,1.5rem)] font-medium leading-[1.35] text-muted"
            >
              <span className="text-bone">Autonomy &amp; navigation software,</span> from perception to planning, measured
              end to end.
            </m.p>
            <m.p variants={fade} custom={1} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3">
              <a
                href="#projects"
                className="rounded-sm bg-amber px-4 py-2.5 font-mono text-[0.74rem] font-bold uppercase tracking-[0.12em] text-ink transition-[filter] hover:brightness-110"
              >
                See VoroNav ↓
              </a>
              <BracketButton href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noreferrer">
                Résumé ↗
              </BracketButton>
              <BracketButton href="https://github.com/winxonn44" target="_blank" rel="noreferrer">
                GitHub ↗
              </BracketButton>
            </m.p>
          </div>
        </m.div>

        {/* Bottom frame: scroll cue + H7 availability */}
        <m.div style={{ y: frameY, opacity: frameO }} className="mt-10">
          <m.div
            variants={fade}
            custom={4}
            className="flex items-end justify-between gap-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted sm:text-[0.72rem]"
          >
            <span className="hidden sm:inline">Scroll ↓</span>
            <span className="text-bone">
              <span className="hero-pulse mr-2 text-amber" aria-hidden="true">●</span>
              Available Summer 2027 · U.S. citizen
            </span>
          </m.div>
        </m.div>
      </m.div>

      {/* Layer A, desktop: portalled beneath the field canvas. Variants still
          flow through the portal (React context), so the reveal stays in sync. */}
      {split &&
        createPortal(
          <m.div
            initial="hidden"
            animate={anim}
            className="absolute left-0 top-0 will-change-transform"
            style={{ x: baseLeft, y: underY, opacity: heroO }}
          >
            <m.div className="origin-bottom-left" style={{ scale: nameAScale }}>
              {winxonMasked}
            </m.div>
          </m.div>,
          slot,
        )}
    </section>
  )
}

// Faint HUD range ring + tick marks centred on the portrait (B4 leftover).
function RangeRing() {
  const ticks = []
  for (let a = 0; a < 360; a += 10) {
    const major = a % 30 === 0
    const r1 = 100
    const r2 = major ? 93 : 96.5
    const t = (a * Math.PI) / 180
    ticks.push(
      <line
        key={a}
        x1={110 + r1 * Math.cos(t)}
        y1={110 + r1 * Math.sin(t)}
        x2={110 + r2 * Math.cos(t)}
        y2={110 + r2 * Math.sin(t)}
        stroke={major ? 'var(--hud-strong)' : 'var(--hud)'}
      />,
    )
  }
  return (
    <m.svg
      variants={ringIn}
      aria-hidden="true"
      viewBox="0 0 220 220"
      fill="none"
      className="pointer-events-none absolute left-1/2 top-[45%] -z-10 w-[150%] -translate-x-1/2 md:w-[165%] -translate-y-1/2"
    >
      <circle cx="110" cy="110" r="100" stroke="var(--hud)" />
      <circle cx="110" cy="110" r="76" stroke="var(--hud)" strokeDasharray="1 5" />
      <path d="M110 2v10M110 208v10M2 110h10M208 110h10" stroke="var(--hud-strong)" />
      {ticks}
    </m.svg>
  )
}
