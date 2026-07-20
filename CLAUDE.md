# Winxon Nguyen — Personal Portfolio

Single-page personal portfolio for Winxon Nguyen (UCLA Applied Math, Computing; minor Stats & Data Science). Static site, hosted on **GitHub Pages**. Target audience: data-science/ML internship recruiters (primary), SWE (secondary), defense-software (tertiary).

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, layout, and motion are defined there. Do not deviate without explicit user approval. In QA mode, flag any code that doesn't match `DESIGN.md`.

Summary: editorial/magazine, dark near-black canvas, amber `#F0A227` accent, Fraunces (display) + Satoshi (body) + JetBrains Mono (data). Single page, sticky anchor nav Home→About→Projects→Resume→Contact. Signature motion = the owner's real mathematics (Voronoi/Fourier/higher-dim geometry) in Three.js + GSAP, scroll-driven, "fourth-wall" parallax, momentum scroll, NO custom cursor.

## Build intent
- Three.js + GSAP (ScrollTrigger) for the hero/scroll scene.
- Component sources via MCP: Magic UI and React Bits.
- `prefers-reduced-motion` fallback required; mobile uses a lighter/static field.

## Notes
- Career/resume working docs live in `.context/career/` (gitignored, not part of the site).
- Design taste preview: `/tmp/winxon-design-preview-*.html`.
