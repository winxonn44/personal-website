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

        <div className="grid items-center gap-y-10 md:grid-cols-[1.25fr_0.75fr] md:gap-x-12">
          {/* Left: name + tagline (scaled ~15% down from the original) */}
          <div>
            <h1 className="-ml-[0.06em] font-display text-[clamp(3.6rem,12.8vw,12.8rem)] font-[350] leading-[0.82] tracking-[-0.02em]">
              Winxon
              <br />
              <em className="font-[350] italic">Nguyen</em>
            </h1>
            <p className="mt-3 max-w-[16ch] font-display text-[clamp(1.1rem,2.7vw,2.05rem)] font-[350] italic leading-[1.15]">
              A mathematical engineer who has <b className="font-normal not-italic text-amber">taste</b>, and builds.
            </p>
          </div>

          {/* Right: duotone portrait plate */}
          <figure className="relative mx-auto w-full max-w-[300px] md:mx-0 md:ml-auto md:max-w-[340px]">
            <div className="relative overflow-hidden border border-line bg-surface">
              <img
                src={`${import.meta.env.BASE_URL}portrait.jpg`}
                alt="Winxon Nguyen"
                loading="eager"
                className="block aspect-[4/5] w-full object-cover object-top"
              />
              {/* amber corner ticks */}
              <span className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 border-l border-t border-amber" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b border-r border-amber" />
            </div>
            <figcaption className="mt-3 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
              <span><span className="text-amber">PLATE 01</span> · Winxon Nguyen</span>
              <span>UCLA ’26</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <span className="absolute bottom-7 left-8 z-10 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
        Scroll ↓
      </span>
    </section>
  )
}
