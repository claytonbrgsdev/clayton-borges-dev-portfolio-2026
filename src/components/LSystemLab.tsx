"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── L-system definitions ───────────────────────────────────────────────────────
interface LSystem { axiom: string; rules: Record<string,string>; angle: number; depth: number; initAngle: number; }

const L_SYSTEMS: LSystem[] = [
  { axiom: "F--F--F",  rules: { F: "F+F--F+F" }, angle: 60, depth: 4, initAngle: 0 },
  { axiom: "FX",       rules: { X: "X+YF+", Y: "-FX-Y" }, angle: 90, depth: 12, initAngle: 0 },
  { axiom: "A",        rules: { A: "+BF-AFA-FB+", B: "-AF+BFB+FA-" }, angle: 90, depth: 5, initAngle: 0 },
  { axiom: "X",        rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" }, angle: 25, depth: 6, initAngle: -Math.PI * 0.5 },
];

function expand(axiom: string, rules: Record<string,string>, n: number): string {
  let s = axiom;
  for (let i = 0; i < n; i++) {
    const parts: string[] = [];
    for (let j = 0; j < s.length; j++) parts.push(rules[s[j]] ?? s[j]);
    s = parts.join("");
    if (s.length > 900_000) break;
  }
  return s;
}

interface LData {
  segs: Float32Array;  // [x0,y0,x1,y1, ...]
  nSegs: number;
  xMin: number; xMax: number; yMin: number; yMax: number;
}

function interpret(s: string, angleDeg: number, initAngle: number): LData {
  const da = angleDeg * Math.PI / 180;
  const x0s: number[] = [], y0s: number[] = [], x1s: number[] = [], y1s: number[] = [];
  let x = 0, y = 0, θ = initAngle;
  const stack: [number,number,number][] = [];

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === 'F' || c === 'G') {
      const nx = x + Math.cos(θ), ny = y + Math.sin(θ);
      x0s.push(x); y0s.push(y); x1s.push(nx); y1s.push(ny);
      x = nx; y = ny;
    } else if (c === '+') θ += da;
    else if (c === '-') θ -= da;
    else if (c === '[') stack.push([x, y, θ]);
    else if (c === ']') { const sv = stack.pop(); if (sv) { x=sv[0]; y=sv[1]; θ=sv[2]; } }
  }

  const n = x0s.length;
  const segs = new Float32Array(n * 4);
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (let i = 0; i < n; i++) {
    segs[i*4]   = x0s[i]; segs[i*4+1] = y0s[i];
    segs[i*4+2] = x1s[i]; segs[i*4+3] = y1s[i];
    if (x0s[i] < xMin) xMin=x0s[i]; if (x1s[i] < xMin) xMin=x1s[i];
    if (x0s[i] > xMax) xMax=x0s[i]; if (x1s[i] > xMax) xMax=x1s[i];
    if (y0s[i] < yMin) yMin=y0s[i]; if (y1s[i] < yMin) yMin=y1s[i];
    if (y0s[i] > yMax) yMax=y0s[i]; if (y1s[i] > yMax) yMax=y1s[i];
  }
  return { segs, nSegs: n, xMin, xMax, yMin, yMax };
}

let lastChL = -1;
let currentData: LData | null = null;

const CH_GRADIENTS: [[string,string],[string,string]][] = [
  [["rgba(40,140,255,0.9)","rgba(20,60,180,0.35)"],   ["rgba(120,220,255,0.7)","rgba(20,80,160,0.2)"]],
  [["rgba(40,230,120,0.9)","rgba(20,100,50,0.35)"],    ["rgba(140,255,160,0.7)","rgba(20,100,40,0.2)"]],
  [["rgba(160,60,255,0.9)","rgba(60,10,140,0.35)"],    ["rgba(200,120,255,0.7)","rgba(60,10,130,0.2)"]],
  [["rgba(60,200,60,0.9)","rgba(20,80,10,0.35)"],      ["rgba(160,255,80,0.7)","rgba(20,80,5,0.2)"]],
];

const CH_LINE_W = [0.55, 0.45, 0.50, 0.65];
const CH_NAMES_L = ["KOCH","DRAGON","HILBERT","PLANT"];
const CH_DARK = ["#06080e","#040e06","#08040e","#040a04"];

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
  ["AXIOM",       "the initial string, once written"],
  ["RULE",        "replace every segment with a pattern"],
  ["ITERATION",   "four copies, scaled and turned"],
  ["FOLD",        "fold a strip of paper to right angles"],
  ["UNFOLD",      "the crease pattern at infinite depth"],
  ["SELF-AVOID",  "the dragon curve never crosses itself"],
  ["HILBERT",     "a curve that fills the plane"],
  ["LOCALITY",    "nearby points remain nearby"],
  ["LIMIT",       "a one-dimensional object with area"],
  ["BRANCH",      "a grammar for growing upward"],
  ["SELF-SIMILAR","each branch is the whole plant"],
  ["INFINITE TREE","bounded height — unbounded complexity"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    lastChL = -1;
    currentData = null;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;

        if (chIdx !== lastChL) {
          const ls = L_SYSTEMS[chIdx];
          const str = expand(ls.axiom, ls.rules, ls.depth);
          currentData = interpret(str, ls.angle, ls.initAngle);
          lastChL = chIdx;
        }

        const dark = CH_DARK[chIdx];
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.fillStyle = dark;
        dc.fillRect(0, 0, W, H);

        if (!currentData) return;
        const { segs, nSegs, xMin, xMax, yMin, yMax } = currentData;

        const lsW = Math.max(0.001, xMax - xMin);
        const lsH = Math.max(0.001, yMax - yMin);
        const margin = 0.88;
        const scale = Math.min(W / lsW, H / lsH) * margin;
        const ox = (W - lsW * scale) * 0.5 - xMin * scale;
        const oy = (H - lsH * scale) * 0.5 - yMin * scale;

        // Progressive reveal — fully drawn by chT≈0.78
        const revealFrac = ss(0, 0.78, chT);
        const revealCount = Math.min(nSegs, Math.ceil(revealFrac * nSegs));

        // Gradient: horizontal for Koch/Dragon/Hilbert, vertical for Plant
        const [[c0, c1], [gc0, gc1]] = CH_GRADIENTS[chIdx];
        let grad: CanvasGradient;
        if (chIdx === 3) {
          grad = dc.createLinearGradient(0, H, 0, 0);
        } else {
          grad = dc.createLinearGradient(0, 0, W, H);
        }
        grad.addColorStop(0, c0); grad.addColorStop(1, c1);
        dc.strokeStyle = grad;
        dc.lineWidth = CH_LINE_W[chIdx];
        dc.lineCap = "round";

        // Main path
        dc.beginPath();
        for (let i = 0; i < revealCount; i++) {
          dc.moveTo(ox + segs[i*4] * scale, oy + segs[i*4+1] * scale);
          dc.lineTo(ox + segs[i*4+2] * scale, oy + segs[i*4+3] * scale);
        }
        dc.stroke();

        // Pulsing drawing-tip cursor on the newest revealed segments
        if (revealFrac < 0.99 && revealCount > 0) {
          const tipLen = Math.max(1, Math.min(40, Math.floor(nSegs * 0.008)));
          const tipStart = Math.max(0, revealCount - tipLen);
          const tp = 0.55 + 0.45 * Math.sin(p.frameCount * 0.18);
          dc.strokeStyle = `rgba(255,255,255,${tp.toFixed(2)})`;
          dc.lineWidth = CH_LINE_W[chIdx] * 2.2;
          dc.beginPath();
          for (let i = tipStart; i < revealCount; i++) {
            dc.moveTo(ox + segs[i*4] * scale, oy + segs[i*4+1] * scale);
            dc.lineTo(ox + segs[i*4+2] * scale, oy + segs[i*4+3] * scale);
          }
          dc.stroke();
        }

        // Faint "ghost" overlay of the full structure once 80% revealed
        const ghostA = ss(0.80, 1.0, revealFrac) * 0.18;
        if (ghostA > 0.01 && revealCount < nSegs) {
          let grad2: CanvasGradient;
          if (chIdx === 3) {
            grad2 = dc.createLinearGradient(0, H, 0, 0);
          } else {
            grad2 = dc.createLinearGradient(0, 0, W, H);
          }
          grad2.addColorStop(0, gc0); grad2.addColorStop(1, gc1);
          dc.strokeStyle = grad2;
          dc.lineWidth = CH_LINE_W[chIdx] * 0.5;
          dc.globalAlpha = ghostA;
          dc.beginPath();
          for (let i = revealCount; i < nSegs; i++) {
            dc.moveTo(ox + segs[i*4] * scale, oy + segs[i*4+1] * scale);
            dc.lineTo(ox + segs[i*4+2] * scale, oy + segs[i*4+3] * scale);
          }
          dc.stroke();
          dc.globalAlpha = 1;
        }

        // Edge vignette
        const vig = dc.createRadialGradient(W*0.5, H*0.5, Math.min(W,H)*0.30, W*0.5, H*0.5, Math.min(W,H)*0.72);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.42)");
        dc.fillStyle = vig;
        dc.fillRect(0, 0, W, H);

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const ls = L_SYSTEMS[chIdx];
          p.noStroke();
          p.fill(200, 200, 220, Math.round(hudA * 45));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`depth ${ls.depth} · ${revealCount} seg`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ${CH_NAMES_L[chIdx]}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${(revealFrac*100).toFixed(0)}% drawn`, W*0.982, H*0.982);
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
export function LSystemLab() {
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

  const chips = ["#060810","#040e08","#08040e","#040a04"];
  const texts = ["#40a0e8","#40e880","#9040e8","#60d040"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#02020a"}}>
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
