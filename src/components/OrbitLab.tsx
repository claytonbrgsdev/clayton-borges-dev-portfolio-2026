"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));
const TAU = Math.PI*2;

// ── Simulation constants ──────────────────────────────────────────────────────
const W_D = 240, H_D = 160, N_D = W_D * H_D;
const N_BODIES = 6;
const DT       = 0.50;            // leapfrog time step
const PHYS_STEPS = 6;             // steps per frame
const EPS2     = 30;              // softening parameter squared
const MAX_DENS = 90;              // density cap per cell
const R0       = 52;              // initial hexagonal radius (in grid pixels)
const V0       = 0.52;            // initial tangential speed (px/time_unit)

// Body colors (one per body, blends with chapter palette)
const BODY_HUE = [0, 60, 120, 180, 240, 300]; // hue degrees

// Module-level simulation state
const bx  = new Float32Array(N_BODIES);
const by  = new Float32Array(N_BODIES);
const bvx = new Float32Array(N_BODIES);
const bvy = new Float32Array(N_BODIES);
const bm  = new Float32Array(N_BODIES);
const DENS = new Float32Array(N_D);

function resetBodies() {
  DENS.fill(0);
  const cx = W_D * 0.5, cy = H_D * 0.5;
  for (let i = 0; i < N_BODIES; i++) {
    const theta = i * TAU / N_BODIES + Math.PI / 6;
    bx[i]  = cx + R0 * Math.cos(theta);
    by[i]  = cy + R0 * Math.sin(theta);
    bvx[i] = -V0 * Math.sin(theta);
    bvy[i] =  V0 * Math.cos(theta);
    bm[i]  = 1.0 + (i % 3) * 0.22;  // slight mass variation
  }
}

function computeAccel(
  ax: Float32Array, ay: Float32Array, G: number,
) {
  ax.fill(0); ay.fill(0);
  for (let i = 0; i < N_BODIES; i++) {
    for (let j = i+1; j < N_BODIES; j++) {
      const dx = bx[j] - bx[i], dy = by[j] - by[i];
      const r2 = dx*dx + dy*dy + EPS2;
      const r  = Math.sqrt(r2);
      const f  = G / r2;
      const fx = f * dx/r, fy = f * dy/r;
      ax[i] += bm[j] * fx;  ay[i] += bm[j] * fy;
      ax[j] -= bm[i] * fx;  ay[j] -= bm[i] * fy;
    }
  }
}

const _ax0 = new Float32Array(N_BODIES);
const _ay0 = new Float32Array(N_BODIES);
const _ax1 = new Float32Array(N_BODIES);
const _ay1 = new Float32Array(N_BODIES);

function leapfrogStep(G: number) {
  // Half-kick
  computeAccel(_ax0, _ay0, G);
  for (let i = 0; i < N_BODIES; i++) {
    bvx[i] += 0.5 * _ax0[i] * DT;
    bvy[i] += 0.5 * _ay0[i] * DT;
  }
  // Drift
  for (let i = 0; i < N_BODIES; i++) {
    bx[i] += bvx[i] * DT;
    by[i] += bvy[i] * DT;
    // Elastic reflection at walls
    if (bx[i] < 1)      { bx[i] = 2 - bx[i];      bvx[i] = Math.abs(bvx[i]); }
    if (bx[i] > W_D-2)  { bx[i] = 2*(W_D-2)-bx[i]; bvx[i] = -Math.abs(bvx[i]); }
    if (by[i] < 1)      { by[i] = 2 - by[i];       bvy[i] = Math.abs(bvy[i]); }
    if (by[i] > H_D-2)  { by[i] = 2*(H_D-2)-by[i]; bvy[i] = -Math.abs(bvy[i]); }
  }
  // Final half-kick
  computeAccel(_ax1, _ay1, G);
  for (let i = 0; i < N_BODIES; i++) {
    bvx[i] += 0.5 * _ax1[i] * DT;
    bvy[i] += 0.5 * _ay1[i] * DT;
  }
}

function splatDensity(splat: number) {
  for (let i = 0; i < N_BODIES; i++) {
    const xi = Math.round(bx[i]), yi = Math.round(by[i]);
    if (xi < 0 || xi >= W_D || yi < 0 || yi >= H_D) continue;
    const idx = yi * W_D + xi;
    DENS[idx] = Math.min(MAX_DENS, DENS[idx] + splat * bm[i]);
    if (xi > 0)      DENS[idx-1]     = Math.min(MAX_DENS, DENS[idx-1]     + splat * 0.25);
    if (xi < W_D-1)  DENS[idx+1]     = Math.min(MAX_DENS, DENS[idx+1]     + splat * 0.25);
    if (yi > 0)      DENS[idx-W_D]   = Math.min(MAX_DENS, DENS[idx-W_D]   + splat * 0.25);
    if (yi < H_D-1)  DENS[idx+W_D]   = Math.min(MAX_DENS, DENS[idx+W_D]   + splat * 0.25);
  }
}

// ── Section / heading data ────────────────────────────────────────────────────
const SECTIONS = [
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

const CH_NAMES = ["ORBIT","PRECESSION","RESONANCE","SCATTERING"];

const HEADINGS: [string,string][] = [
  ["GRAVITY",    "an attraction without touching"],
  ["ORBIT",      "falling forever sideways"],
  ["PERIOD",     "the time before return"],
  ["PRECESSION", "the axis that slowly turns"],
  ["RESONANCE",  "when two periods share a ratio"],
  ["PETAL",      "the flower made by unstable orbit"],
  ["THREE BODY", "the problem that has no solution"],
  ["SLINGSHOT",  "the machine of stolen momentum"],
  ["ESCAPE",     "the minimum speed to never return"],
  ["SCATTERING", "chaos in the language of trajectories"],
  ["MEMORY",     "the density of where they have been"],
  ["TRACE",      "the orbit drawn by all its moments"],
];

// [bg_r,bg_g,bg_b, trail_r,trail_g,trail_b]
const PALETTES: [number,number,number,number,number,number][] = [
  [ 4,  5, 16,   70, 140, 248],  // deep space → electric blue
  [ 5, 12,  8,  238, 175,  75],  // dark forest → warm amber
  [ 8,  4, 14,  185,  90, 230],  // deep violet → bright violet
  [ 5,  5,  5,  242, 240, 235],  // pure black → near-white
];

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    resetBodies();

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let trailCanvas: HTMLCanvasElement, trailCtx: CanvasRenderingContext2D, trailImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        trailCanvas = document.createElement("canvas");
        trailCanvas.width = W_D; trailCanvas.height = H_D;
        trailCtx = trailCanvas.getContext("2d") as CanvasRenderingContext2D;
        trailImg = trailCtx.createImageData(W_D, H_D);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        // G grows with scroll → more chaotic dynamics
        const G = lerp(1.2, 7.5, sp);

        // Splat weight: accumulate more aggressively early to show trails faster
        const splatW = lerp(0.14, 0.08, sp);

        for (let s = 0; s < PHYS_STEPS; s++) leapfrogStep(G);
        splatDensity(splatW);

        // Palette interpolation
        const p0 = PALETTES[chIdx], p1 = PALETTES[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend));
        const bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const trR = Math.round(lerp(p0[3],p1[3],blend));
        const trG = Math.round(lerp(p0[4],p1[4],blend));
        const trB = Math.round(lerp(p0[5],p1[5],blend));

        // Render density → pixel buffer
        const td = trailImg.data;
        for (let idx = 0; idx < N_D; idx++) {
          const brt = Math.min(1, Math.sqrt(DENS[idx] / MAX_DENS));
          const brt2 = brt * brt;   // extra contrast curve
          const pi = idx * 4;
          td[pi  ] = Math.round(lerp(bgR, trR, brt2));
          td[pi+1] = Math.round(lerp(bgG, trG, brt2));
          td[pi+2] = Math.round(lerp(bgB, trB, brt2));
          td[pi+3] = 255;
        }
        trailCtx.putImageData(trailImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(trailCanvas, 0, 0, W, H);

        // Live body dots — HSV→RGB pure hues, clamped
        const scaleX = W / W_D, scaleY = H / H_D;
        p.noStroke();
        for (let i = 0; i < N_BODIES; i++) {
          const px = bx[i] * scaleX, py = by[i] * scaleY;
          const h  = BODY_HUE[i] / 360;
          const cr = Math.max(0, Math.min(1, Math.abs(h * 6 - 3) - 1));
          const cg = Math.max(0, Math.min(1, 2 - Math.abs(h * 6 - 2)));
          const cb = Math.max(0, Math.min(1, 2 - Math.abs(h * 6 - 4)));
          // Outer glow halo
          p.fill(Math.round(cr*255), Math.round(cg*255), Math.round(cb*255), 38);
          p.ellipse(px, py, 18, 18);
          // Inner ring
          p.fill(Math.round(cr*255), Math.round(cg*255), Math.round(cb*255), 90);
          p.ellipse(px, py, 10, 10);
          // Core
          p.fill(
            Math.min(255, Math.round(cr*180 + 75)),
            Math.min(255, Math.round(cg*180 + 75)),
            Math.min(255, Math.round(cb*180 + 75)),
            220,
          );
          p.ellipse(px, py, 4, 4);
        }

        // Energy + HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          // Total kinetic energy (proxy for system activity)
          let KE = 0;
          for (let i = 0; i < N_BODIES; i++) KE += 0.5 * bm[i] * (bvx[i]*bvx[i] + bvy[i]*bvy[i]);
          p.noStroke();
          p.fill(trR, trG, trB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`${N_BODIES} BODIES · G=${G.toFixed(2)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · N-BODY`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`KE ${KE.toFixed(1)}`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS[i];
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
export function OrbitLab() {
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
    {top:"12%",   left: "6%"},
    {bottom:"14%",right:"7%", textAlign:"right"},
    {top:"50%",   left: "6%", transform:"translateY(-50%)"},
    {top:"12%",   right:"7%", textAlign:"right"},
    {bottom:"14%",left: "6%"},
    {top:"50%",   right:"7%", textAlign:"right", transform:"translateY(-50%)"},
    {top:"12%",   left: "6%"},
    {bottom:"14%",right:"7%", textAlign:"right"},
    {top:"50%",   left: "6%", transform:"translateY(-50%)"},
    {top:"12%",   right:"7%", textAlign:"right"},
    {bottom:"14%",left: "6%"},
    {top:"50%",   left:"50%", textAlign:"center", transform:"translate(-50%,-50%)"},
  ];

  const chips = ["#284898","#587020","#682878","#606058"];
  const texts = ["#46a0f8","#eEcf4b","#c060e6","#f2f0eb"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#040510"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES[chIdx]}`}</span>
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
