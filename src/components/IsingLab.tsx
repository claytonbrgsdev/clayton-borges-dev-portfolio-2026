"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Ising model constants ──────────────────────────────────────────────────────
const W_IS = 200, H_IS = 133, N_IS = W_IS * H_IS;
const FLIPS_PER_FRAME = N_IS * 2;  // 2 sweeps per frame

// Module-level grid (0=spin-down, 1=spin-up)
const spinGrid = new Uint8Array(N_IS);

function initIsing(ordered: boolean) {
  if (ordered) {
    spinGrid.fill(1);
  } else {
    for (let i = 0; i < N_IS; i++) spinGrid[i] = Math.random() < 0.5 ? 1 : 0;
  }
}

function metropolisStep(T: number) {
  const invT = 1 / T;
  const p4 = Math.exp(-4 * invT);  // acceptance prob for ΔE=+4J
  const p8 = Math.exp(-8 * invT);  // acceptance prob for ΔE=+8J

  for (let k = 0; k < FLIPS_PER_FRAME; k++) {
    const idx = (Math.random() * N_IS) | 0;
    const x = idx % W_IS, y = (idx / W_IS) | 0;

    // Periodic boundary neighbors
    const l = x > 0        ? idx - 1        : idx + W_IS - 1;
    const r = x < W_IS - 1 ? idx + 1        : idx - W_IS + 1;
    const u = y > 0        ? idx - W_IS      : idx + N_IS - W_IS;
    const d = y < H_IS - 1 ? idx + W_IS      : idx - N_IS + W_IS;

    const si = 2 * spinGrid[idx] - 1;  // +1 or -1
    const S  = (2*spinGrid[l]-1) + (2*spinGrid[r]-1) + (2*spinGrid[u]-1) + (2*spinGrid[d]-1);
    const dE = 2 * si * S;  // ΔE if this spin flips

    if (dE <= 0) {
      spinGrid[idx] ^= 1;
    } else if (Math.random() < (dE === 4 ? p4 : p8)) {
      spinGrid[idx] ^= 1;
    }
  }
}

// Temperature ramp: hot at sp=0 (disordered) → cold at sp=1 (ordered)
function tempFromSp(sp: number): number {
  return lerp(4.8, 0.65, sp);
}

// Per-chapter: [up_r,up_g,up_b, down_r,down_g,down_b]
const CH_PALS_IS: [number,number,number,number,number,number][] = [
  [235, 210, 160,   5,   4,  10],  // ch1 PARAMAGNETIC: warm sand + deep navy
  [255, 120,  60,   3,   5,  18],  // ch2 CRITICAL: coral-orange + deep blue
  [100, 180, 255,   4,   2,   6],  // ch3 FERROMAGNETIC: sky + deep violet
  [248, 248, 252,   2,   2,   4],  // ch4 ORDERED: near-white + near-black
];

const CH_NAMES_IS = ["PARAMAGNETIC","CRITICAL","FERROMAGNETIC","ORDERED"];
const CH_NAMES_IS_PT = ["PARAMAGNÉTICO","CRÍTICO","FERROMAGNÉTICO","ORDENADO"];

const SECTIONS_IS = [
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

const HEADINGS_IS: [string,string][] = [
  ["SPIN",        "every magnetic moment at random"],
  ["DISORDER",    "T > T_c — thermal energy wins"],
  ["UNCORRELATED","each atom ignores its neighbors"],
  ["TRANSITION",  "T → T_c = 2.269 J/k_B"],
  ["SCALE-FREE",  "fluctuations at every length scale"],
  ["CRITICAL",    "the boundary between two phases"],
  ["DOMAINS",     "islands of aligned spins form"],
  ["MAGNETIZED",  "the majority has chosen"],
  ["ORDER",       "collective behaviour from pair interactions"],
  ["FROZEN",      "T << T_c — near-perfect alignment"],
  ["GROUND STATE","the minimum energy configuration"],
  ["THE SHAPE",   "one macro-state — countless micro-states"],
];

const HEADINGS_IS_PT: [string,string][] = [
  ["SPIN",              "cada momento magnético ao acaso"],
  ["DESORDEM",          "T > T_c — a energia térmica vence"],
  ["DESCORRELACIONADO", "cada átomo ignora seus vizinhos"],
  ["TRANSIÇÃO",         "T → T_c = 2,269 J/k_B"],
  ["LIVRE DE ESCALA",   "flutuações em todo comprimento de escala"],
  ["CRÍTICO",           "a fronteira entre duas fases"],
  ["DOMÍNIOS",          "ilhas de spins alinhados se formam"],
  ["MAGNETIZADO",       "a maioria escolheu"],
  ["ORDEM",             "comportamento coletivo de interações pares"],
  ["CONGELADO",         "T << T_c — alinhamento quase perfeito"],
  ["ESTADO FUNDAMENTAL","a configuração de mínima energia"],
  ["A FORMA",           "um macroestado — incontáveis microestados"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    initIsing(false);
    let lastChapter = -1;
    let magnetization = 0;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_IS; offscreen.height = H_IS;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_IS, H_IS);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        if (chIdx !== lastChapter) {
          // Start ch1 from random; ch4 from ordered (helps it reach equilibrium quickly)
          initIsing(chIdx === 3);
          // Warm up new chapter to equilibrium: run 4 sweeps
          const T0 = tempFromSp(chIdx / 4);
          for (let w = 0; w < 4; w++) metropolisStep(T0);
          lastChapter = chIdx;
        }

        const T = tempFromSp(sp);
        metropolisStep(T);

        // Compute magnetization (amortized every 3 frames)
        if ((p.frameCount % 3) === 0) {
          let sum = 0;
          for (let i = 0; i < N_IS; i++) sum += 2 * spinGrid[i] - 1;
          magnetization = Math.abs(sum) / N_IS;
        }

        // Blend palettes
        const p0 = CH_PALS_IS[chIdx], p1 = CH_PALS_IS[next];
        const upR  = Math.round(lerp(p0[0],p1[0],blend)), upG  = Math.round(lerp(p0[1],p1[1],blend));
        const upB  = Math.round(lerp(p0[2],p1[2],blend));
        const dnR  = Math.round(lerp(p0[3],p1[3],blend)), dnG  = Math.round(lerp(p0[4],p1[4],blend));
        const dnB  = Math.round(lerp(p0[5],p1[5],blend));

        // Pixel render
        const sd = offImg.data;
        for (let idx = 0; idx < N_IS; idx++) {
          const pi = idx * 4;
          if (spinGrid[idx] === 1) {
            sd[pi] = upR; sd[pi+1] = upG; sd[pi+2] = upB;
          } else {
            sd[pi] = dnR; sd[pi+1] = dnG; sd[pi+2] = dnB;
          }
          sd[pi+3] = 255;
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Magnetization indicator bar (right edge)
        const barA = ss(0.04, 0.16, sp);
        if (barA > 0.01) {
          const barH = H * 0.50, barY0 = H * 0.25;
          const barX = W * 0.968;
          dc.fillStyle = `rgba(${upR},${upG},${upB},${(barA * 0.12).toFixed(2)})`;
          dc.fillRect(barX - 2, barY0, 4, barH);
          dc.fillStyle = `rgba(${upR},${upG},${upB},${(barA * 0.72).toFixed(2)})`;
          dc.fillRect(barX - 2, barY0 + barH * (1 - magnetization), 4, barH * magnetization);
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(upR, upG, upB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`T = ${T.toFixed(3)}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · 2D ISING`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`|M|=${magnetization.toFixed(3)} · T_c≈2.269`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_IS[i];
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
export function IsingLab() {
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

  const activeChNames = locale === "pt" ? CH_NAMES_IS_PT : CH_NAMES_IS;
  const activeHeadings = locale === "pt" ? HEADINGS_IS_PT : HEADINGS_IS;

  const chips = ["#30281a","#30180a","#0a1830","#181818"];
  const texts = ["#c0a060","#e87030","#60b0e8","#e8e8f8"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#050404"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_IS.map((sec, i) => {
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
