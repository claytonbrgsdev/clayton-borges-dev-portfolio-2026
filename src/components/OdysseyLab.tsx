"use client";
import { useEffect, useRef } from "react";
import type React from "react";

const PI  = Math.PI;
const TAU = PI * 2;

// ── Utils ─────────────────────────────────────────────────────────────────────
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));
const applyOverlay = (el: HTMLElement | null, alpha: number) => {
  if (!el) return;
  el.style.opacity = alpha.toFixed(3);
  el.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
};
const sr = (seed: number) => {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
};

// ── Peter de Jong attractor forms ─────────────────────────────────────────────
const ATTRACTOR_FORMS = [
  { a:  2.01, b: -2.53, c:  1.61, d: -0.33 },
  { a: -2.24, b:  0.43, c: -0.65, d: -2.43 },
  { a:  2.88, b: -0.77, c: -0.97, d:  0.74 },
  { a: -1.60, b:  1.65, c:  2.10, d: -0.74 },
  { a:  1.25, b: -1.25, c: -1.77, d: -1.25 },
];
const N_PARTICLES     = 700;
const PIXEL_DPR       = 0.5;
const ATTRACTOR_SCALE = 5.0;
const DECAY_ALPHA     = 0.013;

// ── Polar form functions ──────────────────────────────────────────────────────
const rBlob = (θ: number, t: number) =>
  1 + 0.32*Math.sin(3*θ+t*0.52) + 0.22*Math.sin(5*θ-t*0.38) + 0.18*Math.sin(2*θ+t*0.79);
const rStar = (θ: number, t: number) =>
  1 + 0.52*Math.cos(8*θ+t*0.035);
const rSpiral = (θ: number, t: number) =>
  1 + 0.44*Math.cos(3*θ-t*0.22) + 0.13*Math.cos(6*θ+t*0.14);
const rCrystal = (θ: number, t: number) =>
  1 + 0.30*Math.cos(12*θ+t*0.018) + 0.18*Math.cos(7*θ-t*0.030)
    + 0.12*Math.cos(20*θ+t*0.055) + 0.08*Math.cos(5*θ-t*0.042);
const rFracture = (θ: number, t: number) =>
  1 + 0.38*Math.cos(5*θ+t*0.019) + 0.24*Math.cos(9*θ-t*0.026)
    + 0.16*Math.pow(Math.max(0, Math.cos(4*θ+t*0.013)), 3);
const rCircle = (θ: number, t: number) =>
  1 + 0.018*Math.sin(6*θ+t*0.52);

function rMaster(θ: number, t: number, fsp: number): number {
  const t12 = ss(0.32, 0.44, fsp);
  const t23 = ss(0.46, 0.57, fsp);
  const t34 = ss(0.56, 0.67, fsp);
  const t45 = ss(0.65, 0.77, fsp);
  const t56 = ss(0.75, 0.88, fsp);
  const t67 = ss(0.86, 1.00, fsp);
  let r = rBlob(θ, t);
  r += (rStar(θ, t)     - r) * t12;
  r += (rSpiral(θ, t)   - r) * t23;
  r += (rCrystal(θ, t)  - r) * t34;
  r += (rFracture(θ, t) - r) * t45;
  r += (rBlob(θ, t)     - r) * t56;
  r += (rCircle(θ, t)   - r) * t67;
  return r;
}

function masterScale(fsp: number): number {
  const spike = (c: number, w: number) => { const d = Math.abs(fsp - c) / w; return d < 1 ? 1 - d * d : 0; };
  return 1
    + 0.20*spike(0.380, 0.030) + 0.18*spike(0.515, 0.028)
    + 0.18*spike(0.615, 0.028) + 0.16*spike(0.710, 0.026)
    + 0.14*spike(0.815, 0.026);
}

// ── Color arc ─────────────────────────────────────────────────────────────────
function bgRgb(fsp: number): string {
  const tD = ss(0.30, 0.58, fsp), tA = ss(0.72, 0.96, fsp);
  return `rgb(${Math.round(lerp(lerp(6,5,tD),7,tA))},${Math.round(lerp(lerp(8,3,tD),5,tA))},${Math.round(lerp(lerp(14,14,tD),4,tA))})`;
}
function glowRgb(fsp: number): [number, number, number] {
  const tD = ss(0.28, 0.62, fsp), tA = ss(0.70, 0.96, fsp);
  return [
    Math.round(lerp(lerp(138, 70, tD), 205, tA)),
    Math.round(lerp(lerp(160, 24, tD), 140, tA)),
    Math.round(lerp(lerp(198, 164, tD), 36,  tA)),
  ];
}
function outlineRgb(fsp: number): [number, number, number] {
  const tD = ss(0.35, 0.62, fsp), tA = ss(0.74, 0.96, fsp);
  return [
    Math.round(lerp(lerp(200, 102, tD), 214, tA)),
    Math.round(lerp(lerp(210, 52,  tD), 162, tA)),
    Math.round(lerp(lerp(228, 218, tD), 52,  tA)),
  ];
}
function surfWeights(fsp: number): [number, number, number] {
  const chrome = 1 - ss(0.38, 0.60, fsp);
  const amber  = ss(0.78, 0.98, fsp);
  return [chrome, Math.max(0, 1 - chrome - amber), amber];
}

// ── Vein tree ─────────────────────────────────────────────────────────────────
type VNode = { ax: number; ay: number; depth: number; pi: number };
type VEdge = { from: number; to: number; phase: number };
const buildVeins = (): [VNode[], VEdge[]] => {
  const nodes: VNode[] = [{ ax: 0, ay: 0, depth: 0, pi: -1 }];
  const edges: VEdge[] = [];
  const queue = [0];
  while (queue.length && nodes.length < 108) {
    const pi = queue.shift()!;
    const p = nodes[pi];
    if (p.depth > 5) continue;
    const nKids = 2 + Math.floor(sr(pi * 7.3 + edges.length) * 2);
    const baseAngle = p.pi < 0 ? 0 : Math.atan2(p.ay - nodes[p.pi].ay, p.ax - nodes[p.pi].ax);
    for (let c = 0; c < nKids && nodes.length < 108; c++) {
      const spread = p.depth === 0 ? TAU : PI * 0.65;
      const angle  = baseAngle + (c / nKids - 0.5) * spread + (sr(pi * c * 3.1) - 0.5) * 0.25;
      const dist   = (0.17 + 0.10 * sr(pi * c * 11)) * (1 - p.depth * 0.08);
      const ax2 = p.ax + Math.cos(angle) * dist;
      const ay2 = p.ay + Math.sin(angle) * dist;
      if (Math.sqrt(ax2 * ax2 + ay2 * ay2) > 1.06) continue;
      const ci = nodes.length;
      nodes.push({ ax: ax2, ay: ay2, depth: p.depth + 1, pi });
      edges.push({ from: pi, to: ci, phase: sr(edges.length * 5.7) * TAU });
      queue.push(ci);
    }
  }
  return [nodes, edges];
};
const [VEIN_NODES, VEIN_EDGES] = buildVeins();

// ── Solar granulation seeds (amber act) ──────────────────────────────────────
const GRANULES = Array.from({ length: 44 }, (_, i) => {
  const r = Math.sqrt(sr(i * 11.3 + 1)) * 0.76;
  const a = sr(i * 7.7 + 2) * TAU;
  return {
    x: r * Math.cos(a), y: r * Math.sin(a),
    phase: sr(i * 3.1 + 3) * TAU,
    freq: 0.38 + sr(i * 5.3 + 4) * 0.82,
    size: 0.040 + sr(i * 9.2 + 5) * 0.060,
  };
});

// ── Orbital satellites (amber act) ────────────────────────────────────────────
const SATELLITES = [
  { orbR: 1.26, speed:  0.014, phase: 0.0,  size: 0.026 },
  { orbR: 1.44, speed: -0.009, phase: 2.1,  size: 0.018 },
  { orbR: 1.60, speed:  0.006, phase: 4.7,  size: 0.013 },
  { orbR: 1.18, speed:  0.023, phase: 1.4,  size: 0.032 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function OdysseyLab() {
  const scrollRef      = useRef<HTMLDivElement>(null);
  const formCanvasRef  = useRef<HTMLCanvasElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const s0Ref = useRef<HTMLDivElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);
  const s4Ref = useRef<HTMLDivElement>(null);
  const s5Ref = useRef<HTMLDivElement>(null);
  const s6Ref = useRef<HTMLDivElement>(null);
  const s7Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formCanvas  = formCanvasRef.current  as HTMLCanvasElement;
    const pixelCanvas = pixelCanvasRef.current as HTMLCanvasElement;
    const scroll      = scrollRef.current;
    if (!formCanvas || !pixelCanvas || !scroll) return;

    const ctx  = formCanvas.getContext("2d")!;
    const pctx = pixelCanvas.getContext("2d", { alpha: false })!;

    const FORM_DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, PW = 0, PH = 0;

    // Pixel buffer — shared by attractor and flow particles
    let pixelImageData = pctx.createImageData(1, 1);
    let buf            = pixelImageData.data;

    // LUT decay toward #050508
    const decayR = new Uint8ClampedArray(256);
    const decayG = new Uint8ClampedArray(256);
    const decayB = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) {
      const f = 1 - DECAY_ALPHA;
      decayR[i] = (i * f + 5 * DECAY_ALPHA + 0.5) | 0;
      decayG[i] = (i * f + 5 * DECAY_ALPHA + 0.5) | 0;
      decayB[i] = (i * f + 8 * DECAY_ALPHA + 0.5) | 0;
    }

    let atAx = 0.12, atAy = -0.08;

    interface Particle { x: number; y: number; vx: number; vy: number; phase: number }
    let particles: Particle[] = [];
    const initParticles = () => {
      particles = Array.from({ length: N_PARTICLES }, () => ({
        x: Math.random() * PW,
        y: Math.random() * PH,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * TAU,
      }));
    };

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMouse = (e: MouseEvent) => { mouse.tx = e.clientX / w; mouse.ty = e.clientY / h; };
    window.addEventListener("mousemove", onMouse);

    const resize = () => {
      const fc = formCanvasRef.current  as HTMLCanvasElement;
      const pc = pixelCanvasRef.current as HTMLCanvasElement;
      w = window.innerWidth; h = window.innerHeight;
      fc.width = w * FORM_DPR; fc.height = h * FORM_DPR;
      fc.style.width = `${w}px`; fc.style.height = `${h}px`;
      ctx.setTransform(FORM_DPR, 0, 0, FORM_DPR, 0, 0);
      PW = Math.round(w * PIXEL_DPR);
      PH = Math.round(h * PIXEL_DPR);
      pc.width = PW; pc.height = PH;
      pixelImageData = pctx.createImageData(PW, PH);
      buf = pixelImageData.data;
      for (let i = 0; i < buf.length; i += 4) { buf[i] = 5; buf[i+1] = 5; buf[i+2] = 8; buf[i+3] = 255; }
      initParticles();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0, tau = 0, atauT = 0;

    const tracePath = (cx: number, cy: number, R: number, rot: number, fsp: number, tOff = 0) => {
      ctx.beginPath();
      for (let i = 0; i <= 320; i++) {
        const θ = (i / 320) * TAU + rot;
        const r = rMaster(θ, tau + tOff, fsp) * R;
        i === 0 ? ctx.moveTo(cx + Math.cos(θ)*r, cy + Math.sin(θ)*r)
                : ctx.lineTo(cx + Math.cos(θ)*r, cy + Math.sin(θ)*r);
      }
      ctx.closePath();
    };

    const makePath2D = (cx: number, cy: number, R: number, rot: number, fsp: number, tOff = 0) => {
      const p = new Path2D();
      for (let i = 0; i <= 320; i++) {
        const θ = (i / 320) * TAU + rot;
        const r = rMaster(θ, tau + tOff, fsp) * R;
        i === 0 ? p.moveTo(cx + Math.cos(θ)*r, cy + Math.sin(θ)*r)
                : p.lineTo(cx + Math.cos(θ)*r, cy + Math.sin(θ)*r);
      }
      p.closePath();
      return p;
    };

    const draw = () => {
      const sp = Math.max(0, Math.min(1, window.scrollY / (scroll.scrollHeight - h)));
      tau   += 0.016;
      atauT += 0.0022;
      mouse.x += (mouse.tx - mouse.x) * 0.055;
      mouse.y += (mouse.ty - mouse.y) * 0.055;
      const mx = mouse.x, my = mouse.y;

      const formEmerge = ss(0.32, 0.48, sp);
      const fsp        = Math.max(0, Math.min(1, (sp - 0.32) / 0.68));

      // ── PIXEL CANVAS ──────────────────────────────────────────────────────
      const attractorW = ss(0.01, 0.08, sp) * (1 - ss(0.20, 0.36, sp));
      const flowW      = ss(0.18, 0.28, sp) * (1 - ss(0.37, 0.49, sp));

      // Attractor parameter — traverses all 5 forms by sp≈0.36
      const numForms = ATTRACTOR_FORMS.length;
      const fmPhase  = Math.min(numForms - 1.001, (sp / 0.36) * (numForms - 1) + Math.sin(atauT * 0.048) * 0.12);
      const fi       = Math.floor(fmPhase);
      const fts      = ((p) => p * p * (3 - 2 * p))(fmPhase - fi);
      const fmA = ATTRACTOR_FORMS[fi], fmB = ATTRACTOR_FORMS[Math.min(numForms - 1, fi + 1)];
      const aP = fmA.a + (fmB.a - fmA.a) * fts;
      const bP = fmA.b + (fmB.b - fmA.b) * fts;
      const cP = fmA.c + (fmB.c - fmA.c) * fts;
      const dP = fmA.d + (fmB.d - fmA.d) * fts;

      // LUT decay — always active
      for (let i = 0; i < buf.length; i += 4) {
        buf[i]   = decayR[buf[i]];
        buf[i+1] = decayG[buf[i+1]];
        buf[i+2] = decayB[buf[i+2]];
      }

      // ── Act I: Attractor pixels ────────────────────────────────────────────
      if (attractorW > 0.005) {
        // Color shifts from cool blue-white to neutral white across forms
        const fmT   = fmPhase / (numForms - 1);
        const addV  = Math.max(1, Math.round(58 * attractorW));
        const addRv = Math.max(1, Math.round(addV * (0.78 + fmT * 0.22)));
        const addGv = Math.max(1, Math.round(addV * (0.86 + fmT * 0.14)));
        const addBv = Math.max(1, Math.round(addV * (1.06 - fmT * 0.06)));

        const mouseRotAngle = Math.atan2(my - 0.5, mx - 0.5) * 0.14;
        const cosR = Math.cos(mouseRotAngle), sinR = Math.sin(mouseRotAngle);
        const offX  = PW * 0.5 + (mx - 0.5) * 0.24 * PW;
        const offY  = PH * 0.5 + (my - 0.5) * 0.24 * PH;
        const offX2 = PW * 0.5 + (mx - 0.5) * 0.24 * PW + 0.12 * PW;
        const offY2 = PH * 0.5 + (my - 0.5) * 0.24 * PH - 0.07 * PH;
        const iters = Math.round(2200 + 1400 * attractorW);

        for (let i = 0; i < iters; i++) {
          const nx = Math.sin(aP * atAy) - Math.cos(bP * atAx);
          const ny = Math.sin(cP * atAx) - Math.cos(dP * atAy);
          atAx = nx; atAy = ny;
          if (atAx !== atAx || Math.abs(atAx) > 4 || Math.abs(atAy) > 4) {
            atAx = (Math.random() - 0.5) * 0.4; atAy = (Math.random() - 0.5) * 0.4; continue;
          }
          // Mouse-rotated primary
          const rx = atAx * cosR - atAy * sinR;
          const ry = atAx * sinR + atAy * cosR;
          const px = (rx / ATTRACTOR_SCALE * PW + offX) | 0;
          const py = (ry / ATTRACTOR_SCALE * PH + offY) | 0;
          if (px >= 0 && px < PW && py >= 0 && py < PH) {
            const idx = (py * PW + px) << 2;
            buf[idx]   = Math.min(255, buf[idx]   + addRv);
            buf[idx+1] = Math.min(255, buf[idx+1] + addGv);
            buf[idx+2] = Math.min(255, buf[idx+2] + addBv);
          }
          // Ghost echo — offset position, 25% intensity
          if (attractorW > 0.18 && i % 3 === 0) {
            const px2 = (atAx / ATTRACTOR_SCALE * PW + offX2) | 0;
            const py2 = (atAy / ATTRACTOR_SCALE * PH + offY2) | 0;
            if (px2 >= 0 && px2 < PW && py2 >= 0 && py2 < PH) {
              const idx2 = (py2 * PW + px2) << 2;
              buf[idx2]   = Math.min(255, buf[idx2]   + (addRv >> 2));
              buf[idx2+1] = Math.min(255, buf[idx2+1] + (addGv >> 2));
              buf[idx2+2] = Math.min(255, buf[idx2+2] + (addBv >> 2));
            }
          }
        }
      }

      // ── Act II: Flow field particles ───────────────────────────────────────
      const fieldActive = flowW > 0.008 || attractorW < 0.01;
      if (fieldActive) {
        const addF  = flowW > 0.008 ? Math.max(1, Math.round(40 * flowW)) : 0;
        const addFB = flowW > 0.008 ? Math.max(1, Math.round(50 * flowW)) : 0; // cooler blue
        const fieldPhaseOff = (mx - 0.5) * PI * 1.4;

        for (let i = 0; i < N_PARTICLES; i++) {
          const p = particles[i];
          // Flow field
          const nx = (p.x / PW) * 5.5, ny = (p.y / PH) * 5.5;
          const angle =
            Math.sin(nx + atauT * 0.55 + p.phase + fieldPhaseOff) *
            Math.cos(ny + atauT * 0.40) * TAU +
            Math.sin(nx * 2.3 - ny * 1.8 + atauT * 0.18 + p.phase * 0.6) * 1.8;
          p.vx = p.vx * 0.92 + Math.cos(angle) * 0.10;
          p.vy = p.vy * 0.92 + Math.sin(angle) * 0.10;

          // Mouse vortex — gentle tangential pull
          if (flowW > 0.02) {
            const mdx = mx * PW - p.x, mdy = my * PH - p.y;
            const md2 = mdx * mdx + mdy * mdy + 400;
            const vortexStr = flowW * 0.18 / md2;
            const vAng = Math.atan2(mdy, mdx) + PI * 0.5;
            p.vx += Math.cos(vAng) * vortexStr * md2 * 0.001;
            p.vy += Math.sin(vAng) * vortexStr * md2 * 0.001;
          }

          // Convergence toward center as the form materializes — particles get drawn in
          if (formEmerge > 0.01) {
            const cdx = PW * 0.5 - p.x, cdy = PH * 0.5 - p.y;
            const cd2 = cdx * cdx + cdy * cdy + 200;
            const convStr = formEmerge * (flowW + 0.2) * 0.9;
            p.vx += cdx * convStr * 0.0008 / (cd2 * 0.00008 + 1);
            p.vy += cdy * convStr * 0.0008 / (cd2 * 0.00008 + 1);
            // Speed cap so particles don't slingshot
            const speed2 = p.vx * p.vx + p.vy * p.vy;
            if (speed2 > 4.0) { const sc = 2.0 / Math.sqrt(speed2); p.vx *= sc; p.vy *= sc; }
          }

          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x += PW; else if (p.x >= PW) p.x -= PW;
          if (p.y < 0) p.y += PH; else if (p.y >= PH) p.y -= PH;

          if (addF > 0) {
            const isSeed = (i % 5 === 0); // every 5th is a seed — faster, brighter
            const fV = isSeed ? addF * 3 : addF;
            const fB = isSeed ? addFB * 3 : addFB;
            const px = p.x | 0, py = p.y | 0;
            if (px >= 0 && px < PW && py >= 0 && py < PH) {
              const idx = (py * PW + px) << 2;
              buf[idx]   = Math.min(255, buf[idx]   + fV);
              buf[idx+1] = Math.min(255, buf[idx+1] + fV);
              buf[idx+2] = Math.min(255, buf[idx+2] + fB);
            }
          }
        }
      }

      pctx.putImageData(pixelImageData, 0, 0);

      // Post-putImageData overlays on pixel canvas
      if (attractorW > 0.04) {
        // Nebula glow centered on attractor cluster
        const offX = PW * 0.5 + (mx - 0.5) * 0.24 * PW;
        const offY = PH * 0.5 + (my - 0.5) * 0.24 * PH;
        const nGrad = pctx.createRadialGradient(offX, offY, 0, offX, offY, PW * 0.32);
        nGrad.addColorStop(0,   `rgba(175,188,238,${attractorW * 0.10})`);
        nGrad.addColorStop(0.4, `rgba(80,95,160,${attractorW * 0.035})`);
        nGrad.addColorStop(1,   "rgba(0,0,0,0)");
        pctx.fillStyle = nGrad; pctx.fillRect(0, 0, PW, PH);
        // Polar rings showing attractor symmetry
        const ringA = attractorW * 0.06;
        for (let ri = 1; ri <= 3; ri++) {
          pctx.beginPath(); pctx.arc(offX, offY, PW * (0.07 + ri * 0.055), 0, TAU);
          pctx.strokeStyle = `rgba(140,155,210,${ringA / ri})`; pctx.lineWidth = 0.4; pctx.stroke();
        }
      }
      if (flowW > 0.06) {
        // Cursor vortex ring
        const cvx = mx * PW, cvy = my * PH;
        pctx.beginPath(); pctx.arc(cvx, cvy, PW * 0.022, 0, TAU);
        pctx.strokeStyle = `rgba(200,210,248,${flowW * 0.14})`; pctx.lineWidth = 0.5; pctx.stroke();
        pctx.beginPath(); pctx.arc(cvx, cvy, PW * 0.044, 0, TAU);
        pctx.strokeStyle = `rgba(160,172,228,${flowW * 0.06})`; pctx.lineWidth = 0.3; pctx.stroke();
      }

      // ── FORM CANVAS ───────────────────────────────────────────────────────
      ctx.clearRect(0, 0, w, h);

      // Emergence burst — bright flash as the form condenses from the particle cloud
      // Happens on the form canvas so it composites cleanly over the pixel layer
      const burst = ss(0.33, 0.42, sp) * (1 - ss(0.42, 0.58, sp));
      if (burst > 0.01) {
        const bcx = w / 2, bcy = h / 2;
        const bR  = Math.min(w, h) * 0.42 * masterScale(0) * ss(0.33, 0.42, sp);
        const bGrad = ctx.createRadialGradient(bcx, bcy, 0, bcx, bcy, bR * 2.8);
        bGrad.addColorStop(0,    `rgba(228,236,255,${burst * 0.52})`);
        bGrad.addColorStop(0.22, `rgba(185,200,245,${burst * 0.24})`);
        bGrad.addColorStop(0.55, `rgba(110,130,200,${burst * 0.08})`);
        bGrad.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = bGrad; ctx.fillRect(0, 0, w, h);
        // Tight core — very bright centre point
        const cGrad = ctx.createRadialGradient(bcx, bcy, 0, bcx, bcy, bR * 0.55);
        cGrad.addColorStop(0, `rgba(255,255,255,${burst * 0.70})`);
        cGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = cGrad; ctx.fillRect(0, 0, w, h);
      }

      if (formEmerge > 0.005) {
        const cx = w / 2, cy = h / 2;
        const baseR = Math.min(w, h) * 0.42;
        const rot   = tau * 0.011 + fsp * PI * 0.52;
        const R     = baseR * masterScale(fsp) * formEmerge * (1 + 0.020 * Math.sin(tau * 0.40));

        const [chromeW, depthW, amberW] = surfWeights(fsp);
        const [glR, glG, glB] = glowRgb(fsp);

        // Background — only paint after the form is established, not during emergence
        // This prevents the dark-blob-occluding-particles problem
        const bgAlpha = ss(0.46, 0.64, sp);
        if (bgAlpha > 0.005) {
          ctx.globalAlpha = bgAlpha;
          ctx.fillStyle = bgRgb(fsp);
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
        }

        if (R < 2) { raf = requestAnimationFrame(draw); return; }

        // Emergence inner glow — form glows bright blue-white as it coalesces
        const emergGlow = ss(0.32, 0.44, sp) * (1 - ss(0.44, 0.60, sp));
        if (emergGlow > 0.01) {
          const egPath = makePath2D(cx, cy, R, rot, fsp);
          ctx.save(); ctx.clip(egPath);
          const egGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
          egGrad.addColorStop(0,   `rgba(225,235,255,${emergGlow * 0.80})`);
          egGrad.addColorStop(0.4, `rgba(170,192,240,${emergGlow * 0.30})`);
          egGrad.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = egGrad; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);
          ctx.restore();
        }

        // Ambient glow — center leans toward cursor subtly
        const hazeCx = cx + (mx - 0.5) * R * 0.08;
        const hazeCy = cy + (my - 0.5) * R * 0.08;
        const hazeA  = 0.010 + 0.044*depthW + 0.032*amberW + 0.020*chromeW;
        const haze   = ctx.createRadialGradient(hazeCx, hazeCy, 0, hazeCx, hazeCy, R * 3.0);
        haze.addColorStop(0,   `rgba(${glR},${glG},${glB},${hazeA})`);
        haze.addColorStop(0.5, `rgba(${glR},${glG},${glB},${hazeA * 0.20})`);
        haze.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);

        // Eternal circle
        const cVis = 0.028 + ss(0.82, 1.00, fsp) * 0.16;
        ctx.beginPath(); ctx.arc(cx, cy, baseR, 0, TAU);
        ctx.strokeStyle = `rgba(208,160,50,${cVis})`;
        ctx.lineWidth = 0.75 + ss(0.92, 1.0, fsp) * 1.2; ctx.stroke();

        // Ghost echoes (amber)
        if (amberW > 0.04) {
          for (let g = 3; g >= 1; g--) {
            const gp = makePath2D(cx, cy, R * (1 - g * 0.012), rot + g * 0.04, fsp, -g * 3.6);
            ctx.strokeStyle = `rgba(205,152,44,${amberW * (0.10 - g * 0.022)})`;
            ctx.lineWidth = 0.5; ctx.stroke(gp);
          }
        }

        // ── ① CHROME SURFACE ────────────────────────────────────────────────
        if (chromeW > 0.01) {
          // Three-light setup: key, fill, rim — all mouse-reactive
          const keyAngle  = -PI * 0.56 + fsp * PI * 0.18 + tau * 0.019 + (mx - 0.5) * PI * 0.44;
          const fillAngle = keyAngle + PI * 0.62 + (my - 0.5) * 0.30;
          const rimAngle  = keyAngle + PI * 1.12;
          const lx1 = cx + Math.cos(keyAngle) * R * 1.22, ly1 = cy + Math.sin(keyAngle) * R * 1.22;
          const lx2 = cx - Math.cos(keyAngle) * R * 1.22, ly2 = cy - Math.sin(keyAngle) * R * 1.22;
          const sw  = (Math.sin(tau * 0.65 + keyAngle) + 1) / 2;

          ctx.save(); ctx.globalAlpha = chromeW;

          // Animated chrome sweep (key light)
          tracePath(cx, cy, R, rot, fsp);
          const cg = ctx.createLinearGradient(lx1, ly1, lx2, ly2);
          cg.addColorStop(0,                          "rgba(4,4,10,1)");
          cg.addColorStop(0.10,                       "rgba(40,44,58,1)");
          cg.addColorStop(Math.max(0.01, sw - 0.22),  "rgba(80,88,108,1)");
          cg.addColorStop(Math.max(0.02, sw - 0.08),  "rgba(150,158,182,1)");
          cg.addColorStop(sw,                         "rgba(234,240,255,1)");
          cg.addColorStop(Math.min(0.98, sw + 0.08),  "rgba(150,158,182,1)");
          cg.addColorStop(Math.min(0.99, sw + 0.22),  "rgba(80,88,108,1)");
          cg.addColorStop(0.90,                       "rgba(40,44,58,1)");
          cg.addColorStop(1,                          "rgba(4,4,10,1)");
          ctx.fillStyle = cg; ctx.fill();

          // Secondary crossing fill light
          tracePath(cx, cy, R, rot, fsp);
          const sw2 = (Math.sin(tau * 0.42 + fillAngle + 1.2) + 1) / 2;
          const fg1x = cx + Math.cos(fillAngle) * R * 1.10, fg1y = cy + Math.sin(fillAngle) * R * 1.10;
          const fg2x = cx - Math.cos(fillAngle) * R * 1.10, fg2y = cy - Math.sin(fillAngle) * R * 1.10;
          const fg = ctx.createLinearGradient(fg1x, fg1y, fg2x, fg2y);
          fg.addColorStop(0,                           "rgba(8,10,22,0)");
          fg.addColorStop(Math.max(0.01, sw2 - 0.15),  "rgba(22,28,48,0.18)");
          fg.addColorStop(sw2,                         "rgba(100,115,155,0.22)");
          fg.addColorStop(Math.min(0.99, sw2 + 0.15),  "rgba(22,28,48,0.12)");
          fg.addColorStop(1,                           "rgba(8,10,22,0)");
          ctx.fillStyle = fg; ctx.fill();

          // Edge vignette
          tracePath(cx, cy, R, rot, fsp);
          const ev = ctx.createRadialGradient(cx, cy, R * 0.30, cx, cy, R * 1.08);
          ev.addColorStop(0, "rgba(0,0,0,0)"); ev.addColorStop(0.52, "rgba(0,0,0,0)");
          ev.addColorStop(1, "rgba(0,0,0,0.80)");
          ctx.fillStyle = ev; ctx.fill();

          // Clip for interior details
          tracePath(cx, cy, R, rot, fsp);
          ctx.save(); ctx.clip();

          // Key specular highlight
          const hlx = cx + Math.cos(keyAngle) * R * 0.18, hly = cy + Math.sin(keyAngle) * R * 0.18;
          const hl  = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, R * 0.46);
          hl.addColorStop(0, "rgba(255,255,255,0.30)"); hl.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = hl; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);

          // Fill light (softer, opposing side)
          const flx = cx + Math.cos(fillAngle) * R * 0.52, fly = cy + Math.sin(fillAngle) * R * 0.52;
          const fl  = ctx.createRadialGradient(flx, fly, 0, flx, fly, R * 0.35);
          const flA = 0.055 + (1 - Math.abs(mx - 0.5) * 2) * 0.028;
          fl.addColorStop(0, `rgba(185,200,235,${flA})`); fl.addColorStop(1, "rgba(185,200,235,0)");
          ctx.fillStyle = fl; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);

          // Rim light (back edge glow)
          const rlx = cx + Math.cos(rimAngle) * R * 0.78, rly = cy + Math.sin(rimAngle) * R * 0.78;
          const rl  = ctx.createRadialGradient(rlx, rly, 0, rlx, rly, R * 0.28);
          rl.addColorStop(0, "rgba(210,220,255,0.07)"); rl.addColorStop(1, "rgba(210,220,255,0)");
          ctx.fillStyle = rl; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);

          // Fine mesh grid — engineering drawing feel, fades in/out with chrome
          const meshA = chromeW * ss(0, 0.28, fsp) * (1 - ss(0.40, 0.58, fsp)) * 0.028;
          if (meshA > 0.003) {
            const gridStep = R * 0.115;
            const nLines   = Math.ceil(R * 2 / gridStep) + 1;
            ctx.strokeStyle = `rgba(155,168,208,${meshA})`; ctx.lineWidth = 0.22;
            for (let l = -nLines; l <= nLines; l++) {
              const xL = cx + l * gridStep;
              ctx.beginPath(); ctx.moveTo(xL, cy - R * 1.6); ctx.lineTo(xL, cy + R * 1.6); ctx.stroke();
              const yL = cy + l * gridStep;
              ctx.beginPath(); ctx.moveTo(cx - R * 1.6, yL); ctx.lineTo(cx + R * 1.6, yL); ctx.stroke();
            }
          }

          // Concentric micro-rings inside chrome
          for (let ri = 1; ri <= 5; ri++) {
            const ringR = R * (0.22 + ri * 0.155);
            const ringA = chromeW * 0.040 * (1 - ri * 0.12) * (0.5 + 0.5 * Math.sin(tau * 0.30 + ri * 1.1));
            if (ringA < 0.003) continue;
            ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, TAU);
            ctx.strokeStyle = `rgba(200,212,245,${ringA})`; ctx.lineWidth = 0.22; ctx.stroke();
          }

          ctx.restore(); // chrome clip

          // Thin-film iridescence — animated rainbow at form edge
          const iridA = chromeW * 0.14;
          if (iridA > 0.01) {
            const iridN = 120;
            for (let i = 0; i < iridN; i++) {
              const θ1 = (i / iridN) * TAU + rot;
              const θ2 = ((i + 1) / iridN) * TAU + rot;
              const r1 = rMaster(θ1, tau, fsp) * R, r2 = rMaster(θ2, tau, fsp) * R;
              const hue  = (i / iridN * 360 + tau * 15) % 360;
              const iA   = iridA * (0.5 + 0.5 * Math.sin(tau * 0.7 + i * 0.22));
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(θ1) * r1, cy + Math.sin(θ1) * r1);
              ctx.lineTo(cx + Math.cos(θ2) * r2, cy + Math.sin(θ2) * r2);
              ctx.strokeStyle = `hsla(${hue},78%,72%,${iA})`; ctx.lineWidth = 2.2; ctx.stroke();
            }
          }

          // Construction lines during emergence
          const constrA = chromeW * ss(0, 0.35, fsp) * (1 - ss(0.35, 0.58, fsp)) * 0.08;
          if (constrA > 0.004) {
            for (let l = 0; l < 28; l++) {
              const angle = (l / 28) * TAU + tau * 0.004;
              const rAt   = rMaster(angle, tau, fsp) * R;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(angle) * R * 0.08, cy + Math.sin(angle) * R * 0.08);
              ctx.lineTo(cx + Math.cos(angle) * rAt, cy + Math.sin(angle) * rAt);
              ctx.strokeStyle = `rgba(165,178,215,${constrA * (0.38 + 0.62 * Math.sin(tau * 0.5 + l * 0.42))})`;
              ctx.lineWidth = 0.28; ctx.stroke();
            }
          }

          ctx.restore(); // chromeW globalAlpha
        }

        // ── ② DEPTH SURFACE + VEIN NETWORK ──────────────────────────────────
        if (depthW > 0.01) {
          ctx.save(); ctx.globalAlpha = depthW;
          const fp = makePath2D(cx, cy, R, rot, fsp);
          ctx.save(); ctx.clip(fp);

          // Primary deep fill
          const innerLum = 0.05 + 0.25 * depthW;
          const dFill = ctx.createRadialGradient(cx, cy * 0.91, 0, cx, cy, R * 1.12);
          dFill.addColorStop(0,    `rgba(58,20,145,${innerLum})`);
          dFill.addColorStop(0.30, "rgba(18,7,55,0.52)");
          dFill.addColorStop(0.75, "rgba(8,3,25,0.90)");
          dFill.addColorStop(1,    "rgba(3,1,10,1)");
          ctx.fillStyle = dFill; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);

          // Secondary nebula — offset, creates depth within depth
          const nebOff = 0.28;
          const dFill2 = ctx.createRadialGradient(cx + R*nebOff, cy - R*0.18, 0, cx + R*nebOff, cy - R*0.18, R * 0.72);
          dFill2.addColorStop(0,   `rgba(88,28,195,${innerLum * 0.45})`);
          dFill2.addColorStop(0.5, `rgba(38,10,88,${innerLum * 0.18})`);
          dFill2.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = dFill2; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);

          const veinP = ss(0.50, 0.72, fsp) * (1 - ss(0.76, 0.90, fsp));
          if (veinP > 0.01) {
            const maxD = 5;
            ctx.lineCap = "round"; ctx.lineJoin = "round";

            // Vein edges
            for (const e of VEIN_EDGES) {
              const fn = VEIN_NODES[e.from], tn = VEIN_NODES[e.to];
              const eA = ss((tn.depth / maxD) * 0.25, (tn.depth / maxD) * 0.25 + 0.12, veinP);
              if (eA < 0.01) continue;
              const vx1 = cx + fn.ax * R, vy1 = cy + fn.ay * R;
              const vx2 = cx + tn.ax * R, vy2 = cy + tn.ay * R;
              const pulse  = 0.5 + 0.5 * Math.sin(tau * 1.6 + e.phase + (mx - 0.5) * 2.2);
              const bright = eA * (0.38 + 0.62 * pulse);
              const vw     = (2.6 - tn.depth * 0.38) * 0.8;
              ctx.beginPath(); ctx.moveTo(vx1, vy1); ctx.lineTo(vx2, vy2);
              ctx.strokeStyle = `rgba(68,32,195,${bright * 0.38})`; ctx.lineWidth = vw * 3.5; ctx.stroke();
              ctx.beginPath(); ctx.moveTo(vx1, vy1); ctx.lineTo(vx2, vy2);
              ctx.strokeStyle = `rgba(118,68,248,${bright * 0.72})`; ctx.lineWidth = vw; ctx.stroke();
              ctx.beginPath(); ctx.moveTo(vx1, vy1); ctx.lineTo(vx2, vy2);
              ctx.strokeStyle = `rgba(208,178,255,${bright * 0.50})`; ctx.lineWidth = vw * 0.20; ctx.stroke();

              // Electricity flash — rare, bright, instantaneous
              if (veinP > 0.30 && Math.random() < 0.0015 * depthW) {
                ctx.beginPath(); ctx.moveTo(vx1, vy1); ctx.lineTo(vx2, vy2);
                ctx.strokeStyle = `rgba(240,228,255,${0.55 + Math.random() * 0.45})`;
                ctx.lineWidth = 1.2; ctx.stroke();
              }
            }

            // Vein nodes + halos
            for (let ni = 0; ni < VEIN_NODES.length; ni++) {
              const n  = VEIN_NODES[ni];
              const eA = ss((n.depth / maxD) * 0.25, (n.depth / maxD) * 0.25 + 0.12, veinP);
              if (eA < 0.01) continue;
              const vnx = cx + n.ax * R, vny = cy + n.ay * R;
              const pulse = 0.5 + 0.5 * Math.sin(tau * 2.1 + sr(ni * 7.3) * TAU + (my - 0.5) * 1.8);
              const nr    = (3.5 - n.depth * 0.5) * (0.65 + 0.35 * pulse);
              const ng    = ctx.createRadialGradient(vnx, vny, 0, vnx, vny, Math.max(0.1, nr * 5));
              ng.addColorStop(0, `rgba(225,195,255,${eA * (0.5 + 0.5 * pulse)})`);
              ng.addColorStop(1, "rgba(52,14,138,0)");
              ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(vnx, vny, nr * 5, 0, TAU); ctx.fill();
            }

            // Spore particles — drift near vein nodes, carry energy
            const sporeA = veinP * depthW * 0.28;
            if (sporeA > 0.02) {
              for (let si = 0; si < 16; si++) {
                const ni     = Math.floor(sr(si * 4.2) * VEIN_NODES.length);
                const n      = VEIN_NODES[ni];
                const nEA    = ss((n.depth / maxD) * 0.25, (n.depth / maxD) * 0.25 + 0.12, veinP);
                if (nEA < 0.05) continue;
                const dAngle = sr(si * 8.6) * TAU + tau * (0.14 + sr(si * 2.3) * 0.22);
                const dRad   = (0.06 + sr(si * 5.1) * 0.10) * R;
                const sx     = cx + n.ax * R + Math.cos(dAngle) * dRad;
                const sy     = cy + n.ay * R + Math.sin(dAngle) * dRad;
                const sA     = nEA * sporeA * (0.5 + 0.5 * Math.sin(tau * 1.4 + si * 0.9));
                ctx.beginPath(); ctx.arc(sx, sy, 1.4 + sr(si) * 1.8, 0, TAU);
                ctx.fillStyle = `rgba(178,138,255,${sA})`; ctx.fill();
              }
            }
          }

          // Pressure rings — pulsing outward halos during fracture
          const ringA = depthW * ss(0.40, 0.65, fsp) * (1 - ss(0.82, 0.94, fsp));
          if (ringA > 0.01) {
            for (let ri = 0; ri < 4; ri++) {
              const phase = (tau * (0.28 + ri * 0.09) + ri * 2.1) % 1.0;
              const rRing = baseR * (1.04 + phase * 0.36);
              ctx.beginPath(); ctx.arc(cx, cy, rRing, 0, TAU);
              ctx.strokeStyle = `rgba(98,48,220,${ringA * (0.055 - ri * 0.010) * (1 - phase)})`;
              ctx.lineWidth = 0.8; ctx.stroke();
            }
          }

          // Limb darkening
          const ldG = ctx.createRadialGradient(cx, cy, R * 0.44, cx, cy, R * 1.08);
          ldG.addColorStop(0, "rgba(0,0,0,0)"); ldG.addColorStop(0.52, "rgba(0,0,0,0)");
          ldG.addColorStop(1, "rgba(0,0,0,0.90)");
          ctx.fillStyle = ldG; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);
          ctx.restore(); // depth clip
          ctx.restore(); // depthW
        }

        // ── ③ AMBER SURFACE ─────────────────────────────────────────────────
        if (amberW > 0.01) {
          ctx.save(); ctx.globalAlpha = amberW;
          const fp = makePath2D(cx, cy, R, rot, fsp);
          ctx.save(); ctx.clip(fp);

          const warmth = 0.08 + 0.24 * amberW;
          const aFill  = ctx.createRadialGradient(cx - R * 0.12, cy - R * 0.18, 0, cx, cy, R * 1.14);
          aFill.addColorStop(0,    `rgba(218,162,54,${warmth})`);
          aFill.addColorStop(0.22, `rgba(148,95,22,${warmth * 0.50})`);
          aFill.addColorStop(0.65, "rgba(44,22,6,0.82)");
          aFill.addColorStop(1,    "rgba(8,4,1,1)");
          ctx.fillStyle = aFill; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);

          // Solar granulation — convective cells breathing inside the form
          const granA = amberW * ss(0.82, 0.95, fsp) * 0.065;
          if (granA > 0.004) {
            for (const g of GRANULES) {
              const gx     = cx + g.x * R, gy = cy + g.y * R;
              const gR     = g.size * R;
              const breath = 0.5 + 0.5 * Math.sin(tau * g.freq + g.phase);
              const gGrad  = ctx.createRadialGradient(gx, gy, 0, gx, gy, gR);
              gGrad.addColorStop(0,   `rgba(255,200,80,${granA * breath * 2.0})`);
              gGrad.addColorStop(0.55,`rgba(195,125,28,${granA * breath * 0.55})`);
              gGrad.addColorStop(1,   "rgba(0,0,0,0)");
              ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(gx, gy, gR, 0, TAU); ctx.fill();
            }
          }

          // Mouse warm spot — brightens where cursor hovers inside form
          const msx = cx + (mx - 0.5) * w;
          const msy = cy + (my - 0.5) * h;
          const mDistSq = (msx - cx) ** 2 + (msy - cy) ** 2;
          if (amberW > 0.10 && mDistSq < R * R * 1.15) {
            const wsGrad = ctx.createRadialGradient(msx, msy, 0, msx, msy, R * 0.24);
            wsGrad.addColorStop(0, `rgba(255,185,52,${amberW * 0.14})`);
            wsGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = wsGrad; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);
          }

          // Fourier construction lines — phase in with amber
          const harmA = amberW * ss(0.78, 0.96, fsp) * 0.10;
          if (harmA > 0.004) {
            const nHL = Math.round(amberW * 36);
            for (let l = 0; l < nHL; l++) {
              const ang2 = (l / nHL) * TAU;
              const sR   = rMaster(ang2, tau, fsp) * R;
              const lA   = harmA * (0.45 + 0.55 * Math.sin(tau * 0.82 + l * 0.65));
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(ang2) * sR * 0.10, cy + Math.sin(ang2) * sR * 0.10);
              ctx.lineTo(cx + Math.cos(ang2) * sR * 0.88, cy + Math.sin(ang2) * sR * 0.88);
              ctx.strokeStyle = `rgba(220,165,55,${lA})`; ctx.lineWidth = 0.38; ctx.stroke();
            }
          }

          // Limb darkening
          const ldG = ctx.createRadialGradient(cx, cy, R * 0.44, cx, cy, R * 1.08);
          ldG.addColorStop(0, "rgba(0,0,0,0)"); ldG.addColorStop(0.52, "rgba(0,0,0,0)");
          ldG.addColorStop(1, "rgba(0,0,0,0.86)");
          ctx.fillStyle = ldG; ctx.fillRect(cx - R*2, cy - R*2, R*4, R*4);
          ctx.restore(); // amber clip

          // Orbital satellites — outside the form, phase in with late amber
          const satA = amberW * ss(0.84, 0.97, fsp);
          if (satA > 0.01) {
            for (const sat of SATELLITES) {
              const satAngle = sat.phase + tau * sat.speed;
              const satOrbR  = R * sat.orbR;
              const sx = cx + Math.cos(satAngle) * satOrbR;
              const sy = cy + Math.sin(satAngle) * satOrbR;
              const sz = R * sat.size;
              // Orbital path ring (faint)
              ctx.beginPath(); ctx.arc(cx, cy, satOrbR, 0, TAU);
              ctx.strokeStyle = `rgba(200,150,40,${satA * 0.055})`; ctx.lineWidth = 0.28; ctx.stroke();
              // Satellite body
              ctx.beginPath(); ctx.arc(sx, sy, sz, 0, TAU);
              ctx.fillStyle   = `rgba(215,165,50,${satA * 0.40})`; ctx.fill();
              ctx.strokeStyle = `rgba(245,200,80,${satA * 0.55})`; ctx.lineWidth = 0.45; ctx.stroke();
              // Glow
              const satGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sz * 3.5);
              satGlow.addColorStop(0, `rgba(235,180,55,${satA * 0.20})`);
              satGlow.addColorStop(1, "rgba(0,0,0,0)");
              ctx.fillStyle = satGlow; ctx.beginPath(); ctx.arc(sx, sy, sz * 3.5, 0, TAU); ctx.fill();
            }
          }

          // Harmonic resonance rings outside the form
          const harmRingA = amberW * ss(0.86, 0.98, fsp) * 0.07;
          if (harmRingA > 0.004) {
            for (let n = 1; n <= 3; n++) {
              const rRes = baseR * (1.0 + n * 0.19);
              const phOff = tau * (0.065 - n * 0.016);
              ctx.beginPath(); ctx.arc(cx, cy, rRes * (1 + 0.011 * Math.sin(phOff)), 0, TAU);
              ctx.strokeStyle = `rgba(210,162,46,${harmRingA / n})`;
              ctx.lineWidth = 0.45; ctx.stroke();
            }
          }

          ctx.restore(); // amberW
        }

        // Form outline — color graded
        const [oR, oG, oB] = outlineRgb(fsp);
        const oA = 0.06 + depthW * 0.12 * (0.5 + 0.5 * Math.sin(tau * 1.1)) + chromeW * 0.18 + amberW * 0.20;
        tracePath(cx, cy, R, rot, fsp);
        ctx.strokeStyle = `rgba(${oR},${oG},${oB},${oA})`;
        ctx.lineWidth = 0.8 + chromeW * 0.6 + depthW * 0.9 + amberW * 0.7; ctx.stroke();

        // External pressure cracks (depth → fracture)
        const crackA = depthW * ss(0.60, 0.74, fsp) * (1 - ss(0.80, 0.90, fsp));
        if (crackA > 0.02) {
          const nC = Math.round(8 + crackA * 14);
          for (let i = 0; i < nC; i++) {
            const θ    = sr(i * 5.71) * TAU;
            const fR   = rMaster(θ, tau, fsp) * R;
            const tipL = fR * (0.05 + 0.11 * crackA);
            const cx1  = cx + Math.cos(θ) * fR, cy1 = cy + Math.sin(θ) * fR;
            const bAng = θ + (sr(i * 11.3) - 0.5) * 0.42;
            const cx2  = cx + Math.cos(bAng) * (fR + tipL), cy2 = cy + Math.sin(bAng) * (fR + tipL);
            const ca   = crackA * 0.30 * (0.5 + 0.5 * Math.sin(tau * 2.2 + i * 1.7));
            ctx.beginPath(); ctx.moveTo(cx1, cy1); ctx.lineTo(cx2, cy2);
            ctx.strokeStyle = `rgba(128,72,248,${ca})`; ctx.lineWidth = 0.7; ctx.stroke();
            // Crack sub-branch (shorter, dimmer)
            if (i % 3 === 0) {
              const bAng2 = bAng + (sr(i * 6.1) - 0.5) * 0.55;
              const cx3   = cx2 + Math.cos(bAng2) * tipL * 0.55;
              const cy3   = cy2 + Math.sin(bAng2) * tipL * 0.55;
              ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx3, cy3);
              ctx.strokeStyle = `rgba(108,55,220,${ca * 0.55})`; ctx.lineWidth = 0.4; ctx.stroke();
            }
          }
        }

        // Amber dissipation ripples — 6 layers
        const ripA = amberW * ss(0.90, 1.0, fsp);
        if (ripA > 0.01) {
          for (let ri = 0; ri < 6; ri++) {
            const phase = (tau * (0.22 + ri * 0.055) + ri * 1.4) % 1.0;
            const rR    = baseR * (1.02 + phase * 0.58);
            const rA    = ripA * Math.max(0, 0.052 - ri * 0.007) * (1 - phase);
            ctx.beginPath(); ctx.arc(cx, cy, rR, 0, TAU);
            ctx.strokeStyle = `rgba(200,150,45,${rA})`; ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }

      // ── Overlays ──────────────────────────────────────────────────────────
      applyOverlay(s0Ref.current, secAlpha(sp, 0.02, 0.07, 0.15, 0.21));
      applyOverlay(s1Ref.current, secAlpha(sp, 0.21, 0.27, 0.33, 0.39));
      applyOverlay(s2Ref.current, secAlpha(sp, 0.44, 0.49, 0.55, 0.60));
      applyOverlay(s3Ref.current, secAlpha(sp, 0.60, 0.64, 0.70, 0.76));
      applyOverlay(s4Ref.current, secAlpha(sp, 0.67, 0.72, 0.79, 0.84));
      applyOverlay(s5Ref.current, secAlpha(sp, 0.80, 0.84, 0.90, 0.94));
      applyOverlay(s6Ref.current, secAlpha(sp, 0.90, 0.93, 0.96, 0.98));
      applyOverlay(s7Ref.current, secAlpha(sp, 0.96, 0.97, 0.99, 1.00));

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  const sec: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none", transition: "none", zIndex: 10,
    fontFamily: "var(--font-mono, 'Courier New', monospace)",
  };
  const lbl = (c: string): React.CSSProperties => ({
    fontSize: "0.64rem", letterSpacing: "0.26em", color: c, marginBottom: 10, display: "block",
  });

  return (
    <div ref={scrollRef} style={{ height: "4500vh", background: "#050508" }}>
      <canvas
        ref={pixelCanvasRef}
        style={{ position: "fixed", inset: 0, zIndex: 1, width: "100%", height: "100%", imageRendering: "pixelated" }}
      />
      <canvas
        ref={formCanvasRef}
        style={{ position: "fixed", inset: 0, zIndex: 2 }}
      />

      {/* S0 — attractor — top-left */}
      <div ref={s0Ref} style={{ ...sec, top: "11%", left: "7%", color: "#e8eaf2" }}>
        <span style={lbl("rgba(200,210,240,0.30)")}>01</span>
        <h2 style={{ fontSize: "clamp(2.2rem,5.5vw,4.5rem)", fontWeight: 700, lineHeight: 1.02, margin: 0 }}>
          Lorem ipsum<br />dolor sit amet
        </h2>
      </div>

      {/* S1 — flow field — bottom-right */}
      <div ref={s1Ref} style={{ ...sec, bottom: "13%", right: "7%", textAlign: "right", color: "#dde0f0" }}>
        <span style={lbl("rgba(190,200,235,0.28)")}>02</span>
        <p style={{ fontSize: "clamp(1rem,2.4vw,1.7rem)", lineHeight: 1.85, margin: 0 }}>
          Lorem ipsum dolor<br />consectetur adipiscing<br />sed do eiusmod
        </p>
      </div>

      {/* S2 — chrome 1 — top-left */}
      <div ref={s2Ref} style={{ ...sec, top: "11%", left: "7%", color: "#ced6e8" }}>
        <span style={lbl("#4a5870")}>03</span>
        <h2 style={{ fontSize: "clamp(2.2rem,5.5vw,4.5rem)", fontWeight: 700, lineHeight: 1.02, margin: 0 }}>
          Consectetur<br />adipiscing elit
        </h2>
      </div>

      {/* S3 — chrome 2 — bottom-right */}
      <div ref={s3Ref} style={{ ...sec, bottom: "13%", right: "7%", textAlign: "right", color: "#ced6e8" }}>
        <span style={lbl("#4a5870")}>04</span>
        <p style={{ fontSize: "clamp(1rem,2.4vw,1.7rem)", lineHeight: 1.85, margin: 0 }}>
          Sed do eiusmod<br />tempor incididunt<br />ut labore et dolore
        </p>
      </div>

      {/* S4 — depth transition — center-left */}
      <div ref={s4Ref} style={{ ...sec, top: "50%", transform: "translateY(-50%)", left: "7%", color: "#c0b2e0" }}>
        <span style={lbl("#5a36a8")}>05</span>
        <h2 style={{ fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 700, lineHeight: 1.05, margin: 0 }}>
          Lorem ipsum<br />eiusmod
        </h2>
      </div>

      {/* S5 — depth vein — top-right */}
      <div ref={s5Ref} style={{ ...sec, top: "11%", right: "7%", textAlign: "right", color: "#c0b2e0" }}>
        <span style={lbl("#5a36a8")}>06</span>
        <p style={{ fontSize: "clamp(1rem,2.2vw,1.5rem)", lineHeight: 1.95, margin: 0 }}>
          Lorem ipsum dolor<br />amet consectetur<br />eiusmod tempor
        </p>
      </div>

      {/* S6 — amber — bottom-left */}
      <div ref={s6Ref} style={{ ...sec, bottom: "13%", left: "7%", color: "#dece98" }}>
        <span style={lbl("#876018")}>07</span>
        <p style={{ fontSize: "clamp(1rem,2.4vw,1.7rem)", lineHeight: 1.85, margin: 0 }}>
          Sed do eiusmod tempor<br />incididunt ut labore<br />et dolore magna
        </p>
      </div>

      {/* S7 — circle return — center */}
      <div ref={s7Ref} style={{ ...sec, bottom: "11%", left: "50%", transform: "translateX(-50%)", textAlign: "center", color: "#dece98" }}>
        <span style={lbl("#876018")}>08</span>
        <p style={{ fontSize: "clamp(0.9rem,1.9vw,1.3rem)", margin: 0 }}>
          Lorem ipsum dolor sit amet
        </p>
      </div>
    </div>
  );
}
