// Procedural point cloud world geometry — LiDAR/sonar scan aesthetic
//
// Layers:
//   Terrain    — dense parallel scan lines, like real echosounding acquisition
//   Formations — 4 types: flat slabs, domes, spires, debris rings (sparse, clean)
//   Coral      — iterative branching structures rising from terrain
//   Rubble     — small dense clusters scattered between formations
//
// Total: ~630 k–680 k points

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

// ── diverse floor formations ───────────────────────────────────────────────────
// Four distinct formation types to break visual monotony while preserving the
// LiDAR/sonar scan aesthetic. All share the same point-cloud substance.
//
//  Type 0 — flat slabs    (25 %): wide, low, layered plates — striated scan lines
//  Type 1 — dome boulders (40 %): classic rounded hemisphere, now sparser + cleaner
//  Type 2 — spires        (20 %): narrow tapered columns, 1–3 clustered together
//  Type 3 — debris ring   (15 %): thin scatter of fragments on the terrain surface
//
// Total: ~30–42 k points (was ~127 k — eliminates the "fuzz" from over-sampling)

function addDiverseFormations(
  pos: Float32Array,
  offset: number,
  perm: Uint8Array,
  rng: () => number
): number {
  const COUNT = 52;
  let w = 0;

  for (let bi = 0; bi < COUNT; bi++) {
    const cx    = (rng() - 0.5) * (WORLD_SIZE - 40);
    const cz    = (rng() - 0.5) * (WORLD_SIZE - 40);
    const baseY = terrainHeight(perm, cx, cz);
    const nSeed = bi * 13.7;

    // Weighted type selection
    const typeSel = rng();
    const type =
      typeSel < 0.25 ? 0 :   // slab
      typeSel < 0.65 ? 1 :   // dome
      typeSel < 0.85 ? 2 :   // spire
                       3;    // debris ring

    if (type === 0) {
      // ── Flat slab: wide, layered, low-profile ──────────────────────────
      const sW    = 6 + rng() * 18;    // half-width X
      const sD    = 5 + rng() * 14;    // half-depth Z
      const sH    = 0.6 + rng() * 2.2; // total height (very thin)
      const angle = rng() * Math.PI;
      const cosA  = Math.cos(angle), sinA = Math.sin(angle);
      const layers = 2 + Math.floor(rng() * 3); // 2–4 strata
      const nPts  = Math.max(100, Math.floor(sW * sD * 1.2));

      for (let pi = 0; pi < nPts; pi++) {
        const u  = (rng() - 0.5) * 2;
        const v  = (rng() - 0.5) * 2;
        const ly = Math.floor(rng() * layers) / Math.max(layers - 1, 1);
        const lx = u * sW;
        const lz = v * sD;
        // Rotate in XZ
        const rx = lx * cosA - lz * sinA;
        const rz = lx * sinA + lz * cosA;
        const edge = 1.0 - (u * u + v * v) * 0.3;
        const dn   = noise3(perm, u * 2.2 + nSeed, ly * 3.1, v * 2.2) * 0.22;
        pos[(offset + w) * 3]     = cx + rx + (rng() - 0.5) * 0.10;
        pos[(offset + w) * 3 + 1] = baseY + ly * sH * edge + dn + (rng() - 0.5) * 0.05;
        pos[(offset + w) * 3 + 2] = cz + rz + (rng() - 0.5) * 0.10;
        w++;
      }

    } else if (type === 1) {
      // ── Dome boulder: cleaner hemisphere, much sparser than before ─────
      // Point count reduced from radius²×22 to radius²×7 — eliminates fuzz
      const radius = 2.0 + rng() * 12.0;
      const flat   = 0.40 + rng() * 0.55;
      const nPts   = Math.min(Math.max(55, Math.floor(radius * radius * 7)), 1800);

      for (let pi = 0; pi < nPts; pi++) {
        const cosT = rng();
        const sinT = Math.sqrt(1 - cosT * cosT);
        const phi  = rng() * Math.PI * 2;
        const nx   = Math.cos(phi) * sinT;
        const ny   = cosT;
        const nz   = Math.sin(phi) * sinT;
        const surf = 1 + 0.18 * noise3(perm, nx * 2.0 + nSeed, ny * 2.0, nz * 2.0);
        const r    = radius * surf;
        const rv   = (rng() - 0.5) * 0.08;
        pos[(offset + w) * 3]     = cx + nx * r + rv;
        pos[(offset + w) * 3 + 1] = baseY + ny * radius * flat + rv * 0.3;
        pos[(offset + w) * 3 + 2] = cz + nz * r + rv;
        w++;
      }

    } else if (type === 2) {
      // ── Spires: 1–3 narrow tapered columns ────────────────────────────
      const nSpires = 1 + Math.floor(rng() * 3);
      for (let si = 0; si < nSpires; si++) {
        const ox     = (rng() - 0.5) * 8;
        const oz     = (rng() - 0.5) * 8;
        const scx    = cx + ox;
        const scz    = cz + oz;
        const sBaseY = terrainHeight(perm, scx, scz);
        const height = 4 + rng() * 16;
        const baseR  = 0.7 + rng() * 2.0;
        const nPts   = Math.max(45, Math.floor(height * 12));

        for (let pi = 0; pi < nPts; pi++) {
          const t   = rng();
          const r   = baseR * (1.0 - t * 0.88);
          const phi = rng() * Math.PI * 2;
          const dn  = noise3(perm, t * 3.1 + nSeed + si * 5, phi * 0.5, 0) * 0.20;
          const rv  = (rng() - 0.5) * 0.06;
          pos[(offset + w) * 3]     = scx + Math.cos(phi) * r * (1 + dn) + rv;
          pos[(offset + w) * 3 + 1] = sBaseY + t * height + rv * 0.4;
          pos[(offset + w) * 3 + 2] = scz + Math.sin(phi) * r * (1 + dn) + rv;
          w++;
        }
      }

    } else {
      // ── Debris ring: flat scatter of fragments on the terrain surface ──
      const ringR = 5 + rng() * 14;
      const nPts  = Math.max(40, Math.floor(ringR * ringR * 1.0));

      for (let pi = 0; pi < nPts; pi++) {
        const r   = ringR * (0.3 + Math.sqrt(rng()) * 0.7);
        const phi = rng() * Math.PI * 2;
        const dx  = Math.cos(phi) * r;
        const dz  = Math.sin(phi) * r;
        const dn  = noise3(perm, dx * 0.16 + nSeed, 0, dz * 0.16) * 0.35;
        pos[(offset + w) * 3]     = cx + dx + (rng() - 0.5) * 0.28;
        pos[(offset + w) * 3 + 1] = baseY + dn + rng() * 0.20;
        pos[(offset + w) * 3 + 2] = cz + dz + (rng() - 0.5) * 0.28;
        w++;
      }
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

// ── coral data for animated intro ─────────────────────────────────────────────
// Same branching algorithm as addCoralStructures but with per-point metadata
// for grow-reveal and individual oscillation.  Uses an independent RNG so it
// can be called without running terrain + boulder generation first.

export interface CoralData {
  positions:   Float32Array; // xyz
  coralId:     Float32Array; // 0..TREE_COUNT-1 — one sway phase per coral
  normalizedY: Float32Array; // 0=root, 1=global max tip — segment reveal order
  pointPhase:  Float32Array; // random [0,1] per point — micro-variation
  count:       number;
}

export function buildCorals(seed = 42): CoralData {
  const perm = makePermutation(seed);
  // Independent RNGs so this can be called without first consuming terrain/boulder entropy
  const rng  = makeRng(seed + 8191);
  const rng2 = makeRng(seed + 65537); // per-point phase + scatter

  const TREE_COUNT  = 55;
  const SCATTER     = 0.40; // fraction of branch pts that get a scatter companion

  const tmpPos: number[] = [];
  const tmpId:  number[] = [];
  const tmpOff: number[] = []; // raw y-offset from coral root
  const tmpPh:  number[] = [];

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
      const mag = Math.sqrt(b.dx*b.dx + b.dy*b.dy + b.dz*b.dz);
      if (mag < 0.0001) continue;
      const ndx = b.dx/mag, ndy = b.dy/mag, ndz = b.dz/mag;
      const steps = Math.max(2, Math.floor(b.length * 10));

      for (let si = 0; si <= steps; si++) {
        const t  = si / steps;
        const px = b.x + ndx * t * b.length;
        const py = b.y + ndy * t * b.length;
        const pz = b.z + ndz * t * b.length;
        const off = Math.max(0, py - rootY);

        tmpPos.push(px, py, pz);
        tmpId.push(ti); tmpOff.push(off); tmpPh.push(rng2());

        // Particle-cloud scatter companions — give the branches a denser feel
        if (rng2() < SCATTER) {
          tmpPos.push(
            px + (rng2()-0.5) * 0.44,
            py + (rng2()-0.5) * 0.28,
            pz + (rng2()-0.5) * 0.44,
          );
          tmpId.push(ti); tmpOff.push(off); tmpPh.push(rng2());
        }
      }

      const ex = b.x + ndx * b.length;
      const ey = b.y + ndy * b.length;
      const ez = b.z + ndz * b.length;
      const numChildren = b.depth < 2 ? 3 : 2;
      const spread = 0.55 + b.depth * 0.22;
      for (let chi = 0; chi < numChildren; chi++) {
        stack.push({
          x: ex, y: ey, z: ez,
          dx: ndx + (rng()-0.5) * spread,
          dy: Math.abs(ndy) * 0.85 + (rng()-0.5) * 0.3 + 0.15,
          dz: ndz + (rng()-0.5) * spread,
          length: b.length * (0.52 + rng()*0.18),
          depth: b.depth + 1,
        });
      }
    }
  }

  const count = tmpPos.length / 3;

  // Normalise y-offsets to [0, 1] across all corals — this drives the reveal order
  let maxOff = 0;
  for (let i = 0; i < count; i++) if (tmpOff[i] > maxOff) maxOff = tmpOff[i];
  const normalizedY = new Float32Array(count);
  for (let i = 0; i < count; i++) normalizedY[i] = maxOff > 0 ? tmpOff[i] / maxOff : 0;

  return {
    positions:   new Float32Array(tmpPos),
    coralId:     new Float32Array(tmpId),
    normalizedY,
    pointPhase:  new Float32Array(tmpPh),
    count,
  };
}

// ── public API ─────────────────────────────────────────────────────────────────

export function buildWorld(seed = 42): WorldGeometry {
  const perm = makePermutation(seed);
  const rng  = makeRng(seed + 1337);

  // Pre-allocate conservatively; slice to actual count at the end
  // Formations now ~30–42 k (was 120–160 k with old dome boulders)
  const MAX = 600 * 850 + 52 * 2200 + 55 * 2500 + 14 * 22 * 500;
  const pos  = new Float32Array(MAX * 3);
  let total  = 0;

  total += addScanTerrain(pos, total, perm, rng);         // ~510 k
  total += addDiverseFormations(pos, total, perm, rng);   // ~30–42 k
  total += addCoralStructures(pos, total, perm, rng);     // ~55–80 k
  total += addRubbleFields(pos, total, perm, rng);        // ~30–50 k

  return { positions: pos.slice(0, total * 3), count: total };
}
