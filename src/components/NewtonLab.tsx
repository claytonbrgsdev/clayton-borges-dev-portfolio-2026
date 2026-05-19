"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Newton fractal constants ───────────────────────────────────────────────────
const W_N = 168, H_N = 112, N_N = W_N * H_N;
const MAX_ITER  = 52;
const CONV_EPS2 = 0.0003;

// Roots of z^n - 1 for n = 3..6
const N_FOR_CH = [3, 4, 5, 6];
const ROOTS: [number,number][][] = N_FOR_CH.map(n =>
  Array.from({length:n}, (_, k) => [
    Math.cos(2*Math.PI*k/n),
    Math.sin(2*Math.PI*k/n),
  ])
);

// Chapter palette: hue offset (0..1), saturation, value-max, bg [r,g,b]
const CH_PAL_N: [number, number, number, number,number,number][] = [
  [0.00, 0.92, 0.95,  3,  4, 10],  // ch1 n=3: red/blue/green
  [0.22, 0.88, 0.98,  4, 10,  4],  // ch2 n=4: yellow/cyan/blue/magenta
  [0.55, 0.90, 1.00,  8,  3, 12],  // ch3 n=5: violet spectrum
  [0.08, 0.78, 0.95,  4,  4,  4],  // ch4 n=6: desaturated cold
];

const pixBuf = new Uint8Array(N_N * 4);  // RGBA — recomputed on scroll change
let lastComputedSp = -99;

// ── Complex Newton iteration for z^n - 1 ──────────────────────────────────────

function newtonStep(zr: number, zi: number, n: number): [number, number] {
  const z2r = zr*zr - zi*zi, z2i = 2*zr*zi;
  let pnm1r: number, pnm1i: number, pnr: number, pni: number;

  if (n === 3) {
    pnm1r = z2r; pnm1i = z2i;
    pnr = z2r*zr - z2i*zi; pni = z2r*zi + z2i*zr;
  } else if (n === 4) {
    const z3r = z2r*zr - z2i*zi, z3i = z2r*zi + z2i*zr;
    pnm1r = z3r; pnm1i = z3i;
    pnr = z3r*zr - z3i*zi; pni = z3r*zi + z3i*zr;
  } else if (n === 5) {
    const z3r = z2r*zr - z2i*zi, z3i = z2r*zi + z2i*zr;
    const z4r = z2r*z2r - z2i*z2i, z4i = 2*z2r*z2i;
    pnm1r = z4r; pnm1i = z4i;
    pnr = z4r*zr - z4i*zi; pni = z4r*zi + z4i*zr;
  } else {
    // n=6
    const z3r = z2r*zr - z2i*zi, z3i = z2r*zi + z2i*zr;
    const z5r = z3r*z2r - z3i*z2i, z5i = z3r*z2i + z3i*z2r;
    pnm1r = z5r; pnm1i = z5i;
    pnr = z5r*zr - z5i*zi; pni = z5r*zi + z5i*zr;
  }

  const nm1 = n - 1;
  const numR = nm1 * pnr + 1, numI = nm1 * pni;
  const denR = n * pnm1r, denI = n * pnm1i;
  const d2 = denR*denR + denI*denI;
  if (d2 < 1e-20) return [0, 0];
  return [(numR*denR + numI*denI)/d2, (numI*denR - numR*denI)/d2];
}

function hsvToRgb(h: number, s: number, v: number): [number,number,number] {
  const hi = (h * 6) | 0;
  const f = h * 6 - hi;
  const p = v*(1-s), q = v*(1-f*s), t2 = v*(1-(1-f)*s);
  switch (hi % 6) {
    case 0: return [v*255|0, t2*255|0, p*255|0];
    case 1: return [q*255|0, v*255|0, p*255|0];
    case 2: return [p*255|0, v*255|0, t2*255|0];
    case 3: return [p*255|0, q*255|0, v*255|0];
    case 4: return [t2*255|0, p*255|0, v*255|0];
    default: return [v*255|0, p*255|0, q*255|0];
  }
}

function computeFractal(sp: number) {
  const chF = sp*4, chIdx = Math.min(3, Math.floor(chF)), chT = chF - chIdx;
  const n = N_FOR_CH[chIdx];
  const roots = ROOTS[chIdx];
  const [hueOffset, sat, vMax, bgR, bgG, bgB] = CH_PAL_N[chIdx];

  // Viewport: zoom in slightly as chapter progresses
  const extent = lerp(1.92, 1.42, ss(0.1, 0.9, chT));
  // Slow rotation of the complex plane (reveals different features)
  const theta = sp * Math.PI * 0.5;
  const cosT = Math.cos(theta), sinT = Math.sin(theta);

  const scaleX = 2 * extent / W_N;
  const scaleY = 2 * extent / H_N;

  for (let py = 0; py < H_N; py++) {
    for (let px = 0; px < W_N; px++) {
      // Map pixel to complex plane, then rotate
      const cr = px * scaleX - extent;
      const ci = py * scaleY - extent;
      let zr = cr * cosT - ci * sinT;
      let zi = cr * sinT + ci * cosT;

      let rootIdx = -1, iter = 0;
      for (; iter < MAX_ITER; iter++) {
        // Convergence check against each root
        for (let k = 0; k < n; k++) {
          const dr = zr - roots[k][0], di = zi - roots[k][1];
          if (dr*dr + di*di < CONV_EPS2) { rootIdx = k; break; }
        }
        if (rootIdx >= 0) break;
        [zr, zi] = newtonStep(zr, zi, n);
        if (!isFinite(zr) || !isFinite(zi)) { iter = MAX_ITER; break; }
      }

      const pi = (py * W_N + px) * 4;
      if (rootIdx < 0) {
        // Boundary region — faint gradient shows proximity to chaos
        const boundGlow = (iter / MAX_ITER) * 0.22;
        pixBuf[pi  ] = Math.min(255, bgR + Math.round(boundGlow * 38));
        pixBuf[pi+1] = Math.min(255, bgG + Math.round(boundGlow * 38));
        pixBuf[pi+2] = Math.min(255, bgB + Math.round(boundGlow * 42));
        pixBuf[pi+3] = 255;
      } else {
        const hue = ((rootIdx / n) + hueOffset) % 1.0;
        // Brightness: fast convergence = bright (interior), slow = dim (near boundary)
        const brightness = vMax * (0.25 + 0.75 * (1 - iter / MAX_ITER));
        const [r, g, b] = hsvToRgb(hue, sat, brightness);
        pixBuf[pi] = r; pixBuf[pi+1] = g; pixBuf[pi+2] = b; pixBuf[pi+3] = 255;
      }
    }
  }
}

const CH_NAMES_N = ["FORMULATION","ITERATION","CONVERGENCE","BOUNDARY"];

const SECTIONS_N = [
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

const HEADINGS_N: [string,string][] = [
  ["NEWTON",       "the method that finds roots"],
  ["ROOT",         "z³ = 1 has three solutions"],
  ["BASIN",        "each region belongs to one root"],
  ["ITERATION",    "applied again and again"],
  ["BOUNDARY",     "the fractal between basins"],
  ["SYMMETRY",     "four roots — four-fold order"],
  ["CONVERGENCE",  "most points decide quickly"],
  ["UNDECIDED",    "the boundary takes forever"],
  ["FIVE",         "z⁵ = 1"],
  ["FRACTAL",      "the boundary has infinite detail"],
  ["SELF-SIMILAR", "every scale reveals new structure"],
  ["THE LIMIT",    "from one rule — infinite complexity"],
];

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    lastComputedSp = -99;
    pixBuf.fill(0);

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, offImg: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen = document.createElement("canvas");
        offscreen.width = W_N; offscreen.height = H_N;
        offCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;
        offImg = offCtx.createImageData(W_N, H_N);
        // Initial render at sp=0
        computeFractal(0);
        lastComputedSp = 0;
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)));
        const chF = sp*4, chIdx = Math.min(3, Math.floor(chF));

        // Only recompute fractal on meaningful scroll change
        if (Math.abs(sp - lastComputedSp) > 0.0025) {
          computeFractal(sp);
          lastComputedSp = sp;
        }

        offImg.data.set(pixBuf);
        offCtx.putImageData(offImg, 0, 0);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled = true;
        dc.imageSmoothingQuality = "medium";
        dc.drawImage(offscreen, 0, 0, W, H);

        // Root position markers (faint circles at the n roots on screen)
        const rootA = ss(0.01, 0.14, sp) * (1 - ss(0.82, 0.92, sp));
        if (rootA > 0.01) {
          const n = N_FOR_CH[chIdx];
          const [hueOffset] = CH_PAL_N[chIdx];
          const extent = lerp(1.92, 1.42, ss(0.1, 0.9, sp * 4 - chIdx));
          const theta = sp * Math.PI * 0.5;
          const cosT = Math.cos(theta), sinT = Math.sin(theta);
          for (let k = 0; k < n; k++) {
            // Inverse-rotate root position to account for viewport rotation
            const rx = Math.cos(2*Math.PI*k/n), ry = Math.sin(2*Math.PI*k/n);
            const prx = rx * cosT + ry * sinT;
            const pry = -rx * sinT + ry * cosT;
            const sx = (prx + extent) / (2*extent) * W;
            const sy = (pry + extent) / (2*extent) * H;
            const hue = ((k/n) + hueOffset) % 1.0;
            const [rr,gg,bb] = hsvToRgb(hue, 0.8, 0.9);
            dc.beginPath();
            dc.arc(sx, sy, 5, 0, Math.PI*2);
            dc.strokeStyle = `rgba(${rr},${gg},${bb},${(rootA * 0.8).toFixed(2)})`;
            dc.lineWidth = 1.2;
            dc.stroke();
            dc.beginPath();
            dc.arc(sx, sy, 2, 0, Math.PI*2);
            dc.fillStyle = `rgba(${rr},${gg},${bb},${(rootA * 0.9).toFixed(2)})`;
            dc.fill();
          }
        }

        // n and extent readout
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          const n = N_FOR_CH[chIdx];
          const [hueOffset] = CH_PAL_N[chIdx];
          const [r0,g0,b0] = hsvToRgb(hueOffset, 0.7, 0.85);
          p.noStroke();
          p.fill(r0, g0, b0, Math.round(hudA * 55));
          p.textSize(7);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`z^${n} − 1`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`CH${chIdx+1} · NEWTON FRACTAL`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${n} ROOTS · ${MAX_ITER} ITER`, W*0.982, H*0.982);
        }

        // Text overlays
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS_N[i];
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
export function NewtonLab() {
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

  const chips = ["#1c1e30","#0e2010","#20082e","#141416"];
  const texts = ["#7090d0","#58c868","#c070e8","#989898"];

  const base: React.CSSProperties = {
    position:"fixed", opacity:0, pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10, maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh", background:"#030308"}}>
      <div ref={containerRef} style={{position:"fixed", inset:0, zIndex:1}}/>
      {SECTIONS_N.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS_N[i];
        return (
          <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{...base, ...positions[i]}}>
            <span style={{
              display:"block", fontSize:"0.55rem", letterSpacing:"0.38em",
              color:chips[chIdx], textTransform:"uppercase", marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES_N[chIdx]}`}</span>
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
