# LAB — Implementation Progress

**Status:** Phase 1 complete — deployed and build-clean.

---

## What Was Built (Session: 2026-06-03)

### Three-act story structure
The lab is now a book with three acts. All 23 phases (17→26) are connected in a single narrative sequence via `src/lib/data/lab-narrative.ts`.

| Act | Title | Phases | Accent | Theme |
|-----|-------|--------|--------|-------|
| I | FORM | 17, 17b, 18b, 19, 19b, 19c, 20, 20b | `#C84030` (red) | Geometry → mechanism → chemistry → biology |
| II | FORCE | 20c, 21b, 21c, 22b, 22c, 23, 23b, 23c | `#3060D0` (blue) | Criticality → chaos → computation |
| III | MIND | 24, 24b, 24c, 25, 25b, 25c, 26 | `#8040C0` (purple) | Fractals → universality → the question |

---

## Files Created / Modified

### New files
- `src/lib/data/lab-narrative.ts` — story data: 3 parts, flat sequence, `getLabNav(route)` helper
- `src/components/LabChrome.tsx` — fixed chrome overlay for all phase pages:
  - `← LAB` button (top-left, monospace, subtle border)
  - Bottom strip: `● PART I · FORM | 1 / 8 | NEXT →`
  - `NEXT →` turns accent-colored when user is near bottom of scroll
  - Last phase (26) shows `← LAB` instead of `NEXT →`
  - Fades in after 700ms so it doesn't flash on canvas load

### Redesigned
- `src/app/lab/page.tsx` — completely new landing page:
  - Animated particle field background canvas (55 pts, constellation lines)
  - "FIELD GUIDE TO EMERGENCE" eyebrow label
  - "THE LAB" large display title
  - Three PartCard components with timeline dots connected by a gradient line
  - Each card: SVG motif (hypotrochoid/Lorenz wings/Sierpinski), title, tagline, arc text, phase count, `ENTER →` CTA
  - Line drawn animation on mount (1.8s ease-out)
  - Hover states: dot glows, card reveals accent bg, text brightens
  - `BEGIN FROM THE START →` primary CTA at bottom
  - **Note:** This page uses `"use client"` — metadata is not exported here (cosmetic gap only; can be fixed by extracting to `LabLandingClient.tsx`)

### Updated (23 files — identical pattern)
Every phase page at `/lab-phase-{N}/page.tsx` now renders:
```tsx
<>
  <LabChrome route="/lab-phase-{N}" />
  <XxxLab />
</>
```
Phases updated: 17, 17b, 18b, 19, 19b, 19c, 20, 20b, 20c, 21b, 21c, 22b, 22c, 23, 23b, 23c, 24, 24b, 24c, 25, 25b, 25c, 26

---

## What's Left / Next Steps

### High priority
1. **Landing page metadata** — `lab/page.tsx` is a client component so `export const metadata` has no effect. Fix: extract interactive content to `src/components/LabLandingClient.tsx`, make `page.tsx` a server component with metadata.

2. **Part transition reveal cards** — When user reaches the last phase of a part (e.g., Orbit at end of Part I), the "NEXT →" CTA should expand into a full-screen interstitial showing the next part's identity before navigating. Currently it just navigates directly.

3. **Typography adaptation per act** — The request asked for each phase to be "adapted in typography and visuals for coherent storytelling." Currently the chrome adds part context but the lab components themselves still use their original typography. Possible approach:
   - Inject a CSS custom property `--lab-accent` into `document.root` based on the part
   - Each lab component could optionally pick it up for its HUD/text elements
   - Or: add a per-part overlay color tint (very subtle) to shift the visual atmosphere

4. **Landing page scroll-based line animation** — The vertical connecting line between parts is currently opacity-based (fades in). A more precise drawn effect would use SVG `stroke-dashoffset` tied to the actual DOM positions of the three part nodes. This requires refs and `useLayoutEffect` to measure node positions.

5. **Part "intro" cards** — When entering the first phase of a new part (after navigating from the last phase of the previous one), briefly show a full-screen title card: "PART II / FORCE / the cascade from order to complexity". This contextualizes the transition. Duration: 3s, then auto-advance.

### Medium priority
6. **"Jump to part" behavior** — From the landing, clicking `ENTER →` on Part II or III takes the user directly to that part's first phase. This works. But there's no mechanism to return to the landing's roadmap view showing all three parts. Currently `← LAB` always goes back to `/lab`. This is correct behavior — it IS the landing.

7. **Keyboard navigation** — Add `→` (right arrow) to advance to next phase, `←` to go back, `Escape` to return to lab landing. Implement in `LabChrome.tsx` via `useEffect` with `keydown` listener.

8. **Progress persistence** — Use `localStorage` to remember which phases the user has visited. Landing page could show checkmarks or visual progress on each part node.

### Low priority / cosmetic
9. **Lab landing metadata** — Add `export const metadata` by extracting to client component (5-min fix).
10. **Part motif polish** — The SVG motifs (hypotrochoid, Lorenz wings, Sierpinski) are very small. Could animate them subtly on hover.
11. **Dark gradient transition** — When navigating between phases, a brief fade-to-black would smooth the jump. Could use `next/navigation` `useRouter` with a page transition.

---

## Architecture Reference

```
/lab                         ← Landing page (client component, no metadata)
  └─ LAB_PARTS               ← 3 acts from lab-narrative.ts

/lab-phase-17 → /lab-phase-26  ← Phase pages (server components + metadata)
  ├─ LabChrome               ← Fixed chrome overlay (z-index: 200)
  │    ├─ "← LAB" top-left
  │    └─ Bottom strip: accent · part · counter · NEXT
  └─ XxxLab                  ← Existing p5.js component (unmodified)

src/lib/data/lab-narrative.ts
  ├─ LAB_PARTS[]             ← 3 parts with routes, accents, text
  ├─ LAB_SEQUENCE[]          ← Flat ordered array with prev/next/isLast
  └─ getLabNav(route)        ← Lookup by route string

src/components/LabChrome.tsx  ← Client component, reads getLabNav
```

---

## Key Design Decisions

- **No modification to existing Lab components** — All existing `*Lab.tsx` files are untouched. The chrome is a pure additive overlay.
- **Route-based navigation** — Parts are conceptual groups; each phase still lives at its own URL. The story experience comes from the chrome connecting them.
- **Server components with client chrome** — Phase page.tsx files are Server Components (export metadata). LabChrome is a Client Component imported into them — this is valid RSC composition.
- **z-index 200** — Chrome sits above all existing lab content (which uses z-index 1–10 for canvas/text).
- **700ms fade-in** — Prevents the chrome from flashing before the p5 canvas loads.
- **"atBottom" threshold = 12% of page height** — The NEXT → turns accent-colored when the user is within the last 12% of the scroll height, not just at pixel 0. This accounts for the 1200vh lab pages where the "end" experience starts well before the absolute bottom.

---

## To continue in a new session

Read this file and continue from "What's Left" priority list. The codebase is at commit after session 2026-06-03 work. TypeScript clean, build passes, all 23 phases have chrome, landing page is live at `/lab`.

Priority 1: metadata fix for landing page.
Priority 2: part transition interstitial card.
Priority 3: typography/atmosphere adaptation per act.
