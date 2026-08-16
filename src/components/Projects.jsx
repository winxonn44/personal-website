import Eyebrow from './Eyebrow.jsx'
import TicketCard from './TicketCard.jsx'
import { projects } from '../data/projects.js'

export default function Projects() {
  return (
    <section id="projects" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§02">Selected work</Eyebrow>
        <div className="flex flex-col gap-6">
          {projects.map((p) => {
            const hasLink = p.href && p.href !== '#'

            return (
              <TicketCard
                key={p.idx}
                as={hasLink ? 'a' : 'article'}
                {...(hasLink ? { href: p.href } : {})}
                data-reveal
                className="group grid grid-cols-1 items-start gap-x-9 gap-y-3 rounded-sm border border-line bg-surface px-7 py-8 md:grid-cols-[120px_1fr_auto]"
              >
                <div className="font-mono text-[0.78rem] tracking-[0.1em] text-amber">
                  {p.idx}
                  <span className="mt-2 block text-muted">{p.years}</span>
                </div>
                <div className="ticket-perf md:pl-9">
                  <div className="max-w-[20ch] font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-[360] leading-[1.02] tracking-[-0.01em] transition-colors group-hover:text-amber">
                    {p.title}
                  </div>
                  <p className="mt-3 max-w-[52ch] text-[1rem] text-muted">{p.method}</p>
                </div>
                <div className="whitespace-nowrap text-left font-mono md:text-right">
                  <span className="block text-[2.1rem] tracking-[-0.02em]">{p.metric}</span>
                  <span className="mt-1.5 block text-[0.68rem] uppercase tracking-[0.12em] text-muted">{p.metricSub}</span>
                </div>
              </TicketCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
