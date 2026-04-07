// Energy layer geometry — the hidden system that governs the second order of reality.
//
// A regular icosahedron defines the invisible architecture:
//   12 nodes   → floating point clusters
//   30 edges   → oscilloscope traces (Lissajous figures in 3D)
//   vertical axis → ascending + descending energy currents
//
// The same structure appears at every scale. This is not metaphor; it is geometry.

import { makeRng } from "./noise";

// ─── Hidden architecture: regular icosahedron ─────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2; // golden ratio ≈ 1.618

// 12 vertices. All adjacent-pair distances = 2.0 (exact).
const UNIT: readonly [number, number, number][] = [
  [ 0,  1,  PHI], [ 0,  1, -PHI], [ 0, -1,  PHI], [ 0, -1, -PHI],
  [ 1,  PHI, 0 ], [ 1, -PHI, 0 ], [-1,  PHI, 0 ], [-1, -PHI, 0 ],
  [ PHI, 0,  1 ], [ PHI, 0, -1 ], [-PHI, 0,  1 ], [-PHI, 0, -1 ],
] as const;

// World transform — fit the icosahedron along the camera's scroll path.
// CX, CY, CZ = center. SX, SY, SZ = per-axis scale.
// Result: nodes span from near ground (Y≈2) to above terrain (Y≈28),
// and from Z=+35 (Hero) to Z=-55 (Contact), threading through the journey.
const CX = 0, CY = 15, CZ = -10;
const SX = 30, SY = 8, SZ = 28;

export const NODE_COUNT = UNIT.length; // always 12

export const NODES: [number, number, number][] = UNIT.map(
  ([x, y, z]) => [CX + x * SX, CY + y * SY, CZ + z * SZ]
);

// 30 icosahedron edges: pairs whose unit-space squared distance ≈ 4.0
export const EDGES: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let i = 0; i < UNIT.length; i++) {
    for (let j = i + 1; j < UNIT.length; j++) {
      const [ax, ay, az] = UNIT[i];
      const [bx, by, bz] = UNIT[j];
      if ((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2 < 4.05) {
        out.push([i, j]);
      }
    }
  }
  return out; // exactly 30
})();

// ─── Color mapping ─────────────────────────────────────────────────────────────
// Y position → warm gold at bottom → deep violet at mid → electric blue at top.
// Lower energy is denser and warmer. Higher energy is refined and cooler.

const nodeYs = NODES.map(n => n[1]);
const Y_MIN  = Math.min(...nodeYs);
const Y_MAX  = Math.max(...nodeYs);

export function nodeColor(i: number): [number, number, number] {
  const t = (NODES[i][1] - Y_MIN) / (Y_MAX - Y_MIN); // 0=bottom, 1=top
  if (t < 0.5) {
    const s = t * 2;
    // gold [1.0, 0.68, 0.08] → violet [0.45, 0.13, 0.85]
    return [1.0 - s * 0.55, 0.68 - s * 0.55, 0.08 + s * 0.77];
  }
  const s = (t - 0.5) * 2;
  // violet [0.45, 0.13, 0.85] → electric blue [0.15, 0.68, 1.0]
  return [0.45 - s * 0.30, 0.13 + s * 0.55, 0.85 + s * 0.15];
}

// ─── vec3 math (no Three.js dependency) ──────────────────────────────────────

type V3 = [number, number, number];
const vlen    = ([x, y, z]: V3) => Math.sqrt(x * x + y * y + z * z);
const vnorm   = (v: V3): V3    => { const l = vlen(v); return [v[0]/l, v[1]/l, v[2]/l]; };
const vcross  = ([ax,ay,az]: V3, [bx,by,bz]: V3): V3 =>
  [ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx];
const vabsdot = ([ax,ay,az]: V3, [bx,by,bz]: V3) =>
  Math.abs(ax*bx + ay*by + az*bz);

// ─── Cluster geometry ─────────────────────────────────────────────────────────

export interface ClusterGeometry {
  positions:     Float32Array; // xyz per point
  nodeCenters:   Float32Array; // xyz of hosting node, repeated per point
  colors:        Float32Array; // rgb per point (from nodeColor)
  breathFreqs:   Float32Array; // per-point breath frequency
  breathOffsets: Float32Array; // per-point breath phase offset
}

const CLUSTER_PTS = 280; // points per node

export function buildClusters(seed: number): ClusterGeometry {
  const rng   = makeRng(seed);
  const total = NODE_COUNT * CLUSTER_PTS;

  const positions     = new Float32Array(total * 3);
  const nodeCenters   = new Float32Array(total * 3);
  const colors        = new Float32Array(total * 3);
  const breathFreqs   = new Float32Array(total);
  const breathOffsets = new Float32Array(total);

  let idx = 0;
  for (let ni = 0; ni < NODE_COUNT; ni++) {
    const [cx, cy, cz] = NODES[ni];
    const col  = nodeColor(ni);
    const t    = (cy - Y_MIN) / (Y_MAX - Y_MIN);
    const radius = 2.6 - t * 1.1;   // denser+larger at bottom, refined at top
    const bFreq  = 0.35 + t * 0.55; // slower breath at bottom, faster at top

    for (let pi = 0; pi < CLUSTER_PTS; pi++) {
      // Uniform sphere fill via rejection + cube-root radius scaling
      let px: number, py: number, pz: number, r2: number;
      do {
        px = (rng() - 0.5) * 2;
        py = (rng() - 0.5) * 2;
        pz = (rng() - 0.5) * 2;
        r2 = px * px + py * py + pz * pz;
      } while (r2 > 1.0 || r2 < 1e-6);

      const r   = Math.sqrt(r2);
      const rad = Math.cbrt(rng()) * radius;

      positions[idx * 3]     = cx + (px / r) * rad;
      positions[idx * 3 + 1] = cy + (py / r) * rad;
      positions[idx * 3 + 2] = cz + (pz / r) * rad;

      nodeCenters[idx * 3]     = cx;
      nodeCenters[idx * 3 + 1] = cy;
      nodeCenters[idx * 3 + 2] = cz;

      colors[idx * 3]     = col[0];
      colors[idx * 3 + 1] = col[1];
      colors[idx * 3 + 2] = col[2];

      breathFreqs[idx]   = bFreq + (rng() - 0.5) * 0.14;
      breathOffsets[idx] = rng() * Math.PI * 2;
      idx++;
    }
  }

  return { positions, nodeCenters, colors, breathFreqs, breathOffsets };
}

// ─── Oscilloscope trace geometry ───────────────────────────────────────────────

export interface TraceEdgeData {
  positions: Float32Array; // base xyz per sample (unoscillated, along edge)
  normals:   Float32Array; // perpendicular frame N per sample
  binormals: Float32Array; // perpendicular frame B per sample
  ts:        Float32Array; // t parameter [0..1] along edge per sample
  freqsA:    Float32Array; // Lissajous freq A, repeated per sample
  freqsB:    Float32Array; // Lissajous freq B, repeated per sample
  phasesA:   Float32Array; // phase A, repeated per sample
  phasesB:   Float32Array; // phase B, repeated per sample
  harmonics: Float32Array; // harmonic turns, repeated per sample
  amps:      Float32Array; // oscillation amplitude, repeated per sample
  colorsA:   Float32Array; // start-node color, repeated per sample [S*3]
  colorsB:   Float32Array; // end-node color, repeated per sample [S*3]
}

const TRACE_SAMPLES = 80;

export function buildOscilloscopeTraces(seed: number): TraceEdgeData[] {
  const rng = makeRng(seed);
  const S   = TRACE_SAMPLES;
  const UP: V3 = [0, 1, 0];

  return EDGES.map(([ai, bi]) => {
    const [ax, ay, az] = NODES[ai];
    const [bx, by, bz] = NODES[bi];

    // Perpendicular frame (Frenet-like, avoiding gimbal at near-vertical edges)
    const tangent  = vnorm([bx - ax, by - ay, bz - az]);
    const ref: V3  = vabsdot(tangent, UP) > 0.9 ? [1, 0, 0] : UP;
    const normal   = vnorm(vcross(tangent, ref));
    const binormal = vcross(tangent, normal); // already unit length

    // Per-edge randomised Lissajous parameters
    const freqA    = 0.22 + rng() * 0.90;
    const freqB    = 0.38 + rng() * 0.75;
    const phaseA   = rng() * Math.PI * 2;
    const phaseB   = rng() * Math.PI * 2;
    const harmonic = 1 + Math.floor(rng() * 3);
    const amp      = 0.5 + rng() * 1.7;

    const colorA = nodeColor(ai);
    const colorB = nodeColor(bi);

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

// ─── Energy current geometry ──────────────────────────────────────────────────

export interface CurrentParticles {
  positions: Float32Array; // XZ spread positions (Y unused — computed in shader)
  offsets:   Float32Array; // 0..1 phase offset per particle
}

export function buildCurrentParticles(seed: number): {
  ascending:  CurrentParticles;
  descending: CurrentParticles;
} {
  const rng = makeRng(seed);

  const buildSet = (count: number, spread: number): CurrentParticles => {
    const positions = new Float32Array(count * 3);
    const offsets   = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Anchor particles near icosahedron nodes so currents flow along the
      // hidden structure, not uniformly across the world
      const ni = Math.floor(rng() * NODE_COUNT);
      const [nx, , nz] = NODES[ni];
      positions[i * 3]     = nx + (rng() - 0.5) * spread;
      positions[i * 3 + 1] = 0; // Y is animated in the vertex shader
      positions[i * 3 + 2] = nz + (rng() - 0.5) * spread;
      offsets[i] = rng();
    }
    return { positions, offsets };
  };

  return {
    ascending:  buildSet(2000,  10), // thin, fast, close to nodes
    descending: buildSet(1100,  22), // broad, slow, more diffuse
  };
}
