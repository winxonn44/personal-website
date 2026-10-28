import Eyebrow from './Eyebrow.jsx'
import HarmonicAnalyzer from './HarmonicAnalyzer.jsx'

// Each hobby takes an optional `photo` ({ src, alt }); without one the card
// shows its figure only. Drop photos in public/hobbies/ and reference them here.
const hobbies = [
  {
    title: 'Music: marching band & jazz',
    years: 'Field band · Jazz band',
    text: 'Years of field and jazz band: SCSBOA field-band medals (gold, silver and bronze), a 4A Division first place, and the Louis Armstrong Jazz Award in 2025. It is also where the math started. My IB research paper used Fourier analysis to compare the harmonic makeup of tones across instrument families.',
    photo: null,
  },
]

export default function Hobbies() {
  return (
    <section id="hobbies" className="py-[120px]">
      <div className="mx-auto max-w-content px-8">
        <Eyebrow num="§04">Off the clock</Eyebrow>
        {hobbies.map((h) => (
          <article key={h.title} data-reveal className="grid items-start gap-[60px] md:grid-cols-[1fr_1.1fr]">
            <div>
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-amber">{h.years}</span>
              <h3 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-[360] leading-[1.05] tracking-[-0.01em]">
                {h.title}
              </h3>
              <p className="mt-4 max-w-[52ch] text-[1rem] leading-[1.55] text-muted">{h.text}</p>
            </div>
            <div className="flex flex-col gap-4">
              {h.photo && (
                <img src={h.photo.src} alt={h.photo.alt} loading="lazy" className="block w-full border border-line object-cover" />
              )}
              <HarmonicAnalyzer />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
