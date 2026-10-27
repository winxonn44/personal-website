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

function Flagship({ p }) {
  return (
    <TicketCard
      as="article"
      data-reveal
      className="grid grid-cols-1 items-start gap-x-9 gap-y-6 rounded-sm border border-amber/40 bg-surface px-7 py-8 md:grid-cols-[120px_1fr_auto]"
    >
      <div className="font-mono text-[0.78rem] tracking-[0.1em] text-amber">
        {p.idx}
        <span className="mt-2 block text-muted">{p.years}</span>
        <span className="mt-2 block text-bone">Flagship</span>
      </div>
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
          <img
            src={p.media.src}
            alt={p.media.alt}
            loading="lazy"
            className="block w-full border border-line bg-ink"
          />
          <figcaption className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">
            {p.media.caption}
          </figcaption>
        </figure>
      )}
    </TicketCard>
  )
}

export default function Projects() {
  const [flagship, ...rest] = projects
  return (
    <section id="projects" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§02">Selected work</Eyebrow>
        <div className="flex flex-col gap-6">
          <Flagship p={flagship} />
          {rest.map((p) => (
            <TicketCard
              key={p.idx}
              as="article"
              data-reveal
              className="group grid grid-cols-1 items-start gap-x-9 gap-y-3 rounded-sm border border-line bg-surface px-7 py-8 md:grid-cols-[120px_1fr_auto]"
            >
              <div className="font-mono text-[0.78rem] tracking-[0.1em] text-amber">
                {p.idx}
                <span className="mt-2 block text-muted">{p.years}</span>
              </div>
              <div className="ticket-perf md:pl-9">
                <h3 className="max-w-[24ch] font-display text-[clamp(1.5rem,3vw,2.2rem)] font-[360] leading-[1.05] tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[56ch] text-[1rem] text-muted">{p.method}</p>
                <Links links={p.links} />
              </div>
              <Metric p={p} />
            </TicketCard>
          ))}
        </div>
      </div>
    </section>
  )
}
