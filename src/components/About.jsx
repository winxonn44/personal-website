import Eyebrow from './Eyebrow.jsx'

const facts = [
  ['Degrees', 'BS Applied Math (Computing) + BS Statistics & Data Science'],
  ['School', 'UCLA · Class of 2028'],
  ['Focus', 'Perception · planning · GPU / parallel computing'],
  ['Stack', 'Python · PyTorch · Numba · Metal · NumPy · C++ · SQL'],
  ['Also', 'Founded & sold Twin Digital Media at 18'],
  ['Status', 'U.S. Citizen · seeking Summer 2027 internships'],
  ['Languages', 'English · Vietnamese · Mandarin'],
]

export default function About() {
  return (
    <section id="about" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§01">About</Eyebrow>
        <div className="grid gap-[60px] md:grid-cols-[1.4fr_1fr]">
          <p data-reveal className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-[350] leading-[1.25] tracking-[-0.01em]">
            Applied mathematician who <b className="font-normal text-amber">builds the thing</b>, then measures it:
            offline navigation, real-time sensor pipelines, and GPU kernels. Every claim ships with a benchmark,
            including the ones that came out a tie.
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
