// v5 World Geometry — Serpent Infinity
//
// A point-cloud serpent perpetually chases its tail along a vertical
// lemniscate (∞ symbol). The body is an animated particle tube whose
// position is computed entirely in the vertex shader, so the serpent
// flows continuously without rebuilding geometry.
//
// Layers:
//   Serpent   — 960-pt tube (80 rings × 12 pts). Body = 87 % of path.
//   Cage      — 6 large ∞ loops each rotated 30 ° around Y (THREE.LineLoop)
//   Tendrils  — 12 long helical lines spiraling from the crossing center
//   Orbs      — Dense clusters at the 3 key inflection points of the ∞
//   Nebula    — 4 000 sparse background particles in an oblate ellipsoid

import { makeRng } from "./noise";

// ── Lemniscate helpers ────────────────────────────────────────────────────────
// Vertical figure-8 (lemniscate of Gerono, 90° rotated):
//   x(t) = scale · 0.5 · sin(2t)
//   y(t) = scale · cos(t)
//   z(t) = scale · 0.18 · sin(t) · sin(2t)   ← gentle 3D twist

export const SERPENT_SCALE = 22; // base scale (world units)

function lemPos(t: number, scale = SERPENT_SCALE): [number, number, number] {
  return [
    scale * 0.5 * Math.sin(2 * t),
    scale * Math.cos(t),
    scale * 0.18 * Math.sin(t) * Math.sin(2 * t),
  ];
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface SerpentData {
  // position = zeros — vertex shader computes from aBodyT + uTime
  positions:   Float32Array;
  bodyTs:      Float32Array; // 0 = head, 1 = tail (fraction along body)
  ringAngles:  Float32Array; // 0–2π around the tube cross-section
  ringRadii:   Float32Array; // 0–1 radial jitter fraction
  ridgeFlags:  Float32Array; // 1.0 = dorsal ridge particle, else 0.0
  count:       number;
}

export interface CageLineData {
  positions: Float32Array; // 201 pts (last closes the loop)
  ts:        Float32Array; // 0–1 along path
  rotY:      number;       // rotation around Y axis (radians)
  count:     number;
}

export interface TendrilData {
  positions: Float32Array; // 150 pts per tendril
  ts:        Float32Array; // 0 = center, 1 = tip
  phase:     number;       // per-tendril random phase for pulse animation
  count:     number;
}

export interface OrbData {
  positions: Float32Array;
  phases:    Float32Array; // per-point random phase for breathing pulse
  orbIds:    Float32Array; // 0 = center, 1 = top, 2 = bottom
  count:     number;
}

export interface NebulaData {
  positions:  Float32Array;
  brightness: Float32Array;
  phases:     Float32Array;
  count:      number;
}

export interface V5World {
  serpent:   SerpentData;
  cageLines: CageLineData[];
  tendrils:  TendrilData[];
  orbs:      OrbData;
  nebula:    NebulaData;
}

// ── Serpent body ──────────────────────────────────────────────────────────────
// 160 ring cross-sections × 18 particles each = 2880 pts.
// All positions are zero — the vertex shader recomputes each frame.
// Body covers 87 % of the lemniscate (gap of 13 % keeps tail nearly
// touching head without overlapping at the crossing point).
// ridgeFlags marks ~2 particles per ring at angle ≈ 0 as dorsal ridge pts.

function buildSerpent(rng: () => number): SerpentData {
  const N_RINGS     = 160;
  const N_RING_PTS  = 18;
  const COUNT       = N_RINGS * N_RING_PTS;

  const positions  = new Float32Array(COUNT * 3); // stays zero
  const bodyTs     = new Float32Array(COUNT);
  const ringAngles = new Float32Array(COUNT);
  const ringRadii  = new Float32Array(COUNT);
  const ridgeFlags = new Float32Array(COUNT);
  let w = 0;

  for (let ri = 0; ri < N_RINGS; ri++) {
    const bodyT = ri / (N_RINGS - 1); // 0 = head, 1 = tail
    for (let pi = 0; pi < N_RING_PTS; pi++) {
      // Slight jitter on angle for organic, non-uniform tube
      const angle  = (pi / N_RING_PTS) * Math.PI * 2 + (rng() - 0.5) * 0.12;
      // Radius: most pts cluster near the surface, a few fill the interior
      const radius = 0.55 + rng() * 0.45;

      bodyTs[w]     = bodyT;
      ringAngles[w] = angle;
      ringRadii[w]  = radius;

      // Ridge: particles within ±0.32 rad of angle 0 (top of cross-section)
      const normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      ridgeFlags[w] = (normAngle < 0.32 || normAngle > Math.PI * 2 - 0.32) ? 1.0 : 0.0;
      w++;
    }
  }

  return { positions, bodyTs, ringAngles, ringRadii, ridgeFlags, count: COUNT };
}

// ── Cage ∞ loops ──────────────────────────────────────────────────────────────
// 6 lemniscate wireframes, each rotated 30 ° around the Y axis.
// Scale: 36 (larger than the serpent's 22) so the serpent sits inside the cage.
// The last point duplicates the first to visually close the loop.

function buildCageLines(): CageLineData[] {
  const N_CAGE    = 6;
  const CAGE_PTS  = 200; // sampling resolution per cage loop
  const CAGE_SCALE = 36;
  const lines: CageLineData[] = [];

  for (let ci = 0; ci < N_CAGE; ci++) {
    const rotY = (ci / N_CAGE) * Math.PI; // 0 … 150 ° (π in total — 180° = same shape)
    const cosR = Math.cos(rotY), sinR = Math.sin(rotY);

    const pos = new Float32Array((CAGE_PTS + 1) * 3);
    const ts  = new Float32Array(CAGE_PTS + 1);

    for (let i = 0; i <= CAGE_PTS; i++) {
      const t     = (i % CAGE_PTS) / CAGE_PTS * Math.PI * 2;
      const [lx, ly, lz] = lemPos(t, CAGE_SCALE);

      // Rotate around Y axis
      pos[i * 3]     = lx * cosR - lz * sinR;
      pos[i * 3 + 1] = ly;
      pos[i * 3 + 2] = lx * sinR + lz * cosR;
      ts[i]          = i / CAGE_PTS;
    }

    lines.push({ positions: pos, ts, rotY, count: CAGE_PTS + 1 });
  }

  return lines;
}

// ── Tendrils ──────────────────────────────────────────────────────────────────
// 12 long helical lines starting at the crossing center (0,0,0) and spiraling
// outward. Each tendril makes 2–3 helical turns while extending to radius 78 u.
// A travelling brightness pulse animates along them in the vertex shader.

function buildTendrils(rng: () => number): TendrilData[] {
  const N_TENDRILS  = 12;
  const TENDRIL_PTS = 150;
  const tendrils: TendrilData[] = [];

  for (let ti = 0; ti < N_TENDRILS; ti++) {
    const baseAngle  = (ti / N_TENDRILS) * Math.PI * 2;
    const helixTurns = 2.0 + rng() * 1.2;          // 2–3.2 turns
    const ySlant     = (rng() - 0.5) * 50;          // vertical spread at tip
    const phase      = rng() * Math.PI * 2;

    const pos = new Float32Array(TENDRIL_PTS * 3);
    const ts  = new Float32Array(TENDRIL_PTS);

    for (let i = 0; i < TENDRIL_PTS; i++) {
      const t     = i / (TENDRIL_PTS - 1);           // 0 = center, 1 = tip
      const r     = t * 78;                          // radius 0 → 78
      const angle = baseAngle + t * Math.PI * 2 * helixTurns;

      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = ySlant * t;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      ts[i]          = t;
    }

    tendrils.push({ positions: pos, ts, phase, count: TENDRIL_PTS });
  }

  return tendrils;
}

// ── Energy orbs ───────────────────────────────────────────────────────────────
// Dense particle clusters at the three key inflection points of the ∞:
//   Orb 0 — crossing center (0,  0, 0)  — 220 pts, bright white-cyan
//   Orb 1 — top apex      (0, +S, 0)   — 140 pts, warm gold
//   Orb 2 — bottom apex   (0, -S, 0)   — 140 pts, cool violet
// Particles are scattered in a small sphere; the vertex shader drives a pulse.

function buildOrbs(rng: () => number): OrbData {
  const ORB_DEFS = [
    { cx: 0, cy: 0,               cz: 0, count: 220, r: 3.5 }, // crossing
    { cx: 0, cy:  SERPENT_SCALE,  cz: 0, count: 140, r: 2.8 }, // top apex
    { cx: 0, cy: -SERPENT_SCALE,  cz: 0, count: 140, r: 2.8 }, // bottom apex
  ] as const;

  const TOTAL = ORB_DEFS.reduce((s, d) => s + d.count, 0);
  const pos    = new Float32Array(TOTAL * 3);
  const phases = new Float32Array(TOTAL);
  const ids    = new Float32Array(TOTAL);
  let w = 0;

  for (let oi = 0; oi < ORB_DEFS.length; oi++) {
    const { cx, cy, cz, count, r } = ORB_DEFS[oi];
    for (let i = 0; i < count; i++) {
      // Uniform distribution in sphere via rejection
      let px: number, py: number, pz: number;
      do {
        px = (rng() * 2 - 1) * r;
        py = (rng() * 2 - 1) * r;
        pz = (rng() * 2 - 1) * r;
      } while (px * px + py * py + pz * pz > r * r);

      pos[w * 3]     = cx + px;
      pos[w * 3 + 1] = cy + py;
      pos[w * 3 + 2] = cz + pz;
      phases[w]      = rng() * Math.PI * 2;
      ids[w]         = oi;
      w++;
    }
  }

  return { positions: pos, phases, orbIds: ids, count: w };
}

// ── Nebula ────────────────────────────────────────────────────────────────────
// 4 000 sparse particles in an oblate ellipsoid (rx=rz=82, ry=60).
// Slowly drift and rotate in the vertex shader for a living atmosphere.

function buildNebula(rng: () => number): NebulaData {
  const COUNT = 4000;
  const pos    = new Float32Array(COUNT * 3);
  const bright = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // Rejection sampling in oblate ellipsoid
    let px: number, py: number, pz: number;
    do {
      px = (rng() * 2 - 1) * 82;
      py = (rng() * 2 - 1) * 60;
      pz = (rng() * 2 - 1) * 82;
    } while ((px / 82) ** 2 + (py / 60) ** 2 + (pz / 82) ** 2 > 1.0);

    pos[i * 3]     = px;
    pos[i * 3 + 1] = py;
    pos[i * 3 + 2] = pz;
    bright[i]      = 0.04 + rng() * 0.12;
    phases[i]      = rng() * Math.PI * 2;
  }

  return { positions: pos, brightness: bright, phases, count: COUNT };
}

// ── Public builder ────────────────────────────────────────────────────────────

export function buildV5World(seed: number): V5World {
  const rng = makeRng(seed);
  return {
    serpent:   buildSerpent(rng),
    cageLines: buildCageLines(),
    tendrils:  buildTendrils(rng),
    orbs:      buildOrbs(rng),
    nebula:    buildNebula(rng),
  };
}
