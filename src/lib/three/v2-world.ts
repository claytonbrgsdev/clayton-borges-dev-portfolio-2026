// v2 World Geometry — Morphic Fluid / Circuit Lab
//
// A monochromatic phosphorescent fluid occupying digital-circuit / lab-equipment
// structures suspended in the same black abyss as v1.
//
// Layers:
//   Structure  — PCB routing grid + Manhattan traces + lab-equipment silhouettes
//   Fluid      — Dense morphing blobs pooling at equipment bases
//   Spikes     — Ferrofluid spike clusters rising from node areas
//   Arcs       — Quadratic-bezier field lines floating between nodes

import { makePermutation, makeRng } from "./noise";

// ── Public types ──────────────────────────────────────────────────────────────

export interface ArcData {
  positions: Float32Array; // COUNT × 3
  ts:        Float32Array; // 0..1 along arc (per vertex)
  speeds:    Float32Array; // same value repeated for each vertex
  phases:    Float32Array; // same value repeated for each vertex
  count:     number;
}

export interface V2World {
  structure: {
    positions:   Float32Array;
    brightness:  Float32Array; // per-vertex brightness (dim grid → bright traces)
    count:       number;
  };
  fluid: {
    positions: Float32Array;
    phases:    Float32Array; // per-vertex random phase for organic drift
    seeds:     Float32Array; // per-vertex random seed for drift variation
    count:     number;
  };
  spikes: {
    positions: Float32Array;
    ts:        Float32Array; // 0..1 along spike height
    freqs:     Float32Array; // oscillation frequency per point
    phases:    Float32Array; // oscillation phase per point
    maxH:      Float32Array; // maximum spike height per point
    count:     number;
  };
  arcs:  ArcData[];
  nodes: [number, number, number][];
}

// ── World layout ──────────────────────────────────────────────────────────────
// Nodes placed near the scroll-camera path so each is visible during the scroll.

const NODES: [number, number, number][] = [
  [ 15, 0,  45],  // 0 — Hero A
  [-18, 0,  35],  // 1 — Hero B
  [ 35, 0,  15],  // 2 — About
  [  5, 0,  -5],  // 3 — Projects A (ground-level immersion)
  [-28, 0, -15],  // 4 — Projects B
  [ 18, 0, -30],  // 5 — Skills
  [-15, 0, -50],  // 6 — Contact
  [  8, 0, -65],  // 7 — End
];

// Arc connections (quadratic beziers floating above the floor)
const ARC_PAIRS: [number, number][] = [
  [0, 1], [0, 2], [1, 3],
  [2, 3], [3, 4], [3, 5],
  [4, 6], [5, 6], [5, 7], [6, 7],
];

// ── Lab equipment shapes ──────────────────────────────────────────────────────
// Each function appends to a shared pos + brightness buffer and returns count.

function addFlask(
  pos:    Float32Array, bright: Float32Array,
  off:    number,
  cx:     number, cz: number,
  rng:    () => number,
  scale = 1.0
): number {
  let w = 0;
  const bR     = 5   * scale;
  const nR     = 1.4 * scale;
  const coneH  = 7   * scale;
  const neckH  = 9   * scale;

  const bv = (b: number) => { bright[off + w] = b; };

  // Bottom dome (hemisphere opening upward)
  for (let i = 0; i < 160; i++) {
    const cosT = rng();
    const sinT = Math.sqrt(1 - cosT * cosT);
    const phi  = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * sinT * bR;
    pos[(off + w) * 3 + 1] = bR * (1 - cosT);   // 0=bottom pole .. bR=equator
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * sinT * bR;
    bv(0.15 + rng() * 0.10); w++;
  }

  // Conical body (equator down to neck)
  for (let i = 0; i < 90; i++) {
    const t   = rng();
    const r   = bR * (1 - t) + nR * t;
    const y   = bR + t * coneH;
    const phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * r;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * r;
    bv(0.14 + rng() * 0.08); w++;
  }

  // Neck cylinder
  for (let i = 0; i < 80; i++) {
    const t   = rng();
    const y   = bR + coneH + t * neckH;
    const phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * nR;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * nR;
    bv(0.12 + rng() * 0.08); w++;
  }

  return w; // ~330
}

function addBeaker(
  pos:    Float32Array, bright: Float32Array,
  off:    number,
  cx:     number, cz: number,
  rng:    () => number,
  scale = 1.0
): number {
  let w = 0;
  const R = 4   * scale;
  const H = 9   * scale;

  // Cylinder walls
  for (let i = 0; i < 130; i++) {
    const t   = rng();
    const y   = t * H;
    const phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * R;
    pos[(off + w) * 3 + 1] = y;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * R;
    bright[off + w] = 0.16 + rng() * 0.08; w++;
  }

  // Bottom circle
  for (let i = 0; i < 45; i++) {
    const r   = Math.sqrt(rng()) * R;  // uniform disk sampling
    const phi = rng() * Math.PI * 2;
    pos[(off + w) * 3]     = cx + Math.cos(phi) * r;
    pos[(off + w) * 3 + 1] = 0;
    pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * r;
    bright[off + w] = 0.12 + rng() * 0.06; w++;
  }

  return w; // ~175
}

function addTestTubeRack(
  pos:    Float32Array, bright: Float32Array,
  off:    number,
  cx:     number, cz: number,
  rng:    () => number
): number {
  let w = 0;
  const TUBES   = 4;
  const SPACING = 4;
  const R       = 1.2;
  const H       = 13;

  for (let ti = 0; ti < TUBES; ti++) {
    const tx = cx + (ti - (TUBES - 1) / 2) * SPACING;

    for (let i = 0; i < 90; i++) {
      const t   = rng();
      const y   = 1 + t * H;
      const phi = rng() * Math.PI * 2;
      pos[(off + w) * 3]     = tx + Math.cos(phi) * R;
      pos[(off + w) * 3 + 1] = y;
      pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * R;
      bright[off + w] = 0.13 + rng() * 0.07; w++;
    }

    // Rounded bottom
    for (let i = 0; i < 30; i++) {
      const cosT = rng();
      const sinT = Math.sqrt(1 - cosT * cosT);
      const phi  = rng() * Math.PI * 2;
      pos[(off + w) * 3]     = tx + Math.cos(phi) * sinT * R;
      pos[(off + w) * 3 + 1] = 1 - cosT * R;    // inverted dome at bottom
      pos[(off + w) * 3 + 2] = cz + Math.sin(phi) * sinT * R;
      bright[off + w] = 0.11 + rng() * 0.06; w++;
    }
  }

  return w; // 4 × 120 = 480
}

// ── Circuit substrate (PCB floor) ─────────────────────────────────────────────

function addCircuitFloor(
  pos:    Float32Array,
  bright: Float32Array,
  off:    number,
  rng:    () => number,
  nodes:  [number, number, number][]
): number {
  let w = 0;
  const HALF     = 100;
  const GRID_GAP = 12;   // 12-unit grid spacing
  const PT_STEP  = 0.75;  // point every 0.75 units along grid line

  // Background routing grid (X-axis lines)
  for (let x = -HALF; x <= HALF; x += GRID_GAP) {
    for (let z = -HALF; z <= HALF; z += PT_STEP) {
      pos[(off + w) * 3]     = x + (rng() - 0.5) * 0.06;
      pos[(off + w) * 3 + 1] = 0;
      pos[(off + w) * 3 + 2] = z;
      bright[off + w] = 0.04 + rng() * 0.03; w++;
    }
  }
  // (Z-axis lines)
  for (let z = -HALF; z <= HALF; z += GRID_GAP) {
    for (let x = -HALF; x <= HALF; x += PT_STEP) {
      pos[(off + w) * 3]     = x;
      pos[(off + w) * 3 + 1] = 0;
      pos[(off + w) * 3 + 2] = z + (rng() - 0.5) * 0.06;
      bright[off + w] = 0.04 + rng() * 0.03; w++;
    }
  }

  // Manhattan traces between nearby node pairs
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [ax, , az] = nodes[i];
      const [bx, , bz] = nodes[j];
      const dist = Math.sqrt((bx - ax) ** 2 + (bz - az) ** 2);
      if (dist > 52) continue;

      const horizFirst = rng() < 0.5;
      const midX = horizFirst ? bx : ax;
      const midZ = horizFirst ? az : bz;

      const addSeg = (x1: number, z1: number, x2: number, z2: number) => {
        const len   = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const steps = Math.max(2, Math.floor(len / 0.28));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          pos[(off + w) * 3]     = x1 + t * (x2 - x1) + (rng() - 0.5) * 0.03;
          pos[(off + w) * 3 + 1] = 0;
          pos[(off + w) * 3 + 2] = z1 + t * (z2 - z1) + (rng() - 0.5) * 0.03;
          bright[off + w] = 0.18 + rng() * 0.10; w++;
        }
      };

      addSeg(ax, az, midX, midZ);
      addSeg(midX, midZ, bx, bz);
    }
  }

  // Circular pad rings at each node (component footprints)
  for (const [nx, , nz] of nodes) {
    for (let ring = 0; ring < 3; ring++) {
      const r   = 2.0 + ring * 1.2;
      const pts = Math.floor(r * 14);
      for (let i = 0; i < pts; i++) {
        const phi = (i / pts) * Math.PI * 2 + rng() * 0.08;
        pos[(off + w) * 3]     = nx + Math.cos(phi) * r + (rng() - 0.5) * 0.06;
        pos[(off + w) * 3 + 1] = 0;
        pos[(off + w) * 3 + 2] = nz + Math.sin(phi) * r + (rng() - 0.5) * 0.06;
        bright[off + w] = 0.22 + rng() * 0.12; w++;
      }
    }
  }

  return w;
}

// ── Fluid blobs ───────────────────────────────────────────────────────────────

function addFluidPool(
  pos:    Float32Array,
  phases: Float32Array,
  seeds:  Float32Array,
  off:    number,
  cx:     number, cz: number,
  radius: number,
  count:  number,
  rng:    () => number
): number {
  for (let i = 0; i < count; i++) {
    // Volume-fill ellipsoid: wide in XZ, flat in Y (fluid on a surface)
    const cosT = rng() * 2 - 1;
    const sinT = Math.sqrt(1 - cosT * cosT);
    const phi  = rng() * Math.PI * 2;
    const r    = Math.cbrt(rng()); // cube-root for uniform volume fill

    pos[(off + i) * 3]     = cx + Math.cos(phi) * sinT * r * radius * 1.5;
    pos[(off + i) * 3 + 1] = Math.abs(cosT) * r * radius * 0.85; // taller blob — visible from camera height
    pos[(off + i) * 3 + 2] = cz + Math.sin(phi) * sinT * r * radius * 1.5;

    phases[off + i] = rng() * Math.PI * 2;
    seeds[off + i]  = rng() * 50 + 10;
  }
  return count;
}

// ── Ferrofluid spikes ─────────────────────────────────────────────────────────

function addSpikeCluster(
  pos:    Float32Array,
  ts:     Float32Array,
  freqs:  Float32Array,
  phases: Float32Array,
  maxH:   Float32Array,
  off:    number,
  cx:     number, cz: number,
  rng:    () => number
): number {
  const GRID         = 7;  // 7 × 7 spike grid
  const SPACING      = 2.2;
  const PTS_PER_SPIKE = 9;
  let w = 0;

  for (let xi = 0; xi < GRID; xi++) {
    for (let zi = 0; zi < GRID; zi++) {
      const sx = cx + (xi - (GRID - 1) / 2) * SPACING + (rng() - 0.5) * 0.6;
      const sz = cz + (zi - (GRID - 1) / 2) * SPACING + (rng() - 0.5) * 0.6;

      const spFreq  = 0.5 + rng() * 1.3;
      const spPhase = rng() * Math.PI * 2;
      const spMax   = 2.5 + rng() * 7.0;  // 2.5–9.5 units tall

      for (let pi = 0; pi < PTS_PER_SPIKE; pi++) {
        const t = pi / (PTS_PER_SPIKE - 1);
        pos[(off + w) * 3]     = sx;
        pos[(off + w) * 3 + 1] = 0;   // base Y — shader animates upward
        pos[(off + w) * 3 + 2] = sz;
        ts[off + w]     = t;
        freqs[off + w]  = spFreq;
        phases[off + w] = spPhase;
        maxH[off + w]   = spMax;
        w++;
      }
    }
  }

  return w; // 7×7×9 = 441
}

// ── Field arcs ────────────────────────────────────────────────────────────────

function buildArc(
  a:   [number, number, number],
  b:   [number, number, number],
  rng: () => number
): ArcData {
  const COUNT = 180;
  const positions = new Float32Array(COUNT * 3);
  const ts        = new Float32Array(COUNT);
  const speed     = 0.25 + rng() * 0.35;
  const phase     = rng() * Math.PI * 2;
  const speeds    = new Float32Array(COUNT).fill(speed);
  const phases    = new Float32Array(COUNT).fill(phase);

  // Elevated midpoint — arc rises into view from camera's perspective
  const mx = (a[0] + b[0]) / 2 + (rng() - 0.5) * 8;
  const my = 8 + rng() * 14;  // lower than before — stays in view at y≈4 camera
  const mz = (a[2] + b[2]) / 2 + (rng() - 0.5) * 8;

  for (let i = 0; i < COUNT; i++) {
    const t  = i / (COUNT - 1);
    const mt = 1 - t;
    // Quadratic bezier
    positions[i * 3]     = mt * mt * a[0] + 2 * t * mt * mx + t * t * b[0];
    positions[i * 3 + 1] = mt * mt * a[1] + 2 * t * mt * my + t * t * b[1];
    positions[i * 3 + 2] = mt * mt * a[2] + 2 * t * mt * mz + t * t * b[2];
    ts[i] = t;
  }

  return { positions, ts, speeds, phases, count: COUNT };
}

// ── Public export ─────────────────────────────────────────────────────────────

export function buildV2World(seed = 42): V2World {
  const _perm = makePermutation(seed);  // available for future noise use
  const rng   = makeRng(seed + 2077);

  // Pre-allocation — sized to actual usage with small headroom
  const MAX_STRUCT = 22_000;
  const MAX_FLUID  = 26_000;
  const MAX_SPIKES =  4_000;

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

  // ── Circuit floor ──────────────────────────────────────────────────────
  strCount += addCircuitFloor(strPos, strBright, strCount, rng, NODES);

  // ── Equipment + fluid + spikes per node ───────────────────────────────
  type EType = "flask" | "beaker" | "rack";
  const ETYPES: EType[] = ["flask", "beaker", "flask", "rack", "beaker", "flask", "beaker", "rack"];
  const SPIKE_NODES = new Set([0, 1, 2, 3, 4, 5, 6]); // most nodes get spikes

  for (let ni = 0; ni < NODES.length; ni++) {
    const [nx, , nz] = NODES[ni];
    const scale = 0.90 + rng() * 0.70; // larger equipment — more visible at eye level
    const type  = ETYPES[ni];

    // Equipment silhouette
    if (type === "flask") {
      strCount += addFlask(strPos, strBright, strCount, nx, nz, rng, scale);
    } else if (type === "beaker") {
      strCount += addBeaker(strPos, strBright, strCount, nx, nz, rng, scale);
    } else {
      strCount += addTestTubeRack(strPos, strBright, strCount, nx, nz, rng);
    }

    // Dense fluid pool — primary visual element (8 pools × ~2000 avg = 16k < MAX_FLUID 26k)
    const poolR    = 4.5 + rng() * 4.0;
    const poolPts  = Math.floor(1600 + rng() * 800);
    flCount += addFluidPool(flPos, flPhases, flSeeds, flCount, nx, nz, poolR, poolPts, rng);

    // Ferrofluid spikes at most nodes
    if (SPIKE_NODES.has(ni)) {
      const offX = (rng() - 0.5) * 5;
      const offZ = (rng() - 0.5) * 5;
      spCount += addSpikeCluster(spPos, spTs, spFreqs, spPhases, spMaxH, spCount, nx + offX, nz + offZ, rng);
    }
  }

  // ── Field arcs ─────────────────────────────────────────────────────────
  const arcs: ArcData[] = ARC_PAIRS.map(([ai, bi]) => buildArc(NODES[ai], NODES[bi], rng));

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
    nodes: NODES,
  };
}
