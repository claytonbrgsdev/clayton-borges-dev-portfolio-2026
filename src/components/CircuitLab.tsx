"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";

// ── utils ─────────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));
const sr = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };

// ── 12 section windows ────────────────────────────────────────────────────────
// [chapter, roman, fadeIn0, fadeIn1, fadeOut0, fadeOut1]
const SECTIONS = [
  [1, "I",    0.000, 0.018, 0.065, 0.083],
  [1, "II",   0.083, 0.101, 0.149, 0.167],
  [1, "III",  0.167, 0.185, 0.232, 0.250],
  [2, "I",    0.250, 0.268, 0.315, 0.333],
  [2, "II",   0.333, 0.351, 0.399, 0.417],
  [2, "III",  0.417, 0.435, 0.482, 0.500],
  [3, "I",    0.500, 0.518, 0.565, 0.583],
  [3, "II",   0.583, 0.601, 0.649, 0.667],
  [3, "III",  0.667, 0.685, 0.732, 0.750],
  [4, "I",    0.750, 0.768, 0.815, 0.833],
  [4, "II",   0.833, 0.851, 0.899, 0.917],
  [4, "III",  0.917, 0.935, 0.982, 1.000],
] as const;

// ── PCB geometry (normalized 0..1 coords, module-level stable) ─────────────

interface Trace {
  x1: number; y1: number; x2: number; y2: number;
  thick: boolean;
  chapter: number;
  revealOrder: number;  // 0..1 within chapter when this trace draws itself on
  phase: number;        // signal pulse phase offset
}
interface Via { x: number; y: number; chapter: number; }
interface Comp {
  x: number; y: number; w: number; h: number;
  type: "ic" | "passive" | "conn";
  ref: string;
  chapter: number;
  pins: Array<[number, number]>;
}

const TRACES: Trace[] = [];
const VIAS:   Via[]   = [];
const COMPS:  Comp[]  = [];

(function buildPCB() {
  let s = 1;
  const tr = (x1: number, y1: number, x2: number, y2: number,
               ch: number, ro: number, thick = false) =>
    TRACES.push({ x1, y1, x2, y2, thick, chapter: ch, revealOrder: ro, phase: sr(s++) * TAU });
  const via = (x: number, y: number, ch: number) => VIAS.push({ x, y, chapter: ch });

  // ── Power bus (ch 1, thick) ─────────────────────────────────────────────
  tr(0.05, 0.07, 0.95, 0.07, 1, 0.00, true);  // VCC top
  tr(0.05, 0.93, 0.95, 0.93, 1, 0.02, true);  // GND bottom
  tr(0.07, 0.07, 0.07, 0.93, 1, 0.04, true);  // left bus
  tr(0.93, 0.07, 0.93, 0.93, 1, 0.06, true);  // right bus

  // ── Chapter 1 — Power / Input ───────────────────────────────────────────
  tr(0.07, 0.22, 0.28, 0.22, 1, 0.10);
  tr(0.28, 0.22, 0.28, 0.40, 1, 0.15);
  tr(0.07, 0.40, 0.28, 0.40, 1, 0.20);
  tr(0.14, 0.22, 0.14, 0.60, 1, 0.25);
  tr(0.07, 0.60, 0.22, 0.60, 1, 0.30);
  tr(0.22, 0.60, 0.22, 0.78, 1, 0.35);
  tr(0.07, 0.78, 0.28, 0.78, 1, 0.40);
  tr(0.20, 0.30, 0.28, 0.30, 1, 0.22);
  tr(0.20, 0.50, 0.28, 0.50, 1, 0.28);
  tr(0.10, 0.50, 0.14, 0.50, 1, 0.32);
  tr(0.10, 0.15, 0.28, 0.15, 1, 0.08);
  tr(0.10, 0.85, 0.28, 0.85, 1, 0.42);
  tr(0.28, 0.15, 0.28, 0.22, 1, 0.12);
  tr(0.28, 0.78, 0.28, 0.85, 1, 0.44);
  via(0.28, 0.22, 1); via(0.28, 0.40, 1);
  via(0.14, 0.22, 1); via(0.14, 0.60, 1);
  via(0.22, 0.60, 1); via(0.22, 0.78, 1);

  // ── Chapter 2 — Data bus (parallel horizontal traces) ───────────────────
  for (let i = 0; i < 8; i++) {
    const y = 0.28 + i * 0.048;
    tr(0.31, y, 0.56, y, 2, 0.05 + i * 0.07);
  }
  tr(0.31, 0.28, 0.31, 0.62, 2, 0.15);
  tr(0.56, 0.28, 0.56, 0.62, 2, 0.20);
  tr(0.43, 0.15, 0.43, 0.28, 2, 0.25);
  tr(0.43, 0.62, 0.43, 0.80, 2, 0.30);
  tr(0.31, 0.15, 0.56, 0.15, 2, 0.35);
  tr(0.31, 0.80, 0.56, 0.80, 2, 0.40);
  tr(0.50, 0.62, 0.50, 0.80, 2, 0.45);
  tr(0.38, 0.15, 0.38, 0.28, 2, 0.50);
  tr(0.38, 0.62, 0.38, 0.80, 2, 0.55);
  // Ch1→2 bridge
  tr(0.28, 0.22, 0.31, 0.22, 2, 0.62);
  tr(0.28, 0.78, 0.31, 0.78, 2, 0.64);
  via(0.31, 0.28, 2); via(0.56, 0.28, 2);
  via(0.31, 0.62, 2); via(0.56, 0.62, 2);
  via(0.43, 0.15, 2); via(0.43, 0.80, 2);

  // ── Chapter 3 — Logic / Processing ──────────────────────────────────────
  tr(0.59, 0.15, 0.76, 0.15, 3, 0.05);
  tr(0.59, 0.85, 0.76, 0.85, 3, 0.08);
  tr(0.59, 0.15, 0.59, 0.40, 3, 0.12);
  tr(0.59, 0.55, 0.59, 0.85, 3, 0.15);
  tr(0.76, 0.15, 0.76, 0.40, 3, 0.18);
  tr(0.76, 0.55, 0.76, 0.85, 3, 0.22);
  tr(0.59, 0.40, 0.68, 0.40, 3, 0.25);
  tr(0.68, 0.40, 0.68, 0.30, 3, 0.28);
  tr(0.59, 0.55, 0.68, 0.55, 3, 0.32);
  tr(0.68, 0.55, 0.68, 0.65, 3, 0.35);
  tr(0.68, 0.30, 0.76, 0.30, 3, 0.38);
  tr(0.68, 0.65, 0.76, 0.65, 3, 0.42);
  tr(0.64, 0.15, 0.64, 0.40, 3, 0.45);
  tr(0.72, 0.55, 0.72, 0.85, 3, 0.48);
  tr(0.64, 0.55, 0.64, 0.70, 3, 0.52);
  tr(0.64, 0.70, 0.72, 0.70, 3, 0.55);
  tr(0.72, 0.15, 0.72, 0.30, 3, 0.58);
  // Ch2→3 bridge
  tr(0.56, 0.28, 0.59, 0.28, 3, 0.62);
  tr(0.56, 0.62, 0.59, 0.62, 3, 0.64);
  via(0.59, 0.40, 3); via(0.59, 0.55, 3);
  via(0.76, 0.40, 3); via(0.76, 0.55, 3);
  via(0.68, 0.40, 3); via(0.68, 0.55, 3);

  // ── Chapter 4 — Output ────────────────────────────────────────────────
  tr(0.79, 0.15, 0.93, 0.15, 4, 0.05);
  tr(0.79, 0.85, 0.93, 0.85, 4, 0.08);
  tr(0.79, 0.15, 0.79, 0.40, 4, 0.12);
  tr(0.79, 0.55, 0.79, 0.85, 4, 0.15);
  tr(0.85, 0.20, 0.93, 0.20, 4, 0.20);
  tr(0.85, 0.30, 0.93, 0.30, 4, 0.25);
  tr(0.85, 0.40, 0.93, 0.40, 4, 0.30);
  tr(0.85, 0.55, 0.93, 0.55, 4, 0.35);
  tr(0.85, 0.65, 0.93, 0.65, 4, 0.40);
  tr(0.85, 0.75, 0.93, 0.75, 4, 0.45);
  tr(0.85, 0.20, 0.85, 0.75, 4, 0.50);
  tr(0.79, 0.40, 0.85, 0.40, 4, 0.55);
  tr(0.79, 0.55, 0.85, 0.55, 4, 0.60);
  // Ch3→4 bridge
  tr(0.76, 0.30, 0.79, 0.30, 4, 0.65);
  tr(0.76, 0.65, 0.79, 0.65, 4, 0.67);
  via(0.85, 0.20, 4); via(0.85, 0.75, 4);
  via(0.79, 0.40, 4); via(0.79, 0.55, 4);

  // ── Components ────────────────────────────────────────────────────────────
  // U1 — Input regulator (ch1)
  const u1pins: Array<[number,number]> = [];
  for (let i = 0; i < 6; i++) { u1pins.push([0.10, 0.24+i*0.026]); u1pins.push([0.26, 0.24+i*0.026]); }
  COMPS.push({ x:0.12, y:0.23, w:0.12, h:0.14, type:"ic",      ref:"U1", chapter:1, pins:u1pins });

  // U2 — Filter / LDO (ch1)
  const u2pins: Array<[number,number]> = [];
  for (let i = 0; i < 4; i++) { u2pins.push([0.10, 0.64+i*0.028]); u2pins.push([0.26, 0.64+i*0.028]); }
  COMPS.push({ x:0.12, y:0.63, w:0.12, h:0.11, type:"ic",      ref:"U2", chapter:1, pins:u2pins });

  // U3 — Memory IC (ch2, tall)
  const u3pins: Array<[number,number]> = [];
  for (let i = 0; i < 8; i++) { u3pins.push([0.33, 0.30+i*0.038]); u3pins.push([0.54, 0.30+i*0.038]); }
  COMPS.push({ x:0.35, y:0.29, w:0.17, h:0.30, type:"ic",      ref:"U3", chapter:2, pins:u3pins });

  // U4 — Bus transceiver (ch2)
  const u4pins: Array<[number,number]> = [];
  for (let i = 0; i < 5; i++) { u4pins.push([0.33, 0.65+i*0.026]); u4pins.push([0.54, 0.65+i*0.026]); }
  COMPS.push({ x:0.35, y:0.64, w:0.17, h:0.13, type:"ic",      ref:"U4", chapter:2, pins:u4pins });

  // U5 — CPU / Main processor (ch3, largest)
  const u5pins: Array<[number,number]> = [];
  for (let i = 0; i < 10; i++) { u5pins.push([0.61, 0.22+i*0.038]); u5pins.push([0.74, 0.22+i*0.038]); }
  for (let i = 0; i < 5;  i++) { u5pins.push([0.625+i*0.025, 0.20]); u5pins.push([0.625+i*0.025, 0.63]); }
  COMPS.push({ x:0.62, y:0.21, w:0.12, h:0.42, type:"ic",      ref:"U5", chapter:3, pins:u5pins });

  // U6 — Output driver (ch4)
  const u6pins: Array<[number,number]> = [];
  for (let i = 0; i < 5; i++) { u6pins.push([0.81, 0.24+i*0.032]); u6pins.push([0.91, 0.24+i*0.032]); }
  COMPS.push({ x:0.83, y:0.23, w:0.06, h:0.17, type:"ic",      ref:"U6", chapter:4, pins:u6pins });

  // J1 — Output connector (ch4)
  const j1pins: Array<[number,number]> = [];
  for (let i = 0; i < 8; i++) { j1pins.push([0.810+i*0.012, 0.58]); j1pins.push([0.810+i*0.012, 0.64]); }
  COMPS.push({ x:0.80, y:0.57, w:0.10, h:0.08, type:"conn",    ref:"J1", chapter:4, pins:j1pins });

  // Passive components (resistors + capacitors)
  const passives: Array<[number, number, string, number]> = [
    [0.09,0.17,"R1",1],[0.17,0.17,"C1",1],[0.25,0.17,"R2",1],
    [0.09,0.83,"C2",1],[0.17,0.83,"R3",1],[0.25,0.83,"C3",1],
    [0.35,0.18,"R4",2],[0.43,0.18,"C4",2],[0.51,0.18,"R5",2],
    [0.35,0.82,"C5",2],[0.43,0.82,"R6",2],
    [0.63,0.15,"C6",3],[0.70,0.14,"R7",3],[0.72,0.84,"C7",3],
    [0.82,0.15,"R8",4],[0.88,0.15,"C8",4],[0.88,0.82,"R9",4],
  ];
  for (const [px, py, ref, ch] of passives) {
    COMPS.push({
      x: px-0.015, y: py-0.009, w: 0.030, h: 0.018,
      type: "passive", ref, chapter: ch,
      pins: [[px-0.020, py] as [number,number], [px+0.020, py] as [number,number]],
    });
  }
})();

// ── sketch builder ────────────────────────────────────────────────────────────

function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const sketch = (p: p5Type) => {
      let W = 0, H = 0, tau = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.noSmooth();
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        p.resizeCanvas(W, H);
      };

      // draw a line segment up to progress t (0..1) along it
      const partialLine = (x1: number, y1: number, x2: number, y2: number, t: number) => {
        if (t <= 0) return;
        const ex = lerp(x1, x2, Math.min(t, 1));
        const ey = lerp(y1, y2, Math.min(t, 1));
        p.line(x1, y1, ex, ey);
      };

      // radial glow via drawingContext
      const glowDot = (cx: number, cy: number, r: number, rr: number, gg: number, bb: number, alpha: number) => {
        const dc = p.drawingContext as CanvasRenderingContext2D;
        const g  = dc.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,   `rgba(${rr},${gg},${bb},${alpha})`);
        g.addColorStop(0.3, `rgba(${rr},${gg},${bb},${alpha * 0.4})`);
        g.addColorStop(1,   `rgba(${rr},${gg},${bb},0)`);
        dc.fillStyle = g;
        dc.beginPath();
        dc.arc(cx, cy, r, 0, TAU);
        dc.fill();
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / (scrollEl.scrollHeight - H)));
        tau += 0.016;

        // chapter progress values
        const cp = [
          ss(0.00, 0.25, sp),
          ss(0.25, 0.50, sp),
          ss(0.50, 0.75, sp),
          ss(0.75, 1.00, sp),
        ];
        // chapter "activity" — how alive each chapter is right now
        const ca = [
          ss(0.00, 0.10, sp) * (1 - ss(0.22, 0.32, sp)) + ss(0.25, 0.50, sp) * 0.35,
          ss(0.25, 0.35, sp) * (1 - ss(0.47, 0.57, sp)) + ss(0.50, 0.75, sp) * 0.30,
          ss(0.50, 0.60, sp) * (1 - ss(0.72, 0.80, sp)) + ss(0.75, 1.00, sp) * 0.25,
          ss(0.75, 0.85, sp),
        ];

        // ── Background ────────────────────────────────────────────────────
        p.background(4, 10, 5);

        // PCB substrate
        const boardA = ss(0.00, 0.06, sp);
        if (boardA > 0) {
          p.noStroke();
          p.fill(11, 24, 13, Math.round(boardA * 255));
          p.rect(0.04*W, 0.04*H, 0.92*W, 0.92*H, 6);
        }

        // Board edge
        p.noFill();
        p.stroke(20, 60, 22, Math.round(ss(0.02, 0.10, sp) * 180));
        p.strokeWeight(1.5);
        p.rect(0.04*W, 0.04*H, 0.92*W, 0.92*H, 6);

        // Faint grid inside board
        const gridA = ss(0.02, 0.10, sp) * 22;
        if (gridA > 1) {
          p.stroke(18, 45, 20, gridA);
          p.strokeWeight(0.4);
          const step = Math.round(W * 0.042);
          for (let gx = Math.round(0.04*W); gx < 0.96*W; gx += step) {
            p.line(gx, 0.04*H, gx, 0.96*H);
          }
          for (let gy = Math.round(0.04*H); gy < 0.96*H; gy += step) {
            p.line(0.04*W, gy, 0.96*W, gy);
          }
        }

        // ── Traces ────────────────────────────────────────────────────────
        for (const t of TRACES) {
          const chi = t.chapter - 1;
          const prog = ss(t.revealOrder, t.revealOrder + 0.12, cp[chi]);
          if (prog <= 0) continue;

          const x1 = t.x1 * W, y1 = t.y1 * H;
          const x2 = t.x2 * W, y2 = t.y2 * H;

          // dim copper base
          const dimA = Math.round(lerp(0, t.thick ? 200 : 160, prog));
          p.stroke(80, 44, 12, dimA);
          p.strokeWeight(t.thick ? 3.5 : 1.6);
          p.strokeCap(p.SQUARE);
          partialLine(x1, y1, x2, y2, prog);

          // lit copper overlay when chapter is active
          if (ca[chi] > 0.02) {
            p.stroke(190, 115, 32, Math.round(ca[chi] * 180));
            p.strokeWeight(t.thick ? 2.8 : 1.2);
            partialLine(x1, y1, x2, y2, prog);
          }

          // signal pulse — traveling bright dot
          if (prog > 0.92 && ca[chi] > 0.05) {
            const pulseP = ((tau * (t.thick ? 0.7 : 1.4) + t.phase) % TAU) / TAU;
            const px = lerp(x1, x2, pulseP);
            const py = lerp(y1, y2, pulseP);
            const pr = t.thick ? 7 : 5;
            glowDot(px, py, pr * 2.5, 0, 220, 100, ca[chi] * 0.85);
            p.noStroke();
            p.fill(0, 220, 100, Math.round(ca[chi] * 230));
            p.circle(px, py, t.thick ? 5 : 3.5);
          }
        }

        // ── Vias ──────────────────────────────────────────────────────────
        for (const v of VIAS) {
          const chi  = v.chapter - 1;
          const prog = cp[chi];
          if (prog < 0.12) continue;
          const vx   = v.x * W, vy = v.y * H;
          const vA   = ss(0.12, 0.30, prog);

          // outer ring
          p.noFill();
          p.stroke(160, 200, 160, Math.round(vA * 190));
          p.strokeWeight(1.2);
          p.circle(vx, vy, 10);

          // inner copper
          p.noStroke();
          p.fill(80, 44, 12, Math.round(vA * 220));
          p.circle(vx, vy, 6);

          // drill hole
          p.fill(4, 10, 5, Math.round(vA * 255));
          p.circle(vx, vy, 3);

          // glow when active
          if (ca[chi] > 0.05) {
            glowDot(vx, vy, 14, 0, 200, 80, ca[chi] * 0.45);
          }
        }

        // ── Components ────────────────────────────────────────────────────
        for (const c of COMPS) {
          const chi  = c.chapter - 1;
          const prog = ss(0.20, 0.60, cp[chi]);
          if (prog <= 0) continue;

          const cx = c.x * W, cy = c.y * H;
          const cw = c.w * W, ch_ = c.h * H;

          if (c.type === "ic") {
            // IC body — dark with slight green tint
            p.noStroke();
            p.fill(16, 22, 16, Math.round(prog * 248));
            p.rect(cx, cy, cw, ch_, 2);

            // body outline (silkscreen)
            p.noFill();
            p.stroke(185, 210, 185, Math.round(prog * 140));
            p.strokeWeight(0.8);
            p.rect(cx, cy, cw, ch_, 2);

            // pin 1 marker
            p.noStroke();
            p.fill(185, 210, 185, Math.round(prog * 120));
            p.circle(cx + 5, cy + 5, 3);

            // active glow behind IC
            if (ca[chi] > 0.05) {
              glowDot(cx + cw/2, cy + ch_/2, Math.max(cw, ch_) * 0.9, 0, 200, 80, ca[chi] * 0.18);
            }
          } else if (c.type === "passive") {
            // Resistor / cap body
            p.noStroke();
            p.fill(22, 44, 24, Math.round(prog * 240));
            p.rect(cx, cy, cw, ch_);
            p.noFill();
            p.stroke(185, 210, 185, Math.round(prog * 100));
            p.strokeWeight(0.6);
            p.rect(cx, cy, cw, ch_);
          } else {
            // Connector — rows of square pads
            p.noStroke();
            p.fill(30, 55, 32, Math.round(prog * 240));
            p.rect(cx, cy, cw, ch_, 1);
            p.noFill();
            p.stroke(185, 210, 185, Math.round(prog * 120));
            p.strokeWeight(0.8);
            p.rect(cx, cy, cw, ch_, 1);
          }

          // Pin pads
          p.noStroke();
          for (const [px, py] of c.pins) {
            const ppx = px * W, ppy = py * H;
            p.fill(80, 44, 12, Math.round(prog * 200));
            p.rect(ppx - 2.5, ppy - 2.5, 5, 5);
            if (ca[chi] > 0.08) {
              p.fill(190, 115, 32, Math.round(ca[chi] * 160));
              p.rect(ppx - 2.5, ppy - 2.5, 5, 5);
            }
          }

          // Silkscreen reference label
          const refA = prog * 0.7;
          if (refA > 0.05) {
            p.noStroke();
            p.fill(185, 210, 185, Math.round(refA * 170));
            p.textSize(c.type === "ic" ? 8.5 : 6.5);
            p.textAlign(p.LEFT, p.TOP);
            p.text(c.ref, cx + (c.type === "ic" ? 3 : 1), cy - (c.type === "ic" ? 10 : 8));
          }
        }

        // ── Chapter ambient glow ──────────────────────────────────────────
        // Ch1: warm amber glow on left
        if (ca[0] > 0.01) {
          glowDot(0.17*W, 0.50*H, 0.18*W, 190, 115, 32, ca[0] * 0.10);
        }
        // Ch2: cool blue glow on data bus zone
        if (ca[1] > 0.01) {
          glowDot(0.43*W, 0.47*H, 0.20*W, 0, 180, 220, ca[1] * 0.09);
        }
        // Ch3: bright white-green on CPU
        if (ca[2] > 0.01) {
          glowDot(0.67*W, 0.50*H, 0.18*W, 80, 255, 160, ca[2] * 0.11);
        }
        // Ch4: warm orange on output zone
        if (ca[3] > 0.01) {
          glowDot(0.86*W, 0.50*H, 0.14*W, 240, 120, 30, ca[3] * 0.12);
        }

        // ── Corner markers (PCB fiducials) ─────────────────────────────────
        const fidA = ss(0.03, 0.12, sp);
        if (fidA > 0.02) {
          p.noStroke();
          const corners: Array<[number, number]> = [
            [0.055*W, 0.055*H], [0.945*W, 0.055*H],
            [0.055*W, 0.945*H], [0.945*W, 0.945*H],
          ];
          for (const [fx, fy] of corners) {
            p.fill(160, 200, 160, Math.round(fidA * 180));
            p.circle(fx, fy, 10);
            p.fill(4, 10, 5, Math.round(fidA * 255));
            p.circle(fx, fy, 5);
            p.noFill();
            p.stroke(160, 200, 160, Math.round(fidA * 90));
            p.strokeWeight(0.6);
            p.circle(fx, fy, 18);
            p.noStroke();
          }
        }

        // ── Text overlays ─────────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [, , i0, i1, o0, o1] = SECTIONS[i];
          const alpha = secAlpha(sp, i0, i1, o0, o1);
          const el = sectionEls[i];
          if (!el) continue;
          el.style.opacity = alpha.toFixed(3);
          el.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
        }
      };
    };
    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export function CircuitLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(12).fill(null));

  useEffect(() => {
    const container = containerRef.current;
    const scroll    = scrollRef.current;
    if (!container || !scroll) return;

    let inst: p5Type | null = null;
    let alive = true;

    buildSketch(container, scroll, sectionEls.current).then((p5inst) => {
      if (!alive) { p5inst.remove(); return; }
      inst = p5inst;
    });

    return () => {
      alive = false;
      inst?.remove();
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "var(--font-mono, 'Courier New', monospace)",
    zIndex: 10,
  };
  const chip = (color: string): React.CSSProperties => ({
    fontSize: "0.58rem", letterSpacing: "0.28em", color, display: "block",
    marginBottom: 8, textTransform: "uppercase",
  });
  const body: React.CSSProperties = {
    fontSize: "clamp(1.8rem, 4.2vw, 3.4rem)", fontWeight: 700,
    lineHeight: 1.08, margin: 0, color: "#c8e0c8",
  };

  // Alternating positions for 12 sections
  const positions: React.CSSProperties[] = [
    { top: "12%", left: "7%" },
    { bottom: "14%", right: "8%", textAlign: "right" },
    { top: "50%", left: "7%", transform: "translateY(-50%)" },
    { top: "12%", right: "8%", textAlign: "right" },
    { bottom: "14%", left: "7%" },
    { top: "50%", right: "8%", textAlign: "right", transform: "translateY(-50%)" },
    { top: "12%", left: "7%" },
    { bottom: "14%", right: "8%", textAlign: "right" },
    { top: "50%", left: "7%", transform: "translateY(-50%)" },
    { top: "12%", right: "8%", textAlign: "right" },
    { bottom: "14%", left: "7%" },
    { top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" },
  ];

  const chipColors = ["rgba(190,115,32,0.60)", "rgba(0,180,220,0.60)", "rgba(80,255,160,0.60)", "rgba(240,120,30,0.60)"];

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#040a05" }}>
      <div
        ref={containerRef}
        style={{ position: "fixed", inset: 0, zIndex: 1 }}
      />

      {SECTIONS.map(([ch, part], i) => (
        <div
          key={i}
          ref={(el) => { sectionEls.current[i] = el; }}
          style={{ ...base, ...positions[i] }}
        >
          <span style={chip(chipColors[ch - 1])}>
            {`chapter ${ch} · ${part}`}
          </span>
          <h2 style={body}>
            Lorem ipsum<br />
            {part === "I" ? "dolor sit amet" : part === "II" ? "consectetur" : "adipiscing elit"}
          </h2>
        </div>
      ))}
    </div>
  );
}
