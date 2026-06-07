"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x = Math.max(0, Math.min(1, (t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── Wave simulation constants ─────────────────────────────────────────────────
const W_SIM   = 240;
const H_SIM   = 160;
const N_SIM   = W_SIM * H_SIM;
const C2      = 0.16;   // c=0.4, c²=0.16
const DT      = 0.5;
const DAMP    = 0.9985;
const STEPS   = 3;      // physics steps per animation frame

// Caustic accumulation settings
const GAIN    = 4.8;    // brightness amplifier for caustic pattern

// Preview HUD dimensions (wave height preview)
const PRV_W   = 80;
const PRV_H   = 53;

// ── Chapter impulse patterns ──────────────────────────────────────────────────
// ch1 SURFACE:      single center, 120-frame interval
// ch2 REFRACTION:   two golden-ratio sources, 90-frame interval
// ch3 INTERFERENCE: ring impulse (converging circular wavefront)
// ch4 DISSOLUTION:  6 Fibonacci spiral sources, 70-frame interval

// ── Section windows ───────────────────────────────────────────────────────────
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

const CH_NAMES = ["SURFACE", "REFRACTION", "INTERFERENCE", "DISSOLUTION"];
const CH_NAMES_PT = ["SUPERFÍCIE", "REFRAÇÃO", "INTERFERÊNCIA", "DISSOLUÇÃO"];

const HEADINGS: [string, string][] = [
  ["THE SURFACE",  "does not show itself"],
  ["ONLY LIGHT",   "proves the water moves"],
  ["REFRACTION",   "the machine of misdirection"],
  ["FOCUS",        "where waves converge overhead"],
  ["THE FLOOR",    "reads what the surface wrote"],
  ["SHADOW",       "brighter than the object"],
  ["CAUSTIC",      "geometry of scattered intent"],
  ["INTERFERENCE", "two sources, one floor"],
  ["THE PATTERN",  "was never in the water"],
  ["WHAT REMAINS", "when the wave has passed"],
  ["DISSOLUTION",  "the machine forgets its form"],
  ["LIGHT",        "outlasts the wave that made it"],
];

const HEADINGS_PT: [string, string][] = [
  ["A SUPERFÍCIE",  "não se revela"],
  ["SÓ A LUZ",      "prova que a água se move"],
  ["REFRAÇÃO",      "a máquina do desvio"],
  ["FOCO",          "onde as ondas convergem acima"],
  ["O FUNDO",       "lê o que a superfície escreveu"],
  ["SOMBRA",        "mais brilhante que o objeto"],
  ["CÁUSTICA",      "geometria da intenção dispersa"],
  ["INTERFERÊNCIA", "duas fontes, um mesmo fundo"],
  ["O PADRÃO",      "nunca esteve na água"],
  ["O QUE RESTA",   "quando a onda passou"],
  ["DISSOLUÇÃO",    "a máquina esquece sua forma"],
  ["LUZ",           "sobrevive à onda que a criou"],
];

// ── Chapter floor/caustic palettes ───────────────────────────────────────────
// [bg_r, bg_g, bg_b,  caustic_r, caustic_g, caustic_b]
const PALETTES: [number,number,number,number,number,number][] = [
  [  6,  5, 14,  242, 198, 138],  // deep indigo  → amber gold
  [  5, 12, 14,  225, 148,  98],  // deep teal    → coral orange
  [ 10,  6, 16,  210, 208, 220],  // deep violet  → cold silver
  [  5,  5,  8,  248, 245, 240],  // near-black   → warm white
];

// Golden angle for Fibonacci sources
const GOLDEN_ANGLE = 2.399963229;

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {

    // Wave height and velocity buffers
    const H  = new Float32Array(N_SIM);
    const V  = new Float32Array(N_SIM);
    // Caustic accumulation buffer
    const CAUSTIC = new Float32Array(N_SIM);

    let frames = 0;

    // ── Impulse emitter ───────────────────────────────────────────────────
    function addImpulse(cx: number, cy: number, strength: number, radius: number) {
      const r2 = radius * radius;
      const x0 = Math.max(1, Math.floor(cx - radius));
      const x1 = Math.min(W_SIM - 2, Math.ceil(cx + radius));
      const y0 = Math.max(1, Math.floor(cy - radius));
      const y1 = Math.min(H_SIM - 2, Math.ceil(cy + radius));
      for (let j = y0; j <= y1; j++) {
        for (let i = x0; i <= x1; i++) {
          const dx = i - cx, dy = j - cy;
          const d2 = dx*dx + dy*dy;
          if (d2 < r2) {
            H[j * W_SIM + i] += strength * Math.exp(-d2 / (r2 * 0.4));
          }
        }
      }
    }

    function addRingImpulse(cx: number, cy: number, ringR: number, strength: number, thickness: number) {
      const x0 = Math.max(1, Math.floor(cx - ringR - thickness));
      const x1 = Math.min(W_SIM - 2, Math.ceil(cx + ringR + thickness));
      const y0 = Math.max(1, Math.floor(cy - ringR - thickness));
      const y1 = Math.min(H_SIM - 2, Math.ceil(cy + ringR + thickness));
      for (let j = y0; j <= y1; j++) {
        for (let i = x0; i <= x1; i++) {
          const dx = i - cx, dy = j - cy;
          const d  = Math.sqrt(dx*dx + dy*dy);
          const t  = Math.abs(d - ringR) / thickness;
          if (t < 1) {
            H[j * W_SIM + i] += strength * (1 - t*t);
          }
        }
      }
    }

    const sketch = (p: p5Type) => {
      let W = 0, H_canvas = 0;

      // Two offscreen canvases: caustic floor + wave preview
      let causticCanvas: HTMLCanvasElement;
      let causticCtx: CanvasRenderingContext2D;
      let causticImg: ImageData;

      let previewCanvas: HTMLCanvasElement;
      let previewCtx: CanvasRenderingContext2D;
      let previewImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H_canvas = el.offsetHeight;
        const cnv = p.createCanvas(W, H_canvas);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(1);
        p.colorMode(p.RGB, 255, 255, 255, 255);

        causticCanvas        = document.createElement("canvas");
        causticCanvas.width  = W_SIM;
        causticCanvas.height = H_SIM;
        causticCtx           = causticCanvas.getContext("2d") as CanvasRenderingContext2D;
        causticImg           = causticCtx.createImageData(W_SIM, H_SIM);

        previewCanvas        = document.createElement("canvas");
        previewCanvas.width  = PRV_W;
        previewCanvas.height = PRV_H;
        previewCtx           = previewCanvas.getContext("2d") as CanvasRenderingContext2D;
        previewImg           = previewCtx.createImageData(PRV_W, PRV_H);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H_canvas = el.offsetHeight;
        p.resizeCanvas(W, H_canvas);
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
        ));

        const chF   = sp * 4;
        const chIdx = Math.min(3, Math.floor(chF));
        const chT   = chF - chIdx;                          // [0,1) within chapter

        // Blend adjacent palettes for smooth transitions
        const nextCh = Math.min(3, chIdx + 1);
        const blend  = ss(0.75, 1.0, chT);

        const pal0 = PALETTES[chIdx];
        const pal1 = PALETTES[nextCh];
        const bgR  = Math.round(lerp(pal0[0], pal1[0], blend));
        const bgG  = Math.round(lerp(pal0[1], pal1[1], blend));
        const bgB  = Math.round(lerp(pal0[2], pal1[2], blend));
        const caR  = Math.round(lerp(pal0[3], pal1[3], blend));
        const caG  = Math.round(lerp(pal0[4], pal1[4], blend));
        const caB  = Math.round(lerp(pal0[5], pal1[5], blend));

        // ── Impulse scheduling ──────────────────────────────────────────
        const cx0 = W_SIM * 0.5, cy0 = H_SIM * 0.5;

        if (chIdx === 0) {
          // ch1: single center pulse every 120 frames
          if (frames % 120 === 0) addImpulse(cx0, cy0, 2.2, 5.5);

        } else if (chIdx === 1) {
          // ch2: two golden-ratio sources, 90-frame interval
          if (frames % 90 === 0) {
            addImpulse(W_SIM * 0.382, H_SIM * 0.5,   2.0, 5.0);
            addImpulse(W_SIM * 0.618, H_SIM * 0.309, 2.0, 5.0);
          }
          if (frames % 90 === 45) {
            addImpulse(W_SIM * 0.618, H_SIM * 0.691, 2.0, 5.0);
          }

        } else if (chIdx === 2) {
          // ch3: converging ring wavefront, 100-frame interval
          if (frames % 100 === 0) {
            const ringR = lerp(70, 55, chT);
            addRingImpulse(cx0, cy0, ringR, 1.8, 8);
          }
          if (frames % 100 === 50) {
            // offset ring from golden position
            addRingImpulse(W_SIM * 0.38, H_SIM * 0.45, lerp(40, 30, chT), 1.4, 6);
          }

        } else {
          // ch4: 6 Fibonacci spiral sources, 70-frame interval
          if (frames % 70 === 0) {
            const srcIdx = (frames / 70 | 0) % 6;
            const angle  = srcIdx * GOLDEN_ANGLE;
            const r      = lerp(20, 65, (srcIdx + 1) / 6);
            const fx     = cx0 + r * Math.cos(angle);
            const fy     = cy0 + r * Math.sin(angle) * 0.7;
            addImpulse(fx, fy, lerp(1.8, 0.9, sp), 4.5);
          }
        }

        // ── Wave physics ────────────────────────────────────────────────
        for (let step = 0; step < STEPS; step++) {
          for (let j = 1; j < H_SIM - 1; j++) {
            for (let i = 1; i < W_SIM - 1; i++) {
              const idx = j * W_SIM + i;
              const lap = H[idx-1] + H[idx+1] + H[idx-W_SIM] + H[idx+W_SIM] - 4*H[idx];
              V[idx] += C2 * lap * DT;
              V[idx] *= DAMP;
            }
          }
          for (let k = 0; k < N_SIM; k++) {
            H[k] += V[k] * DT;
          }
          // Reflecting boundary: clamp edges to zero
          for (let i = 0; i < W_SIM; i++) {
            H[i] = 0; V[i] = 0;                            // top row
            const bi = (H_SIM-1)*W_SIM + i;
            H[bi] = 0; V[bi] = 0;                          // bottom row
          }
          for (let j = 0; j < H_SIM; j++) {
            H[j*W_SIM] = 0; V[j*W_SIM] = 0;               // left col
            const ri = j*W_SIM + W_SIM-1;
            H[ri] = 0; V[ri] = 0;                          // right col
          }
        }

        // ── Caustic computation ─────────────────────────────────────────
        CAUSTIC.fill(0);
        const D = lerp(60, 120, sp);                        // refraction depth
        for (let j = 1; j < H_SIM - 1; j++) {
          for (let i = 1; i < W_SIM - 1; i++) {
            const idx = j * W_SIM + i;
            const nx  = -(H[idx+1] - H[idx-1]) * 0.5;
            const ny  = -(H[idx+W_SIM] - H[idx-W_SIM]) * 0.5;
            const fx  = i + nx * D;
            const fy  = j + ny * D;
            // Bilinear splat
            const fi  = Math.floor(fx), fj = Math.floor(fy);
            if (fi < 0 || fi >= W_SIM-1 || fj < 0 || fj >= H_SIM-1) continue;
            const tx  = fx - fi, ty = fy - fj;
            CAUSTIC[fj     * W_SIM + fi  ] += (1-tx)*(1-ty);
            CAUSTIC[fj     * W_SIM + fi+1] +=    tx *(1-ty);
            CAUSTIC[(fj+1) * W_SIM + fi  ] += (1-tx)*   ty;
            CAUSTIC[(fj+1) * W_SIM + fi+1] +=    tx *   ty;
          }
        }

        // ── Render caustic floor → offscreen ───────────────────────────
        {
          const d = causticImg.data;
          for (let idx = 0; idx < N_SIM; idx++) {
            const raw  = CAUSTIC[idx] * GAIN / STEPS;
            const brt  = Math.min(1, Math.sqrt(raw));
            const brt2 = brt * brt;                         // extra contrast
            const r    = Math.round(lerp(bgR, caR, brt2));
            const g    = Math.round(lerp(bgG, caG, brt2));
            const b    = Math.round(lerp(bgB, caB, brt2));
            const pi   = idx * 4;
            d[pi] = r; d[pi+1] = g; d[pi+2] = b; d[pi+3] = 255;
          }
          causticCtx.putImageData(causticImg, 0, 0);
          const dc = p.drawingContext as CanvasRenderingContext2D;
          dc.imageSmoothingEnabled = true;
          dc.imageSmoothingQuality = "high";
          dc.drawImage(causticCanvas, 0, 0, W, H_canvas);
        }

        // ── Wave preview HUD ────────────────────────────────────────────
        const hudA = ss(0.04, 0.14, sp);
        if (hudA > 0.01) {
          // render wave height to preview offscreen
          {
            const d  = previewImg.data;
            const sx = W_SIM / PRV_W;
            const sy = H_SIM / PRV_H;
            for (let pj = 0; pj < PRV_H; pj++) {
              for (let pi2 = 0; pi2 < PRV_W; pi2++) {
                const si  = Math.floor(pi2 * sx);
                const sj  = Math.floor(pj * sy);
                const h   = H[sj * W_SIM + si];
                const pos = Math.max(0, h * 120);
                const neg = Math.max(0, -h * 120);
                // Positive = teal, negative = red-orange, neutral = near-black
                const r   = Math.min(255, Math.round(10 + pos * 0.1 + neg * 1.5));
                const g   = Math.min(255, Math.round(8  + pos * 1.2 + neg * 0.2));
                const b   = Math.min(255, Math.round(14 + pos * 1.5 + neg * 0.05));
                const pp  = (pj * PRV_W + pi2) * 4;
                d[pp] = r; d[pp+1] = g; d[pp+2] = b; d[pp+3] = 255;
              }
            }
            previewCtx.putImageData(previewImg, 0, 0);
          }

          // Draw HUD frame
          const dc = p.drawingContext as CanvasRenderingContext2D;
          const hx = W * 0.025;
          const hy = H_canvas * 0.025;
          const hw = PRV_W * 2.5;
          const hh = PRV_H * 2.5;

          dc.save();
          dc.globalAlpha = hudA * 0.85;
          dc.fillStyle   = `rgb(${bgR},${bgG},${bgB})`;
          dc.fillRect(hx - 3, hy - 3, hw + 6, hh + 6);
          dc.imageSmoothingEnabled = true;
          dc.imageSmoothingQuality = "high";
          dc.drawImage(previewCanvas, hx, hy, hw, hh);
          dc.strokeStyle = `rgba(${caR},${caG},${caB},0.35)`;
          dc.lineWidth   = 0.8;
          dc.strokeRect(hx - 3, hy - 3, hw + 6, hh + 6);
          dc.restore();

          // HUD label
          p.noStroke();
          p.fill(caR, caG, caB, Math.round(hudA * 60));
          p.textSize(6.5);
          p.textAlign(p.LEFT, p.TOP);
          p.text("WAVE", hx, hy + hh + 5);
        }

        // ── Corner stats HUD ────────────────────────────────────────────
        const statsA = ss(0.04, 0.16, sp);
        if (statsA > 0.01) {
          p.noStroke();
          p.fill(caR, caG, caB, Math.round(statsA * 60));
          p.textSize(7);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W * 0.982, H_canvas * 0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · CAUSTIC · D=${D.toFixed(0)}`, W * 0.018, H_canvas * 0.982);
          // Energy readout
          let energy = 0;
          for (let k = 0; k < N_SIM; k++) energy += H[k]*H[k] + V[k]*V[k];
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`E ${energy.toFixed(0)}`, W * 0.982, H_canvas * 0.982);
        }

        // ── Text overlays ───────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS[i];
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
export function CausticLab() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls = useRef<Array<HTMLDivElement | null>>(Array(12).fill(null));
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
    { top: "12%",    right: "7%",  textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    right: "7%",  textAlign: "right", transform: "translateY(-50%)" },
    { bottom: "14%", right: "7%",  textAlign: "right" },
    { top: "12%",    left:  "6%" },
    { top: "50%",    left:  "6%",  transform: "translateY(-50%)" },
    { top: "12%",    right: "7%",  textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    right: "7%",  textAlign: "right", transform: "translateY(-50%)" },
    { bottom: "14%", right: "7%",  textAlign: "right" },
    { top: "12%",    left:  "6%" },
    { top: "50%",    left: "50%",  textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  // Per-chapter accent colors (match caustic palettes)
  const chips = ["#8a7848", "#4a8880", "#7a5882", "#9a9888"];
  const texts = ["#f2c68a", "#e1946280", "#d2d0dc", "#f8f5f0"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "30rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#060514" }}>
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
              display: "block", fontSize: "0.55rem", letterSpacing: "0.38em",
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
                fontWeight: 300, fontSize: "clamp(1.0rem,2.3vw,1.9rem)",
                letterSpacing: "0.09em", color: chips[chIdx], textTransform: "lowercase",
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
