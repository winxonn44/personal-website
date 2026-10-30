# Design System — Winxon Nguyen Portfolio

> **v2 (Oct 29, 2026):** the motion & style revamp is built. Feature-level specs (H, B, N, C, S, T, F IDs) live in [`DESIGN-v2.md`](DESIGN-v2.md); this file holds the system and the decision log.

## Product Context
- **What this is:** Personal portfolio, a single scrolling page. The motion *is* the owner's real mathematics rendered live, not decoration.
- **Who it's for:** Autonomy / navigation / defense-software and AV recruiters (primary), SWE and ML recruiters (secondary), quant (tertiary).
- **Space/industry:** Engineer/student portfolio. Peers: sawad.framer.website, redoyanulhaque.me, ricardochance.com.
- **Project type:** Editorial single-page portfolio, static, hosted on GitHub Pages.
- **Memorable thing (north star):** "Autonomy software from the math up, measured end to end." Every decision serves this; the design shows the taste instead of claiming it.

## Aesthetic Direction
- **Direction:** Editorial / Magazine, dark.
- **Decoration level:** intentional — live math motion carries the expression; everything else stays quiet.
- **Mood:** Serious, authored, alive. A near-black broadsheet where geometry moves as you scroll. Restraint everywhere except the mathematics.
- **Reference sites:** sawad.framer.website (loved), redoyanulhaque.me (loved concept, ~15% too much), ricardochance.com (serif+dark editorial), tomorina0.github.io, pszostak.pl (too segmented — avoid).

## Typography
- **Hero / monument:** **Instrument Serif** (400 roman + italic, Tailwind `font-hero`) — hero name ("Winxon" roman with the display gradient, "Nguyen" italic in bone), ghosted section titles and the footer wordmark. ~17vw, `line-height: 0.84`, `letter-spacing: -0.025em`, never uppercase. Display gradient `#EDEAE3 → #B9B5AC → #6E6E77 → #2A2A30` top to bottom (inverted, light at the bottom, on the footer wordmark).
- **Display (section heads):** **Fraunces** (variable, weight ~350, `font-display`) — section headings and the Contact line; italic for a loaded word. Retired from the hero.
- **Body:** **Satoshi** (400/500/700) — clean modern grotesque, quiet and confident.
- **UI/Labels:** JetBrains Mono (same as data).
- **Data/Tables:** **JetBrains Mono** (400/500/700, tabular-nums) — section indices (`§01 / VORONOI`), metrics, live coordinate readouts. The "engineer" signal. Display never shares a weight with mono.
- **Code:** JetBrains Mono.
- **Loading:** Google Fonts for Instrument Serif + Fraunces + JetBrains Mono; Fontshare CDN for Satoshi. Preconnect + `display=swap`. Consider self-hosting via fontsource before launch for offline reliability on GitHub Pages.
- **Scale (fluid):** hero `clamp(4.6rem,17vw,15rem)` / ghost titles 22vw / footer wordmark 19.2vw / section-head `clamp(1.8rem,4vw,3rem)` / figure-title `clamp(1.6rem,3.4vw,2.6rem)` / body `1.06rem` / mono-label `0.72rem` uppercase, letter-spacing `.12em`. Line-height: display `.82`, body `1.5`.

## Color
- **Approach:** restrained — 1 accent + neutrals; color is rare and meaningful (accent ≈ 5% of pixels).
- **Primary (accent):** `#F0A227` amber/gold — value, taste, "gold leaf"; deliberately escapes the sea-of-blue every DS/ML portfolio uses. Used for active states, key metrics, near-field math links, single CTA.
- **Neutrals:** `--bg #0A0A0B` (near-black, faint graphite), `--surface #141417`, `--line #26262b`, `--text #EDEAE3` (warm bone-white, never pure #FFF), `--muted #8A8A93` (5.8:1 on ink; was #6E6E77).
- **v2 overlay tokens:** `--scrim rgba(10,10,11,.72)` behind text blocks, `--hud rgba(237,234,227,.07)` / `--hud-strong .16` for grid and reticles, `--ghost rgba(237,234,227,.035)` for ghost titles, `--amber-soft rgba(240,162,39,.14)` for spotlight fills.
- **Section tones (B8):** alternating `#0A0A0B` / `#0F0F12` ambient washes plus a faint amber wash behind Projects, cross-faded over ~20vh.
- **Selection & focus:** amber `::selection` and one amber 2px `:focus-visible` ring (3px offset) site-wide.
- **Semantic:** success `#4E9A6B`, warning `#F0A227` (reuse accent), error `#C4553B`, info `#5A86C6`. Used sparingly (form/contact states only).
- **Light mode ("bone paper"):** `--bg #EDEAE3`, `--surface #E3DFD4`, `--text #141417`, `--muted #7c766a`; accent unchanged. Dark is primary; light is a supported alternate.

## Spacing
- **Base unit:** 8px.
- **Density:** spacious — generous vertical rhythm between sections (`120px` desktop section padding), tight only inside data/mono blocks.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64) 4xl(120).

## Layout
- **Approach:** creative-editorial — strict underlying grid that display type and math deliberately escape (text is never trapped in cards).
- **Structure:** single page. Floating pill nav, anchor-scroll (smooth), order **Home → About → Projects → Resume → Off the clock → Contact** (footer inside Contact). Every link scrolls in-page; no route changes.
- **Grid:** 12-col desktop / 6-col tablet / 4-col mobile; hero and figures break it intentionally.
- **Max content width:** 1180px, 32px gutters.
- **Border radius:** mostly sharp. Scale sm:2px, md:4px, pill:999px (tags only). No uniform bubble-radius.
- **Projects:** rendered as research figures (`FIG.0N`, title, one method line, one proof-metric). No skills grid, no tech-logo wall.

## Motion
- **Approach:** expressive but disciplined. One continuous Three.js Voronoi field, fixed behind the whole page, changed by scroll position (per-section states, beacon nodes, section tones), never replaced per section. All other motion is **Motion** (`motion/react`, `LazyMotion` + `m` components, `MotionConfig reducedMotion="user"`); GSAP is gone. One primary transformation per section, then stillness.
- **Signature:** the motion is the owner's real mathematics — Home: higher-dimensional Voronoi tessellation field; About: Fourier wave building from harmonics; Projects: geometry recedes so reading wins; Resume: dimensional reduction onto a number line; Contact: field converges to a single point and stills.
- **Feel:** momentum scroll, parallax, and "breaking the fourth wall" depth — closer elements react more to cursor and scroll; camera scrubs *through* the field. Hero intensity: **Bold**, dialed back ~15% from the preview's Bold.
- **NO custom cursor effects** — default cursor always.
- **Easing (from `src/motion/tokens.js`):** `EASE_ENTER cubic-bezier(0.32, 0.72, 0, 1)` for entrances and hover-in; `EASE_EXIT cubic-bezier(0.19, 1, 0.22, 1)` for hover-out, exits and line reveals. No springs with overshoot, no velocity skew; `useSpring` only to smooth scroll-linked values (damping 40, stiffness 200).
- **Duration:** micro 0.25 s (hover, focus, nav dot), component 0.5 s (card detail, menu), page 0.8 s (hero and section reveals). Stagger 0.06 s lines / 0.04 s items. Hover-out runs slower than hover-in (0.5 s vs 0.3 s) so it settles rather than snaps.
- **Reveals:** every section's content rises 24px and fades in once, at 15% into view (`Reveal.jsx`); reduced motion fades opacity only.
- **Accessibility:** `prefers-reduced-motion` swaps the live scene for a single static render + opacity transitions, and drops parallax, scramble, count-up and the footer wordmark rise; mobile uses a lighter field.

## Tech (intended build)
- Static site on **GitHub Pages**. Vite + React + Tailwind; Three.js for the field; Motion (`motion/react`) for scroll-linked and gesture motion. The footer build stamp (git short hash + date) is injected by `vite.config.js` `define`.
- Component sources available via MCP: **Magic UI** and **React Bits** (use for polished text/reveal effects; keep within this system).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-20 | Initial design system created | /design-consultation; two AI voices + reference research |
| 2026-07-20 | Accent = amber #F0A227 (over blue #5A86C6) | Differentiates from sea-of-blue DS portfolios; reads taste/value |
| 2026-07-20 | Type = Fraunces + Satoshi + JetBrains Mono | Editorial "taste" display vs. engineer mono; neither is a default/overused face |
| 2026-07-20 | Hero motion = Bold (dialed back ~15%) | User wants "fourth wall" depth + parallax without the "too much" failure mode |
| 2026-08-15 | Voronoi field intensified ~30% over baseline (denser points, deeper cursor/scroll parallax, new cursor "gravity well" that pulls points + grows amber edges to the pointer) — supersedes the "Bold −15%" ceiling for the hero | User explicit approval; wants a stronger fourth-wall pull inspired by boyuanli.vercel.app. Mobile stays lighter (fewer points). |
| 2026-08-15 | Resume + Selected Work rendered as notched "ticket" cards with cursor-driven 3D tilt — overrides the "text is never trapped in cards" rule for these two sections | User explicit approval; wants the ticket/hover-move treatment from a reference site. Reduced-motion disables tilt/glint; editorial rows elsewhere unchanged. |
| 2026-08-15 | Added Home-hero portrait as a framed plate + "Education & Achievements" section (§04, two-column: narrative + compact vertical timeline) after Resume; nav name gets per-letter lift + amber underline sweep | User request. Portrait framed with amber corner ticks + PLATE caption. Section order now Home→About→Projects→Resume→Education→Contact (Education later removed, see 2026-10-19). |
| 2026-08-15 | Reverted hero portrait from ink→amber duotone to natural color | User feedback: the amber tint was too heavy. Kept the thin frame + corner ticks + PLATE caption so it still reads editorially against the dark canvas. |
| 2026-10-19 | Repositioned for autonomy/navigation roles: VoroNav is FIG.01 flagship (demo GIF, result bullets, code links); hero tagline replaced with positioning line + CTAs; Education timeline removed (high-school items cut, education moved into About facts); Contact is now §04 | Recruiter review: best project was missing, every project linked nowhere, and the site contradicted the resume (grad year, double major, age at sale). |
| 2026-10-29 | Motion v2 approved and built (see `DESIGN-v2.md`, decisions in §12.1) | Add depth and response without becoming an agency reel: one primary motion per section, then stillness |
| 2026-10-29 | **Motion (`motion/react`) replaces GSAP**; easings and durations centralised in `src/motion/tokens.js` (enter `0.32,0.72,0,1`, exit `0.19,1,0.22,1`) | One library for scroll-linked values, in-view reveals, layout and presence; weighted easing, no bounce |
| 2026-10-29 | Voronoi field moved to a **fixed full-page layer** with per-section states, 8–12 breathing beacon nodes, ambient section tones (B8), HUD grid/reticles and 3% grain; scrims behind text | Field continuity across the page; peripheral sense of section boundaries without a light band (D4) |
| 2026-10-29 | Hero face = **Instrument Serif** (over a condensed monument face); "Winxon" sits under the field canvas, "Nguyen" in front, layered scroll parallax; preload hairline, telemetry ticker | Owner chose a big but non-condensed serif (D1); the layer split is the "fourth wall" effect via z-index, not WebGL |
| 2026-10-29 | Nav = floating **pill with a sliding amber dot**, hides on scroll down; section tick rail on the right (≥1280px); full-screen mobile sheet | Faster orientation; the rail doubles as scroll progress |
| 2026-10-29 | Cards: **3D tilt removed**; replaced by a cursor spotlight border, detail reveal, media zoom and sibling dim, with keyboard parity | Tilt read as a toy; the new hover in/out is calmer and richer (D3) |
| 2026-10-29 | Ghosted drifting section titles, two-tone leads, mono label scramble, metric count-ups, bento row for FIG.03–05 | Section identity and recruiter-scannable metrics at no reading cost |
| 2026-10-29 | Muted text raised to **#8A8A93** | 5.8:1 on ink (old #6E6E77 was 3.9:1) |
| 2026-10-29 | Footer: cropped **Instrument Serif wordmark** rising 10vh into place, availability status (incl. open to relocation), copy-email with `Copied ✓` swap, live LA clock + coordinates, build stamp; Contact secondary links are corner-bracket buttons | Bookends the hero; the most recruiter-useful facts and one-click contact at the end of the page (D7) |
