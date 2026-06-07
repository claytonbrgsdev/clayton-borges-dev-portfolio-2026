"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Sandpile simulation constants ─────────────────────────────────────────────
const W_SND = 280, H_SND = 186, N_SND = W_SND * H_SND;

// Module-level simulation state
const height   = new Uint8Array(N_SND);
const flashBuf = new Uint8Array(N_SND);         // flash brightness 0–4
const topQ     = new Int32Array(N_SND * 2);
const inQ      = new Uint8Array(N_SND);
let qHead = 0, qTail = 0;
let totalTopplings = 0;
let frameTopplings = 0;
let cachedFilled = 0;          // amortized filledCells count
let filledFrame  = -999;       // last frame it was computed

// Drop sites per chapter
const DROP_SITES: [number,number][][] = [
  [[140, 93]],
  [[140, 93], [190, 65]],
  [[140, 93], [190, 65], [90, 121]],
  [[98, 65],  [182, 65], [98, 121], [182, 121]],
];

// Per-height grain colors per chapter [h0..h3]
const GRAIN_PALS: [number,number,number][][] = [
  [[8,8,10],  [30,42,68],   [68,95,148],  [130,165,210]],
  [[8,6,5],   [55,35,12],   [148,95,35],  [228,175,95]],
  [[8,5,10],  [55,22,80],   [130,55,165], [210,125,235]],
  [[5,5,6],   [48,48,55],   [125,122,132],[215,212,222]],
];

const FLASH_COLORS: [number,number,number][] = [
  [200,220,255],
  [255,235,180],
  [240,200,255],
  [248,248,252],
];

// Shockwave ring state (one per chapter)
interface Wave { cx: number; cy: number; r: number; alpha: number; }
const activeWaves: Wave[] = [];

function dropAndQueue(idx: number) {
  if (idx < 0 || idx >= N_SND) return;
  height[idx]++;
  if (height[idx] >= 4 && !inQ[idx]) {
    topQ[qTail++] = idx;
    inQ[idx] = 1;
  }
}

function toppleAll() {
  while (qHead < qTail) {
    const idx = topQ[qHead++];
    inQ[idx] = 0;
    while (height[idx] >= 4) {
      height[idx] -= 4;
      flashBuf[idx] = 4;
      totalTopplings++;
      frameTopplings++;
      const x = idx % W_SND, y = (idx / W_SND) | 0;
      if (x > 0)       dropAndQueue(idx - 1);
      if (x < W_SND-1) dropAndQueue(idx + 1);
      if (y > 0)       dropAndQueue(idx - W_SND);
      if (y < H_SND-1) dropAndQueue(idx + W_SND);
    }
  }
  qHead = qTail = 0;
}

function dropGrains(sites: [number,number][], n: number) {
  for (let i = 0; i < n; i++) {
    const site = sites[i % sites.length];
    const x = Math.round(site[0]), y = Math.round(site[1]);
    const idx = y * W_SND + x;
    if (idx >= 0 && idx < N_SND) {
      height[idx]++;
      if (height[idx] >= 4 && !inQ[idx]) {
        topQ[qTail++] = idx;
        inQ[idx] = 1;
      }
    }
  }
  toppleAll();
}

// Drain a circular region — partial reset at chapter transitions
function drainCircle(cx: number, cy: number, r: number) {
  const r2 = r * r;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(W_SND - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(H_SND - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx*dx + dy*dy <= r2) {
        const idx = y * W_SND + x;
        height[idx] = 0;
        flashBuf[idx] = 0;
        inQ[idx] = 0;
      }
    }
  }
  qHead = qTail = 0;
}

// ── Section / heading data ─────────────────────────────────────────────────────
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

const CH_NAMES = ["FORMATION","AVALANCHE","FRACTAL","BOUNDARY"];
const CH_NAMES_PT = ["FORMAÇÃO","AVALANCHE","FRACTAL","FRONTEIRA"];

const HEADINGS: [string,string][] = [
  ["GRAIN",         "the indivisible unit"],
  ["STABILITY",     "three below the limit"],
  ["TOPPLE",        "the fourth grain changes everything"],
  ["AVALANCHE",     "cascades without memory"],
  ["SELF-ORGANIZED","criticality without tuning"],
  ["FRACTAL",       "the boundary of the pile"],
  ["SCALE-FREE",    "the same at every magnification"],
  ["DOMAIN",        "two piles that cannot merge"],
  ["COLLISION",     "where two frontiers met and stopped"],
  ["BOUNDARY",      "the last cell to be claimed"],
  ["DETERMINISTIC", "no randomness was ever needed"],
  ["THE SHAPE",     "from one rule, one billion times"],
];

const HEADINGS_PT: [string,string][] = [
  ["GRÃO",              "a unidade indivisível"],
  ["ESTABILIDADE",      "três abaixo do limite"],
  ["TOMBAR",            "o quarto grão muda tudo"],
  ["AVALANCHE",         "cascatas sem memória"],
  ["AUTO-ORGANIZADA",   "criticidade sem ajuste"],
  ["FRACTAL",           "a fronteira da pilha"],
  ["LIVRE DE ESCALA",   "o mesmo em toda magnificação"],
  ["DOMÍNIO",           "duas pilhas que não podem se fundir"],
  ["COLISÃO",           "onde duas fronteiras se encontraram e pararam"],
  ["FRONTEIRA",         "a última célula a ser conquistada"],
  ["DETERMINÍSTICO",    "nenhuma aleatoriedade foi necessária"],
  ["A FORMA",           "de uma regra, um bilhão de vezes"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    height.fill(0);
    flashBuf.fill(0);
    qHead = qTail = 0;
    totalTopplings = 0;
    frameTopplings = 0;
    cachedFilled = 0;
    filledFrame = -999;
    activeWaves.length = 0;
    let lastChapter = -1;
    let frameCount = 0;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let sandCanvas: HTMLCanvasElement, sandCtx: CanvasRenderingContext2D, sandImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        sandCanvas = document.createElement("canvas");
        sandCanvas.width = W_SND; sandCanvas.height = H_SND;
        sandCtx = sandCanvas.getContext("2d") as CanvasRenderingContext2D;
        sandImg = sandCtx.createImageData(W_SND, H_SND);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        frameCount++;
        frameTopplings = 0;  // reset here, not inside toppleAll

        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        // Chapter transition: drain around old drop sites + spawn shockwave ring
        if (chIdx !== lastChapter) {
          const prevSites = DROP_SITES[Math.max(0, lastChapter)];
          for (const [dx, dy] of prevSites) drainCircle(dx, dy, 38);
          // Shockwave from each new drop site
          for (const [sx, sy] of DROP_SITES[chIdx]) {
            activeWaves.push({ cx: sx, cy: sy, r: 0, alpha: 1.0 });
          }
          lastChapter = chIdx;
        }

        const grainRate = Math.round(lerp(65, 14, sp));
        dropGrains(DROP_SITES[chIdx], grainRate);

        // Spawn shockwave on heavy avalanche frames
        if (frameTopplings > 800) {
          const site = DROP_SITES[chIdx][0];
          activeWaves.push({ cx: site[0], cy: site[1], r: 0, alpha: 0.6 });
        }

        // Decay flash
        for (let i = 0; i < N_SND; i++) {
          if (flashBuf[i] > 0) flashBuf[i]--;
        }

        // Amortized filledCells — recompute every 40 frames
        if (frameCount - filledFrame >= 40) {
          cachedFilled = 0;
          for (let i = 0; i < N_SND; i++) if (height[i] > 0) cachedFilled++;
          filledFrame = frameCount;
        }

        // Interpolate chapter palette colors
        const pal0 = GRAIN_PALS[chIdx], pal1 = GRAIN_PALS[next];
        const fl0  = FLASH_COLORS[chIdx], fl1 = FLASH_COLORS[next];
        const hc: [number,number,number][] = [];
        for (let h = 0; h < 4; h++) {
          hc.push([
            Math.round(lerp(pal0[h][0], pal1[h][0], blend)),
            Math.round(lerp(pal0[h][1], pal1[h][1], blend)),
            Math.round(lerp(pal0[h][2], pal1[h][2], blend)),
          ]);
        }
        const fcR = Math.round(lerp(fl0[0], fl1[0], blend));
        const fcG = Math.round(lerp(fl0[1], fl1[1], blend));
        const fcB = Math.round(lerp(fl0[2], fl1[2], blend));

        // Render sandpile to pixel buffer
        const sd = sandImg.data;
        for (let idx = 0; idx < N_SND; idx++) {
          const h4 = Math.min(3, height[idx]);
          const fl = flashBuf[idx] / 4;
          const fl2 = fl * fl;
          const pi = idx * 4;
          sd[pi  ] = Math.round(lerp(hc[h4][0], fcR, fl2));
          sd[pi+1] = Math.round(lerp(hc[h4][1], fcG, fl2));
          sd[pi+2] = Math.round(lerp(hc[h4][2], fcB, fl2));
          sd[pi+3] = 255;
        }
        sandCtx.putImageData(sandImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(sandCanvas, 0, 0, W, H);

        // Shockwave rings (expanding in simulation space, drawn in screen space)
        const sx2 = W / W_SND, sy2 = H / H_SND;
        const [fcRw, fcGw, fcBw] = FLASH_COLORS[chIdx];
        for (let wi = activeWaves.length - 1; wi >= 0; wi--) {
          const wv = activeWaves[wi];
          wv.r += 2.8;
          wv.alpha *= 0.93;
          if (wv.alpha < 0.01) { activeWaves.splice(wi, 1); continue; }
          dc.beginPath();
          dc.arc(wv.cx * sx2, wv.cy * sy2, wv.r * ((sx2 + sy2) * 0.5), 0, Math.PI * 2);
          dc.strokeStyle = `rgba(${fcRw},${fcGw},${fcBw},${(wv.alpha * 0.45).toFixed(3)})`;
          dc.lineWidth = lerp(2.5, 0.5, Math.min(1, wv.r / 60));
          dc.stroke();
        }

        // Active drop site markers
        const siteA = ss(0.02, 0.12, sp) * (1 - ss(0.80, 0.92, sp));
        if (siteA > 0.01) {
          p.noFill();
          p.stroke(fcRw, fcGw, fcBw, Math.round(siteA * 80));
          p.strokeWeight(0.8);
          for (const [dx, dy] of DROP_SITES[chIdx]) {
            p.ellipse(dx*sx2, dy*sy2, 10, 10);
            p.line(dx*sx2 - 7, dy*sy2, dx*sx2 + 7, dy*sy2);
            p.line(dx*sx2, dy*sy2 - 7, dx*sx2, dy*sy2 + 7);
          }
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(fcRw, fcGw, fcBw, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`GRAINS ${totalTopplings.toLocaleString()}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · BTW SANDPILE`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${Math.round(cachedFilled/N_SND*100)}% filled · ${frameTopplings}/frame`, W*0.982, H*0.982);
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

// ── Component ──────────────────────────────────────────────────────────────────
export function SandLab() {
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

  const activeChNames = locale === "pt" ? CH_NAMES_PT : CH_NAMES;
  const activeHeadings = locale === "pt" ? HEADINGS_PT : HEADINGS;

  const chips = ["#385878","#786228","#582870","#525252"];
  const texts = ["#82a5d2","#e4af5f","#d27fec","#d8d5de"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#080808"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS.map((sec, i) => {
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
