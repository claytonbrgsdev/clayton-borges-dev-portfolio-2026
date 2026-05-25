"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── WireWorld constants ────────────────────────────────────────────────────────
const GW = 100, GH = 66, GN = GW * GH;
// States: 0=empty, 1=electron head, 2=electron tail, 3=wire
let gridWW      = new Uint8Array(GN);
let gridWW_next = new Uint8Array(GN);
const pixBuf_WW = new Uint8Array(GN * 4);
let lastChWW    = -1;
let stepCount   = 0;

const CX = GW * 0.5, CY = GH * 0.5;

function wire(x: number, y: number) {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi >= 0 && xi < GW && yi >= 0 && yi < GH && gridWW[yi*GW+xi] === 0)
    gridWW[yi*GW+xi] = 3;
}

function head(x: number, y: number) {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi >= 0 && xi < GW && yi >= 0 && yi < GH) gridWW[yi*GW+xi] = 1;
}

function tail(x: number, y: number) {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi >= 0 && xi < GW && yi >= 0 && yi < GH) gridWW[yi*GW+xi] = 2;
}

// ch1 — concentric rings
function initCircles() {
  gridWW.fill(0);
  for (const r of [9, 14, 20, 27]) {
    const steps = Math.ceil(2 * Math.PI * r * 1.3);
    for (let k = 0; k < steps; k++) {
      const θ = k / steps * 2 * Math.PI;
      wire(CX + r * Math.cos(θ), CY + r * Math.sin(θ));
    }
    // Two electrons: one at 0, one at π (opposite side of ring)
    const stepAngle = 2 * Math.PI / steps;
    for (const θ0 of [0, Math.PI]) {
      head(CX + r * Math.cos(θ0), CY + r * Math.sin(θ0));
      tail(CX + r * Math.cos(θ0 - stepAngle), CY + r * Math.sin(θ0 - stepAngle));
    }
  }
}

// ch2 — Lissajous 2:3
function initLissajous() {
  gridWW.fill(0);
  const A = GW * 0.39, B = GH * 0.39;
  const steps = 1800;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps * 2 * Math.PI;
    wire(CX + A * Math.cos(2*t), CY + B * Math.sin(3*t));
  }
  const t0 = 0, tprev = (steps-1) / steps * 2 * Math.PI;
  head(CX + A * Math.cos(2*t0), CY + B * Math.sin(3*t0));
  tail(CX + A * Math.cos(2*tprev), CY + B * Math.sin(3*tprev));
  // Second electron offset by 1/3 period
  const t1 = 2 * Math.PI / 3, tp1 = t1 - 2*Math.PI/1800;
  head(CX + A * Math.cos(2*t1), CY + B * Math.sin(3*t1));
  tail(CX + A * Math.cos(2*tp1), CY + B * Math.sin(3*tp1));
}

// ch3 — 8-petal rose r = a·cos(4θ)
function initRose() {
  gridWW.fill(0);
  const a = Math.min(GW, GH) * 0.44;
  const steps = 3000;
  for (let k = 0; k <= steps; k++) {
    const θ = k / steps * 2 * Math.PI;
    const r = a * Math.cos(4 * θ);
    wire(CX + r * Math.cos(θ), CY + r * Math.sin(θ));
  }
  // 4 electrons at petal tips (θ = 0, π/4, π/2, 3π/4)
  for (let p = 0; p < 4; p++) {
    const θh = p * Math.PI / 4;
    const rh = a * Math.cos(4 * θh);
    head(CX + rh * Math.cos(θh), CY + rh * Math.sin(θh));
    const θt = θh - 2 * Math.PI / steps;
    const rt = a * Math.cos(4 * θt);
    tail(CX + rt * Math.cos(θt), CY + rt * Math.sin(θt));
  }
}

// ch4 — hypocycloid (astroid-like, R=28, r=7)
function initHypocycloid() {
  gridWW.fill(0);
  const R = 28, r = 7;
  const steps = 2500;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps * 2 * Math.PI;
    const x = CX + (R-r)*Math.cos(t) + r*Math.cos((R-r)/r*t);
    const y = CY + (R-r)*Math.sin(t) - r*Math.sin((R-r)/r*t);
    wire(x, y);
  }
  const t0 = 0, tprev = (steps-1)/steps*2*Math.PI;
  head(CX + (R-r)*Math.cos(t0)      + r*Math.cos((R-r)/r*t0),
       CY + (R-r)*Math.sin(t0)      - r*Math.sin((R-r)/r*t0));
  tail(CX + (R-r)*Math.cos(tprev)   + r*Math.cos((R-r)/r*tprev),
       CY + (R-r)*Math.sin(tprev)   - r*Math.sin((R-r)/r*tprev));
}

const INIT_FNS = [initCircles, initLissajous, initRose, initHypocycloid];

// ── CA step ────────────────────────────────────────────────────────────────────
function stepWW() {
  gridWW_next.set(gridWW);
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const idx = y*GW+x, s = gridWW[idx];
      if (s === 0) continue;
      if (s === 1) { gridWW_next[idx] = 2; continue; }
      if (s === 2) { gridWW_next[idx] = 3; continue; }
      // s === 3: count adjacent heads (8-connected, periodic boundary)
      let hc = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = (y+dy+GH) % GH;
        for (let dx2 = -1; dx2 <= 1; dx2++) {
          if (dy===0 && dx2===0) continue;
          if (gridWW[ny*GW + (x+dx2+GW)%GW] === 1) hc++;
        }
      }
      gridWW_next[idx] = (hc === 1 || hc === 2) ? 1 : 3;
    }
  }
  const tmp = gridWW; gridWW = gridWW_next; gridWW_next = tmp;
  stepCount++;
}

// Per-chapter: [empty, head, tail, wire] as RGB
const CH_PALS_WW: [[number,number,number],[number,number,number],[number,number,number],[number,number,number]][] = [
  [[2,2,10], [255,255,220], [30,50,200], [100,70,30]],
  [[6,2,10], [255,220,80], [220,70,20], [90,50,100]],
  [[2,8,2],  [180,255,80], [40,200,60], [20,60,20]],
  [[8,2,10], [220,80,255], [80,20,210], [50,20,70]],
];
const CH_NAMES_WW = ["ORBITAL","LISSAJOUS","ROSE","ASTROID"];

function renderWW(chIdx: number) {
  const [bg,hd,tl,wr] = CH_PALS_WW[chIdx];
  for (let idx = 0; idx < GN; idx++) {
    const pi = idx*4, s = gridWW[idx];
    const c = s===0?bg : s===1?hd : s===2?tl : wr;
    pixBuf_WW[pi]=c[0]; pixBuf_WW[pi+1]=c[1]; pixBuf_WW[pi+2]=c[2]; pixBuf_WW[pi+3]=255;
  }
}

const SECTIONS_WW = [
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

const HEADINGS_WW: [string,string][] = [
  ["WIRE",       "three states — one rule"],
  ["ELECTRON",   "head becomes tail becomes wire"],
  ["ORBITAL",    "signal circulates in closed loops"],
  ["LISSAJOUS",  "two frequencies — one closed curve"],
  ["FREQUENCY",  "2:3 ratio — never a straight line"],
  ["SIGNAL",     "electrons chasing each other"],
  ["ROSE",       "r = cos(4θ) — eight petals"],
  ["PETAL",      "each tip emits, each base receives"],
  ["SYMMETRY",   "four-fold, eight-fold — encoded in the rule"],
  ["ASTROID",    "epicycloid — rolling circles trace the curve"],
  ["CIRCUIT",    "one formula — one shape — one signal path"],
  ["THE RULE",   "1 or 2 heads → become head — otherwise wait"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    lastChWW = -1; stepCount = 0;
    INIT_FNS[0]();

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = GW; offscreen.height = GH;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(GW, GH);
        lastChWW = 0;
        renderWW(0);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF));

        if (chIdx !== lastChWW) {
          INIT_FNS[chIdx]();
          stepCount = 0;
          lastChWW = chIdx;
        }

        // 2 CA steps per frame
        stepWW(); stepWW();
        renderWW(chIdx);

        offImg.data.set(pixBuf_WW);
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = false;
        dc.drawImage(offscreen, 0, 0, W, H);

        // Additive glow on each electron head
        const [,hd,,] = CH_PALS_WW[chIdx];
        const glowR = W / GW * 3.5;
        dc.globalCompositeOperation = "lighter";
        for (let gy = 0; gy < GH; gy++) {
          for (let gx = 0; gx < GW; gx++) {
            if (gridWW[gy*GW+gx] === 1) {
              const pcx = (gx + 0.5) / GW * W;
              const pcy = (gy + 0.5) / GH * H;
              const grd = dc.createRadialGradient(pcx, pcy, 0, pcx, pcy, glowR);
              grd.addColorStop(0, `rgba(${hd[0]},${hd[1]},${hd[2]},0.50)`);
              grd.addColorStop(1, "rgba(0,0,0,0)");
              dc.fillStyle = grd;
              dc.fillRect(pcx - glowR, pcy - glowR, glowR*2, glowR*2);
            }
          }
        }
        dc.globalCompositeOperation = "source-over";

        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const [,hd,,] = CH_PALS_WW[chIdx];
          p.noStroke();
          p.fill(hd[0], hd[1], hd[2], Math.round(hudA * 40));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`step ${stepCount}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ${CH_NAMES_WW[chIdx]}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${GW}×${GH}`, W*0.982, H*0.982);
        }

        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_WW[i];
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
export function WireWorldLab() {
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

  const chips = ["#060614","#100808","#020a02","#080210"];
  const texts = ["#5080e8","#f0a020","#60d050","#b040f0"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#02020a"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_WW.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_WW[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_WW[chIdx]}`}</span>
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
