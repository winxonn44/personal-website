export default function Eyebrow({ num, children }) {
  return (
    <div data-reveal className="mb-10 flex items-center gap-4">
      <span className="font-mono text-[0.8rem] text-amber">{num}</span>
      <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-[350] tracking-[-0.01em]">
        {children}
      </h2>
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
