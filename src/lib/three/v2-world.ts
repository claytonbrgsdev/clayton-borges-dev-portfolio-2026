// v2 World Geometry — Circuit Cathedral
//
// Six tall circuit-board monoliths rise from the abyss. Plasma cascades down
// their faces like digital waterfalls. Plasma creatures drift through the space
// between them. Monochromatic phosphorescent palette on a black void.
//
// Layers:
//   Slabs         — Tall circuit-board monolith surfaces (static dim grid + traces)
//   Cascades      — Plasma flowing DOWN each slab face (animated shader)
//   PlasmaAnimals — Jellyfish / manta / serpent floating between slabs
//   AmbientHaze   — Sparse background nebula for depth

import { makeRng } from "./noise";

// ── Public types ──────────────────────────────────────────────────────────────

export interface SlabData {
  positions:  Float32Array; // COUNT × 3 — static circuit surface
  brightness: Float32Array; // per-point
  count:      number;
}

export interface CascadeData {
  positions:  Float32Array; // COUNT × 3  — X,Z fixed; Y animated by shader
  speeds:     Float32Array; // per-point flow speed
  phases:     Float32Array; // per-point start phase (0–1)
  slabBottom: number;       // world Y of slab base
  slabH:      number;       // slab height in world units
  count:      number;
}

export interface PlasmaAnimalData {
  positions:   Float32Array;
  phases:      Float32Array;
  ts:          Float32Array; // 0=base .. 1=tip (brightness gradient)
  seeds:       Float32Array;
  animalPhase: Float32Array; // shared per-animal for body-wide bob sync
  count:       number;
}

export interface AmbientHazeData {
  positions:  Float32Array;
  brightness: Float32Array;
  count:      number;
}

export interface V2World {
  slabs:         SlabData[];
  cascades:      CascadeData[];
  plasmaAnimals: PlasmaAnimalData;
  ambientHaze:   AmbientHazeData;
}

// ── Slab layout ───────────────────────────────────────────────────────────────

interface SlabDef { x: number; z: number; w: number; h: number; rot: number; }

const SLABS: SlabDef[] = [
  { x: -28, z:  28, w: 14, h: 48, rot:  0.08 }, // 0 left-front
  { x:   8, z:  12, w: 18, h: 52, rot: -0.06 }, // 1 centre-front (tallest)
  { x:  34, z:  -5, w: 12, h: 44, rot:  0.14 }, // 2 right-mid
  { x: -15, z: -22, w: 16, h: 50, rot: -0.09 }, // 3 left-mid
  { x:  24, z: -44, w: 13, h: 46, rot:  0.11 }, // 4 right-back
  { x: -32, z: -58, w: 15, h: 49, rot: -0.04 }, // 5 left-back
];

// ── Slab surface (static circuit geometry) ────────────────────────────────────

function buildSlabPoints(def: SlabDef, rng: () => number): SlabData {
  const cos = Math.cos(def.rot), sin = Math.sin(def.rot);

  // Local X → world coords (Y rotation around slab centre)
  const wx = (lx: number) => def.x + lx * cos;
  const wz = (lx: number) => def.z - lx * sin;

  const MAX = 2800;
  const pos    = new Float32Array(MAX * 3);
  const bright = new Float32Array(MAX);
  let   w      = 0;

  const put = (lx: number, ly: number, b: number) => {
    pos[w * 3]     = wx(lx) + (rng() - 0.5) * 0.06;
    pos[w * 3 + 1] = ly     + (rng() - 0.5) * 0.06;
    pos[w * 3 + 2] = wz(lx) + (rng() - 0.5) * 0.06;
    bright[w]      = b; w++;
  };

  // Background scan-dot grid (very dim, gives PCB substrate feel)
  const GX = 20, GY = 32;
  for (let gx = 0; gx < GX; gx++) {
    for (let gy = 0; gy < GY; gy++) {
      put(
        (gx / (GX - 1) - 0.5) * def.w,
        (gy / (GY - 1)) * def.h + 0.5,
        0.05 + rng() * 0.04
      );
    }
  }

  // Horizontal circuit traces
  const TRACE_Y = [5, 11, 17, 24, 31, 38, 44].filter(y => y < def.h - 1);
  for (const ty of TRACE_Y) {
    const n = Math.floor(def.w / 0.30);
    for (let i = 0; i < n; i++) {
      put((i / (n - 1) - 0.5) * def.w * 0.96, ty, 0.22 + rng() * 0.20);
    }
  }

  // Vertical connectors between adjacent trace rows
  for (let ci = 0; ci + 1 < TRACE_Y.length; ci += 2) {
    const numV = 2 + Math.floor(rng() * 3);
    for (let v = 0; v < numV; v++) {
      const lx = (rng() - 0.5) * def.w * 0.68;
      const y1 = TRACE_Y[ci], y2 = TRACE_Y[ci + 1];
      const steps = Math.max(2, Math.floor((y2 - y1) / 0.30));
      for (let s = 0; s <= steps; s++) {
        put(lx, y1 + (s / steps) * (y2 - y1), 0.18 + rng() * 0.14);
      }
    }
  }

  // Pad rings at trace junctions
  for (let p = 0; p < 7; p++) {
    const lx = (rng() - 0.5) * def.w * 0.62;
    const ty  = TRACE_Y[Math.floor(rng() * TRACE_Y.length)] ?? 10;
    const r   = 0.9 + rng() * 0.9;
    const nP  = Math.floor(r * 22);
    for (let i = 0; i < nP; i++) {
      const phi = (i / nP) * Math.PI * 2;
      put(lx + Math.cos(phi) * r, ty + Math.sin(phi) * r, 0.28 + rng() * 0.22);
    }
  }

  // Edge highlights — sides and top cap
  const nEdge = Math.ceil(def.h / 0.40);
  for (const side of [-1, 1] as const) {
    for (let i = 0; i <= nEdge; i++) {
      put(side * def.w * 0.50, (i / nEdge) * def.h, 0.40 + rng() * 0.24);
    }
  }
  const nTop = Math.ceil(def.w / 0.40);
  for (let i = 0; i <= nTop; i++) {
    put((i / nTop - 0.5) * def.w, def.h, 0.42 + rng() * 0.22);
  }

  return { positions: pos.slice(0, w * 3), brightness: bright.slice(0, w), count: w };
}

// ── Cascade (animated plasma flowing down slab face) ──────────────────────────

function buildCascadePoints(def: SlabDef, rng: () => number): CascadeData {
  const cos = Math.cos(def.rot), sin = Math.sin(def.rot);
  const COLS = 75, PTS = 10;
  const COUNT = COLS * PTS;

  const pos    = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);
  let w = 0;

  for (let col = 0; col < COLS; col++) {
    const lx  = (col / (COLS - 1) - 0.5) * def.w * 0.90 + (rng() - 0.5) * 0.25;
    const spd = 0.5 + rng() * 2.0;
    const ph  = rng(); // column start phase 0-1
    const cwx = def.x + lx * cos;
    const cwz = def.z - lx * sin;

    for (let pt = 0; pt < PTS; pt++) {
      pos[w * 3]     = cwx + (rng() - 0.5) * 0.08;
      pos[w * 3 + 1] = 0;   // Y is irrelevant; shader computes it from phase
      pos[w * 3 + 2] = cwz + (rng() - 0.5) * 0.08;
      // Stagger phase within column so points fill different heights
      phases[w] = fract01(ph + pt / PTS);
      speeds[w] = spd + (rng() - 0.5) * 0.2;
      w++;
    }
  }

  return {
    positions:  pos,
    speeds,
    phases,
    slabBottom: 0.5,
    slabH:      def.h,
    count:      w,
  };
}

function fract01(v: number): number {
  return v - Math.floor(v);
}

// ── Plasma animals ─────────────────────────────────────────────────────────────
// All use a `cy` Y-centre so creatures can be placed at mid-slab height.
// aT drives brightness (0=dim base, 1=bright tip). No ground-emergence logic.

function addJellyfish(
  pos: Float32Array, phases: Float32Array, ts: Float32Array,
  seeds: Float32Array, animalPhase: Float32Array,
  off: number, cx: number, cy: number, cz: number, scale: number,
  rng: () => number, cyclePh: number
): number {
  let w = 0;
  const R    = 4.8 * scale;
  const H    = 3.4 * scale;
  const BASE = cy + 1.5 * scale; // bell equator Y

  const pt = (x: number, y: number, z: number, t: number) => {
    pos[(off + w) * 3]     = cx + x + (rng() - 0.5) * 0.14;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + z + (rng() - 0.5) * 0.14;
    ts[off + w]            = t;
    phases[off + w]        = rng() * Math.PI * 2;
    seeds[off + w]         = rng();
    animalPhase[off + w]   = cyclePh;
    w++;
  };

  // Bell dome
  for (let i = 0; i < 240; i++) {
    const u   = rng() * rng(); // bias toward equator
    const phi = rng() * Math.PI * 2;
    const sU  = Math.sqrt(1 - u * u);
    pt(Math.cos(phi) * sU * R, BASE + u * H, Math.sin(phi) * sU * R, 0.35 + u * 0.55);
  }
  // Bright equatorial rim
  for (let i = 0; i < 55; i++) {
    const phi = (i / 55) * Math.PI * 2 + rng() * 0.05;
    pt(Math.cos(phi) * R * 0.93, BASE + rng() * 0.35, Math.sin(phi) * R * 0.93, 0.92);
  }
  // Oral arms
  for (let arm = 0; arm < 4; arm++) {
    const aPhi = (arm / 4) * Math.PI * 2 + rng() * 0.3;
    for (let i = 0; i < 30; i++) {
      const t = rng(), ruf = aPhi + (rng() - 0.5) * 0.7;
      pt(Math.cos(ruf) * (1.9 * scale + rng() * 0.5 * scale), BASE - t * 2.8 * scale,
         Math.sin(ruf) * (1.9 * scale + rng() * 0.5 * scale), 0.25 - t * 0.15);
    }
  }
  // Trailing tentacles
  for (let ti = 0; ti < 15; ti++) {
    const tPhi = (ti / 15) * Math.PI * 2 + (rng() - 0.5) * 0.18;
    const tR   = R * (0.48 + rng() * 0.45);
    const tLen = (8 + rng() * 11) * scale;
    for (let i = 0; i < 22; i++) {
      const frac = i / 21;
      const wave = Math.sin(frac * Math.PI * 2.4) * 0.45 * scale;
      pt(Math.cos(tPhi + wave * 0.08) * tR, BASE - frac * tLen,
         Math.sin(tPhi + wave * 0.08) * tR, Math.max(0, 0.19 - frac * 0.19));
    }
  }

  return w; // ≈ 240+55+4×30+15×22 = 745
}

function addMantaRay(
  pos: Float32Array, phases: Float32Array, ts: Float32Array,
  seeds: Float32Array, animalPhase: Float32Array,
  off: number, cx: number, cy: number, cz: number, scale: number,
  rng: () => number, cyclePh: number
): number {
  let w = 0;
  const SPAN  = 9.5 * scale;
  const CHORD = 7.5 * scale;
  const BY    = cy;  // wing body centre Y

  const pt = (x: number, y: number, z: number, t: number) => {
    pos[(off + w) * 3]     = cx + x + (rng() - 0.5) * 0.16;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + z + (rng() - 0.5) * 0.16;
    ts[off + w]            = t;
    phases[off + w]        = rng() * Math.PI * 2;
    seeds[off + w]         = rng();
    animalPhase[off + w]   = cyclePh;
    w++;
  };

  // Wing body (delta planform)
  for (let i = 0; i < 320; i++) {
    const xN   = rng() * 2 - 1;
    const xAbs = Math.abs(xN);
    const zF   = -CHORD * 0.22 * (1 - xAbs) + xAbs * CHORD * 0.46;
    const zB   = CHORD * (0.36 + xAbs * 0.32);
    const z    = zF + rng() * (zB - zF);
    const thk  = Math.max(0, (1 - xAbs * 1.06)) * scale * 1.5 * (1 - Math.abs(z / CHORD) * 0.55);
    pt(xN * SPAN, BY + (rng() - 0.5) * thk, z, 0.28 + (1 - xAbs) * 0.58);
  }
  // Cephalic horns
  for (const horn of [-1, 1] as const) {
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      pt(horn * 1.35 * scale, BY + t * 3.2 * scale, -CHORD * 0.22 - t * 1.6 * scale, 0.55 + t * 0.38);
    }
  }
  // Whip tail
  for (let i = 0; i < 38; i++) {
    const t = i / 37, curl = Math.sin(t * Math.PI) * 1.8 * scale;
    pt(curl, BY - t * 2.8 * scale, CHORD * 0.56 + t * CHORD * 0.55, 0.28 - t * 0.18);
  }

  return w; // ≈ 320+48+38 = 406
}

function addSerpent(
  pos: Float32Array, phases: Float32Array, ts: Float32Array,
  seeds: Float32Array, animalPhase: Float32Array,
  off: number, cx: number, cy: number, cz: number, scale: number,
  rng: () => number, cyclePh: number
): number {
  let w = 0;
  const SEGS   = 28, LENGTH = 24 * scale, RING = 16;

  const pt = (x: number, y: number, z: number, t: number) => {
    pos[(off + w) * 3]     = cx + x + (rng() - 0.5) * 0.10;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + z + (rng() - 0.5) * 0.10;
    ts[off + w]            = t;
    phases[off + w]        = rng() * Math.PI * 2;
    seeds[off + w]         = rng();
    animalPhase[off + w]   = cyclePh;
    w++;
  };

  for (let seg = 0; seg < SEGS; seg++) {
    const sT    = seg / (SEGS - 1);
    const spX   = Math.sin(sT * Math.PI * 1.85) * 5.5 * scale;
    const spY   = cy + Math.sin(sT * Math.PI) * 6 * scale;
    const spZ   = sT * LENGTH;
    const taper = Math.sin(sT * Math.PI);
    const segR  = (0.32 + taper * 1.9) * scale;
    const segT  = 0.15 + taper * 0.65;
    for (let ri = 0; ri < RING; ri++) {
      const phi = (ri / RING) * Math.PI * 2;
      pt(spX + Math.cos(phi) * segR, spY + Math.sin(phi) * segR * 0.7, spZ, segT);
    }
  }
  // Head
  for (let i = 0; i < 50; i++) {
    const phi = rng() * Math.PI * 2;
    const cT  = rng() * 2 - 1, sT = Math.sqrt(1 - cT * cT);
    const r   = 2.4 * scale;
    pt(Math.cos(phi) * sT * r, cy + cT * r, 0, 0.7 + (cT + 1) * 0.14);
  }

  return w; // ≈ 28×16+50 = 498
}

// ── Ambient nebula haze ────────────────────────────────────────────────────────

function buildAmbientHaze(rng: () => number): AmbientHazeData {
  const COUNT = 4000;
  const pos   = new Float32Array(COUNT * 3);
  const bri   = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const phi = rng() * Math.PI * 2, cT = rng() * 2 - 1, sT = Math.sqrt(1 - cT * cT);
    const r   = Math.cbrt(rng());
    pos[i * 3]     = Math.cos(phi) * sT * r * 140;
    pos[i * 3 + 1] = Math.abs(cT)  * r * 70 + 5;
    pos[i * 3 + 2] = cT * r * 90;
    bri[i]          = 0.010 + rng() * 0.020;
  }
  return { positions: pos, brightness: bri, count: COUNT };
}

// ── Public export ──────────────────────────────────────────────────────────────

export function buildV2World(seed = 42): V2World {
  const rng = makeRng(seed + 2077);

  // ── Build 6 slabs ─────────────────────────────────────────────────────────
  const slabs:    SlabData[]    = SLABS.map(def => buildSlabPoints(def, rng));
  const cascades: CascadeData[] = SLABS.map(def => buildCascadePoints(def, rng));

  // ── Plasma animals (floating between slabs at mid-height) ─────────────────
  const MAX_PLASMA = 3_500;
  const plPos  = new Float32Array(MAX_PLASMA * 3);
  const plPh   = new Float32Array(MAX_PLASMA);
  const plTs   = new Float32Array(MAX_PLASMA);
  const plSd   = new Float32Array(MAX_PLASMA);
  const plAph  = new Float32Array(MAX_PLASMA);
  let   plCount = 0;

  // Jellyfish 1: front-left, between slab 0 and slab 1
  plCount += addJellyfish(plPos, plPh, plTs, plSd, plAph,
    plCount, -8, 6, 22, 1.8, rng, 0.0);

  // Manta: between slab 1 and slab 2, higher up
  plCount += addMantaRay(plPos, plPh, plTs, plSd, plAph,
    plCount, 22, 20, 4, 1.7, rng, Math.PI * 0.55);

  // Serpent: weaves between slab 3 and slab 4
  plCount += addSerpent(plPos, plPh, plTs, plSd, plAph,
    plCount, 4, 14, -32, 1.5, rng, Math.PI * 1.15);

  // Jellyfish 2: deep back-left, near slab 5
  plCount += addJellyfish(plPos, plPh, plTs, plSd, plAph,
    plCount, -25, 10, -52, 1.35, rng, Math.PI * 1.70);

  return {
    slabs,
    cascades,
    plasmaAnimals: {
      positions:   plPos.slice(0, plCount * 3),
      phases:      plPh.slice(0, plCount),
      ts:          plTs.slice(0, plCount),
      seeds:       plSd.slice(0, plCount),
      animalPhase: plAph.slice(0, plCount),
      count:       plCount,
    },
    ambientHaze: buildAmbientHaze(rng),
  };
}
