"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  buildIntroSequence,
  TRINITY_POS,
  type IntroController,
} from "@/lib/three/convergence-intro";

// ── GLSL: Glow nodes (shrinkable via uNodeScale) ─────────────────────────────
const GLOW_VERT = /* glsl */`
  uniform float uSize;
  uniform float uBrightness;
  uniform float uNodeScale;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uBrightness * uNodeScale;
    gl_Position  = projectionMatrix * mv;
  }
`;
const GLOW_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uBrightness;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float core = exp(-d * d * 26.0);
    float halo = exp(-d * d *  5.0) * 0.55;
    float a    = (core + halo) * uBrightness;
    if (a < 0.004) discard;
    vec3 col = mix(vec3(1.0, 0.97, 0.88), uColor, smoothstep(0.0, 0.28, d));
    gl_FragColor = vec4(col * (1.2 + core * 3.5), a);
  }
`;

// ── GLSL: Ring particles ──────────────────────────────────────────────────────
const RING_VERT = /* glsl */`
  attribute float aAngle;
  attribute float aPhase;
  uniform float uTime;
  uniform float uOmega;
  uniform float uRevealT;
  uniform float uR;
  uniform float uSize;
  uniform float uViewH;
  uniform float uPulseR;
  uniform float uPulseAmp;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    float a  = aAngle + uTime * uOmega;
    float r  = uR * (0.97 + 0.06 * sin(aPhase * 6.28318 + uTime * 0.22));
    float py = sin(aPhase * 12.566 + uTime * 0.30) * 1.2
             + sin(aPhase *  6.283 + uTime * 0.19) * 0.42;
    vec3 pos = vec3(r * cos(a), py, r * sin(a));
    float birth = fract(aPhase * 5.713);
    float raw   = clamp((uRevealT - birth * 0.35) / 0.65, 0.0, 1.0);
    float t     = raw < 0.5 ? 2.0*raw*raw : -1.0 + (4.0 - 2.0*raw)*raw;
    float base  = t * (0.38 + 0.62 * (0.5 + 0.5 * sin(aPhase * 6.28318 + uTime * 0.52)));
    float pDist = abs(uR - uPulseR);
    float pulse = uPulseAmp * exp(-pDist * pDist * 0.0028);
    vAlpha = clamp(base * (1.0 + pulse * 2.8), 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth  = -mv.z;
    gl_PointSize = clamp(uSize * uViewH / (vDepth * 0.90), 0.3, 4.5);
    gl_Position  = projectionMatrix * mv;
  }
`;
const RING_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.25, 0.50, d)) * vAlpha;
    a *= 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    if (a < 0.004) discard;
    float bright = 0.36 + 0.64 * exp(-d * d * 10.0);
    gl_FragColor = vec4(uColor * bright * 1.55, a * 0.82);
  }
`;

// ── GLSL: Ambient dust ────────────────────────────────────────────────────────
const DUST_VERT = /* glsl */`
  attribute float aR;
  attribute float aA;
  attribute float aH;
  attribute float aPhase;
  uniform float uTime;
  uniform float uSize;
  uniform float uViewH;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    float dir = sign(aPhase - 0.5);
    float r   = aR * (0.93 + 0.14 * sin(aPhase * 6.2832 + uTime * 0.07));
    float a   = aA + uTime * 0.003 * dir * (1.0 + 0.5 * aPhase);
    float h   = aH + sin(aPhase * 9.42 + uTime * 0.16) * 3.2;
    vec3  pos = vec3(r * cos(a), h, r * sin(a));
    float rFade = smoothstep(6.0, 20.0, r) * (1.0 - smoothstep(140.0, 162.0, r));
    vAlpha = (0.022 + 0.018 * sin(aPhase * 6.28 + uTime * 0.38)) * rFade;
    vec4 mv      = modelViewMatrix * vec4(pos, 1.0);
    vDepth       = -mv.z;
    gl_PointSize = clamp(uSize * 2.8 * uViewH / (vDepth * 0.85), 0.5, 8.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const DUST_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uFade;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.0, 0.5, d);
    float a    = soft * soft * vAlpha * uFade;
    a *= 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor * 1.3, a);
  }
`;

// ── GLSL: Forest (growth reveal + sway) ──────────────────────────────────────
const FOREST_VERT = /* glsl */`
  attribute float aNorm;
  attribute float aPhase;
  uniform float uGrowth;
  uniform float uTime;
  uniform float uSize;
  uniform float uViewH;
  varying float vAlpha;
  varying float vNorm;
  varying float vDepth;
  void main() {
    float edge   = uGrowth + 0.04;
    bool  hidden = aNorm > edge;
    float sw    = aNorm * aNorm * 0.30;
    float swayX = sin(aPhase * 6.28318 + uTime * 0.40) * sw;
    float swayZ = cos(aPhase * 4.71239 + uTime * 0.36) * sw * 0.72;
    vec3  pos   = hidden ? position : position + vec3(swayX, 0.0, swayZ);
    float dist  = uGrowth - aNorm;
    float flash = exp(-dist * dist * 900.0) * 2.8;
    float base  = 0.28 + 0.20 * sin(aPhase * 6.28318 + uTime * 0.65);
    vAlpha = hidden ? 0.0 : clamp(base + flash, 0.0, 1.0) * smoothstep(0.0, 0.05, aNorm);
    vNorm = aNorm;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth  = -mv.z;
    gl_PointSize = hidden ? 0.5 : clamp(uSize * uViewH / (vDepth * 0.9), 0.3, 5.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const FOREST_FRAG = /* glsl */`
  uniform vec3  uColorLow;
  uniform vec3  uColorHigh;
  uniform float uGrowth;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying float vNorm;
  varying float vDepth;
  void main() {
    if (vAlpha < 0.003) discard;
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float a  = (1.0 - smoothstep(0.15, 0.50, d)) * vAlpha;
    a *= 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    if (a < 0.003) discard;
    float dist    = uGrowth - vNorm;
    float flash   = exp(-dist * dist * 900.0);
    vec3  base    = mix(uColorLow, uColorHigh, vNorm * vNorm);
    vec3  col     = mix(base, vec3(0.72, 0.90, 0.55), flash * 0.75);
    gl_FragColor  = vec4(col * 1.5, a * 0.88);
  }
`;

// ── GLSL: Birds ───────────────────────────────────────────────────────────────
const BIRD_VERT = /* glsl */`
  uniform float uSize;
  uniform float uViewH;
  uniform float uAlpha;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    vAlpha = uAlpha;
    gl_PointSize = clamp(uSize * 2.0 * uViewH / (vDepth * 0.9), 0.5, 5.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const BIRD_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.2, 0.5, d)) * vAlpha;
    a *= 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * (0.8 + 0.5 * exp(-d*d*10.0)), a);
  }
`;

// ── GLSL: Ground creatures ────────────────────────────────────────────────────
const CREATURE_VERT = /* glsl */`
  uniform float uSize;
  uniform float uViewH;
  uniform float uAlpha;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    vAlpha = uAlpha;
    gl_PointSize = clamp(uSize * 1.6 * uViewH / (vDepth * 0.9), 0.5, 4.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const CREATURE_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.2, 0.5, d)) * vAlpha;
    a *= 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * (0.7 + 0.4 * exp(-d*d*8.0)), a * 0.8);
  }
`;

// ── Constants ─────────────────────────────────────────────────────────────────
interface RingDef { r: number; n: number; omega: number; revealStart: number; revealEnd: number; color: THREE.Color }
const RING_DEFS: RingDef[] = [
  { r:  20, n:  900, omega: +0.0030, revealStart:  0, revealEnd:  5, color: new THREE.Color(0xc8a040) },
  { r:  38, n: 1500, omega: -0.0022, revealStart:  4, revealEnd: 10, color: new THREE.Color(0xb89038) },
  { r:  60, n: 2100, omega: +0.0016, revealStart:  9, revealEnd: 16, color: new THREE.Color(0x9a8832) },
  { r:  87, n: 2800, omega: -0.0012, revealStart: 15, revealEnd: 23, color: new THREE.Color(0x8888a0) },
  { r: 118, n: 3500, omega: +0.0009, revealStart: 22, revealEnd: 31, color: new THREE.Color(0x7070b0) },
  { r: 154, n: 4200, omega: -0.0006, revealStart: 29, revealEnd: 39, color: new THREE.Color(0x5858a8) },
];
const ORBIT_R  = 165;
const ORBIT_H  = 115;
const FOG_NEAR = 120;
const FOG_FAR  = 1100;

// ── Forest geometry builder ───────────────────────────────────────────────────
interface BandDef { rMin: number; rMax: number; count: number; hMin: number; hMax: number; sMin: number; sMax: number }
interface ForestCfg {
  seed: number;
  bands: BandDef[];
  trunkR: number;
  branchN: [number, number];
  crownR: number;
  crownPts: number;
  foliageR: [number, number];
  bushCount: number;
  bushRMax: number;
}

function buildForestData(cfg: ForestCfg) {
  let s = cfg.seed;
  const rng = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };

  const MAX = 50000;
  const pos   = new Float32Array(MAX * 3);
  const aNorm = new Float32Array(MAX);
  const aPh   = new Float32Array(MAX);
  let w = 0;

  const pt = (x: number, y: number, z: number, n: number) => {
    if (w >= MAX) return;
    pos[w * 3] = x; pos[w * 3 + 1] = Math.max(0, y); pos[w * 3 + 2] = z;
    aNorm[w] = Math.max(0, Math.min(1, n)); aPh[w] = rng(); w++;
  };

  const sphere = (cx: number, cy: number, cz: number, r: number, n: number, maxH: number) => {
    for (let i = 0; i < n; i++) {
      const phi = rng() * Math.PI * 2;
      const u   = rng() * 2 - 1;
      const sr  = r * Math.pow(rng(), 0.42);
      const sv  = Math.sqrt(Math.max(0, 1 - u * u));
      const py  = cy + u * sr;
      pt(cx + sv * Math.cos(phi) * sr, py, cz + sv * Math.sin(phi) * sr, py / maxH);
    }
  };

  for (const { rMin, rMax, count, hMin, hMax, sMin, sMax } of cfg.bands) {
    for (let ti = 0; ti < count; ti++) {
      const angle = (ti / count) * Math.PI * 2 + rng() * (Math.PI / count);
      const r  = rMin + rng() * (rMax - rMin);
      const cx = Math.cos(angle) * r;
      const cz = Math.sin(angle) * r;
      const H  = hMin + rng() * (hMax - hMin);
      const S  = sMin + rng() * (sMax - sMin);
      const tH = H * 0.30;

      // Trunk
      for (let i = 0; i < 80; i++) {
        const y  = rng() * tH;
        const tr = S * cfg.trunkR * (1 - (y / tH) * 0.6);
        const a  = rng() * Math.PI * 2;
        pt(cx + Math.cos(a) * tr, y, cz + Math.sin(a) * tr, y / H);
      }

      // Branches
      const nB = cfg.branchN[0] + Math.floor(rng() * (cfg.branchN[1] - cfg.branchN[0] + 1));
      for (let b = 0; b < nB; b++) {
        const bA  = (b / nB) * Math.PI * 2 + rng() * 0.65;
        const bY0 = tH * (0.45 + rng() * 0.55);
        const bL  = H * (0.25 + rng() * 0.22);
        const dx  = Math.cos(bA) * (0.45 + rng() * 0.38);
        const dy  = 0.55 + rng() * 0.50;
        const dz  = Math.sin(bA) * (0.45 + rng() * 0.38);
        const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);

        for (let i = 0; i <= 22; i++) {
          const t  = i / 22;
          const bx = cx + (dx / mag) * bL * t;
          const by = bY0 + (dy / mag) * bL * t;
          const bz = cz + (dz / mag) * bL * t;
          const br = S * 0.036 * (1 - t * 0.65);
          const ba = rng() * Math.PI * 2;
          pt(bx + Math.cos(ba) * br, by, bz + Math.sin(ba) * br, by / H);
        }

        const tipX = cx + (dx / mag) * bL;
        const tipY = bY0 + (dy / mag) * bL;
        const tipZ = cz + (dz / mag) * bL;
        sphere(tipX, tipY, tipZ, S * (cfg.foliageR[0] + rng() * (cfg.foliageR[1] - cfg.foliageR[0])), 60, H);

        if (rng() < 0.48) {
          const sa = bA + (rng() - 0.5) * 1.3;
          const sl = bL * 0.38;
          const sdx = Math.cos(sa) * 0.55, sdy = 0.78, sdz = Math.sin(sa) * 0.55;
          const sm  = Math.sqrt(sdx * sdx + sdy * sdy + sdz * sdz);
          sphere(tipX + (sdx / sm) * sl, tipY + (sdy / sm) * sl, tipZ + (sdz / sm) * sl, S * 0.28, 28, H);
        }
      }

      sphere(cx, H * 0.78, cz, S * cfg.crownR, cfg.crownPts, H);
    }
  }

  for (let bi = 0; bi < cfg.bushCount; bi++) {
    const a  = rng() * Math.PI * 2;
    const r  = 10 + rng() * cfg.bushRMax;
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    const bH = 0.6 + rng() * 2.6, bS = 0.8 + rng() * 2.0;
    sphere(cx, bH * 0.45, cz, bS, 55, bH);
  }

  return { positions: pos.slice(0, w * 3), aNorm: aNorm.slice(0, w), aPhase: aPh.slice(0, w), count: w };
}

// Three forest species configs
const FOREST_LAYERS = [
  // 1. Tall conifers — blue-green, narrow
  {
    cfg: { seed: 0x12a34bc5,
      bands: [
        { rMin: 28, rMax: 52, count: 10, hMin: 14, hMax: 26, sMin: 0.9, sMax: 1.5 },
        { rMin: 58, rMax: 85, count: 13, hMin: 18, hMax: 34, sMin: 1.1, sMax: 1.8 },
        { rMin: 90, rMax:122, count: 10, hMin: 20, hMax: 40, sMin: 1.3, sMax: 2.2 },
        { rMin:125, rMax:150, count:  7, hMin: 22, hMax: 45, sMin: 1.5, sMax: 2.6 },
      ],
      trunkR: 0.040, branchN: [10, 14] as [number,number],
      crownR: 0.50, crownPts: 60, foliageR: [0.28, 0.45] as [number,number],
      bushCount: 0, bushRMax: 0,
    } as ForestCfg,
    colorLow:  new THREE.Color(0x091520),
    colorHigh: new THREE.Color(0x1a4a65),
  },
  // 2. Deciduous — broad crowns, medium green
  {
    cfg: { seed: 0xabcdef12,
      bands: [
        { rMin: 22, rMax: 45, count:  8, hMin:  6, hMax: 13, sMin: 2.0, sMax: 3.2 },
        { rMin: 50, rMax: 75, count: 11, hMin:  8, hMax: 16, sMin: 2.5, sMax: 4.0 },
        { rMin: 80, rMax:112, count:  9, hMin: 10, hMax: 20, sMin: 3.0, sMax: 5.0 },
        { rMin:115, rMax:148, count:  7, hMin: 12, hMax: 22, sMin: 3.5, sMax: 6.0 },
      ],
      trunkR: 0.060, branchN: [5, 9] as [number,number],
      crownR: 1.10, crownPts: 200, foliageR: [0.55, 0.95] as [number,number],
      bushCount: 60, bushRMax: 148,
    } as ForestCfg,
    colorLow:  new THREE.Color(0x0c1a0e),
    colorHigh: new THREE.Color(0x2a5835),
  },
  // 3. Undergrowth — short, bushy, warm olive
  {
    cfg: { seed: 0x99887766,
      bands: [
        { rMin: 16, rMax: 55, count: 16, hMin: 2, hMax:  6, sMin: 1.6, sMax: 3.0 },
        { rMin: 60, rMax: 95, count: 18, hMin: 3, hMax:  8, sMin: 2.0, sMax: 3.5 },
        { rMin:100, rMax:148, count: 14, hMin: 3, hMax:  9, sMin: 2.2, sMax: 4.0 },
      ],
      trunkR: 0.080, branchN: [3, 6] as [number,number],
      crownR: 1.30, crownPts: 100, foliageR: [0.60, 1.10] as [number,number],
      bushCount: 90, bushRMax: 148,
    } as ForestCfg,
    colorLow:  new THREE.Color(0x181208),
    colorHigh: new THREE.Color(0x3d3a14),
  },
] as const;

// ── Birds ─────────────────────────────────────────────────────────────────────
const N_BIRDS   = 12;
const BIRD_PTS  = 10; // 2 body + 4 left wing + 4 right wing

function updateBirds(pos: Float32Array, t: number) {
  for (let b = 0; b < N_BIRDS; b++) {
    const ph  = (b / N_BIRDS) * Math.PI * 2;
    const spd = 0.050 + (b % 5) * 0.013;
    const r   = 32 + (b % 6) * 14;
    const alt = 22 + Math.sin(t * 0.11 + ph * 1.3) * 8 + (b % 4) * 6;
    const ang = t * spd + ph;
    const cx  = Math.cos(ang) * r;
    const cz  = Math.sin(ang) * r;
    const fx  = -Math.sin(ang);   // forward
    const fz  =  Math.cos(ang);
    const lx  = -fz;              // left perp
    const lz  =  fx;
    const flp = Math.sin(t * 2.8 + ph) * 2.8;

    const pts: [number, number, number][] = [
      [cx - fx * 1.0, alt,       cz - fz * 1.0],
      [cx + fx * 1.0, alt + 0.3, cz + fz * 1.0],
      [cx + lx * 1.2, alt + flp * 0.25, cz + lz * 1.2],
      [cx + lx * 2.6, alt + flp * 0.55, cz + lz * 2.6],
      [cx + lx * 3.9, alt + flp * 0.82, cz + lz * 3.9],
      [cx + lx * 4.9, alt + flp * 1.05, cz + lz * 4.9],
      [cx - lx * 1.2, alt + flp * 0.25, cz - lz * 1.2],
      [cx - lx * 2.6, alt + flp * 0.55, cz - lz * 2.6],
      [cx - lx * 3.9, alt + flp * 0.82, cz - lz * 3.9],
      [cx - lx * 4.9, alt + flp * 1.05, cz - lz * 4.9],
    ];
    for (let p = 0; p < BIRD_PTS; p++) {
      const i = (b * BIRD_PTS + p) * 3;
      pos[i] = pts[p][0]; pos[i + 1] = pts[p][1]; pos[i + 2] = pts[p][2];
    }
  }
}

// ── Ground creatures ──────────────────────────────────────────────────────────
const N_CREATURES    = 6;
const CREATURE_PTS   = 14; // 4 body + 2 head + 4 legs × 2 pts

function updateCreatures(pos: Float32Array, t: number) {
  for (let c = 0; c < N_CREATURES; c++) {
    const ph  = (c / N_CREATURES) * Math.PI * 2;
    const spd = 0.016 + c * 0.005;
    const r   = 50 + c * 16;
    const ang = t * spd + ph;
    const cx  = Math.cos(ang) * r;
    const cz  = Math.sin(ang) * r;
    const dir = ang + Math.PI * 0.5;
    const fx  = Math.cos(dir), fz = Math.sin(dir);
    const sx  = -fz,           sz  = fx;
    const h   = 0.9;
    const g   = Math.sin(t * 2.2 + ph);

    const pts: [number, number, number][] = [
      [cx - fx * 1.4, h,       cz - fz * 1.4],
      [cx - fx * 0.5, h,       cz - fz * 0.5],
      [cx + fx * 0.5, h,       cz + fz * 0.5],
      [cx + fx * 1.4, h,       cz + fz * 1.4],
      [cx + fx * 2.0, h + 0.5, cz + fz * 2.0],
      [cx + fx * 2.5, h + 0.3, cz + fz * 2.5],
      [cx - fx * 0.9 + sx * 0.6, h - 0.4 + Math.max(0,  g) * 0.5, cz - fz * 0.9 + sz * 0.6],
      [cx - fx * 0.9 + sx * 0.6, Math.max(0, h - 0.9 + Math.max(0,  g) * 0.5), cz - fz * 0.9 + sz * 0.6],
      [cx - fx * 0.9 - sx * 0.6, h - 0.4 + Math.max(0, -g) * 0.5, cz - fz * 0.9 - sz * 0.6],
      [cx - fx * 0.9 - sx * 0.6, Math.max(0, h - 0.9 + Math.max(0, -g) * 0.5), cz - fz * 0.9 - sz * 0.6],
      [cx + fx * 0.5 + sx * 0.6, h - 0.4 + Math.max(0, -g) * 0.5, cz + fz * 0.5 + sz * 0.6],
      [cx + fx * 0.5 + sx * 0.6, Math.max(0, h - 0.9 + Math.max(0, -g) * 0.5), cz + fz * 0.5 + sz * 0.6],
      [cx + fx * 0.5 - sx * 0.6, h - 0.4 + Math.max(0,  g) * 0.5, cz + fz * 0.5 - sz * 0.6],
      [cx + fx * 0.5 - sx * 0.6, Math.max(0, h - 0.9 + Math.max(0,  g) * 0.5), cz + fz * 0.5 - sz * 0.6],
    ];
    for (let p = 0; p < CREATURE_PTS; p++) {
      const i = (c * CREATURE_PTS + p) * 3;
      pos[i] = pts[p][0]; pos[i + 1] = pts[p][1]; pos[i + 2] = pts[p][2];
    }
  }
}

// ── Scene builder ─────────────────────────────────────────────────────────────
function buildMandalaScene(scene: THREE.Scene) {
  const allMats: THREE.Material[]       = [];
  const allGeos: THREE.BufferGeometry[] = [];
  const allObjs: THREE.Object3D[]       = [];
  let sceneT = 0, ringT = 0, viewH = 600, nodeScale = 1.0;

  const track = (o: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material) => {
    allObjs.push(o); allGeos.push(g); allMats.push(m); scene.add(o);
  };

  const gold = new THREE.Color(0xd4a840);

  // Trinity glow nodes (indices 0-2)
  for (const p of TRINITY_POS) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([p.x, p.y, p.z]), 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
      uniforms: {
        uSize:       { value: 68 },
        uBrightness: { value: 0  },
        uNodeScale:  { value: 1  },
        uColor:      { value: gold.clone() },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    track(pts, geo, mat);
  }

  // Triangle filament
  const triGeo = new THREE.BufferGeometry();
  triGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
    ...TRINITY_POS[0].toArray(), ...TRINITY_POS[1].toArray(),
    ...TRINITY_POS[2].toArray(), ...TRINITY_POS[0].toArray(),
  ]), 3));
  const triMat = new THREE.LineBasicMaterial({
    color: gold, opacity: 0.07, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const triLine = new THREE.Line(triGeo, triMat);
  triLine.frustumCulled = false;
  allMats.push(triMat); allGeos.push(triGeo); allObjs.push(triLine); scene.add(triLine);

  // Ring outlines
  for (const ring of RING_DEFS) {
    const N = 180;
    const pts = new Float32Array((N + 1) * 3);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      pts[i * 3] = ring.r * Math.cos(a); pts[i * 3 + 1] = 0.15; pts[i * 3 + 2] = ring.r * Math.sin(a);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({
      color: ring.color, opacity: 0.04, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    allMats.push(mat); allGeos.push(geo); allObjs.push(line); scene.add(line);
  }

  // Ring particle systems
  const ringMats: THREE.ShaderMaterial[] = [];
  for (const ring of RING_DEFS) {
    const N = ring.n;
    const angles = new Float32Array(N);
    const phases = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      angles[i] = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      phases[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("aAngle",   new THREE.BufferAttribute(angles, 1));
    geo.setAttribute("aPhase",   new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader: RING_VERT, fragmentShader: RING_FRAG,
      uniforms: {
        uTime: { value: 0 }, uOmega: { value: ring.omega }, uRevealT: { value: 0 },
        uR: { value: ring.r }, uSize: { value: 1.0 }, uViewH: { value: 600 },
        uColor: { value: ring.color.clone() },
        uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
        uPulseR: { value: -999 }, uPulseAmp: { value: 0 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    ringMats.push(mat);
    track(pts, geo, mat);
  }

  // Nebula dust
  const nebulaMats: THREE.ShaderMaterial[] = [];
  const NEBULA_LAYERS = [
    { n: 2800, color: new THREE.Color(0x9a7028), rMax: 148 },
    { n: 2200, color: new THREE.Color(0x304260), rMax: 162 },
  ] as const;
  for (const nl of NEBULA_LAYERS) {
    const N = nl.n;
    const aR = new Float32Array(N), aA = new Float32Array(N);
    const aH = new Float32Array(N), aPhase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      aR[i] = 8 + Math.pow(Math.random(), 0.65) * (nl.rMax - 8);
      aA[i] = Math.random() * Math.PI * 2;
      aH[i] = -4 + Math.pow(Math.random(), 1.4) * 22;
      aPhase[i] = Math.random();
    }
    const ngeo = new THREE.BufferGeometry();
    ngeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    ngeo.setAttribute("aR",     new THREE.BufferAttribute(aR,     1));
    ngeo.setAttribute("aA",     new THREE.BufferAttribute(aA,     1));
    ngeo.setAttribute("aH",     new THREE.BufferAttribute(aH,     1));
    ngeo.setAttribute("aPhase", new THREE.BufferAttribute(aPhase, 1));
    const nmat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
      uniforms: {
        uTime: { value: 0 }, uFade: { value: 0 }, uSize: { value: 1.0 }, uViewH: { value: 600 },
        uColor: { value: nl.color.clone() }, uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const npts = new THREE.Points(ngeo, nmat);
    npts.frustumCulled = false;
    nebulaMats.push(nmat);
    track(npts, ngeo, nmat);
  }

  // Forest — 3 species
  const forestMats: THREE.ShaderMaterial[] = [];
  for (const layer of FOREST_LAYERS) {
    const fd = buildForestData(layer.cfg);
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute("position", new THREE.BufferAttribute(fd.positions, 3));
    fgeo.setAttribute("aNorm",    new THREE.BufferAttribute(fd.aNorm,     1));
    fgeo.setAttribute("aPhase",   new THREE.BufferAttribute(fd.aPhase,    1));
    const fmat = new THREE.ShaderMaterial({
      vertexShader: FOREST_VERT, fragmentShader: FOREST_FRAG,
      uniforms: {
        uGrowth:    { value: 0   },
        uTime:      { value: 0   },
        uSize:      { value: 1.0 },
        uViewH:     { value: 600 },
        uColorLow:  { value: layer.colorLow.clone()  },
        uColorHigh: { value: layer.colorHigh.clone() },
        uFogNear:   { value: FOG_NEAR },
        uFogFar:    { value: FOG_FAR  },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const fpts = new THREE.Points(fgeo, fmat);
    fpts.frustumCulled = false;
    forestMats.push(fmat);
    track(fpts, fgeo, fmat);
  }

  // Birds
  const birdPos = new Float32Array(N_BIRDS * BIRD_PTS * 3);
  updateBirds(birdPos, 0);
  const birdGeo = new THREE.BufferGeometry();
  birdGeo.setAttribute("position", new THREE.BufferAttribute(birdPos, 3));
  const birdMat = new THREE.ShaderMaterial({
    vertexShader: BIRD_VERT, fragmentShader: BIRD_FRAG,
    uniforms: {
      uSize: { value: 1.0 }, uViewH: { value: 600 }, uAlpha: { value: 0 },
      uColor: { value: new THREE.Color(0xb0c8e0) },
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const birdPts = new THREE.Points(birdGeo, birdMat);
  birdPts.frustumCulled = false;
  allMats.push(birdMat); allGeos.push(birdGeo); allObjs.push(birdPts); scene.add(birdPts);

  // Creatures
  const creaturePos = new Float32Array(N_CREATURES * CREATURE_PTS * 3);
  updateCreatures(creaturePos, 0);
  const creatureGeo = new THREE.BufferGeometry();
  creatureGeo.setAttribute("position", new THREE.BufferAttribute(creaturePos, 3));
  const creatureMat = new THREE.ShaderMaterial({
    vertexShader: CREATURE_VERT, fragmentShader: CREATURE_FRAG,
    uniforms: {
      uSize: { value: 1.0 }, uViewH: { value: 600 }, uAlpha: { value: 0 },
      uColor: { value: new THREE.Color(0x80b060) },
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const creaturePts = new THREE.Points(creatureGeo, creatureMat);
  creaturePts.frustumCulled = false;
  allMats.push(creatureMat); allGeos.push(creatureGeo); allObjs.push(creaturePts); scene.add(creaturePts);

  return {
    setViewH(h: number) {
      viewH = h;
      ringMats.forEach(m    => { m.uniforms.uViewH.value = h; });
      nebulaMats.forEach(m  => { m.uniforms.uViewH.value = h; });
      forestMats.forEach(m  => { m.uniforms.uViewH.value = h; });
      birdMat.uniforms.uViewH.value     = h;
      creatureMat.uniforms.uViewH.value = h;
    },

    setPulse(pulseR: number, pulseAmp: number) {
      ringMats.forEach(m => { m.uniforms.uPulseR.value = pulseR; m.uniforms.uPulseAmp.value = pulseAmp; });
    },

    setForestGrowth(g: number) {
      forestMats.forEach(m => { m.uniforms.uGrowth.value = g; });
    },

    setNodeFade(fade: number) {
      nodeScale = 1 - fade;
    },

    update(dt: number, scrollV: number) {
      sceneT += Math.min(dt, 0.05);

      // Trinity nodes — pulse then shrink with scroll
      const baseB = Math.min(1, sceneT / 3) * nodeScale;
      for (let i = 0; i < 3; i++) {
        const m = allMats[i] as THREE.ShaderMaterial;
        if (m.uniforms?.uBrightness) {
          m.uniforms.uBrightness.value = baseB * (0.82 + 0.18 * Math.sin(sceneT * 2.1));
          m.uniforms.uNodeScale.value  = nodeScale;
        }
      }
      // Filament fades with nodes
      triMat.opacity = 0.07 * nodeScale;

      // Rings — accelerate on scroll velocity
      const spin = 1.0 + Math.min(1, Math.abs(scrollV) / 18) * 3.5;
      ringT += Math.min(dt, 0.05) * spin;
      for (let i = 0; i < RING_DEFS.length; i++) {
        const def = RING_DEFS[i], mat = ringMats[i];
        const span = def.revealEnd - def.revealStart;
        const raw  = Math.max(0, Math.min(1, (sceneT - def.revealStart) / span));
        mat.uniforms.uRevealT.value = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
        mat.uniforms.uTime.value    = ringT;
        mat.uniforms.uViewH.value   = viewH;
      }

      // Nebula
      const nebFade = sceneT < 12 ? sceneT / 12 : 1;
      for (const m of nebulaMats) {
        m.uniforms.uTime.value  = sceneT;
        m.uniforms.uViewH.value = viewH;
        m.uniforms.uFade.value  = nebFade;
      }

      // Forest time
      forestMats.forEach(m => { m.uniforms.uTime.value = sceneT; m.uniforms.uViewH.value = viewH; });

      // Birds
      updateBirds(birdPos, sceneT);
      (birdGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      const birdAlpha = Math.min(1, Math.max(0, (sceneT - 5) / 10)) * 0.65;
      birdMat.uniforms.uAlpha.value   = birdAlpha;
      birdMat.uniforms.uViewH.value   = viewH;

      // Creatures
      updateCreatures(creaturePos, sceneT);
      (creatureGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      const crAlpha = Math.min(1, Math.max(0, (sceneT - 8) / 12)) * 0.55;
      creatureMat.uniforms.uAlpha.value   = crAlpha;
      creatureMat.uniforms.uViewH.value   = viewH;
    },

    dispose() {
      allObjs.forEach(o => scene.remove(o));
      allGeos.forEach(g => g.dispose());
      allMats.forEach(m => m.dispose());
    },
  };
}

// ── Camera path ───────────────────────────────────────────────────────────────
const SCROLL_VH = 600;

interface CamWP { p: number; pos: THREE.Vector3; tgt: THREE.Vector3 }
const CAM_WPS: CamWP[] = [
  { p: 0.00, pos: new THREE.Vector3(   0, ORBIT_H, ORBIT_R), tgt: new THREE.Vector3(  0,  0,  0) },
  { p: 0.20, pos: new THREE.Vector3(  62,      10,     108 ), tgt: new THREE.Vector3(  0, 20,  0) },
  { p: 0.34, pos: new THREE.Vector3( -28,       7,      82 ), tgt: new THREE.Vector3(  0, 24,  0) },
  { p: 0.50, pos: new THREE.Vector3(-115,      16,     132 ), tgt: new THREE.Vector3(  0, 10,  0) },
  { p: 0.65, pos: new THREE.Vector3(  40,       9,      90 ), tgt: new THREE.Vector3(  0, 14,  0) },
  { p: 0.80, pos: new THREE.Vector3( 128,      30,      98 ), tgt: new THREE.Vector3(  0,  8,  0) },
  { p: 1.00, pos: new THREE.Vector3(   0,      88,     145 ), tgt: new THREE.Vector3(  0,  0,  0) },
];

function camAtP(p: number) {
  let lo = CAM_WPS[0], hi = CAM_WPS[CAM_WPS.length - 1];
  for (let i = 0; i < CAM_WPS.length - 1; i++) {
    if (p >= CAM_WPS[i].p && p < CAM_WPS[i + 1].p) { lo = CAM_WPS[i]; hi = CAM_WPS[i + 1]; break; }
  }
  const seg = hi.p - lo.p;
  const raw = seg > 0 ? (p - lo.p) / seg : 1;
  const t   = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
  return {
    pos: new THREE.Vector3().lerpVectors(lo.pos, hi.pos, t),
    tgt: new THREE.Vector3().lerpVectors(lo.tgt, hi.tgt, t),
  };
}

function secVis(p: number, s: number, e: number, fi = 0.04, fo = 0.05): number {
  return Math.max(0, Math.min(1, Math.min((p - s) / fi, (e - p) / fo)));
}
function eio(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

// ── Portfolio data ────────────────────────────────────────────────────────────
const ACCENT = "#c8a040";

interface ProjectEntry {
  title: string; year: string; desc: string;
  tags: readonly string[]; href?: string; github?: string;
}

const PROJECTS: ProjectEntry[] = [
  {
    title: "MzPrime 3D", year: "2025",
    desc: "3D car cover showroom with live customization. One rigged GLB per vehicle category (12+ types); Three.js applies fabric color, sewing line color, and customer-uploaded logo to the model in real time. Zero pre-rendered composites.",
    tags: ["Three.js", "GLB", "Next.js", "TypeScript"],
    href: "https://claytonbrgsdev.github.io/product-showcase-v2/",
  },
  {
    title: "Moveo Filmes", year: "2024",
    desc: "Scroll-animated site for a film production company. Full catalog, Instagram feed integration, TipTap CMS, dnd-kit drag ordering, admin panel, and Supabase RLS auth. GSAP ScrollTrigger-driven UX throughout.",
    tags: ["Next.js 16", "GSAP", "Supabase", "TipTap"],
  },
  {
    title: "Metanova Labs", year: "2025",
    desc: "Dashboard for Bittensor subnet 68 — an on-chain AI drug-discovery network. Implemented the Algorithms tab frontend/backend integration. Tracks molecular competitions, miner leaderboards, and protein data across epochs.",
    tags: ["Next.js 15", "Bittensor", "TypeScript", "Radix UI"],
    href: "https://metanovalabs.ai/dashboard",
  },
  {
    title: "DSRPTV Records", year: "2023",
    desc: "Music e-commerce and streaming platform. Stripe + Mercado Pago dual checkout, Spotify API, AWS S3 asset storage, Three.js visuals. Built with Raphael Palmer (DISCLAYMER).",
    tags: ["React", "Three.js", "Stripe", "Firebase"],
    href: "http://dsrptvrec.com",
  },
  {
    title: "Novo Rio", year: "2025",
    desc: "Gamified agroforestry simulation funded by a FAC Brazilian Art & Culture grant, developed at the intersection of performing arts and technology.",
    tags: ["FastAPI", "Next.js", "PostgreSQL", "Docker"],
    github: "https://github.com/claytonbrgsdev/novo-rio",
  },
  {
    title: "Habitos", year: "2025",
    desc: "Full-stack habit and therapy tracking app for patient/therapist pairs. Built for ADHD support, then adapted and open-sourced.",
    tags: ["Next.js 16", "Prisma", "PostgreSQL", "Tailwind v4"],
    github: "https://github.com/claytonbrgsdev/habitos",
  },
  {
    title: "Slack Translator", year: "2025",
    desc: "Real-time PT↔EN Slack message translation via WebSocket + AI, built in Ruby. Job interview challenge — sole candidate to deliver on time.",
    tags: ["Ruby", "WebSocket", "OpenAI API"],
    github: "https://github.com/claytonbrgsdev/slack-translator_websocket-version",
  },
  {
    title: "Medication Tracker", year: "2025",
    desc: "3D spiral timeline for ADHD medication cycle tracking with scheduled reminders.",
    tags: ["Next.js", "Three.js", "TypeScript"],
    href: "https://claytonbrgsdev.github.io/medication-cycles-tracker/",
    github: "https://github.com/claytonbrgsdev/medication-cycles-tracker",
  },
  {
    title: "REACTO", year: "2025",
    desc: "Web audio-visual experiments with tweakable real-time parameters. Canvas and 3D scenes driven by live audio analysis.",
    tags: ["React", "Three.js", "Web Audio API"],
    href: "https://claytonbrgsdev.github.io/reacto/",
    github: "https://github.com/claytonbrgsdev/reacto",
  },
  {
    title: "ASA Player", year: "2025",
    desc: "Retro-styled web music player with a real-time ASCII spectrum analyzer on Web Audio API.",
    tags: ["Next.js", "Web Audio API", "TypeScript"],
    href: "https://claytonbrgsdev.github.io/aacs-player/",
    github: "https://github.com/claytonbrgsdev/aacs-player",
  },
  {
    title: "SPECtations", year: "2025",
    desc: "macOS desktop app for real-time audio waveform and spectrogram visualization.",
    tags: ["Python", "PySide6", "Audio DSP"],
    github: "https://github.com/claytonbrgsdev/SPECtations",
  },
  {
    title: "estock-control", year: "2025",
    desc: "Inventory management system with full CRUD, filtering, and reporting.",
    tags: ["React", "TypeScript", "Vite"],
    github: "https://github.com/estock-dev/estock-control",
  },
];

const SKILL_GROUPS = [
  { label: "Frontend",     skills: ["React 19", "Next.js 16", "TypeScript", "Three.js", "GSAP", "Tailwind"] },
  { label: "Backend",      skills: ["Node.js", "FastAPI", "Python", "Ruby", "REST / GraphQL", "WebSocket"] },
  { label: "Data & Cloud", skills: ["PostgreSQL", "Prisma", "Supabase", "Redis", "Docker", "AWS S3"] },
  { label: "Creative",     skills: ["Web Audio API", "React Three Fiber", "PySide6", "FFmpeg", "OpenAI"] },
] as const;

// ── UI panels ─────────────────────────────────────────────────────────────────
function Rule({ n, label, vis }: { n: string; label: string; vis: number }) {
  return (
    <div className="flex items-center gap-3 mb-8" style={{
      opacity:   Math.min(1, vis * 3),
      transform: `translateX(${(1 - Math.min(1, vis * 3)) * -12}px)`,
    }}>
      <span className="font-mono text-[11px] font-bold tracking-[0.22em]" style={{ color: `${ACCENT}80` }}>{n}</span>
      <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
      <span className="font-mono text-[10px] tracking-[0.28em] text-white/25 uppercase">{label}</span>
    </div>
  );
}

function HeroPanel({ vis }: { vis: number }) {
  const op  = eio(Math.min(1, vis));
  const ty  = (1 - op) * 22;
  const glo = `0 0 ${100 * op}px rgba(200,160,64,${0.32 * op}), 0 0 ${240 * op}px rgba(200,160,64,${0.10 * op})`;
  return (
    <div className="fixed inset-0 flex flex-col justify-end pb-14 z-10 pointer-events-none"
         style={{ opacity: op, transform: `translateY(${ty}px)` }}>
      {/* Top meta row */}
      <div className="absolute top-8 left-[5vw] flex items-center gap-5">
        <span className="font-mono text-[10px] font-bold tracking-[0.38em] uppercase"
              style={{ color: `${ACCENT}70` }}>Creative / Full-Stack Developer</span>
        <span className="w-8 h-px" style={{ background: `${ACCENT}35` }} />
        <span className="font-mono text-[10px] tracking-[0.22em]"
              style={{ color: "rgba(255,255,255,0.22)" }}>Brasília · Open to Relocation</span>
      </div>

      {/* Massive name */}
      <div className="pointer-events-auto pl-[2.5vw]">
        <h1 className="font-black text-white uppercase select-none"
            style={{
              fontSize:      "clamp(108px, 21vw, 290px)",
              letterSpacing: "-0.04em",
              lineHeight:    "0.84",
              textShadow:    glo,
            }}>
          CLAY<br />TON<br />
          <span style={{ color: `${ACCENT}` }}>BOR<br />GES</span>
        </h1>

        <div className="flex items-center gap-5 mt-10 ml-1 flex-wrap">
          <a href="#projects"
             className="font-mono text-[11px] font-bold px-7 py-3 tracking-widest pointer-events-auto transition-colors"
             style={{ border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.58)" }}
             onMouseEnter={e => { const el = e.target as HTMLElement; el.style.borderColor="rgba(255,255,255,0.55)"; el.style.color="#fff"; }}
             onMouseLeave={e => { const el = e.target as HTMLElement; el.style.borderColor="rgba(255,255,255,0.20)"; el.style.color="rgba(255,255,255,0.58)"; }}>
            VIEW WORK
          </a>
          <a href="mailto:claytonborgesdev@gmail.com"
             className="font-mono text-[11px] font-bold px-7 py-3 tracking-widest pointer-events-auto transition-colors"
             style={{ border: `1px solid ${ACCENT}40`, color: `${ACCENT}70` }}
             onMouseEnter={e => { const el = e.target as HTMLElement; el.style.borderColor=`${ACCENT}90`; el.style.color=ACCENT; }}
             onMouseLeave={e => { const el = e.target as HTMLElement; el.style.borderColor=`${ACCENT}40`; el.style.color=`${ACCENT}70`; }}>
            GET IN TOUCH
          </a>
          <span className="font-mono text-[11px] tracking-widest" style={{ color: "rgba(255,255,255,0.20)" }}>
            React&nbsp;·&nbsp;Next.js&nbsp;·&nbsp;Three.js&nbsp;·&nbsp;Python&nbsp;·&nbsp;Ruby
          </span>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 right-[5vw] flex flex-col items-center gap-2 pointer-events-none"
           style={{ opacity: Math.max(0, 1 - vis * 5) }}>
        <span className="font-mono text-[9px] font-bold tracking-[0.38em] uppercase"
              style={{ color: "rgba(255,255,255,0.18)" }}>scroll</span>
        <span className="block w-px h-9 animate-pulse" style={{ background: "rgba(255,255,255,0.12)" }} />
      </div>
    </div>
  );
}

function AboutPanel({ vis }: { vis: number }) {
  const op = eio(Math.min(1, vis));
  const tx = (1 - op) * -36;
  const glo = `0 0 80px rgba(200,160,64,${0.28 * op})`;
  return (
    <div className="fixed inset-0 flex items-center z-10 pointer-events-none"
         style={{ opacity: op, transform: `translateX(${tx}px)` }}>
      <div className="pointer-events-auto ml-[5vw] max-w-[520px]">
        <Rule n="01" label="About" vis={vis} />
        <h2 className="font-black text-white uppercase leading-[0.86]"
            style={{ fontSize: "clamp(72px,10vw,130px)", letterSpacing: "-0.035em", textShadow: glo }}>
          3 YEARS.<br />
          <span style={{ color: ACCENT }}>SHIPPED.</span>
        </h2>
        <p className="text-[14px] leading-relaxed mt-8" style={{ color: "rgba(255,255,255,0.50)" }}>
          3 years building production web apps, interactive 3D experiences, and creative developer tools
          for clients in Brazil and worldwide.
          Based in Brasília — open to relocation and remote work.
        </p>
        <p className="text-[14px] leading-relaxed mt-4" style={{ color: "rgba(255,255,255,0.34)" }}>
          Comfortable from GLSL shaders and Web Audio pipelines down to PostgreSQL schemas,
          Docker deploys, and REST APIs. Freelance through DISCLAYMER, a studio co-run with Raphael Palmer.
        </p>
        <div className="mt-9 flex flex-col gap-2.5">
          {[
            { co: "Evolut Digital", role: "Freelance Dev",  yr: "2025" },
            { co: "Moveo Filmes",   role: "Freelance Dev",  yr: "2024" },
            { co: "DSRPTV Records", role: "Full-Stack Dev", yr: "2023" },
          ].map(({ co, role, yr }, i) => (
            <div key={co} className="flex items-center gap-3 font-mono text-[11px]"
                 style={{ opacity: Math.min(1, vis * 3 - i * 0.5) }}>
              <span className="font-bold" style={{ color: `${ACCENT}60` }}>{yr}</span>
              <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span style={{ color: "rgba(255,255,255,0.36)" }}>{role}</span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>@</span>
              <span className="font-bold" style={{ color: "rgba(255,255,255,0.62)" }}>{co}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsPanel({ vis }: { vis: number }) {
  const op = eio(Math.min(1, vis));
  const tx = (1 - op) * 36;
  const glo = `0 0 80px rgba(200,160,64,${0.25 * op})`;
  return (
    <div className="fixed inset-0 flex items-center justify-end z-10 pointer-events-none"
         style={{ opacity: op, transform: `translateX(${tx}px)` }}>
      <div className="pointer-events-auto mr-[5vw] max-w-[480px]">
        <Rule n="02" label="Tech Stack" vis={vis} />
        <h2 className="font-black text-white uppercase leading-[0.86] mb-10"
            style={{ fontSize: "clamp(72px,10vw,130px)", letterSpacing: "-0.035em", textShadow: glo }}>
          WHAT<br />I USE<br />
          <span style={{ color: ACCENT }}>TO BUILD.</span>
        </h2>
        <div className="grid grid-cols-2 gap-x-10 gap-y-7">
          {SKILL_GROUPS.map(({ label, skills }, gi) => (
            <div key={label} style={{ opacity: Math.min(1, vis * 2.5 - gi * 0.3) }}>
              <p className="font-mono text-[9px] font-black tracking-[0.28em] uppercase mb-3"
                 style={{ color: `${ACCENT}70` }}>{label}</p>
              <ul className="flex flex-col gap-1.5">
                {skills.map(sk => (
                  <li key={sk} className="font-mono text-[12px] font-semibold"
                      style={{ color: "rgba(255,255,255,0.46)" }}>{sk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsPanel({ vis }: { vis: number }) {
  const op = eio(Math.min(1, vis));
  const ty = (1 - op) * 28;
  const glo = `0 0 80px rgba(200,160,64,${0.22 * op})`;
  return (
    <div className="fixed inset-0 flex flex-col z-10 pointer-events-none pt-8 px-[4vw] pb-6"
         style={{ opacity: op, transform: `translateY(${ty}px)` }}>
      <div className="pointer-events-auto w-full max-w-5xl mx-auto flex flex-col" style={{ height: "100%" }} id="projects">
        <Rule n="03" label="Selected Work" vis={vis} />
        <h2 className="font-black text-white uppercase leading-[0.88] mb-6 flex-shrink-0"
            style={{ fontSize: "clamp(52px,7vw,96px)", letterSpacing: "-0.035em", textShadow: glo }}>
          12 PROJECTS.<br />
          <span style={{ color: ACCENT }}>ALL REAL.</span>
        </h2>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pb-2">
            {PROJECTS.map((proj, i) => (
              <div key={proj.title} className="p-4"
                   style={{
                     border:         "1px solid rgba(255,255,255,0.07)",
                     background:     "rgba(0,0,0,0.55)",
                     backdropFilter:       "blur(6px)",
                     WebkitBackdropFilter: "blur(6px)",
                     opacity:              Math.min(1, vis * 3.5 - i * 0.22),
                     transform:      `translateY(${(1 - Math.min(1, vis * 3.5 - i * 0.22)) * 12}px)`,
                   }}>
                <div className="flex justify-between items-start mb-2.5">
                  <span className="font-mono text-[11px] font-black text-white/85 tracking-wide uppercase leading-tight">
                    {proj.title}
                  </span>
                  <span className="font-mono text-[9px] font-bold ml-2 flex-shrink-0"
                        style={{ color: `${ACCENT}50` }}>{proj.year}</span>
                </div>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {proj.desc}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {proj.tags.map(tag => (
                    <span key={tag} className="font-mono text-[8px] font-bold tracking-wide px-1.5 py-0.5"
                          style={{ border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.28)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  {proj.href && (
                    <a href={proj.href} target="_blank" rel="noopener noreferrer"
                       className="font-mono text-[10px] font-bold tracking-wider pointer-events-auto"
                       style={{ color: `${ACCENT}55` }}
                       onMouseEnter={e => { (e.target as HTMLElement).style.color = ACCENT; }}
                       onMouseLeave={e => { (e.target as HTMLElement).style.color = `${ACCENT}55`; }}>
                      LIVE ↗
                    </a>
                  )}
                  {proj.github && (
                    <a href={proj.github} target="_blank" rel="noopener noreferrer"
                       className="font-mono text-[10px] font-bold tracking-wider pointer-events-auto"
                       style={{ color: "rgba(255,255,255,0.25)" }}
                       onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
                       onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.25)"; }}>
                      CODE ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPanel({ vis }: { vis: number }) {
  const op = eio(Math.min(1, vis));
  const ty = (1 - op) * 22;
  const glo = `0 0 100px rgba(200,160,64,${0.35 * op}), 0 0 260px rgba(200,160,64,${0.12 * op})`;
  return (
    <div className="fixed inset-0 flex flex-col justify-end pb-16 z-10 pointer-events-none"
         style={{ opacity: op, transform: `translateY(${ty}px)` }}>
      <div className="pointer-events-auto pl-[3vw]">
        <Rule n="04" label="Contact" vis={vis} />
        <h2 className="font-black text-white uppercase leading-[0.84]"
            style={{ fontSize: "clamp(100px,18vw,240px)", letterSpacing: "-0.04em", textShadow: glo }}>
          LET'S<br />
          <span style={{ color: ACCENT }}>WORK.</span>
        </h2>
        <p className="font-mono text-[11px] font-semibold tracking-[0.14em] mt-8 ml-1"
           style={{ color: "rgba(255,255,255,0.28)" }}>
          Available for freelance, remote roles, and relocation.
        </p>
        <div className="flex items-center gap-7 mt-5 ml-1 flex-wrap">
          <a href="mailto:claytonborgesdev@gmail.com"
             className="font-mono text-[12px] font-bold tracking-wide pointer-events-auto pb-0.5"
             style={{ color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.14)" }}
             onMouseEnter={e => { const el = e.target as HTMLElement; el.style.color="#fff"; el.style.borderBottomColor="rgba(255,255,255,0.45)"; }}
             onMouseLeave={e => { const el = e.target as HTMLElement; el.style.color="rgba(255,255,255,0.55)"; el.style.borderBottomColor="rgba(255,255,255,0.14)"; }}>
            claytonborgesdev@gmail.com
          </a>
          {[
            { label: "GITHUB",    href: "https://github.com/claytonbrgsdev" },
            { label: "LINKEDIN",  href: "https://www.linkedin.com/in/clayton-borges-web-dev/" },
            { label: "INSTAGRAM", href: "https://instagram.com/azulbic_" },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
               className="font-mono text-[9px] font-black tracking-widest pointer-events-auto"
               style={{ color: "rgba(255,255,255,0.22)" }}
               onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
               onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.22)"; }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Intro ─────────────────────────────────────────────────────────────────────
const INTRO_TEXT = "loading the first dot...";
type IntroPhase = "typing" | "collapsing" | "intro" | "touring";

// ── Main component ────────────────────────────────────────────────────────────
export function ConvergenceLab() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [introPhase, setIntroPhase] = useState<IntroPhase>("typing");
  const [typedCount, setTypedCount] = useState(0);
  const [cursorOn,   setCursorOn]   = useState(true);
  const introPhaseRef = useRef<IntroPhase>("typing");
  useEffect(() => { introPhaseRef.current = introPhase; }, [introPhase]);

  const scrollRef     = useRef({ p: 0, v: 0 });
  const [scrollP, setScrollP] = useState(0);

  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const introRef      = useRef<IntroController | null>(null);
  const sceneRef      = useRef<ReturnType<typeof buildMandalaScene> | null>(null);
  const rafRef        = useRef(0);
  const camRef        = useRef<THREE.PerspectiveCamera | null>(null);
  const camTgtRef     = useRef(new THREE.Vector3());
  const driftARef     = useRef(0);
  const forestGrowRef = useRef(0);
  const pulseRef      = useRef({ t: 999 });
  const prevSecRef    = useRef(-1);

  // Typewriter
  useEffect(() => {
    if (introPhase !== "typing") return;
    if (typedCount >= INTRO_TEXT.length) {
      const id = setTimeout(() => setIntroPhase("collapsing"), 400);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setTypedCount(c => c + 1), 40);
    return () => clearTimeout(id);
  }, [typedCount, introPhase]);

  useEffect(() => {
    if (introPhase !== "typing") return;
    const id = setInterval(() => setCursorOn(v => !v), 520);
    return () => clearInterval(id);
  }, [introPhase]);

  useEffect(() => {
    if (introPhase !== "collapsing") return;
    const id = setTimeout(() => { introPhaseRef.current = "intro"; setIntroPhase("intro"); }, 500);
    return () => clearTimeout(id);
  }, [introPhase]);

  // Scroll lock
  useEffect(() => {
    document.documentElement.style.overflow = introPhase === "touring" ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [introPhase]);

  // Scroll listener
  useEffect(() => {
    if (introPhase !== "touring") return;
    let prevP = 0;
    const onScroll = () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const p      = totalH > 0 ? window.scrollY / totalH : 0;
      scrollRef.current = { p, v: p - prevP };
      prevP = p;
      setScrollP(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [introPhase]);

  // Three.js
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 1);
    renderer.domElement.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const threeScene = new THREE.Scene();
    const camera     = new THREE.PerspectiveCamera(65, 1, 0.1, 1200);
    camera.position.set(0, 20, 35);
    camera.lookAt(0, 0, 0);
    camRef.current    = camera;
    camTgtRef.current.set(0, ORBIT_H, ORBIT_R);

    const intro = buildIntroSequence(threeScene, () => {
      const mandala = buildMandalaScene(threeScene);
      sceneRef.current = mandala;
      introPhaseRef.current = "touring";
      setIntroPhase("touring");
    });
    introRef.current = intro;

    const syncSize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sceneRef.current?.setViewH(h);
    };
    syncSize();

    let prevT = 0;
    const animate = (ts: number) => {
      rafRef.current = requestAnimationFrame(animate);
      const t  = ts / 1000;
      const dt = Math.min(t - prevT, 0.05);
      prevT = t;

      const phase        = introPhaseRef.current;
      const { p: sp, v: sv } = scrollRef.current;

      if (phase === "intro") {
        intro.update(dt, camera);
        if (intro.done) { intro.dispose(); introRef.current = null; }
      } else if (phase === "touring") {
        const mandala = sceneRef.current;
        if (mandala) {
          mandala.update(dt, sv);

          // Node fade as scroll increases
          const nodeFade = Math.min(1, Math.max(0, (sp - 0.05) / 0.22));
          mandala.setNodeFade(nodeFade);

          // Forest grows from scroll p=0.08 → 0.50
          const growTarget = Math.max(0, Math.min(1, (sp - 0.08) / 0.42));
          forestGrowRef.current += (growTarget - forestGrowRef.current) * Math.min(1, dt * 1.4);
          mandala.setForestGrowth(forestGrowRef.current);

          // Section change pulse
          const activeSec = sp < 0.14 ? 0 : sp < 0.32 ? 1 : sp < 0.50 ? 2 : sp < 0.70 ? 3 : 4;
          if (activeSec !== prevSecRef.current) {
            prevSecRef.current = activeSec;
            pulseRef.current   = { t: 0 };
          }
          pulseRef.current.t += dt;
          mandala.setPulse(pulseRef.current.t * 95, Math.exp(-pulseRef.current.t * 2.6));

          // Camera — ambient drift at hero, scroll-driven otherwise
          driftARef.current += dt * (Math.PI * 2 / 260);
          const driftW = Math.max(0, 1 - sp / 0.05);
          const { pos, tgt } = camAtP(sp);
          if (driftW > 0) {
            const dp = new THREE.Vector3(
              ORBIT_R * Math.sin(driftARef.current), ORBIT_H, ORBIT_R * Math.cos(driftARef.current)
            );
            pos.lerp(dp, driftW);
          }
          camera.position.lerp(pos, Math.min(1, dt * 2.4));
          camTgtRef.current.lerp(tgt, Math.min(1, dt * 2.2));
          camera.lookAt(camTgtRef.current);
        }
      }

      renderer.render(threeScene, camera);
    };
    requestAnimationFrame(animate);

    const ro = new ResizeObserver(syncSize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      introRef.current?.dispose();
      sceneRef.current?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const touring      = introPhase === "touring";
  const showTerminal = introPhase === "typing" || introPhase === "collapsing";

  const heroV     = secVis(scrollP, 0.00, 0.22, 0.01, 0.05);
  const aboutV    = secVis(scrollP, 0.18, 0.40, 0.05, 0.05);
  const skillsV   = secVis(scrollP, 0.38, 0.58, 0.05, 0.05);
  const projectsV = secVis(scrollP, 0.55, 0.82, 0.05, 0.05);
  const contactV  = secVis(scrollP, 0.78, 1.00, 0.05, 0.04);

  return (
    <>
      <div ref={canvasRef} className="fixed inset-0" style={{ zIndex: 0 }} />

      {showTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />
          <div className="relative" style={{
            transform:       introPhase === "collapsing" ? "scale(0.006)" : "scale(1)",
            opacity:         introPhase === "collapsing" ? 0 : 1,
            transition:      "transform 0.6s cubic-bezier(0.65,0,1,0.5), opacity 0.45s ease-in",
            transformOrigin: "center center",
            willChange:      "transform, opacity",
          }}>
            <div className="font-mono text-[14px] font-bold tracking-[0.06em] flex items-baseline gap-2">
              <span style={{ color: "rgba(200,160,60,0.60)" }}>&gt;</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{INTRO_TEXT.slice(0, typedCount)}</span>
              <span style={{
                display: "inline-block", width: "0.50em", height: "1.1em",
                background: "rgba(200,160,60,0.85)", verticalAlign: "middle",
                opacity: cursorOn ? 1 : 0, transition: "opacity 0.08s",
              }} />
            </div>
          </div>
        </div>
      )}

      {touring && (
        <>
          <HeroPanel     vis={heroV}     />
          <AboutPanel    vis={aboutV}    />
          <SkillsPanel   vis={skillsV}   />
          <ProjectsPanel vis={projectsV} />
          <ContactPanel  vis={contactV}  />
        </>
      )}

      <div style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />
    </>
  );
}
