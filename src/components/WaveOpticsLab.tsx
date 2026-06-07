"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Wave optics constants ──────────────────────────────────────────────────────
const W_W = 200, H_W = 133, N_W = W_W * H_W;
const TWO_PI = Math.PI * 2;

// Chapter source configurations: [x, y][] in simulation space
const W2 = W_W * 0.5, H2 = H_W * 0.5;
const SOURCE_CFGS: [number,number][][] = [
  // ch1 COHERENCE — double slit, narrow (λ=30)
  [[W2-10, H2], [W2+10, H2]],
  // ch2 INTERFERENCE — double slit, wider (λ=20)
  [[W2-26, H2], [W2+26, H2]],
  // ch3 DIFFRACTION — 4-slit grating (λ=16)
  [[W2-36, H2], [W2-12, H2], [W2+12, H2], [W2+36, H2]],
  // ch4 APERTURE — 8 sources in ring (λ=18)
  ...Array.from({length:1}, () =>
    Array.from({length:8}, (_,k): [number,number] => [
      W2 + 28*Math.cos(TWO_PI*k/8),
      H2 + 28*Math.sin(TWO_PI*k/8),
    ])
  ),
];

// Wavenumber per chapter: k = 2π/λ
const K_BY_CH = [TWO_PI/30, TWO_PI/20, TWO_PI/16, TWO_PI/18];

// Per-chapter: [bg_r,bg_g,bg_b, bright_r,bright_g,bright_b]
// Constructive (bright) vs destructive (dark)
const CH_PALS_W: [number,number,number,number,number,number][] = [
  [ 3,  4, 12, 228, 195,  90],  // ch1 deep navy + gold
  [ 6,  3, 10, 100, 210, 230],  // ch2 deep violet + teal-cyan
  [ 2,  2,  2, 240, 238, 248],  // ch3 near-black + near-white
  [12,  3,  3, 255, 155,  60],  // ch4 deep crimson + orange
];

const CH_NAMES_W = ["COHERENCE","INTERFERENCE","DIFFRACTION","APERTURE"];
const CH_NAMES_W_PT = ["COERÊNCIA","INTERFERÊNCIA","DIFRAÇÃO","ABERTURA"];

const SECTIONS_W = [
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

const HEADINGS_W: [string,string][] = [
  ["WAVE",         "amplitude distributed in space"],
  ["COHERENT",     "two sources locked in phase"],
  ["HUYGENS",      "every wavefront is a new source"],
  ["CONSTRUCTIVE", "crest meets crest — amplified"],
  ["DESTRUCTIVE",  "crest meets trough — cancelled"],
  ["PATTERN",      "the geometry of wavelengths"],
  ["GRATING",      "four slits — four waves combined"],
  ["PRINCIPAL",    "the maxima that survive"],
  ["RESOLUTION",   "the limit of any optical system"],
  ["CIRCULAR",     "eight sources — ring aperture"],
  ["AIRY",         "the disk that limits every telescope"],
  ["THE LIMIT",    "no lens escapes diffraction"],
];

const HEADINGS_W_PT: [string,string][] = [
  ["ONDA",          "amplitude distribuída no espaço"],
  ["COERENTE",      "duas fontes travadas em fase"],
  ["HUYGENS",       "cada frente de onda é uma nova fonte"],
  ["CONSTRUTIVA",   "crista encontra crista — amplificada"],
  ["DESTRUTIVA",    "crista encontra vale — cancelada"],
  ["PADRÃO",        "a geometria dos comprimentos de onda"],
  ["GRADE",         "quatro fendas — quatro ondas combinadas"],
  ["PRINCIPAL",     "os máximos que sobrevivem"],
  ["RESOLUÇÃO",     "o limite de qualquer sistema óptico"],
  ["CIRCULAR",      "oito fontes — abertura anelar"],
  ["AIRY",          "o disco que limita todo telescópio"],
  ["O LIMITE",      "nenhuma lente escapa da difração"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_W; offscreen.height = H_W;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_W, H_W);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        // Wave phase: frame-driven for continuous motion, sp-driven for chapter variety
        const phase = p.frameCount * 0.18 + sp * TWO_PI * 8;

        // Blend source configs between chapters (interpolate positions)
        const cfg0 = SOURCE_CFGS[chIdx], cfg1 = SOURCE_CFGS[next];
        const nSrc0 = cfg0.length, nSrc1 = cfg1.length;
        const nSrc = Math.max(nSrc0, nSrc1);
        const k0 = K_BY_CH[chIdx], k1 = K_BY_CH[next];
        const kBlend = lerp(k0, k1, blend);

        // Blend palettes
        const p0 = CH_PALS_W[chIdx], p1 = CH_PALS_W[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend)), bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const brR = Math.round(lerp(p0[3],p1[3],blend)), brG = Math.round(lerp(p0[4],p1[4],blend));
        const brB = Math.round(lerp(p0[5],p1[5],blend));

        // Render interference field to pixel buffer
        const sd = offImg.data;
        for (let py = 0; py < H_W; py++) {
          for (let px = 0; px < W_W; px++) {
            let field = 0;
            for (let s = 0; s < nSrc; s++) {
              // Blend source position between chapters
              const sx0 = cfg0[s % nSrc0][0], sy0 = cfg0[s % nSrc0][1];
              const sx1 = cfg1[s % nSrc1][0], sy1 = cfg1[s % nSrc1][1];
              const sx = lerp(sx0, sx1, blend), sy = lerp(sy0, sy1, blend);
              const dist = Math.sqrt((px-sx)*(px-sx) + (py-sy)*(py-sy));
              field += Math.sin(kBlend * dist - phase);
            }
            // Map field ∈ [-nSrc, +nSrc] to [0,1]
            const brt = Math.max(0, Math.min(1, (field / nSrc + 1) * 0.5));
            const brt2 = brt * brt;  // gamma for contrast
            const pi = (py * W_W + px) * 4;
            sd[pi  ] = Math.round(lerp(bgR, brR, brt2));
            sd[pi+1] = Math.round(lerp(bgG, brG, brt2));
            sd[pi+2] = Math.round(lerp(bgB, brB, brt2));
            sd[pi+3] = 255;
          }
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Source position markers
        const srcA = ss(0.02, 0.15, sp) * (1 - ss(0.83, 0.93, sp));
        if (srcA > 0.01) {
          const scx = W / W_W, scy = H / H_W;
          for (let s = 0; s < nSrc; s++) {
            const sx0 = cfg0[s % nSrc0][0], sy0 = cfg0[s % nSrc0][1];
            const sx1 = cfg1[s % nSrc1][0], sy1 = cfg1[s % nSrc1][1];
            const sx = lerp(sx0, sx1, blend) * scx;
            const sy = lerp(sy0, sy1, blend) * scy;
            dc.beginPath();
            dc.arc(sx, sy, 4.5, 0, TWO_PI);
            dc.strokeStyle = `rgba(${brR},${brG},${brB},${(srcA * 0.85).toFixed(2)})`;
            dc.lineWidth = 1.2;
            dc.stroke();
            dc.beginPath();
            dc.arc(sx, sy, 1.5, 0, TWO_PI);
            dc.fillStyle = `rgba(${brR},${brG},${brB},${(srcA * 0.95).toFixed(2)})`;
            dc.fill();
          }
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const lambda = (TWO_PI / kBlend).toFixed(1);
          p.noStroke();
          p.fill(brR, brG, brB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`λ = ${lambda}px · ${nSrc} src`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · WAVE OPTICS`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`HUYGENS · FRESNEL`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_W[i];
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
export function WaveOpticsLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement|null>>(Array(12).fill(null));
  const [locale] = useLabLocale();
  const activeChNames = locale === "pt" ? CH_NAMES_W_PT : CH_NAMES_W;
  const activeHeadings = locale === "pt" ? HEADINGS_W_PT : HEADINGS_W;

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

  const chips = ["#0e0e28","#180e28","#101010","#280e0e"];
  const texts = ["#b8a050","#50c8d0","#d8d8e8","#e89030"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#030306"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_W.map((sec, i) => {
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
