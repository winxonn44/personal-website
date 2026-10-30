import { m } from 'motion/react'
import useActiveSection, { SECTION_IDS } from '../hooks/useActiveSection.js'

// N3: section tick rail. Fixed to the right edge, one mono tick per section.
// The active tick's line grows 8 → 32px and turns amber; a hairline behind
// the ticks fills with page progress. Shown only at ≥1280px: below that the
// side gutter ((viewport − 1180) / 2 + 32px) is too narrow and the rail would
// sit on the hero plate and the project cards.

const NAMES = {
  home: 'Home',
  about: 'About',
  projects: 'Work',
  resume: 'Résumé',
  hobbies: 'Off the clock',
  contact: 'Contact',
}

export default function SectionRail() {
  const { active, pageProgress } = useActiveSection()

  return (
    <nav
      aria-label="Sections"
      className="section-rail fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      {/* progress hairline (doubles as the scroll indicator) */}
      <span aria-hidden="true" className="absolute bottom-2 right-0 top-2 w-px bg-line">
        <m.span
          className="absolute inset-0 origin-top bg-muted/60"
          style={{ scaleY: pageProgress }}
        />
      </span>
      <ol className="flex flex-col gap-1">
        {SECTION_IDS.map((id, i) => {
          const on = active === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={on ? 'location' : undefined}
                className={`rail-tick group relative flex items-center justify-end gap-2 py-1.5 ${on ? 'is-active' : ''}`}
              >
                <span className="rail-name pointer-events-none absolute right-full mr-1 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.12em] text-bone">
                  {NAMES[id]}
                </span>
                <span
                  className={`font-mono text-[0.62rem] tabular-nums tracking-[0.08em] transition-colors duration-300 ${
                    on ? 'text-amber' : 'text-muted group-hover:text-bone'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="rail-line h-px w-8 bg-current" />
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
