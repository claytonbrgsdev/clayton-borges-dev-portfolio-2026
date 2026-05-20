"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Cellular automaton constants ───────────────────────────────────────────────
const W_CA = 280, H_CA = 186, N_CA = W_CA * H_CA;
const RULES = [30, 90, 110, 184];

// Module-level state
const stateGrid = new Uint8Array(N_CA);  // ring buffer of rows
const curRow    = new Uint8Array(W_CA);
const nxtRow    = new Uint8Array(W_CA);
let   rowHead   = 0;  // oldest row index (next to be overwritten)
let   ruleTable = new Uint8Array(8);

function buildRuleTable(rule: number) {
  for (let i = 0; i < 8; i++) ruleTable[i] = (rule >> i) & 1;
}

function initCA(chIdx: number) {
  buildRuleTable(RULES[chIdx]);
  curRow.fill(0);
  if (chIdx < 3) {
    // Single cell at center
    curRow[W_CA >> 1] = 1;
  } else {
    // Rule 184 traffic: random at 0.42 density
    for (let x = 0; x < W_CA; x++) curRow[x] = Math.random() < 0.42 ? 1 : 0;
  }
  stateGrid.fill(0);
  rowHead = 0;
  stateGrid.set(curRow, 0);
  rowHead = 1;
}

function stepCA() {
  for (let x = 0; x < W_CA; x++) {
    const l = x > 0        ? curRow[x-1] : curRow[W_CA-1];
    const c = curRow[x];
    const r = x < W_CA-1   ? curRow[x+1] : curRow[0];
    nxtRow[x] = ruleTable[(l<<2)|(c<<1)|r];
  }
  curRow.set(nxtRow);
  // Write to ring buffer
  stateGrid.set(curRow, rowHead * W_CA);
  rowHead = (rowHead + 1) % H_CA;
}

// Per-chapter [state0_r,state0_g,state0_b, state1_r,state1_g,state1_b]
const CH_PALS_CA: [number,number,number,number,number,number][] = [
  [ 3,  4, 10,  228, 155,  65],  // ch1 Rule 30:  dark navy + warm amber
  [ 3,  4,  3,   60, 110, 255],  // ch2 Rule 90:  dark green + electric blue
  [ 5,  5,  6,  235, 232, 245],  // ch3 Rule 110: near-black + near-white
  [ 3,  7,  3,   55, 210,  90],  // ch4 Rule 184: dark + bright green
];

const CH_NAMES_CA = ["CHAOS","SIERPINSKI","UNIVERSAL","TRAFFIC"];

const SECTIONS_CA = [
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

const HEADINGS_CA: [string,string][] = [
  ["RULE 30",       "three cells generate infinite randomness"],
  ["ASYMMETRIC",    "symmetry broken by the rule itself"],
  ["UNPREDICTABLE", "the past cannot tell us the future"],
  ["RULE 90",       "XOR — each cell differs from its neighbors"],
  ["SIERPINSKI",    "the triangle that never ends"],
  ["SELF-SIMILAR",  "the same at every scale"],
  ["RULE 110",      "capable of universal computation"],
  ["COMPLEX",       "simple rule — unpredictable behaviour"],
  ["TURING",        "it can compute anything computable"],
  ["RULE 184",      "cars on an infinite road"],
  ["FLOW",          "particles that cannot pass through each other"],
  ["JAM",           "density determines whether traffic moves"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
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
        offscreen.width = W_CA; offscreen.height = H_CA;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_CA, H_CA);
        initCA(0);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        if (chIdx !== lastChapter) {
          initCA(chIdx);
          lastChapter = chIdx;
        }

        // Advance automaton — more steps later in scroll for dramatic evolution
        const stepsPerFrame = Math.round(lerp(3, 20, ss(0.05, 0.80, chT)));
        for (let s = 0; s < stepsPerFrame; s++) stepCA();

        // Blend palettes
        const p0 = CH_PALS_CA[chIdx], p1 = CH_PALS_CA[next];
        const bg0R = Math.round(lerp(p0[0],p1[0],blend)), bg0G = Math.round(lerp(p0[1],p1[1],blend));
        const bg0B = Math.round(lerp(p0[2],p1[2],blend));
        const fg1R = Math.round(lerp(p0[3],p1[3],blend)), fg1G = Math.round(lerp(p0[4],p1[4],blend));
        const fg1B = Math.round(lerp(p0[5],p1[5],blend));

        // Render ring buffer to pixel buffer
        // Row 0 on screen = oldest row = rowHead; row H_CA-1 = newest = (rowHead-1+H_CA)%H_CA
        const sd = offImg.data;
        for (let screenRow = 0; screenRow < H_CA; screenRow++) {
          const gridRow = (rowHead + screenRow) % H_CA;
          const gridBase = gridRow * W_CA;
          const pixBase  = screenRow * W_CA * 4;
          for (let col = 0; col < W_CA; col++) {
            const cell = stateGrid[gridBase + col];
            const pi = pixBase + col * 4;
            if (cell === 0) {
              sd[pi] = bg0R; sd[pi+1] = bg0G; sd[pi+2] = bg0B;
            } else {
              sd[pi] = fg1R; sd[pi+1] = fg1G; sd[pi+2] = fg1B;
            }
            sd[pi+3] = 255;
          }
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Scan line indicator (shows current time front — bottom of newest rows)
        const scanA = ss(0.05, 0.20, sp) * (1 - ss(0.85, 0.95, sp));
        if (scanA > 0.01) {
          // The "present" is at the bottom of the screen (most recent row)
          dc.strokeStyle = `rgba(${fg1R},${fg1G},${fg1B},${(scanA * 0.5).toFixed(2)})`;
          dc.lineWidth = 0.8;
          dc.setLineDash([4, 4]);
          dc.beginPath();
          dc.moveTo(0, H * 0.97); dc.lineTo(W, H * 0.97);
          dc.stroke();
          dc.setLineDash([]);
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(fg1R, fg1G, fg1B, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`RULE ${RULES[chIdx]}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ELEMENTARY CA`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`W=${W_CA} · ${stepsPerFrame}/frame`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_CA[i];
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
export function CellularAutomatonLab() {
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

  const chips = ["#1e1808","#081820","#101010","#081808"];
  const texts = ["#d09040","#4080d8","#d0d0e0","#40d060"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#050505"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_CA.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_CA[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_CA[chIdx]}`}</span>
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
