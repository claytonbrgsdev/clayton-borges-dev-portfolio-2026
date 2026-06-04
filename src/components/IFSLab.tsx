"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── IFS chaos game constants ───────────────────────────────────────────────────
const W_IFS = 220, H_IFS = 146, N_IFS = W_IFS * H_IFS;
const N_POINTS  = 7000;   // chaos game iterations per frame
const DECAY_IFS = 0.9985;
const SPLAT_IFS = 0.035;

// Module-level density buffer
const density = new Float32Array(N_IFS);
let   ifsCurX = 0, ifsCurY = 0;

// Transform: T(x,y) = (a·x + b·y + e, c·x + d·y + f)
type T6 = [number,number,number,number,number,number];  // [a, b, c, d, e, f]

interface IFSSystem {
  transforms: T6[];
  cumProbs:   number[];   // cumulative probabilities
  xMin: number; xMax: number; yMin: number; yMax: number;
}

const IFS_SYSTEMS: IFSSystem[] = [
  // ch1 — Barnsley Fern
  {
    transforms: [
      [ 0.00,  0.00,  0.00,  0.16,  0.00,  0.00],
      [ 0.85,  0.04, -0.04,  0.85,  0.00,  1.60],
      [ 0.20, -0.26,  0.23,  0.22,  0.00,  1.60],
      [-0.15,  0.28,  0.26,  0.24,  0.00,  0.44],
    ],
    cumProbs: [0.01, 0.86, 0.93, 1.00],
    xMin: -2.5, xMax: 2.5, yMin: 0.0, yMax: 10.0,
  },
  // ch2 — Sierpinski Triangle
  {
    transforms: [
      [0.50, 0.00, 0.00, 0.50, 0.00,  0.00],
      [0.50, 0.00, 0.00, 0.50, 0.50,  0.00],
      [0.50, 0.00, 0.00, 0.50, 0.25,  0.43],
    ],
    cumProbs: [0.333, 0.667, 1.000],
    xMin: 0.0, xMax: 1.0, yMin: 0.0, yMax: 0.87,
  },
  // ch3 — Lévy C Curve
  {
    transforms: [
      [ 0.50, -0.50,  0.50,  0.50,  0.00,  0.00],
      [ 0.50,  0.50, -0.50,  0.50,  0.50,  0.50],
    ],
    cumProbs: [0.50, 1.00],
    xMin: -0.55, xMax: 1.55, yMin: -0.05, yMax: 1.55,
  },
  // ch4 — Heighway Dragon
  {
    transforms: [
      [ 0.50, -0.50,  0.50,  0.50,  0.00,  0.00],
      [-0.50, -0.50,  0.50, -0.50,  1.00,  0.00],
    ],
    cumProbs: [0.50, 1.00],
    xMin: -0.4, xMax: 1.4, yMin: -0.5, yMax: 1.2,
  },
];

function applyIFS(x: number, y: number, sys: IFSSystem): [number, number] {
  const r = Math.random();
  let ti = 0;
  while (ti < sys.cumProbs.length - 1 && r >= sys.cumProbs[ti]) ti++;
  const [a, b, c, d, e, f] = sys.transforms[ti];
  return [a*x + b*y + e, c*x + d*y + f];
}

function toPixel(x: number, y: number, sys: IFSSystem): [number, number] {
  const px = (x - sys.xMin) / (sys.xMax - sys.xMin) * W_IFS;
  const py = (1 - (y - sys.yMin) / (sys.yMax - sys.yMin)) * H_IFS;
  return [px | 0, py | 0];
}

// Per-chapter: [bg_r,bg_g,bg_b, fg_r,fg_g,fg_b]
const CH_PALS_IFS: [number,number,number,number,number,number][] = [
  [ 2,  6,  2,   60, 200,  80],  // ch1 FERN:      deep green + bright green
  [ 2,  4, 12,   80, 130, 255],  // ch2 SIERPINSKI: deep blue + electric blue
  [ 8,  4,  2,  255, 180,  70],  // ch3 LÉVY:       dark amber + bright gold
  [ 8,  2,  8,  230,  90, 255],  // ch4 DRAGON:     deep purple + violet
];

const CH_NAMES_IFS = ["FERN","SIERPINSKI","LÉVY","DRAGON"];

const SECTIONS_IFS = [
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

const HEADINGS_IFS: [string,string][] = [
  ["SEED",        "four transforms — one plant"],
  ["CHAOS GAME",  "apply a random rule, forever"],
  ["ATTRACTOR",   "the shape that no rule directly draws"],
  ["TRIANGLE",    "the triangle that contains only triangles"],
  ["SELF-SIMILAR","every sub-triangle is the whole"],
  ["CANTOR",      "remove the middle — repeat"],
  ["LÉVY CURVE",  "folded at every scale"],
  ["FRACTAL DUST","the boundary of a curve is a set"],
  ["RECURSION",   "T applied to itself, forever"],
  ["DRAGON",      "fold a strip of paper in half, repeat"],
  ["EVERY LAB",   "was two transforms — one infinite form"],
  ["ARRIVING",    "at the shape the rule already was"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    density.fill(0);
    let lastChapter = -1;
    let totalPoints = 0;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_IFS; offscreen.height = H_IFS;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_IFS, H_IFS);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        if (chIdx !== lastChapter) {
          density.fill(0);
          totalPoints = 0;
          const sys = IFS_SYSTEMS[chIdx];
          // Start point inside attractor domain
          ifsCurX = (sys.xMin + sys.xMax) * 0.5;
          ifsCurY = (sys.yMin + sys.yMax) * 0.5;
          // Pre-warm: discard first 50 points (transient to attractor)
          for (let w = 0; w < 50; w++) [ifsCurX, ifsCurY] = applyIFS(ifsCurX, ifsCurY, sys);
          lastChapter = chIdx;
        }

        const sys = IFS_SYSTEMS[chIdx];

        // Decay density
        for (let i = 0; i < N_IFS; i++) density[i] *= DECAY_IFS;

        // Chaos game iteration + splat
        for (let k = 0; k < N_POINTS; k++) {
          [ifsCurX, ifsCurY] = applyIFS(ifsCurX, ifsCurY, sys);
          const [px, py] = toPixel(ifsCurX, ifsCurY, sys);
          if (px >= 0 && px < W_IFS && py >= 0 && py < H_IFS) {
            const di = py * W_IFS + px;
            const v = density[di] + SPLAT_IFS;
            density[di] = v > 1 ? 1 : v;
          }
        }
        totalPoints += N_POINTS;

        // Blend palettes
        const p0 = CH_PALS_IFS[chIdx], p1 = CH_PALS_IFS[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend)), bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const fgR = Math.round(lerp(p0[3],p1[3],blend)), fgG = Math.round(lerp(p0[4],p1[4],blend));
        const fgB = Math.round(lerp(p0[5],p1[5],blend));

        // Log-mapped density render
        const logScale = Math.log(1 + 60);
        const sd = offImg.data;
        for (let idx = 0; idx < N_IFS; idx++) {
          const brt = Math.min(1, Math.log(1 + density[idx] * 60) / logScale);
          const pi = idx * 4;
          sd[pi  ] = Math.round(lerp(bgR, fgR, brt));
          sd[pi+1] = Math.round(lerp(bgG, fgG, brt));
          sd[pi+2] = Math.round(lerp(bgB, fgB, brt));
          sd[pi+3] = 255;
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(fgR, fgG, fgB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`${sys.transforms.length} TRANSFORMS`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · IFS CHAOS GAME`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${(totalPoints/1000).toFixed(0)}k pts`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_IFS[i];
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
export function IFSLab() {
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

  const chips = ["#061206","#04080e","#201408","#160616"];
  const texts = ["#40c850","#5090f8","#f0b040","#d050f8"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#040604"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_IFS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_IFS[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_IFS[chIdx]}`}</span>
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
