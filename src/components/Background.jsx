import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import VoronoiField from './VoronoiField.jsx'
import { sectionIndex, useSectionTracking } from '../hooks/useActiveSection.js'

// Per-section ambient tone (B8), in SECTION_IDS order: `lift` raises the
// near-black to #0F0F12 behind alternate sections, `amber` is the faint warm
// wash behind Projects. Blended by the continuous section index, so each
// boundary cross-fades over ~20vh.
const LIFT = [0, 1, 0, 1, 0, 1]
const WARM = [0, 0, 1, 0, 0, 0]
const weight = (table) => (s) => {
  const c = Math.min(table.length - 1, Math.max(0, s))
  const i = Math.floor(c)
  const j = Math.min(i + 1, table.length - 1)
  return table[i] + (table[j] - table[i]) * (c - i)
}
const liftAt = weight(LIFT)
const warmAt = weight(WARM)

const GRID = 64 // px, HUD grid pitch

// A small corner reticle: an L-bracket with a crosshair tick.
function Reticle({ className, flip = '' }) {
  return (
    <svg className={`absolute h-6 w-6 ${className}`} style={{ transform: flip }} viewBox="0 0 24 24" fill="none">
      <path d="M0.5 10V0.5H10" stroke="currentColor" />
      <path d="M14 6v4M12 8h4" stroke="currentColor" />
    </svg>
  )
}

// The fixed layer behind the whole page (DESIGN-v2 B1, B4, B5, B8): ambient
// tones, the live Voronoi field, a faint HUD grid with corner reticles, and
// static grain. Nothing here takes pointer events; content sits above it.
export default function Background() {
  useSectionTracking()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  // HUD grid scrolls at 0.9x for a hint of depth (1x under reduced motion).
  const gridY = useTransform(scrollY, (v) => -((v * (reduce ? 1 : 0.9)) % GRID))
  const lift = useTransform(sectionIndex, liftAt)
  const warm = useTransform(sectionIndex, warmAt)

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <m.div className="tone-lift absolute inset-0" style={{ opacity: lift }} />
      <m.div className="tone-warm absolute inset-0" style={{ opacity: warm }} />
      {/* Under-field slot (H1): the hero portals "Winxon" in here so field
          points pass in front of it while "Nguyen" (in <main>) sits above. */}
      <div id="field-underlay" className="absolute inset-0" />
      <VoronoiField />
      <div className="hud-mask absolute inset-0">
        <m.div className="hud-grid absolute inset-x-0 -bottom-16 -top-16" style={{ y: gridY }} />
      </div>
      <div className="text-[var(--hud-strong)]">
        <Reticle className="left-5 top-[84px]" />
        <Reticle className="right-5 top-[84px]" flip="scaleX(-1)" />
        <Reticle className="bottom-5 left-5" flip="scaleY(-1)" />
        <Reticle className="bottom-5 right-5" flip="scale(-1,-1)" />
      </div>
      <div className="grain absolute inset-0" />
    </div>
  )
}
