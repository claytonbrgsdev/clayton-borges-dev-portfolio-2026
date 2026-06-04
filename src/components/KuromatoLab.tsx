"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Kuramoto constants ─────────────────────────────────────────────────────────
const W_K = 52, H_K = 34, N_K = W_K * H_K;  // oscillator grid (upscaled to viewport)
const DT_K      = 0.10;
const STEPS_K   = 10;   // integration steps per frame
const TWO_PI    = Math.PI * 2;

// Module-level oscillator state
const omega = new Float32Array(N_K);  // natural frequencies ~ Normal(0, σ=1)
const theta = new Float32Array(N_K);  // current phases [0, 2π)

// Box-Muller gaussian sampler
function gaussRandom(): number {
  const u = Math.max(1e-10, Math.random()), v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TWO_PI * v);
}

function kFromSp(sp: number): number {
  // K_c ≈ 2 for σ_ω = 1 (mean-field Kuramoto critical coupling)
  if (sp < 0.25) return lerp(0.15, 1.8, sp / 0.25);
  if (sp < 0.50) return lerp(1.8, 2.6, (sp - 0.25) / 0.25);
  if (sp < 0.75) return lerp(2.6, 4.0, (sp - 0.50) / 0.25);
  return lerp(4.0, 6.5, (sp - 0.75) / 0.25);
}

function initOscillators() {
  for (let i = 0; i < N_K; i++) {
    omega[i] = gaussRandom();          // drawn from Normal(0,1)
    theta[i] = Math.random() * TWO_PI; // uniform initial phases → incoherent
  }
}

function stepKuramoto(K: number) {
  // Mean-field approximation: O(N) instead of O(N²)
  let sx = 0, sy = 0;
  for (let i = 0; i < N_K; i++) { sx += Math.cos(theta[i]); sy += Math.sin(theta[i]); }
  const invN = 1 / N_K;
  const r   = Math.sqrt(sx*sx + sy*sy) * invN;  // order parameter [0,1]
  const psi = Math.atan2(sy, sx);                // mean phase

  const Kr = K * r;
  for (let i = 0; i < N_K; i++) {
    theta[i] += DT_K * (omega[i] + Kr * Math.sin(psi - theta[i]));
    // Wrap to [0, 2π)
    theta[i] = ((theta[i] % TWO_PI) + TWO_PI) % TWO_PI;
  }
  return r;  // return order parameter for HUD
}

// HSV → RGB (returns 0..255 integers)
function hsvRgb(h: number, s: number, v: number): [number,number,number] {
  const hi = (h * 6) | 0;
  const f = h * 6 - hi, p = v*(1-s), q = v*(1-f*s), t2 = v*(1-(1-f)*s);
  switch (hi % 6) {
    case 0: return [v*255|0, t2*255|0, p*255|0];
    case 1: return [q*255|0, v*255|0, p*255|0];
    case 2: return [p*255|0, v*255|0, t2*255|0];
    case 3: return [p*255|0, q*255|0, v*255|0];
    case 4: return [t2*255|0, p*255|0, v*255|0];
    default: return [v*255|0, p*255|0, q*255|0];
  }
}

// Per-chapter: [hue-offset (rotates the color wheel), saturation, value, bg[r,g,b]]
const CH_PAL_K: [number,number,number,number,number,number][] = [
  [0.00, 0.95, 0.82,  4,  4, 10],  // ch1 INCOHERENT — full rainbow on dark navy
  [0.08, 0.90, 0.90, 10,  6,  3],  // ch2 ONSET — warm orange wheel on dark ember
  [0.58, 0.92, 0.88,  5,  3, 10],  // ch3 PARTIAL — violet wheel on deep purple
  [0.42, 0.70, 0.95,  4,  8,  6],  // ch4 LOCKED — muted teal (synchronized → near-uniform)
];

const CH_NAMES_K = ["INCOHERENT","ONSET","PARTIAL SYNC","LOCKED"];

const SECTIONS_K = [
  [1,"I",  0.000,0.018,0.065,0.083],
  [1,"II", 0.083,0.101,0.149,0.167],
  [1,"III",0.167,0.185,0.232,0.250],
  [2,"I",  0.250,0.268,0.315,0.333],
  [2,"II", 0.333,0.351,0.399,0.417],
  [2,"III",0.417,0.435,0.482,0.500],
  [3,"I",  0.500,0.518,0.565,0.583],
  [3,"II", 0.583,0.601,0.649,0.667],
  [3,"III",0.667,0.685,0.732,0.750],
  [4,"I",  0.750,0.768,0.815,0.833],
  [4,"II", 0.833,0.851,0.899,0.917],
  [4,"III",0.917,0.935,0.982,1.000],
] as const;

const HEADINGS_K: [string,string][] = [
  ["OSCILLATOR",  "every clock runs at its own rate"],
  ["FREQUENCY",   "the distribution of natural rhythms"],
  ["INCOHERENT",  "K < K_c — no coupling, no order"],
  ["ONSET",       "K = K_c = 2 — the first alignment"],
  ["ENTRAINMENT", "the fast lock onto the slow"],
  ["CLUSTER",     "islands of synchrony in a sea of noise"],
  ["PHASE-LOCK",  "K > K_c — the majority aligns"],
  ["ORDER",       "r → 1 — one phase emerges from many"],
  ["COLLECTIVE",  "the behaviour that no one chose"],
  ["LOCKED",      "K >> K_c — the last holdouts yield"],
  ["UNIVERSAL",   "the same transition in every coupled system"],
  ["EMERGENCE",   "order from interaction alone"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    initOscillators();
    let orderParam = 0;
    let lastChapter = -1;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_K; offscreen.height = H_K;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_K, H_K);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        if (chIdx !== lastChapter) {
          // Reinitialize with current K so the new chapter starts from a natural state
          initOscillators();
          orderParam = 0;
          lastChapter = chIdx;
        }

        const K = kFromSp(sp);

        // Integrate oscillators
        for (let s = 0; s < STEPS_K; s++) orderParam = stepKuramoto(K);

        // Blend chapter palettes
        const p0 = CH_PAL_K[chIdx], p1 = CH_PAL_K[next];
        const hOff  = lerp(p0[0], p1[0], blend);
        const sat   = lerp(p0[1], p1[1], blend);
        const val   = lerp(p0[2], p1[2], blend);
        const bgR   = Math.round(lerp(p0[3],p1[3],blend));
        const bgG   = Math.round(lerp(p0[4],p1[4],blend));
        const bgB   = Math.round(lerp(p0[5],p1[5],blend));

        // Render oscillator grid to pixel buffer
        const sd = offImg.data;
        for (let idx = 0; idx < N_K; idx++) {
          const hue = ((theta[idx] / TWO_PI) + hOff) % 1.0;
          // Desaturate toward background as sp→1 (locked → near-uniform → reveal structure)
          const dynamicSat = lerp(sat, sat * 0.5, ss(0.7, 0.95, sp));
          const [r, g, b] = hsvRgb(hue, dynamicSat, val);
          const pi = idx * 4;
          sd[pi] = r; sd[pi+1] = g; sd[pi+2] = b; sd[pi+3] = 255;
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "medium";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Background tint vignette (darken corners)
        const grd = dc.createRadialGradient(W*0.5, H*0.5, H*0.1, W*0.5, H*0.5, H*0.75);
        grd.addColorStop(0, `rgba(${bgR},${bgG},${bgB},0.0)`);
        grd.addColorStop(1, `rgba(${bgR},${bgG},${bgB},0.6)`);
        dc.fillStyle = grd;
        dc.fillRect(0, 0, W, H);

        // Order parameter r bar (left edge)
        const barA = ss(0.04, 0.16, sp);
        if (barA > 0.01) {
          const barH = H * 0.55, barY0 = H * 0.225;
          const barX = W * 0.032;
          const filledH = barH * orderParam;
          dc.fillStyle = `rgba(255,255,255,${(barA * 0.12).toFixed(2)})`;
          dc.fillRect(barX - 2, barY0, 4, barH);
          dc.fillStyle = `rgba(255,255,255,${(barA * 0.70).toFixed(2)})`;
          dc.fillRect(barX - 2, barY0 + barH - filledH, 4, filledH);
          // r value text
          p.noStroke();
          p.fill(255, 255, 255, Math.round(barA * 60));
          p.textSize(6.5);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`r=${orderParam.toFixed(2)}`, barX * 1.8, barY0 + barH + 14);
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(255, 255, 255, Math.round(hudA * 45));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`K = ${K.toFixed(2)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · KURAMOTO`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`N=${N_K} · K_c≈2.0`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_K[i];
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

// ── Component ──────────────────────────────────────────────────────────────────
export function KuromatoLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement|null>>(Array(12).fill(null));

  useEffect(() => {
    const container = containerRef.current, scroll = scrollRef.current;
    if (!container || !scroll) return;
    let inst: p5Type|null = null, alive = true;
    buildSketch(container, scroll, sectionEls.current).then(p5inst => {
      if (!alive) { p5inst.remove(); return; }
      inst = p5inst;
    });
    return () => { alive = false; inst?.remove(); };
  }, []);

  const positions: React.CSSProperties[] = [
    {top:"12%",   right:"7%", textAlign:"right"},
    {bottom:"14%",left:"6%"},
    {top:"50%",   right:"7%", textAlign:"right", transform:"translateY(-50%)"},
    {bottom:"14%",right:"7%", textAlign:"right"},
    {top:"12%",   left:"6%"},
    {top:"50%",   left:"6%", transform:"translateY(-50%)"},
    {top:"12%",   right:"7%", textAlign:"right"},
    {bottom:"14%",left:"6%"},
    {top:"50%",   right:"7%", textAlign:"right", transform:"translateY(-50%)"},
    {top:"12%",   left:"6%"},
    {bottom:"14%",right:"7%", textAlign:"right"},
    {top:"50%",   left:"50%", textAlign:"center", transform:"translate(-50%,-50%)"},
  ];

  const chips = ["#18182e","#2e1806","#180618","#061810"];
  const texts = ["#7878e0","#e09028","#a850e8","#38c890"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#050508"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_K.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_K[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_K[chIdx]}`}</span>
            <h2 style={{
              margin:0, fontSize:"clamp(1.7rem,3.8vw,3.2rem)", fontWeight:700,
              lineHeight:1.05, letterSpacing:"-0.01em",
              textTransform:"uppercase", color:texts[chIdx],
            }}>
              {headline}<br/>
              <span style={{
                fontWeight:300, fontSize:"clamp(1.0rem,2.3vw,1.9rem)",
                letterSpacing:"0.09em", color:chips[chIdx], textTransform:"lowercase",
              }}>{sub}</span>
            </h2>
          </div>
        );
      })}
    </div>
  );
}
