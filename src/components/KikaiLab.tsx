"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const TAU  = Math.PI * 2;
const ss   = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── Palette ───────────────────────────────────────────────────────────────────
const BgR =   7, BgG =   6, BgB =   8;   // near-black cool-violet
const FgR = 232, FgG = 228, FgB = 220;   // warm off-white
const RdR = 204, RdG =  32, RdB =  24;   // Bauhaus rot
const BlR =  20, BlG =  74, BlB = 152;   // Bauhaus blau
const YlR = 225, YlG = 170, YlB =  30;   // Bauhaus gelb
const IvR = 198, IvG = 192, IvB = 182;   // ivory ghost (4th trace)

// ── Gear configs ──────────────────────────────────────────────────────────────
interface GearConf {
  rRatio: number;   // r/R  (inner gear radius / ring gear radius)
  dRatio: number;   // d/R  (pen offset from inner gear centre / ring gear radius)
  color: [number, number, number];
  startSp: number;  // scroll position at which this trace begins accumulating
}

const GEAR_CONFS: GearConf[] = [
  { rRatio: 0.600, dRatio: 0.800, color: [RdR, RdG, RdB], startSp: 0.28 }, // 5:3 → star rose
  { rRatio: 0.600, dRatio: 0.420, color: [BlR, BlG, BlB], startSp: 0.36 }, // 5:3 inner rose
  { rRatio: 0.750, dRatio: 0.620, color: [YlR, YlG, YlB], startSp: 0.52 }, // 4:3 → 4-lobe
  { rRatio: 0.500, dRatio: 0.720, color: [IvR, IvG, IvB], startSp: 0.78 }, // 2:1 → ellipse (MA)
];

// Hypotrochoid: x(t) = (R−r)cos t + d·cos((R−r)/r · t)
//               y(t) = (R−r)sin t − d·sin((R−r)/r · t)
// Returns normalised coords centred at origin, scaled so R=1.
function hypo(t: number, rRatio: number, dRatio: number): [number, number] {
  const rm = 1 - rRatio;
  const k  = rm / rRatio;
  return [
    rm * Math.cos(t) + dRatio * Math.cos(k * t),
    rm * Math.sin(t) - dRatio * Math.sin(k * t),
  ];
}

// ── Section windows (12 sections, 4 chapters × 3) ─────────────────────────────
const SECTIONS = [
  [1, "I",   0.000, 0.018, 0.065, 0.083],
  [1, "II",  0.083, 0.101, 0.149, 0.167],
  [1, "III", 0.167, 0.185, 0.232, 0.250],
  [2, "I",   0.250, 0.268, 0.315, 0.333],
  [2, "II",  0.333, 0.351, 0.399, 0.417],
  [2, "III", 0.417, 0.435, 0.482, 0.500],
  [3, "I",   0.500, 0.518, 0.565, 0.583],
  [3, "II",  0.583, 0.601, 0.649, 0.667],
  [3, "III", 0.667, 0.685, 0.732, 0.750],
  [4, "I",   0.750, 0.768, 0.815, 0.833],
  [4, "II",  0.833, 0.851, 0.899, 0.917],
  [4, "III", 0.917, 0.935, 0.982, 1.000],
] as const;

const CH_NAMES = ["SEKKEI", "KAITEN", "KASANE", "MA"];

const HEADINGS: [string, string][] = [
  ["設計",             "blueprint"],
  ["PROPORTION",      "is the first machine"],
  ["BEFORE FORCE",    "there is measure"],
  ["回転",             "the first rotation"],
  ["FIVE INTO THREE", "the machine decides"],
  ["THE PEN FOLLOWS", "no hand could draw alone"],
  ["重ね",             "layering"],
  ["THREE FREQUENCIES", "one composition"],
  ["THE MECHANISM",   "becomes its trace"],
  ["間",              "negative space"],
  ["THE VOID",        "at the center was always there"],
  ["WHAT REMAINS",    "is not geometry — it is instruction"],
];

const HEADINGS_PT: [string, string][] = [
  ["設計",             "projeto"],
  ["PROPORÇÃO",       "é a primeira máquina"],
  ["ANTES DA FORÇA",  "há medida"],
  ["回転",             "a primeira rotação"],
  ["CINCO EM TRÊS",   "a máquina decide"],
  ["A CANETA SEGUE",  "nenhuma mão desenharia sozinha"],
  ["重ね",             "sobreposição"],
  ["TRÊS FREQUÊNCIAS","uma composição"],
  ["O MECANISMO",     "torna-se seu traço"],
  ["間",              "espaço negativo"],
  ["O VAZIO",         "no centro sempre esteve lá"],
  ["O QUE RESTA",     "não é geometria — é instrução"],
];

const TRACE_MAX = 6000;

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const traces: [number, number][][] = [[], [], [], []];

    const sketch = (p: p5Type) => {
      let W = 0, H = 0, M = 0, cx = 0, cy = 0;
      let theta = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        M = Math.min(W, H); cx = W / 2; cy = H / 2;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.background(BgR, BgG, BgB);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        M = Math.min(W, H); cx = W / 2; cy = H / 2;
        p.resizeCanvas(W, H);
        p.background(BgR, BgG, BgB);
        for (let i = 0; i < 4; i++) traces[i] = [];
        theta = 0;
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
        ));

        // ── Advance crank ──────────────────────────────────────────────────
        const motionW = ss(0.25, 0.46, sp);
        theta += lerp(0.010, 0.030, sp) * motionW;

        // ── Precompute geometry ────────────────────────────────────────────
        const Rg       = 0.32 * M;
        const gc0      = GEAR_CONFS[0];         // hero gear for mechanism display
        const rRatio0  = gc0.rRatio;
        const rm0      = 1 - rRatio0;
        const rg0      = Rg * rRatio0;
        const igcX     = cx + rm0 * Rg * Math.cos(theta);
        const igcY     = cy + rm0 * Rg * Math.sin(theta);
        const gearRot  = -(rm0 / rRatio0) * theta; // global rotation of inner gear
        const [hx0, hy0] = hypo(theta, rRatio0, gc0.dRatio);
        const penX     = cx + hx0 * Rg;
        const penY     = cy + hy0 * Rg;

        // ── Accumulate traces ──────────────────────────────────────────────
        for (let i = 0; i < 4; i++) {
          const gc = GEAR_CONFS[i];
          if (sp >= gc.startSp && traces[i].length < TRACE_MAX) {
            const [hx, hy] = hypo(theta, gc.rRatio, gc.dRatio);
            traces[i].push([cx + hx * Rg, cy + hy * Rg]);
          }
        }

        // ── Clear ─────────────────────────────────────────────────────────
        p.background(BgR, BgG, BgB);

        // ── Shoji grid (ch4) ──────────────────────────────────────────────
        const shojiA = ss(0.80, 0.96, sp);
        if (shojiA > 0.004) {
          const cols = 12, rows = 8;
          p.noFill();
          p.stroke(FgR, FgG, FgB, Math.round(shojiA * 11));
          p.strokeWeight(0.4);
          for (let c = 1; c < cols; c++) p.line(c * W / cols, 0, c * W / cols, H);
          for (let r = 1; r < rows; r++) p.line(0, r * H / rows, W, r * H / rows);
          p.stroke(FgR, FgG, FgB, Math.round(shojiA * 19));
          p.strokeWeight(0.7);
          for (let c = 3; c < cols; c += 3) p.line(c * W / cols, 0, c * W / cols, H);
          for (let r = 2; r < rows; r += 2) p.line(0, r * H / rows, W, r * H / rows);
        }

        // ── Bauhaus construction grid (ch1–ch3, fades out in ch4) ─────────
        const gridA = ss(0.01, 0.12, sp) * (1 - ss(0.72, 0.88, sp));
        if (gridA > 0.004) {
          p.noFill();
          p.stroke(FgR, FgG, FgB, Math.round(gridA * 9));
          p.strokeWeight(0.35);
          for (let gx = 1; gx < 16; gx++) p.line(gx * W / 16, 0, gx * W / 16, H);
          for (let gy = 1; gy < 10; gy++) p.line(0, gy * H / 10, W, gy * H / 10);
          p.stroke(FgR, FgG, FgB, Math.round(gridA * 20));
          p.strokeWeight(0.55);
          for (let gx = 4; gx < 16; gx += 4) p.line(gx * W / 16, 0, gx * W / 16, H);
          for (let gy = 2; gy < 10; gy += 2) p.line(0, gy * H / 10, W, gy * H / 10);
        }

        // ── Traces (behind mechanism) ─────────────────────────────────────
        for (let i = 0; i < 4; i++) {
          const pts = traces[i];
          if (pts.length < 3) continue;
          const gc = GEAR_CONFS[i];
          const trA = ss(gc.startSp, gc.startSp + 0.06, sp);
          const [tr, tg, tb] = gc.color;
          const isIvory = i === 3;
          p.noFill();
          p.stroke(tr, tg, tb, Math.round(trA * (isIvory ? 46 : 64)));
          p.strokeWeight(isIvory ? 0.7 : 0.85);
          p.beginShape();
          for (const [tx, ty] of pts) p.vertex(tx, ty);
          p.endShape();
        }

        // ── Construction mechanism ─────────────────────────────────────────
        const constructA = ss(0.04, 0.22, sp) * (1 - ss(0.62, 0.84, sp));
        if (constructA > 0.004) {
          const dc = p.drawingContext as CanvasRenderingContext2D;
          const ringProg = Math.min(1, ss(0.03, 0.20, sp) * 1.06);

          // ── Ring gear ─────────────────────────────────────────────────
          dc.save();

          // Dashed outer ring (draw-on animation starts from top)
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(constructA * 0.44).toFixed(3)})`;
          dc.lineWidth = 0.9;
          dc.setLineDash([6, 10]);
          dc.beginPath();
          dc.arc(cx, cy, Rg, -Math.PI / 2, -Math.PI / 2 + ringProg * TAU);
          dc.stroke();
          dc.setLineDash([]);

          // Inner rim (thin solid)
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(constructA * 0.20).toFixed(3)})`;
          dc.lineWidth = 0.4;
          dc.beginPath();
          dc.arc(cx, cy, Rg * 0.968, -Math.PI / 2, -Math.PI / 2 + ringProg * TAU);
          dc.stroke();

          // Tooth-count ticks (40 ticks around ring)
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(constructA * 0.26).toFixed(3)})`;
          dc.lineWidth = 0.5;
          const nTeeth = 40;
          for (let t = 0; t < nTeeth; t++) {
            const ta = -Math.PI / 2 + t * TAU / nTeeth;
            if (ta > -Math.PI / 2 + ringProg * TAU + 0.12) continue;
            dc.beginPath();
            dc.moveTo(cx + (Rg - Rg * 0.026) * Math.cos(ta), cy + (Rg - Rg * 0.026) * Math.sin(ta));
            dc.lineTo(cx + (Rg + Rg * 0.022) * Math.cos(ta), cy + (Rg + Rg * 0.022) * Math.sin(ta));
            dc.stroke();
          }

          // Central bearing hub
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(constructA * 0.62).toFixed(3)})`;
          dc.lineWidth = 0.9;
          dc.beginPath(); dc.arc(cx, cy, Rg * 0.050, 0, TAU); dc.stroke();
          dc.fillStyle  = `rgba(${FgR},${FgG},${FgB},${(constructA * 0.62).toFixed(3)})`;
          dc.beginPath(); dc.arc(cx, cy, Rg * 0.016, 0, TAU); dc.fill();

          // Corner fiducials
          const fidA = constructA * 0.25;
          if (fidA > 0.01) {
            dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${fidA.toFixed(3)})`;
            dc.lineWidth = 0.6;
            const fs = 9;
            for (const [fx, fy] of [[0.055, 0.06], [0.945, 0.06], [0.055, 0.94], [0.945, 0.94]] as const) {
              const fpx = fx * W, fpy = fy * H;
              dc.beginPath(); dc.moveTo(fpx - fs, fpy); dc.lineTo(fpx + fs, fpy); dc.stroke();
              dc.beginPath(); dc.moveTo(fpx, fpy - fs); dc.lineTo(fpx, fpy + fs); dc.stroke();
              dc.strokeRect(fpx - fs * 1.7, fpy - fs * 1.7, fs * 3.4, fs * 3.4);
            }
          }

          // Radius dimension line + arrow
          const dimA = ss(0.08, 0.22, sp) * constructA;
          if (dimA > 0.01) {
            dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(dimA * 0.50).toFixed(3)})`;
            dc.lineWidth = 0.7;
            dc.beginPath(); dc.moveTo(cx, cy); dc.lineTo(cx + Rg, cy); dc.stroke();
            dc.fillStyle = `rgba(${FgR},${FgG},${FgB},${(dimA * 0.50).toFixed(3)})`;
            dc.beginPath();
            dc.moveTo(cx + Rg, cy);
            dc.lineTo(cx + Rg - 7, cy - 3);
            dc.lineTo(cx + Rg - 7, cy + 3);
            dc.closePath(); dc.fill();
          }

          dc.restore();

          if (dimA > 0.01) {
            p.noStroke(); p.fill(FgR, FgG, FgB, Math.round(dimA * 122));
            p.textSize(8); p.textAlign(p.CENTER, p.TOP);
            p.text("R", cx + Rg * 0.5, cy + 7);
          }

          // ── Inner gear ─────────────────────────────────────────────────
          const innerA = ss(0.12, 0.26, sp) * constructA;
          if (innerA > 0.004) {
            const dc2 = p.drawingContext as CanvasRenderingContext2D;
            dc2.save();
            const [vr, vg, vb] = gc0.color;

            // Disc fill
            dc2.fillStyle = `rgba(${vr},${vg},${vb},${(innerA * 0.17).toFixed(3)})`;
            dc2.beginPath(); dc2.arc(igcX, igcY, rg0, 0, TAU); dc2.fill();

            // Disc outline
            dc2.strokeStyle = `rgba(${vr},${vg},${vb},${(innerA * 0.72).toFixed(3)})`;
            dc2.lineWidth = 1.0;
            dc2.beginPath(); dc2.arc(igcX, igcY, rg0, 0, TAU); dc2.stroke();

            // Tooth-count ticks (24 ticks)
            dc2.strokeStyle = `rgba(${vr},${vg},${vb},${(innerA * 0.40).toFixed(3)})`;
            dc2.lineWidth = 0.5;
            const nInner = 24;
            for (let t = 0; t < nInner; t++) {
              const ta = gearRot + t * TAU / nInner;
              dc2.beginPath();
              dc2.moveTo(igcX + (rg0 - rg0 * 0.010) * Math.cos(ta), igcY + (rg0 - rg0 * 0.010) * Math.sin(ta));
              dc2.lineTo(igcX + (rg0 + rg0 * 0.042) * Math.cos(ta), igcY + (rg0 + rg0 * 0.042) * Math.sin(ta));
              dc2.stroke();
            }

            // Crosshair (two axes)
            dc2.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(innerA * 0.44).toFixed(3)})`;
            dc2.lineWidth = 0.6;
            for (let q = 0; q < 2; q++) {
              const qa = gearRot + q * Math.PI / 2;
              for (const sign of [1, -1]) {
                dc2.beginPath();
                dc2.moveTo(igcX + sign * rg0 * 0.16 * Math.cos(qa), igcY + sign * rg0 * 0.16 * Math.sin(qa));
                dc2.lineTo(igcX + sign * rg0 * 0.88 * Math.cos(qa), igcY + sign * rg0 * 0.88 * Math.sin(qa));
                dc2.stroke();
              }
            }

            // Centre dot
            dc2.fillStyle = `rgba(${FgR},${FgG},${FgB},${(innerA * 0.80).toFixed(3)})`;
            dc2.beginPath(); dc2.arc(igcX, igcY, 2.5, 0, TAU); dc2.fill();

            // Contact point indicator
            dc2.fillStyle = `rgba(${FgR},${FgG},${FgB},${(innerA * 0.52).toFixed(3)})`;
            dc2.beginPath();
            dc2.arc(cx + Rg * Math.cos(theta), cy + Rg * Math.sin(theta), 3, 0, TAU);
            dc2.fill();

            dc2.restore();

            // Pen arm
            const penArmA = ss(0.14, 0.28, sp) * constructA;
            if (penArmA > 0.004) {
              p.stroke(vr, vg, vb, Math.round(penArmA * 188));
              p.strokeWeight(1.0);
              p.line(igcX, igcY, penX, penY);
              p.noStroke(); p.fill(vr, vg, vb, Math.round(penArmA * 228));
              p.ellipse(penX, penY, 5, 5);

              // d dimension label
              const dLabelA = ss(0.16, 0.26, sp) * (1 - ss(0.48, 0.62, sp));
              if (dLabelA > 0.01) {
                const midX = (igcX + penX) / 2;
                const midY = (igcY + penY) / 2;
                const dx = penX - igcX, dy = penY - igcY;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                p.noStroke(); p.fill(vr, vg, vb, Math.round(dLabelA * 112));
                p.textSize(7.5); p.textAlign(p.CENTER, p.CENTER);
                p.text(`d = ${gc0.dRatio.toFixed(2)}R`, midX - dy / len * 13, midY + dx / len * 13);
              }
            }
          }
        }

        // ── Annotations ch3 ───────────────────────────────────────────────
        const annA = ss(0.52, 0.70, sp) * (1 - ss(0.86, 0.96, sp));
        if (annA > 0.01) {
          p.noStroke();
          p.fill(FgR, FgG, FgB, Math.round(annA * 138));
          p.textSize(7.5); p.textAlign(p.CENTER, p.TOP);
          p.text("R:r = 5:3 · 5:3 · 4:3 · 2:1", cx, H * 0.072);
          p.fill(FgR, FgG, FgB, Math.round(annA * 82));
          p.textSize(7); p.textAlign(p.CENTER, p.BOTTOM);
          p.text("x(t) = (R−r)cos t + d·cos((R−r)/r · t)", cx, H * 0.924);
          p.text("y(t) = (R−r)sin t − d·sin((R−r)/r · t)", cx, H * 0.939);
        }

        // ── HUD ───────────────────────────────────────────────────────────
        const hudA = ss(0.03, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke(); p.fill(FgR, FgG, FgB, Math.round(hudA * 78));
          p.textSize(7.5);
          p.textAlign(p.LEFT,  p.TOP);    p.text(`θ ${(theta % TAU).toFixed(3)} rad`,           W * 0.018, H * 0.018);
          p.textAlign(p.RIGHT, p.TOP);    p.text(`sp ${sp.toFixed(4)}`,                          W * 0.982, H * 0.018);
          p.textAlign(p.LEFT,  p.BOTTOM); p.text(`CH${Math.min(4, Math.floor(sp * 4) + 1)} · 機械製図`, W * 0.018, H * 0.982);
          p.textAlign(p.RIGHT, p.BOTTOM); p.text(`REV ${Math.floor(theta / TAU)}`,               W * 0.982, H * 0.982);
        }

        // ── Text overlays ─────────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [, , i0, i1, o0, o1] = SECTIONS[i];
          const alpha = secAlpha(sp, i0, i1, o0, o1);
          const secEl = sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity = alpha.toFixed(3);
          secEl.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
        }
      };
    };

    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function KikaiLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(12).fill(null));
  const [locale] = useLabLocale();

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
    return () => { alive = false; inst?.remove(); };
  }, []);

  const positions: React.CSSProperties[] = [
    { top: "12%",    left:  "6%" },
    { bottom: "14%", right: "7%", textAlign: "right" },
    { top: "50%",    left:  "6%", transform: "translateY(-50%)" },
    { top: "12%",    right: "7%", textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    right: "7%", textAlign: "right", transform: "translateY(-50%)" },
    { top: "12%",    left:  "6%" },
    { bottom: "14%", right: "7%", textAlign: "right" },
    { top: "50%",    left:  "6%", transform: "translateY(-50%)" },
    { top: "12%",    right: "7%", textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    left: "50%", textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  const chips = ["#c05050", "#5070c8", "#c8a030", "#a8a098"];
  const texts = ["#f0dcd0", "#c8d8f0", "#f0e4b8", "#dedad4"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "28rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#070608" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const activeHeadings = locale === "pt" ? HEADINGS_PT : HEADINGS;
        const [headline, sub] = activeHeadings[i];
        return (
          <div
            key={i}
            ref={(el) => { sectionEls.current[i] = el; }}
            style={{ ...base, ...positions[i] }}
          >
            <span style={{
              display: "block", fontSize: "0.56rem", letterSpacing: "0.35em",
              color: chips[chIdx], textTransform: "uppercase", marginBottom: 10,
            }}>
              {`CH${chIdx + 1} · ${CH_NAMES[chIdx]}`}
            </span>
            <h2 style={{
              margin: 0, fontSize: "clamp(1.7rem,3.8vw,3.2rem)", fontWeight: 700,
              lineHeight: 1.05, letterSpacing: "-0.01em",
              textTransform: "uppercase", color: texts[chIdx],
            }}>
              {headline}
              <br />
              <span style={{
                fontWeight: 300, fontSize: "clamp(1.1rem,2.4vw,2.0rem)",
                letterSpacing: "0.08em", color: chips[chIdx], textTransform: "lowercase",
              }}>
                {sub}
              </span>
            </h2>
          </div>
        );
      })}
    </div>
  );
}
