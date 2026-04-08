// v2 World Geometry — Morphic Fluid / Circuit Lab
//
// Layers:
//   Structure     — PCB routing grid + Manhattan traces + lab-equipment silhouettes
//   Fluid         — Dense morphing blobs pooling at equipment bases
//   Spikes        — Ferrofluid spike clusters rising from node areas
//   Arcs          — Quadratic-bezier field lines floating between nodes
//   PlasmaAnimals — Jellyfish / manta ray / cosmic serpent emerging from fluid pools
//   AmbientHaze   — Sparse background nebula for depth

import { makePermutation, makeRng } from "./noise";

// ── Public types ──────────────────────────────────────────────────────────────

export interface ArcData {
  positions: Float32Array; // COUNT × 3
  ts:        Float32Array; // 0..1 along arc (per vertex)
  speeds:    Float32Array; // same value repeated for each vertex
  phases:    Float32Array; // same value repeated for each vertex
  count:     number;
}

export interface PlasmaAnimalData {
  positions:    Float32Array; // COUNT × 3  (base rest position)
  phases:       Float32Array; // per-point shimmer phase
  ts:           Float32Array; // 0=pool-base .. 1=tip (emergence driver)
  seeds:        Float32Array; // per-point drift seed
  animalPhase:  Float32Array; // per-point (shared within one animal) slow cycle offset
  count:        number;
}

export interface AmbientHazeData {
  positions:  Float32Array; // COUNT × 3
  brightness: Float32Array; // per-point base brightness (very dim)
  count:      number;
}

export interface V2World {
  structure: {
    positions:  Float32Array;
    brightness: Float32Array;
    count:      number;
  };
  fluid: {
    positions: Float32Array;
    phases:    Float32Array;
    seeds:     Float32Array;
    count:     number;
  };
  spikes: {
    positions: Float32Array;
    ts:        Float32Array;
    freqs:     Float32Array;
    phases:    Float32Array;
    maxH:      Float32Array;
    count:     number;
  };
  arcs:         ArcData[];
  plasmaAnimals: PlasmaAnimalData;
  ambientHaze:  AmbientHazeData;
  nodes:        [number, number, number][];
}

// ── World layout ──────────────────────────────────────────────────────────────

const NODES: [number, number, number][] = [
  [ 15, 0,  45],  // 0 — Hero A
  [-18, 0,  35],  // 1 — Hero B
  [ 35, 0,  15],  // 2 — About
  [  5, 0,  -5],  // 3 — Projects A
  [-28, 0, -15],  // 4 — Projects B
  [ 18, 0, -30],  // 5 — Skills
  [-15, 0, -50],  // 6 — Contact
  [  8, 0, -65],  // 7 — End
];

const ARC_PAIRS: [number, number][] = [
  [0, 1], [0, 2], [1, 3],
  [2, 3], [3, 4], [3, 5],
  [4, 6], [5, 6], [5, 7], [6, 7],
];

// ── Lab equipment shapes ──────────────────────────────────────────────────────

function addFlask(
  pos: Float32Array, bright: Float32Array,
  off: number, cx: number, cz: number,
  rng: () => number, scale = 1.0
): number {
  let w = 0;
  const bR = 5 * scale, nR = 1.4 * scale, coneH = 7 * scale, neckH = 9 * scale;
  const bv = (b: number) => { bright[off + w] = b; };
  for (let i = 0; i < 160; i++) {
    const cosT = rng(), sinT = Math.sqrt(1 - cosT * cosT), phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * sinT * bR;
    pos[(off + w) * 3 + 1] = bR * (1 - cosT);
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * sinT * bR;
    bv(0.15 + rng() * 0.10); w++;
  }
  for (let i = 0; i < 90; i++) {
    const t = rng(), r = bR * (1 - t) + nR * t, y = bR + t * coneH, phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * r;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * r;
    bv(0.14 + rng() * 0.08); w++;
  }
  for (let i = 0; i < 80; i++) {
    const t = rng(), y = bR + coneH + t * neckH, phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * nR;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * nR;
    bv(0.12 + rng() * 0.08); w++;
  }
  return w;
}

function addBeaker(
  pos: Float32Array, bright: Float32Array,
  off: number, cx: number, cz: number,
  rng: () => number, scale = 1.0
): number {
  let w = 0;
  const R = 4 * scale, H = 9 * scale;
  for (let i = 0; i < 130; i++) {
    const t = rng(), y = t * H, phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * R;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * R;
    bright[off + w] = 0.16 + rng() * 0.08; w++;
  }
  for (let i = 0; i < 45; i++) {
    const r = Math.sqrt(rng()) * R, phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * r;
    pos[(off + w) * 3 + 1] = 0;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * r;
    bright[off + w] = 0.12 + rng() * 0.06; w++;
  }
  return w;
}

function addTestTubeRack(
  pos: Float32Array, bright: Float32Array,
  off: number, cx: number, cz: number,
  rng: () => number
): number {
  let w = 0;
  const TUBES = 4, SPACING = 4, R = 1.2, H = 13;
  for (let ti = 0; ti < TUBES; ti++) {
    const tx = cx + (ti - (TUBES - 1) / 2) * SPACING;
    for (let i = 0; i < 90; i++) {
      const t = rng(), y = 1 + t * H, phi = rng() * Math.PI * 2;
      pos[(off + w) * 3]     = tx + Math.cos(phi) * R;
      pos[(off + w) * 3 + 1] = y;
      pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * R;
      bright[off + w] = 0.13 + rng() * 0.07; w++;
    }
    for (let i = 0; i < 30; i++) {
      const cosT = rng(), sinT = Math.sqrt(1 - cosT * cosT), phi = rng() * Math.PI * 2;
      pos[(off + w) * 3]     = tx + Math.cos(phi) * sinT * R;
      pos[(off + w) * 3 + 1] = 1 - cosT * R;
      pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * sinT * R;
      bright[off + w] = 0.11 + rng() * 0.06; w++;
    }
  }
  return w;
}

// ── Circuit substrate ─────────────────────────────────────────────────────────

function addCircuitFloor(
  pos: Float32Array, bright: Float32Array,
  off: number, rng: () => number,
  nodes: [number, number, number][]
): number {
  let w = 0;
  const HALF = 100, GRID_GAP = 12, PT_STEP = 0.75;
  for (let x = -HALF; x <= HALF; x += GRID_GAP) {
    for (let z = -HALF; z <= HALF; z += PT_STEP) {
      pos[(off + w) * 3]     = x + (rng() - 0.5) * 0.06;
      pos[(off + w) * 3 + 1] = 0;
      pos[(off + w) * 3 + 2] = z;
      bright[off + w] = 0.06 + rng() * 0.04; w++;
    }
  }
  for (let z = -HALF; z <= HALF; z += GRID_GAP) {
    for (let x = -HALF; x <= HALF; x += PT_STEP) {
      pos[(off + w) * 3]     = x;
      pos[(off + w) * 3 + 1] = 0;
      pos[(off + w) * 3 + 2] = z + (rng() - 0.5) * 0.06;
      bright[off + w] = 0.06 + rng() * 0.04; w++;
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [ax, , az] = nodes[i], [bx, , bz] = nodes[j];
      const dist = Math.sqrt((bx - ax) ** 2 + (bz - az) ** 2);
      if (dist > 52) continue;
      const horizFirst = rng() < 0.5;
      const midX = horizFirst ? bx : ax, midZ = horizFirst ? az : bz;
      const addSeg = (x1: number, z1: number, x2: number, z2: number) => {
        const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const steps = Math.max(2, Math.floor(len / 0.28));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          pos[(off + w) * 3]     = x1 + t * (x2 - x1) + (rng() - 0.5) * 0.03;
          pos[(off + w) * 3 + 1] = 0;
          pos[(off + w) * 3 + 2] = z1 + t * (z2 - z1) + (rng() - 0.5) * 0.03;
          bright[off + w] = 0.20 + rng() * 0.12; w++;
        }
      };
      addSeg(ax, az, midX, midZ);
      addSeg(midX, midZ, bx, bz);
    }
  }
  for (const [nx, , nz] of nodes) {
    for (let ring = 0; ring < 3; ring++) {
      const r = 2.0 + ring * 1.2, pts = Math.floor(r * 14);
      for (let i = 0; i < pts; i++) {
        const phi = (i / pts) * Math.PI * 2 + rng() * 0.08;
        pos[(off + w) * 3]     = nx + Math.cos(phi) * r + (rng() - 0.5) * 0.06;
        pos[(off + w) * 3 + 1] = 0;
        pos[(off + w) * 3 + 2] = nz + Math.sin(phi) * r + (rng() - 0.5) * 0.06;
        bright[off + w] = 0.24 + rng() * 0.14; w++;
      }
    }
  }
  return w;
}

// ── Fluid blobs ───────────────────────────────────────────────────────────────

function addFluidPool(
  pos: Float32Array, phases: Float32Array, seeds: Float32Array,
  off: number, cx: number, cz: number,
  radius: number, count: number, rng: () => number
): number {
  for (let i = 0; i < count; i++) {
    const cosT = rng() * 2 - 1, sinT = Math.sqrt(1 - cosT * cosT);
    const phi  = rng() * Math.PI * 2, r = Math.cbrt(rng());
    pos[(off + i) * 3]     = cx + Math.cos(phi) * sinT * r * radius * 1.5;
    pos[(off + i) * 3 + 1] = Math.abs(cosT) * r * radius * 0.85;
    pos[(off + i) * 3 + 2] = cz + Math.sin(phi) * sinT * r * radius * 1.5;
    phases[off + i] = rng() * Math.PI * 2;
    seeds[off + i]  = rng() * 50 + 10;
  }
  return count;
}

// ── Ferrofluid spikes ─────────────────────────────────────────────────────────

function addSpikeCluster(
  pos: Float32Array, ts: Float32Array, freqs: Float32Array,
  phases: Float32Array, maxH: Float32Array,
  off: number, cx: number, cz: number, rng: () => number
): number {
  const GRID = 7, SPACING = 2.2, PTS_PER_SPIKE = 9;
  let w = 0;
  for (let xi = 0; xi < GRID; xi++) {
    for (let zi = 0; zi < GRID; zi++) {
      const sx = cx + (xi - (GRID - 1) / 2) * SPACING + (rng() - 0.5) * 0.6;
      const sz = cz + (zi - (GRID - 1) / 2) * SPACING + (rng() - 0.5) * 0.6;
      const spFreq = 0.5 + rng() * 1.3, spPhase = rng() * Math.PI * 2, spMax = 2.5 + rng() * 7.0;
      for (let pi = 0; pi < PTS_PER_SPIKE; pi++) {
        const t = pi / (PTS_PER_SPIKE - 1);
        pos[(off + w) * 3]     = sx;
        pos[(off + w) * 3 + 1] = 0;
        pos[(off + w) * 3 + 2] = sz;
        ts[off + w] = t; freqs[off + w] = spFreq; phases[off + w] = spPhase; maxH[off + w] = spMax;
        w++;
      }
    }
  }
  return w;
}

// ── Field arcs ────────────────────────────────────────────────────────────────

function buildArc(
  a: [number, number, number], b: [number, number, number], rng: () => number
): ArcData {
  const COUNT = 180;
  const positions = new Float32Array(COUNT * 3);
  const ts        = new Float32Array(COUNT);
  const speed     = 0.25 + rng() * 0.35;
  const phase     = rng() * Math.PI * 2;
  const speeds    = new Float32Array(COUNT).fill(speed);
  const phases    = new Float32Array(COUNT).fill(phase);
  const mx = (a[0] + b[0]) / 2 + (rng() - 0.5) * 8;
  const my = 8 + rng() * 14;
  const mz = (a[2] + b[2]) / 2 + (rng() - 0.5) * 8;
  for (let i = 0; i < COUNT; i++) {
    const t = i / (COUNT - 1), mt = 1 - t;
    positions[i * 3]     = mt * mt * a[0] + 2 * t * mt * mx + t * t * b[0];
    positions[i * 3 + 1] = mt * mt * a[1] + 2 * t * mt * my + t * t * b[1];
    positions[i * 3 + 2] = mt * mt * a[2] + 2 * t * mt * mz + t * t * b[2];
    ts[i] = t;
  }
  return { positions, ts, speeds, phases, count: COUNT };
}

// ── Plasma animals ────────────────────────────────────────────────────────────
// Each builder appends into a shared plasma buffer and returns point count.
// aT (0=pool base, 1=tip) drives the vertical emergence lift.
// animalPhase is the same for all points of one creature so they rise together.

function addJellyfish(
  pos: Float32Array, phases: Float32Array, ts: Float32Array,
  seeds: Float32Array, animalPhase: Float32Array,
  off: number, cx: number, cz: number, scale: number,
  rng: () => number, cyclePhase: number
): number {
  let w = 0;
  const R = 4.5 * scale;   // bell radius
  const H = 3.2 * scale;   // bell height (flattened dome)
  const BASE = 1.5 * scale; // bell sits above pool surface

  const pt = (x: number, y: number, z: number, t: number) => {
    pos[(off + w) * 3]     = cx + x + (rng() - 0.5) * 0.15;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + z + (rng() - 0.5) * 0.15;
    ts[off + w]           = t;
    phases[off + w]       = rng() * Math.PI * 2;
    seeds[off + w]        = rng();
    animalPhase[off + w]  = cyclePhase;
    w++;
  };

  // Bell dome: hemisphere biased toward equator for wide silhouette
  for (let i = 0; i < 220; i++) {
    const u   = rng() * rng(); // bias toward equator (higher u)
    const phi = rng() * Math.PI * 2;
    const sinU = Math.sqrt(1 - u * u);
    pt(Math.cos(phi) * sinU * R, BASE + u * H, Math.sin(phi) * sinU * R, 0.35 + u * 0.55);
  }

  // Bright equatorial rim
  for (let i = 0; i < 50; i++) {
    const phi = (i / 50) * Math.PI * 2 + rng() * 0.06;
    pt(Math.cos(phi) * R * 0.92, BASE + rng() * 0.4, Math.sin(phi) * R * 0.92, 0.90);
  }

  // Oral arms (4 ruffled arms below bell)
  for (let arm = 0; arm < 4; arm++) {
    const aPhi = (arm / 4) * Math.PI * 2 + rng() * 0.3;
    const aR   = 1.8 * scale;
    for (let i = 0; i < 28; i++) {
      const t      = rng();
      const ruffle = aPhi + (rng() - 0.5) * 0.7;
      pt(Math.cos(ruffle) * (aR + rng() * 0.5 * scale),
         BASE - t * 2.5 * scale,
         Math.sin(ruffle) * (aR + rng() * 0.5 * scale),
         0.25 - t * 0.15);
    }
  }

  // Long trailing tentacles
  const TENTACLES = 14;
  for (let ti = 0; ti < TENTACLES; ti++) {
    const tPhi = (ti / TENTACLES) * Math.PI * 2 + (rng() - 0.5) * 0.2;
    const tR   = R * (0.5 + rng() * 0.45);
    const tLen = (7 + rng() * 11) * scale;
    for (let i = 0; i < 18; i++) {
      const frac  = i / 17;
      const wave  = Math.sin(frac * Math.PI * 2.5) * 0.5 * scale;
      pt(Math.cos(tPhi + wave * 0.1) * tR, BASE - frac * tLen,
         Math.sin(tPhi + wave * 0.1) * tR, Math.max(0, 0.18 - frac * 0.18));
    }
  }

  return w; // ≈ 220+50+4×28+14×18 = 614
}

function addMantaRay(
  pos: Float32Array, phases: Float32Array, ts: Float32Array,
  seeds: Float32Array, animalPhase: Float32Array,
  off: number, cx: number, cz: number, scale: number,
  rng: () => number, cyclePhase: number
): number {
  let w = 0;
  const SPAN  = 9 * scale;  // half-wingspan (one side)
  const CHORD = 7 * scale;  // front-to-back length
  const HOVER = 5 * scale;  // resting height above pool surface

  const pt = (x: number, y: number, z: number, t: number) => {
    pos[(off + w) * 3]     = cx + x + (rng() - 0.5) * 0.18;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + z + (rng() - 0.5) * 0.18;
    ts[off + w]           = t;
    phases[off + w]       = rng() * Math.PI * 2;
    seeds[off + w]        = rng();
    animalPhase[off + w]  = cyclePhase;
    w++;
  };

  // Wing surface: delta planform with swept leading edge
  for (let i = 0; i < 290; i++) {
    const xN    = rng() * 2 - 1;         // -1..1 across wingspan
    const xAbs  = Math.abs(xN);
    // Leading edge sweeps back from nose, trailing edge is more parallel
    const zFront = -CHORD * 0.22 * (1 - xAbs) + xAbs * CHORD * 0.45;
    const zBack  = CHORD * (0.35 + xAbs * 0.30);
    const z      = zFront + rng() * (zBack - zFront);
    // Thickness: thicker along body spine, tapers to zero at wing tips
    const thick  = Math.max(0, (1 - xAbs * 1.05)) * scale * 1.4
                   * (1 - Math.abs(z / CHORD) * 0.6);
    const y      = HOVER + (rng() - 0.5) * thick;
    pt(xN * SPAN, y, z, 0.30 + (1 - xAbs) * 0.55);
  }

  // Cephalic horns (front curled tips)
  for (let horn = -1; horn <= 1; horn += 2) {
    for (let i = 0; i < 22; i++) {
      const t = i / 21;
      pt(horn * 1.3 * scale, HOVER + t * 3.0 * scale, -CHORD * 0.22 - t * 1.5 * scale, 0.55 + t * 0.35);
    }
  }

  // Whip tail
  for (let i = 0; i < 35; i++) {
    const t     = i / 34;
    const curve = Math.sin(t * Math.PI) * 1.5 * scale;
    pt(curve, HOVER - t * 2.5 * scale, CHORD * 0.55 + t * CHORD * 0.55, 0.30 - t * 0.20);
  }

  return w; // ≈ 290+44+35 = 369
}

function addSerpent(
  pos: Float32Array, phases: Float32Array, ts: Float32Array,
  seeds: Float32Array, animalPhase: Float32Array,
  off: number, cx: number, cz: number, scale: number,
  rng: () => number, cyclePhase: number
): number {
  let w = 0;
  const SEGS    = 26;   // spine divisions
  const LENGTH  = 22 * scale;
  const RING_N  = 14;   // points per cross-section ring

  const pt = (x: number, y: number, z: number, t: number) => {
    pos[(off + w) * 3]     = cx + x + (rng() - 0.5) * 0.12;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + z + (rng() - 0.5) * 0.12;
    ts[off + w]           = t;
    phases[off + w]       = rng() * Math.PI * 2;
    seeds[off + w]        = rng();
    animalPhase[off + w]  = cyclePhase;
    w++;
  };

  for (let seg = 0; seg < SEGS; seg++) {
    const sT   = seg / (SEGS - 1);
    // Spine: sinusoidal wave in XZ, rise in Y toward midsection
    const spX  = Math.sin(sT * Math.PI * 1.8) * 5 * scale;
    const spY  = 3 * scale + Math.sin(sT * Math.PI) * 5 * scale;
    const spZ  = sT * LENGTH;
    // Taper: full girth in mid, thin at head/tail
    const taper = Math.sin(sT * Math.PI);
    const segR  = (0.35 + taper * 1.8) * scale;
    // ts increases from 0 (tail) to 1 (head) — head emerges first
    const segT  = 0.15 + taper * 0.65;

    for (let ri = 0; ri < RING_N; ri++) {
      const phi = (ri / RING_N) * Math.PI * 2;
      // Ring is oriented in XY plane (simple, readable for sinusoidal serpent)
      pt(spX + Math.cos(phi) * segR, spY + Math.sin(phi) * segR * 0.7, spZ, segT);
    }
  }

  // Head: slightly larger sphere
  const headX = Math.sin(0) * 5 * scale;
  const headY = 3 * scale;
  for (let i = 0; i < 45; i++) {
    const phi  = rng() * Math.PI * 2;
    const cosT = rng() * 2 - 1;
    const sinT = Math.sqrt(1 - cosT * cosT);
    const r    = 2.2 * scale;
    pt(headX + Math.cos(phi) * sinT * r, headY + cosT * r, 0, 0.7 + (cosT + 1) * 0.15);
  }

  return w; // ≈ 26×14 + 45 = 364+45 = 409
}

// ── Ambient nebula haze ───────────────────────────────────────────────────────

function buildAmbientHaze(rng: () => number): AmbientHazeData {
  const COUNT      = 3500;
  const positions  = new Float32Array(COUNT * 3);
  const brightness = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const phi  = rng() * Math.PI * 2;
    const cosT = rng() * 2 - 1;
    const sinT = Math.sqrt(1 - cosT * cosT);
    const r    = Math.cbrt(rng()); // uniform sphere
    positions[i * 3]     = Math.cos(phi) * sinT * r * 130;
    positions[i * 3 + 1] = Math.abs(cosT) * r * 55 + 3;  // only above floor
    positions[i * 3 + 2] = cosT * r * 90;
    brightness[i]         = 0.012 + rng() * 0.022;
  }
  return { positions, brightness, count: COUNT };
}

// ── Public export ─────────────────────────────────────────────────────────────

export function buildV2World(seed = 42): V2World {
  const _perm = makePermutation(seed);
  const rng   = makeRng(seed + 2077);

  const MAX_STRUCT = 22_000;
  const MAX_FLUID  = 26_000;
  const MAX_SPIKES =  4_000;
  const MAX_PLASMA =  2_200;

  const strPos    = new Float32Array(MAX_STRUCT * 3);
  const strBright = new Float32Array(MAX_STRUCT);
  let   strCount  = 0;

  const flPos    = new Float32Array(MAX_FLUID * 3);
  const flPhases = new Float32Array(MAX_FLUID);
  const flSeeds  = new Float32Array(MAX_FLUID);
  let   flCount  = 0;

  const spPos    = new Float32Array(MAX_SPIKES * 3);
  const spTs     = new Float32Array(MAX_SPIKES);
  const spFreqs  = new Float32Array(MAX_SPIKES);
  const spPhases = new Float32Array(MAX_SPIKES);
  const spMaxH   = new Float32Array(MAX_SPIKES);
  let   spCount  = 0;

  const plPos   = new Float32Array(MAX_PLASMA * 3);
  const plPh    = new Float32Array(MAX_PLASMA);
  const plTs    = new Float32Array(MAX_PLASMA);
  const plSd    = new Float32Array(MAX_PLASMA);
  const plAph   = new Float32Array(MAX_PLASMA);
  let   plCount = 0;

  // ── Circuit floor ──────────────────────────────────────────────────────
  strCount += addCircuitFloor(strPos, strBright, strCount, rng, NODES);

  // ── Equipment + fluid + spikes per node ───────────────────────────────
  type EType = "flask" | "beaker" | "rack";
  const ETYPES: EType[] = ["flask", "beaker", "flask", "rack", "beaker", "flask", "beaker", "rack"];
  const SPIKE_NODES = new Set([0, 1, 2, 3, 4, 5, 6]);

  for (let ni = 0; ni < NODES.length; ni++) {
    const [nx, , nz] = NODES[ni];
    const scale = 0.90 + rng() * 0.70;
    const type  = ETYPES[ni];
    if (type === "flask")       strCount += addFlask(strPos, strBright, strCount, nx, nz, rng, scale);
    else if (type === "beaker") strCount += addBeaker(strPos, strBright, strCount, nx, nz, rng, scale);
    else                        strCount += addTestTubeRack(strPos, strBright, strCount, nx, nz, rng);

    const poolR   = 4.5 + rng() * 4.0;
    const poolPts = Math.floor(1600 + rng() * 800);
    flCount += addFluidPool(flPos, flPhases, flSeeds, flCount, nx, nz, poolR, poolPts, rng);

    if (SPIKE_NODES.has(ni)) {
      const offX = (rng() - 0.5) * 5, offZ = (rng() - 0.5) * 5;
      spCount += addSpikeCluster(spPos, spTs, spFreqs, spPhases, spMaxH, spCount, nx + offX, nz + offZ, rng);
    }
  }

  // ── Plasma animals (at 4 nodes, staggered cycle phases) ───────────────
  // Jellyfish at node 0 and node 6, manta at node 3, serpent at node 5
  const [n0x,,n0z] = NODES[0];
  const [n3x,,n3z] = NODES[3];
  const [n5x,,n5z] = NODES[5];
  const [n6x,,n6z] = NODES[6];

  plCount += addJellyfish(plPos, plPh, plTs, plSd, plAph, plCount,
                          n0x, n0z, 1.0, rng, 0.0);
  plCount += addMantaRay (plPos, plPh, plTs, plSd, plAph, plCount,
                          n3x, n3z, 1.0, rng, Math.PI * 0.5);
  plCount += addSerpent  (plPos, plPh, plTs, plSd, plAph, plCount,
                          n5x, n5z - 5, 1.0, rng, Math.PI * 1.1);
  plCount += addJellyfish(plPos, plPh, plTs, plSd, plAph, plCount,
                          n6x, n6z, 0.75, rng, Math.PI * 1.7); // smaller second jellyfish

  // ── Field arcs ─────────────────────────────────────────────────────────
  const arcs: ArcData[] = ARC_PAIRS.map(([ai, bi]) => buildArc(NODES[ai], NODES[bi], rng));

  // ── Ambient haze ────────────────────────────────────────────────────────
  const ambientHaze = buildAmbientHaze(rng);

  return {
    structure: {
      positions:  strPos.slice(0, strCount * 3),
      brightness: strBright.slice(0, strCount),
      count:      strCount,
    },
    fluid: {
      positions: flPos.slice(0, flCount * 3),
      phases:    flPhases.slice(0, flCount),
      seeds:     flSeeds.slice(0, flCount),
      count:     flCount,
    },
    spikes: {
      positions: spPos.slice(0, spCount * 3),
      ts:        spTs.slice(0, spCount),
      freqs:     spFreqs.slice(0, spCount),
      phases:    spPhases.slice(0, spCount),
      maxH:      spMaxH.slice(0, spCount),
      count:     spCount,
    },
    arcs,
    plasmaAnimals: {
      positions:   plPos.slice(0, plCount * 3),
      phases:      plPh.slice(0, plCount),
      ts:          plTs.slice(0, plCount),
      seeds:       plSd.slice(0, plCount),
      animalPhase: plAph.slice(0, plCount),
      count:       plCount,
    },
    ambientHaze,
    nodes: NODES,
  };
}
