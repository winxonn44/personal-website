import Eyebrow from './Eyebrow.jsx'

const facts = [
  ['Program', 'BS Applied Math (Computing), UCLA'],
  ['Minor', 'Statistics & Data Science'],
  ['Standing', '2nd year · near-senior credits'],
  ['Also', 'Founded & sold a company — six figures, at 19'],
  ['Languages', 'English · Vietnamese · Mandarin'],
  ['Stack', 'Python · C++ · PyTorch · SQL · R'],
]

export default function About() {
  return (
    <section id="about" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§01">About</Eyebrow>
        <div className="grid gap-[60px] md:grid-cols-[1.4fr_1fr]">
          <p data-reveal className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-[350] leading-[1.25] tracking-[-0.01em]">
            Applied mathematician who <b className="font-normal text-amber">builds the thing</b> — from EEG
            pipelines to trading-signal ML to tessellation art. Rigor first, then ship.
          </p>
          <div data-reveal>
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-3.5">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-muted">{k}</span>
                <span className="text-right text-[0.95rem]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
