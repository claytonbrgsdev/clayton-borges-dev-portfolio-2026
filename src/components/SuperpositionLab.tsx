"use client";

import { useEffect, useRef } from "react";

// ── Grid ──────────────────────────────────────────────────────────────────────
const NX = 192, NY = 128;
const DT = 0.058;
const STEPS_PER_FRAME = 9;
const SRC_X = 4;
const SRC_K = 1.45;       // wave momentum → group velocity
const SRC_AMP = 0.22;
const SRC_W = NY * 0.38;  // Gaussian beam half-width

// ── Slit configs ─────────────────────────────────────────────────────────────
interface Slit { y0: number; y1: number; }
interface SlitConfig { bx: number; slits: Slit[]; }

const CONFIGS: SlitConfig[] = [
  { bx: 0.56, slits: [{ y0: 0.42, y1: 0.58 }] },                                          // single
  { bx: 0.56, slits: [{ y0: 0.33, y1: 0.43 }, { y0: 0.57, y1: 0.67 }] },                // double
  { bx: 0.56, slits: [{ y0: 0.23, y1: 0.31 }, { y0: 0.46, y1: 0.54 }, { y0: 0.69, y1: 0.77 }] }, // triple
];

// ── Chapter text ─────────────────────────────────────────────────────────────
const CHAPTERS = [
  { i0: 0.02, i1: 0.10, o0: 0.26, o1: 0.33, code: "01 / DIFFRACTION",
    body: "A Gaussian wave packet passes through a single aperture. The slit's finite width encodes itself as a spreading envelope — the narrower the gap, the wider the diffraction." },
  { i0: 0.35, i1: 0.43, o0: 0.59, o1: 0.66, code: "02 / INTERFERENCE",
    body: "Two apertures. Wavefronts from each slit superpose — amplifying where they arrive in phase, canceling where they arrive out of phase. The same particle passes through both slits at once." },
  { i0: 0.68, i1: 0.76, o0: 0.91, o1: 0.99, code: "03 / COMPLEXITY",
    body: "Three apertures. A second periodicity enters the pattern. Each additional slit sharpens the principal maxima. Add enough, narrow the spacing — geometric optics emerges from the interference limit." },
];

// ── Math helpers ─────────────────────────────────────────────────────────────
function ss(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}
function secAlpha(sp: number, i0: number, i1: number, o0: number, o1: number): number {
  return ss(i0, i1, sp) * (1 - ss(o0, o1, sp));
}

// HSV (h∈[0,360], s/v∈[0,1]) → [r,g,b] ∈[0,255]
function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const m = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i];
  return [Math.round(m[0]*255), Math.round(m[1]*255), Math.round(m[2]*255)];
}

// ── Barrier ───────────────────────────────────────────────────────────────────
function makeBarrier(cfg: SlitConfig): Uint8Array {
  const b = new Uint8Array(NY * NX);
  const bx0 = Math.floor(cfg.bx * NX);
  const bx1 = bx0 + 2;
  for (let y = 0; y < NY; y++) {
    const fy = y / NY;
    const open = cfg.slits.some(s => fy >= s.y0 && fy < s.y1);
    if (!open) {
      for (let x = bx0; x <= bx1; x++) b[y * NX + x] = 1;
    }
  }
  return b;
}

// ── Absorbing boundary mask (PML-lite) ────────────────────────────────────────
function makeAbsorb(): Float32Array {
  const mask = new Float32Array(NX * NY).fill(1);
  const depth = 18;
  for (let y = 0; y < NY; y++) {
    for (let x = 0; x < NX; x++) {
      // Absorb top, bottom, right — NOT left (source is there)
      const dy = Math.min(y, NY - 1 - y);
      const dx_r = NX - 1 - x;
      const d = Math.min(dy, dx_r);
      if (d < depth) {
        const t = 1 - d / depth;
        mask[y * NX + x] = Math.exp(-0.07 * t * t);
      }
    }
  }
  return mask;
}

// ── Schrödinger leapfrog step ─────────────────────────────────────────────────
function step(
  psiR: Float32Array, psiI: Float32Array,
  barrier: Uint8Array, absorb: Float32Array,
) {
  // Half-step I using old R
  for (let y = 1; y < NY - 1; y++) {
    for (let x = 1; x < NX - 1; x++) {
      const idx = y * NX + x;
      if (barrier[idx]) continue;
      const lapR = psiR[idx - NX] + psiR[idx + NX] + psiR[idx - 1] + psiR[idx + 1] - 4 * psiR[idx];
      psiI[idx] += DT * lapR;
    }
  }
  // Half-step R using new I
  for (let y = 1; y < NY - 1; y++) {
    for (let x = 1; x < NX - 1; x++) {
      const idx = y * NX + x;
      if (barrier[idx]) continue;
      const lapI = psiI[idx - NX] + psiI[idx + NX] + psiI[idx - 1] + psiI[idx + 1] - 4 * psiI[idx];
      psiR[idx] -= DT * lapI;
    }
  }
  // Enforce barrier & boundaries
  for (let y = 0; y < NY; y++) {
    psiR[y * NX] = 0; psiI[y * NX] = 0;
    psiR[y * NX + NX - 1] = 0; psiI[y * NX + NX - 1] = 0;
  }
  for (let x = 0; x < NX; x++) {
    psiR[x] = 0; psiI[x] = 0;
    psiR[(NY - 1) * NX + x] = 0; psiI[(NY - 1) * NX + x] = 0;
  }
  for (let i = 0; i < NX * NY; i++) {
    if (barrier[i]) { psiR[i] = 0; psiI[i] = 0; }
    else { psiR[i] *= absorb[i]; psiI[i] *= absorb[i]; }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SuperpositionLab() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const offRef      = useRef<HTMLCanvasElement>(null);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);
  const formulaRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const off    = offRef.current;
    if (!canvas || !off) return;

    // Canvas sizing
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx    = canvas.getContext("2d")!;
    const offCtx = off.getContext("2d")!;

    // Simulation state
    const psiR   = new Float32Array(NX * NY);
    const psiI   = new Float32Array(NX * NY);
    const absorb = makeAbsorb();
    let barrier  = makeBarrier(CONFIGS[0]);
    let chapter  = 0;
    let simTime  = 0;
    let peakProb = 0.001;

    // Scroll → chapter detection
    const onScroll = () => {
      const sp = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const newCh = sp < 0.33 ? 0 : sp < 0.66 ? 1 : 2;
      if (newCh !== chapter) {
        chapter = newCh;
        barrier = makeBarrier(CONFIGS[chapter]);
        psiR.fill(0); psiI.fill(0);
        peakProb = 0.001;
      }

      // Text overlays
      for (let i = 0; i < CHAPTERS.length; i++) {
        const ch = CHAPTERS[i];
        const a = secAlpha(sp, ch.i0, ch.i1, ch.o0, ch.o1);
        const el = overlayRefs.current[i];
        if (el) { el.style.opacity = a.toFixed(3); el.style.pointerEvents = a > 0.05 ? "auto" : "none"; }
      }

      // Formula visibility: inverse of any chapter text
      if (formulaRef.current) {
        const anyVis = CHAPTERS.some((ch, i) => {
          const a = secAlpha(sp, ch.i0, ch.i1, ch.o0, ch.o1);
          return a > 0.05;
        });
        formulaRef.current.style.opacity = (anyVis ? 0.1 : 0.22).toFixed(2);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Render loop
    let raf: number;
    const imgData = offCtx.createImageData(NX, NY);
    const d = imgData.data;

    const render = () => {
      // Physics steps
      for (let s = 0; s < STEPS_PER_FRAME; s++) {
        // Inject source (hard source at SRC_X)
        const phase = SRC_K * simTime;
        for (let y = 2; y < NY - 2; y++) {
          const dy = y - NY * 0.5;
          const amp = SRC_AMP * Math.exp(-(dy * dy) / (2 * SRC_W * SRC_W));
          const idx = y * NX + SRC_X;
          psiR[idx] = amp * Math.cos(phase);
          psiI[idx] = amp * Math.sin(phase);
        }
        step(psiR, psiI, barrier, absorb);
        simTime += DT;
      }

      // Compute normalization (rolling peak)
      let maxP = 0;
      for (let i = 0; i < NX * NY; i++) {
        const p = psiR[i] * psiR[i] + psiI[i] * psiI[i];
        if (p > maxP) maxP = p;
      }
      peakProb = peakProb * 0.96 + maxP * 0.04;
      const norm = 0.92 / Math.max(peakProb, 0.0001);

      // Render to ImageData
      for (let y = 0; y < NY; y++) {
        for (let x = 0; x < NX; x++) {
          const idx  = y * NX + x;
          const pidx = idx * 4;
          if (barrier[idx]) {
            d[pidx] = 22; d[pidx+1] = 22; d[pidx+2] = 26; d[pidx+3] = 255;
          } else {
            const r = psiR[idx], im = psiI[idx];
            const prob  = r * r + im * im;
            const phase = Math.atan2(im, r);
            const hue   = ((phase / Math.PI) * 180 + 360) % 360;
            const val   = Math.min(1, prob * norm);
            const [pr, pg, pb] = hsv2rgb(hue, 0.82, val);
            d[pidx] = pr; d[pidx+1] = pg; d[pidx+2] = pb; d[pidx+3] = 255;
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ minHeight: "350vh", background: "#000" }}>
      {/* Fixed canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      {/* Offscreen simulation canvas */}
      <canvas ref={offRef} width={NX} height={NY} style={{ display: "none" }} />

      {/* Chapter text overlays */}
      {CHAPTERS.map((ch, i) => (
        <div
          key={i}
          ref={(el) => { overlayRefs.current[i] = el; }}
          style={{
            position: "fixed",
            bottom: 64,
            left: 48,
            maxWidth: 460,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.6s ease",
          }}
        >
          <span style={{
            fontFamily: "var(--font-geist-mono, monospace)",
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 10,
          }}>
            {ch.code}
          </span>
          <p style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.75,
            margin: 0,
          }}>
            {ch.body}
          </p>
        </div>
      ))}

      {/* Formula */}
      <div
        ref={formulaRef}
        style={{
          position: "fixed",
          top: 24,
          right: 28,
          fontFamily: "var(--font-geist-mono, monospace)",
          fontSize: 11,
          color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.04em",
          pointerEvents: "none",
          transition: "opacity 0.4s",
        }}
      >
        iħ ∂ψ/∂t = −ħ²/2m ∇²ψ
      </div>

      {/* Phase code */}
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 28,
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: 9,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.2)",
        textTransform: "uppercase",
        pointerEvents: "none",
      }}>
        LAB-26 / SUPERPOSITION
      </div>

      {/* Back link */}
      <a
        href="/"
        style={{
          position: "fixed",
          top: 24,
          left: 28,
          fontFamily: "var(--font-geist-mono, monospace)",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          textDecoration: "none",
          zIndex: 10,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.28)"; }}
      >
        ← BACK
      </a>
    </div>
  );
}
