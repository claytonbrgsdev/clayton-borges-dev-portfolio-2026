"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x = Math.max(0, Math.min(1, (t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a + (b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp) * (1-ss(o0,o1,sp));

// ── DLA simulation constants ──────────────────────────────────────────────────
const W_SIM    = 300;
const H_SIM    = 200;
const N_SIM    = W_SIM * H_SIM;
const NWALKERS = 64;

// 5 seed positions — quincunx (centre + four corners of inner rectangle)
const SEEDS: [number, number][] = [
  [150, 100],
  [ 68,  48],
  [232,  48],
  [ 68, 152],
  [232, 152],
];

// Mineral crystal colours (muted earth tones — no Bauhaus primaries)
const AGG_RGB: [number, number, number][] = [
  [220, 212, 202],  // warm silver   (centre)
  [212, 174, 110],  // amber         (TL)
  [ 88, 158, 148],  // verdigris     (TR)
  [190, 138, 112],  // terracotta    (BL)
  [154, 148, 194],  // pale violet   (BR)
];

// Deep dark background
const BG_R = 10, BG_G = 8, BG_B = 12;

// ── Section windows ───────────────────────────────────────────────────────────
const SECTIONS = [
  [1, "I",   0.000, 0.018, 0.065, 0.083],
  [1, "II",  0.083, 0.101, 0.149, 0.167],
  [1, "III", 0.167, 0.185, 0.232, 0.250],
  [2, "I",   0.250, 0.268, 0.315, 0.333],
  [2, "II",  0.333, 0.351, 0.399, 0.417],
  [2, "III", 0.417, 0.435, 0.482, 0.500],
  [3, "I",   0.500, 0.518, 0.565, 0.583],
  [3, "II",  0.583, 0.601, 0.649, 0.667],
  [3, "III", 0.667, 0.685, 0.732, 0.750],
  [4, "I",   0.750, 0.768, 0.815, 0.833],
  [4, "II",  0.833, 0.851, 0.899, 0.917],
  [4, "III", 0.917, 0.935, 0.982, 1.000],
] as const;

const CH_NAMES = ["NUCLEATION", "PROPAGATION", "COMPETITION", "EQUILIBRIUM"];

const HEADINGS: [string, string][] = [
  ["NUCLEUS",      "the first fixed point"],
  ["EACH STEP",    "was the only step possible"],
  ["BRANCH",       "because the space allowed it"],
  ["PROPAGATE",    "along paths of least resistance"],
  ["THE RANDOM",   "produced the inevitable"],
  ["FRACTAL",      "of frozen decisions"],
  ["DOMAIN",       "expands until it meets another"],
  ["BOUNDARY",     "where two crystals stopped"],
  ["GRAIN",        "structure of a million choices"],
  ["EQUILIBRIUM",  "the machine at rest"],
  ["THE FORM",     "was never designed"],
  ["COMPLEXITY",   "from simplicity alone"],
];

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    // 0 = empty, 1-5 = aggregate index
    const occupied   = new Uint8Array(N_SIM);
    // tip-glow brightness: 255 = just stuck, decays to 40 minimum
    const brightness = new Uint8ClampedArray(N_SIM);
    // Walker positions (integer, stored as floats for uniformity)
    const wx = new Float32Array(NWALKERS);
    const wy = new Float32Array(NWALKERS);
    let stuckTotal = 0;
    let frames = 0;

    // Plant seeds (3×3 blobs)
    for (let s = 0; s < SEEDS.length; s++) {
      const [sx, sy] = SEEDS[s];
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const idx = (sy + dy) * W_SIM + (sx + dx);
          if (idx >= 0 && idx < N_SIM) { occupied[idx] = s + 1; brightness[idx] = 180; stuckTotal++; }
        }
      }
    }

    // Spawn a walker at a random unoccupied position
    function spawnWalker(wi: number) {
      let x = 0, y = 0, tries = 0;
      do {
        x = Math.floor(Math.random() * W_SIM);
        y = Math.floor(Math.random() * H_SIM);
        tries++;
      } while (occupied[y * W_SIM + x] > 0 && tries < 30);
      wx[wi] = x; wy[wi] = y;
    }

    // Initial walker positions
    for (let w = 0; w < NWALKERS; w++) spawnWalker(w);

    const sketch = (p: p5Type) => {
      let W = 0, H = 0;
      let offscreen: HTMLCanvasElement;
      let offCtx: CanvasRenderingContext2D;
      let imgData: ImageData;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(1);
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.background(BG_R, BG_G, BG_B);
        offscreen      = document.createElement("canvas");
        offscreen.width  = W_SIM;
        offscreen.height = H_SIM;
        offCtx   = offscreen.getContext("2d") as CanvasRenderingContext2D;
        imgData  = offCtx.createImageData(W_SIM, H_SIM);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        p.resizeCanvas(W, H);
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
        ));

        // ── DLA simulation steps ───────────────────────────────────────
        const steps = Math.round(lerp(5, 55, sp));
        for (let step = 0; step < steps; step++) {
          for (let wi = 0; wi < NWALKERS; wi++) {
            const x = wx[wi] | 0, y = wy[wi] | 0;
            const dir = (Math.random() * 4) | 0;
            let nx = x, ny = y;
            if      (dir === 0) nx = (x + 1) % W_SIM;
            else if (dir === 1) nx = (x - 1 + W_SIM) % W_SIM;
            else if (dir === 2) ny = (y + 1) % H_SIM;
            else                ny = (y - 1 + H_SIM) % H_SIM;

            const nidx = ny * W_SIM + nx;
            if (occupied[nidx] > 0) {
              // Stick at current position, inherit aggregate from neighbour
              const idx = y * W_SIM + x;
              if (!occupied[idx]) { // guard — don't overwrite
                occupied[idx]   = occupied[nidx];
                brightness[idx] = 255;
                stuckTotal++;
              }
              spawnWalker(wi);
            } else {
              wx[wi] = nx; wy[wi] = ny;
            }
          }
        }

        // ── Brightness decay every 2 frames ───────────────────────────
        if (frames % 2 === 0) {
          for (let i = 0; i < N_SIM; i++) {
            if (brightness[i] > 42) brightness[i] = (brightness[i] - 3) as number;
          }
        }

        // ── Render simulation → offscreen ──────────────────────────────
        {
          const d = imgData.data;
          // Grid line alpha: fades as crystals fill space
          const fillFrac = stuckTotal / N_SIM;
          const gridAlpha = Math.max(0, 0.14 - fillFrac * 0.55);

          for (let j = 0; j < H_SIM; j++) {
            for (let i = 0; i < W_SIM; i++) {
              const idx = j * W_SIM + i;
              const agg = occupied[idx];
              let r: number, g: number, b: number;

              if (agg === 0) {
                // Grid lines on background
                const onGrid = (i % 20 === 0 || j % 20 === 0) ? gridAlpha : 0;
                r = Math.round(BG_R + onGrid * 30);
                g = Math.round(BG_G + onGrid * 28);
                b = Math.round(BG_B + onGrid * 35);
              } else {
                const [cr, cg, cb] = AGG_RGB[agg - 1];
                const t = brightness[idx] / 255;
                // Tip glow: dim root → bright tip
                r = Math.round(lerp(cr * 0.22, cr, t));
                g = Math.round(lerp(cg * 0.22, cg, t));
                b = Math.round(lerp(cb * 0.22, cb, t));
              }

              const pi = idx * 4;
              d[pi] = r; d[pi+1] = g; d[pi+2] = b; d[pi+3] = 255;
            }
          }
          offCtx.putImageData(imgData, 0, 0);
          const dc = p.drawingContext as CanvasRenderingContext2D;
          dc.imageSmoothingEnabled = true;
          dc.imageSmoothingQuality = "high";
          dc.drawImage(offscreen, 0, 0, W, H);
        }

        // ── Walker visualisation (faint dots showing active particles) ──
        const walkerA = ss(0.02, 0.14, sp) * (1 - ss(0.85, 0.95, sp));
        if (walkerA > 0.01) {
          const scaleX = W / W_SIM, scaleY = H / H_SIM;
          p.noStroke(); p.fill(255, 255, 255, Math.round(walkerA * 28));
          for (let wi = 0; wi < NWALKERS; wi++) {
            const agg = occupied[(wy[wi]|0) * W_SIM + (wx[wi]|0)];
            if (agg > 0) continue; // skip walkers that are somehow on occupied cells
            p.ellipse(wx[wi] * scaleX, wy[wi] * scaleY, 2.2, 2.2);
          }
        }

        // ── HUD ───────────────────────────────────────────────────────
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke(); p.fill(255, 255, 255, Math.round(hudA * 72));
          p.textSize(7.5);
          p.textAlign(p.LEFT,  p.TOP);
          p.text(`CELLS ${stuckTotal.toLocaleString()} / ${N_SIM.toLocaleString()}`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT,  p.BOTTOM);
          p.text(`CH${Math.min(4,Math.floor(sp*4)+1)} · DLA`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`${(stuckTotal/N_SIM*100).toFixed(1)}% FILLED`, W*0.982, H*0.982);
        }

        // ── Text overlays ─────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS[i];
          const alpha = secAlpha(sp,i0,i1,o0,o1);
          const secEl = sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity = alpha.toFixed(3);
          secEl.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
        }

        frames++;
      };
    };

    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function FrostLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(12).fill(null));

  useEffect(() => {
    const container = containerRef.current;
    const scroll    = scrollRef.current;
    if (!container || !scroll) return;
    let inst: p5Type | null = null;
    let alive = true;
    buildSketch(container, scroll, sectionEls.current).then((p5inst) => {
      if (!alive) { p5inst.remove(); return; }
      inst = p5inst;
    });
    return () => { alive = false; inst?.remove(); };
  }, []);

  const positions: React.CSSProperties[] = [
    { top: "12%",    left:  "6%" },
    { bottom: "14%", right: "7%", textAlign: "right" },
    { top: "50%",    left:  "6%", transform: "translateY(-50%)" },
    { top: "12%",    right: "7%", textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    right: "7%", textAlign: "right", transform: "translateY(-50%)" },
    { top: "12%",    left:  "6%" },
    { bottom: "14%", right: "7%", textAlign: "right" },
    { top: "50%",    left:  "6%", transform: "translateY(-50%)" },
    { top: "12%",    right: "7%", textAlign: "right" },
    { bottom: "14%", left:  "6%" },
    { top: "50%",    left: "50%", textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  const chips = ["#8a7a5a", "#5a9a8a", "#9a6848", "#8a8a9a"];
  const texts = ["#e0d8c8", "#b8d8d0", "#e0c8b8", "#d0d0d8"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "28rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#0a080c" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS[i];
        return (
          <div key={i} ref={(el) => { sectionEls.current[i] = el; }} style={{ ...base, ...positions[i] }}>
            <span style={{
              display: "block", fontSize: "0.56rem", letterSpacing: "0.35em",
              color: chips[chIdx], textTransform: "uppercase", marginBottom: 10,
            }}>
              {`CH${chIdx + 1} · ${CH_NAMES[chIdx]}`}
            </span>
            <h2 style={{
              margin: 0, fontSize: "clamp(1.7rem,3.8vw,3.2rem)", fontWeight: 700,
              lineHeight: 1.05, letterSpacing: "-0.01em",
              textTransform: "uppercase", color: texts[chIdx],
            }}>
              {headline}
              <br />
              <span style={{
                fontWeight: 300, fontSize: "clamp(1.1rem,2.4vw,2.0rem)",
                letterSpacing: "0.08em", color: chips[chIdx], textTransform: "lowercase",
              }}>
                {sub}
              </span>
            </h2>
          </div>
        );
      })}
    </div>
  );
}
