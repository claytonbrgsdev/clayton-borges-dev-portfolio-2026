"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Chua's circuit constants ───────────────────────────────────────────────────
const W_C = 200, H_C = 133, N_C = W_C * H_C;
const N_PARTS_C   = 600;
const DT_C        = 0.012;
const STEPS_C     = 6;
const DECAY_C     = 0.972;
const SPLAT_C     = 0.038;
const BETA        = 28.0;
const M0          = -1 / 7;
const M1          =  2 / 7;
const M01H        = 0.5 * (M0 - M1);
// Phase space projection: (x, z)
const X_MIN = -2.8, X_MAX = 2.8;
const Z_MIN = -4.2, Z_MAX = 4.2;

// α ramp: drives period-doubling cascade
const ALPHA_RANGES: [number, number][] = [
  [8.0,  9.4],   // ch1 — limit cycle formation
  [9.4,  11.8],  // ch2 — period-2 orbit
  [11.8, 14.1],  // ch3 — period-4 cascade
  [14.1, 15.7],  // ch4 — double scroll chaos
];

function alphaFromSp(sp: number): number {
  const chF = sp * 4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
  const [a0, a1] = ALPHA_RANGES[chIdx];
  return lerp(a0, a1, ss(0, 1, chT));
}

// Chua piecewise-linear characteristic: f(x) = m₁x + ½(m₀-m₁)(|x+1|-|x-1|)
function chuaF(x: number): number {
  return M1 * x + M01H * (Math.abs(x + 1) - Math.abs(x - 1));
}

// ── Module-level simulation state ─────────────────────────────────────────────
const partX = new Float32Array(N_PARTS_C);
const partY = new Float32Array(N_PARTS_C);
const partZ = new Float32Array(N_PARTS_C);
const densA  = new Float32Array(N_C);  // right lobe  x > 0 → warm
const densB  = new Float32Array(N_C);  // left lobe   x < 0 → cool
const pixBuf_C = new Uint8Array(N_C * 4);

// Tracer trail for particle[0] — shows orbit topology
const TRAIL_LEN_C = 200;
const trailX_C = new Float32Array(TRAIL_LEN_C);
const trailZ_C = new Float32Array(TRAIL_LEN_C);
let trailHead_C = 0;

function initParticles() {
  for (let i = 0; i < N_PARTS_C; i++) {
    partX[i] = (Math.random() - 0.5) * 3.0;
    partY[i] = (Math.random() - 0.5) * 0.15;
    partZ[i] = (Math.random() - 0.5) * 0.8;
  }
}

function prewarm(alpha: number, steps: number) {
  for (let i = 0; i < N_PARTS_C; i++) {
    let x = partX[i], y = partY[i], z = partZ[i];
    for (let s = 0; s < steps; s++) {
      // RK4 inline
      const f0=chuaF(x); const dx0=alpha*(y-x-f0), dy0=x-y+z, dz0=-BETA*y;
      const xb=x+DT_C*dx0/2, yb=y+DT_C*dy0/2, zb=z+DT_C*dz0/2;
      const f1=chuaF(xb); const dx1=alpha*(yb-xb-f1), dy1=xb-yb+zb, dz1=-BETA*yb;
      const xc=x+DT_C*dx1/2, yc=y+DT_C*dy1/2, zc=z+DT_C*dz1/2;
      const f2=chuaF(xc); const dx2=alpha*(yc-xc-f2), dy2=xc-yc+zc, dz2=-BETA*yc;
      const xd=x+DT_C*dx2, yd=y+DT_C*dy2, zd=z+DT_C*dz2;
      const f3=chuaF(xd); const dx3=alpha*(yd-xd-f3), dy3=xd-yd+zd, dz3=-BETA*yd;
      x += DT_C*(dx0+2*dx1+2*dx2+dx3)/6;
      y += DT_C*(dy0+2*dy1+2*dy2+dy3)/6;
      z += DT_C*(dz0+2*dz1+2*dz2+dz3)/6;
      if (Math.abs(x) > 7) { x = (Math.random()-0.5)*2; y = (Math.random()-0.5)*0.1; z = (Math.random()-0.5)*0.5; }
    }
    partX[i] = x; partY[i] = y; partZ[i] = z;
  }
}

function advanceChua(alpha: number) {
  for (let i = 0; i < N_C; i++) { densA[i] *= DECAY_C; densB[i] *= DECAY_C; }

  for (let i = 0; i < N_PARTS_C; i++) {
    let x = partX[i], y = partY[i], z = partZ[i];
    for (let s = 0; s < STEPS_C; s++) {
      const f0=chuaF(x); const dx0=alpha*(y-x-f0), dy0=x-y+z, dz0=-BETA*y;
      const xb=x+DT_C*dx0/2, yb=y+DT_C*dy0/2, zb=z+DT_C*dz0/2;
      const f1=chuaF(xb); const dx1=alpha*(yb-xb-f1), dy1=xb-yb+zb, dz1=-BETA*yb;
      const xc=x+DT_C*dx1/2, yc=y+DT_C*dy1/2, zc=z+DT_C*dz1/2;
      const f2=chuaF(xc); const dx2=alpha*(yc-xc-f2), dy2=xc-yc+zc, dz2=-BETA*yc;
      const xd=x+DT_C*dx2, yd=y+DT_C*dy2, zd=z+DT_C*dz2;
      const f3=chuaF(xd); const dx3=alpha*(yd-xd-f3), dy3=xd-yd+zd, dz3=-BETA*yd;
      x += DT_C*(dx0+2*dx1+2*dx2+dx3)/6;
      y += DT_C*(dy0+2*dy1+2*dy2+dy3)/6;
      z += DT_C*(dz0+2*dz1+2*dz2+dz3)/6;

      if (Math.abs(x) > 7 || Math.abs(z) > 11) {
        x = (Math.random()-0.5)*2; y=(Math.random()-0.5)*0.1; z=(Math.random()-0.5)*0.5;
        break;
      }

      const px = ((x - X_MIN) / (X_MAX - X_MIN) * W_C) | 0;
      const pz = ((z - Z_MIN) / (Z_MAX - Z_MIN) * H_C) | 0;
      if (px >= 0 && px < W_C && pz >= 0 && pz < H_C) {
        const di = pz * W_C + px;
        if (x > 0) { const v=densA[di]+SPLAT_C; densA[di]=v>1?1:v; }
        else        { const v=densB[di]+SPLAT_C; densB[di]=v>1?1:v; }
      }
    }
    partX[i] = x; partY[i] = y; partZ[i] = z;
  }
}

// Per-chapter palette: [bgR,bgG,bgB, warmR,warmG,warmB, coolR,coolG,coolB]
const CH_PAL_C: [number,number,number,number,number,number,number,number,number][] = [
  [2,2,6,  200,160, 50,  50,140,220],
  [2,2,6,  220, 90, 40,  40,200,220],
  [2,2,6,  240, 60,100,  60,200,150],
  [2,2,6,  255, 70, 20,  20, 70,255],
];
const CH_NAMES_C = ["PERIOD-1","PERIOD-2","CASCADE","DOUBLE SCROLL"];

function renderChua(chIdx: number) {
  const [bgR,bgG,bgB, wR,wG,wB, cR,cG,cB] = CH_PAL_C[chIdx];
  const logS = Math.log(1 + 50);
  for (let idx = 0; idx < N_C; idx++) {
    const bA = Math.min(1, Math.log(1 + densA[idx]*50) / logS);
    const bB = Math.min(1, Math.log(1 + densB[idx]*50) / logS);
    const pi = idx * 4;
    pixBuf_C[pi  ] = Math.min(255, bgR + Math.round(wR*bA + cR*bB));
    pixBuf_C[pi+1] = Math.min(255, bgG + Math.round(wG*bA + cG*bB));
    pixBuf_C[pi+2] = Math.min(255, bgB + Math.round(wB*bA + cB*bB));
    pixBuf_C[pi+3] = 255;
  }
}

const SECTIONS_C = [
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

const HEADINGS_C: [string,string][] = [
  ["LIMIT CYCLE",  "one closed orbit — the circuit breathes"],
  ["EQUILIBRIUM",  "the attractor holds its shape"],
  ["PERIOD TWO",   "a second frequency appears"],
  ["DOUBLING",     "2 — 4 — 8 — chaos approaches"],
  ["CASCADE",      "Feigenbaum ratio: δ ≈ 4.6692"],
  ["BIFURCATION",  "each parameter split, non-reversible"],
  ["DOUBLE SCROLL","two wings — one strange attractor"],
  ["NONPERIODIC",  "the trajectory never repeats"],
  ["SENSITIVE",    "nearby initial conditions diverge"],
  ["CHUA",         "three equations — a simple circuit"],
  ["PIECEWISE",    "f(x) is linear by segments"],
  ["THE CIRCUIT",  "one resistor — infinite complexity"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    densA.fill(0); densB.fill(0); pixBuf_C.fill(0);
    trailX_C.fill(0); trailZ_C.fill(0); trailHead_C = 0;
    initParticles();

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_C; offscreen.height = H_C;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_C, H_C);
        prewarm(8.0, 2000);
        renderChua(0);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF));
        const alpha = alphaFromSp(sp);

        advanceChua(alpha);
        trailX_C[trailHead_C] = partX[0];
        trailZ_C[trailHead_C] = partZ[0];
        trailHead_C = (trailHead_C + 1) % TRAIL_LEN_C;

        renderChua(chIdx);

        offImg.data.set(pixBuf_C);
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Tracer trail — 4 opacity bands
        {
          const scX = W / (X_MAX - X_MIN), scZ = H / (Z_MAX - Z_MIN);
          const ox2 = -X_MIN * scX, oz2 = -Z_MIN * scZ;
          const [,,,wR,wG,wB] = CH_PAL_C[chIdx];
          const BANDS = 4;
          for (let b = 0; b < BANDS; b++) {
            const t0 = Math.floor(b * TRAIL_LEN_C / BANDS);
            const t1 = Math.floor((b+1) * TRAIL_LEN_C / BANDS);
            const aT = (b + 0.5) / BANDS;
            dc.strokeStyle = `rgba(${wR},${wG},${wB},${(aT * 0.62).toFixed(2)})`;
            dc.lineWidth = 0.6 + aT * 0.5;
            dc.beginPath();
            for (let t = t0; t < t1; t++) {
              const i0 = (trailHead_C + t) % TRAIL_LEN_C;
              const i1 = (trailHead_C + t + 1) % TRAIL_LEN_C;
              dc.moveTo(ox2 + trailX_C[i0]*scX, oz2 + trailZ_C[i0]*scZ);
              dc.lineTo(ox2 + trailX_C[i1]*scX, oz2 + trailZ_C[i1]*scZ);
            }
            dc.stroke();
          }
        }

        // α-bar on right edge
        const aFrac = (alpha - 8.0) / (15.7 - 8.0);
        const barH = H * 0.6, barY = H * 0.20;
        dc.strokeStyle = "rgba(200,180,100,0.15)";
        dc.lineWidth = 2;
        dc.beginPath(); dc.moveTo(W*0.984, barY); dc.lineTo(W*0.984, barY+barH); dc.stroke();
        dc.strokeStyle = "rgba(200,180,100,0.55)";
        dc.lineWidth = 2;
        dc.beginPath(); dc.moveTo(W*0.984, barY+barH*(1-aFrac)); dc.lineTo(W*0.984, barY+barH); dc.stroke();
        // Bifurcation tick marks at chapter boundaries
        for (const ba of [9.4, 11.8, 14.1]) {
          const bFrac = (ba - 8.0) / (15.7 - 8.0);
          const bY = barY + barH * (1 - bFrac);
          dc.strokeStyle = "rgba(255,255,255,0.28)";
          dc.lineWidth = 0.8;
          dc.beginPath(); dc.moveTo(W*0.980, bY); dc.lineTo(W*0.989, bY); dc.stroke();
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const [,,, wR,wG,wB] = CH_PAL_C[chIdx];
          p.noStroke();
          p.fill(wR, wG, wB, Math.round(hudA * 45));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`α = ${alpha.toFixed(3)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ${CH_NAMES_C[chIdx]}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`β = ${BETA}`, W*0.982, H*0.982);
        }

        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_C[i];
          const alpha2 = secAlpha(sp, i0, i1, o0, o1);
          const secEl = sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity = alpha2.toFixed(3);
          secEl.style.pointerEvents = alpha2 > 0.05 ? "auto" : "none";
        }
      };
    };

    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ChuaLab() {
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

  const chips = ["#0e0c06","#0e0806","#0e0610","#060614"];
  const texts = ["#c8a030","#e05820","#e02860","#1440f0"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#020206"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_C.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_C[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_C[chIdx]}`}</span>
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
