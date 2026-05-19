// v3 World Geometry — Interference Field
//
// No vertical structures. The ground is a flat particle grid; all wave motion
// is computed in the vertex shader via 5-source circular wave interference.
// Three layers above create monochromatic whitish-blue depth.
//
// Layers:
//   Ground      — 32 k grid; Y animated by wave interference (GLSL)
//   Rocks       — dome boulder formations that ride the wave surface
//   Rifts       — glowing crack lines 0.8 u below the wave, revealed in troughs
//   Atmosphere  — 6 k drift particles in 4 height bands; correlated swirling
//   Coronas     — 6 slowly-rotating particle rings with travelling pulse
//   Strings     — Lissajous-oscillating lines connecting attractor nodes

import { makeRng } from "./noise";

// ── Public types ──────────────────────────────────────────────────────────────

export interface GroundData {
  positions: Float32Array; // X, 0, Z — shader computes Y each frame
  count:     number;
}

export interface RockData {
  positions:  Float32Array; // XZ = world position; Y = height above ground base
  brightness: Float32Array; // per-point (0 = dark base, 1 = bright apex)
  count:      number;
}

export interface RiftData {
  positions: Float32Array; // XZ spread; Y = 0 (shader computes wave Y – depth)
  count:     number;
}

export interface AtmosphereData {
  positions: Float32Array;
  phases:    Float32Array; // per-point oscillation seed (0–2π)
  speeds:    Float32Array; // per-point drift speed multiplier
  layers:    Float32Array; // 0–1 normalised height (0 = low, 1 = high)
  count:     number;
}

export interface CoronaData {
  positions: Float32Array; // XZ on circle, Y = ring height
  ids:       Float32Array; // ring index 0–5
  ts:        Float32Array; // 0–1 angle fraction around ring
  count:     number;
}

export interface StringData {
  positions: Float32Array;
  normals:   Float32Array;
  binormals: Float32Array;
  ts:        Float32Array;
  freqsA:    Float32Array;
  freqsB:    Float32Array;
  phasesA:   Float32Array;
  phasesB:   Float32Array;
  harmonics: Float32Array;
  amps:      Float32Array;
  colorsA:   Float32Array; // RGB at start node (monochromatic, Y-based)
  colorsB:   Float32Array; // RGB at end node
}

export interface V3World {
  ground:     GroundData;
  rocks:      RockData;
  rifts:      RiftData;
  atmosphere: AtmosphereData;
  coronas:    CoronaData;
  strings:    StringData[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type Vec3 = [number, number, number];

const vnorm = ([x, y, z]: Vec3): Vec3 => {
  const l = Math.sqrt(x * x + y * y + z * z);
  return [x / l, y / l, z / l];
};
const vcross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 =>
  [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
const vabsdot = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3) =>
  Math.abs(ax * bx + ay * by + az * bz);

// Height-based monochromatic color for string nodes:
// Y = 6 → steel blue; Y = 58 → near white
function stringNodeColor(y: number): Vec3 {
  const t = Math.max(0, Math.min(1, (y - 6) / 52));
  return [0.15 + t * 0.67, 0.45 + t * 0.49, 0.80 + t * 0.20];
}

// ── Ground grid ───────────────────────────────────────────────────────────────

function buildGround(rng: () => number): GroundData {
  const GX = 180, GZ = 180;
  const COUNT = GX * GZ;
  const pos = new Float32Array(COUNT * 3);
  let w = 0;
  for (let iz = 0; iz < GZ; iz++) {
    for (let ix = 0; ix < GX; ix++) {
      pos[w * 3]     = (ix / (GX - 1) - 0.5) * 150 + (rng() - 0.5) * 0.5;
      pos[w * 3 + 1] = 0; // shader computes worldY
      pos[w * 3 + 2] = (iz / (GZ - 1) - 0.5) * 150 + (rng() - 0.5) * 0.5;
      w++;
    }
  }
  return { positions: pos, count: COUNT };
}

// ── Dome boulder formations ───────────────────────────────────────────────────
// position.y encodes height above ground base (0 = base, positive = upward).
// Shader adds the local wave height so the entire boulder rides the surface.

function buildRocks(rng: () => number): RockData {
  const BOULDER_COUNT = 20;
  const MAX    = BOULDER_COUNT * 2200;
  const pos    = new Float32Array(MAX * 3);
  const bright = new Float32Array(MAX);
  let w = 0;

  for (let bi = 0; bi < BOULDER_COUNT; bi++) {
    // Scatter within ±52, minimum 10 u from world centre (camera target area)
    let cx: number, cz: number;
    do {
      cx = (rng() - 0.5) * 104;
      cz = (rng() - 0.5) * 104;
    } while (Math.sqrt(cx * cx + cz * cz) < 10);

    const radius = 2.0 + rng() * 5.5;       // 2–7.5 units
    const flat   = 0.42 + rng() * 0.58;     // vertical compression (0.42–1.0)
    const numPts = Math.min(
      Math.max(140, Math.floor(radius * radius * 18)),
      2200
    );

    for (let pi = 0; pi < numPts; pi++) {
      // Cosine-weighted hemisphere (top-biased sampling = more points at apex)
      const cosT = rng();                    // 0=equator, 1=apex
      const sinT = Math.sqrt(1 - cosT * cosT);
      const phi  = rng() * Math.PI * 2;
      // ±20 % surface deformation (no Perlin here — random is fine for particles)
      const surf = 1 + 0.20 * (rng() * 2 - 1);
      const r    = radius * surf;

      pos[w * 3]     = cx + Math.cos(phi) * sinT * r;
      pos[w * 3 + 1] = cosT * radius * flat;  // height above ground base (≥0)
      pos[w * 3 + 2] = cz + Math.sin(phi) * sinT * r;
      bright[w]       = 0.18 + cosT * 0.54;   // dark at base → bright at apex
      w++;
    }
  }

  return {
    positions:  pos.slice(0, w * 3),
    brightness: bright.slice(0, w),
    count:      w,
  };
}

// ── Rift / fissure lines ──────────────────────────────────────────────────────
// Each rift is a thin elongated strip at Y=0 (shader sinks it 0.8 u below wave).
// All points use their own XZ in the wave formula → the rift follows the surface.

function buildRifts(rng: () => number): RiftData {
  const RIFTS = [
    { x1: -42, z1: -12, x2:  18, z2:  14, w: 0.8, count: 420 },
    { x1:   6, z1:  32, x2: -22, z2: -28, w: 0.6, count: 360 },
    { x1:  28, z1: -42, x2:  54, z2:  18, w: 1.0, count: 400 },
    { x1: -54, z1:  18, x2: -10, z2:  38, w: 0.7, count: 340 },
    { x1:  -8, z1: -54, x2:  26, z2: -18, w: 0.9, count: 380 },
  ] as const;

  const MAX = RIFTS.reduce((s, r) => s + r.count, 0);
  const pos = new Float32Array(MAX * 3);
  let pw = 0;

  for (const rift of RIFTS) {
    const dx  = rift.x2 - rift.x1;
    const dz  = rift.z2 - rift.z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const tx = dx / len, tz = dz / len; // tangent
    const nx = -tz,      nz = tx;       // normal (perpendicular)

    for (let i = 0; i < rift.count; i++) {
      const t = rng();                       // 0–1 along rift
      const n = (rng() - 0.5) * rift.w;     // ±width/2 perpendicular
      pos[pw * 3]     = rift.x1 + t * dx + n * nx + (rng() - 0.5) * 0.15;
      pos[pw * 3 + 1] = 0;                   // shader computes worldY = wave – 0.8
      pos[pw * 3 + 2] = rift.z1 + t * dz + n * nz + (rng() - 0.5) * 0.15;
      pw++;
    }
  }

  return { positions: pos.slice(0, pw * 3), count: pw };
}

// ── Atmospheric drift — 4 height bands ───────────────────────────────────────

function buildAtmosphere(rng: () => number): AtmosphereData {
  const BANDS = [
    { yMin:  3, yMax: 12, count: 2200 },
    { yMin: 14, yMax: 26, count: 1800 },
    { yMin: 28, yMax: 42, count: 1200 },
    { yMin: 44, yMax: 68, count:  800 },
  ] as const;

  const COUNT  = BANDS.reduce((s, b) => s + b.count, 0);
  const pos    = new Float32Array(COUNT * 3);
  const phases = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const layers = new Float32Array(COUNT);
  let aw = 0;

  for (const band of BANDS) {
    for (let i = 0; i < band.count; i++) {
      const y = band.yMin + rng() * (band.yMax - band.yMin);
      pos[aw * 3]     = (rng() - 0.5) * 170;
      pos[aw * 3 + 1] = y;
      pos[aw * 3 + 2] = (rng() - 0.5) * 170;
      phases[aw]       = rng() * Math.PI * 2;
      speeds[aw]       = 0.25 + rng() * 0.85;
      layers[aw]       = (y - 3) / 65;
      aw++;
    }
  }

  return { positions: pos, phases, speeds, layers, count: COUNT };
}

// ── Orbital coronas — 6 horizontal rings ─────────────────────────────────────

function buildCoronas(rng: () => number): CoronaData {
  const RING_DEFS = [
    { r: 20, y:  7 },
    { r: 35, y: 15 },
    { r: 14, y: 24 },
    { r: 48, y: 33 },
    { r: 26, y: 42 },
    { r: 58, y: 55 },
  ] as const;

  const RING_PTS  = 260;
  const COR_COUNT = RING_DEFS.length * RING_PTS;
  const pos = new Float32Array(COR_COUNT * 3);
  const ids = new Float32Array(COR_COUNT);
  const ts  = new Float32Array(COR_COUNT);
  let cw = 0;

  for (let ri = 0; ri < RING_DEFS.length; ri++) {
    const { r, y } = RING_DEFS[ri];
    for (let pi = 0; pi < RING_PTS; pi++) {
      const angle  = (pi / RING_PTS) * Math.PI * 2;
      const jitter = (rng() - 0.5) * 1.2;
      pos[cw * 3]     = Math.cos(angle) * (r + jitter);
      pos[cw * 3 + 1] = y;
      pos[cw * 3 + 2] = Math.sin(angle) * (r + jitter);
      ids[cw]         = ri;
      ts[cw]          = pi / RING_PTS;
      cw++;
    }
  }

  return { positions: pos, ids, ts, count: COR_COUNT };
}

// ── Strings — Lissajous oscilloscope traces between attractor nodes ───────────
// 10 nodes span the 4 atmospheric layers; 15 edges connect them, threading
// the scene much like the icosahedron edges thread the energy layer in v1.

const STRING_NODES: Vec3[] = [
  [-18,  8,  12], // 0 — low layer
  [ 22, 10,  -8], // 1 — low layer
  [ -8, 20,  24], // 2 — mid layer
  [ 30, 18, -15], // 3 — mid layer
  [-25, 34,  -8], // 4 — upper layer
  [ 15, 32,  20], // 5 — upper layer
  [ -5, 50, -25], // 6 — high layer
  [ 28, 48,   5], // 7 — high layer
  [-32, 26,   8], // 8 — mid outer
  [ 10, 22, -35], // 9 — mid outer
];

const STRING_EDGES: [number, number][] = [
  [0, 2], [1, 3],   // low → mid (vertical)
  [2, 4], [3, 5],   // mid → upper
  [4, 6], [5, 7],   // upper → high
  [0, 8], [1, 9],   // low → outer
  [8, 4], [9, 5],   // outer → upper
  [2, 8], [3, 9],   // mid → outer (horizontal)
  [6, 7],           // high horizontal
  [0, 1],           // low horizontal
  [4, 5],           // upper horizontal
];

const STRING_SAMPLES = 80;

function buildStrings(rng: () => number): StringData[] {
  const UP: Vec3 = [0, 1, 0];

  return STRING_EDGES.map(([ai, bi]) => {
    const [ax, ay, az] = STRING_NODES[ai];
    const [bx, by, bz] = STRING_NODES[bi];

    const tangent   = vnorm([bx - ax, by - ay, bz - az]);
    const ref: Vec3 = vabsdot(tangent, UP) > 0.9 ? [1, 0, 0] : UP;
    const normal    = vnorm(vcross(tangent, ref));
    const binormal  = vcross(tangent, normal);

    const freqA    = 0.20 + rng() * 0.88;
    const freqB    = 0.35 + rng() * 0.72;
    const phaseA   = rng() * Math.PI * 2;
    const phaseB   = rng() * Math.PI * 2;
    const harmonic = 1 + Math.floor(rng() * 3);
    const amp      = 0.6 + rng() * 1.9;

    const colorA = stringNodeColor(ay);
    const colorB = stringNodeColor(by);

    const S         = STRING_SAMPLES;
    const positions = new Float32Array(S * 3);
    const normals   = new Float32Array(S * 3);
    const binormals = new Float32Array(S * 3);
    const ts        = new Float32Array(S);
    const freqsA    = new Float32Array(S);
    const freqsB    = new Float32Array(S);
    const phasesA   = new Float32Array(S);
    const phasesB   = new Float32Array(S);
    const harmonics = new Float32Array(S);
    const amps      = new Float32Array(S);
    const colorsA   = new Float32Array(S * 3);
    const colorsB   = new Float32Array(S * 3);

    for (let si = 0; si < S; si++) {
      const t = si / (S - 1);

      positions[si * 3]     = ax + (bx - ax) * t;
      positions[si * 3 + 1] = ay + (by - ay) * t;
      positions[si * 3 + 2] = az + (bz - az) * t;

      normals[si * 3]     = normal[0];
      normals[si * 3 + 1] = normal[1];
      normals[si * 3 + 2] = normal[2];

      binormals[si * 3]     = binormal[0];
      binormals[si * 3 + 1] = binormal[1];
      binormals[si * 3 + 2] = binormal[2];

      ts[si]        = t;
      freqsA[si]    = freqA;
      freqsB[si]    = freqB;
      phasesA[si]   = phaseA;
      phasesB[si]   = phaseB;
      harmonics[si] = harmonic;
      amps[si]      = amp;

      colorsA[si * 3]     = colorA[0];
      colorsA[si * 3 + 1] = colorA[1];
      colorsA[si * 3 + 2] = colorA[2];

      colorsB[si * 3]     = colorB[0];
      colorsB[si * 3 + 1] = colorB[1];
      colorsB[si * 3 + 2] = colorB[2];
    }

    return {
      positions, normals, binormals, ts,
      freqsA, freqsB, phasesA, phasesB, harmonics, amps,
      colorsA, colorsB,
    };
  });
}

// ── Public builder ────────────────────────────────────────────────────────────

export function buildV3World(seed = 42): V3World {
  const rng = makeRng(seed + 3141);
  return {
    ground:     buildGround(rng),
    rocks:      buildRocks(rng),
    rifts:      buildRifts(rng),
    atmosphere: buildAtmosphere(rng),
    coronas:    buildCoronas(rng),
    strings:    buildStrings(rng),
  };
}
