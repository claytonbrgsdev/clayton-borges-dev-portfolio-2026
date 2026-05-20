"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Molecular dynamics constants ───────────────────────────────────────────────
const N_PART_G = 250;
const R_G      = 0.018;   // particle radius in [0,1] box
const DT_G     = 0.005;
const STEPS_G  = 4;

// Target temperature per chapter [low, high]
const T_RANGES_G: [number,number][] = [
  [0.0015, 0.007],  // ch1 solid
  [0.007,  0.028],  // ch2 melting
  [0.028,  0.090],  // ch3 liquid
  [0.090,  0.28],   // ch4 gas
];

function tFromSp(sp: number): number {
  const chF = sp * 4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
  const [t0, t1] = T_RANGES_G[chIdx];
  return lerp(t0, t1, ss(0, 1, chT));
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

// Module-level particle state
const partX_G  = new Float32Array(N_PART_G);
const partY_G  = new Float32Array(N_PART_G);
const partVX_G = new Float32Array(N_PART_G);
const partVY_G = new Float32Array(N_PART_G);

function gaussRandom(): number {
  const u = 1 - Math.random(), v2 = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v2);
}

function initParticles_G(T_init: number) {
  // Hexagonal-ish grid layout
  const cols = Math.ceil(Math.sqrt(N_PART_G * 1.2));
  const rows = Math.ceil(N_PART_G / cols);
  const dx = 0.9 / cols, dy = 0.9 / rows;
  const offX = (1 - dx * cols) * 0.5, offY = (1 - dy * rows) * 0.5;
  let idx = 0;
  for (let r = 0; r < rows && idx < N_PART_G; r++) {
    for (let c = 0; c < cols && idx < N_PART_G; c++) {
      const jitter = 0.001;
      partX_G[idx] = offX + (c + 0.5 + (r % 2 === 0 ? 0 : 0.5)) * dx + (Math.random()-0.5)*jitter;
      partY_G[idx] = offY + (r + 0.5) * dy + (Math.random()-0.5)*jitter;
      const vScale = Math.sqrt(2 * T_init);
      partVX_G[idx] = gaussRandom() * vScale;
      partVY_G[idx] = gaussRandom() * vScale;
      idx++;
    }
  }
}

function stepMD(T_target: number) {
  for (let s = 0; s < STEPS_G; s++) {
    // Move
    for (let i = 0; i < N_PART_G; i++) {
      partX_G[i] = ((partX_G[i] + partVX_G[i] * DT_G) % 1 + 1) % 1;
      partY_G[i] = ((partY_G[i] + partVY_G[i] * DT_G) % 1 + 1) % 1;
    }

    // Elastic collisions — O(N²) pair check
    for (let i = 0; i < N_PART_G - 1; i++) {
      for (let j = i + 1; j < N_PART_G; j++) {
        let dx = partX_G[j] - partX_G[i];
        let dy = partY_G[j] - partY_G[i];
        // Minimum image convention for periodic boundary
        if (dx >  0.5) dx -= 1; else if (dx < -0.5) dx += 1;
        if (dy >  0.5) dy -= 1; else if (dy < -0.5) dy += 1;
        const dist2 = dx*dx + dy*dy;
        const diam = 2 * R_G;
        if (dist2 < diam * diam && dist2 > 1e-12) {
          const dist = Math.sqrt(dist2);
          const nx = dx / dist, ny = dy / dist;
          // Separate
          const overlap = diam - dist;
          partX_G[i] -= nx * overlap * 0.5; partY_G[i] -= ny * overlap * 0.5;
          partX_G[j] += nx * overlap * 0.5; partY_G[j] += ny * overlap * 0.5;
          // Exchange normal velocity components
          const dvn = (partVX_G[i] - partVX_G[j]) * nx + (partVY_G[i] - partVY_G[j]) * ny;
          if (dvn < 0) {  // approaching
            partVX_G[i] -= dvn * nx; partVY_G[i] -= dvn * ny;
            partVX_G[j] += dvn * nx; partVY_G[j] += dvn * ny;
          }
        }
      }
    }
  }

  // Velocity rescaling thermostat
  let sumV2 = 0;
  for (let i = 0; i < N_PART_G; i++) sumV2 += partVX_G[i]*partVX_G[i] + partVY_G[i]*partVY_G[i];
  const T_cur = sumV2 / (2 * N_PART_G);
  const scale = Math.sqrt(T_target / Math.max(1e-10, T_cur));
  for (let i = 0; i < N_PART_G; i++) { partVX_G[i] *= scale; partVY_G[i] *= scale; }
}

// Hue base per chapter — slow=cool, fast=warm, but each chapter has an offset
const CH_HUE_G = [0.58, 0.45, 0.25, 0.05];  // shifts blue→green→orange→red
const CH_NAMES_G = ["SOLID","MELTING","LIQUID","GAS"];

const SECTIONS_G = [
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

const HEADINGS_G: [string,string][] = [
  ["LATTICE",    "particles ordered at rest"],
  ["HARMONY",    "thermal motion within a crystal"],
  ["SOLID",      "rigid — structure resists shear"],
  ["MELTING",    "the lattice loses its grip"],
  ["TRANSITION", "solid and liquid coexist"],
  ["FLOW",       "no long-range order — short-range persists"],
  ["MAXWELL",    "v distributed as v·exp(−mv²/2kT)"],
  ["BOLTZMANN",  "order emerges from randomness"],
  ["GAS",        "free particles — mean free path grows"],
  ["PRESSURE",   "force per unit area — PV = NkT"],
  ["CHAOS",      "deterministic — yet unpredictable"],
  ["THE BOX",    "N particles — one periodic boundary"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    initParticles_G(T_RANGES_G[0][0]);

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        // Pre-equilibrate at initial T
        const t0 = T_RANGES_G[0][0];
        for (let e = 0; e < 40; e++) stepMD(t0);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF));
        const T = tFromSp(sp);

        stepMD(T);

        const dc = p.drawingContext as CanvasRenderingContext2D;

        // Persistence clear — partial alpha for motion trail (tinted with chapter warmth)
        const warmF = Math.min(1, T / 0.09);
        const bgR2 = Math.round(lerp(2, 12, warmF)), bgG2 = 2, bgB2 = Math.round(lerp(8, 2, warmF));
        dc.fillStyle = `rgba(${bgR2},${bgG2},${bgB2},0.42)`;
        dc.fillRect(0, 0, W, H);

        // Bond lines between nearby pairs — crystal lattice visible at low T
        const BOND2 = (R_G * 2.6) * (R_G * 2.6);
        const bondAlpha = Math.max(0, 1 - T / 0.065);
        if (bondAlpha > 0.01) {
          const [br,bg3,bb] = hsvToRgb255(CH_HUE_G[chIdx], 0.5, 0.55);
          dc.strokeStyle = `rgba(${br},${bg3},${bb},${(bondAlpha * 0.40).toFixed(2)})`;
          dc.lineWidth = 0.5;
          dc.beginPath();
          for (let i = 0; i < N_PART_G - 1; i++) {
            for (let j = i + 1; j < N_PART_G; j++) {
              let ddx = partX_G[j] - partX_G[i];
              let ddy = partY_G[j] - partY_G[i];
              if (ddx >  0.5) ddx -= 1; else if (ddx < -0.5) ddx += 1;
              if (ddy >  0.5) ddy -= 1; else if (ddy < -0.5) ddy += 1;
              if (ddx*ddx + ddy*ddy < BOND2) {
                const cx1 = partX_G[i]*W, cy1 = partY_G[i]*H;
                dc.moveTo(cx1, cy1);
                dc.lineTo(cx1 + ddx*W, cy1 + ddy*H);
              }
            }
          }
          dc.stroke();
        }

        // Compute max speed for color normalization
        let maxSpd = 0.01;
        for (let i = 0; i < N_PART_G; i++) {
          const spd = Math.sqrt(partVX_G[i]*partVX_G[i] + partVY_G[i]*partVY_G[i]);
          if (spd > maxSpd) maxSpd = spd;
        }

        const hueBase = CH_HUE_G[chIdx];
        const r_screen = R_G * W;

        // Draw in 6 speed bins — one beginPath+fill() per bin
        for (let bin = 0; bin < 6; bin++) {
          const sLo = bin / 6, sHi = (bin+1) / 6;
          const sMid = (sLo + sHi) * 0.5;
          const hue = ((hueBase + sMid * 0.32) % 1.0 + 1.0) % 1.0;
          const [r2,g2,b2] = hsvToRgb255(hue, 0.82, 0.80 + sMid * 0.18);
          dc.fillStyle = `rgb(${r2},${g2},${b2})`;
          dc.beginPath();
          for (let i = 0; i < N_PART_G; i++) {
            const spd = Math.sqrt(partVX_G[i]*partVX_G[i] + partVY_G[i]*partVY_G[i]);
            const sf = spd / maxSpd;
            if (sf >= sLo && sf < sHi) {
              dc.moveTo(partX_G[i]*W + r_screen, partY_G[i]*H);
              dc.arc(partX_G[i]*W, partY_G[i]*H, r_screen, 0, Math.PI*2);
            }
          }
          dc.fill();
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const [hr,hg,hb] = hsvToRgb255((hueBase + 0.5) % 1, 0.6, 0.85);
          p.noStroke();
          p.fill(hr, hg, hb, Math.round(hudA * 45));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`T = ${T.toFixed(5)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ${CH_NAMES_G[chIdx]}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`N=${N_PART_G} r=${R_G}`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_G[i];
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
export function GasLab() {
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

  const chips = ["#060810","#060810","#080608","#0e0602"];
  const texts = ["#4090e8","#40d0b0","#80e040","#f08020"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#020208"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_G.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_G[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_G[chIdx]}`}</span>
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
