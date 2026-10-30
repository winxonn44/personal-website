import Reveal from './Reveal.jsx'
import Scramble from './Scramble.jsx'

// Section eyebrow: mono index (decodes on first view, T3) + section heading.
export default function Eyebrow({ num, children }) {
  return (
    <Reveal className="relative mb-10 flex items-center gap-4">
      <Scramble text={num} duration={420} className="font-mono text-[0.8rem] uppercase tracking-[0.12em] text-amber" />
      <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-[350] tracking-[-0.01em]">
        {children}
      </h2>
      <span className="h-px flex-1 bg-line" />
    </Reveal>
  )
}
