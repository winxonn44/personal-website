import { lazy, Suspense, useState } from 'react'
import Eyebrow from './Eyebrow.jsx'
import TicketCard from './TicketCard.jsx'
import Reveal, { RevealItem } from './Reveal.jsx'
import BracketButton from './BracketButton.jsx'
import CountUp from './CountUp.jsx'
import GhostTitle from './GhostTitle.jsx'
import { projects } from '../data/projects.js'

// Two-tone lead (T2): the first clause in bone, the rest muted.
function TwoTone({ text }) {
  const match = /^(.+?[.:])(\s[\s\S]*)$/.exec(text)
  if (!match) return text
  return (
    <>
      <span className="text-bone">{match[1]}</span>
      {match[2]}
    </>
  )
}

// Secondary card links as corner-bracket buttons (C5). The ↗ nudges up-right
// on card hover/focus (C2).
function Links({ links }) {
  if (!links?.length) return null
  return (
    <p className="mt-5 flex flex-wrap gap-3">
      {links.map(([label, href]) => (
        <BracketButton key={href} href={href} target="_blank" rel="noreferrer">
          {label} <span className="ticket-arrow" aria-hidden="true">↗</span>
        </BracketButton>
      ))}
    </p>
  )
}

function Metric({ p, align = 'text-left md:text-right' }) {
  return (
    <div className={`whitespace-nowrap font-mono ${align}`}>
      <CountUp value={p.metric} className="ticket-metric text-[2.1rem] tracking-[-0.02em]" />
      <span className="mt-1.5 block text-[0.68rem] uppercase tracking-[0.12em] text-muted">{p.metricSub}</span>
    </div>
  )
}

function Label({ p }) {
  return (
    <div className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-amber">
      {p.idx}
      <span className="mt-2 block text-muted">{p.years}</span>
      {p.tag && <span className="mt-2 block text-bone">{p.tag}</span>}
    </div>
  )
}

// Live apps are code-split: nothing (not the app, not its segmentation model) is
// downloaded until a visitor presses Launch.
const APPS = {
  vorolens: lazy(() => import('./vorolens/VoroLensApp.jsx')),
}

function LiveApp({ app, open, setOpen }) {
  if (!open) {
    return (
      <div className="relative overflow-hidden rounded-sm border border-amber/50 bg-[radial-gradient(120%_140%_at_100%_50%,rgba(240,162,39,0.14),transparent_60%)] px-5 py-6 md:px-8 md:py-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-amber">
              <span className="launch-dot h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
              Interactive · in your browser
            </p>
            <p className="mt-2.5 max-w-[54ch] text-[0.95rem] text-muted">{app.note}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="launch-cta group flex w-full shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-sm bg-amber px-6 py-5 font-mono text-[0.8rem] md:px-9 md:text-[0.86rem] font-bold uppercase tracking-[0.14em] text-ink transition-[filter] hover:brightness-110 md:w-auto"
          >
            Launch live demo
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true">
              ▸
            </span>
          </button>
        </div>
      </div>
    )
  }
  const App = APPS[app.id]
  return (
    <Suspense
      fallback={
        <p className="border border-line bg-ink px-4 py-16 text-center font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
          Loading VoroLens…
        </p>
      }
    >
      <App onClose={() => setOpen(false)} />
    </Suspense>
  )
}

// FIG.01 / FIG.02: large feature cards (the live VoroLens app needs the width).
function Feature({ p }) {
  const [live, setLive] = useState(false)
  return (
    <Reveal>
      <TicketCard
        as="article"
        className="grid grid-cols-1 items-start gap-x-9 gap-y-6 rounded-sm border border-amber/40 bg-surface px-7 py-8 md:grid-cols-[120px_1fr_auto]"
      >
        <Label p={p} />
        <div className="ticket-perf md:pl-9">
          <h3 className="max-w-[24ch] font-display text-[clamp(1.8rem,3.8vw,2.9rem)] font-[360] leading-[1.02] tracking-[-0.01em]">
            {p.title}
          </h3>
          <p className="mt-3 max-w-[60ch] text-[1rem] text-muted">
            <TwoTone text={p.method} />
          </p>
          <ul className="mt-5 flex max-w-[64ch] flex-col gap-2.5">
            {p.points.map((pt) => (
              <li key={pt} className="relative pl-5 text-[0.96rem] leading-[1.5]">
                <span className="absolute left-0 top-[0.62em] h-1.5 w-1.5 bg-amber" aria-hidden="true" />
                {pt}
              </li>
            ))}
          </ul>
          <div className="ticket-detail">
            <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
              {p.stack.join(' · ')}
            </p>
            <Links links={p.links} />
          </div>
        </div>
        <Metric p={p} />
        {p.media && (
          <figure className="md:col-span-3">
            <div className={`grid gap-3 ${p.media.length > 1 ? 'md:grid-cols-[1fr_1.6fr]' : ''}`}>
              {p.media.map((m) => (
                <div key={m.src} className="overflow-hidden border border-line bg-ink">
                  <img
                    src={m.src}
                    alt={m.alt}
                    loading="lazy"
                    className="ticket-media block h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
            <figcaption className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">
              {p.caption}
            </figcaption>
          </figure>
        )}
        {p.app && (
          <div className="md:col-span-3">
            <LiveApp app={p.app} open={live} setOpen={setLive} />
          </div>
        )}
      </TicketCard>
    </Reveal>
  )
}

// FIG.03–05: a bento row of equal tiles (S5). Metric top-right, label
// bottom-left, figure if the project has one. Stacks below lg.
function Tile({ p }) {
  return (
    <RevealItem className="flex">
      <TicketCard
        as="article"
        className="flex w-full flex-col rounded-sm border border-line bg-surface px-6 py-6"
      >
        <div className="flex justify-end">
          <Metric p={p} align="text-right" />
        </div>
        <h3 className="mt-5 font-display text-[clamp(1.35rem,2.2vw,1.65rem)] font-[360] leading-[1.08] tracking-[-0.01em]">
          {p.title}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-[1.5] text-muted">
          <TwoTone text={p.method} />
        </p>
        {p.figure && (
          <figure className="mt-5">
            <div className="overflow-hidden border border-line">
              <img src={p.figure.src} alt={p.figure.alt} loading="lazy" className="ticket-media block w-full" />
            </div>
            <figcaption className="mt-3 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-muted">
              {p.figure.caption}
            </figcaption>
          </figure>
        )}
        <Links links={p.links} />
        <div className="ticket-detail mt-auto pt-6">
          <p className="flex flex-wrap gap-x-3 gap-y-1 border-t border-dashed border-line pt-4 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
            <span className="text-amber">{p.idx}</span>
            <span>{p.years}</span>
            {p.tag && <span className="text-bone">{p.tag}</span>}
          </p>
        </div>
      </TicketCard>
    </RevealItem>
  )
}

export default function Projects() {
  const features = projects.filter((p) => p.feature)
  const tiles = projects.filter((p) => !p.feature)
  return (
    <section id="projects" className="relative py-[120px]">
      <GhostTitle>Work</GhostTitle>
      <div className="relative mx-auto max-w-content px-8">
        <Eyebrow num="§02">Selected work</Eyebrow>
        <div className="ticket-list flex flex-col gap-6">
          {features.map((p) => (
            <Feature key={p.idx} p={p} />
          ))}
          {tiles.length > 0 && (
            <Reveal stagger className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {tiles.map((p) => (
                <Tile key={p.idx} p={p} />
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
