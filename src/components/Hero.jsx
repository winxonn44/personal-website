import { useRef } from 'react'
import VoronoiField from './VoronoiField.jsx'

export default function Hero() {
  const coordRef = useRef(null)
  return (
    <section id="home" className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      <VoronoiField coordRef={coordRef} />
      <div className="relative z-10 mx-auto w-full max-w-content px-8">
        <div className="mb-7 flex items-start justify-between">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
            Applied Mathematics — Computing / UCLA
          </span>
          <span ref={coordRef} className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-amber">
            (0.000, 0.000)
          </span>
        </div>
        <h1 className="-ml-[0.06em] font-display text-[clamp(4.2rem,15vw,15rem)] font-[350] leading-[0.82] tracking-[-0.02em]">
          Winxon
          <br />
          <em className="font-[350] italic">Nguyen</em>
        </h1>
        <p className="mt-3 max-w-[16ch] font-display text-[clamp(1.3rem,3.2vw,2.4rem)] font-[350] italic leading-[1.15]">
          A mathematical engineer who has <b className="font-normal not-italic text-amber">taste</b>, and builds.
        </p>
      </div>
      <span className="absolute bottom-7 left-8 z-10 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
        Scroll ↓
      </span>
    </section>
  )
}
