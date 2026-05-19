"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Mandelbrot constants ───────────────────────────────────────────────────────
const W_M = 200, H_M = 133, N_M = W_M * H_M;
const MAX_ITER = 200;
const BAIL_OUT2 = 4.0;

// Zoom journey keyframes: [cx, cy, extent]
const KEY_FRAMES: [number, number, number][] = [
  [-0.500,    0.0000,  1.80],
  [-0.750,    0.1000,  0.35],
  [-0.7470,   0.1015,  0.022],
  [-0.7269,   0.1889,  0.003],
  [-0.7269,   0.1889,  0.0003],
];

function viewFromSp(sp: number): [number, number, number] {
  const t = sp * (KEY_FRAMES.length - 1);
  const i = Math.min(KEY_FRAMES.length - 2, Math.floor(t));
  const f = t - i;
  const sf = ss(0, 1, f);
  const [cx0, cy0, e0] = KEY_FRAMES[i];
  const [cx1, cy1, e1] = KEY_FRAMES[i+1];
  return [lerp(cx0, cx1, sf), lerp(cy0, cy1, sf), Math.exp(lerp(Math.log(e0), Math.log(e1), sf))];
}

const CH_HUE_OFFSET = [0.00, 0.20, 0.45, 0.65];
const CH_NAMES_M = ["MANDELBROT","SEAHORSE","DEPTH","EMBEDDED"];

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

// ── Mandelbrot pixel buffer ────────────────────────────────────────────────────
const pixBuf_M = new Uint8Array(N_M * 4);
let lastComputedSp_M = -99;

function computeMandelbrot(sp: number) {
  const chF = sp * 4, chIdx = Math.min(3, Math.floor(chF));
  const [cx, cy, extent] = viewFromSp(sp);
  const hueOff = CH_HUE_OFFSET[chIdx];

  const scaleX = extent * 2 / W_M;
  const scaleY = extent * 2 / H_M;

  for (let py = 0; py < H_M; py++) {
    const ci = cy - extent + (py + 0.5) * scaleY;
    for (let px = 0; px < W_M; px++) {
      const cr = cx - extent + (px + 0.5) * scaleX;
      let zr = 0, zi = 0;
      let iter = 0;
      while (iter < MAX_ITER) {
        const zr2 = zr*zr, zi2 = zi*zi;
        if (zr2 + zi2 > BAIL_OUT2) break;
        zi = 2*zr*zi + ci;
        zr = zr2 - zi2 + cr;
        iter++;
      }

      const pi = (py * W_M + px) * 4;
      if (iter === MAX_ITER) {
        pixBuf_M[pi] = 2; pixBuf_M[pi+1] = 2; pixBuf_M[pi+2] = 4; pixBuf_M[pi+3] = 255;
      } else {
        const zr2 = zr*zr, zi2 = zi*zi;
        const logZn = Math.log(zr2 + zi2) * 0.5;
        const nu = Math.log(logZn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;
        const hue = ((smoothIter * 0.04 + hueOff) % 1.0 + 1.0) % 1.0;
        const val = 0.65 + 0.35 * Math.sin(smoothIter * 0.08 * Math.PI);
        const [r, g, b] = hsvToRgb255(hue, 0.88, val);
        pixBuf_M[pi] = r; pixBuf_M[pi+1] = g; pixBuf_M[pi+2] = b; pixBuf_M[pi+3] = 255;
      }
    }
  }
}

// ── Julia companion buffer ─────────────────────────────────────────────────────
// Julia set J(c): same iteration z→z²+c but z₀=pixel, c=fixed parameter.
// As we zoom the Mandelbrot to point c, J(c) reveals the local topology.
const W_J = 72, H_J = 48, N_J = W_J * H_J;
const MAX_ITER_J = 100;
const pixBuf_J = new Uint8Array(N_J * 4);

function computeJulia(cx: number, cy: number, hueOff: number) {
  const ext = 1.6;
  const scX = ext * 2 / W_J;
  const scY = ext * 2 / H_J;

  for (let py = 0; py < H_J; py++) {
    const zi0 = -ext + (py + 0.5) * scY;
    for (let px = 0; px < W_J; px++) {
      let zr = -ext + (px + 0.5) * scX;
      let zi = zi0;
      let iter = 0;
      while (iter < MAX_ITER_J) {
        const zr2 = zr*zr, zi2 = zi*zi;
        if (zr2 + zi2 > BAIL_OUT2) break;
        zi = 2*zr*zi + cy;
        zr = zr2 - zi2 + cx;
        iter++;
      }
      const pi = (py * W_J + px) * 4;
      if (iter === MAX_ITER_J) {
        pixBuf_J[pi] = 2; pixBuf_J[pi+1] = 2; pixBuf_J[pi+2] = 4; pixBuf_J[pi+3] = 255;
      } else {
        const zr2 = zr*zr, zi2 = zi*zi;
        const logZn = Math.log(zr2 + zi2) * 0.5;
        const nu = Math.log(logZn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;
        const hue = ((smoothIter * 0.04 + hueOff) % 1.0 + 1.0) % 1.0;
        const val = 0.65 + 0.35 * Math.sin(smoothIter * 0.08 * Math.PI);
        const [r, g, b] = hsvToRgb255(hue, 0.88, val);
        pixBuf_J[pi] = r; pixBuf_J[pi+1] = g; pixBuf_J[pi+2] = b; pixBuf_J[pi+3] = 255;
      }
    }
  }
}

const SECTIONS_M = [
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

const HEADINGS_M: [string,string][] = [
  ["MANDELBROT", "the set of c where z² + c stays bounded"],
  ["BOUNDARY",   "the most complex object in mathematics"],
  ["CONNECTED",  "the Mandelbrot set is simply connected"],
  ["SEAHORSE",   "the valley between the bulbs"],
  ["FILAMENT",   "the boundary never repeats"],
  ["SPIRAL",     "structure at every scale"],
  ["DEPTH",      "ten million to one magnification"],
  ["NOT QUITE",  "self-similar — but never exactly"],
  ["FRACTAL DIM","D ≈ 2 — the boundary has area zero"],
  ["EMBEDDED",   "a copy of the whole set, inside itself"],
  ["INFINITE",   "at every depth — a new Mandelbrot"],
  ["THE SHAPE",  "bounded by a rule — infinite in detail"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    lastComputedSp_M = -99;
    pixBuf_M.fill(0);
    pixBuf_J.fill(0);

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;
      let offJ: HTMLCanvasElement, offCtxJ: CanvasRenderingContext2D, offImgJ: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);

        offscreen = document.createElement("canvas");
        offscreen.width = W_M; offscreen.height = H_M;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_M, H_M);

        offJ = document.createElement("canvas");
        offJ.width = W_J; offJ.height = H_J;
        offCtxJ = offJ.getContext("2d") as CanvasRenderingContext2D;
        offImgJ = offCtxJ.createImageData(W_J, H_J);

        computeMandelbrot(0);
        const [cx0, cy0] = viewFromSp(0);
        computeJulia(cx0, cy0, CH_HUE_OFFSET[0]);
        lastComputedSp_M = 0;
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF));

        if (Math.abs(sp - lastComputedSp_M) > 0.0022) {
          computeMandelbrot(sp);
          const [cx, cy] = viewFromSp(sp);
          computeJulia(cx, cy, CH_HUE_OFFSET[chIdx]);
          lastComputedSp_M = sp;
        }

        // Main Mandelbrot render
        offImg.data.set(pixBuf_M);
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "high";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Crosshair at viewport center
        const crossA = ss(0.02, 0.14, sp) * (1 - ss(0.86, 0.94, sp));
        if (crossA > 0.01) {
          dc.strokeStyle = `rgba(255,255,255,${(crossA * 0.25).toFixed(2)})`;
          dc.lineWidth = 0.6;
          dc.beginPath(); dc.moveTo(W*0.5-10, H*0.5); dc.lineTo(W*0.5+10, H*0.5); dc.stroke();
          dc.beginPath(); dc.moveTo(W*0.5, H*0.5-10); dc.lineTo(W*0.5, H*0.5+10); dc.stroke();
        }

        // Julia companion PiP: J(c) for current viewport center c
        const jupA = ss(0.06, 0.22, sp);
        if (jupA > 0.01) {
          offImgJ.data.set(pixBuf_J);
          offCtxJ.putImageData(offImgJ, 0, 0);
          const pw = 80, ph = 54;
          const pxPos = W * 0.5 - pw * 0.5;
          const pyPos = H * 0.90 - ph;
          dc.save();
          dc.globalAlpha = jupA * 0.88;
          dc.imageSmoothingEnabled = true;
          dc.imageSmoothingQuality = "high";
          dc.drawImage(offJ, pxPos, pyPos, pw, ph);
          dc.globalAlpha = jupA * 0.55;
          dc.strokeStyle = "rgba(255,255,255,0.8)";
          dc.lineWidth = 0.5;
          dc.strokeRect(pxPos, pyPos, pw, ph);
          dc.globalAlpha = jupA * 0.50;
          dc.fillStyle = "rgba(180,180,210,1)";
          dc.font = "5.5px Arial, 'Helvetica Neue', sans-serif";
          dc.textAlign = "center";
          dc.fillText("J(c)", W * 0.5, pyPos - 2.5);
          dc.restore();
        }

        // HUD
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const [cx, cy, extent] = viewFromSp(sp);
          const zoom = (1.8 / extent).toFixed(0);
          const hueOff = CH_HUE_OFFSET[chIdx];
          const [hr,hg,hb] = hsvToRgb255((hueOff + 0.55) % 1, 0.7, 0.88);
          p.noStroke();
          p.fill(hr, hg, hb, Math.round(hudA * 50));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`${zoom}× zoom`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · MANDELBROT`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`(${cx.toFixed(6)}, ${cy.toFixed(6)})`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_M[i];
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
export function MandelbrotLab() {
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

  const chips = ["#14101e","#101420","#181014","#200e0e"];
  const texts = ["#9060e8","#4090e8","#40c880","#e08040"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#020204"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_M.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_M[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_M[chIdx]}`}</span>
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
