# Lab — Context & Design Record

This document tracks the purpose, principles, and technical decisions behind the `/lab-phase-*` routes. It exists so that future sessions can pick up without re-deriving context.

---

## What the Lab is

A series of standalone, full-page canvas artworks living at `/lab-phase-2` through `/lab-phase-13`. Each is a scroll-driven generative piece — no libraries, pure Canvas 2D API — built as visual experiments for Clayton's portfolio. They are not portfolio sections; they are art pieces that demonstrate what the portfolio can feel like.

The lab routes sit outside the locale tree (no site navbar, no i18n wrapper). They are raw.

---

## Guiding principles

- **Scroll = time.** `sp = scrollY / (scrollHeight - innerHeight)` is the master clock. All visual transitions are functions of `sp`. No click, no timer interruption.
- **No React state in the animation path.** All animation state lives in `useRef` or closure variables. `useState` would cause re-renders and stutter.
- **`applyOverlay` pattern for text.** Never `display:none`. Always: `el.style.opacity = alpha.toFixed(3); el.style.pointerEvents = alpha > 0.05 ? "auto" : "none"`.
- **`secAlpha(sp, i0, i1, o0, o1)`** — smoothstep-product fade window. Text fades in over `[i0,i1]` and out over `[o0,o1]`.
- **DPR handling.** High-res form canvases: `ctx.setTransform(DPR,0,0,DPR,0,0)`. Pixel/particle canvases: `DPR=0.5` + `imageRendering:pixelated` for the aesthetic and performance.
- **`ss(a, b, t)`** is smoothstep everywhere. `lerp(a, b, t)` for straight interpolation.
- **Themes guide form, not content.** A theme like "THE UNDERGROUND" or "plus ça change" is a metaphorical constraint on visual behaviour — never literal illustration.

---

## Phase index

| Phase | Route | Component | Theme / technique | Status |
|-------|-------|-----------|-------------------|--------|
| 2 | `/lab-phase-2` | `ConvergenceLab` | Camera waypoints, Three.js world | active |
| 3 | `/lab-phase-3` | `WaveLab` | Wave simulation | active |
| 4 | `/lab-phase-4` | `GlowLab` | Glow / bloom | active |
| 5 | `/lab-phase-5` | `BecomingLab` | Peter de Jong attractor, pixel buffer | **liked** |
| 6 | `/lab-phase-6` | `FieldLab` | Compound-sine flow field, particle pixel buffer | **liked** |
| 7 | `/lab-phase-7` | `LiquidLab` | Liquid simulation | active |
| 8 | `/lab-phase-8` | `ChromaLab` | Chroma / color grading | **liked** |
| 9 | `/lab-phase-9` | `ChromaLab` (alias) | — | active |
| 10 | `/lab-phase-10` | `MorphLab` | Chrome polar form morphing | **liked** |
| 11 | `/lab-phase-11` | `DepthLab` | "THE UNDERGROUND" — vein network, fracture | **liked** |
| 12 | `/lab-phase-12` | `RecurLab` | "plus ça change" — Fourier harmonic circle | **liked** |
| 13 | `/lab-phase-13` | `OdysseyLab` | **THE UNIFIED PIECE** — all liked phases merged | **current work** |
| 14 | `/lab-phase-14` | `CircuitLab` | PRINTED CIRCUIT BOARD — literal PCB substrate | active |
| 15 | `/lab-phase-15` | `OscilloLab` | PHOSPHOR — Lissajous figures on CRT oscilloscope | active |
| 16 | `/lab-phase-16` | `NexusLab` | BAUHAUS MACHINERY — radial engine, Bauhaus primaries, kinematic traces | active |
| 17  | `/lab-phase-17`   | `KikaiLab` | 機械 KIKAI — hypotrochoid spirograph machine, Japanese-Bauhaus drawing automaton | active |
| 17b | `/lab-phase-17-b` | `HamonLab`  | 波紋 HAMON — Gray-Scott reaction-diffusion, crystallisation machine, earth-tone palettes | active |
| 17c | `/lab-phase-17-c` | `FrostLab`  | DLA crystal growth — 5 competing aggregates, tip-glow, grain boundaries, mineral palette | active |
| 18  | `/lab-phase-18`   | `ChladniLab` | Chladni resonant plate — Bessel function nodal patterns, 3 superposed oscillating modes | active |
| 18b | `/lab-phase-18-b` | `CausticLab` | Water caustics — 2D wave PDE rendered only as floor refraction light; hidden machine principle | active |
| 19  | `/lab-phase-19`   | `SlimeLab`   | Physarum polycephalum — 4000 agents, Jeff Jones trail-reinforcement model, biological network formation | active |
| 19b | `/lab-phase-19-b` | `FluxLab`    | 2D magnetic field lines — Euler-integrated dipole topology morphing through 4 configurations | active |
| 19c | `/lab-phase-19-c` | `PrismaLab`  | Inverse-square potential field — 6 sources on golden-ratio orbits, topographic contour banding | active |
| 20  | `/lab-phase-20`   | `SpiralLab`  | Barkley excitable medium — spiral wave pairs, refractory state rendering, phase portrait HUD | active |
| 20b | `/lab-phase-20-b` | `OrbitLab`   | N-body gravity — 6-body leapfrog integration, density trail accumulation, G ramping to chaos | active |
| 20c | `/lab-phase-20-c` | `SandLab`    | Abelian sandpile (BTW) — BFS toppling queue, per-height color map, flash decay, chapter drain + shockwave rings | active |
| 21  | `/lab-phase-21`   | `VortexLab`  | 2D point vortex dynamics — Biot-Savart velocity field, tracer density accumulation, streamline overlay, 2→8 vortex chapters | active |
| 21b | `/lab-phase-21-b` | `LorenzLab`  | Lorenz chaotic attractor — 620-particle RK4 swarm, dual warm/cool wing density buffers, ρ=14→60 scroll-driven chaos onset | active |
| 21c | `/lab-phase-21-c` | `NewtonLab`  | Newton fractal — complex polynomial root-finding, n=3→6 chapters, HSV basin coloring, rotating viewport zoom, boundary glow | active |
| 22  | `/lab-phase-22`   | `KuromatoLab` | Kuramoto synchronization — 1650-oscillator mean-field model, K=0.15→6.5 scroll-driven phase-locking, order-parameter r bar | active |
| 22b | `/lab-phase-22-b` | `CellularAutomatonLab` | 1D elementary CA space-time — Rule 30/90/110/184, ring-buffer kymograph, scroll-accelerated evolution | active |
| 22c | `/lab-phase-22-c` | `LangtonLab` | Langton's ant — pre-warmed per chapter to formation/chaos/highway/infinite, deterministic emergence at 55k steps | active |
| 23  | `/lab-phase-23`   | `IsingLab`   | 2D Ising model — Metropolis-Hastings, T=4.8→0.65 scroll-driven phase transition, critical fluctuations at T_c=2.269 | active |
| 23b | `/lab-phase-23-b` | `WaveOpticsLab` | Wave interference — analytic Huygens field, 2→8 source chapters, frame-driven propagation, constructive/destructive color map | active |
| 23c | `/lab-phase-23-c` | `IFSLab`     | IFS chaos game — Barnsley fern/Sierpinski/Lévy C/Heighway dragon, log-density render, 7k iterations/frame | active |
| 24  | `/lab-phase-24`   | `MandelbrotLab` | Mandelbrot zoom journey — 5-keyframe log-extent scroll zoom, smooth coloring, Julia companion PiP, 4 Seahorse→embedded chapters | active |
| 24b | `/lab-phase-24-b` | `PercolationLab` | Site percolation — BFS cluster coloring, monotonic randThresh activation, gradient spanning cluster (cyan→gold), cluster-size log histogram | active |
| 24c | `/lab-phase-24-c` | `LSystemLab`    | L-system grammar — Koch/Dragon/Hilbert/Plant, progressive reveal with pulsing tip cursor, canvas gradient coloring, vignette | active |
| 24d | `/lab-phase-24-d` | `ChuaLab`       | Chua's circuit double-scroll — α-driven period-doubling cascade (period-1→2→4→chaos), dual warm/cool density wings, tracer trail, bifurcation ticks | active |
| 25  | `/lab-phase-25`   | `GasLab`        | 2D molecular gas dynamics — 250-particle hard-sphere MD, periodic boundary, elastic collisions, velocity-rescaling thermostat, bond network at low T | active |
| 25b | `/lab-phase-25-b` | `WireWorldLab`  | WireWorld cellular automaton — 4-state 8-connected CA, electron-head/tail signals, 4 circuit topologies (ring/Lissajous/rose/hypocycloid), additive glow | active |
| 25c | `/lab-phase-25-c` | `SpiroLab`      | Parametric curve families — rose r=cos(kθ), Lissajous x=sin(at+δ), hypotrochoid, Gielis superformula; incremental trail accumulation, guide grid, vignette | active |

---

## OdysseyLab — the big piece

`src/components/OdysseyLab.tsx` / `/lab-phase-13`

This is where everything converges. It merges the liked phases (5, 6, 10, 11, 12) into one long continuous scroll journey with color-graded transitions. Text content is Lorem Ipsum — form is being locked before content is added.

### Architecture

Two stacked canvases:

```
pixelCanvasRef  z-index:1  DPR=0.5  imageRendering:pixelated  alpha:false
formCanvasRef   z-index:2  DPR=2    standard path rendering    alpha:true
```

- **Pixel canvas** (`pctx`): runs the attractor and flow field via a shared `Uint8ClampedArray` buffer + LUT decay. `putImageData` each frame. Post-putImageData pctx path draws (nebula glow, rings, cursor indicators) happen on top.
- **Form canvas** (`ctx`): renders the morphing polar form using `Path2D` clipping + gradient fills. Its background fill uses `bgAlpha = ss(0.46, 0.64, sp)` — deliberately delayed so it doesn't create a dark void over the particle field during emergence.
- The two canvases crossfade naturally: pixel canvas is opaque base, form canvas fades in with a transparent background during emergence so particles bleed through.

### Scroll structure — 4500vh

| sp range | Act | Visual |
|----------|-----|--------|
| 0.00–0.36 | I — Attractor | Peter de Jong, 5 forms, color shifts cool→neutral, mouse rotates cluster, ghost echo, nebula glow |
| 0.18–0.49 | II — Flow field | Compound-sine particles, seed particles (every 5th = 3× bright), mouse vortex |
| 0.32–0.48 | Transition | Emergence burst (white flash), convergence pull (particles spiral in), inner glow |
| 0.46–0.68 | III — Chrome | 3-light setup (key/fill/rim), animated specular sweep, iridescence, mesh grid, concentric rings, construction lines |
| 0.67–0.84 | IV — Depth | Indigo vein network, spore particles, electricity flashes, secondary nebula, pressure rings, fracture cracks |
| 0.82–1.00 | V — Amber | Solar granulation, orbiting satellites, mouse warm spot, Fourier construction lines, harmonic resonance rings, dissipation ripples |

### formSp mapping

All form drawing functions (`surfWeights`, `bgRgb`, `glowRgb`, `outlineRgb`, `rMaster`) receive `fsp`, not `sp`:

```typescript
const fsp = Math.max(0, Math.min(1, (sp - 0.32) / 0.68));
```

This maps the form acts (sp 0.32–1.00) onto [0,1], preserving all the original OdysseyLab timing logic.

### Key visual systems

**Attractor (phase 5 DNA)**
- `ATTRACTOR_FORMS[5]` — five Peter de Jong parameter sets traversed by scroll
- Pixel buffer: LUT decay arrays `decayR/G/B` toward `rgb(5,5,8)`
- Color tint varies with form phase: early = cool blue `(0.78r, 0.86g, 1.06b)`, late = neutral white
- Mouse rotation: output coordinates rotated by `atan2(my-0.5, mx-0.5)*0.14` rad
- Ghost echo: every 3rd iteration also writes to an offset position at 25% intensity

**Flow field (phase 6 DNA)**
- 700 particles with compound-sine angle formula
- `angle = sin(nx + T*0.55 + phase + mouseOffset)*cos(ny + T*0.40)*TAU + sin(nx*2.3 - ny*1.8 + T*0.18 + phase*0.6)*1.8`
- Seed particles: index `i % 5 === 0` → 3× brightness
- Mouse vortex: tangential acceleration around cursor
- Convergence: when `formEmerge > 0`, centripetal pull toward canvas center

**Chrome surface (phase 10 DNA)**
- Three-light model: key (mouse X), fill (opposing, mouse Y), rim (backlight)
- Animated specular: `sw = (sin(tau*0.65 + lightAngle)+1)/2` cycling through linear gradient stops
- Thin-film iridescence: 120 `hsla()` segments around the outline, animated hue
- Fine mesh grid visible during emergence, fades as chrome settles
- 5 concentric micro-rings breathing with `tau`

**Depth surface (phase 11 DNA)**
- `VEIN_NODES` / `VEIN_EDGES` — 108-node seeded-random tree, built at module level
- Three-pass edge drawing: glow halo + core + bright centerline
- Pulse: `0.5 + 0.5*sin(tau*1.6 + edge.phase + (mx-0.5)*2.2)`
- Electricity: `Math.random() < 0.0015` per edge → white flash
- 16 spore particles drifting in arcs around node positions
- Secondary nebula fill offset from center for depth-within-depth

**Amber surface (phase 12 DNA)**
- `GRANULES[44]` — module-level seeded positions, each with unique breathing `freq` and `phase`
- `SATELLITES[4]` — orbital bodies at different radii/speeds with glow halo
- Mouse warm spot: when cursor inside form radius, warm orange radial tracks it
- 36 Fourier construction lines phasing in with `amberW`
- 3 harmonic resonance rings outside the form
- 6-layer dissipation ripples at end

### Module-level constants (stable across frames)

```typescript
VEIN_NODES / VEIN_EDGES  — buildVeins(), max 108 nodes, depth 5
GRANULES[44]             — solar granulation seeds {x, y, phase, freq, size}
SATELLITES[4]            — orbital bodies {orbR, speed, phase, size}
ATTRACTOR_FORMS[5]       — Peter de Jong a/b/c/d parameter sets
```

### Text overlays (Lorem Ipsum — content TBD)

| Ref | sp window | Color | Position |
|-----|-----------|-------|----------|
| s0 | 0.02–0.21 | `#e8eaf2` | top-left |
| s1 | 0.21–0.39 | `#dde0f0` | bottom-right |
| s2 | 0.44–0.60 | `#ced6e8` | top-left |
| s3 | 0.60–0.76 | `#ced6e8` | bottom-right |
| s4 | 0.67–0.84 | `#c0b2e0` | center-left |
| s5 | 0.80–0.94 | `#c0b2e0` | top-right |
| s6 | 0.90–0.98 | `#dece98` | bottom-left |
| s7 | 0.96–1.00 | `#dece98` | center |

---

## Technical patterns used across all phases

### Canvas null-safety inside closures
```typescript
// TypeScript loses null-narrowing inside nested functions. Always reassert:
const cvs = canvasRef.current as HTMLCanvasElement;
```

### Color arc interpolation
```typescript
// Standard pattern: two lerp stages for three-stop arc
const tD = ss(enter_depth, exit_depth, sp);
const tA = ss(enter_amber, exit_amber, sp);
const value = lerp(lerp(start, mid, tD), end, tA);
```

### Path2D clipping for surface isolation
```typescript
const fp = makePath2D(cx, cy, R, rot, fsp);
ctx.save();
ctx.clip(fp);          // everything below is clipped to the form shape
// ... fill gradients, detail layers ...
ctx.restore();
```

### globalAlpha surface blending
During chrome→depth→amber crossfades, each surface is drawn at `ctx.globalAlpha = surfaceWeight`. Two surfaces are semi-transparent simultaneously — this creates intentional crossfade rather than a hard switch.

---

---

## CircuitLab — /lab-phase-14

`src/components/CircuitLab.tsx` / `src/app/lab-phase-14/page.tsx`

**Theme:** PRINTED CIRCUIT BOARD — the substrate. Literal PCB visual: copper traces, vias, component footprints.

**Tech:** p5.js v2 instance mode (`import("p5").then(...)`), pure p5 drawing API + `drawingContext` for radial gradients.

**Scroll structure — 1200vh (4 chapters × 300vh):**

| sp range | Chapter | Visual |
|----------|---------|--------|
| 0.00–0.25 | 1 — Power/Input | Board substrate fades in, PCB edge, fiducials, power bus rails draw on, U1/U2 ICs, passive components |
| 0.25–0.50 | 2 — Data Bus | 8 parallel data bus traces reveal, memory IC (U3), bus transceiver (U4), cool blue ambient glow |
| 0.50–0.75 | 3 — Logic/Processing | Complex routing network, main CPU (U5, largest IC), bright cyan ambient glow |
| 0.75–1.00 | 4 — Output | Output driver (U6), connector (J1), warm orange glow, output traces reveal |

**Trace animation:** Each trace has `revealOrder` (0..1). Progress = `ss(revealOrder, revealOrder+0.12, chapterProgress)`. Traces draw themselves partially — from start to `lerp(start, end, progress)`.

**Signal pulses:** Once `progress > 0.92`, a neon-green dot travels along the trace: `pulsePos = ((tau * speed + phase) % TAU) / TAU`.

**Module-level stable geometry (seeded, 0..1 normalized coords):**
- `TRACES[]` — ~75 segments (4 power rails thick + ~71 signal traces thin), each with `chapter`, `revealOrder`, `phase`
- `VIAS[]` — ~28 via holes with chapter assignment
- `COMPS[]` — 7 IC footprints (U1–U6, J1) + 17 passive components (R1–R9, C1–C8) with normalized `pins[]`

**Components:** IC bodies = dark rect + silkscreen outline + pin-1 marker. Passive = small rect. Connector = rect with rows of square pads. All draw reference designators via `p.text()`.

**Cross-chapter bridges:** Traces explicitly connect the zone boundaries (ch1→ch2, ch2→ch3, ch3→ch4) with `chapter = target_chapter` so they reveal during the later chapter's reveal sweep.

---

## OscilloLab — /lab-phase-15

`src/components/OscilloLab.tsx` / `src/app/lab-phase-15/page.tsx`

**Concept:** The signal, not the substrate. Counterpart to CircuitLab — visualizes the invisible electricity flowing through circuits as seen on a phosphor CRT oscilloscope.

**Theme:** Lissajous figures: `x(t) = A·sin(a·t + δ)`, `y(t) = B·sin(b·t)`. The fundamental art form of the oscilloscope.

**Tech:** p5.js v2, phosphor decay via semi-transparent background rect (no full clear), `drawingContext` for gradients and vignette.

**Scroll structure — 1200vh (4 chapters × 300vh):**

| sp range | Chapter | Lissajous state | Phosphor color |
|----------|---------|-----------------|----------------|
| 0.00–0.25 | 1 — Frequency | Line (δ=0) → Circle (1:1, δ=π/2) → Figure-8 (1:2) | Green (#00ff78) |
| 0.25–0.50 | 2 — Resonance | Figure-8 → 2:3 knot → 3:4 dense figure | Cyan (#14cdff) |
| 0.50–0.75 | 3 — Interference | 3:4 → 5:4 fracture → 3:2 butterfly | Amber (#ffa500) |
| 0.75–1.00 | 4 — Synthesis | 3:2 → 4:3 flower → return to circle | Cold white/violet |

**Lissajous morphing:** `LSTATES[9]` parameter sets. `lissa(sp)` interpolates between neighbors using smoothstep. **Fractional a/b during transitions** produce open-ended intermediate figures — a deliberate visual feature.

**Phosphor persistence:** `decayA = lerp(0.048, 0.011, sp)` — slow decay for complex high-sp figures so the full pattern remains visible; fast decay early so the beam appears as a moving comet.

**Beam speed:** `tau += lerp(0.020, 0.058, sp)` — faster for complex figures.

**Beam rendering:** 100 samples drawn each frame in a `WINDOW = TAU*0.036` arc around current `tau`. Size and alpha ramp from tail to head: `alpha = lerp(0, 215, ft³)`. Head gets two radial glow passes.

**Harmonics:**
- 2× harmonic (`sec2W = ss(0.52, 0.70, sp)`): 52% amplitude, `2a` and `2b` frequencies
- 3× harmonic (`sec3W = ss(0.77, 0.92, sp)`): 30% amplitude, `3a` and `3b` frequencies

**Chapter-transition noise:** Brief interference burst (scattered dots + horizontal glitch line) at sp ≈ 0.25, 0.50, 0.75.

**HUD overlay:** Live `Σ a:b` ratio, `CHn ▲` indicator, `τ` counter, `sp` value — rendered via `p.text()` each frame.

**Vignette:** `drawingContext` radial gradient `(0,0,0,0) → (0,0,0,0.55)` covers full canvas each frame to simulate CRT edge darkening.

**Text overlay glow:** CSS `textShadow` on headings uses the per-chapter phosphor color to simulate CRT text phosphorescence.

---

## NexusLab — /lab-phase-16

`src/components/NexusLab.tsx` / `src/app/lab-phase-16/page.tsx`

**Theme:** MINIMALIST POST-MODERN BAUHAUS MACHINERY — a three-cylinder radial engine rendered as a Bauhaus engineering drawing. Primary colors, geometric precision, kinematic beauty.

**Tech:** p5.js v2 instance mode, `drawingContext` for dashed lines and sector fills.

**Palette:**
```
BG:  (12,10,9)     #0c0a09  near-black linen
FG:  (238,234,228) #eeeae4  warm off-white
RED: (210,38,28)   #d2261c  Bauhaus rot
BLU: (22,82,160)   #1652a0  Bauhaus blau
YEL: (238,178,38)  #eeb226  Bauhaus gelb
```

**Scroll structure — 1200vh (4 chapters × 300vh):**

| sp range | Chapter | Visual |
|----------|---------|--------|
| 0.00–0.25 | 1 — STASIS | Bauhaus construction grid fades in. Dashed housing ring, radial track rails (RED/BLU/YEL), corner fiducials, bearing hub. Machine at rest. |
| 0.25–0.50 | 2 — DRIVE | Flywheel begins rotating. 3 colored sectors (120°). Connecting rods appear, pistons slide along tracks. |
| 0.50–0.75 | 3 — RESONANCE | Crank radius dimension line, rod length label, ω arc indicator animate in. Machine annotated like a technical drawing. |
| 0.75–1.00 | 4 — DISSOLUTION | Persistence decay begins. Rod midpoint oval traces and crank circle accumulate. Final state: pure analytical geometry — crank circle + 3 piston axis lines. |

**Kinematic model:** True radial engine formula:
```
d_i = R·cos(θ−φᵢ) + √(L²−R²·sin²(θ−φᵢ))
pistonX_i = cx + d_i·cos(φᵢ),  pistonY_i = cy + d_i·sin(φᵢ)
```
Crank pin at `(R·cos(θ), R·sin(θ))` from center. Connecting rod is the line from crank pin to piston pin. This is always well-defined because `L > R`.

**Track angles:** `φ = [−π/2, −π/2+2π/3, −π/2+4π/3]` — top, lower-right, lower-left.

**Trace accumulation:** Each frame, midpoint of each connecting rod is recorded (up to 520 pts). At ch4 these ovals render; at deep dissolution, analytical circle + axis lines overlay.

**Draw order:** grid → frame → rods (under flywheel) → flywheel sectors → crank pin → pistons → annotations → traces → HUD.

---

## KikaiLab — /lab-phase-17

`src/components/KikaiLab.tsx` / `src/app/lab-phase-17/page.tsx`

**Theme:** 機械 KIKAI (MACHINE) — A Bauhaus drawing automaton rendered with Japanese precision aesthetics. A small gear rolling inside a large ring gear; a stylus traces hypotrochoid curves. The machine is literally an instrument that draws itself.

**Inspiration:** Bauhaus Imaginista — the collision of Western machine logic and Japanese graphic patience. NexusLab was rotary→linear (pistons). KikaiLab is rotary→rotary trace (nested gears, mandala accumulation).

**Tech:** p5.js v2 instance mode, `drawingContext` for dashed ring gear and gear tooth ticks.

**Palette:**
```
BG:    (7,  6,  8)    — near-black, cool-violet cast
FG:    (232,228,220)  — warm off-white
RED:   (204, 32, 24)  — Bauhaus rot
BLU:   ( 20, 74,152)  — Bauhaus blau
YEL:   (225,170, 30)  — Bauhaus gelb
IVORY: (198,192,182)  — ghost trace (MA chapter)
```

**Hypotrochoid math:**
```
x(t) = (R−r)·cos(t) + d·cos((R−r)/r · t)
y(t) = (R−r)·sin(t) − d·sin((R−r)/r · t)
```
R = ring gear radius, r = inner gear radius (rolling inside), d = pen arm offset.

**Scroll structure — 1200vh (4 chapters × 300vh):**

| sp | Chapter | Japanese title | Visual |
|----|---------|----------------|--------|
| 0.00–0.25 | 1 — SEKKEI | 設計 (Blueprint) | Construction grid fades in. Ring gear draws itself (dashed, animated arc from top). Inner gear materialises with crosshair + 24 tooth ticks. Pen arm with `d` dimension label. Machine at rest. |
| 0.25–0.50 | 2 — KAITEN | 回転 (Rotation) | Crank turns. RED trace (R:r=5:3, d=0.80) starts. BLU trace (5:3, d=0.42) begins later. Construction outlines still visible. |
| 0.50–0.75 | 3 — KASANE | 重ね (Layering) | YEL trace (4:3, d=0.62) adds. Construction lines fade out. Gear ratio + hypotrochoid equation annotations. |
| 0.75–1.00 | 4 — MA | 間 (Negative Space) | Mechanism fully dissolved. IVORY trace (2:1) begins slowly. Shoji grid fades in. Three trace mandala glows on near-black. |

**GEAR_CONFS[4]:** Stable module-level constants.
```typescript
{ rRatio: 0.600, dRatio: 0.800, color: RED,   startSp: 0.28 } // 5:3 → star rose
{ rRatio: 0.600, dRatio: 0.420, color: BLU,   startSp: 0.36 } // 5:3 inner rose
{ rRatio: 0.750, dRatio: 0.620, color: YEL,   startSp: 0.52 } // 4:3 → 4-lobe
{ rRatio: 0.500, dRatio: 0.720, color: IVORY, startSp: 0.78 } // 2:1 → ellipse (MA)
```

**Inner gear global rotation:** `gearRot = -(1−rRatio)/rRatio · theta` (rolling without slipping on inside of ring).

**Contact point:** small dot at `(cx + Rg·cos(theta), cy + Rg·sin(theta))` — where inner gear touches ring.

**HUD:** `θ` angle, `sp`, chapter + `機械製図`, revolution counter.

**Shoji grid (ch4):** 12×8 fine grid with 3-column / 2-row thicker frames, very low alpha (11–19).

---

## FrostLab — /lab-phase-17-c

`src/components/FrostLab.tsx` / `src/app/lab-phase-17-c/page.tsx`

**Theme:** Diffusion-Limited Aggregation — 5 competing crystal domains growing simultaneously from a quincunx of seeds. Each cell is claimed by whichever aggregate's random walker reaches it first; grain boundaries form naturally where domains collide. The "machine" is randomness + a single collision rule = irreversible, fractal order.

**Simulation:** 300×200 grid, 64 walkers active at all times. `stepsPerFrame = lerp(5, 55, sp)`. Walker sticks at current position and inherits the aggregate ID of the occupied cell it bumped into; immediately respawned at random.

**Tip-glow decay:** freshly stuck cells = brightness 255, decrements by 3 every 2 frames toward floor 42. This keeps the growth frontier bright and old arms dim — the dendritic structure reads as a depth map of time.

**Walker visualisation:** active walkers rendered as 2.2px white semi-transparent dots on the upscaled canvas. Shows the invisible randomness that produces the deterministic crystal form.

**Palettes:** 5 mineral tones — warm silver (centre), amber (TL), verdigris (TR), terracotta (BL), pale violet (BR). Background grid (20px spacing) fades as fill fraction increases.

**Chapters:** NUCLEATION / PROPAGATION / COMPETITION / EQUILIBRIUM. HUD shows `CELLS n / 60000` and `% FILLED`.

---

## ChladniLab — /lab-phase-18

`src/components/ChladniLab.tsx` / `src/app/lab-phase-18/page.tsx`

**Theme:** Chladni figures — the acoustic machine. Ernst Chladni (1756–1827) sprinkled sand on vibrating metal plates and found geometry. The sand accumulates at nodal lines where displacement = 0. The piece simulates a circular membrane at multiple superposed harmonics, each oscillating in time, scroll-driven through 10 mode pairs.

**Three oscillating modes simultaneously:**
- Primary (ω=0.048): scrolls through all modes, full weight
- Secondary (ω=0.075): 2 modes ahead, weight fades in from sp=0.18 → max 0.58
- Tertiary (ω=0.119): 4 modes ahead, weight fades in from sp=0.44 → max 0.34

Different ω values create temporal beating — the three voices don't stay in phase, so the pattern continuously morphs even with scroll stopped.

**Mode catalogue (10 modes, (n, z_{n,m}) pairs):**
```
(1, 3.8317) 2 sectors    (2, 5.1356) 4 sectors    (0, 5.5201) 1 ring
(3, 6.3802) 6 sectors    (1, 7.0156) 2s+ring       (4, 7.5883) 8 sectors
(2, 8.4172) 4s+ring      (0, 8.6537) 2 rings       (5, 8.7715) 10 sectors
(3, 9.7610) 6s+ring
```

**Bessel functions:** LUT (512 pts, 0→14) precomputed once at module load via series expansion + forward recurrence. No per-frame Bessel computation — pure array lookup in the pixel loop.

**Displacement:** `ψ = Jₙ(z·r/R) · cos(n·θ) · cos(ω·τ)`. Superposition: `Ψ = Σ wₖ·ψₖ` (normalised by total weight).

**Color field:** positive Ψ → warm (amber/rust), negative Ψ → cool (indigo/teal), |Ψ|≈0 → bright nodal (warm white/silver). Palette shifts each chapter. Plate vignette dims edges.

**Plate border:** dashed circle + diameter construction cross at low alpha (Bauhaus engineering drawing language).

**Harmonic spectrum HUD (bottom-right):** 3 bars showing current oscillator weights + 3 spinning arcs for phase clocks. Makes the invisible harmonic content legible.

**Chapters:** FUNDAMENTAL / OVERTONE / HARMONIC / COMPOSITE. Equation annotation fades in ch3.

---

## HamonLab — /lab-phase-17-b

`src/components/HamonLab.tsx` / `src/app/lab-phase-17-b/page.tsx`

**Theme:** 波紋 HAMON (Wave-Pattern) — Gray-Scott reaction-diffusion running in real-time as a "crystallisation machine." No Bauhaus primaries, no Japanese text. The connection is conceptual: 波紋 names both the crystalline hamon pattern on a tempered katana blade AND water-surface ripples — both of which are literally reaction-diffusion phenomena. The Japanese Bauhaus imagination without the symbols.

**Core:** Gray-Scott PDE (`∂U/∂t = Du·∇²U − UV² + f(1−U)`, `∂V/∂t = Dv·∇²V + UV² − (f+k)V`) running on a 240×150 grid, 4 simulation steps per animation frame, rendered via offscreen canvas upscaled to fill viewport.

**Palette:** Earth tones per chapter — no Bauhaus primaries:
```
SEED:   near-black violet → copper bronze    (12,9,14)  → (148,108,52)
BRANCH: deep indigo       → verdigris teal   (8,10,20)  → (45,132,118)
WEAVE:  warm charcoal     → rust terracotta  (16,10,8)  → (168,72,38)
STILL:  cold dark         → cold silver      (6,8,12)   → (152,156,162)
```

**Scroll structure — 1200vh (4 chapters × 300vh):**

| sp | Chapter | Gray-Scott (f,k) | Pattern class |
|----|---------|------------------|---------------|
| 0.00–0.25 | SEED   | (0.035, 0.065) | Dense compact spots — pearls crystallising |
| 0.25–0.50 | BRANCH | (0.040, 0.059) | Growing/connected spots — tendrils spreading |
| 0.50–0.75 | WEAVE  | (0.029, 0.057) | Labyrinthine stripes — maze-like structure |
| 0.75–1.00 | STILL  | (0.025, 0.060) | Sparse large pearls — final equilibrium |

**Two injection nozzles:**
- Primary: scroll-driven golden-ratio Lissajous path (active whole piece)
- Secondary: faster independent path (active ch2–ch3 only for more complex growth)

**Phase-space HUD (bottom-right inset):** 78×78 px diagram of Gray-Scott parameter space. 4 chapter target dots (ghost), connecting trajectory, animated current (f,k) dot with pulse ring — makes the invisible machine visible.

**Headings:** Short Zen-aphoristic English — no Japanese characters. "SEED / crystals form without instruction" etc.

**Rendering pipeline:** `offscreen canvas (240×150)` → `putImageData(imgData)` → `dc.drawImage(offscreen, 0, 0, W, H)` (smooth upscale). `p.pixelDensity(1)` for performance.

---

## CausticLab — /lab-phase-18-b

`src/components/CausticLab.tsx` / `src/app/lab-phase-18-b/page.tsx`

**Theme:** The hidden machine — water caustics. A 2D wave PDE runs invisibly behind the scene; you never see the wave surface itself. You see only its shadow-light consequence: the refracted caustic pattern projected onto an imaginary floor below. The machine is present only as evidence. The tiny wave preview HUD is the only place the actual simulation appears — a small confessional window into the hidden engine.

**Conceptual inversion:** All prior lab phases show the mechanism directly (gears, reaction chemistry, crystals, vibrating plate). CausticLab removes the mechanism entirely from the main view and shows only its downstream optical effect. The wave is the cause; the caustic floor is the effect. You are always looking at the wrong thing.

**Physics — 2D wave equation:**
```
∂²H/∂t² = c²·∇²H
```
Discretised (FTCS):
```
V[i] += C2 · Laplacian(H[i]) · DT
H[i] += V[i] · DT
V[i] *= DAMP
```
Constants: `C2 = 0.16` (c = 0.4), `DT = 0.5`, `DAMP = 0.9985`, `STEPS = 3` per frame.
Grid: 240×160 (38,400 cells), Float32Arrays H and V. Stability criterion: c·DT = 0.2 ≤ 1/√2 ✓.
Boundaries: reflecting walls (H = V = 0 at edges after each step).

**Caustic computation (per frame):**
```
CAUSTIC.fill(0)
for each cell (i,j):
  nx = -(H[j,i+1] − H[j,i−1]) · 0.5      // surface normal gradient
  ny = -(H[j+1,i] − H[j−1,i]) · 0.5
  fx = i + nx · D                           // floor hit (D = lerp(60,120,sp))
  fy = j + ny · D
  bilinear splat 1.0 into CAUSTIC at (fx,fy)
tone-map: brightness = min(1, √(caustic · GAIN / STEPS))²   // sqrt + square = contrast
```
D grows with scroll: deep refraction late in the piece spreads caustics wider and creates higher-contrast focal points.

**Scroll structure — 1200vh (4 chapters × 300vh):**

| sp | Chapter | Impulse pattern | Visual character |
|----|---------|-----------------|-----------------|
| 0.00–0.25 | SURFACE      | Single centre pulse, 120-frame interval | Single symmetric ring expanding; one clean focal bright spot |
| 0.25–0.50 | REFRACTION   | Two golden-ratio sources (φ, 1/φ), 90-frame interval + offset | Interference fringes between two wavefronts |
| 0.50–0.75 | INTERFERENCE | Converging ring impulse (ring radius = 70→55px), 100-frame interval | Inward-collapsing annular wavefront; dramatic convergence brighspot at centre |
| 0.75–1.00 | DISSOLUTION  | 6 Fibonacci spiral sources (golden angle ≈ 2.400 rad), 70-frame interval | Phyllotactic scatter; complex overlapping caustic web |

**Palettes (floor dark-tone → caustic bright-tone):**
```
SURFACE:     deep indigo  (6,5,14)   → amber gold    (242,198,138)
REFRACTION:  deep teal    (5,12,14)  → coral orange  (225,148,98)
INTERFERENCE:deep violet  (10,6,16)  → cold silver   (210,208,220)
DISSOLUTION: near-black   (5,5,8)    → warm white    (248,245,240)
```
Adjacent chapters blend over `[0.75, 1.0]` of each chapter's `chT`.

**Wave preview HUD (top-left corner):**
- 80×53 grid downsampled from 240×160 wave buffer, upscaled ×2.5 → 200×132px on screen
- Wave height coloring: positive H → teal, negative H → red-orange, neutral → near-black
- Thin caustic-color border rect, "WAVE" label below
- fades in with `ss(0.04, 0.14, sp)` — always accessible but unobtrusive

**Corner stats:** sp value (top-right), chapter + `CAUSTIC · D=n` (bottom-left), energy readout E (bottom-right).

**Headings:** Aphoristic — about indirect presence, about seeing the effect without the cause.
```
"THE SURFACE   / does not show itself"
"ONLY LIGHT    / proves the water moves"
"REFRACTION    / the machine of misdirection"
"FOCUS         / where waves converge overhead"
"THE FLOOR     / reads what the surface wrote"
"SHADOW        / brighter than the object"
"CAUSTIC       / geometry of scattered intent"
"INTERFERENCE  / two sources, one floor"
"THE PATTERN   / was never in the water"
"WHAT REMAINS  / when the wave has passed"
"DISSOLUTION   / the machine forgets its form"
"LIGHT         / outlasts the wave that made it"
```

**Rendering pipeline:** Two offscreen canvases — caustic floor (240×160) and wave preview (80×53). Both rendered via ImageData → putImageData → drawImage upscale. `p.pixelDensity(1)`.

---

## What's next

- Replace Lorem Ipsum with real content once the form is fully locked (OdysseyLab)
- Decide which phases to link from the main portfolio as canonical experiences
- Consider whether OdysseyLab becomes the actual homepage background or stays as a standalone `/lab` page
- QA CircuitLab, OscilloLab, and NexusLab — mark liked/active after review
