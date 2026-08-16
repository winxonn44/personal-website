import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Eyebrow from './Eyebrow.jsx'

// Placeholder entries — swap copy/dates for the real education + achievements.
const timeline = [
  ['2024–Present', 'B.S. Applied Mathematics (Computing) — UCLA', 'Minor in Statistics & Data Science.'],
  ['2026', 'Placeholder Achievement', 'Award / competition / publication.'],
  ['2025', 'Placeholder Achievement', 'Award / competition / publication.'],
  ['2023', 'Sold Twin Digital Media', 'Built and sold a data-driven marketing company — six figures, at 19.'],
  ['2022', 'Placeholder Milestone', 'Earlier honor or recognition.'],
]

export default function Education() {
  const root = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = root.current?.querySelectorAll('.tl-node') ?? []
    if (reduce) {
      nodes.forEach((n) => n.classList.add('lit'))
      return
    }
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      nodes.forEach((n) => {
        ScrollTrigger.create({
          trigger: n,
          start: 'top 82%',
          onEnter: () => n.classList.add('lit'),
          onLeaveBack: () => n.classList.remove('lit'),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="education" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§04">Education &amp; Achievements</Eyebrow>
        <div className="grid items-start gap-[60px] md:grid-cols-[1fr_1fr]" ref={root}>
          {/* Left: narrative — placeholder for school experience, clubs, etc. */}
          <div data-reveal>
            <p className="font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-[350] leading-[1.3] tracking-[-0.01em]">
              Placeholder paragraph — a few sentences on the school experience:
              coursework you loved, <b className="font-normal text-amber">clubs and orgs</b>,
              teams, and the moments that shaped how you think and build.
            </p>
            <p className="mt-5 max-w-[46ch] text-[1rem] leading-[1.55] text-muted">
              Second placeholder paragraph — room for anything the timeline
              doesn’t capture: leadership, community, or the through-line of the work.
              Swap this copy anytime.
            </p>
          </div>

          {/* Right: compact vertical timeline */}
          <ol className="relative ml-2 border-l border-line pl-9">
            {timeline.map(([year, title, note]) => (
              <li key={`${year}-${title}`} data-reveal className="relative pb-8 last:pb-0">
                <span
                  className="tl-node absolute -left-[calc(2.25rem+7px)] top-1.5 h-3.5 w-3.5 rounded-full border"
                  aria-hidden="true"
                />
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-amber">{year}</span>
                <div className="mt-1 font-display text-[1.2rem] font-[360] leading-tight">{title}</div>
                <p className="mt-1.5 max-w-[40ch] text-[0.92rem] text-muted">{note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
