import Eyebrow from './Eyebrow.jsx'
import TicketCard from './TicketCard.jsx'

const roles = [
  ['2026', 'Developer — VoroNav (independent project)', 'Offline perception-to-planning stack; from-scratch parallel Voronoi engine and 58K-run planner study.'],
  ['Sep 2025–Present', 'Developer — CruX Neuroscience', 'Real-time 16-channel EEG pipeline and focus-state classifier behind a Python API.'],
  ['Apr 2026–Present', 'Researcher & Lead Developer — UCLA Math + Code + Art', 'SAM-driven Voronoi tessellation app for the Oceanside Museum of Art.'],
  ['2026', 'Founder — UCLA Startup Labs', 'Multimodal CNN + NLP embedding pipeline; backtested on Kalshi event contracts.'],
  ['2023–2025', 'Founder — Twin Digital Media', 'Built and sold a social-media marketing company at 18.'],
]

export default function Resume() {
  return (
    <section id="resume" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§03">Resume</Eyebrow>
        <div className="grid gap-[60px] md:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4">
            {roles.map(([year, role, note]) => (
              <TicketCard
                key={role}
                data-reveal
                className="grid grid-cols-1 gap-1 rounded-sm border border-line bg-surface px-6 py-5 md:grid-cols-[140px_1fr]"
              >
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-amber">{year}</span>
                <div className="ticket-perf md:pl-7">
                  <div className="font-display text-[1.4rem] font-[360] leading-tight">{role}</div>
                  <p className="mt-1 text-[0.95rem] text-muted">{note}</p>
                </div>
              </TicketCard>
            ))}
          </div>
          <div data-reveal className="md:pt-1">
            <a
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-sm bg-amber px-6 py-3.5 font-mono text-[0.74rem] font-bold uppercase tracking-[0.12em] text-ink transition-[filter] hover:brightness-110"
            >
              Download résumé ↓
            </a>
            <p className="mt-3 max-w-[24ch] font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
              PDF · updated Oct 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
