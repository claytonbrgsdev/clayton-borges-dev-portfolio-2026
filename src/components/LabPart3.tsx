"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { LabPartChrome } from "./LabPartChrome";
import { useLabLocale } from "@/hooks/useLabLocale";
import type { LabLocale } from "@/hooks/useLabLocale";

// ── Helpers ────────────────────────────────────────────────────────────────────
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── Palette ────────────────────────────────────────────────────────────────────
const BG           = "#04000c";
const PRIMARY      = "#d4c8f0";
const ACCENT       = "#8040C0";
const BG_RGB       = [4,   0,   12 ] as const;
const PRIMARY_RGB  = [212, 200, 240] as const;
const ACCENT_RGB   = [128, 64,  192] as const;

// ── Lissajous parameters per chapter ──────────────────────────────────────────
// [a, b, delta] — a=1,b=1 is a circle; complexity grows each CH
const CH_LISSA: [number, number, number][] = [
  [1, 1, Math.PI / 2],   // SEED    — circle; Mandelbrot fills it
  [1, 2, Math.PI / 2],   // GRAMMAR — figure-8; L-system in BG
  [2, 3, Math.PI / 4],   // FLOW    — 2:3 braid
  [3, 4, Math.PI / 6],   // SIGNAL  — 3:4 discrete dots
  [5, 7, Math.PI / 8],   // CURVE   — dense weave
  [1, 1, Math.PI / 2],   // QUESTION — back to circle, ease-out stop
];

// Total phase range per chapter (scroll 0→1 maps to 0→TOTAL_PHASE)
const TOTAL_PHASE = [
  Math.PI *  8,   // CH1: SEED
  Math.PI * 14,   // CH2: GRAMMAR
  Math.PI * 22,   // CH3: FLOW
  Math.PI * 28,   // CH4: SIGNAL
  Math.PI * 46,   // CH5: CURVE
  Math.PI *  5,   // CH6: QUESTION — ease-out, ends at circle
];

// ── CH1: Mandelbrot (background fill for SEED) ─────────────────────────────────
const MB_W = 280, MB_H = 180;
const MB_CX = -0.7269, MB_CY = 0.1889, MB_MAX_ITER = 80;

function mandelbrotIter(cx: number, cy: number): number {
  let zx = 0, zy = 0, iter = 0;
  while (iter < MB_MAX_ITER) {
    const zx2 = zx * zx, zy2 = zy * zy;
    if (zx2 + zy2 > 4) break;
    zy = 2 * zx * zy + cy; zx = zx2 - zy2 + cx; iter++;
  }
  return iter;
}

// ── CH2: L-system (background for GRAMMAR) ────────────────────────────────────
function expandLSystem(axiom: string, rules: Record<string, string>, iters: number): string {
  let s = axiom;
  for (let i = 0; i < iters; i++) {
    let n = "";
    for (const c of s) n += rules[c] ?? c;
    s = n;
  }
  return s;
}

function drawLSystem(
  ctx: CanvasRenderingContext2D,
  str: string, x0: number, y0: number,
  ang0: number, step: number, angleDeg: number, color: string,
) {
  const stack: [number, number, number][] = [];
  let x = x0, y = y0, ang = ang0;
  const rad = angleDeg * Math.PI / 180;
  ctx.strokeStyle = color; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (const c of str) {
    if      (c === "F") { x += step * Math.sin(ang); y -= step * Math.cos(ang); ctx.lineTo(x, y); }
    else if (c === "+") ang += rad;
    else if (c === "-") ang -= rad;
    else if (c === "[") stack.push([x, y, ang]);
    else if (c === "]") { const s = stack.pop(); if (s) { [x, y, ang] = s; ctx.moveTo(x, y); } }
  }
  ctx.stroke();
}

// ── Section / heading tables ───────────────────────────────────────────────────
const SECTIONS_P3 = [
  [1, "I",  0.000, 0.025, 0.090, 0.115],
  [1, "II", 0.115, 0.140, 0.155, 0.170],
  [2, "I",  0.170, 0.195, 0.260, 0.285],
  [2, "II", 0.285, 0.310, 0.325, 0.340],
  [3, "I",  0.340, 0.365, 0.430, 0.455],
  [3, "II", 0.455, 0.480, 0.495, 0.510],
  [4, "I",  0.510, 0.535, 0.600, 0.625],
  [4, "II", 0.625, 0.650, 0.665, 0.680],
  [5, "I",  0.670, 0.695, 0.760, 0.785],
  [5, "II", 0.785, 0.810, 0.825, 0.840],
  [6, "I",  0.840, 0.880, 0.920, 0.960],
  [6, "II", 0.930, 0.950, 0.975, 1.000],
] as const;

// ── Translations ───────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    partLabel:    "PART III · MIND",
    chapter:      "CH",
    chapterWord:  "CHAPTER",
    chNames:      ["SEED", "GRAMMAR", "FLOW", "SIGNAL", "CURVE", "QUESTION"] as string[],
    headings: [
      ["THE CIRCLE",   "contains infinite edge"],
      ["BOUNDARY",     "is not a line — it is a question"],
      ["THE FIGURE-8", "every path crosses itself once"],
      ["PERCOLATION",  "when connection becomes inevitable"],
      ["THE BRAID",    "two frequencies, one path"],
      ["INVISIBLE",    "the force that curves without contact"],
      ["THE PULSE",    "discrete signals in a continuous field"],
      ["COMPUTATION",  "is matter obeying a local rule"],
      ["THE WEAVE",    "every orbit eventually returns"],
      ["EVERY CURVE",  "is a sum of simpler curves"],
      ["THIS DOT",     "was running a rule this whole time."],
      ["so were you.", ""],
    ] as [string, string][],
  },
  pt: {
    partLabel:    "PARTE III · MENTE",
    chapter:      "CH",
    chapterWord:  "CAPÍTULO",
    chNames:      ["SEMENTE", "GRAMÁTICA", "FLUXO", "SINAL", "CURVA", "QUESTÃO"] as string[],
    headings: [
      ["O CÍRCULO",    "contém borda infinita"],
      ["FRONTEIRA",    "não é uma linha — é uma pergunta"],
      ["O OITO",       "todo caminho se cruza uma vez"],
      ["PERCOLAÇÃO",   "quando a conexão se torna inevitável"],
      ["A TRANÇA",     "duas frequências, um único caminho"],
      ["INVISÍVEL",    "a força que curva sem contato"],
      ["O PULSO",      "sinais discretos num campo contínuo"],
      ["COMPUTAÇÃO",   "é a matéria obedecendo a uma regra local"],
      ["O TECIDO",     "toda órbita eventualmente retorna"],
      ["TODA CURVA",   "é soma de curvas mais simples"],
      ["ESTE PONTO",   "seguia uma regra o tempo todo."],
      ["você também.", ""],
    ] as [string, string][],
  },
} as const satisfies Record<LabLocale, {
  partLabel: string;
  chapter: string;
  chapterWord: string;
  chNames: string[];
  headings: [string, string][];
}>;

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
  localeRef: React.MutableRefObject<LabLocale>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    let traceCanvas: HTMLCanvasElement, traceCtx: CanvasRenderingContext2D;
    let mbCanvas:    HTMLCanvasElement, mbCtx: CanvasRenderingContext2D, mbImg: ImageData;
    let grammarCanvas: HTMLCanvasElement | null = null;
    let lastMbZoom   = -1;
    let prevLissPhase = 0;   // last lissPhase drawn to traceCanvas
    let lastChIdx     = -1;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

        traceCanvas = document.createElement("canvas");
        traceCanvas.width = W; traceCanvas.height = H;
        traceCtx = traceCanvas.getContext("2d") as CanvasRenderingContext2D;

        mbCanvas = document.createElement("canvas");
        mbCanvas.width = MB_W; mbCanvas.height = MB_H;
        mbCtx = mbCanvas.getContext("2d") as CanvasRenderingContext2D;
        mbImg = mbCtx.createImageData(MB_W, MB_H);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H);
        traceCanvas.width = W; traceCanvas.height = H;
        grammarCanvas = null; // rebuild on next frame
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)
        ));
        const chF   = sp * 6;
        const chIdx = Math.min(5, Math.floor(chF));
        const chT   = chF - chIdx;

        // Chapter enter
        if (chIdx !== lastChIdx) {
          traceCtx.clearRect(0, 0, W, H);
          prevLissPhase = 0;
          lastMbZoom    = -1;
          lastChIdx     = chIdx;
          grammarCanvas = null;
        }

        const dc = p.drawingContext as CanvasRenderingContext2D;
        p.background(BG_RGB[0], BG_RGB[1], BG_RGB[2]);

        const cx = W * 0.5, cy = H * 0.5;
        const R  = Math.min(W, H) * 0.30;

        // Amplitude envelope — born from line, dies to line
        let amp = 1.0;
        if (chT < 0.12)      amp = ss(0.0, 0.12, chT);
        else if (chT > 0.88) amp = 1 - ss(0.88, 1.0, chT);

        const [la, lb, ld] = CH_LISSA[chIdx];

        // Scroll-driven phase — replaces time-based lissPhase accumulation.
        // QUESTION (CH6) uses ease-out so the head decelerates as chT → 1.
        const lissPhase = chIdx === 5
          ? ss(0, 1, chT) * TOTAL_PHASE[5]
          : chT * TOTAL_PHASE[chIdx];

        // ── Background elements ───────────────────────────────────────────────
        if (chIdx === 0) {
          // SEED: Mandelbrot rendered inside the Lissajous circle
          const zoom = lerp(0.0004, 2.0, ss(0, 1, chT));
          const zsnap = Math.round(zoom * 10000) / 10000;
          if (Math.abs(zsnap - lastMbZoom) > 0.0004) {
            const data = mbImg.data;
            const scale = zoom / Math.min(MB_W, MB_H);
            for (let py = 0; py < MB_H; py++) for (let px = 0; px < MB_W; px++) {
              const mcx = MB_CX + (px - MB_W * 0.5) * scale;
              const mcy = MB_CY + (py - MB_H * 0.5) * scale;
              const iter = mandelbrotIter(mcx, mcy);
              const idx  = (py * MB_W + px) * 4;
              if (iter === MB_MAX_ITER) {
                data[idx] = BG_RGB[0]; data[idx+1] = BG_RGB[1]; data[idx+2] = BG_RGB[2];
              } else {
                const t2 = iter / MB_MAX_ITER;
                data[idx]   = Math.round(lerp(ACCENT_RGB[0], PRIMARY_RGB[0], t2));
                data[idx+1] = Math.round(lerp(ACCENT_RGB[1], PRIMARY_RGB[1], t2));
                data[idx+2] = Math.round(lerp(ACCENT_RGB[2], PRIMARY_RGB[2], t2));
              }
              data[idx+3] = 255;
            }
            mbCtx.putImageData(mbImg, 0, 0);
            lastMbZoom = zsnap;
          }
          // Clip Mandelbrot to the Lissajous circle
          dc.save();
          dc.beginPath(); dc.arc(cx, cy, R * amp, 0, Math.PI * 2); dc.clip();
          dc.globalAlpha = 0.65 * amp;
          dc.imageSmoothingEnabled = true;
          dc.drawImage(mbCanvas, cx - R * amp, cy - R * amp, R * amp * 2, R * amp * 2);
          dc.globalAlpha = 1; dc.restore();
        }
        else if (chIdx === 1) {
          // GRAMMAR: L-system growing in background behind the figure-8
          const bgA = ss(0.15, 0.55, chT) * amp * 0.28;
          if (bgA > 0.01) {
            if (!grammarCanvas) {
              grammarCanvas = document.createElement("canvas");
              grammarCanvas.width = W; grammarCanvas.height = H;
              const gCtx = grammarCanvas.getContext("2d") as CanvasRenderingContext2D;
              const iters = 4, stepLen = Math.min(W, H) * 0.016;
              const str = expandLSystem("X", { X: "F+[[X]-X]-F[-FX]+X", F: "FF" }, iters);
              drawLSystem(gCtx, str, cx, cy + R * 0.9, 0, stepLen, 25,
                `rgba(${PRIMARY_RGB[0]},${PRIMARY_RGB[1]},${PRIMARY_RGB[2]},1)`);
            }
            dc.save(); dc.globalAlpha = bgA;
            dc.drawImage(grammarCanvas, 0, 0);
            dc.restore();
          }
        }

        // ── Scroll-scrubbed trace ─────────────────────────────────────────────
        // Forward scroll  → append new segment at low alpha (accumulates density).
        // Backward scroll → clear canvas and repaint 0→lissPhase in 4 passes
        //                   to approximate the accumulated density.
        const nPts = Math.max(400, Math.ceil(la * lb * 80));
        const totalP = TOTAL_PHASE[chIdx];

        const drawTraceRange = (fromP: number, toP: number, passes: number) => {
          if (toP <= fromP + 0.0001) return;
          for (let pass = 0; pass < passes; pass++) {
            if (chIdx === 3) {
              // SIGNAL: discrete ACCENT dots
              const nDots = Math.max(4, Math.ceil((toP - fromP) / 0.04));
              traceCtx.fillStyle = `rgba(${ACCENT_RGB[0]},${ACCENT_RGB[1]},${ACCENT_RGB[2]},0.22)`;
              for (let i = 0; i <= nDots; i++) {
                const t2 = fromP + (i / nDots) * (toP - fromP);
                const hx = cx + R * Math.sin(la * t2 + ld);
                const hy = cy + R * Math.sin(lb * t2);
                traceCtx.beginPath(); traceCtx.arc(hx, hy, 1.8, 0, Math.PI * 2); traceCtx.fill();
              }
            } else {
              const segPts = Math.max(40, Math.ceil(nPts * (toP - fromP) / totalP));
              const traceAlpha = chIdx === 4 ? 0.04 : 0.07;
              traceCtx.strokeStyle = `rgba(${PRIMARY_RGB[0]},${PRIMARY_RGB[1]},${PRIMARY_RGB[2]},${traceAlpha})`;
              traceCtx.lineWidth   = chIdx === 4 ? 0.55 : 0.85;
              traceCtx.lineJoin    = "round";
              traceCtx.beginPath();
              for (let i = 0; i <= segPts; i++) {
                const t2 = fromP + (i / segPts) * (toP - fromP);
                const hx = cx + R * Math.sin(la * t2 + ld);
                const hy = cy + R * Math.sin(lb * t2);
                if (i === 0) traceCtx.moveTo(hx, hy); else traceCtx.lineTo(hx, hy);
              }
              traceCtx.stroke();
            }
          }
        };

        const wentBack = lissPhase < prevLissPhase - 0.05;
        if (wentBack) {
          traceCtx.clearRect(0, 0, W, H);
          drawTraceRange(0, lissPhase, 4);
        } else {
          drawTraceRange(prevLissPhase, lissPhase, 1);
        }
        prevLissPhase = lissPhase;

        // Blit trace to main canvas, modulated by amp
        dc.save(); dc.globalAlpha = amp * 0.95;
        dc.drawImage(traceCanvas, 0, 0);
        dc.globalAlpha = 1; dc.restore();

        // ── Head dot ──────────────────────────────────────────────────────────
        const headX  = cx + R * Math.sin(la * lissPhase + ld) * amp;
        const headY  = cy + R * Math.sin(lb * lissPhase) * amp;
        // QUESTION: head grows as it decelerates to a stop
        const headR  = chIdx === 5 ? lerp(3.0, 6.5, ss(0.55, 0.92, chT)) : 3.0;
        const glowR  = headR * 5.5;

        const grd = dc.createRadialGradient(headX, headY, 0, headX, headY, glowR);
        grd.addColorStop(0, `rgba(${ACCENT_RGB[0]},${ACCENT_RGB[1]},${ACCENT_RGB[2]},${(amp * 0.50).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${ACCENT_RGB[0]},${ACCENT_RGB[1]},${ACCENT_RGB[2]},0)`);
        dc.fillStyle = grd;
        dc.beginPath(); dc.arc(headX, headY, glowR, 0, Math.PI * 2); dc.fill();

        dc.fillStyle = `rgba(${PRIMARY_RGB[0]},${PRIMARY_RGB[1]},${PRIMARY_RGB[2]},${amp.toFixed(3)})`;
        dc.beginPath(); dc.arc(headX, headY, headR, 0, Math.PI * 2); dc.fill();

        // ── HUD ───────────────────────────────────────────────────────────────
        const hudA = ss(0.04, 0.14, sp);
        if (hudA > 0.01) {
          const t = TRANSLATIONS[localeRef.current];
          p.noStroke();
          p.fill(ACCENT_RGB[0], ACCENT_RGB[1], ACCENT_RGB[2], Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT,  p.TOP);    p.text(t.partLabel,                            W * 0.018, H * 0.018);
          p.textAlign(p.RIGHT, p.TOP);    p.text(`sp ${sp.toFixed(4)}`,                  W * 0.982, H * 0.018);
          p.textAlign(p.LEFT,  p.BOTTOM); p.text(`${t.chapter}${chIdx+1} · ${t.chNames[chIdx]}`, W * 0.018, H * 0.982);
          p.textAlign(p.RIGHT, p.BOTTOM); p.text(`a=${la} b=${lb}`,                      W * 0.982, H * 0.982);
        }

        // ── Text overlays ──────────────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [,, i0, i1, o0, o1] = SECTIONS_P3[i];
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

// ── Component ─────────────────────────────────────────────────────────────────
export function LabPart3() {
  const [locale] = useLabLocale();
  const localeRef = useRef<LabLocale>(locale);

  // Keep localeRef current so the p5 draw loop always reads the latest value
  // without needing to rebuild the sketch on every locale change.
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(12).fill(null));

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

  const positions: React.CSSProperties[] = [
    { top: "12%",    right: "7%", textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    left:  "6%", transform: "translateY(-50%)" },
    { bottom: "14%", right: "7%", textAlign: "right" },
    { top: "12%",    right: "7%", textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "12%",    left:  "6%" },
    { top: "50%",    right: "7%", textAlign: "right", transform: "translateY(-50%)" },
    { bottom: "14%", left:  "6%" },
    { top: "12%",    right: "7%", textAlign: "right" },
    { top: "35%",    left:  "50%", transform: "translate(-50%,-50%)", textAlign: "center" },
    { top: "58%",    left:  "50%", transform: "translate(-50%,-50%)", textAlign: "center" },
  ];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "30rem",
  };

  return (
    <>
      <LabPartChrome partNumber={3} />
      <div ref={scrollRef} style={{ height: "1400vh", background: BG }}>
        <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

        {SECTIONS_P3.map((sec, i) => {
          const chIdx  = (sec[0] as number) - 1;
          const t = TRANSLATIONS[locale];
          const [headline, sub] = t.headings[i];
          const isLast = i === 11;

          return (
            <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{ ...base, ...positions[i] }}>
              {!isLast && (
                <span style={{
                  display: "block", fontSize: "0.55rem", letterSpacing: "0.38em",
                  color: ACCENT, textTransform: "uppercase", marginBottom: 10,
                }}>
                  {`${t.chapter}${chIdx + 1} · ${t.chNames[chIdx]}`}
                </span>
              )}

              <h2 style={{
                margin: 0,
                fontSize: isLast
                  ? "clamp(2.4rem,5.5vw,4.8rem)"
                  : "clamp(1.7rem,3.8vw,3.2rem)",
                fontWeight:    isLast ? 300 : 700,
                lineHeight:    1.05,
                letterSpacing: isLast ? "0.12em" : "-0.01em",
                textTransform: isLast ? "lowercase" : "uppercase",
                color:         isLast ? ACCENT : PRIMARY,
              }}>
                {headline}
              </h2>

              {!isLast && sub && (
                <span style={{
                  display: "block", marginTop: "0.35rem", fontWeight: 300,
                  fontSize: "clamp(0.9rem,2vw,1.7rem)", letterSpacing: "0.09em",
                  color: `rgba(${PRIMARY_RGB[0]},${PRIMARY_RGB[1]},${PRIMARY_RGB[2]},0.65)`,
                  textTransform: "lowercase",
                }}>
                  {sub}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
