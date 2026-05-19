"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Lorenz system constants ────────────────────────────────────────────────────
const W_L = 240, H_L = 160, N_L = W_L * H_L;
const N_PARTS   = 620;
const SIGMA     = 10.0;
const BETA      = 8.0 / 3.0;
const DT_L      = 0.005;
const STEPS_L   = 7;
const DECAY_L   = 0.978;
const SPLAT_L   = 0.09;

// Projection: x ∈ [-30,30], z ∈ [0,75]
const X_HALF = 30, Z_MAX = 75;

// Module-level buffers
const densW  = new Float32Array(N_L);  // warm wing (x > 0)
const densC  = new Float32Array(N_L);  // cool wing (x < 0)
const partX  = new Float32Array(N_PARTS);
const partY  = new Float32Array(N_PARTS);
const partZ  = new Float32Array(N_PARTS);

// Single-particle trajectory trail (particle 0)
const TRAIL_LEN = 220;
const trailSX   = new Float32Array(TRAIL_LEN);  // screen-space x
const trailSZ   = new Float32Array(TRAIL_LEN);  // screen-space z
let trailHead = 0, trailCount = 0;

function lorenzDerivs(x: number, y: number, z: number, rho: number): [number,number,number] {
  return [SIGMA*(y-x), x*(rho-z)-y, x*y - BETA*z];
}

function rk4Step(x: number, y: number, z: number, rho: number): [number,number,number] {
  const [k1x,k1y,k1z] = lorenzDerivs(x, y, z, rho);
  const [k2x,k2y,k2z] = lorenzDerivs(x+DT_L/2*k1x, y+DT_L/2*k1y, z+DT_L/2*k1z, rho);
  const [k3x,k3y,k3z] = lorenzDerivs(x+DT_L/2*k2x, y+DT_L/2*k2y, z+DT_L/2*k2z, rho);
  const [k4x,k4y,k4z] = lorenzDerivs(x+DT_L*k3x, y+DT_L*k3y, z+DT_L*k3z, rho);
  return [
    x + DT_L*(k1x+2*k2x+2*k3x+k4x)/6,
    y + DT_L*(k1y+2*k2y+2*k3y+k4y)/6,
    z + DT_L*(k1z+2*k2z+2*k3z+k4z)/6,
  ];
}

function toScreen(lx: number, lz: number): [number, number] {
  return [
    Math.round((lx + X_HALF) / (X_HALF * 2) * W_L),
    Math.round((1 - lz / Z_MAX) * H_L),
  ];
}

function seedParticles(rho: number) {
  // Start near the two fixed-point attractors with noise
  const fixZ = rho - 1;
  const fixXY = Math.sqrt(BETA * Math.max(0, rho - 1));
  for (let i = 0; i < N_PARTS; i++) {
    const side = i < N_PARTS * 0.5 ? 1 : -1;
    partX[i] = side * fixXY + (Math.random() - 0.5) * 4;
    partY[i] = side * fixXY + (Math.random() - 0.5) * 4;
    partZ[i] = Math.max(0.5, fixZ + (Math.random() - 0.5) * 8);
  }
}

// ρ schedule: smooth ramp driven by scroll
function rhoFromSp(sp: number): number {
  // ch1 [0.00,0.25]: ρ=14→24 (period → onset)
  // ch2 [0.25,0.50]: ρ=24→28 (onset → classic chaos)
  // ch3 [0.50,0.75]: ρ=28→45 (chaos deepens)
  // ch4 [0.75,1.00]: ρ=45→60 (deep chaos)
  if (sp < 0.25) return lerp(14, 24, sp / 0.25);
  if (sp < 0.50) return lerp(24, 28, (sp - 0.25) / 0.25);
  if (sp < 0.75) return lerp(28, 45, (sp - 0.50) / 0.25);
  return lerp(45, 60, (sp - 0.75) / 0.25);
}

const CH_NAMES_L = ["PERIODIC","ONSET","CHAOS","STRANGE"];

// Per-chapter: [bgR,bgG,bgB, warmR,warmG,warmB, coolR,coolG,coolB]
const CH_PALS_L: [number,number,number,number,number,number,number,number,number][] = [
  // ch1 PERIODIC — midnight blue, ice blue, steel
  [ 3,  4, 10,  140, 185, 255,   60, 100, 180],
  // ch2 ONSET — dark teal, amber-warm, cyan
  [ 3, 10,  8,  255, 200,  90,   50, 185, 170],
  // ch3 CHAOS — near-black, orange-red, electric blue
  [ 6,  3,  3,  255, 120,  50,   60,  80, 220],
  // ch4 STRANGE — true black, crimson, violet-blue
  [ 2,  2,  4,  220,  60,  60,   90,  60, 210],
];

const SECTIONS_L = [
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

const HEADINGS_L: [string,string][] = [
  ["PERIOD",      "before the butterfly breaks"],
  ["FIXED POINT", "where every orbit terminates"],
  ["LIMIT CYCLE", "the loop that almost closes"],
  ["ONSET",       "ρ = 24.74"],
  ["SENSITIVE",   "two points that have already diverged"],
  ["BIFURCATION", "the last orderly transition"],
  ["CHAOS",       "bounded and unpredictable"],
  ["BUTTERFLY",   "ρ = 28"],
  ["STRANGE",     "the attractor that never repeats"],
  ["DEEP",        "ρ = 45"],
  ["ERGODIC",     "time average equals space average"],
  ["THE SHAPE",   "all trajectories — one form"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    densW.fill(0); densC.fill(0);
    seedParticles(14);
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
        offscreen.width = W_L; offscreen.height = H_L;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_L, H_L);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        const rho = rhoFromSp(sp);

        if (chIdx !== lastChapter) {
          seedParticles(rho);
          densW.fill(0); densC.fill(0);
          trailHead = 0; trailCount = 0;
          lastChapter = chIdx;
        }

        // Integrate particles
        for (let s = 0; s < STEPS_L; s++) {
          for (let i = 0; i < N_PARTS; i++) {
            const [nx, ny, nz] = rk4Step(partX[i], partY[i], partZ[i], rho);
            if (!isFinite(nx) || !isFinite(ny) || !isFinite(nz)) {
              // Reset particle if it escapes
              const side = Math.random() < 0.5 ? 1 : -1;
              const fxy = Math.sqrt(BETA * Math.max(0, rho - 1));
              partX[i] = side * fxy + (Math.random()-0.5)*2;
              partY[i] = side * fxy + (Math.random()-0.5)*2;
              partZ[i] = Math.max(0.5, rho - 1 + (Math.random()-0.5)*4);
            } else {
              partX[i] = nx; partY[i] = ny; partZ[i] = nz;
            }
          }
        }

        // Record trail for particle 0
        {
          const [tsx, tsz] = toScreen(partX[0], partZ[0]);
          trailSX[trailHead] = tsx; trailSZ[trailHead] = tsz;
          trailHead = (trailHead + 1) % TRAIL_LEN;
          if (trailCount < TRAIL_LEN) trailCount++;
        }

        // Decay and splat
        for (let i = 0; i < N_L; i++) { densW[i] *= DECAY_L; densC[i] *= DECAY_L; }
        for (let i = 0; i < N_PARTS; i++) {
          const [sx, sz] = toScreen(partX[i], partZ[i]);
          if (sx >= 0 && sx < W_L && sz >= 0 && sz < H_L) {
            const di = sz * W_L + sx;
            if (partX[i] > 0) {
              const v = densW[di] + SPLAT_L; densW[di] = v > 1 ? 1 : v;
            } else {
              const v = densC[di] + SPLAT_L; densC[di] = v > 1 ? 1 : v;
            }
          }
        }

        // Blend palettes
        const p0 = CH_PALS_L[chIdx], p1 = CH_PALS_L[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend)), bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const wR  = Math.round(lerp(p0[3],p1[3],blend)), wG  = Math.round(lerp(p0[4],p1[4],blend));
        const wB  = Math.round(lerp(p0[5],p1[5],blend));
        const cR  = Math.round(lerp(p0[6],p1[6],blend)), cG  = Math.round(lerp(p0[7],p1[7],blend));
        const cB  = Math.round(lerp(p0[8],p1[8],blend));

        // Pixel render — two-wing color separation
        const sd = offImg.data;
        for (let idx = 0; idx < N_L; idx++) {
          const bW = Math.min(1, Math.sqrt(densW[idx] * 1.5));
          const bC = Math.min(1, Math.sqrt(densC[idx] * 1.5));
          const pi = idx * 4;
          sd[pi  ] = Math.min(255, Math.round(bgR + wR*bW + cR*bC));
          sd[pi+1] = Math.min(255, Math.round(bgG + wG*bW + cG*bC));
          sd[pi+2] = Math.min(255, Math.round(bgB + wB*bW + cB*bC));
          sd[pi+3] = 255;
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Single-particle trajectory trail
        const trailA = ss(0.04, 0.18, sp);
        if (trailA > 0.01 && trailCount > 3) {
          const scx = W / W_L, scy = H / H_L;
          dc.lineWidth = 0.75;
          dc.beginPath();
          for (let t = 0; t < trailCount; t++) {
            const ti = (trailHead - trailCount + t + TRAIL_LEN) % TRAIL_LEN;
            const px2 = trailSX[ti] * scx, pz2 = trailSZ[ti] * scy;
            const fade = t / trailCount;  // 0 = oldest, 1 = newest
            if (t === 0) {
              dc.moveTo(px2, pz2);
            } else {
              // Vary color: warm/cool by sign of partX[0] at that moment — use x-position heuristic
              dc.strokeStyle = trailSX[ti] > W_L * 0.5
                ? `rgba(${wR},${wG},${wB},${(fade * trailA * 0.55).toFixed(3)})`
                : `rgba(${cR},${cG},${cB},${(fade * trailA * 0.55).toFixed(3)})`;
              dc.lineTo(px2, pz2);
              dc.stroke();
              dc.beginPath();
              dc.moveTo(px2, pz2);
            }
          }
        }

        // Fixed-point markers — show the C± attractors as faint crosses
        const fpAlpha = ss(0.01, 0.12, sp) * ss(0.0, 0.18, sp) * (1 - ss(0.35, 0.48, sp));
        if (fpAlpha > 0.01) {
          const fxy = Math.sqrt(BETA * Math.max(0, rho - 1));
          const fpZ = rho - 1;
          const scx = W / W_L, scy = H / H_L;
          const pairs: [number,number,boolean][] = [[fxy, fpZ, true], [-fxy, fpZ, false]];
          for (const [fx, fz, warm] of pairs) {
            const [px2, pz2] = toScreen(fx, fz);
            const sx2 = px2 * scx, sz2 = pz2 * scy;
            dc.strokeStyle = warm
              ? `rgba(${wR},${wG},${wB},${(fpAlpha*0.7).toFixed(2)})`
              : `rgba(${cR},${cG},${cB},${(fpAlpha*0.7).toFixed(2)})`;
            dc.lineWidth = 0.8;
            dc.beginPath(); dc.moveTo(sx2-6,sz2); dc.lineTo(sx2+6,sz2); dc.stroke();
            dc.beginPath(); dc.moveTo(sx2,sz2-6); dc.lineTo(sx2,sz2+6); dc.stroke();
          }
        }

        // ρ readout bar — vertical indicator on right edge
        const barA = ss(0.04, 0.14, sp);
        if (barA > 0.01) {
          const barH = H * 0.4, barY = H * 0.3;
          const barX = W * 0.968;
          const rhoNorm = Math.min(1, (rho - 14) / 46);
          dc.strokeStyle = `rgba(${wR},${wG},${wB},${(barA * 0.3).toFixed(2)})`;
          dc.lineWidth = 1;
          dc.beginPath(); dc.moveTo(barX, barY); dc.lineTo(barX, barY + barH); dc.stroke();
          dc.fillStyle = `rgba(${wR},${wG},${wB},${(barA * 0.8).toFixed(2)})`;
          dc.beginPath(); dc.arc(barX, barY + barH * (1 - rhoNorm), 2.5, 0, Math.PI*2); dc.fill();
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(wR, wG, wB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`ρ = ${rho.toFixed(2)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · LORENZ ATTRACTOR`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`σ=${SIGMA} β=${BETA.toFixed(2)}`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_L[i];
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
export function LorenzLab() {
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

  const chips = ["#18203a","#183028","#2a1008","#18081a"];
  const texts = ["#8aadde","#60d0b8","#e07830","#c040a0"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#020206"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_L.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_L[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_L[chIdx]}`}</span>
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
