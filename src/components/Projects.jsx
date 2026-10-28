import { lazy, Suspense, useState } from 'react'
import Eyebrow from './Eyebrow.jsx'
import TicketCard from './TicketCard.jsx'
import { projects } from '../data/projects.js'

function Links({ links }) {
  if (!links?.length) return null
  return (
    <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.74rem] uppercase tracking-[0.12em]">
      {links.map(([label, href]) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="border-b border-amber/40 text-amber transition-colors hover:border-amber"
        >
          {label} ↗
        </a>
      ))}
    </p>
  )
}

function Metric({ p }) {
  return (
    <div className="whitespace-nowrap text-left font-mono md:text-right">
      <span className="block text-[2.1rem] tracking-[-0.02em]">{p.metric}</span>
      <span className="mt-1.5 block text-[0.68rem] uppercase tracking-[0.12em] text-muted">{p.metricSub}</span>
    </div>
  )
}

function Label({ p }) {
  return (
    <div className="font-mono text-[0.78rem] tracking-[0.1em] text-amber">
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

function Feature({ p }) {
  const [live, setLive] = useState(false)
  return (
    <TicketCard
      as="article"
      data-reveal
      tilt={!live}
      className="grid grid-cols-1 items-start gap-x-9 gap-y-6 rounded-sm border border-amber/40 bg-surface px-7 py-8 md:grid-cols-[120px_1fr_auto]"
    >
      <Label p={p} />
      <div className="ticket-perf md:pl-9">
        <h3 className="max-w-[24ch] font-display text-[clamp(1.8rem,3.8vw,2.9rem)] font-[360] leading-[1.02] tracking-[-0.01em]">
          {p.title}
        </h3>
        <p className="mt-3 max-w-[60ch] text-[1rem] text-muted">{p.method}</p>
        <ul className="mt-5 flex max-w-[64ch] flex-col gap-2.5">
          {p.points.map((pt) => (
            <li key={pt} className="relative pl-5 text-[0.96rem] leading-[1.5]">
              <span className="absolute left-0 top-[0.62em] h-1.5 w-1.5 bg-amber" aria-hidden="true" />
              {pt}
            </li>
          ))}
        </ul>
        <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
          {p.stack.join(' · ')}
        </p>
        <Links links={p.links} />
      </div>
      <Metric p={p} />
      {p.media && (
        <figure className="md:col-span-3">
          <div className={`grid gap-3 ${p.media.length > 1 ? 'md:grid-cols-[1fr_1.6fr]' : ''}`}>
            {p.media.map((m) => (
              <img
                key={m.src}
                src={m.src}
                alt={m.alt}
                loading="lazy"
                className="block h-full w-full border border-line bg-ink object-contain"
              />
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
  )
}

function Row({ p }) {
  return (
    <TicketCard
      as="article"
      data-reveal
      className="grid grid-cols-1 items-start gap-x-9 gap-y-3 rounded-sm border border-line bg-surface px-7 py-8 md:grid-cols-[120px_1fr_auto]"
    >
      <Label p={p} />
      <div className="ticket-perf md:pl-9">
        <h3 className="max-w-[26ch] font-display text-[clamp(1.5rem,3vw,2.2rem)] font-[360] leading-[1.05] tracking-[-0.01em]">
          {p.title}
        </h3>
        <p className="mt-3 max-w-[58ch] text-[1rem] text-muted">{p.method}</p>
        <Links links={p.links} />
      </div>
      <Metric p={p} />
      {p.figure && (
        <figure className="mt-3 md:col-span-3">
          <img
            src={p.figure.src}
            alt={p.figure.alt}
            loading="lazy"
            className="block w-full border border-line"
          />
          <figcaption className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">
            {p.figure.caption}
          </figcaption>
        </figure>
      )}
    </TicketCard>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§02">Selected work</Eyebrow>
        <div className="flex flex-col gap-6">
          {projects.map((p) => (p.feature ? <Feature key={p.idx} p={p} /> : <Row key={p.idx} p={p} />))}
        </div>
      </div>
    </section>
  )
}
