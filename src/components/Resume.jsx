import Eyebrow from './Eyebrow.jsx'

const roles = [
  ['2025–Present', 'Developer — CruX Neuroscience', 'Real-time EEG ETL + deep model for focus-state detection.'],
  ['2026–Present', 'Founder — UCLA Startup Labs (Data Infra for ML)', 'Semantic pipelines feeding trading & game-theory models.'],
  ['2026–Present', 'Researcher — UCLA Math + Code + Art', 'Higher-dimensional Voronoi tessellation art + style transfer.'],
  ['2023–2025', 'Research Lead — Fourier & Wave Dynamics (IB)', '30+ page paper; live FFT signal-processing companion app.'],
  ['2023–2025', 'Founder — Twin Digital Media', 'Built and sold a data-driven marketing company for six figures.'],
  ['2024–2025', 'Team Lead — C-VUSD AI Task Force', 'District-wide AI-adoption framework; trained teaching agents.'],
]

export default function Resume() {
  return (
    <section id="resume" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§03">Resume</Eyebrow>
        <div className="grid gap-[60px] md:grid-cols-[1fr_auto]">
          <div>
            {roles.map(([year, role, note]) => (
              <div key={role} data-reveal className="grid grid-cols-1 gap-1 border-t border-line py-5 md:grid-cols-[130px_1fr]">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-amber">{year}</span>
                <div>
                  <div className="font-display text-[1.4rem] font-[360] leading-tight">{role}</div>
                  <p className="mt-1 text-[0.95rem] text-muted">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <div data-reveal className="md:pt-5">
            <a
              href="/resume.pdf"
              className="inline-block rounded-sm bg-amber px-6 py-3.5 font-mono text-[0.74rem] font-bold uppercase tracking-[0.12em] text-ink transition-[filter] hover:brightness-110"
            >
              Download résumé ↓
            </a>
            <p className="mt-3 max-w-[24ch] font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
              PDF · updated 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
