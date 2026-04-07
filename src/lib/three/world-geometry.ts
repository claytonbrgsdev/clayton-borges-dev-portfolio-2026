// Procedural point cloud world geometry — LiDAR/sonar scan aesthetic
//
// Layers:
//   Terrain    — dense parallel scan lines, like real echosounding acquisition
//   Boulders   — 32 rounded hemispherical formations (not columns)
//   Coral      — iterative branching structures rising from terrain
//   Dust       — sparse ambient volume particles
//
// Total: ~750 k–850 k points depending on boulder sizes

import { makePermutation, makeRng, fbm, noise3 } from "./noise";

export interface WorldGeometry {
  positions: Float32Array;
  count: number;
}

const WORLD_HALF = 150;
const WORLD_SIZE = WORLD_HALF * 2;

// ── terrain height ─────────────────────────────────────────────────────────────
// Two fbm calls (4 + 2 octaves) — faster than the original three-call version,
// still gives convincing large-scale shape + surface crumple.

function terrainHeight(perm: Uint8Array, x: number, z: number): number {
  return (
    fbm(perm, x * 0.008,       0, z * 0.008,       4) * 18 +
    fbm(perm, x * 0.04 + 3.1,  0, z * 0.04 + 3.1,  2) *  3 +
    3
  );
}

// ── scan-line terrain ──────────────────────────────────────────────────────────
// 600 parallel sweeps × 850 samples each = 510 k points.
// Each sweep has a subtle beam-angle drift (noise-driven) that produces the
// characteristic "fish-bone" striations of real sonar acquisition.
// Per-return range noise (±0.07 m) simulates real sensor variance.

function addScanTerrain(
  pos: Float32Array,
  offset: number,
  perm: Uint8Array,
  rng: () => number
): number {
  const Z_LINES = 600;
  const X_PTS   = 850;
  let w = 0;

  for (let zi = 0; zi < Z_LINES; zi++) {
    const z = (zi / (Z_LINES - 1)) * WORLD_SIZE - WORLD_HALF;
    // Beam wander: slight angular drift per sweep line (very smooth noise)
    const angleDrift = noise3(perm, zi * 0.006, 77, 0) * 0.6;

    for (let xi = 0; xi < X_PTS; xi++) {
      const t = xi / (X_PTS - 1);
      const x = t * WORLD_SIZE - WORLD_HALF;
      // Apply drift at the edges of the sweep (zero at centre)
      const xd = x + angleDrift * (t - 0.5) * 0.5;

      const y = terrainHeight(perm, xd, z);
      // Range noise: real sonar has small random return-time variance
      const rn = (rng() - 0.5) * 0.14;

      pos[(offset + w) * 3]     = xd + (rng() - 0.5) * 0.05;
      pos[(offset + w) * 3 + 1] = y + rn;
      pos[(offset + w) * 3 + 2] = z; // Z is locked to scan line (no jitter)
      w++;
    }
  }

  return w; // exactly Z_LINES × X_PTS
}

// ── dome boulders ──────────────────────────────────────────────────────────────
// Replaces the original rock columns with rounded hemispherical formations —
// the dominant rock shape in real underwater terrain scans.
// Surface is deformed by Perlin noise to break geometric perfection.
// Uniform hemisphere sampling (cosine-weighted) avoids pole clustering.

function addDomeBoulders(
  pos: Float32Array,
  offset: number,
  perm: Uint8Array,
  rng: () => number
): number {
  const COUNT = 48;
  let w = 0;

  for (let bi = 0; bi < COUNT; bi++) {
    const cx     = (rng() - 0.5) * (WORLD_SIZE - 40);
    const cz     = (rng() - 0.5) * (WORLD_SIZE - 40);
    const baseY  = terrainHeight(perm, cx, cz);
    const radius = 2.5 + rng() * 17.5;            // 2.5–20 units (small to large)
    const flat   = 0.45 + rng() * 0.65;           // vertical compression
    const nSeed  = bi * 17.3;                      // noise space offset per boulder

    // Minimum 200 pts so even small rocks are visible; cap at 7 000
    const numPts = Math.min(Math.max(200, Math.floor(radius * radius * 22)), 7000);

    for (let pi = 0; pi < numPts; pi++) {
      // Cosine-weighted hemisphere: cosTheta uniform → uniform surface area
      const cosT = rng();                          // 0..1 (top=1, equator=0)
      const sinT = Math.sqrt(1 - cosT * cosT);
      const phi  = rng() * Math.PI * 2;

      const nx = Math.cos(phi) * sinT;
      const ny = cosT;
      const nz = Math.sin(phi) * sinT;

      // Perlin surface deformation (±22 %)
      const surf = 1 + 0.22 * noise3(perm, nx * 1.8 + nSeed, ny * 1.8, nz * 1.8);
      const r    = radius * surf;
      const rv   = (rng() - 0.5) * 0.18; // range noise

      pos[(offset + w) * 3]     = cx + nx * r        + rv;
      pos[(offset + w) * 3 + 1] = baseY + ny * radius * flat + rv * 0.4;
      pos[(offset + w) * 3 + 2] = cz + nz * r        + rv;
      w++;
    }
  }

  return w;
}

// ── coral structures ───────────────────────────────────────────────────────────
// Iterative stack branching (no recursion overflow).

interface Branch {
  x: number; y: number; z: number;
  dx: number; dy: number; dz: number;
  length: number;
  depth: number;
}

function addCoralStructures(
  pos: Float32Array,
  offset: number,
  perm: Uint8Array,
  rng: () => number
): number {
  const TREE_COUNT = 55;
  let w = 0;

  for (let ti = 0; ti < TREE_COUNT; ti++) {
    const rootX = (rng() - 0.5) * (WORLD_SIZE - 30);
    const rootZ = (rng() - 0.5) * (WORLD_SIZE - 30);
    const rootY = terrainHeight(perm, rootX, rootZ);

    const stack: Branch[] = [{
      x: rootX, y: rootY, z: rootZ,
      dx: (rng() - 0.5) * 0.4,
      dy: 1,
      dz: (rng() - 0.5) * 0.4,
      length: 3 + rng() * 5.5,
      depth: 0,
    }];

    while (stack.length > 0) {
      const b = stack.pop()!;
      if (b.depth > 4 || b.length < 0.25) continue;

      const mag = Math.sqrt(b.dx * b.dx + b.dy * b.dy + b.dz * b.dz);
      if (mag < 0.0001) continue;
      const ndx = b.dx / mag, ndy = b.dy / mag, ndz = b.dz / mag;

      const steps = Math.max(2, Math.floor(b.length * 10));
      for (let si = 0; si <= steps; si++) {
        const t = si / steps;
        pos[(offset + w) * 3]     = b.x + ndx * t * b.length;
        pos[(offset + w) * 3 + 1] = b.y + ndy * t * b.length;
        pos[(offset + w) * 3 + 2] = b.z + ndz * t * b.length;
        w++;
      }

      const ex = b.x + ndx * b.length;
      const ey = b.y + ndy * b.length;
      const ez = b.z + ndz * b.length;

      const numChildren = b.depth < 2 ? 3 : 2;
      const spread = 0.55 + b.depth * 0.22;
      for (let chi = 0; chi < numChildren; chi++) {
        stack.push({
          x: ex, y: ey, z: ez,
          dx: ndx + (rng() - 0.5) * spread,
          dy: Math.abs(ndy) * 0.85 + (rng() - 0.5) * 0.3 + 0.15,
          dz: ndz + (rng() - 0.5) * spread,
          length: b.length * (0.52 + rng() * 0.18),
          depth: b.depth + 1,
        });
      }
    }
  }

  return w;
}

// ── rubble fields ──────────────────────────────────────────────────────────────
// Dense clusters of small rocks scattered between the larger boulders.
// Each cluster is a tight group of tiny dome formations — fills gaps in the
// geological landscape with the kind of debris real sonar scans reveal.

function addRubbleFields(
  pos: Float32Array,
  offset: number,
  perm: Uint8Array,
  rng: () => number
): number {
  const CLUSTERS = 14;
  let w = 0;

  for (let ci = 0; ci < CLUSTERS; ci++) {
    const clx   = (rng() - 0.5) * (WORLD_SIZE - 50);
    const clz   = (rng() - 0.5) * (WORLD_SIZE - 50);
    const count = 8 + Math.floor(rng() * 14); // 8–21 tiny rocks per cluster

    for (let ri = 0; ri < count; ri++) {
      const cx     = clx + (rng() - 0.5) * 35;
      const cz     = clz + (rng() - 0.5) * 35;
      const baseY  = terrainHeight(perm, cx, cz);
      const radius = 1.2 + rng() * 2.8;                 // 1.2–4.0 units
      const flat   = 0.4 + rng() * 0.5;
      const numPts = Math.max(120, Math.floor(radius * radius * 28));
      const nSeed  = (ci * 19 + ri) * 11.3;

      for (let pi = 0; pi < numPts; pi++) {
        const cosT = rng();
        const sinT = Math.sqrt(1 - cosT * cosT);
        const phi  = rng() * Math.PI * 2;

        const nx = Math.cos(phi) * sinT;
        const ny = cosT;
        const nz = Math.sin(phi) * sinT;

        const surf = 1 + 0.18 * noise3(perm, nx * 2.2 + nSeed, ny * 2.2, nz * 2.2);
        const r    = radius * surf;
        const rv   = (rng() - 0.5) * 0.10;

        pos[(offset + w) * 3]     = cx + nx * r    + rv;
        pos[(offset + w) * 3 + 1] = baseY + ny * radius * flat + rv * 0.3;
        pos[(offset + w) * 3 + 2] = cz + nz * r    + rv;
        w++;
      }
    }
  }

  return w;
}

// ── public API ─────────────────────────────────────────────────────────────────

export function buildWorld(seed = 42): WorldGeometry {
  const perm = makePermutation(seed);
  const rng  = makeRng(seed + 1337);

  // Pre-allocate conservatively; slice to actual count at the end
  const MAX = 600 * 850 + 48 * 7200 + 55 * 2500 + 14 * 22 * 500;
  const pos  = new Float32Array(MAX * 3);
  let total  = 0;

  total += addScanTerrain(pos, total, perm, rng);      // ~510 k
  total += addDomeBoulders(pos, total, perm, rng);     // ~120–160 k
  total += addCoralStructures(pos, total, perm, rng);  // ~55–80 k
  total += addRubbleFields(pos, total, perm, rng);     // ~30–50 k

  return { positions: pos.slice(0, total * 3), count: total };
}
