# Design System — Winxon Nguyen Portfolio

## Product Context
- **What this is:** Personal portfolio, a single scrolling page. The motion *is* the owner's real mathematics rendered live, not decoration.
- **Who it's for:** Data-science / ML internship recruiters (primary), SWE recruiters (secondary), defense-software teams (tertiary).
- **Space/industry:** Engineer/student portfolio. Peers: sawad.framer.website, redoyanulhaque.me, ricardochance.com.
- **Project type:** Editorial single-page portfolio, static, hosted on GitHub Pages.
- **Memorable thing (north star):** "A mathematical engineer who has taste, and builds." Every decision serves this.

## Aesthetic Direction
- **Direction:** Editorial / Magazine, dark.
- **Decoration level:** intentional — live math motion carries the expression; everything else stays quiet.
- **Mood:** Serious, authored, alive. A near-black broadsheet where geometry moves as you scroll. Restraint everywhere except the mathematics.
- **Reference sites:** sawad.framer.website (loved), redoyanulhaque.me (loved concept, ~15% too much), ricardochance.com (serif+dark editorial), tomorina0.github.io, pszostak.pl (too segmented — avoid).

## Typography
- **Display/Hero:** **Fraunces** (variable, `opsz` up to 144, weight ~320-360) — high-fashion serif set 10-16vw that breaks the left margin. Italic for loaded words (surname, "taste"). This is the "taste" signal.
- **Body:** **Satoshi** (400/500/700) — clean modern grotesque, quiet and confident.
- **UI/Labels:** JetBrains Mono (same as data).
- **Data/Tables:** **JetBrains Mono** (400/500/700, tabular-nums) — section indices (`§01 / VORONOI`), metrics, live coordinate readouts. The "engineer" signal. Display never shares a weight with mono.
- **Code:** JetBrains Mono.
- **Loading:** Google Fonts for Fraunces + JetBrains Mono; Fontshare CDN for Satoshi. Preconnect + `display=swap`. Consider self-hosting via fontsource before launch for offline reliability on GitHub Pages.
- **Scale (fluid):** hero `clamp(4.2rem,15vw,15rem)` / section-head `clamp(1.8rem,4vw,3rem)` / figure-title `clamp(1.6rem,3.4vw,2.6rem)` / body `1.06rem` / mono-label `0.72rem` uppercase, letter-spacing `.12em`. Line-height: display `.82`, body `1.5`.

## Color
- **Approach:** restrained — 1 accent + neutrals; color is rare and meaningful (accent ≈ 5% of pixels).
- **Primary (accent):** `#F0A227` amber/gold — value, taste, "gold leaf"; deliberately escapes the sea-of-blue every DS/ML portfolio uses. Used for active states, key metrics, near-field math links, single CTA.
- **Neutrals:** `--bg #0A0A0B` (near-black, faint graphite), `--surface #141417`, `--line #26262b`, `--text #EDEAE3` (warm bone-white, never pure #FFF), `--muted #6E6E77`.
- **Semantic:** success `#4E9A6B`, warning `#F0A227` (reuse accent), error `#C4553B`, info `#5A86C6`. Used sparingly (form/contact states only).
- **Light mode ("bone paper"):** `--bg #EDEAE3`, `--surface #E3DFD4`, `--text #141417`, `--muted #7c766a`; accent unchanged. Dark is primary; light is a supported alternate.

## Spacing
- **Base unit:** 8px.
- **Density:** spacious — generous vertical rhythm between sections (`120px` desktop section padding), tight only inside data/mono blocks.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64) 4xl(120).

## Layout
- **Approach:** creative-editorial — strict underlying grid that display type and math deliberately escape (text is never trapped in cards).
- **Structure:** single page. Sticky top nav, anchor-scroll (smooth), order **Home → About → Projects → Resume → Contact**. Every link scrolls in-page; no route changes.
- **Grid:** 12-col desktop / 6-col tablet / 4-col mobile; hero and figures break it intentionally.
- **Max content width:** 1180px, 32px gutters.
- **Border radius:** mostly sharp. Scale sm:2px, md:4px, pill:999px (tags only). No uniform bubble-radius.
- **Projects:** rendered as research figures (`FIG.0N`, title, one method line, one proof-metric). No skills grid, no tech-logo wall.

## Motion
- **Approach:** expressive but disciplined. One continuous Three.js scene driven by GSAP ScrollTrigger — changed by scroll position, not replaced per section. One primary transformation per section, then stillness.
- **Signature:** the motion is the owner's real mathematics — Home: higher-dimensional Voronoi tessellation field; About: Fourier wave building from harmonics; Projects: geometry recedes so reading wins; Resume: dimensional reduction onto a number line; Contact: field converges to a single point and stills.
- **Feel:** momentum scroll, parallax, and "breaking the fourth wall" depth — closer elements react more to cursor and scroll; camera scrubs *through* the field. Hero intensity: **Bold**, dialed back ~15% from the preview's Bold.
- **NO custom cursor effects** — default cursor always.
- **Easing:** enter `ease-out`, exit `ease-in`, move `ease-in-out`. **Duration:** micro 50-100ms, short 150-250ms, medium 250-400ms, long 400-700ms.
- **Accessibility:** `prefers-reduced-motion` swaps the live scene for a single static render + opacity transitions; mobile uses a lighter/static field.

## Tech (intended build)
- Static site on **GitHub Pages**. Vanilla or a light framework acceptable; Three.js + GSAP for the hero/scroll scene.
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
| 2026-08-15 | Added Home-hero portrait as a framed plate + "Education & Achievements" section (§04, two-column: narrative + compact vertical timeline) after Resume; nav name gets per-letter lift + amber underline sweep | User request. Portrait framed with amber corner ticks + PLATE caption. Section order now Home→About→Projects→Resume→Education→Contact. |
| 2026-08-15 | Reverted hero portrait from ink→amber duotone to natural color | User feedback: the amber tint was too heavy. Kept the thin frame + corner ticks + PLATE caption so it still reads editorially against the dark canvas. |
