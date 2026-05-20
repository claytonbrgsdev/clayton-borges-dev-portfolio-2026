"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Percolation constants ──────────────────────────────────────────────────────
const W_P = 200, H_P = 133, N_P = W_P * H_P;

const P_RANGES: [number,number][] = [
  [0.10, 0.45],
  [0.45, 0.593],
  [0.593, 0.68],
  [0.68, 0.88],
];

function pFromSp(sp: number): number {
  const chF = sp * 4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
  const [p0, p1] = P_RANGES[chIdx];
  return lerp(p0, p1, ss(0, 1, chT));
}

function hsvToRgb255(h: number, s: number, v: number): [number,number,number] {
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

// Module-level buffers — zero per-frame allocation
const pixBuf_P     = new Uint8Array(N_P * 4);
const randThresh_P = new Float32Array(N_P);
const labels_P     = new Int32Array(N_P);
const queue_P      = new Int32Array(N_P);
const isSpanning_P = new Uint8Array(N_P);
const topRow_P     = new Uint8Array(N_P);
const botRow_P     = new Uint8Array(N_P);
const clusterSize_P= new Int32Array(N_P);
let lastChP = -1;

const CH_HUE_P    = [0.58, 0.45, 0.55, 0.03];
const CH_NAMES_P  = ["SUBCRITICAL","CRITICAL","PERCOLATING","SUPERCRITICAL"];
const GOLDEN      = 0.6180339887498949;

function computePercolation(sp: number): { p: number; spanCount: number; nextId: number } {
  const chF = sp * 4, chIdx = Math.min(3, Math.floor(chF));

  if (chIdx !== lastChP) {
    for (let i = 0; i < N_P; i++) randThresh_P[i] = Math.random();
    lastChP = chIdx;
  }

  const p       = pFromSp(sp);
  const hueBase = CH_HUE_P[chIdx];

  // ── BFS cluster labeling ───────────────────────────────────────────────────
  labels_P.fill(-1);
  let nextId = 0;

  for (let start = 0; start < N_P; start++) {
    if (randThresh_P[start] >= p || labels_P[start] !== -1) continue;
    labels_P[start] = nextId;
    let qHead = 0, qTail = 0;
    queue_P[qTail++] = start;
    while (qHead < qTail) {
      const cur = queue_P[qHead++];
      const cy = (cur / W_P) | 0, cx = cur - cy * W_P;
      if (cy > 0)     { const nb=cur-W_P; if(randThresh_P[nb]<p&&labels_P[nb]===-1){labels_P[nb]=nextId;queue_P[qTail++]=nb;} }
      if (cy < H_P-1) { const nb=cur+W_P; if(randThresh_P[nb]<p&&labels_P[nb]===-1){labels_P[nb]=nextId;queue_P[qTail++]=nb;} }
      if (cx > 0)     { const nb=cur-1;   if(randThresh_P[nb]<p&&labels_P[nb]===-1){labels_P[nb]=nextId;queue_P[qTail++]=nb;} }
      if (cx < W_P-1) { const nb=cur+1;   if(randThresh_P[nb]<p&&labels_P[nb]===-1){labels_P[nb]=nextId;queue_P[qTail++]=nb;} }
    }
    nextId++;
  }

  // ── Cluster sizes ──────────────────────────────────────────────────────────
  for (let id = 0; id < nextId; id++) clusterSize_P[id] = 0;
  for (let i = 0; i < N_P; i++) { if (labels_P[i] >= 0) clusterSize_P[labels_P[i]]++; }

  // ── Find spanning clusters ─────────────────────────────────────────────────
  isSpanning_P.fill(0);
  topRow_P.fill(0);
  botRow_P.fill(0);
  for (let x = 0; x < W_P; x++) {
    const tl = labels_P[x];             if (tl >= 0) topRow_P[tl] = 1;
    const bl = labels_P[(H_P-1)*W_P+x]; if (bl >= 0) botRow_P[bl] = 1;
  }
  let spanCount = 0;
  for (let id = 0; id < nextId; id++) {
    if (topRow_P[id] && botRow_P[id]) { isSpanning_P[id] = 1; spanCount++; }
  }

  // ── Pixel render ───────────────────────────────────────────────────────────
  for (let i = 0; i < N_P; i++) {
    const pi = i * 4;
    const id = labels_P[i];
    if (id < 0) {
      pixBuf_P[pi]=1; pixBuf_P[pi+1]=1; pixBuf_P[pi+2]=6; pixBuf_P[pi+3]=255;
    } else if (isSpanning_P[id]) {
      // Gradient top→bottom (cyan→gold) emphasises connectivity direction
      const row = (i / W_P) | 0;
      const t   = row / (H_P - 1);
      const h   = lerp(0.55, 0.13, t);
      const [r,g,b] = hsvToRgb255(h, 0.65, 0.93);
      pixBuf_P[pi]=r; pixBuf_P[pi+1]=g; pixBuf_P[pi+2]=b; pixBuf_P[pi+3]=255;
    } else {
      const h = ((id * GOLDEN + hueBase) % 1.0 + 1.0) % 1.0;
      const v = 0.70 + 0.18 * ((id * 0.31) % 1.0);
      const [r,g,b] = hsvToRgb255(h, 0.78, v);
      pixBuf_P[pi]=r; pixBuf_P[pi+1]=g; pixBuf_P[pi+2]=b; pixBuf_P[pi+3]=255;
    }
  }

  return { p, spanCount, nextId };
}

const SECTIONS_P = [
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

const HEADINGS_P: [string,string][] = [
  ["ISOLATED",   "no path crosses the system"],
  ["CLUSTER",    "finite groups — bounded by absence"],
  ["SUBCRITICAL","all clusters remain finite"],
  ["CRITICAL",   "p_c = 0.5927 — the threshold"],
  ["SPANNING",   "a path now crosses from edge to edge"],
  ["EMERGENT",   "born from local rules, a global bridge"],
  ["BACKBONE",   "the spanning cluster has a skeleton"],
  ["DEAD ENDS",  "branches that lead nowhere"],
  ["FRACTAL",    "D ≈ 1.896 — the cluster boundary"],
  ["CONNECTED",  "almost everything touches everything"],
  ["PERCOLATING","the threshold is sharp — it is or it isn't"],
  ["THE GRID",   "occupied with probability p — that is all"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    lastChP = -1;
    pixBuf_P.fill(0);

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;
      let hudData = { p: 0, spanCount: 0, nextId: 0 };

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_P; offscreen.height = H_P;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_P, H_P);
        hudData = computePercolation(0);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF));

        hudData = computePercolation(sp);

        offImg.data.set(pixBuf_P);
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const { p: pVal, spanCount, nextId } = hudData;
          const hueOff = CH_HUE_P[chIdx];
          const [hr,hg,hb] = hsvToRgb255((hueOff + 0.5) % 1, 0.65, 0.88);

          // Log-scale cluster size histogram (8 log₂ bins: 1, 2-3, 4-7, …, 128+)
          const bins = [0,0,0,0,0,0,0,0];
          for (let id = 0; id < nextId; id++) {
            if (isSpanning_P[id]) continue;
            const b = Math.min(7, Math.max(0, Math.floor(Math.log2(clusterSize_P[id] + 1))));
            bins[b]++;
          }
          let maxBin = 1;
          for (let b = 0; b < 8; b++) if (bins[b] > maxBin) maxBin = bins[b];
          const bw = 5, bh = 22, bx = W*0.018, by = H*0.82;
          dc.save();
          dc.globalAlpha = hudA * 0.55;
          for (let b = 0; b < 8; b++) {
            const barH = (bins[b] / maxBin) * bh;
            const [br,bg2,bb] = hsvToRgb255(((hueOff + b * 0.1) % 1 + 1) % 1, 0.70, 0.82);
            dc.fillStyle = `rgb(${br},${bg2},${bb})`;
            dc.fillRect(bx + b * (bw+1), by - barH, bw, barH);
          }
          dc.restore();

          p.noStroke();
          p.fill(hr, hg, hb, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`p = ${pVal.toFixed(4)}${Math.abs(pVal-0.5927)<0.008 ? " ≈ p_c" : ""}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ${CH_NAMES_P[chIdx]}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${nextId} clusters${spanCount ? ` · SPAN` : ""}`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_P[i];
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
export function PercolationLab() {
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

  const chips = ["#080816","#041210","#181000","#180806"];
  const texts = ["#4080f0","#40c0a0","#f0c040","#f06040"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#010106"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_P.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_P[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_P[chIdx]}`}</span>
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
