"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Vortex simulation constants ────────────────────────────────────────────────
const W_V = 240, H_V = 160, N_V = W_V * H_V;
const N_TRACERS   = 1800;
const EPS_V       = 18;       // softening² prevents singularity near vortex core
const DT_TRACER   = 0.52;
const DT_VORT     = 0.09;
const DECAY_DENS  = 0.983;
const SPLAT_W     = 0.11;
const INV_2PI     = 1 / (Math.PI * 2);
const TWO_PI      = Math.PI * 2;

// Module-level buffers
const density = new Float32Array(N_V);
const tracerX = new Float32Array(N_TRACERS);
const tracerY = new Float32Array(N_TRACERS);
const vxBuf   = new Float32Array(12);
const vyBuf   = new Float32Array(12);
const vGBuf   = new Float32Array(12);
const _dvx    = new Float32Array(12);
const _dvy    = new Float32Array(12);

// [x, y, G] — simulation units [0..W_V) × [0..H_V)
type VortCfg = [number, number, number][];

const VORT_CFGS: VortCfg[] = [
  // ch1 IRROTATIONAL — dipole pair, translates together
  [[108, 80,  2.8], [132, 80, -2.8]],
  // ch2 CAROUSEL — alternating square, co-rotates as rigid body
  [[100, 70,  2.4], [140, 70, -2.4], [140, 110, 2.4], [100, 110, -2.4]],
  // ch3 TURBULENCE — 3 dipoles in asymmetric arrangement
  [[78, 65, 2.1], [108, 65, -2.1], [140, 95, 2.1], [166, 95, -2.1], [122, 130, 2.1], [122, 50, -2.1]],
  // ch4 DISSOLUTION — 8 vortices on ring, alternating sign
  [[120,52,1.8],[156,68,-1.8],[169,106,1.8],[148,135,-1.8],[100,135,1.8],[76,106,-1.8],[88,68,1.8],[68,130,-1.8]],
];

const CH_NAMES_V = ["IRROTATIONAL","CAROUSEL","TURBULENCE","DISSOLUTION"];
const CH_NAMES_V_PT = ["IRROTACIONAL","CARROSSEL","TURBULÊNCIA","DISSOLUÇÃO"];

// [bgR,bgG,bgB, fgR,fgG,fgB]
const CH_PALS_V: [number,number,number,number,number,number][] = [
  [3,  5, 12, 145, 195, 255],  // ch1 deep navy + bright sky
  [12,  6,  3, 255, 205, 115],  // ch2 warm ember + gold
  [ 8,  3, 12, 205, 135, 255],  // ch3 deep violet + lavender
  [ 5,  5,  6, 218, 215, 228],  // ch4 near-black + cold silver
];

const SECTIONS_V = [
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

const HEADINGS_V: [string,string][] = [
  ["DIPOLE",      "two vortices — one machine"],
  ["STREAMLINE",  "the fluid remembers where it has been"],
  ["POTENTIAL",   "irrotational everywhere but the core"],
  ["CAROUSEL",    "four vortices — one eternal orbit"],
  ["VORTICITY",   "the curl of the velocity field"],
  ["HAMILTONIAN", "energy conserved, path unpredictable"],
  ["TURBULENCE",  "the cascade from order to complexity"],
  ["MIXING",      "two fluid parcels that will never reunite"],
  ["INERTIA",     "the fluid that forgets its origin"],
  ["VISCOSITY",   "every motion eventually stilled"],
  ["DECAY",       "the last vortex unwinds alone"],
  ["EQUILIBRIUM", "the field that was always there"],
];

const HEADINGS_V_PT: [string,string][] = [
  ["DIPOLO",          "dois vórtices — uma máquina"],
  ["LINHA DE FLUXO",  "o fluido lembra onde esteve"],
  ["POTENCIAL",       "irrotacional em todo lugar exceto no núcleo"],
  ["CARROSSEL",       "quatro vórtices — uma órbita eterna"],
  ["VORTICIDADE",     "o rotacional do campo de velocidade"],
  ["HAMILTONIANO",    "energia conservada, trajetória imprevisível"],
  ["TURBULÊNCIA",     "a cascata da ordem à complexidade"],
  ["MISTURA",         "duas parcelas de fluido que nunca se reunirão"],
  ["INÉRCIA",         "o fluido que esquece sua origem"],
  ["VISCOSIDADE",     "todo movimento eventualmente silenciado"],
  ["DECAIMENTO",      "o último vórtice se desfaz sozinho"],
  ["EQUILÍBRIO",      "o campo que sempre esteve lá"],
];

// ── Physics ────────────────────────────────────────────────────────────────────

function velocityAt(px: number, py: number, nV: number): [number, number] {
  let ux = 0, uy = 0;
  for (let i = 0; i < nV; i++) {
    const dx = px - vxBuf[i], dy = py - vyBuf[i];
    const f = vGBuf[i] * INV_2PI / (dx*dx + dy*dy + EPS_V);
    ux -= f * dy;
    uy += f * dx;
  }
  return [ux, uy];
}

function advanceTracers(nV: number) {
  for (let i = 0; i < N_TRACERS; i++) {
    const px = tracerX[i], py = tracerY[i];
    const [k1x, k1y] = velocityAt(px, py, nV);
    const [k2x, k2y] = velocityAt(px + DT_TRACER*k1x, py + DT_TRACER*k1y, nV);
    const nx = px + DT_TRACER*(k1x+k2x)*0.5;
    const ny = py + DT_TRACER*(k1y+k2y)*0.5;
    if (nx < 0 || nx >= W_V || ny < 0 || ny >= H_V || !isFinite(nx) || !isFinite(ny)) {
      tracerX[i] = Math.random() * W_V;
      tracerY[i] = Math.random() * H_V;
    } else {
      tracerX[i] = nx;
      tracerY[i] = ny;
    }
  }
}

function advanceVortices(nV: number) {
  for (let i = 0; i < nV; i++) {
    let ux = 0, uy = 0;
    for (let j = 0; j < nV; j++) {
      if (i === j) continue;
      const dx = vxBuf[i] - vxBuf[j], dy = vyBuf[i] - vyBuf[j];
      const f = vGBuf[j] * INV_2PI / (dx*dx + dy*dy + EPS_V);
      ux -= f * dy;
      uy += f * dx;
    }
    _dvx[i] = ux; _dvy[i] = uy;
  }
  for (let i = 0; i < nV; i++) {
    // Torus boundary — wraps vortices that drift out of domain
    vxBuf[i] = ((vxBuf[i] + DT_VORT*_dvx[i]) % W_V + W_V) % W_V;
    vyBuf[i] = ((vyBuf[i] + DT_VORT*_dvy[i]) % H_V + H_V) % H_V;
  }
}

function initChapter(chIdx: number) {
  const cfg = VORT_CFGS[chIdx];
  for (let i = 0; i < 12; i++) {
    if (i < cfg.length) { vxBuf[i]=cfg[i][0]; vyBuf[i]=cfg[i][1]; vGBuf[i]=cfg[i][2]; }
    else                { vxBuf[i]=0; vyBuf[i]=0; vGBuf[i]=0; }
  }
  for (let i = 0; i < N_TRACERS; i++) {
    tracerX[i] = Math.random() * W_V;
    tracerY[i] = Math.random() * H_V;
  }
  density.fill(0);
}

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
  localeRef: { current: "pt"|"en" },
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
        offscreen.width = W_V; offscreen.height = H_V;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_V, H_V);
        initChapter(0);
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
        const next = Math.min(3, chIdx+1), blend = ss(0.72, 1.0, chT);

        if (chIdx !== lastChapter) { initChapter(chIdx); lastChapter = chIdx; }

        const nV = VORT_CFGS[chIdx].length;
        advanceVortices(nV);
        advanceTracers(nV);

        for (let i = 0; i < N_V; i++) density[i] *= DECAY_DENS;
        for (let i = 0; i < N_TRACERS; i++) {
          const ix = tracerX[i] | 0, iy = tracerY[i] | 0;
          const di = iy * W_V + ix;
          if (di >= 0 && di < N_V) {
            const v = density[di] + SPLAT_W;
            density[di] = v > 1 ? 1 : v;
          }
        }

        // Blend palettes
        const p0 = CH_PALS_V[chIdx], p1 = CH_PALS_V[next];
        const bgR = Math.round(lerp(p0[0],p1[0],blend)), bgG = Math.round(lerp(p0[1],p1[1],blend));
        const bgB = Math.round(lerp(p0[2],p1[2],blend));
        const fgR = Math.round(lerp(p0[3],p1[3],blend)), fgG = Math.round(lerp(p0[4],p1[4],blend));
        const fgB = Math.round(lerp(p0[5],p1[5],blend));

        // Pixel render — sqrt brightness gives richer mid-tone contrast
        const sd = offImg.data;
        for (let idx = 0; idx < N_V; idx++) {
          const brt = Math.min(1, Math.sqrt(density[idx] * 1.4));
          const pi = idx * 4;
          sd[pi  ] = Math.round(lerp(bgR, fgR, brt));
          sd[pi+1] = Math.round(lerp(bgG, fgG, brt));
          sd[pi+2] = Math.round(lerp(bgB, fgB, brt));
          sd[pi+3] = 255;
        }
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Streamline overlay — instantaneous flow field traced from grid seeds
        const streamA = ss(0.10, 0.25, sp) * (1 - ss(0.88, 0.96, sp));
        if (streamA > 0.01) {
          const scx = W / W_V, scy = H / H_V;
          const N_SX = 9, N_SY = 6;
          const sdx = W_V / (N_SX + 1), sdy = H_V / (N_SY + 1);
          dc.strokeStyle = `rgba(${fgR},${fgG},${fgB},${(streamA * 0.14).toFixed(3)})`;
          dc.lineWidth = 0.65;
          for (let gi = 1; gi <= N_SX; gi++) {
            for (let gj = 1; gj <= N_SY; gj++) {
              let px = gi * sdx, py = gj * sdy;
              dc.beginPath();
              dc.moveTo(px * scx, py * scy);
              let moved = false;
              for (let s = 0; s < 28; s++) {
                const [ux, uy] = velocityAt(px, py, nV);
                px += 0.75 * ux; py += 0.75 * uy;
                if (px < 0 || px >= W_V || py < 0 || py >= H_V || !isFinite(px)) break;
                dc.lineTo(px * scx, py * scy);
                moved = true;
              }
              if (moved) dc.stroke();
            }
          }
        }

        // Vortex core markers
        const coreAlpha = ss(0.01, 0.12, sp) * (1 - ss(0.85, 0.95, sp));
        if (coreAlpha > 0.01) {
          const scx = W / W_V, scy = H / H_V;
          for (let i = 0; i < nV; i++) {
            const cx = vxBuf[i] * scx, cy = vyBuf[i] * scy;
            const pos = vGBuf[i] > 0;
            // Inner dot
            dc.beginPath();
            dc.arc(cx, cy, 4, 0, TWO_PI);
            dc.fillStyle = pos
              ? `rgba(${fgR},${fgG},${fgB},${(coreAlpha*0.95).toFixed(2)})`
              : `rgba(${Math.min(255,fgB+40)},${Math.min(255,fgG+10)},${fgR},${(coreAlpha*0.95).toFixed(2)})`;
            dc.fill();
            // Outer ring
            dc.beginPath();
            dc.arc(cx, cy, 9, 0, TWO_PI);
            dc.strokeStyle = pos
              ? `rgba(${fgR},${fgG},${fgB},${(coreAlpha*0.25).toFixed(2)})`
              : `rgba(${Math.min(255,fgB+40)},${Math.min(255,fgG+10)},${fgR},${(coreAlpha*0.25).toFixed(2)})`;
            dc.lineWidth = 1;
            dc.stroke();
            // Sign indicator (+/−)
            dc.strokeStyle = pos
              ? `rgba(${fgR},${fgG},${fgB},${(coreAlpha*0.5).toFixed(2)})`
              : `rgba(${Math.min(255,fgB+40)},${Math.min(255,fgG+10)},${fgR},${(coreAlpha*0.5).toFixed(2)})`;
            dc.lineWidth = 0.8;
            dc.beginPath();
            dc.moveTo(cx - 4, cy); dc.lineTo(cx + 4, cy);
            dc.stroke();
            if (pos) {
              dc.beginPath();
              dc.moveTo(cx, cy - 4); dc.lineTo(cx, cy + 4);
              dc.stroke();
            }
          }
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(fgR, fgG, fgB, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`VORTICES ${nV}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · ${(localeRef.current === "pt" ? CH_NAMES_V_PT : CH_NAMES_V)[chIdx]}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`TRACERS ${N_TRACERS}`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_V[i];
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
export function VortexLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement|null>>(Array(12).fill(null));
  const [locale] = useLabLocale();
  const localeRef = useRef<"pt"|"en">(locale);
  localeRef.current = locale;

  useEffect(() => {
    const container = containerRef.current, scroll = scrollRef.current;
    if (!container || !scroll) return;
    let inst: p5Type|null = null, alive = true;
    buildSketch(container, scroll, sectionEls.current, localeRef).then(p5inst => {
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

  const activeChNamesV = locale === "pt" ? CH_NAMES_V_PT : CH_NAMES_V;
  const activeHeadingsV = locale === "pt" ? HEADINGS_V_PT : HEADINGS_V;

  const chips = ["#1e2e46","#4e2e0e","#2e0e4e","#2e2e36"];
  const texts = ["#82a8d2","#d4a045","#c070e0","#c8c6d8"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#020408"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_V.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = activeHeadingsV[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${activeChNamesV[chIdx]}`}</span>
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
