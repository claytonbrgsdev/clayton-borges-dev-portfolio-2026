"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const TAU  = Math.PI * 2;
const ss   = (a: number, b: number, t: number) => { const x = Math.max(0, Math.min(1, (t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a + (b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp) * (1-ss(o0,o1,sp));

// ── Bessel functions via series expansion + forward recurrence ────────────────
// Series-based J0 and J1 accurate for |x| ≤ 14 (all zeros we use are ≤ 11)
function seriesJ0(x: number): number {
  const x2 = x * x * 0.25;
  let s = 1, term = 1;
  for (let k = 1; k <= 20; k++) {
    term *= -x2 / (k * k);
    s += term;
    if (Math.abs(term) < 1e-12) break;
  }
  return s;
}
function seriesJ1(x: number): number {
  const x2 = x * x * 0.25;
  let s = x * 0.5, term = x * 0.5;
  for (let k = 1; k <= 20; k++) {
    term *= -x2 / (k * (k + 1));
    s += term;
    if (Math.abs(term) < 1e-12) break;
  }
  return s;
}
function besselJ(n: number, x: number): number {
  if (n === 0) return seriesJ0(x);
  if (n === 1) return seriesJ1(Math.abs(x)) * (x < 0 ? -1 : 1);
  // Forward recurrence — stable for small n and moderate x
  let jm1 = seriesJ0(x), j0 = seriesJ1(x);
  for (let k = 1; k < n; k++) {
    const j1 = x > 1e-9 ? (2 * k / x) * j0 - jm1 : 0;
    jm1 = j0; j0 = j1;
  }
  return j0;
}

// ── LUT: precompute Jn on a fine grid 0 → LUT_MAX ────────────────────────────
const LUT_SIZE = 512;
const LUT_MAX  = 14.0;
const BESSEL_LUT: Float32Array[] = [];
function buildLUT() {
  for (let n = 0; n <= 6; n++) {
    const lut = new Float32Array(LUT_SIZE);
    for (let i = 0; i < LUT_SIZE; i++) {
      lut[i] = besselJ(n, i * LUT_MAX / LUT_SIZE);
    }
    BESSEL_LUT[n] = lut;
  }
}
buildLUT();

function jLUT(n: number, x: number): number {
  const i = Math.min(LUT_SIZE - 1, Math.floor(Math.abs(x) / LUT_MAX * LUT_SIZE));
  return BESSEL_LUT[Math.min(6, n)][i];
}

// ── Mode catalogue ─────────────────────────────────────────────────────────────
// Each mode: [n (angular order), znm (first zero of Jn)]
// znm values: first zero of J_n that lies within the plate (r ≤ R)
// We normalise the plate radius so z*r/R maps to [0, znm].
const MODES: [number, number][] = [
  [1, 3.8317],   // 2 sectors
  [2, 5.1356],   // 4 sectors
  [0, 5.5201],   // 1 ring, no sectors
  [3, 6.3802],   // 6 sectors
  [1, 7.0156],   // 2 sectors + 1 inner ring
  [4, 7.5883],   // 8 sectors
  [2, 8.4172],   // 4 sectors + 1 inner ring
  [0, 8.6537],   // 2 rings, no sectors
  [5, 8.7715],   // 10 sectors
  [3, 9.7610],   // 6 sectors + 1 inner ring
];

// Modes 0..9 spread across sp 0..1:
// Primary oscillator cycles through modes 0→9 with scroll.
// Secondary oscillator is 2 modes ahead, fading in from sp=0.20.
// Tertiary oscillator is 4 modes ahead, fading in from sp=0.45.

// ── Oscillation frequencies (rad/frame) per oscillator ────────────────────────
const OMEGA = [0.048, 0.075, 0.119]; // primary, secondary, tertiary

// ── Render grid ───────────────────────────────────────────────────────────────
const W_SIM = 320;
const H_SIM = 240;
const N_SIM = W_SIM * H_SIM;

// ── Chapter colour palettes ────────────────────────────────────────────────────
// Per chapter: [plateR,plateG,plateB, warmR,warmG,warmB, coolR,coolG,coolB, nodalR,nodalG,nodalB]
const CHROMA: number[][] = [
  //  plate-base         warm/crest        cool/trough        nodal-line
  [  8,  7, 10,   210, 165,  72,    28,  48, 105,   238, 228, 205], // ch1: violet plate, gold warm, indigo cool
  [ 10,  8,  8,   175,  90,  42,    42,  95, 115,   225, 210, 195], // ch2: warm charcoal, rust warm, slate cool
  [  7,  9, 10,    85, 145, 130,   105,  42,  78,   215, 225, 230], // ch3: cool dark, teal warm, violet cool
  [  6,  6,  8,   188, 185, 178,    32,  50,  88,   245, 242, 238], // ch4: cold dark, silver warm, deep-blue cool
];

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

const CH_NAMES = ["FUNDAMENTAL", "OVERTONE", "HARMONIC", "COMPOSITE"];

const HEADINGS: [string, string][] = [
  ["FREQUENCY",   "the plate knows one shape"],
  ["SILENCE",     "accumulates at the nodes"],
  ["THE SAND",    "finds where motion stops"],
  ["OVERTONE",    "a second voice enters"],
  ["INTERFERENCE", "neither cancels the other"],
  ["FORM",        "negotiated between frequencies"],
  ["HARMONIC",    "ratios older than music"],
  ["THE FIELD",   "is three voices now"],
  ["SUPERPOSE",   "complexity without contradiction"],
  ["COMPOSITE",   "the sum of all resonances"],
  ["CHLADNI",     "drew what we couldn't hear"],
  ["THE PLATE",   "remembers every frequency"],
];

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let frames = 0;
      const tau = [0, 0, 0]; // phase clocks per oscillator
      let offscreen: HTMLCanvasElement;
      let offCtx: CanvasRenderingContext2D;
      let imgData: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(1);
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.background(8, 7, 10);
        offscreen        = document.createElement("canvas");
        offscreen.width  = W_SIM;
        offscreen.height = H_SIM;
        offCtx   = offscreen.getContext("2d") as CanvasRenderingContext2D;
        imgData  = offCtx.createImageData(W_SIM, H_SIM);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        p.resizeCanvas(W, H);
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
        ));

        // ── Advance oscillator clocks ──────────────────────────────────
        for (let k = 0; k < 3; k++) tau[k] += OMEGA[k];

        // ── Mode selection ─────────────────────────────────────────────
        // Primary: continuous mode index from sp
        const modeF   = sp * (MODES.length - 1);
        const mi0     = Math.min(MODES.length - 2, Math.floor(modeF));
        const mi1     = mi0 + 1;
        const mt      = modeF - mi0;  // 0..1 blend within pair

        // Secondary and tertiary (offset by 2 and 4 mode steps)
        const mi2     = Math.min(MODES.length - 1, mi0 + 2);
        const mi3     = Math.min(MODES.length - 1, mi0 + 4);

        // Oscillator weights
        const w0 = 1.0;
        const w1 = ss(0.18, 0.40, sp) * 0.58;
        const w2 = ss(0.44, 0.62, sp) * 0.34;

        // Oscillations
        const osc0 = Math.cos(tau[0]);
        const osc1 = Math.cos(tau[1]);
        const osc2 = Math.cos(tau[2]);

        // ── Chapter palette blend ──────────────────────────────────────
        const ci  = Math.min(2, Math.floor(sp * 3));
        const cn  = ci + 1;
        const ct  = ss(ci / 3, cn / 3, sp) * 3 - ci;
        const ch0 = CHROMA[ci], ch1 = CHROMA[cn];
        const [pR, pG, pB]   = [lerp(ch0[0],ch1[0],ct), lerp(ch0[1],ch1[1],ct), lerp(ch0[2],ch1[2],ct)];
        const [wR, wG, wB]   = [lerp(ch0[3],ch1[3],ct), lerp(ch0[4],ch1[4],ct), lerp(ch0[5],ch1[5],ct)];
        const [cR, cG, cB]   = [lerp(ch0[6],ch1[6],ct), lerp(ch0[7],ch1[7],ct), lerp(ch0[8],ch1[8],ct)];
        const [nR, nG, nB]   = [lerp(ch0[9],ch1[9],ct), lerp(ch0[10],ch1[10],ct), lerp(ch0[11],ch1[11],ct)];

        // ── Pixel render ───────────────────────────────────────────────
        {
          const d   = imgData.data;
          const cx2 = W_SIM * 0.5, cy2 = H_SIM * 0.5;
          // Plate radius in sim pixels — circular, tight to shorter dimension
          const plateR = Math.min(W_SIM, H_SIM) * 0.44;

          for (let j = 0; j < H_SIM; j++) {
            for (let i = 0; i < W_SIM; i++) {
              const dx = i - cx2, dy = j - cy2;
              const r2 = dx * dx + dy * dy;
              const r  = Math.sqrt(r2);
              const rn = r / plateR; // 0..1 within plate, >1 outside

              const pi = (j * W_SIM + i) * 4;

              if (rn > 1.02) {
                // Outside plate — very dark
                d[pi] = pR | 0; d[pi+1] = pG | 0; d[pi+2] = pB | 0; d[pi+3] = 255;
                continue;
              }

              const theta = Math.atan2(dy, dx);

              // Compute primary mode displacement (blend two adjacent modes)
              const [n0a, z0a] = MODES[mi0];
              const [n0b, z0b] = MODES[mi1];
              const psi_a = jLUT(n0a, z0a * rn) * Math.cos(n0a * theta);
              const psi_b = jLUT(n0b, z0b * rn) * Math.cos(n0b * theta);
              const psi0  = lerp(psi_a, psi_b, mt) * osc0;

              // Secondary mode
              const [n1a, z1a] = MODES[mi2];
              const psi1 = jLUT(n1a, z1a * rn) * Math.cos(n1a * theta) * osc1;

              // Tertiary mode
              const [n2a, z2a] = MODES[mi3];
              const psi2 = jLUT(n2a, z2a * rn) * Math.cos(n2a * theta) * osc2;

              // Weighted superposition
              const psi = (w0 * psi0 + w1 * psi1 + w2 * psi2) / (w0 + w1 + w2);

              // Normalise amplitude — Bessel peaks ~1, but superposition can exceed 1
              const pa = Math.max(-1, Math.min(1, psi * 2.2));

              // Colour mapping: positive → warm, negative → cool, ~0 → nodal bright
              const posW  = Math.max(0,  pa);
              const negW  = Math.max(0, -pa);
              const nodal = Math.max(0, 1 - Math.abs(pa) * 5.5); // narrow bright band

              // Plate vignette — slight dimming at edges
              const vigW  = Math.max(0, 1 - rn * rn * 0.45);

              let r4 = lerp(lerp(pR, wR, posW), cR, negW) * vigW + nR * nodal;
              let g4 = lerp(lerp(pG, wG, posW), cG, negW) * vigW + nG * nodal;
              let b4 = lerp(lerp(pB, wB, posW), cB, negW) * vigW + nB * nodal;

              d[pi]   = Math.min(255, r4) | 0;
              d[pi+1] = Math.min(255, g4) | 0;
              d[pi+2] = Math.min(255, b4) | 0;
              d[pi+3] = 255;
            }
          }
          offCtx.putImageData(imgData, 0, 0);
          const dc = p.drawingContext as CanvasRenderingContext2D;
          // Slightly smoothed — nodal lines benefit from anti-aliasing
          dc.imageSmoothingEnabled = true;
          dc.imageSmoothingQuality = "medium";
          dc.drawImage(offscreen, 0, 0, W, H);
        }

        // ── Plate border (construction circle + fiducials) ─────────────
        const plateVisA = ss(0.02, 0.16, sp);
        if (plateVisA > 0.01) {
          const dc  = p.drawingContext as CanvasRenderingContext2D;
          const cx3 = W * 0.5, cy3 = H * 0.5;
          const pR3 = Math.min(W, H) * 0.44;
          dc.save();
          dc.strokeStyle = `rgba(255,255,255,${(plateVisA * 0.28).toFixed(3)})`;
          dc.lineWidth = 0.8;
          dc.setLineDash([6, 12]);
          dc.beginPath(); dc.arc(cx3, cy3, pR3, 0, TAU); dc.stroke();
          dc.setLineDash([]);
          // Diameter lines (Bauhaus construction cross)
          dc.strokeStyle = `rgba(255,255,255,${(plateVisA * 0.12).toFixed(3)})`;
          dc.lineWidth = 0.5;
          dc.beginPath(); dc.moveTo(cx3-pR3,cy3); dc.lineTo(cx3+pR3,cy3); dc.stroke();
          dc.beginPath(); dc.moveTo(cx3,cy3-pR3); dc.lineTo(cx3,cy3+pR3); dc.stroke();
          // Centre hub
          dc.fillStyle = `rgba(255,255,255,${(plateVisA*0.55).toFixed(3)})`;
          dc.beginPath(); dc.arc(cx3,cy3,2.8,0,TAU); dc.fill();
          dc.restore();
        }

        // ── Harmonic spectrum HUD (bottom-right) ──────────────────────
        const hudA = ss(0.06, 0.20, sp);
        if (hudA > 0.01) {
          const dc  = p.drawingContext as CanvasRenderingContext2D;
          const barX = W - 100, barY = H - 88;
          const barW = 80, barH = 68;

          dc.save();
          dc.fillStyle = `rgba(${pR|0},${pG|0},${pB|0},0.60)`;
          dc.fillRect(barX, barY, barW, barH);
          dc.strokeStyle = `rgba(255,255,255,${(hudA*0.18).toFixed(3)})`;
          dc.lineWidth = 0.5;
          dc.strokeRect(barX, barY, barW, barH);

          // Three bars: primary, secondary, tertiary weights
          const weights = [w0, w1, w2];
          const barColors = [
            `rgba(${nR|0},${nG|0},${nB|0},`,
            `rgba(${wR|0},${wG|0},${wB|0},`,
            `rgba(${cR|0},${cG|0},${cB|0},`,
          ];
          const labels = [`n=${MODES[mi0][0]}`, `n=${MODES[mi2][0]}`, `n=${MODES[mi3][0]}`];
          const bw = barW / 4;
          for (let k = 0; k < 3; k++) {
            const bh = Math.round(weights[k] * (barH - 14));
            const bx = barX + bw * 0.6 + k * bw;
            dc.fillStyle = barColors[k] + `${(hudA * 0.80).toFixed(3)})`;
            dc.fillRect(bx, barY + barH - 10 - bh, bw * 0.65, bh);
            dc.fillStyle = `rgba(255,255,255,${(hudA*0.35).toFixed(3)})`;
            dc.font = "6px monospace";
            dc.textAlign = "center";
            dc.fillText(labels[k], bx + bw * 0.32, barY + barH - 2);
          }

          // Phase clocks (three small arcs)
          for (let k = 0; k < 3; k++) {
            const arc = (tau[k] % TAU);
            dc.strokeStyle = barColors[k] + `${(hudA * weights[k] * 0.85).toFixed(3)})`;
            dc.lineWidth = 1.2;
            dc.beginPath(); dc.arc(barX + 8 + k*10, barY + 8, 3.5, 0, arc % TAU); dc.stroke();
          }
          dc.restore();

          // Readout text
          p.noStroke(); p.fill(255,255,255,Math.round(hudA*70));
          p.textSize(7.5);
          p.textAlign(p.LEFT,  p.TOP);
          p.text(`ω₀ ${OMEGA[0].toFixed(3)}  ω₁ ${OMEGA[1].toFixed(3)}  ω₂ ${OMEGA[2].toFixed(3)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT,  p.BOTTOM);
          p.text(`CH${Math.min(4,ci+1)} · CHLADNI`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`τ ${(frames%10000).toString().padStart(5,'0')}`, W*0.982, H*0.982);
        }

        // ── Equation annotation (ch3) ─────────────────────────────────
        const annA = ss(0.50, 0.66, sp) * (1-ss(0.88,0.96,sp));
        if (annA > 0.01) {
          p.noStroke(); p.fill(255,255,255,Math.round(annA*68));
          p.textSize(7); p.textAlign(p.CENTER, p.BOTTOM);
          p.text("ψ(r,θ) = Jₙ(z·r/R)·cos(n·θ)·cos(ω·τ)", W*0.5, H*0.925);
          p.fill(255,255,255,Math.round(annA*44));
          p.text("Ψ = Σ wₖ · ψₖ(r,θ,τ)  [superposition]", W*0.5, H*0.938);
        }

        // ── Text overlays ─────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS[i];
          const alpha = secAlpha(sp,i0,i1,o0,o1);
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
export function ChladniLab() {
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

  const chips = ["#a0905a", "#908078", "#609090", "#9090a0"];
  const texts = ["#e8dcc8", "#dcd8d0", "#c8dada", "#d8d8e0"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "28rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#080710" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS[i];
        return (
          <div key={i} ref={(el) => { sectionEls.current[i] = el; }} style={{ ...base, ...positions[i] }}>
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
