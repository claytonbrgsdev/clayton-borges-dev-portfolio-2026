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
const sr = (seed: number) => {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
};

// ── Fourier harmonic construction ───────────────────────────────────────────
// The form is a circle + N harmonics. As scroll goes 0→0.5, harmonics enter
// one by one. From 0.5→1.0 they leave in reverse order. End = start = circle.

const N_HARM = 14;
// Each harmonic has a stable random phase and a slow drift rate
const HARM_PHASE = Array.from({ length: N_HARM + 1 }, (_, n) => sr(n * 3.71) * TAU);
const HARM_DRIFT = Array.from({ length: N_HARM + 1 }, (_, n) => (sr(n * 7.13) - 0.5) * 0.048);

function harmAmp(n: number, sp: number): number {
  // harmonics enter staggered on the way up, and higher harmonics fade FIRST on the way back
  const riseStart  = (n / N_HARM) * 0.44;
  const fallStart  = 0.64 + ((N_HARM - n) / N_HARM) * 0.08; // n=14 fades earliest
  return (
    ss(riseStart, riseStart + 0.09, sp) *
    (1 - ss(fallStart, fallStart + 0.13, sp)) *
    (0.62 / n)
  );
}

function rForm(θ: number, tau: number, sp: number): number {
  let r = 1.0;
  for (let n = 1; n <= N_HARM; n++) {
    r += harmAmp(n, sp) * Math.cos(n * θ + HARM_PHASE[n] + tau * HARM_DRIFT[n]);
  }
  return r;
}

// total summed complexity, 0 at sp=0 and sp=1, peaks near sp=0.5
function totalComplexity(sp: number): number {
  let c = 0;
  for (let n = 1; n <= N_HARM; n++) c += harmAmp(n, sp);
  return Math.min(1, c / 0.55);
}

// ── Component ────────────────────────────────────────────────────────────────

export function RecurLab() {
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
    let tau = 0;

    const makeFormPath = (
      cx: number, cy: number, R: number, rot: number,
      sp: number, tauOff: number, N = 320,
    ) => {
      const p = new Path2D();
      for (let i = 0; i < N; i++) {
        const θ = (i / N) * TAU + rot;
        const r = rForm(θ, tau + tauOff, sp) * R;
        const x = cx + Math.cos(θ) * r;
        const y = cy + Math.sin(θ) * r;
        i === 0 ? p.moveTo(x, y) : p.lineTo(x, y);
      }
      p.closePath();
      return p;
    };

    const draw = () => {
      const sp = Math.max(0, Math.min(1, window.scrollY / (scroll.scrollHeight - h)));
      tau += 0.016;

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.40;
      const rot = tau * 0.009; // slow drift

      const cplx    = totalComplexity(sp);
      const rising  = ss(0.04, 0.50, sp);   // used for accumulation feel
      const returning = ss(0.72, 1.00, sp); // the slow return to self

      const R = baseR * (1.0 + 0.065 * cplx + 0.022 * Math.sin(tau * 0.40));

      // ── Background ────────────────────────────────────────────────────
      ctx.fillStyle = "#070504";
      ctx.fillRect(0, 0, w, h);

      // warm ambient — breathes with complexity
      const hazeA = 0.014 + 0.048 * cplx + 0.025 * returning;
      const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 3.2);
      haze.addColorStop(0, `rgba(208,145,38,${hazeA})`);
      haze.addColorStop(0.48, `rgba(148,88,16,${hazeA * 0.28})`);
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);

      // ── The eternal circle — always present, most visible at start/end ──
      // It never disappears. It was always the form. It always will be.
      const circleAlpha = 0.055 + 0.10 * (1 - cplx) + 0.12 * returning;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, TAU);
      ctx.strokeStyle = `rgba(208,158,52,${circleAlpha})`;
      ctx.lineWidth = 0.85 + returning * 1.2;
      ctx.stroke();

      // ── Ghost echoes: the form as it was 3, 6, 9 seconds ago ──────────
      // Shows the path taken — "the more things change"
      const ghostFade = cplx * (1 - returning * 0.8);
      if (ghostFade > 0.02) {
        for (let g = 3; g >= 1; g--) {
          const gPath = makeFormPath(cx, cy, R * (1 - g * 0.012), rot, sp, -(g * 3.8), 256);
          ctx.strokeStyle = `rgba(200,150,44,${ghostFade * (0.13 - g * 0.03)})`;
          ctx.lineWidth = 0.55;
          ctx.stroke(gPath);
        }
      }

      // ── Main form ─────────────────────────────────────────────────────
      const formPath = makeFormPath(cx, cy, R, rot, sp, 0);

      ctx.save();
      ctx.clip(formPath);

      // fill: warm amber core, deep at rim
      const warmth = 0.09 + 0.22 * cplx + 0.18 * returning;
      const fillG = ctx.createRadialGradient(cx - R * 0.12, cy - R * 0.18, 0, cx, cy, R * 1.14);
      fillG.addColorStop(0,    `rgba(218,162,54,${warmth})`);
      fillG.addColorStop(0.22, `rgba(148,95,22,${warmth * 0.52})`);
      fillG.addColorStop(0.65, `rgba(44,22,6,0.82)`);
      fillG.addColorStop(1,    "rgba(8,4,1,1)");
      ctx.fillStyle = fillG;
      ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);

      // ── Harmonic structure lines ──────────────────────────────────────
      // radial lines that show the Fourier decomposition building inside the form
      if (cplx > 0.06) {
        const nLines = Math.round(cplx * 34);
        for (let l = 0; l < nLines; l++) {
          const angle = (l / nLines) * TAU;
          const surfR = rForm(angle, tau, sp) * R;
          const x1 = cx + Math.cos(angle) * surfR * 0.08;
          const y1 = cy + Math.sin(angle) * surfR * 0.08;
          const x2 = cx + Math.cos(angle) * surfR * 0.88;
          const y2 = cy + Math.sin(angle) * surfR * 0.88;
          const lineA = cplx * 0.115 * (0.45 + 0.55 * Math.sin(tau * 0.82 + l * 0.65));
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(220,165,55,${lineA})`;
          ctx.lineWidth = 0.42;
          ctx.stroke();
        }
      }

      // limb darkening
      const ldG = ctx.createRadialGradient(cx, cy, R * 0.44, cx, cy, R * 1.07);
      ldG.addColorStop(0,    "rgba(0,0,0,0)");
      ldG.addColorStop(0.50, "rgba(0,0,0,0)");
      ldG.addColorStop(1,    "rgba(0,0,0,0.86)");
      ctx.fillStyle = ldG;
      ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);

      ctx.restore(); // end form clip

      // ── Form outline ──────────────────────────────────────────────────
      ctx.strokeStyle = `rgba(214,162,52,${0.10 + cplx * 0.50 + returning * 0.25})`;
      ctx.lineWidth = 0.75 + cplx * 1.0 + returning * 0.6;
      ctx.stroke(formPath);

      // ── Dissipation ripples — visible only during the return ──────────
      // as harmonics leave, they radiate outward like ripples
      if (returning > 0.05) {
        const nRipples = 4;
        for (let r = 0; r < nRipples; r++) {
          // each ripple expands at different speed, staggered
          const phase = (tau * (0.28 + r * 0.08) + r * 1.4) % 1.0;
          const rR = baseR * (1.02 + phase * 0.55);
          const rA = returning * Math.max(0, (0.07 - r * 0.012)) * (1 - phase);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, TAU);
          ctx.strokeStyle = `rgba(200,150,45,${rA})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // ── Overlays ──────────────────────────────────────────────────────
      applyOverlay(s1Ref.current, secAlpha(sp, 0.06, 0.11, 0.18, 0.23));  // circle: identity
      applyOverlay(s2Ref.current, secAlpha(sp, 0.29, 0.34, 0.44, 0.50));  // growth: stack
      applyOverlay(s3Ref.current, secAlpha(sp, 0.55, 0.60, 0.69, 0.75));  // peak: work
      applyOverlay(s4Ref.current, secAlpha(sp, 0.85, 0.89, 0.96, 1.00));  // return: contact

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const sec: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none", transition: "none",
    zIndex: 10, fontFamily: "var(--font-mono, 'Courier New', monospace)", color: "#dece98",
  };
  const lbl: React.CSSProperties = {
    fontSize: "0.64rem", letterSpacing: "0.26em", color: "#896420",
    marginBottom: 10, display: "block",
  };

  return (
    <div ref={scrollRef} style={{ height: "900vh", background: "#070504" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {/* CIRCLE — identity */}
      <div ref={s1Ref} style={{ ...sec, top: "11%", left: "7%" }}>
        <span style={lbl}>CLAYTON BORGES</span>
        <h2 style={{ fontSize: "clamp(2.2rem,5.5vw,4.5rem)", fontWeight: 700, lineHeight: 1.02, margin: 0 }}>
          Creative<br />Developer
        </h2>
      </div>

      {/* ACCUMULATION — stack */}
      <div ref={s2Ref} style={{ ...sec, bottom: "13%", right: "7%", textAlign: "right" }}>
        <span style={lbl}>STACK</span>
        <p style={{ fontSize: "clamp(1rem,2.4vw,1.7rem)", lineHeight: 1.85, margin: 0 }}>
          React · Next.js<br />Three.js · GLSL<br />Motion · TypeScript
        </p>
      </div>

      {/* PEAK — work */}
      <div ref={s3Ref} style={{ ...sec, top: "50%", transform: "translateY(-50%)", left: "7%" }}>
        <span style={lbl}>SELECTED WORK</span>
        <p style={{ fontSize: "clamp(1rem,2.2vw,1.5rem)", lineHeight: 1.95, margin: 0 }}>
          DISCLAYMER Studio<br />Organic Interfaces<br />Generative Experiences
        </p>
      </div>

      {/* RETURN — contact */}
      <div ref={s4Ref} style={{ ...sec, bottom: "11%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <span style={lbl}>GET IN TOUCH</span>
        <p style={{ fontSize: "clamp(0.9rem,1.9vw,1.3rem)", margin: 0 }}>
          claytonborgesdev@gmail.com
        </p>
      </div>
    </div>
  );
}
