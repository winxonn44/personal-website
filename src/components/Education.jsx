import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Eyebrow from './Eyebrow.jsx'

// Placeholder entries — swap copy/dates for the real education + achievements.
const timeline = [
  ['2027', 'Exhibition App for Oceanside Museum of Art', 'Showcasing interactive app for museum visitors, exploring field of art developed with machine learning and algorithms.'],  
  ['2026-Present', 'Reseacher and Lead Developer @ Math + Code + Art', 'Wrote publication on 2 dimensional Voronoi Diagram implementation in to art. Implemented vision Deep Learning model to segment generalized objects based on user focus..'],
  ['2026', 'UCLA Startup Labs', 'Built a scraping and embedding pipeline combining a custom CNN (image) and an adapted NLP model (text) to mapmulti-modal social signals into a 4-dimensional semantic feature space. Backtested a downstream trading strategy on ~50 event-contract markets on Kalshi over a 4-month window, achievinga Sharpe ratio of 1.38.'],
  ['2025–Present', 'B.S. Applied Mathematics Specialization in Computing — UCLA', 'Double Major in Statistics & Data Science.'],
  ['2023-2025', 'Sold Twin Digital Media', 'Built and sold a social media marketing company — six figures, at 18.'],
  ['2024-2025', 'AI Task Force (C-VUSD)', 'Designed district-wide AI adoption framework for scalable use in education through policy and teaching psychology. Trained specialized RNN agents for personalized teaching and administered use. Distributed to 20,000+ users.'],
  ['2024-2025', 'Research Team Lead (International Bacc.', 'Wrote a 30+ page paper on Fourier Analysis & Wave Dynamic applications in order to improve musical harmonics. Conducted empirical study of the harmonic composition of an optimal music tone across different classifications of instruments.'],
  ['2022-2024', 'Southern California Band Gold, Bronze, Silver Medalist', 'SCSBOA 4A Division 1st Place.'],
  ['2017', 'C-VUSD Youth Robotics Award', 'Medaled at regional youth robotics competition.'],

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
              A small timeline of my life, some trials, achievements, and roles that have helped to define a part of me.
            </p>
            <p className="mt-5 max-w-[46ch] text-[1rem] leading-[1.55] text-muted">
              As both a student, engineer, and entrepreneur, my roles have reflected the challenges I have tackled and further insight to what I hope to accomplish in the future.
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
