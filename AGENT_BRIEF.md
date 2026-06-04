# Agent Brief — Clayton Borges Portfolio Completion

> **Entry point for the executing agent.**
> Read this file and `DESIGN_GUIDE.md` in full before writing a single line of code.
> Then orchestrate sub-agents and execute.

---

## Your mandate

Fully complete this portfolio in one session. You have full design authority within the constraints of `DESIGN_GUIDE.md`. You are expected to orchestrate parallel sub-agents wherever independent work can be done simultaneously. Do not ask for direction on design decisions — make them, justify them briefly in comments or commit messages, and move on.

---

## Start here: orientation

```
Project root: /Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-03-2026
Branch: v2-organic-circuit
Dev server: NODE_OPTIONS=--max-old-space-size=6144 npx next dev   (port 3001)
Stack: Next.js App Router · TypeScript · Tailwind v4 · p5.js · GSAP
Deployed: claytonborges-portfolio.vercel.app
```

Read these files before touching any code:
1. `DESIGN_GUIDE.md` — the visual and interaction philosophy. Non-negotiable.
2. `LAB.md` — the complete record of 42 generative lab phases. You will choose from these.
3. `src/app/[locale]/page.tsx` — the current homepage entry point.
4. `src/components/sections/home/` — all current homepage section components.
5. `src/lib/i18n/en.json` and `pt.json` — i18n keys structure.

---

## Homepage: start from scratch

**Delete or gut the existing homepage sections.** The current hero, about preview, and skills section are not working. Keep the file structure and routing — only rebuild the component content and layout.

The existing `MorphicWorld` Three.js background is being retired from the homepage. It was a full-bleed animated 3D scene that competed with the text and made nothing readable. Do not port it forward. The new centerpiece is the p5.js instrument described in `DESIGN_GUIDE.md`.

**What to preserve from the existing codebase:**
- The Next.js routing, layout, and locale system — do not break i18n
- The lab phase routes (`/lab-phase-*`) — do not touch any lab files
- The `src/lib/data/projects.ts` data structure — extend it, don't rewrite it
- The `src/lib/i18n/` system — add keys, mirror in both `en.json` and `pt.json`
- `npx tsc --noEmit` must pass at zero errors throughout

---

## The lab phases — your creative resource

There are 42 standalone generative art pieces at `/lab-phase-2` through `/lab-phase-25c`. Each is a full-page canvas artwork. You have complete freedom to:

- Choose how many to feature on the homepage (minimum 4, no maximum)
- Choose which ones based on visual quality, thematic fit with the instrument concept, or variety across technique types
- Use their visual output as thumbnails, previews, or "patches" in the instrument UI
- Present them in any structure that serves the design

The full list is in `LAB.md`. The ones historically noted as strong: phases 5, 6, 8, 10, 11, 12, 13, 14, 19, 21b, 24, 25. But the choice is yours — read the descriptions and decide.

---

## Orchestration strategy

Break the work into parallel tracks and spawn sub-agents for each. Suggested split:

**Track A — p5.js instrument (core, longest task)**
Build the interactive visual instrument from scratch. This is the homepage centerpiece. Modes, knobs, keyboard/mouse response. Refer to `DESIGN_GUIDE.md` section 3 in detail. This should be a dedicated sub-agent working only on this.

**Track B — Homepage layout and sections**
Build the full page structure: instrument zone, work/projects section, about section, contact section. Wire up real content. Can start in parallel with Track A using a placeholder for the instrument.

**Track C — Content and i18n**
Populate all section content (projects, about, contact, skills) with real data from the brief below. Write all i18n keys in English first, then mirror to Portuguese. Can run fully in parallel.

**Track D — Lab integration**
Choose which lab phases to feature, build the cards/thumbnails for them, wire up the links. Fully independent.

Merge tracks only when dependencies are clear. The main agent coordinates, verifies TypeScript cleanliness at each merge, and does final integration.

---

## Content — everything the agent needs

### Identity

- **Name:** Clayton Borges
- **Title:** Creative / Full-Stack Developer
- **Location:** Brasília, Brazil — open to relocation and remote work worldwide
- **Experience:** 3 years
- **Studio:** DISCLAYMER — co-run with Raphael Palmer
- **Tone:** Direct, minimal, no platitudes. Nothing like "I care about craft" or "building the future."
- **Do not mention:** Psychology background (UniCEUB 2019–2025 — explicitly removed).

### Contact

- **Email:** claytonborgesdev@gmail.com
- **GitHub:** github.com/claytonbrgsdev
- **LinkedIn:** linkedin.com/in/clayton-borges-web-dev
- **Instagram:** @azulbic_

### Tech stack by category

| Category | Technologies |
|----------|-------------|
| Frontend | React 19, Next.js 16, TypeScript, Tailwind CSS, GSAP, Lenis |
| 3D / Creative | Three.js, React Three Fiber, WebGL, GLSL shaders, Canvas 2D, p5.js, Web Audio API |
| Backend | Node.js, FastAPI, Python, Ruby, REST, GraphQL, WebSocket |
| Data | PostgreSQL, Prisma, Supabase, Redis, MongoDB, AWS S3 |
| Hardware | ESP32, embedded audio synthesis, circuit design, microcontrollers |

### Featured projects

**Moveo Filmes** — Full-Stack CMS Platform
Bilingual web platform for an independent film production company in Brasília. The client manages their full film catalog — adding films, organizing by production stage, generating individual pages — through an admin dashboard without touching code.
- Stack: Next.js 16, React 19, Supabase RLS, TipTap, dnd-kit, GSAP, Lenis
- Role: Full-stack solo contract
- Type: Full-Stack / CMS — 2024

**MzPrime** — 3D Car Cover Showroom
Real-time 3D product configurator for a luxury vehicle cover brand. Users change cover color, stitching color, upload PNG logos and see them applied to predefined spots on a 3D model — instantly, no reloads. Multiple vehicle categories.
- Stack: Three.js, React Three Fiber, MeshStandardMaterial, CanvasTexture, GLB models
- Role: Frontend / 3D developer at Evolut Digital
- Type: 3D / Interactive — 2024

**Metanova Labs** — Bittensor Dashboard
Dashboard for Bittensor subnet 68, an on-chain AI drug-discovery network. Tracks molecular competitions and miner leaderboards per epoch.
- Stack: Next.js 15, TypeScript, Radix UI, SWR epoch-keyed caching
- Role: Frontend + API integration
- Type: Dashboard / Web3 — 2024

**DSRPTV Records** — Music E-Commerce Platform
Music e-commerce and streaming platform for an independent Brazilian label. Dual-payment (Stripe international + Mercado Pago Brazil), Spotify streaming, AWS S3 audio assets.
- Stack: Stripe, Mercado Pago, Spotify API, AWS S3, Three.js
- Role: Co-developer with Raphael Palmer (DISCLAYMER)
- Type: E-Commerce / Music — 2023

### About copy (to be adapted, not used verbatim)

Clayton works at the intersection of creative engineering and product development. He builds things most developers wouldn't attempt — real-time 3D configurators, computational art systems, full production CMS platforms — and ships them. The 42 generative lab phases on this site are side projects, built for their own sake. The client work is production-grade.

Available for: freelance projects, full-time positions, remote and relocation.

---

## Hard constraints

1. **Never take screenshots or open browsers autonomously.** The machine has 16GB RAM and browser automation causes OOM. If visual verification is needed, ask the user to open the browser and share a screenshot manually.
2. **Do not touch any lab phase files** (`/lab-phase-*` routes and their components). They are complete.
3. **i18n required.** Every text string visible on the page must have a key in both `en.json` and `pt.json`. No hardcoded English strings in components.
4. **TypeScript zero errors.** `npx tsc --noEmit` must pass before reporting work as done.
5. **p5.js is already in the project** — check `package.json` before installing. Import via `import p5 from "p5"` with instance mode to avoid SSR issues.
6. **No dark mode toggle.** Commit to one luminance as instructed in `DESIGN_GUIDE.md`.
7. **The lab routes must still work** after the homepage rebuild. The routing and layout changes must not break `/lab-phase-*` routes.

---

## Definition of done

- [ ] Homepage loads with the p5.js instrument immediately visible and interactive
- [ ] Instrument has at least 4 modes and 3 knobs, all functional
- [ ] All 4 featured projects are presented with enough content to understand what was built
- [ ] About section communicates who Clayton is without platitudes
- [ ] Lab phases are featured with links to their actual routes
- [ ] Contact section is complete with real information
- [ ] Both English and Portuguese i18n keys are present and correct
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] All existing `/lab-phase-*` routes still work
- [ ] The design follows `DESIGN_GUIDE.md` — instrument-first, readable, left-aligned, no competing backgrounds
