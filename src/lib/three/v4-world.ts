// v4 World Geometry — Aurora Vortex
//
// Ten sinuous aurora curtains are arranged in a loose ring above an arctic
// ice sheet. Each curtain folds like draped fabric and slowly orbits the
// world's Y-axis, creating a vortex that appears to converge at the zenith.
// Helical charged-particle streams spiral between the curtains along magnetic
// field lines. A star field and ice plane with reflected shimmer complete the
// scene.
//
// Layers:
//   Ice      — Sparse flat arctic ground (Y = 0, concentric ripple density)
//   Curtains — 10 tall sinuous aurora curtains in a ring (main element)
//   Streams  — 8 helical magnetic-field-line particle streams
//   Stars    — Background star field at radius 320–500

import { makeRng } from "./noise";

// ── Public types ──────────────────────────────────────────────────────────────

export interface IceData {
  positions:  Float32Array; // XYZ, Y ≈ 0
  brightness: Float32Array; // per-point (0.08–0.26), concentric ripple pattern
  count:      number;
}

export interface CurtainData {
  positions:     Float32Array; // XYZ world-space at rest angle, with small jitter
  ts:            Float32Array; // 0 = bottom, 1 = top (height fraction)
  ss:            Float32Array; // 0 = left edge, 1 = right edge (horizontal fraction)
  phases:        Float32Array; // per-curtain phase constant
  curtainAngles: Float32Array; // angle from +Z in world XZ plane (radians)
  count:         number;
}

export interface StreamData {
  positions: Float32Array; // XYZ along helical path, with slight noise
  ts:        Float32Array; // 0 = bottom, 1 = top (used for travelling pulse)
  phases:    Float32Array; // per-stream phase constant
  count:     number;
}

export interface StarData {
  positions: Float32Array; // XYZ on sphere radius 320–500
  count:     number;
}

export interface V4World {
  ice:      IceData;
  curtains: CurtainData;
  streams:  StreamData;
  stars:    StarData;
}

// ── Curtain layout ────────────────────────────────────────────────────────────
// Ten curtains in a ring. Radii and widths vary to avoid uniformity.
// Angles are evenly spaced (2π / 10 ≈ 0.628 rad) with slight jitter.
// Heights are larger toward the "back" (larger Z) for a sense of depth.

interface CurtainDef {
  angle:  number; // radians from +Z axis
  radius: number; // distance from world origin (world units)
  width:  number; // curtain width along tangent direction
  height: number; // curtain height (Y range: 0 → height)
  phase:  number; // random phase offset for animation
}

const CURTAIN_DEFS: CurtainDef[] = [
  { angle: 0.00,  radius: 38, width: 18, height: 72, phase: 0.00 },
  { angle: 0.63,  radius: 32, width: 15, height: 80, phase: 1.10 },
  { angle: 1.26,  radius: 45, width: 21, height: 65, phase: 2.30 },
  { angle: 1.88,  radius: 35, width: 17, height: 82, phase: 0.70 },
  { angle: 2.51,  radius: 42, width: 20, height: 68, phase: 3.00 },
  { angle: 3.14,  radius: 30, width: 16, height: 77, phase: 1.80 },
  { angle: 3.77,  radius: 48, width: 22, height: 62, phase: 0.40 },
  { angle: 4.40,  radius: 36, width: 18, height: 84, phase: 2.60 },
  { angle: 5.03,  radius: 41, width: 15, height: 70, phase: 1.40 },
  { angle: 5.65,  radius: 33, width: 17, height: 78, phase: 3.50 },
];

// ── Ice ground plane ──────────────────────────────────────────────────────────
// 100×100 grid, ~35 % accept rate with distance-based density modulation.
// Centre (r < 18) is nearly clear — the "eye" of the vortex.
// Edges (r > 60) fade to nothing.
// Brightness follows concentric ripples for a frozen-surface texture.

function buildIce(rng: () => number): IceData {
  const GRID = 100;
  const MAX  = GRID * GRID;
  const pos    = new Float32Array(MAX * 3);
  const bright = new Float32Array(MAX);
  let w = 0;

  for (let iz = 0; iz < GRID; iz++) {
    for (let ix = 0; ix < GRID; ix++) {
      const x = (ix / (GRID - 1) - 0.5) * 160 + (rng() - 0.5) * 1.2;
      const z = (iz / (GRID - 1) - 0.5) * 160 + (rng() - 0.5) * 1.2;
      const r = Math.sqrt(x * x + z * z);

      // Density: sparse centre void, fade at edges
      const centreVoid = r < 18 ? 0.04 : 1.0;
      const edgeFade   = r > 62 ? Math.max(0, 1 - (r - 62) / 42) : 1.0;
      if (rng() > 0.36 * centreVoid * edgeFade) continue;

      pos[w * 3]     = x;
      pos[w * 3 + 1] = (rng() - 0.5) * 0.12; // negligible Y variation
      pos[w * 3 + 2] = z;

      // Concentric ripple brightness (frozen surface texture)
      const ripple = 0.5 + 0.5 * Math.sin(r * 0.20);
      bright[w] = 0.06 + ripple * 0.16;
      w++;
    }
  }

  return {
    positions:  pos.slice(0, w * 3),
    brightness: bright.slice(0, w),
    count:      w,
  };
}

// ── Aurora curtains ───────────────────────────────────────────────────────────
// Each curtain is a 25 (horizontal) × 28 (vertical) point grid = 700 pts.
// Points are placed in world space at the curtain's rest angle.
// The vertex shader applies fold, lift, and vortex rotation each frame.

function buildCurtains(rng: () => number): CurtainData {
  const NS = 25;  // horizontal samples per curtain
  const NT = 28;  // vertical samples per curtain
  const TOTAL = CURTAIN_DEFS.length * NS * NT;

  const pos    = new Float32Array(TOTAL * 3);
  const ts     = new Float32Array(TOTAL);
  const ss     = new Float32Array(TOTAL);
  const phases = new Float32Array(TOTAL);
  const angles = new Float32Array(TOTAL);
  let w = 0;

  for (const def of CURTAIN_DEFS) {
    const cx = Math.sin(def.angle) * def.radius;
    const cz = Math.cos(def.angle) * def.radius;
    // Tangent direction (perpendicular to radius in XZ, pointing "sideways")
    const tx =  Math.cos(def.angle);
    const tz = -Math.sin(def.angle);

    for (let it = 0; it < NT; it++) {
      for (let is = 0; is < NS; is++) {
        const s = is / (NS - 1); // 0–1 horizontal
        const t = it / (NT - 1); // 0–1 vertical

        const lx = (s - 0.5) * def.width; // horizontal offset along tangent

        pos[w * 3]     = cx + lx * tx + (rng() - 0.5) * 0.28;
        pos[w * 3 + 1] = t * def.height  + (rng() - 0.5) * 0.38;
        pos[w * 3 + 2] = cz + lx * tz   + (rng() - 0.5) * 0.28;

        ts[w]     = t;
        ss[w]     = s;
        phases[w] = def.phase;
        angles[w] = def.angle;
        w++;
      }
    }
  }

  return { positions: pos, ts, ss, phases, curtainAngles: angles, count: w };
}

// ── Helical magnetic-field-line streams ───────────────────────────────────────
// 8 streams, each a helix with decreasing radius as Y increases (spirals
// inward toward the zenith). Colour and brightness are animated in the shader
// via a travelling pulse.

function buildStreams(rng: () => number): StreamData {
  const STREAM_COUNT = 8;
  const PTS_PER      = 400;
  const TOTAL        = STREAM_COUNT * PTS_PER;

  const pos    = new Float32Array(TOTAL * 3);
  const ts     = new Float32Array(TOTAL);
  const phases = new Float32Array(TOTAL);
  let w = 0;

  for (let si = 0; si < STREAM_COUNT; si++) {
    const baseAngle     = (si / STREAM_COUNT) * Math.PI * 2;
    const startRadius   = 16 + rng() * 24; // 16–40 units from centre
    const phase         = rng() * Math.PI * 2;
    const helixTurns    = 1.2 + rng() * 1.4; // turns over full height

    for (let pi = 0; pi < PTS_PER; pi++) {
      const t = pi / (PTS_PER - 1);    // 0 = base, 1 = top
      const y = t * 130;               // height 0 → 130

      // Radius decreases as height increases (spirals inward)
      const r     = startRadius * (1.0 - t * 0.72);
      const angle = baseAngle + t * Math.PI * 2 * helixTurns;

      pos[w * 3]     = Math.sin(angle) * r + (rng() - 0.5) * 0.7;
      pos[w * 3 + 1] = y                   + (rng() - 0.5) * 0.4;
      pos[w * 3 + 2] = Math.cos(angle) * r + (rng() - 0.5) * 0.7;

      ts[w]     = t;
      phases[w] = phase;
      w++;
    }
  }

  return { positions: pos, ts, phases, count: w };
}

// ── Background star field ─────────────────────────────────────────────────────
// 2 000 points distributed on the upper hemisphere at radius 320–500.

function buildStars(rng: () => number): StarData {
  const COUNT = 2000;
  const pos   = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const theta = Math.acos(1 - 2 * rng()); // uniform on sphere
    const phi   = rng() * Math.PI * 2;
    const r     = 320 + rng() * 180;

    // Keep stars above Y = 0 (upper hemisphere only)
    pos[i * 3]     =  Math.sin(theta) * Math.cos(phi) * r;
    pos[i * 3 + 1] =  Math.abs(Math.cos(theta)) * r + 10;
    pos[i * 3 + 2] =  Math.sin(theta) * Math.sin(phi) * r;
  }

  return { positions: pos, count: COUNT };
}

// ── Public builder ────────────────────────────────────────────────────────────

export function buildV4World(seed: number): V4World {
  const rng = makeRng(seed);
  return {
    ice:      buildIce(rng),
    curtains: buildCurtains(rng),
    streams:  buildStreams(rng),
    stars:    buildStars(rng),
  };
}
