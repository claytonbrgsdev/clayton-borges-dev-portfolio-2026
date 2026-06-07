"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Langton's ant constants ────────────────────────────────────────────────────
const W_A = 280, H_A = 186, N_A = W_A * H_A;

// Directions: 0=N, 1=E, 2=S, 3=W
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

// Module-level grid and ant state
const grid    = new Uint8Array(N_A);  // 0=white (off), 1=black (on)
let antX = 0, antY = 0, antDir = 0;
let totalSteps = 0;

// Pre-warm step counts per chapter (the starting state for each chapter)
const CHAPTER_START_STEPS = [0, 800, 10_500, 55_000];

function initAnt() {
  grid.fill(0);
  antX = W_A >> 1;
  antY = H_A >> 1;
  antDir = 0;
  totalSteps = 0;
}

function stepAnt() {
  const idx = antY * W_A + antX;
  if (grid[idx] === 0) {
    // White cell: turn right
    antDir = (antDir + 1) & 3;
    grid[idx] = 1;
  } else {
    // Black cell: turn left
    antDir = (antDir + 3) & 3;
    grid[idx] = 0;
  }
  // Move forward, wrap
  antX = ((antX + DX[antDir]) % W_A + W_A) % W_A;
  antY = ((antY + DY[antDir]) % H_A + H_A) % H_A;
  totalSteps++;
}

// Pre-warm: run N steps synchronously (cheap — no rendering)
function preWarm(targetSteps: number) {
  while (totalSteps < targetSteps) stepAnt();
}

// Steps per frame: slow at chapter start, fast by end of chapter
function stepsPerFrame(chT: number): number {
  return Math.round(lerp(6, 1200, ss(0.0, 0.85, chT)));
}

// Per-chapter: [bg_r,bg_g,bg_b, fg_r,fg_g,fg_b, ant_r,ant_g,ant_b]
const CH_PALS_L: [number,number,number,number,number,number,number,number,number][] = [
  [ 4,  4,  6,  90,  85,  95, 180, 175, 255],  // ch1 soft violet-gray
  [ 3,  9,  9,  45, 185, 160, 255, 210,  55],  // ch2 teal + gold ant
  [ 4,  4,  2, 155, 148,  80, 255, 200,  55],  // ch3 ochre + gold highway
  [ 2,  2,  4, 200, 196, 218, 255, 115,  65],  // ch4 silver road + orange ant
];

const CH_NAMES_L = ["FORMATION","CHAOS","HIGHWAY","INFINITE"];
const CH_NAMES_L_PT = ["FORMAÇÃO","CAOS","RODOVIA","INFINITO"];

const SECTIONS_LA = [
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

const HEADINGS_LA: [string,string][] = [
  ["LANGTON",       "one ant on an infinite grid"],
  ["SIMPLE",        "two states, four directions, two rules"],
  ["SYMMETRIC",     "the first 500 steps are ordered"],
  ["CHAOS",         "the ant wanders without purpose"],
  ["PSEUDORANDOM",  "but it is entirely determined"],
  ["MESSY",         "10,000 steps of apparent noise"],
  ["HIGHWAY",       "the diagonal machine that builds itself"],
  ["EMERGENT",      "no one designed the highway"],
  ["PERIODIC",      "104 steps to extend by 2 cells"],
  ["INFINITE",      "the highway continues forever"],
  ["DETERMINISM",   "from a single cell — an infinite road"],
  ["THE MACHINE",   "still running"],
];

const HEADINGS_LA_PT: [string,string][] = [
  ["LANGTON",         "uma formiga em uma grade infinita"],
  ["SIMPLES",         "dois estados, quatro direções, duas regras"],
  ["SIMÉTRICO",       "os primeiros 500 passos são ordenados"],
  ["CAOS",            "a formiga vagueia sem propósito"],
  ["PSEUDOALEATÓRIO", "mas é totalmente determinado"],
  ["BAGUNÇADO",       "10.000 passos de ruído aparente"],
  ["RODOVIA",         "a máquina diagonal que se constrói"],
  ["EMERGENTE",       "ninguém projetou a rodovia"],
  ["PERIÓDICO",       "104 passos para estender 2 células"],
  ["INFINITO",        "a rodovia continua para sempre"],
  ["DETERMINISMO",    "de uma única célula — uma estrada infinita"],
  ["A MÁQUINA",       "ainda em execução"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    initAnt();
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
        offscreen.width = W_A; offscreen.height = H_A;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_A, H_A);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        if (chIdx !== lastChapter) {
          initAnt();
          preWarm(CHAPTER_START_STEPS[chIdx]);
          lastChapter = chIdx;
        }

        const spf = stepsPerFrame(chT);
        for (let s = 0; s < spf; s++) stepAnt();

        // Blend palettes
        const p0 = CH_PALS_L[chIdx], p1 = CH_PALS_L[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend)), bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const fgR = Math.round(lerp(p0[3],p1[3],blend)), fgG = Math.round(lerp(p0[4],p1[4],blend));
        const fgB = Math.round(lerp(p0[5],p1[5],blend));
        const antR = Math.round(lerp(p0[6],p1[6],blend)), antG = Math.round(lerp(p0[7],p1[7],blend));
        const antB = Math.round(lerp(p0[8],p1[8],blend));

        // Render grid to pixel buffer
        const sd = offImg.data;
        for (let idx = 0; idx < N_A; idx++) {
          const pi = idx * 4;
          if (grid[idx] === 0) {
            sd[pi] = bgR; sd[pi+1] = bgG; sd[pi+2] = bgB;
          } else {
            sd[pi] = fgR; sd[pi+1] = fgG; sd[pi+2] = fgB;
          }
          sd[pi+3] = 255;
        }
        // Ant marker (bright dot on the grid)
        const antIdx = antY * W_A + antX;
        if (antIdx >= 0 && antIdx < N_A) {
          const pi = antIdx * 4;
          sd[pi] = antR; sd[pi+1] = antG; sd[pi+2] = antB; sd[pi+3] = 255;
        }

        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Direction arrow at ant position
        const arrA = ss(0.02, 0.15, sp) * (1 - ss(0.82, 0.92, sp));
        if (arrA > 0.01) {
          const sx = antX / W_A * W, sy = antY / H_A * H;
          dc.strokeStyle = `rgba(${antR},${antG},${antB},${(arrA * 0.9).toFixed(2)})`;
          dc.lineWidth = 1.2;
          dc.beginPath();
          dc.arc(sx, sy, 6, 0, Math.PI*2); dc.stroke();
          // Direction line
          const tx = sx + DX[antDir] * 10, ty = sy + DY[antDir] * 10;
          dc.beginPath(); dc.moveTo(sx, sy); dc.lineTo(tx, ty); dc.stroke();
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(antR, antG, antB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`STEPS ${totalSteps.toLocaleString()}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · LANGTON'S ANT`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${spf}/frame`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_LA[i];
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
export function LangtonLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement|null>>(Array(12).fill(null));
  const [locale] = useLabLocale();

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

  const activeChNames = locale === "pt" ? CH_NAMES_L_PT : CH_NAMES_L;
  const activeHeadings = locale === "pt" ? HEADINGS_LA_PT : HEADINGS_LA;

  const chips = ["#18181e","#0e2020","#181406","#0e0e18"];
  const texts = ["#8888c8","#28c8b0","#c8b840","#c880a0"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#040406"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_LA.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = activeHeadings[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${activeChNames[chIdx]}`}</span>
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
