"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Simulation constants ──────────────────────────────────────────────────────
const W_S  = 200, H_S = 133, N_S = W_S * H_S;
const DU   = 1.0;
const DT   = 0.020;
const STEPS_PER_FRAME = 6;

// Persistent buffers (module-level, reused across frames)
const u0 = new Float32Array(N_S);
const v0 = new Float32Array(N_S);
const u1 = new Float32Array(N_S);
const v1 = new Float32Array(N_S);

// Barkley chapter params [a, b, ε]
const CH_PARAMS: [number,number,number][] = [
  [0.75, 0.010, 0.020],   // ch1 classic rotating spiral
  [0.75, 0.040, 0.022],   // ch2 faster inhibitor, tighter arms
  [0.80, 0.060, 0.024],   // ch3 different frequency
  [0.75, 0.010, 0.058],   // ch4 slow oscillation, near-quiescent
];

// Injection positions (cx,cy) for each chapter transition
const INJECT: [number,number][] = [
  [W_S*0.72, H_S*0.28],   // ch2
  [W_S*0.28, H_S*0.72],   // ch3
  [W_S*0.72, H_S*0.72],   // ch4-a
];

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

const CH_NAMES = ["EXCITATION","ROTATION","PROPAGATION","DISSOLUTION"];
const CH_NAMES_PT = ["EXCITAÇÃO","ROTAÇÃO","PROPAGAÇÃO","DISSOLUÇÃO"];

const HEADINGS: [string,string][] = [
  ["THRESHOLD",   "the line the system must cross"],
  ["WAVEFRONT",   "the edge of what has already fired"],
  ["SPIRAL",      "rotation without a center"],
  ["ROTATION",    "the axis organizes from nothing"],
  ["REFRACTORY",  "the period during which nothing can happen"],
  ["RECOVERY",    "the slow return to readiness"],
  ["PROPAGATION", "each cell fires what it received"],
  ["COLLISION",   "two waves annihilate on meeting"],
  ["CARDIAC",     "this pattern runs in every heartbeat"],
  ["TURBULENCE",  "when spirals break and multiply"],
  ["DISSOLUTION", "the excitable medium goes quiet"],
  ["REST",        "before the next disturbance arrives"],
];

const HEADINGS_PT: [string,string][] = [
  ["LIMIAR",         "a linha que o sistema deve cruzar"],
  ["FRENTE DE ONDA", "a borda do que já disparou"],
  ["ESPIRAL",        "rotação sem centro"],
  ["ROTAÇÃO",        "o eixo se organiza do nada"],
  ["REFRATÁRIO",     "o período durante o qual nada pode acontecer"],
  ["RECUPERAÇÃO",    "o lento retorno à prontidão"],
  ["PROPAGAÇÃO",     "cada célula dispara o que recebeu"],
  ["COLISÃO",        "duas ondas se aniquilam ao se encontrar"],
  ["CARDÍACO",       "esse padrão corre em cada batimento"],
  ["TURBULÊNCIA",    "quando espirais quebram e se multiplicam"],
  ["DISSOLUÇÃO",     "o meio excitável fica quieto"],
  ["REPOUSO",        "antes da próxima perturbação chegar"],
];

// [bg_r,bg_g,bg_b,  ex_r,ex_g,ex_b]
const PALETTES: [number,number,number,number,number,number][] = [
  [12,  3,  5,  255, 226, 155],  // deep blood-red → incandescent amber-white
  [ 3,  8, 18,   55, 218, 255],  // deep cobalt → electric cyan
  [ 8,  3, 14,  255, 162, 128],  // deep violet → warm coral
  [ 4,  4,  9,  185, 202, 240],  // near-black → cold pale blue
];

// ── Barkley model helpers ─────────────────────────────────────────────────────
function initWave() {
  u0.fill(0); v0.fill(0);
  // Primary broken wavefront: left half → nucleates spiral in upper-left
  const hx = Math.floor(W_S * 0.48);
  const hy = Math.floor(H_S * 0.48);
  for (let j = 0; j < H_S; j++) {
    for (let i = 0; i < hx; i++) {
      const idx = j * W_S + i;
      u0[idx] = j < hy ? 1.0 : 0.0;
      v0[idx] = j < hy ? 0.0 : 0.5;
    }
  }
  // Secondary broken wavefront: right-centre → nucleates second spiral from the start
  const rx0 = Math.floor(W_S * 0.60), rx1 = Math.floor(W_S * 0.88);
  const ry  = Math.floor(H_S * 0.45);
  for (let j = 0; j < H_S; j++) {
    for (let i = rx0; i < rx1; i++) {
      const idx = j * W_S + i;
      u0[idx] = j < ry ? 1.0 : 0.0;
      v0[idx] = j < ry ? 0.0 : 0.5;
    }
  }
}

function injectSpiral(cx: number, cy: number) {
  const r = 22;
  const x0 = Math.max(1, Math.floor(cx-r)), x1 = Math.min(W_S-2, Math.ceil(cx+r));
  const y0 = Math.max(1, Math.floor(cy-r)), y1 = Math.min(H_S-2, Math.ceil(cy+r));
  for (let j = y0; j <= y1; j++) {
    for (let i = x0; i <= x1; i++) {
      const dx = i-cx, dy = j-cy;
      if (dx*dx+dy*dy > r*r) continue;
      const idx = j*W_S+i;
      if      (dx < 0 && dy < 0) { u0[idx] = 1.0; v0[idx] = 0.0; }
      else if (dx >= 0 && dy < 0){ u0[idx] = 0.5; v0[idx] = 0.0; }
      else                        { u0[idx] = 0.0; v0[idx] = 0.5; }
    }
  }
}

function stepBarkley(a: number, b: number, eps: number) {
  for (let j = 0; j < H_S; j++) {
    const jm = j > 0       ? j-1 : 0;
    const jp = j < H_S-1   ? j+1 : H_S-1;
    const jW = j*W_S, jmW = jm*W_S, jpW = jp*W_S;
    for (let i = 0; i < W_S; i++) {
      const idx = jW + i;
      const im  = i > 0     ? i-1 : 0;
      const ip  = i < W_S-1 ? i+1 : W_S-1;
      const u = u0[idx], v = v0[idx];
      const thr = (v + b) / a;
      const f   = u * (1-u) * (u - thr);
      const lap = u0[jW+im] + u0[jW+ip] + u0[jmW+i] + u0[jpW+i] - 4*u;
      u1[idx] = Math.max(0, Math.min(1, u + DT*((1/eps)*f + DU*lap)));
      v1[idx] = Math.max(0, Math.min(1, v + DT*(u - v)));
    }
  }
  u0.set(u1);
  v0.set(v1);
}

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    initWave();
    let lastChapter = -1;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let simCanvas: HTMLCanvasElement, simCtx: CanvasRenderingContext2D, simImg: ImageData;
      let ppCanvas:  HTMLCanvasElement, ppCtx:  CanvasRenderingContext2D, ppImg:  ImageData;
      const PP = 64;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);

        simCanvas = document.createElement("canvas");
        simCanvas.width = W_S; simCanvas.height = H_S;
        simCtx = simCanvas.getContext("2d") as CanvasRenderingContext2D;
        simImg = simCtx.createImageData(W_S, H_S);

        ppCanvas = document.createElement("canvas");
        ppCanvas.width = PP; ppCanvas.height = PP;
        ppCtx = ppCanvas.getContext("2d") as CanvasRenderingContext2D;
        ppImg = ppCtx.createImageData(PP, PP);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.70, 1.0, chT);

        // Inject spirals at chapter transitions
        if (chIdx !== lastChapter) {
          if (chIdx === 1) injectSpiral(INJECT[0][0], INJECT[0][1]);
          if (chIdx === 2) injectSpiral(INJECT[1][0], INJECT[1][1]);
          if (chIdx === 3) { injectSpiral(INJECT[2][0], INJECT[2][1]); injectSpiral(W_S*0.50, H_S*0.50); }
          lastChapter = chIdx;
        }

        // Interpolate Barkley parameters
        const [a0,b0,e0] = CH_PARAMS[chIdx];
        const [a1,b1,e1] = CH_PARAMS[next];
        const a   = lerp(a0,a1,blend);
        const b   = lerp(b0,b1,blend);
        const eps = lerp(e0,e1,blend);

        for (let s = 0; s < STEPS_PER_FRAME; s++) stepBarkley(a, b, eps);

        // Chapter palettes
        const p0 = PALETTES[chIdx], p1 = PALETTES[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend));
        const bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const exR = Math.round(lerp(p0[3],p1[3],blend));
        const exG = Math.round(lerp(p0[4],p1[4],blend));
        const exB = Math.round(lerp(p0[5],p1[5],blend));

        // Render simulation to offscreen
        const sd = simImg.data;
        for (let idx = 0; idx < N_S; idx++) {
          const u = u0[idx], v = v0[idx];
          const eb  = u * u * u;           // excited brightness (gamma-compressed)
          const rf  = v * (1 - u);         // refractory indicator (0 = none, 1 = max)
          // Blend: excited → refractory tint as subtle cool shift
          const excR = lerp(bgR, exR, eb);
          const excG = lerp(bgG, exG, eb);
          const excB = lerp(bgB, exB, eb);
          const pi = idx * 4;
          sd[pi  ] = Math.max(0, Math.min(255, Math.round(excR - rf * 10)));
          sd[pi+1] = Math.max(0, Math.min(255, Math.round(excG - rf * 4)));
          sd[pi+2] = Math.max(0, Math.min(255, Math.round(excB + rf * 18)));
          sd[pi+3] = 255;
        }
        simCtx.putImageData(simImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(simCanvas, 0, 0, W, H);

        // Phase portrait HUD ── (u,v) phase space
        const ppA = ss(0.04, 0.14, sp);
        if (ppA > 0.01) {
          const pd = ppImg.data;
          // Clear to background
          for (let k = 0; k < PP*PP*4; k += 4) {
            pd[k] = bgR; pd[k+1] = bgG; pd[k+2] = bgB; pd[k+3] = 255;
          }
          // Draw null-clines as faint guide lines
          // v-nullcline: v = u  (diagonal bottom-left → top-right in image coords)
          // u-nullcline: v = a*u*(1-u)*(u-0) - b ... approximately: three fixed points
          // Simplified: draw the v=u diagonal and a cubic-like u-nullcline
          for (let pu = 0; pu < PP; pu++) {
            const uVal = pu / (PP-1);
            // v-nullcline: v = u
            {
              const pv_diag = Math.round((1 - uVal) * (PP-1));
              if (pv_diag >= 0 && pv_diag < PP) {
                const ki = (pv_diag * PP + pu) * 4;
                pd[ki  ] = Math.round(exR*0.30+bgR*0.70);
                pd[ki+1] = Math.round(exG*0.30+bgG*0.70);
                pd[ki+2] = Math.round(exB*0.30+bgB*0.70);
                pd[ki+3] = 255;
              }
            }
            // u-nullcline: v = a*u*(1-u) - b   (cubic, approximate)
            {
              const vNull = a * uVal * (1-uVal) * 3 - b * 2;
              if (vNull >= 0 && vNull <= 1) {
                const pv_u = Math.round((1-vNull) * (PP-1));
                if (pv_u >= 0 && pv_u < PP) {
                  const ki = (pv_u * PP + pu) * 4;
                  pd[ki  ] = Math.round(exR*0.22+bgR*0.78);
                  pd[ki+1] = Math.round(exG*0.22+bgG*0.78);
                  pd[ki+2] = Math.round(exB*0.22+bgB*0.78);
                  pd[ki+3] = 255;
                }
              }
            }
          }
          // Plot sampled state points
          for (let idx = 0; idx < N_S; idx += 6) {
            const pu = Math.min(PP-1, Math.round(u0[idx] * (PP-1)));
            const pv = Math.min(PP-1, Math.round((1-v0[idx]) * (PP-1)));
            const ki = (pv * PP + pu) * 4;
            pd[ki  ] = exR; pd[ki+1] = exG; pd[ki+2] = exB; pd[ki+3] = 255;
          }
          ppCtx.putImageData(ppImg, 0, 0);

          const hx = W*0.025, hy = H*0.028;
          const hw = PP * 2.0, hh = PP * 2.0;
          dc.save();
          dc.globalAlpha = ppA * 0.85;
          dc.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
          dc.fillRect(hx-2, hy-2, hw+4, hh+4);
          dc.imageSmoothingEnabled = false;
          dc.drawImage(ppCanvas, hx, hy, hw, hh);
          dc.strokeStyle = `rgba(${exR},${exG},${exB},0.28)`;
          dc.lineWidth = 0.7;
          dc.strokeRect(hx-2, hy-2, hw+4, hh+4);
          dc.restore();

          p.noStroke();
          p.fill(exR, exG, exB, Math.round(ppA * 52));
          p.textSize(6.5);
          p.textAlign(p.LEFT, p.TOP);
          p.text("PHASE (u,v)", hx, hy + hh + 4);
        }

        // Stats HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const leftX = W*0.018 + (ppA > 0.01 ? PP*2.2 : 0);
          p.noStroke();
          p.fill(exR, exG, exB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`ε=${eps.toFixed(3)}  a=${a.toFixed(3)}  b=${b.toFixed(3)}`, leftX, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · BARKLEY`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${STEPS_PER_FRAME} steps/frame`, W*0.982, H*0.982);
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
export function SpiralLab() {
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
    {bottom:"14%",left: "6%"},
    {top:"50%",   right:"7%", textAlign:"right", transform:"translateY(-50%)"},
    {bottom:"14%",right:"7%", textAlign:"right"},
    {top:"12%",   left: "6%"},
    {top:"50%",   left: "6%", transform:"translateY(-50%)"},
    {top:"12%",   right:"7%", textAlign:"right"},
    {bottom:"14%",left: "6%"},
    {top:"50%",   right:"7%", textAlign:"right", transform:"translateY(-50%)"},
    {top:"12%",   left: "6%"},
    {bottom:"14%",right:"7%", textAlign:"right"},
    {top:"50%",   left:"50%", textAlign:"center", transform:"translate(-50%,-50%)"},
  ];

  const chips = ["#7a3020","#206878","#6a2858","#585870"];
  const texts = ["#ffe29a","#37dafe","#ffa280","#b9caf0"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  const activeChNames = locale === "pt" ? CH_NAMES_PT : CH_NAMES;
  const activeHeadings = locale === "pt" ? HEADINGS_PT : HEADINGS;

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#0c0305"}}>
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
