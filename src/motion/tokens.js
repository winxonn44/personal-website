// Motion tokens (DESIGN-v2 §3.3). One source of truth for every Motion
// animation on the site: weighted easings, no springs with overshoot.

// Fast start, gentle settle: entrances and hover-in.
export const EASE_ENTER = [0.32, 0.72, 0, 1]
// Smooth and decisive: hover-out, exits, line reveals.
export const EASE_EXIT = [0.19, 1, 0.22, 1]

// Seconds.
export const DUR = {
  micro: 0.25, // hover, focus, the nav dot
  component: 0.5, // card detail reveal, menu
  page: 0.8, // hero reveal, section reveals
}

export const STAGGER = {
  lines: 0.06,
  items: 0.04,
}

// Scroll-linked smoothing only (critically damped, reads as weight).
export const SCROLL_SPRING = { damping: 40, stiffness: 200 }

// In-view reveal (S2): rise 24px and fade in. Under reduced motion the
// transform is dropped and only the opacity fades.
export const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.page, ease: EASE_ENTER } },
}
export const revealReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.page, ease: EASE_ENTER } },
}

// Parent that staggers its RevealItem children.
export const stagger = (gap = STAGGER.items, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

// Shared viewport options: trigger once, when the element is 15% inside.
export const VIEWPORT = { once: true, margin: '-15%' }
