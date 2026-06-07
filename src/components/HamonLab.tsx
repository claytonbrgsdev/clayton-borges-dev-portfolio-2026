"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));
// Deterministic seeded random (avoids hydration mismatch)
const sr = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };

// ── Gray-Scott simulation ─────────────────────────────────────────────────────
const W_SIM = 240;
const H_SIM = 150;
const N_SIM = W_SIM * H_SIM;
const DU    = 0.16;
const DV    = 0.08;
const DT    = 1.0;
const STEPS = 4;  // simulation steps per animation frame

// ── Chapter [f, k] parameters ─────────────────────────────────────────────────
// Known Gray-Scott regimes, chosen for visual contrast between chapters:
//   ch1 SEED:   f=0.035 k=0.065 → dense, compact spots
//   ch2 BRANCH: f=0.040 k=0.059 → growing/connected spots
//   ch3 WEAVE:  f=0.029 k=0.057 → labyrinthine stripes
//   ch4 STILL:  f=0.025 k=0.060 → sparse, large pearls
const PARAMS: [number, number][] = [
  [0.035, 0.065],
  [0.040, 0.059],
  [0.029, 0.057],
  [0.025, 0.060],
];

// ── Chapter colour palettes [bgR,bgG,bgB, fgR,fgG,fgB] ───────────────────────
// Earth tones: copper → verdigris → rust → cold silver — no Bauhaus primaries
const CHROMA: [number, number, number, number, number, number][] = [
  [ 12,  9, 14,  148, 108,  52],  // SEED:   near-black violet  → copper bronze
  [  8, 10, 20,   45, 132, 118],  // BRANCH: deep indigo        → verdigris teal
  [ 16, 10,  8,  168,  72,  38],  // WEAVE:  warm charcoal      → rust terracotta
  [  6,  8, 12,  152, 156, 162],  // STILL:  cold dark          → cold silver
];

// ── Section windows (12 × 4 chapters) ────────────────────────────────────────
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

const CH_NAMES = ["SEED", "BRANCH", "WEAVE", "STILL"];
const CH_NAMES_PT = ["SEMENTE", "RAMIFICAÇÃO", "TRAMA", "QUIETUDE"];

const HEADINGS: [string, string][] = [
  ["SEED",        "what the machine left behind"],
  ["THE FIELD",   "is not empty"],
  ["REACTION",    "precedes the pattern"],
  ["BRANCH",      "each path excludes the others"],
  ["THE FRONT",   "advances and recedes"],
  ["LABYRINTH",   "that was never planned"],
  ["WEAVE",       "the inhibitor shapes the activator"],
  ["DENSITY",     "is a form of presence"],
  ["ALL PATHS",   "were the path"],
  ["STILL",       "the machine has spoken"],
  ["WHAT FORMED", "was always the rule"],
  ["THE PATTERN", "always was"],
];

const HEADINGS_PT: [string, string][] = [
  ["SEMENTE",          "o que a máquina deixou para trás"],
  ["O CAMPO",          "não está vazio"],
  ["REAÇÃO",           "precede o padrão"],
  ["RAMIFICAÇÃO",      "cada caminho exclui os demais"],
  ["A FRENTE",         "avança e recua"],
  ["LABIRINTO",        "que nunca foi planejado"],
  ["TRAMA",            "o inibidor molda o ativador"],
  ["DENSIDADE",        "é uma forma de presença"],
  ["TODOS OS CAMINHOS","eram o caminho"],
  ["QUIETUDE",         "a máquina falou"],
  ["O QUE SE FORMOU",  "sempre foi a regra"],
  ["O PADRÃO",         "sempre existiu"],
];

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    // Double-buffered simulation state (mutable via closure reassignment)
    let U  = new Float32Array(N_SIM);
    let V  = new Float32Array(N_SIM);
    let U2 = new Float32Array(N_SIM);
    let V2 = new Float32Array(N_SIM);

    // Init: U=1 everywhere, V=0, then scatter 28 seeded random seeds
    U.fill(1); V.fill(0);
    for (let s = 0; s < 28; s++) {
      const sx = Math.floor(sr(s * 2    ) * (W_SIM - 12)) + 6;
      const sy = Math.floor(sr(s * 2 + 1) * (H_SIM - 12)) + 6;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const idx = (sy + dy) * W_SIM + (sx + dx);
          if (idx >= 0 && idx < N_SIM) { V[idx] = 0.5; U[idx] = 0.5; }
        }
      }
    }

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let frames = 0;
      let offscreen: HTMLCanvasElement;
      let offCtx: CanvasRenderingContext2D;
      let imgData: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        // pixelDensity(1): simulation renders via drawImage; HUD text is secondary
        p.pixelDensity(1);
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.background(12, 9, 14);

        offscreen      = document.createElement("canvas");
        offscreen.width  = W_SIM;
        offscreen.height = H_SIM;
        offCtx   = offscreen.getContext("2d") as CanvasRenderingContext2D;
        imgData  = offCtx.createImageData(W_SIM, H_SIM);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        p.resizeCanvas(W, H);
        p.background(12, 9, 14);
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
        ));

        // ── Chapter interpolation (shared for params + palette) ────────
        const ci  = Math.min(2, Math.floor(sp * 3));      // 0, 1, or 2
        const cn  = ci + 1;                                // 1, 2, or 3
        const ct  = ss(ci / 3, cn / 3, sp) * 3 - ci;     // 0..1 within third

        const f   = lerp(PARAMS[ci][0], PARAMS[cn][0], ct);
        const k   = lerp(PARAMS[ci][1], PARAMS[cn][1], ct);

        const [bg0r,bg0g,bg0b,fg0r,fg0g,fg0b] = CHROMA[ci];
        const [bg1r,bg1g,bg1b,fg1r,fg1g,fg1b] = CHROMA[cn];
        const bgR = lerp(bg0r, bg1r, ct), bgG = lerp(bg0g, bg1g, ct), bgB = lerp(bg0b, bg1b, ct);
        const fgR = lerp(fg0r, fg1r, ct), fgG = lerp(fg0g, fg1g, ct), fgB = lerp(fg0b, fg1b, ct);

        // ── Injection nozzle: scroll-driven seed path ──────────────────
        // Golden-ratio-frequency Lissajous ensures non-repeating coverage.
        const injA = ss(0.04, 0.18, sp);
        if (injA > 0.015) {
          const t  = sp * Math.PI * 9;
          const ix = Math.floor(W_SIM * 0.5 + W_SIM * 0.33 * Math.sin(t));
          const iy = Math.floor(H_SIM * 0.5 + H_SIM * 0.28 * Math.cos(t * 0.6180339887));
          if (ix > 2 && ix < W_SIM - 3 && iy > 2 && iy < H_SIM - 3) {
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                const i2 = (iy + dy) * W_SIM + (ix + dx);
                V[i2] = Math.max(V[i2], 0.44); U[i2] = Math.min(U[i2], 0.56);
              }
            }
          }
        }

        // ── Secondary nozzle active in ch2–ch3 ────────────────────────
        const inj2A = ss(0.28, 0.40, sp) * (1 - ss(0.72, 0.82, sp));
        if (inj2A > 0.015) {
          const t2 = sp * Math.PI * 14;
          const ix2 = Math.floor(W_SIM * 0.5 + W_SIM * 0.22 * Math.sin(t2 * 1.3));
          const iy2 = Math.floor(H_SIM * 0.5 + H_SIM * 0.20 * Math.cos(t2));
          if (ix2 > 1 && ix2 < W_SIM - 2 && iy2 > 1 && iy2 < H_SIM - 2) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const i2 = (iy2 + dy) * W_SIM + (ix2 + dx);
                V[i2] = Math.max(V[i2], 0.40); U[i2] = Math.min(U[i2], 0.60);
              }
            }
          }
        }

        // ── Simulation steps ───────────────────────────────────────────
        for (let step = 0; step < STEPS; step++) {
          for (let j = 0; j < H_SIM; j++) {
            const jW  = j * W_SIM;
            const jNW = ((j - 1 + H_SIM) % H_SIM) * W_SIM;
            const jSW = ((j + 1) % H_SIM) * W_SIM;
            for (let i = 0; i < W_SIM; i++) {
              const iE   = (i + 1) % W_SIM;
              const iWW  = (i - 1 + W_SIM) % W_SIM;
              const idx  = jW + i;
              const u    = U[idx], v = V[idx];
              const Lu   = U[jNW + i] + U[jSW + i] + U[jW + iWW] + U[jW + iE] - 4 * u;
              const Lv   = V[jNW + i] + V[jSW + i] + V[jW + iWW] + V[jW + iE] - 4 * v;
              const uvv  = u * v * v;
              U2[idx] = Math.max(0, Math.min(1, u + (DU * Lu - uvv + f * (1 - u)) * DT));
              V2[idx] = Math.max(0, Math.min(1, v + (DV * Lv + uvv - (f + k) * v) * DT));
            }
          }
          // Swap buffers
          const tmpU = U; U = U2; U2 = tmpU;
          const tmpV = V; V = V2; V2 = tmpV;
        }

        // ── Render simulation → offscreen canvas → upscale ────────────
        {
          const d = imgData.data;
          // Gamma boost for sparse ch4 patterns to remain visible
          const gamma = sp >= 0.75 ? lerp(1.0, 1.7, ss(0.75, 0.92, sp)) : 1.0;
          for (let idx = 0; idx < N_SIM; idx++) {
            const vv  = V[idx] * V[idx] * (3 - 2 * V[idx]); // smoothstep for richer contrast
            const c   = Math.min(1, vv * gamma);
            const pi  = idx * 4;
            d[pi    ] = Math.round(lerp(bgR, fgR, c));
            d[pi + 1] = Math.round(lerp(bgG, fgG, c));
            d[pi + 2] = Math.round(lerp(bgB, fgB, c));
            d[pi + 3] = 255;
          }
          offCtx.putImageData(imgData, 0, 0);
          const dc = p.drawingContext as CanvasRenderingContext2D;
          dc.imageSmoothingEnabled = true;
          dc.imageSmoothingQuality = "high";
          dc.drawImage(offscreen, 0, 0, W, H);
        }

        // ── Phase-space HUD (bottom-right inset) ──────────────────────
        // Shows the 2D Gray-Scott parameter space with current (f,k) dot.
        const hudA = ss(0.05, 0.18, sp);
        if (hudA > 0.01) {
          const dc  = p.drawingContext as CanvasRenderingContext2D;
          const psX = W - 96, psY = H - 96, psW = 78, psH = 78;
          const fMin = 0.018, fMax = 0.050, kMin = 0.054, kMax = 0.070;
          const fToX = (fv: number) => psX + ((fv - fMin) / (fMax - fMin)) * psW;
          const kToY = (kv: number) => psY + psH - ((kv - kMin) / (kMax - kMin)) * psH;

          dc.save();

          // Inset background
          dc.fillStyle = `rgba(${Math.round(bgR)},${Math.round(bgG)},${Math.round(bgB)},0.62)`;
          dc.fillRect(psX, psY, psW, psH);
          dc.strokeStyle = `rgba(255,255,255,${(hudA * 0.20).toFixed(3)})`;
          dc.lineWidth = 0.5;
          dc.strokeRect(psX, psY, psW, psH);

          // Axis grid (4×4)
          dc.strokeStyle = `rgba(255,255,255,${(hudA * 0.08).toFixed(3)})`;
          dc.lineWidth = 0.4;
          for (let gi = 1; gi < 4; gi++) {
            const gx = psX + gi * psW / 4, gy = psY + gi * psH / 4;
            dc.beginPath(); dc.moveTo(gx, psY); dc.lineTo(gx, psY + psH); dc.stroke();
            dc.beginPath(); dc.moveTo(psX, gy); dc.lineTo(psX + psW, gy); dc.stroke();
          }

          // Axis labels
          dc.fillStyle = `rgba(255,255,255,${(hudA * 0.32).toFixed(3)})`;
          dc.font = "6.5px monospace";
          dc.textAlign = "right";
          dc.fillText("k ↑", psX - 2, psY + 10);
          dc.textAlign = "right";
          dc.fillText("f →", psX + psW, psY + psH + 10);

          // Chapter target dots (ghost)
          dc.fillStyle = `rgba(255,255,255,${(hudA * 0.24).toFixed(3)})`;
          for (const [pf, pk] of PARAMS) {
            dc.beginPath(); dc.arc(fToX(pf), kToY(pk), 1.8, 0, Math.PI * 2); dc.fill();
          }

          // Trajectory line (faint path between chapter targets)
          dc.strokeStyle = `rgba(255,255,255,${(hudA * 0.14).toFixed(3)})`;
          dc.lineWidth = 0.6;
          dc.beginPath();
          for (let pi = 0; pi < PARAMS.length; pi++) {
            const [pf, pk] = PARAMS[pi];
            if (pi === 0) dc.moveTo(fToX(pf), kToY(pk));
            else          dc.lineTo(fToX(pf), kToY(pk));
          }
          dc.stroke();

          // Current (f, k) point — coloured by chapter palette
          dc.fillStyle = `rgba(${Math.round(fgR)},${Math.round(fgG)},${Math.round(fgB)},${(hudA * 0.95).toFixed(3)})`;
          dc.beginPath(); dc.arc(fToX(f), kToY(k), 3.5, 0, Math.PI * 2); dc.fill();
          // Pulse ring
          const pulse = (Math.sin(frames * 0.12) + 1) * 0.5;
          dc.strokeStyle = `rgba(${Math.round(fgR)},${Math.round(fgG)},${Math.round(fgB)},${(hudA * pulse * 0.45).toFixed(3)})`;
          dc.lineWidth = 0.8;
          dc.beginPath(); dc.arc(fToX(f), kToY(k), 3.5 + pulse * 5, 0, Math.PI * 2); dc.stroke();

          dc.restore();

          // Readout text
          p.noStroke(); p.fill(255, 255, 255, Math.round(hudA * 72));
          p.textSize(7.5);
          p.textAlign(p.LEFT,  p.TOP);    p.text(`f ${f.toFixed(4)}  k ${k.toFixed(4)}`, W * 0.018, H * 0.018);
          p.textAlign(p.RIGHT, p.TOP);    p.text(`sp ${sp.toFixed(4)}`,                  W * 0.982, H * 0.018);
          p.textAlign(p.LEFT,  p.BOTTOM); p.text(`CH${Math.min(4, ci + 1)} · GRAY-SCOTT`,W * 0.018, H * 0.982);
          p.textAlign(p.RIGHT, p.BOTTOM); p.text(`Σ ${(frames * STEPS).toLocaleString()} steps`, W * 0.982, H * 0.982);
        }

        // ── Equation annotation (ch3) ─────────────────────────────────
        const annA = ss(0.52, 0.68, sp) * (1 - ss(0.87, 0.96, sp));
        if (annA > 0.01) {
          p.noStroke(); p.fill(255, 255, 255, Math.round(annA * 70));
          p.textSize(7); p.textAlign(p.CENTER, p.BOTTOM);
          p.text("∂U/∂t = Du·∇²U − UV² + f(1−U)", W * 0.5, H * 0.930);
          p.text("∂V/∂t = Dv·∇²V + UV² − (f+k)V",  W * 0.5, H * 0.945);
        }

        // ── Text overlays ─────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [, , i0, i1, o0, o1] = SECTIONS[i];
          const alpha = secAlpha(sp, i0, i1, o0, o1);
          const secEl = sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity = alpha.toFixed(3);
          secEl.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
        }

        frames++;
      };
    };

    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function HamonLab() {
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

  // Per-chapter accent colours — earth tones matching the simulation palette
  const chips = ["#926a34", "#2d8276", "#a04826", "#888c90"];
  const texts = ["#e8d4b8", "#b8d8d4", "#e8c4a8", "#d4d6da"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "28rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#0c090e" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const activeChNames = locale === "pt" ? CH_NAMES_PT : CH_NAMES;
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
              {`CH${chIdx + 1} · ${activeChNames[chIdx]}`}
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
