# Prompt — "Instrument" Portfolio

> Build guide for a single-page portfolio website whose centerpiece is a generative visual instrument in **p5.js**. Inspired by Teenage Engineering's design principles: Scandinavian minimalism, color coding, visible modularity, Hick's Law, Fitts's Law, emotional design, and the IKEA effect.

---

## 0. Spirit of the project

Build a personal portfolio that **behaves like an instrument**, not a website. The visitor doesn't navigate — they *play*. The centerpiece is an interactive visual machine in p5.js that holds the spotlight, not as decoration but as the actual content. The portfolio works are "patches" / "presets" of that instrument. Text is secondary to behavior.

The emotional target: someone landing on the site must feel, within 5 seconds, that they can touch something. Curiosity before reading.

---

## 1. Guiding principles (non-negotiable)

1. **Hick's Law** — primary navigation shows at most 4 options at once. Reducing is refining.
2. **Fitts's Law** — clickable targets are large and well-spaced. Every interaction has generous area.
3. **Form = function** — no purely ornamental element. If a shape exists, it visualizes state, responds to input, or organizes information.
4. **Visible modularity** — the layout should feel assembled from blocks, like a hardware panel. Thin lines delimit modules.
5. **Technical labeling** — every section carries a short alphanumeric code (TE-style: `PO-33`, `OP-1`, `EP-133`). Numbers visible in monospaced type.
6. **Color coding** — at most 4 functional colors with consistent meaning. Colors are never decorative.
7. **IKEA effect** — the visitor must be able to *modify* something (turn a knob, switch a mode, edit a seed). Leave having built, not consumed.
8. **No textual onboarding** — the system is self-explanatory. Hover, affordance, immediate feedback. No tutorials.

---

## 2. Visual system

### Palette (pick **one** of the two and commit)

**Light version:**
- Background: `#F2F0EC` (barely-there off-white)
- Primary text: `#0A0A0A`
- Primary accent: `#FF4F00` (TE orange — used on ≤ 5% of the screen)
- Secondary accent: `#9A9A9A` (mid grey for inactive states / metadata)
- Optional data detail: `#0066FF` on meters and specific indicators

**Dark version:**
- Background: `#161616`
- Primary text: `#EFEFEF`
- Primary accent: `#FF4F00`
- Secondary accent: `#5A5A5A`
- Optional data detail: `#00C2FF`

**No dark mode toggle.** Commit to one luminance.

### Typography

- **Sans-serif for headings and UI**: Inter, IBM Plex Sans, or Söhne — weights 500/600/700.
- **Monospaced for metadata, codes, labels, numbers, status**: IBM Plex Mono, JetBrains Mono, or Geist Mono.
- **Hierarchy**: massive headings (`clamp` between 4rem and 9rem in hero), small body text (14–15px), very small dense metadata (10–11px).
- Monospaced labels in UPPERCASE with `letter-spacing: 0.08em`.
- No serifs, no dramatic display fonts.

### Grid and layout

- 12-column grid with generous gutters (24–32px).
- Thin borders (`1px solid currentColor / 12%`) delimiting modules like a panel.
- Very slight `border-radius` (2–4px) — no pills, no sharp corners.
- Shadows almost absent. Depth comes from border + contrast, not blur.
- Left-aligned by default. Never center everything.

---

## 3. The p5.js piece (core)

This is the most important part of the site. Spend the bulk of the effort here.

### General behavior

A generative interactive visual instrument occupying **60%–80% of the viewport** in its initial state. It must:

1. **Respond to mouse, scroll, and keyboard without instructions.** Moving the mouse changes something immediately. Scroll reacts. Keys (digits 1–6, space, arrows) trigger behaviors.
2. **Oscilloscope / sequencer / modular synth aesthetic** — dots, lines, simple geometric forms in controlled motion. Think waves, grids, orbiting particles, Lissajous curves, nodes connected by lines, visual rhythm sequencers.
3. **Monochromatic or bichromatic rendering.** Black/white/TE-orange. No soft color gradients. Hardware aesthetic. Thin, precise lines. Stroke weight between 0.5 and 1.5 for most elements.
4. **High visual density with legibility.** Hundreds of elements on screen are fine as long as a visible logic organizes them (grid, orbit, sequence).
5. **Optional determinism** — an editable `seed` field exposed subtly in a corner. Same seed yields the same pattern.

### Required controls

- **At least 3 virtual "knobs"** (simulated rotary encoders) on a side or bottom strip. Vertical drag over the knob turns the value. Each knob has:
  - Short monospaced uppercase label (`DENS`, `RATE`, `MOD`, `SEED`, `AMT`)
  - Live numeric value next to it (`042`, `0.73`, `–12dB`)
  - Visual position indicator (a radial line inside a circle)
- **4 to 6 "mode / patch" buttons** — selectable, each visually reconfigures the entire piece. Code each one (`M01`, `M02`, `M03`, `M04`). Large, well-spaced buttons (Fitts). Active mode highlighted with the primary accent.
- **Each mode must be visually distinct**, e.g.:
  - `M01` — pulsing mesh reacting to the mouse
  - `M02` — elliptic orbits with phased particles
  - `M03` — rhythmic dot sequencer on a grid
  - `M04` — line flow field
  - `M05` — animated Lissajous curves with knobs controlling X/Y frequency
  - `M06` — node network rearranging on click

### Performance

- 60fps on mid-range laptops.
- Cap active particle count (≤ 500).
- Avoid unnecessary `createGraphics()`.
- `pixelDensity(1)` if retina fps demands it.
- `noLoop()` for static modes with on-demand updates.

---

## 4. Site structure

Single-page with clearly delimited modular sections. Minimal top or side navigation with at most 4 entries. Each section has a visible code.

### Section `01 — INDEX` (hero)
- The p5.js piece takes the stage.
- To the left or above: name in large type, label `PORTFOLIO / 001 / 2026`, and a one-line phrase in mono.
- To the right or below: the knobs and mode buttons.
- No explicit CTA. **The piece IS the CTA.**
- A small `● LIVE` indicator pulsing in mono in a corner.

### Section `02 — WORK`
- Grid of 6 to 9 works.
- Each work is a "patch" / modular card containing:
  - Short code (`W-001`, `W-002`)
  - Name in medium sans-serif
  - One-line description in mono
  - Monochromatic visual thumbnail (could be a reduced p5 sketch looping, or a geometric SVG)
  - Year and type (`2025 / GENERATIVE`)
- Hover reveals more info without dramatic expansion (lift 2–4px, border gains 1px, no long fade).
- Entire card is clickable (Fitts).

### Section `03 — ABOUT`
- Large typography for a short manifesto (3–5 lines).
- Sub-block with designer "specs" styled as a product datasheet:
  ```
  LOCATION   ████████
  TOOLS      ████, ████, ████
  DISCIPLINE ████████
  YEAR OF MFG ████
  ```
- Dry, technical tone with mild irony.

### Section `04 — CONTACT`
- Minimal. Email and 2–3 links.
- One large button with a code (`CT-01 → SEND MESSAGE`).

### Footer
- Horizontal monospaced strip with: version (`v.1.0.0`), credits, year, and a pulsing dot indicating "system active".

---

## 5. Micro-interactions

- **Custom cursor**: a thin crosshair over interactive areas.
- **Optional sound**: subtle click when switching modes. Visible, respected mute button.
- **Hover**: border gains 1px OR background shifts to a neutral accent. 150ms `ease-out` transition.
- **Section changes**: small numbers/labels can briefly increment like a mechanical counter.
- **No scroll-driven fade-in animations.** Everything appears already positioned.
- **Visible focus on every focusable element** (accessibility): 2px outline in the primary accent.

---

## 6. Content

**All textual content must use real information about Clayton Borges.** See `AGENT_BRIEF.md` for the complete content brief — name, projects, skills, contact, tone.

---

## 7. Suggested tech stack

- **Next.js App Router** (already in use — keep it)
- **p5.js** via npm — already installed in the project
- Hand-written CSS / Tailwind utilities only — no prebuilt component kits
- No heavy animation libraries — CSS transitions + p5 are enough
- Responsive: on mobile the p5 piece takes the top, controls stack below

---

## 8. What NOT to do

- No decorative emojis.
- No soft "AI-generated" color gradients.
- No universal centering — use left alignment with clear indentation.
- No stock photos.
- No slow scroll fade-ins.
- No dark mode toggle.
- No popups, modals, decorative cookie banners.
- No long tooltips. Visual affordance is enough.
- No generic Lucide/Feather icons — if icons are needed, draw geometric SVGs.
- No full-bleed animated 3D background competing with the text. The instrument IS the visual.

---

## 9. Success criterion

If a visitor lands on the site and, within 5 seconds:

1. Something moved without them touching anything.
2. They intuitively realized they can interact.
3. They turned a knob or pressed a mode.

— then the site worked.

If they read first, the site failed.
