"use client";
import { useEffect, useRef } from "react";
import type React from "react";

const PI = Math.PI;
const TAU = PI * 2;

const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));
const applyOverlay = (el: HTMLElement | null, alpha: number) => {
  if (!el) return;
  el.style.opacity = alpha.toFixed(3);
  el.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
};

// stable seeded pseudo-random
const sr = (seed: number) => {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
};

// ── Polar form functions ────────────────────────────────────────────────────

// Act 1: SEED — barely breathing sphere
const rSeed = (θ: number, t: number) =>
  1 + 0.018 * Math.sin(6 * θ + t * 0.55) + 0.010 * Math.sin(10 * θ - t * 0.38);

// Act 2: GROWTH — organic blob expansion
const rGrowth = (θ: number, t: number) =>
  1 + 0.32 * Math.sin(3 * θ + t * 0.38) + 0.20 * Math.sin(7 * θ - t * 0.27) +
  0.12 * Math.sin(2 * θ + t * 0.57) + 0.08 * Math.sin(11 * θ + t * 0.17);

// Act 3: FRACTURE — asymmetric spiked pressure form
const rFracture = (θ: number, t: number) =>
  1 + 0.38 * Math.cos(5 * θ + t * 0.019) + 0.24 * Math.cos(9 * θ - t * 0.026) +
  0.16 * Math.pow(Math.max(0, Math.cos(4 * θ + t * 0.013)), 3);

// Act 4: APOTHEOSIS — radiant multi-harmonic star
const rApotheosis = (θ: number, t: number) =>
  1 + 0.44 * Math.cos(6 * θ + t * 0.016) + 0.28 * Math.cos(12 * θ - t * 0.021) +
  0.16 * Math.cos(18 * θ + t * 0.010) + 0.10 * Math.cos(3 * θ - t * 0.035);

const blendR = (θ: number, t: number, sp: number) => {
  const t12 = ss(0.20, 0.33, sp);
  const t23 = ss(0.48, 0.62, sp);
  const t34 = ss(0.74, 0.87, sp);
  let r = rSeed(θ, t);
  r += (rGrowth(θ, t) - r) * t12;
  r += (rFracture(θ, t) - r) * t23;
  r += (rApotheosis(θ, t) - r) * t34;
  return r;
};

// scale spike at each morph boundary — punctuation of transformation
const morphScale = (sp: number) => {
  const spike = (c: number, w: number) => { const d = Math.abs(sp - c) / w; return d < 1 ? 1 - d * d : 0; };
  return 1 + 0.21 * spike(0.265, 0.033) + 0.19 * spike(0.550, 0.031) + 0.23 * spike(0.805, 0.033);
};

// ── Vein tree (built once at module level, stable across renders) ────────────

type VNode = { ax: number; ay: number; depth: number; pi: number };
type VEdge = { from: number; to: number; phase: number };

const buildVeins = (): [VNode[], VEdge[]] => {
  const nodes: VNode[] = [{ ax: 0, ay: 0, depth: 0, pi: -1 }];
  const edges: VEdge[] = [];
  const queue = [0];

  while (queue.length && nodes.length < 88) {
    const pi = queue.shift()!;
    const p = nodes[pi];
    if (p.depth > 4) continue;
    const nKids = 2 + Math.floor(sr(pi * 7.3 + edges.length) * 2);
    const baseAngle =
      p.pi < 0 ? 0 : Math.atan2(p.ay - nodes[p.pi].ay, p.ax - nodes[p.pi].ax);
    for (let c = 0; c < nKids && nodes.length < 88; c++) {
      const spread = p.depth === 0 ? TAU : PI * 0.65;
      const angle = baseAngle + (c / nKids - 0.5) * spread + (sr(pi * c * 3.1) - 0.5) * 0.25;
      const dist = (0.20 + 0.10 * sr(pi * c * 11)) * (1 - p.depth * 0.10);
      const ax = p.ax + Math.cos(angle) * dist;
      const ay = p.ay + Math.sin(angle) * dist;
      if (Math.sqrt(ax * ax + ay * ay) > 1.06) continue;
      const ci = nodes.length;
      nodes.push({ ax, ay, depth: p.depth + 1, pi });
      edges.push({ from: pi, to: ci, phase: sr(edges.length * 5.7) * TAU });
      queue.push(ci);
    }
  }
  return [nodes, edges];
};

const [VEIN_NODES, VEIN_EDGES] = buildVeins();

// ── Component ───────────────────────────────────────────────────────────────

export function DepthLab() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);
  const s4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const scroll = scrollRef.current;
    if (!canvas || !scroll) return;

    const ctx = canvas.getContext("2d")!;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      const cvs = canvasRef.current as HTMLCanvasElement;
      w = window.innerWidth;
      h = window.innerHeight;
      cvs.width = w * DPR;
      cvs.height = h * DPR;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let t = 0;

    const buildFormPath = (cx: number, cy: number, R: number, rot: number, sp: number) => {
      const N = 320;
      const p = new Path2D();
      for (let i = 0; i < N; i++) {
        const θ = (i / N) * TAU + rot;
        const radius = blendR(θ, t, sp) * R;
        const x = cx + Math.cos(θ) * radius;
        const y = cy + Math.sin(θ) * radius;
        i === 0 ? p.moveTo(x, y) : p.lineTo(x, y);
      }
      p.closePath();
      return p;
    };

    const draw = () => {
      const sp = Math.max(0, Math.min(1, window.scrollY / (scroll.scrollHeight - h)));
      t += 0.016;

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.42;
      const rot = t * 0.016 + sp * PI * 0.55;
      const R = baseR * morphScale(sp);

      const seedPhase     = 1 - ss(0.15, 0.32, sp);
      const growthPhase   = ss(0.18, 0.42, sp) * (1 - ss(0.56, 0.70, sp));
      const fracturePhase = ss(0.53, 0.69, sp) * (1 - ss(0.80, 0.93, sp));
      const apotheosis    = ss(0.80, 1.00, sp);

      // ── Background ──────────────────────────────────────────────────────
      ctx.fillStyle = "#050310";
      ctx.fillRect(0, 0, w, h);

      // deep ambient radiance centered on form
      const ambAlpha = 0.022 + 0.05 * growthPhase + 0.11 * fracturePhase + 0.20 * apotheosis;
      const amb = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.6);
      amb.addColorStop(0, `rgba(72,25,165,${ambAlpha})`);
      amb.addColorStop(0.5, `rgba(36,10,92,${ambAlpha * 0.38})`);
      amb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, w, h);

      // ── Build form path (reused for clip + outline) ──────────────────────
      const formPath = buildFormPath(cx, cy, R, rot, sp);

      // ── Interior: fill + vein network ───────────────────────────────────
      ctx.save();
      ctx.clip(formPath);

      // dark fill with inner luminescence
      const innerLum = 0.05 + 0.08 * growthPhase + 0.24 * fracturePhase + 0.34 * apotheosis;
      const fillG = ctx.createRadialGradient(cx, cy * 0.91, 0, cx, cy, R * 1.12);
      fillG.addColorStop(0, `rgba(58,20,145,${innerLum})`);
      fillG.addColorStop(0.30, `rgba(18,7,55,${0.52 + 0.24 * seedPhase})`);
      fillG.addColorStop(0.75, `rgba(8,3,25,0.90)`);
      fillG.addColorStop(1, "rgba(3,1,10,1)");
      ctx.fillStyle = fillG;
      ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);

      // vein tree reveals progressively by depth
      const veinP = ss(0.14, 0.54, sp);
      if (veinP > 0.01) {
        const maxD = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const e of VEIN_EDGES) {
          const fn = VEIN_NODES[e.from];
          const tn = VEIN_NODES[e.to];
          const edgeProgress = tn.depth / maxD;
          const eA = ss(edgeProgress * 0.28, edgeProgress * 0.28 + 0.14, veinP);
          if (eA < 0.01) continue;

          const x1 = cx + fn.ax * R;
          const y1 = cy + fn.ay * R;
          const x2 = cx + tn.ax * R;
          const y2 = cy + tn.ay * R;

          const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + e.phase);
          const bright = eA * (0.4 + 0.6 * pulse) * (1 + fracturePhase * 0.95 + apotheosis * 1.7);
          const vw = (2.9 - tn.depth * 0.45) * (0.5 + 0.5 * (fracturePhase + apotheosis));

          // outer glow
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(68,32,195,${bright * 0.40})`; ctx.lineWidth = vw * 3.8; ctx.stroke();
          // vein body
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(118,68,248,${bright * 0.78})`; ctx.lineWidth = vw; ctx.stroke();
          // bright core
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(208,178,255,${bright * 0.52})`; ctx.lineWidth = vw * 0.20; ctx.stroke();
        }

        // node glow dots
        for (let i = 0; i < VEIN_NODES.length; i++) {
          const n = VEIN_NODES[i];
          const eA = ss((n.depth / maxD) * 0.28, (n.depth / maxD) * 0.28 + 0.14, veinP);
          if (eA < 0.01) continue;
          const nx = cx + n.ax * R;
          const ny = cy + n.ay * R;
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.15 + sr(i * 7.3) * TAU);
          const nr = (3.8 - n.depth * 0.52) * (0.65 + 0.35 * pulse) * (1 + apotheosis * 0.75);
          const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 5);
          ng.addColorStop(0, `rgba(228,198,255,${eA * (0.55 + 0.45 * pulse)})`);
          ng.addColorStop(0.38, `rgba(112,55,242,${eA * 0.40})`);
          ng.addColorStop(1, "rgba(52,14,138,0)");
          ctx.fillStyle = ng;
          ctx.beginPath(); ctx.arc(nx, ny, nr * 5, 0, TAU); ctx.fill();
        }
      }

      // limb darkening (inside same clip)
      const ldG = ctx.createRadialGradient(cx, cy, R * 0.48, cx, cy, R * 1.08);
      ldG.addColorStop(0, "rgba(0,0,0,0)");
      ldG.addColorStop(0.52, "rgba(0,0,0,0)");
      ldG.addColorStop(1, "rgba(0,0,0,0.84)");
      ctx.fillStyle = ldG;
      ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);

      ctx.restore(); // end form clip

      // ── Form outline — faint, pulses with fracture ────────────────────
      const outA = 0.04 + 0.08 * fracturePhase * (0.5 + 0.5 * Math.sin(t * 1.15));
      ctx.strokeStyle = `rgba(102,52,218,${outA})`;
      ctx.lineWidth = 1.1;
      ctx.stroke(formPath);

      // ── External pressure cracks ──────────────────────────────────────
      if (fracturePhase > 0.04) {
        const nC = Math.round(9 + fracturePhase * 12);
        for (let i = 0; i < nC; i++) {
          const θ = sr(i * 5.71) * TAU;
          const fR = blendR(θ, t, sp) * R;
          const tipLen = fR * (0.055 + 0.105 * fracturePhase);
          const x1 = cx + Math.cos(θ) * fR;
          const y1 = cy + Math.sin(θ) * fR;
          const bA = θ + (sr(i * 11.3) - 0.5) * 0.38;
          const x2 = cx + Math.cos(bA) * (fR + tipLen);
          const y2 = cy + Math.sin(bA) * (fR + tipLen);
          const cA = fracturePhase * 0.30 * (0.5 + 0.5 * Math.sin(t * 2.25 + i * 1.7));
          const cg = ctx.createLinearGradient(x1, y1, x2, y2);
          cg.addColorStop(0, `rgba(128,72,248,${cA})`);
          cg.addColorStop(1, "rgba(198,158,255,0)");
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = cg; ctx.lineWidth = 0.75; ctx.stroke();
        }
      }

      // ── Apotheosis — concentric radiance rings ────────────────────────
      if (apotheosis > 0.02) {
        for (let r = 0; r < 5; r++) {
          const rR = R * (1.055 + r * 0.175 + apotheosis * r * 0.085);
          const rA = apotheosis * Math.max(0, 0.095 - r * 0.016) * (1 + 0.45 * Math.sin(t * 0.72 + r * 0.8));
          ctx.beginPath(); ctx.arc(cx, cy, rR, 0, TAU);
          ctx.strokeStyle = `rgba(92,42,218,${rA})`;
          ctx.lineWidth = Math.max(0.2, 1.4 - r * 0.28); ctx.stroke();
        }
      }

      // ── Overlays ─────────────────────────────────────────────────────
      applyOverlay(s1Ref.current, secAlpha(sp, 0.07, 0.12, 0.19, 0.25));  // seed
      applyOverlay(s2Ref.current, secAlpha(sp, 0.31, 0.36, 0.45, 0.51));  // growth
      applyOverlay(s3Ref.current, secAlpha(sp, 0.59, 0.64, 0.73, 0.79));  // fracture
      applyOverlay(s4Ref.current, secAlpha(sp, 0.86, 0.90, 0.97, 1.00));  // apotheosis

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const sec: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none", transition: "none",
    zIndex: 10, fontFamily: "var(--font-mono, 'Courier New', monospace)", color: "#c2b2e2",
  };
  const lbl: React.CSSProperties = {
    fontSize: "0.64rem", letterSpacing: "0.26em", color: "#5e38b0",
    marginBottom: 10, display: "block",
  };

  return (
    <div ref={scrollRef} style={{ height: "900vh", background: "#050310" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {/* SEED phase — identity */}
      <div ref={s1Ref} style={{ ...sec, top: "11%", left: "7%" }}>
        <span style={lbl}>CLAYTON BORGES</span>
        <h2 style={{ fontSize: "clamp(2.2rem,5.5vw,4.5rem)", fontWeight: 700, lineHeight: 1.02, margin: 0 }}>
          Creative<br />Developer
        </h2>
      </div>

      {/* GROWTH phase — stack */}
      <div ref={s2Ref} style={{ ...sec, bottom: "13%", right: "7%", textAlign: "right" }}>
        <span style={lbl}>STACK</span>
        <p style={{ fontSize: "clamp(1rem,2.4vw,1.7rem)", lineHeight: 1.85, margin: 0 }}>
          React · Next.js<br />Three.js · GLSL<br />Motion · TypeScript
        </p>
      </div>

      {/* FRACTURE phase — work */}
      <div ref={s3Ref} style={{ ...sec, top: "50%", transform: "translateY(-50%)", left: "7%" }}>
        <span style={lbl}>SELECTED WORK</span>
        <p style={{ fontSize: "clamp(1rem,2.2vw,1.5rem)", lineHeight: 1.95, margin: 0 }}>
          DISCLAYMER Studio<br />Organic Interfaces<br />Generative Experiences
        </p>
      </div>

      {/* APOTHEOSIS — contact */}
      <div ref={s4Ref} style={{ ...sec, bottom: "11%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <span style={lbl}>GET IN TOUCH</span>
        <p style={{ fontSize: "clamp(0.9rem,1.9vw,1.3rem)", margin: 0 }}>
          claytonborgesdev@gmail.com
        </p>
      </div>
    </div>
  );
}
