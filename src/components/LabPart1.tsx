"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { LabPartChrome } from "./LabPartChrome";
import { useLabLocale, type LabLocale } from "../hooks/useLabLocale";

// ── Helpers ────────────────────────────────────────────────────────────────────
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── Palette ────────────────────────────────────────────────────────────────────
const BG      = "#0a0a0c";
const PRIMARY = "#f0ede8";
const ACCENT  = "#D86020";
// numeric channels for canvas rgba() calls
const BG_R = 10,  BG_G = 10,  BG_B = 12;
const PR_R = 240, PR_G = 237, PR_B = 232;
const AC_R = 216, AC_G = 96,  AC_B = 32;

// ── Chapter boundaries ─────────────────────────────────────────────────────────
const CH: [number, number][] = [
  [0.00, 0.17],
  [0.17, 0.34],
  [0.34, 0.51],
  [0.51, 0.67],
  [0.67, 0.84],
  [0.84, 1.00],
];
const FADE = 0.022;

function chAlpha(sp: number, i: number): number {
  const [a, b] = CH[i];
  return ss(a, a + FADE, sp) * (1 - ss(b - FADE, b, sp));
}

function chProgress(sp: number, i: number): number {
  const [a, b] = CH[i];
  return Math.max(0, Math.min(1, (sp - a) / (b - a)));
}

// ── CH3: Gray-Scott reaction-diffusion ─────────────────────────────────────────
const GS_W = 120, GS_H = 120, GS_N = GS_W * GS_H;
const GS_FEED = 0.037, GS_KILL = 0.062;
const GS_DU = 0.16, GS_DV = 0.08, GS_DT = 1.0;
let gsU  = new Float32Array(GS_N);
let gsV  = new Float32Array(GS_N);
let gsU2 = new Float32Array(GS_N);
let gsV2 = new Float32Array(GS_N);
let gsReady = false;

function gsInit() {
  gsU.fill(1);
  gsV.fill(0);
  // single central seed square 10×10 with u=0.5, v=0.25
  const cx = Math.floor(GS_W / 2), cy = Math.floor(GS_H / 2);
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      const ix = (cx + dx + GS_W) % GS_W;
      const iy = (cy + dy + GS_H) % GS_H;
      gsU[iy * GS_W + ix] = 0.5;
      gsV[iy * GS_W + ix] = 0.25;
    }
  }
  gsReady = true;
}

function gsStep(steps: number) {
  for (let s = 0; s < steps; s++) {
    for (let y = 0; y < GS_H; y++) {
      for (let x = 0; x < GS_W; x++) {
        const i = y * GS_W + x;
        const u = gsU[i], v = gsV[i];
        const lapU =
          gsU[((y - 1 + GS_H) % GS_H) * GS_W + x] +
          gsU[((y + 1) % GS_H) * GS_W + x] +
          gsU[y * GS_W + (x - 1 + GS_W) % GS_W] +
          gsU[y * GS_W + (x + 1) % GS_W] - 4 * u;
        const lapV =
          gsV[((y - 1 + GS_H) % GS_H) * GS_W + x] +
          gsV[((y + 1) % GS_H) * GS_W + x] +
          gsV[y * GS_W + (x - 1 + GS_W) % GS_W] +
          gsV[y * GS_W + (x + 1) % GS_W] - 4 * v;
        const uvv = u * v * v;
        gsU2[i] = Math.max(0, Math.min(1, u + GS_DT * (GS_DU * lapU - uvv + GS_FEED * (1 - u))));
        gsV2[i] = Math.max(0, Math.min(1, v + GS_DT * (GS_DV * lapV + uvv - (GS_KILL + GS_FEED) * v)));
      }
    }
    [gsU, gsU2] = [gsU2, gsU];
    [gsV, gsV2] = [gsV2, gsV];
  }
}

// ── CH4: L-system deterministic branches ──────────────────────────────────────
interface Branch { x1: number; y1: number; x2: number; y2: number; gen: number; }

function seededRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff);
  };
}

function buildBranches(
  x: number, y: number, angle: number, len: number,
  gen: number, maxGen: number, rand: () => number, out: Branch[]
) {
  if (gen > maxGen || len < 2) return;
  const x2 = x + len * Math.cos(angle);
  const y2 = y + len * Math.sin(angle);
  out.push({ x1: x, y1: y, x2, y2, gen });
  const spread = 0.35 + rand() * 0.15;
  const leftA  = angle - spread * (0.8 + rand() * 0.4);
  const rightA = angle + spread * (0.8 + rand() * 0.4);
  const scale  = 0.62 + rand() * 0.12;
  if (rand() > 0.15) buildBranches(x2, y2, leftA,  len * scale, gen + 1, maxGen, rand, out);
  if (rand() > 0.15) buildBranches(x2, y2, rightA, len * scale, gen + 1, maxGen, rand, out);
}

// ── CH5: Cymatics offscreen ────────────────────────────────────────────────────
let cymCanvas: HTMLCanvasElement | null = null;
let cymCtx:    CanvasRenderingContext2D | null = null;

// ── CH6: Lissajous offscreen accumulator ──────────────────────────────────────
let lissCanvas: HTMLCanvasElement | null = null;
let lissCtx:    CanvasRenderingContext2D | null = null;

// ── Translations ───────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    chLabels: [
      "CH1 · SEKKEI",
      "CH2 · KAITEN",
      "CH3 · HAMON",
      "CH4 · MYCELIA",
      "CH5 · FIELD",
      "CH6 · BLOOM",
    ],
    chHeadings: [
      ["FORM",      "drawn by mathematics"],
      ["MACHINE",   "the gear the pen traces"],
      ["CHEMISTRY", "reaction without instruction"],
      ["NETWORK",   "the circle becomes a node"],
      ["FORCE",     "the circle as source of influence"],
      ["SYNTHESIS", "every curve, a sum of circles"],
    ] as [string, string][],
    canvas: {
      line1: "geometry · chemistry · networks · forces",
      line2: "every curve is a sum of circles",
      line3: "the circle was always all of these",
    },
  },
  pt: {
    chLabels: [
      "CAP1 · SEKKEI",
      "CAP2 · KAITEN",
      "CAP3 · HAMON",
      "CAP4 · MYCELIA",
      "CAP5 · CAMPO",
      "CAP6 · BLOOM",
    ],
    chHeadings: [
      ["FORMA",     "desenhada pela matemática"],
      ["MÁQUINA",   "a engrenagem que a caneta traça"],
      ["QUÍMICA",   "reação sem instrução"],
      ["REDE",      "o círculo vira um nó"],
      ["FORÇA",     "o círculo como fonte de influência"],
      ["SÍNTESE",   "cada curva, uma soma de círculos"],
    ] as [string, string][],
    canvas: {
      line1: "geometria · química · redes · forças",
      line2: "cada curva é uma soma de círculos",
      line3: "o círculo sempre foi tudo isso",
    },
  },
} satisfies Record<LabLocale, {
  chLabels: string[];
  chHeadings: [string, string][];
  canvas: { line1: string; line2: string; line3: string };
}>;

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
  localeRef: React.MutableRefObject<LabLocale>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    gsReady    = false;
    cymCanvas  = null;
    cymCtx     = null;
    lissCanvas = null;
    lissCtx    = null;
    let lastCh = -1;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let frameN = 0;

      // (CH5 Cymatics uses no local state — rendered per-frame from cymCanvas)

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        p.resizeCanvas(W, H);
        cymCanvas = null; cymCtx = null;
        if (lissCanvas) {
          lissCanvas.width  = W;
          lissCanvas.height = H;
          if (lissCtx) lissCtx.clearRect(0, 0, W, H);
        }
      };

      p.draw = () => {
        frameN++;
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)
        ));
        const dc = p.drawingContext as CanvasRenderingContext2D;

        // Which chapter?
        let currentCh = 5;
        for (let c = 0; c < 6; c++) {
          const [a, b] = CH[c];
          if (sp >= a && sp <= b + 0.001) { currentCh = c; break; }
        }

        // Chapter enter hooks
        if (currentCh !== lastCh) {
          if (currentCh === 2 && !gsReady) gsInit();
          if (currentCh === 4) { cymCanvas = null; cymCtx = null; }
          if (currentCh === 5) {
            lissCanvas        = document.createElement("canvas");
            lissCanvas.width  = W;
            lissCanvas.height = H;
            lissCtx           = lissCanvas.getContext("2d");
            if (lissCtx) {
              lissCtx.fillStyle = BG;
              lissCtx.fillRect(0, 0, W, H);
            }
          }
          lastCh = currentCh;
        }

        // Clear background
        p.background(BG_R, BG_G, BG_B);

        const cx = W * 0.5, cy = H * 0.5;
        const R  = Math.min(W, H) * 0.35;

        // ── PERMANENT BASE CIRCLE ──────────────────────────────────────────────
        const baseAlpha = currentCh === 5 ? 0.3 : 1.0;
        dc.save();
        dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${baseAlpha})`;
        dc.lineWidth   = 1.2;
        dc.beginPath(); dc.arc(cx, cy, R, 0, Math.PI * 2); dc.stroke();
        dc.restore();

        // ══ CH1: SEKKEI — Geometry ══════════════════════════════════════════════
        if (currentCh === 0) {
          const t  = chProgress(sp, 0);
          const a1 = chAlpha(sp, 0);

          // Arc reveal: 0→1 as t goes 0→0.29
          const arcT = Math.min(1, t / 0.29);

          if (arcT < 0.999) {
            // Mask the permanent circle with a BG patch, then draw partial arc
            dc.save();
            dc.fillStyle = BG;
            dc.beginPath(); dc.arc(cx, cy, R + 4, 0, Math.PI * 2); dc.fill();
            dc.strokeStyle = PRIMARY;
            dc.lineWidth   = 1.2;
            dc.beginPath();
            dc.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * arcT);
            dc.stroke();
            dc.restore();

            // Pen-tip ACCENT dot at arc's leading edge
            if (arcT > 0.01) {
              const ea = -Math.PI / 2 + Math.PI * 2 * arcT;
              dc.save();
              dc.fillStyle = ACCENT;
              dc.beginPath();
              dc.arc(cx + R * Math.cos(ea), cy + R * Math.sin(ea), 3, 0, Math.PI * 2);
              dc.fill();
              dc.restore();
            }
          }

          // Hypotrochoid — drawn once circle is mostly revealed (t > 0.29)
          if (t > 0.29) {
            const hypoT = (t - 0.29) / 0.71;
            const r = R * 0.33, d = R * 0.65;
            const totalAngle = Math.PI * 12;
            const drawAngle  = hypoT * totalAngle;
            // Rotation phase increases near end of chapter (transition to CH2)
            const phase = ss(0.76, 1.0, t) * Math.PI * 2 * 3;

            dc.save();
            dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(a1 * 0.7).toFixed(3)})`;
            dc.lineWidth   = 0.8;
            dc.beginPath();
            const STEP = 0.04;
            let first = true;
            for (let ang = 0; ang <= drawAngle; ang += STEP) {
              const a = ang + phase;
              const hx = cx + (R - r) * Math.cos(a) + d * Math.cos(((R - r) / r) * a);
              const hy = cy + (R - r) * Math.sin(a) - d * Math.sin(((R - r) / r) * a);
              if (first) { dc.moveTo(hx, hy); first = false; }
              else          dc.lineTo(hx, hy);
            }
            dc.stroke();
            dc.restore();

            // Pen tip at leading edge
            if (hypoT < 0.95) {
              const a = drawAngle + phase;
              const hx = cx + (R - r) * Math.cos(a) + d * Math.cos(((R - r) / r) * a);
              const hy = cy + (R - r) * Math.sin(a) - d * Math.sin(((R - r) / r) * a);
              dc.save();
              dc.fillStyle = ACCENT;
              dc.beginPath(); dc.arc(hx, hy, 3, 0, Math.PI * 2); dc.fill();
              dc.restore();
            }
          }

          // Gentle breathing when static (t > 0.71)
          if (t > 0.71) {
            const breathe = 1 + 0.003 * Math.sin(frameN * 0.06);
            dc.save();
            dc.strokeStyle = PRIMARY;
            dc.lineWidth   = 1.2 * breathe;
            dc.beginPath(); dc.arc(cx, cy, R * breathe, 0, Math.PI * 2); dc.stroke();
            dc.restore();
          }
        }

        // ══ CH2: KAITEN — Machine ═══════════════════════════════════════════════
        else if (currentCh === 1) {
          const t  = chProgress(sp, 1);
          const a2 = chAlpha(sp, 1);

          // Main gear rotation — decelerates at end of chapter
          const decel   = 1 - ss(0.88, 1.0, t);
          const mainRot = t * Math.PI * 8 * decel;

          // Gear geometry — satellites tangent externally to main circle
          const R_main = R;
          const N_main = 24;
          const R_sat  = R_main * 0.30;
          // Center of each satellite at distance R_main + R_sat from main center
          const orbitR = R_main + R_sat;
          // Tooth count by gear ratio so teeth mesh correctly
          const N_sat  = Math.max(5, Math.round(N_main * (R_sat / R_main)));
          // Transmission ratio (external mesh reverses spin direction)
          const satOmega = -(N_main / N_sat);

          // Draw gear: pitch circle + rectangular tooth stubs
          const drawGear = (
            gx: number, gy: number, gr: number, N: number,
            rot: number, alpha: number, rr: number, rg: number, rb: number
          ) => {
            const toothLen = gr * 0.13;
            // angular half-width of each tooth (≈22% of pitch)
            const toothW   = (Math.PI * gr / N) * 0.22;
            dc.save();
            dc.strokeStyle = `rgba(${rr},${rg},${rb},${alpha.toFixed(3)})`;
            dc.lineWidth   = 1.2;
            dc.beginPath(); dc.arc(gx, gy, gr, 0, Math.PI * 2); dc.stroke();
            dc.lineWidth = 0.9;
            for (let k = 0; k < N; k++) {
              const aa   = rot + (k / N) * Math.PI * 2;
              const ca   = Math.cos(aa), sa = Math.sin(aa);
              const tx   = -sa, ty = ca; // tangent direction
              // four corners of rectangular tooth
              const x0 = gx + gr * ca - toothW * tx;
              const y0 = gy + gr * sa - toothW * ty;
              const x1 = gx + gr * ca + toothW * tx;
              const y1 = gy + gr * sa + toothW * ty;
              const x2 = gx + (gr + toothLen) * ca + toothW * tx;
              const y2 = gy + (gr + toothLen) * sa + toothW * ty;
              const x3 = gx + (gr + toothLen) * ca - toothW * tx;
              const y3 = gy + (gr + toothLen) * sa - toothW * ty;
              dc.beginPath();
              dc.moveTo(x0, y0); dc.lineTo(x1, y1);
              dc.lineTo(x2, y2); dc.lineTo(x3, y3);
              dc.closePath(); dc.stroke();
            }
            dc.restore();
          };

          // Pitch-circle reference lines (center → satellite center), very faint
          dc.save();
          dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(a2 * 0.06).toFixed(3)})`;
          dc.lineWidth   = 0.5;
          dc.setLineDash([2, 5]);
          for (let k = 0; k < 3; k++) {
            const ba = (k / 3) * Math.PI * 2;
            const sx = cx + orbitR * Math.cos(ba);
            const sy = cy + orbitR * Math.sin(ba);
            dc.beginPath(); dc.moveTo(cx, cy); dc.lineTo(sx, sy); dc.stroke();
          }
          dc.setLineDash([]);
          dc.restore();

          // Central gear
          drawGear(cx, cy, R_main, N_main, mainRot, a2 * 0.9, PR_R, PR_G, PR_B);

          // 3 satellite gears — phase aligned so teeth mesh at contact point
          for (let k = 0; k < 3; k++) {
            const ba = (k / 3) * Math.PI * 2;
            const sx = cx + orbitR * Math.cos(ba);
            const sy = cy + orbitR * Math.sin(ba);
            // At contact point the satellite tooth must interleave with main tooth gap.
            // meshOffset points inward + half-tooth offset for interleaving.
            const meshOffset = ba + Math.PI + (Math.PI / N_sat);
            const phi_sat = satOmega * mainRot + meshOffset;
            drawGear(sx, sy, R_sat, N_sat, phi_sat, a2 * 0.7, AC_R, AC_G, AC_B);
          }

          // Vibration + GS preview as we approach CH3
          const vibrate = ss(0.88, 1.0, t);
          if (vibrate > 0.01) {
            const vAmp = vibrate * 3;
            dc.save();
            dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(a2 * 0.35).toFixed(3)})`;
            dc.lineWidth   = 1.0;
            dc.beginPath();
            dc.arc(
              cx + (Math.random() - 0.5) * vAmp,
              cy + (Math.random() - 0.5) * vAmp,
              R  + (Math.random() - 0.5) * vAmp * 0.5,
              0, Math.PI * 2
            );
            dc.stroke();
            dc.restore();

            // GS bleed-in inside circle
            if (!gsReady) gsInit();
            gsStep(2);
            dc.save();
            dc.beginPath(); dc.arc(cx, cy, R, 0, Math.PI * 2); dc.clip();
            dc.globalAlpha = vibrate * 0.3;
            const cellW2 = (R * 2) / GS_W, cellH2 = (R * 2) / GS_H;
            for (let gy = 0; gy < GS_H; gy++) {
              for (let gx2 = 0; gx2 < GS_W; gx2++) {
                const v = gsV[gy * GS_W + gx2];
                if (v < 0.05) continue;
                const intensity = Math.min(1, v * 2.5);
                dc.fillStyle = `rgba(${Math.round(lerp(BG_R, PR_R, intensity))},${Math.round(lerp(BG_G, PR_G, intensity))},${Math.round(lerp(BG_B, PR_B, intensity))},1)`;
                dc.fillRect(cx - R + gx2 * cellW2, cy - R + gy * cellH2, cellW2 + 0.5, cellH2 + 0.5);
              }
            }
            dc.globalAlpha = 1;
            dc.restore();
          }
        }

        // ══ CH3: HAMON — Chemistry ══════════════════════════════════════════════
        else if (currentCh === 2) {
          const t  = chProgress(sp, 2);
          const a3 = chAlpha(sp, 2);

          if (!gsReady) gsInit();
          gsStep(4);

          // Render GS clipped inside circle
          dc.save();
          dc.beginPath(); dc.arc(cx, cy, R, 0, Math.PI * 2); dc.clip();
          const cellW = (R * 2) / GS_W, cellH = (R * 2) / GS_H;
          for (let gy = 0; gy < GS_H; gy++) {
            for (let gx2 = 0; gx2 < GS_W; gx2++) {
              const v = gsV[gy * GS_W + gx2];
              if (v < 0.04) continue;
              const intensity = Math.min(1, v * 2.8);
              const rr = Math.round(lerp(BG_R, PR_R, intensity));
              const rg = Math.round(lerp(BG_G, PR_G, intensity));
              const rb = Math.round(lerp(BG_B, PR_B, intensity));
              dc.fillStyle = `rgba(${rr},${rg},${rb},${(a3 * 0.92).toFixed(3)})`;
              dc.fillRect(cx - R + gx2 * cellW, cy - R + gy * cellH, cellW + 0.6, cellH + 0.6);
            }
          }
          dc.restore();

          // Circle border on top of clip
          dc.save();
          dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${a3.toFixed(3)})`;
          dc.lineWidth   = 1.5;
          dc.beginPath(); dc.arc(cx, cy, R, 0, Math.PI * 2); dc.stroke();
          dc.restore();

          // Transition to CH4: escape lines grow from border V-concentrations
          const escapeT = ss(0.84, 1.0, t);
          if (escapeT > 0.01) {
            for (let k = 0; k < 20; k++) {
              const angle = (k / 20) * Math.PI * 2;
              const edgeGX = Math.round((Math.cos(angle) * 0.9 + 1) * 0.5 * GS_W);
              const edgeGY = Math.round((Math.sin(angle) * 0.9 + 1) * 0.5 * GS_H);
              const edgeI  = Math.max(0, Math.min(GS_N - 1, edgeGY * GS_W + edgeGX));
              const v = gsV[edgeI];
              if (v < 0.1) continue;
              const bx = cx + R * Math.cos(angle), by = cy + R * Math.sin(angle);
              const ex = bx + escapeT * v * 65 * Math.cos(angle);
              const ey = by + escapeT * v * 65 * Math.sin(angle);
              dc.save();
              dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(escapeT * v * 0.7).toFixed(3)})`;
              dc.lineWidth   = 0.8;
              dc.beginPath(); dc.moveTo(bx, by); dc.lineTo(ex, ey); dc.stroke();
              dc.restore();
            }
          }
        }

        // ══ CH4: MYCELIA — Network ══════════════════════════════════════════════
        else if (currentCh === 3) {
          const t  = chProgress(sp, 3);
          const a4 = chAlpha(sp, 3);

          const maxGen   = Math.round(lerp(1, 4, t));
          const N_ORIGINS = 24;
          const branchLen = R * 0.28;

          for (let oi = 0; oi < N_ORIGINS; oi++) {
            const originAngle = (oi / N_ORIGINS) * Math.PI * 2;
            const ox  = cx + R * Math.cos(originAngle);
            const oy2 = cy + R * Math.sin(originAngle);
            const rand = seededRand(oi * 12347 + 9973);
            const branches: Branch[] = [];
            buildBranches(ox, oy2, originAngle, branchLen, 0, maxGen, rand, branches);

            for (const br of branches) {
              let alpha: number, rr: number, rg: number, rb: number;
              if (br.gen === 0)      { alpha = a4 * 0.90; rr = PR_R; rg = PR_G; rb = PR_B; }
              else if (br.gen === 1) { alpha = a4 * 0.50; rr = PR_R; rg = PR_G; rb = PR_B; }
              else if (br.gen === 2) { alpha = a4 * 0.28; rr = AC_R; rg = AC_G; rb = AC_B; }
              else                   { alpha = a4 * 0.15; rr = AC_R; rg = AC_G; rb = AC_B; }
              const sw = Math.max(0.3, 1.2 - br.gen * 0.25);
              dc.save();
              dc.strokeStyle = `rgba(${rr},${rg},${rb},${alpha.toFixed(3)})`;
              dc.lineWidth   = sw;
              dc.beginPath(); dc.moveTo(br.x1, br.y1); dc.lineTo(br.x2, br.y2); dc.stroke();
              dc.restore();
            }
          }

          // Transition to CH5: concentric arc ghosts align the outer branches
          const alignT = ss(0.82, 1.0, t);
          if (alignT > 0.01) {
            dc.save();
            dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(alignT * 0.22).toFixed(3)})`;
            dc.lineWidth   = 0.6;
            dc.beginPath(); dc.arc(cx, cy, R * 1.35, 0, Math.PI * 2); dc.stroke();
            dc.beginPath(); dc.arc(cx, cy, R * 1.65, 0, Math.PI * 2); dc.stroke();
            dc.restore();
          }
        }

        // ══ CH5: CYMATICS — Resonance ═══════════════════════════════════════════
        else if (currentCh === 4) {
          const t  = chProgress(sp, 4);
          const a5 = chAlpha(sp, 4);

          // Interpolate Chladni mode (m, n) through 5 configurations
          let m: number, n: number;
          if      (t < 0.20) { m = lerp(1, 2, t / 0.20);        n = 1; }
          else if (t < 0.40) { m = 2;                            n = lerp(1, 2, (t-0.20)/0.20); }
          else if (t < 0.60) { m = lerp(2, 3, (t-0.40)/0.20);   n = 2; }
          else if (t < 0.80) { m = 3;                            n = lerp(2, 3, (t-0.60)/0.20); }
          else               { m = lerp(3, 4, (t-0.80)/0.20);   n = 3; }

          const omega   = 1.0;
          const time5   = frameN * 0.018;

          // Lazy-init Cymatics offscreen at reduced resolution (SCALE=4 for perf)
          const SCALE = 4;
          const CW = Math.ceil(W / SCALE), CHh = Math.ceil(H / SCALE);
          if (!cymCanvas || cymCanvas.width !== CW || cymCanvas.height !== CHh) {
            cymCanvas     = document.createElement("canvas");
            cymCanvas.width = CW; cymCanvas.height = CHh;
            cymCtx        = cymCanvas.getContext("2d");
          }

          if (cymCtx) {
            const img  = cymCtx.createImageData(CW, CHh);
            const data = img.data;
            const scx  = cx / SCALE, scy = cy / SCALE, sR = R / SCALE;

            for (let py2 = 0; py2 < CHh; py2++) {
              for (let px2 = 0; px2 < CW; px2++) {
                const dx2 = px2 - scx, dy2 = py2 - scy;
                const r2  = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (r2 > sR + 1) continue;
                const theta2 = Math.atan2(dy2, dx2);
                const u = Math.sin(n * Math.PI * r2 / sR) * Math.cos(m * theta2 + time5 * omega);
                const idx2 = (py2 * CW + px2) * 4;
                if (Math.abs(u) < 0.08) {
                  // Nodal line → ACCENT
                  const strength = 1 - Math.abs(u) / 0.08;
                  data[idx2]   = AC_R; data[idx2+1] = AC_G; data[idx2+2] = AC_B;
                  data[idx2+3] = Math.round(strength * a5 * 210);
                } else if (u > 0) {
                  // Positive region → PRIMARY
                  data[idx2]   = PR_R; data[idx2+1] = PR_G; data[idx2+2] = PR_B;
                  data[idx2+3] = Math.round(u * a5 * 140);
                } else {
                  // Negative region → dim BG
                  data[idx2]   = BG_R + 18; data[idx2+1] = BG_G + 18; data[idx2+2] = BG_B + 22;
                  data[idx2+3] = Math.round(-u * a5 * 55);
                }
              }
            }
            cymCtx.putImageData(img, 0, 0);
            dc.save();
            dc.imageSmoothingEnabled = true;
            (dc as CanvasRenderingContext2D & { imageSmoothingQuality: string }).imageSmoothingQuality = "low";
            dc.drawImage(cymCanvas, 0, 0, W, H);
            dc.restore();
          }

          // Circle border stays visible
          dc.save();
          dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(a5 * 0.75).toFixed(3)})`;
          dc.lineWidth   = 1.5;
          dc.beginPath(); dc.arc(cx, cy, R, 0, Math.PI * 2); dc.stroke();
          dc.restore();

          // Transition CH5→CH6: overlay first Lissajous trace emerging
          const vibT = ss(0.82, 1.0, t);
          if (vibT > 0.01) {
            dc.save();
            dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(vibT * 0.22).toFixed(3)})`;
            dc.lineWidth   = 0.8;
            dc.beginPath();
            for (let k = 0; k <= 400; k++) {
              const ang = (k / 400) * Math.PI * 2 * 2;
              const lx  = cx + R * Math.sin(1 * ang + Math.PI / 2);
              const ly  = cy + R * Math.sin(1 * ang);
              if (k === 0) dc.moveTo(lx, ly); else dc.lineTo(lx, ly);
            }
            dc.stroke();
            dc.restore();
          }
        }

        // ══ CH6: BLOOM — Synthesis ══════════════════════════════════════════════
        else if (currentCh === 5) {
          const t  = chProgress(sp, 5);
          const a6 = chAlpha(sp, 5);

          // Lissajous parameter schedule — 6 keyframes for more depth
          let la: number, lb: number, ld: number;
          if      (t < 0.15) { la = lerp(1, 2, t/0.15);          lb = 1;               ld = lerp(Math.PI/2,  Math.PI/4,  t/0.15); }
          else if (t < 0.30) { la = lerp(2, 3, (t-0.15)/0.15);   lb = lerp(1,2,(t-0.15)/0.15); ld = lerp(Math.PI/4,  Math.PI/6,  (t-0.15)/0.15); }
          else if (t < 0.46) { la = lerp(3, 5, (t-0.30)/0.16);   lb = lerp(2,4,(t-0.30)/0.16); ld = lerp(Math.PI/6,  Math.PI/8,  (t-0.30)/0.16); }
          else if (t < 0.62) { la = lerp(5, 7, (t-0.46)/0.16);   lb = lerp(4,5,(t-0.46)/0.16); ld = lerp(Math.PI/8,  Math.PI/10, (t-0.46)/0.16); }
          else if (t < 0.78) { la = lerp(7, 8, (t-0.62)/0.16);   lb = lerp(5,7,(t-0.62)/0.16); ld = lerp(Math.PI/10, Math.PI/12, (t-0.62)/0.16); }
          else               { la = 8; lb = 7; ld = Math.PI/12; }

          // Accumulate trace in offscreen canvas
          if (lissCtx && lissCanvas) {
            const STEPS_PER_FRAME = 80;
            const totalT_liss = Math.PI * 2 * Math.max(la, lb) * 4;
            const dt_liss = totalT_liss / (800 * Math.max(la, lb));
            const lissPhase = (frameN * dt_liss * STEPS_PER_FRAME) % totalT_liss;

            lissCtx.save();
            lissCtx.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},0.10)`;
            lissCtx.lineWidth   = 0.8;
            lissCtx.beginPath();
            for (let s = 0; s < STEPS_PER_FRAME; s++) {
              const ang = lissPhase + s * dt_liss;
              const lx  = cx + R * Math.sin(la * ang + ld);
              const ly  = cy + R * Math.sin(lb * ang);
              if (s === 0) lissCtx.moveTo(lx, ly); else lissCtx.lineTo(lx, ly);
            }
            lissCtx.stroke();
            lissCtx.restore();

            // Blit to main canvas
            dc.save();
            dc.globalAlpha = a6 * 0.9;
            dc.drawImage(lissCanvas, 0, 0);
            dc.globalAlpha = 1;
            dc.restore();
          }

          // Base circle (faint reference)
          dc.save();
          dc.strokeStyle = `rgba(${PR_R},${PR_G},${PR_B},${(a6 * 0.3).toFixed(3)})`;
          dc.lineWidth   = 1.2;
          dc.beginPath(); dc.arc(cx, cy, R, 0, Math.PI * 2); dc.stroke();
          dc.restore();

          // Moving head dot with glow — disappears at t > 0.93
          const headA = a6 * (1 - ss(0.90, 0.95, t));
          if (headA > 0.01) {
            const ang = (frameN * 0.035) % (Math.PI * 2);
            const hx  = cx + R * Math.sin(la * ang + ld);
            const hy  = cy + R * Math.sin(lb * ang);
            dc.save();
            // outer glow
            dc.fillStyle = `rgba(${AC_R},${AC_G},${AC_B},${(headA * 0.14).toFixed(3)})`;
            dc.beginPath(); dc.arc(hx, hy, 9, 0, Math.PI * 2); dc.fill();
            dc.fillStyle = `rgba(${AC_R},${AC_G},${AC_B},${(headA * 0.28).toFixed(3)})`;
            dc.beginPath(); dc.arc(hx, hy, 5, 0, Math.PI * 2); dc.fill();
            // head
            dc.fillStyle = `rgba(${AC_R},${AC_G},${AC_B},${headA.toFixed(3)})`;
            dc.beginPath(); dc.arc(hx, hy, 2.5, 0, Math.PI * 2); dc.fill();
            dc.restore();
          }

          // Three-line text — staggered fade-in
          const textY = cy + R + 52;
          const line1A = ss(0.78, 0.84, t) * a6;
          const line2A = ss(0.84, 0.90, t) * a6;
          const line3A = ss(0.90, 0.97, t) * a6;
          const canvasCopy = TRANSLATIONS[localeRef.current].canvas;
          dc.save();
          dc.textAlign    = "center";
          dc.textBaseline = "middle";
          if (line1A > 0.01) {
            dc.globalAlpha = line1A;
            dc.font        = "8px 'Courier New', monospace";
            dc.fillStyle   = `rgba(${AC_R},${AC_G},${AC_B},1)`;
            dc.fillText(canvasCopy.line1, cx, textY);
          }
          if (line2A > 0.01) {
            dc.globalAlpha = line2A;
            dc.font        = "10px 'Courier New', monospace";
            dc.fillStyle   = PRIMARY;
            dc.fillText(canvasCopy.line2, cx, textY + 22);
          }
          if (line3A > 0.01) {
            dc.globalAlpha = line3A;
            dc.font        = "bold 14px 'Courier New', monospace";
            dc.fillStyle   = PRIMARY;
            dc.fillText(canvasCopy.line3, cx, textY + 48);
          }
          dc.textAlign    = "left";
          dc.textBaseline = "alphabetic";
          dc.globalAlpha  = 1;
          dc.restore();
        }

        // ── Section text overlay opacities ────────────────────────────────────
        const SEC_WINDOWS = [
          [0.01, 0.04, 0.13, 0.16],
          [0.18, 0.21, 0.30, 0.33],
          [0.35, 0.38, 0.47, 0.50],
          [0.52, 0.55, 0.63, 0.66],
          [0.68, 0.71, 0.80, 0.83],
          [0.85, 0.88, 0.96, 0.99],
        ];
        for (let i = 0; i < 6; i++) {
          const [i0, i1, o0, o1] = SEC_WINDOWS[i];
          const alpha = secAlpha(sp, i0, i1, o0, o1);
          const secEl = sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity       = alpha.toFixed(3);
          secEl.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
        }
      };
    };

    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── Chapter copy ───────────────────────────────────────────────────────────────
// Locale-aware labels and headings are provided by TRANSLATIONS above.

const CH_POSITIONS: React.CSSProperties[] = [
  { top: "13%",    left: "6%" },
  { bottom: "14%", right: "7%",  textAlign: "right" },
  { top: "50%",    left: "6%",   transform: "translateY(-50%)" },
  { top: "13%",    right: "7%",  textAlign: "right" },
  { bottom: "14%", left: "6%" },
  { top: "50%",    left: "50%",  textAlign: "center", transform: "translate(-50%,-50%)" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function LabPart1() {
  const [locale] = useLabLocale();
  const localeRef = useRef<LabLocale>(locale);

  // Keep localeRef in sync so the running sketch always reads the current locale
  // without needing to be rebuilt.
  localeRef.current = locale;

  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(6).fill(null));

  useEffect(() => {
    const container = containerRef.current, scroll = scrollRef.current;
    if (!container || !scroll) return;
    let inst: p5Type | null = null, alive = true;
    buildSketch(container, scroll, sectionEls.current, localeRef).then(p5inst => {
      if (!alive) { p5inst.remove(); return; }
      inst = p5inst;
    });
    return () => { alive = false; inst?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const base: React.CSSProperties = {
    position:      "fixed",
    opacity:       0,
    pointerEvents: "none",
    fontFamily:    "'Arial','Helvetica Neue',sans-serif",
    zIndex:        10,
    maxWidth:      "28rem",
  };

  return (
    <>
      <LabPartChrome partNumber={1} nextRoute="/lab-part-2" />
      <div ref={scrollRef} style={{ height: "1600vh", background: BG }}>
        <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

        {TRANSLATIONS[locale].chLabels.map((label, i) => {
          const [headline, sub] = TRANSLATIONS[locale].chHeadings[i];
          return (
            <div
              key={i}
              ref={el => { sectionEls.current[i] = el; }}
              style={{ ...base, ...CH_POSITIONS[i] }}
            >
              <span style={{
                display:       "block",
                fontSize:      "0.55rem",
                letterSpacing: "0.38em",
                color:         ACCENT,
                textTransform: "uppercase",
                marginBottom:  10,
              }}>
                {label}
              </span>
              <h2 style={{
                margin:        0,
                fontSize:      "clamp(1.7rem,3.8vw,3.2rem)",
                fontWeight:    700,
                lineHeight:    1.05,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                color:         PRIMARY,
              }}>
                {headline}
                <br />
                <span style={{
                  fontWeight:    300,
                  fontSize:      "clamp(0.9rem,2.0vw,1.6rem)",
                  letterSpacing: "0.07em",
                  color:         `rgba(${AC_R},${AC_G},${AC_B},0.75)`,
                  textTransform: "lowercase",
                }}>
                  {sub}
                </span>
              </h2>
            </div>
          );
        })}
      </div>
    </>
  );
}
