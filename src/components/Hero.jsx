import { useRef } from 'react'
import VoronoiField from './VoronoiField.jsx'

export default function Hero() {
  const coordRef = useRef(null)
  return (
    <section id="home" className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-20 pt-28">
      <VoronoiField coordRef={coordRef} />

      <div className="relative z-10 mx-auto w-full max-w-content px-8">
        <div className="mb-7 flex items-start justify-between">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
            Applied Math + Statistics — UCLA ’28 · U.S. Citizen
          </span>
          <span ref={coordRef} className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-amber">
            (0.000, 0.000)
          </span>
        </div>

        <div className="grid items-center gap-y-10 md:grid-cols-[1.25fr_0.75fr] md:gap-x-12">
          {/* Left: name, positioning line, primary links */}
          <div>
            <h1 className="-ml-[0.06em] font-display text-[clamp(3.6rem,12.8vw,12.8rem)] font-[350] leading-[0.82] tracking-[-0.02em]">
              Winxon
              <br />
              <em className="font-[350] italic">Nguyen</em>
            </h1>
            <p className="mt-4 max-w-[26ch] font-display text-[clamp(1.1rem,2.4vw,1.8rem)] font-[350] italic leading-[1.2]">
              Autonomy &amp; navigation software, from perception to planning, <b className="font-normal not-italic text-amber">measured</b> end to end.
            </p>
            <p className="mt-7 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[0.74rem] uppercase tracking-[0.12em]">
              <a href="#projects" className="rounded-sm bg-amber px-4 py-2.5 font-bold text-ink transition-[filter] hover:brightness-110">
                See VoroNav ↓
              </a>
              <a href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noreferrer" className="py-2.5 text-bone hover:text-amber">
                Résumé ↗
              </a>
              <a href="https://github.com/winxonn44" target="_blank" rel="noreferrer" className="py-2.5 text-bone hover:text-amber">
                GitHub ↗
              </a>
            </p>
          </div>

          {/* Right: portrait plate */}
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
              <span>UCLA ’28</span>
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
