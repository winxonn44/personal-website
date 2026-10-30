import Eyebrow from './Eyebrow.jsx'
import Reveal, { RevealItem } from './Reveal.jsx'
import GhostTitle from './GhostTitle.jsx'
import ScrollLitText from './ScrollLitText.jsx'

const facts = [
  ['Degrees', 'BS Applied Math (Computing) + BS Statistics & Data Science'],
  ['School', 'UCLA · Class of 2028'],
  ['Focus', 'Perception · planning · GPU / parallel computing'],
  ['Stack', 'Python · PyTorch · Numba · Metal · NumPy · C++ · SQL'],
  ['Also', 'Founded & sold Twin Digital Media at 18'],
  ['Status', 'U.S. Citizen · seeking Summer 2027 internships'],
  ['Languages', 'English · Vietnamese · Mandarin'],
]

// The one scroll-lit paragraph on the page (S3).
const statement = [
  { text: 'Applied mathematician who ' },
  { text: 'builds the thing', className: 'text-amber' },
  {
    text: ', then measures it: offline navigation, real-time sensor pipelines, and GPU kernels. Every claim ships with a benchmark, including the ones that came out a tie.',
  },
]

export default function About() {
  return (
    <section id="about" className="relative py-[120px]">
      <GhostTitle>About</GhostTitle>
      <div className="relative mx-auto max-w-content px-8">
        <Eyebrow num="§01">About</Eyebrow>
        <div className="scrim flex flex-col gap-[60px]">
          <Reveal>
            <ScrollLitText
              segments={statement}
              className="max-w-[30ch] font-display text-[clamp(1.75rem,4.2vw,3.25rem)] font-[350] leading-[1.18] tracking-[-0.015em]"
            />
          </Reveal>
          <Reveal stagger className="grid gap-x-[60px] md:grid-cols-2">
            {facts.map(([k, v]) => (
              <RevealItem key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-3.5">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">{k}</span>
                <span className="text-right text-[0.95rem]">{v}</span>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
