"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const TAU  = Math.PI * 2;
const ss   = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── section windows (4 chapters × 3 sections = 12) ───────────────────────────
const SECTIONS = [
  [1, "I",    0.000, 0.018, 0.065, 0.083],
  [1, "II",   0.083, 0.101, 0.149, 0.167],
  [1, "III",  0.167, 0.185, 0.232, 0.250],
  [2, "I",    0.250, 0.268, 0.315, 0.333],
  [2, "II",   0.333, 0.351, 0.399, 0.417],
  [2, "III",  0.417, 0.435, 0.482, 0.500],
  [3, "I",    0.500, 0.518, 0.565, 0.583],
  [3, "II",   0.583, 0.601, 0.649, 0.667],
  [3, "III",  0.667, 0.685, 0.732, 0.750],
  [4, "I",    0.750, 0.768, 0.815, 0.833],
  [4, "II",   0.833, 0.851, 0.899, 0.917],
  [4, "III",  0.917, 0.935, 0.982, 1.000],
] as const;

const CHIP_LABELS = [
  "CH1 · INIT", "CH1 · SWEEP", "CH1 · SYNC",
  "CH2 · TRIG",  "CH2 · SWEEP", "CH2 · LOCK",
  "CH3 · BEAT",  "CH3 · WAVE",  "CH3 · HOLD",
  "CH4 · PHASE", "CH4 · SYNTH", "CH4 · FINAL",
];

// ── Lissajous parameter states ─────────────────────────────────────────────
// x(t) = A·sin(a·t + δ),  y(t) = B·sin(b·t)
// Fractional a/b during interpolation creates beautiful intermediate morphs
interface LState { a: number; b: number; d: number; }
const LSTATES: LState[] = [
  { a: 1, b: 1, d: 0.00 },  // diagonal line → ch1 entry
  { a: 1, b: 1, d: 1.57 },  // circle
  { a: 1, b: 2, d: 0.79 },  // figure-8
  { a: 2, b: 3, d: 0.52 },  // 2:3 knot
  { a: 3, b: 4, d: 0.40 },  // 3:4 dense figure
  { a: 5, b: 4, d: 0.63 },  // 5:4 — fracture point
  { a: 3, b: 2, d: 1.05 },  // 3:2 butterfly
  { a: 4, b: 3, d: 0.78 },  // 4:3 flower
  { a: 1, b: 1, d: 1.57 },  // return to circle
];

function lissa(sp: number): LState {
  const n   = LSTATES.length - 1;
  const raw = sp * n;
  const idx = Math.min(Math.floor(raw), n - 1);
  const frac = raw - idx;
  const t   = frac * frac * (3 - 2 * frac);  // smoothstep within pair
  const A   = LSTATES[idx], B = LSTATES[idx + 1];
  return { a: lerp(A.a, B.a, t), b: lerp(A.b, B.b, t), d: lerp(A.d, B.d, t) };
}

// ── phosphor color arc: green → cyan → amber → violet-white ─────────────────
function beamRGB(sp: number): [number, number, number] {
  const tC = ss(0.20, 0.36, sp);  // → cyan
  const tA = ss(0.46, 0.60, sp);  // → amber
  const tW = ss(0.73, 0.90, sp);  // → cold white
  return [
    Math.round(lerp(lerp(lerp(0,   20,  tC), 255, tA), 200, tW)),
    Math.round(lerp(lerp(lerp(255, 205, tC), 165, tA), 225, tW)),
    Math.round(lerp(lerp(lerp(100, 255, tC),   0, tA), 255, tW)),
  ];
}

// Very dark background that matches the phosphor theme
function bgRGB(sp: number): [number, number, number] {
  const tC = ss(0.20, 0.36, sp);
  const tA = ss(0.46, 0.60, sp);
  const tW = ss(0.73, 0.90, sp);
  return [
    Math.round(lerp(lerp(lerp(2,  3, tC), 10, tA),  6, tW)),
    Math.round(lerp(lerp(lerp(8,  5, tC),  5, tA),  6, tW)),
    Math.round(lerp(lerp(lerp(4, 12, tC),  2, tA), 12, tW)),
  ];
}

// ── sketch ────────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const sketch = (p: p5Type) => {
      let W = 0, H = 0, tau = 0;

      p.setup = () => {
        W = el.offsetWidth;
        H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.background(2, 8, 4);
      };

      p.windowResized = () => {
        W = el.offsetWidth;
        H = el.offsetHeight;
        p.resizeCanvas(W, H);
        p.background(2, 8, 4);
      };

      // Radial gradient glow — drawn directly on the 2D context
      const glowDot = (
        cx: number, cy: number, r: number,
        rr: number, gg: number, bb: number, alpha: number,
      ) => {
        const dc = p.drawingContext as CanvasRenderingContext2D;
        const g  = dc.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,    `rgba(${rr},${gg},${bb},${alpha.toFixed(3)})`);
        g.addColorStop(0.35, `rgba(${rr},${gg},${bb},${(alpha * 0.28).toFixed(3)})`);
        g.addColorStop(1,    `rgba(${rr},${gg},${bb},0)`);
        dc.save();
        dc.fillStyle = g;
        dc.beginPath();
        dc.arc(cx, cy, r, 0, TAU);
        dc.fill();
        dc.restore();
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / (scrollEl.scrollHeight - H)));

        // Beam speed: slow for simple figures, faster for complex ones
        tau += lerp(0.020, 0.058, sp);

        const [bR, bG, bB] = beamRGB(sp);
        const [bgR, bgG, bgB] = bgRGB(sp);

        // ── Phosphor persistence: fade canvas slightly toward bg color ──────
        // Lower alpha = longer trails (slower decay → richer figure at high sp)
        const decayA = lerp(0.048, 0.011, sp);
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.save();
        dc.fillStyle = `rgba(${bgR},${bgG},${bgB},${decayA.toFixed(4)})`;
        dc.fillRect(0, 0, W, H);
        dc.restore();

        // ── Figure parameters ─────────────────────────────────────────────
        const { a, b, d } = lissa(sp);
        const cx = W * 0.5;
        const cy = H * 0.5;
        const AX = W * lerp(0.36, 0.42, ss(0.3, 0.9, sp));
        const AY = H * lerp(0.38, 0.44, ss(0.3, 0.9, sp));

        // Harmonic secondaries (phase in during ch3 and ch4)
        const sec2W = ss(0.52, 0.70, sp);  // 2× harmonic
        const sec3W = ss(0.77, 0.92, sp);  // 3× harmonic

        // Chapter transition interference burst
        const noise = Math.max(
          ss(0.23, 0.25, sp) * (1 - ss(0.25, 0.30, sp)),
          ss(0.48, 0.50, sp) * (1 - ss(0.50, 0.55, sp)),
          ss(0.73, 0.75, sp) * (1 - ss(0.75, 0.80, sp)),
        );

        // ── Graticule (CRT measurement grid) ────────────────────────────
        const gridA = Math.round(ss(0.01, 0.10, sp) * 26);
        if (gridA > 1) {
          p.noFill();
          // Minor divisions
          p.stroke(bR, bG, bB, gridA);
          p.strokeWeight(0.35);
          const gCols = 10, gRows = 8;
          for (let gx = 1; gx < gCols; gx++) {
            p.line(gx * W / gCols, H * 0.01, gx * W / gCols, H * 0.99);
          }
          for (let gy = 1; gy < gRows; gy++) {
            p.line(W * 0.01, gy * H / gRows, W * 0.99, gy * H / gRows);
          }
          // Center axes (brighter)
          p.stroke(bR, bG, bB, gridA * 2.8);
          p.strokeWeight(0.55);
          p.line(cx, H * 0.01, cx, H * 0.99);
          p.line(W * 0.01, cy, W * 0.99, cy);
          // Tick marks along center axes
          p.strokeWeight(0.45);
          p.stroke(bR, bG, bB, gridA * 1.6);
          for (let gx = 0; gx < gCols; gx++) {
            const x = gx * W / gCols + W / (gCols * 2);
            p.line(x, cy - 5, x, cy + 5);
          }
          for (let gy = 0; gy < gRows; gy++) {
            const y = gy * H / gRows + H / (gRows * 2);
            p.line(cx - 5, y, cx + 5, y);
          }
        }

        // ── Primary Lissajous beam ────────────────────────────────────────
        const WINDOW  = TAU * 0.036;  // parametric arc length of the beam
        const SAMPLES = 100;

        p.noStroke();
        for (let i = 0; i < SAMPLES; i++) {
          const t  = tau - WINDOW + (i / SAMPLES) * WINDOW;
          const bx = cx + AX * Math.sin(a * t + d);
          const by = cy + AY * Math.sin(b * t);
          const ft = i / SAMPLES;           // 0=tail, 1=head
          const sz = lerp(1.0, 5.0, ft);
          const al = Math.round(lerp(0, 215, ft * ft * ft));
          if (al < 2) continue;
          p.fill(bR, bG, bB, al);
          p.circle(bx, by, sz);
        }

        // Head glow — the brightest point at beam front
        const hX = cx + AX * Math.sin(a * tau + d);
        const hY = cy + AY * Math.sin(b * tau);
        glowDot(hX, hY, 34, bR, bG, bB, 0.78);
        glowDot(hX, hY, 10, bR, bG, bB, 0.92);
        p.noStroke();
        p.fill(bR, bG, bB, 240);
        p.circle(hX, hY, 4.5);

        // ── 2× harmonic overlay ───────────────────────────────────────────
        if (sec2W > 0.02) {
          const A2 = AX * 0.52, B2 = AY * 0.52;
          const WIN2 = WINDOW * 0.85;
          const S2   = Math.round(SAMPLES * 0.72);
          for (let i = 0; i < S2; i++) {
            const t  = tau - WIN2 + (i / S2) * WIN2;
            const bx = cx + A2 * Math.sin(2 * a * t + d * 1.4);
            const by = cy + B2 * Math.sin(2 * b * t);
            const ft = i / S2;
            const al = Math.round(lerp(0, 140, ft * ft) * sec2W);
            if (al < 2) continue;
            p.fill(bR, bG, bB, al);
            p.circle(bx, by, lerp(0.7, 3.0, ft));
          }
          const h2X = cx + A2 * Math.sin(2 * a * tau + d * 1.4);
          const h2Y = cy + B2 * Math.sin(2 * b * tau);
          glowDot(h2X, h2Y, 18, bR, bG, bB, 0.45 * sec2W);
        }

        // ── 3× harmonic overlay ───────────────────────────────────────────
        if (sec3W > 0.02) {
          const A3 = AX * 0.30, B3 = AY * 0.30;
          const WIN3 = WINDOW * 0.65;
          const S3   = Math.round(SAMPLES * 0.52);
          for (let i = 0; i < S3; i++) {
            const t  = tau - WIN3 + (i / S3) * WIN3;
            const bx = cx + A3 * Math.sin(3 * a * t + d * 0.65);
            const by = cy + B3 * Math.sin(3 * b * t);
            const ft = i / S3;
            const al = Math.round(lerp(0, 95, ft * ft) * sec3W);
            if (al < 2) continue;
            p.fill(bR, bG, bB, al);
            p.circle(bx, by, lerp(0.5, 2.0, ft));
          }
        }

        // ── Chapter-transition interference noise ─────────────────────────
        if (noise > 0.02) {
          const nPts = Math.round(noise * 100);
          p.noStroke();
          p.fill(bR, bG, bB, Math.round(noise * 38));
          for (let n = 0; n < nPts; n++) {
            const nx = (Math.random() * 0.72 + 0.14) * W;
            const ny = (Math.random() * 0.72 + 0.14) * H;
            p.circle(nx, ny, 1.8);
          }
          // Horizontal scan-line glitch across center
          const glitchA = Math.round(noise * 45);
          p.stroke(bR, bG, bB, glitchA);
          p.strokeWeight(0.6);
          const glitchY = cy + (Math.random() - 0.5) * H * 0.18;
          p.line(W * 0.05, glitchY, W * 0.95, glitchY);
        }

        // ── Ambient room-tone glow at figure center ───────────────────────
        const centreGlow = 0.035 + sec2W * 0.025 + sec3W * 0.020;
        glowDot(cx, cy, Math.min(W, H) * 0.46, bR, bG, bB, centreGlow);

        // ── HUD: scope readout text ───────────────────────────────────────
        const hudA = ss(0.04, 0.14, sp);
        if (hudA > 0.02) {
          const { a: la, b: lb } = lissa(sp);
          const chNum = Math.min(4, Math.floor(sp * 4) + 1);
          p.noStroke();
          p.fill(bR, bG, bB, Math.round(hudA * 145));
          p.textSize(9);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`Σ ${la.toFixed(2)} : ${lb.toFixed(2)}`, W * 0.018, H * 0.018);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(`CH${chNum}  ▲`, W * 0.982, H * 0.018);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(`τ  ${(tau % TAU).toFixed(3)}`, W * 0.018, H * 0.982);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(`sp  ${sp.toFixed(4)}`, W * 0.982, H * 0.982);
        }

        // ── Vignette (CRT screen edge darkening) ─────────────────────────
        dc.save();
        const vig = dc.createRadialGradient(cx, cy, H * 0.26, cx, cy, H * 0.80);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.55)");
        dc.fillStyle = vig;
        dc.fillRect(0, 0, W, H);
        dc.restore();

        // ── Text overlays ─────────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [, , i0, i1, o0, o1] = SECTIONS[i];
          const alpha = secAlpha(sp, i0, i1, o0, o1);
          const elRef = sectionEls[i];
          if (!elRef) continue;
          elRef.style.opacity = alpha.toFixed(3);
          elRef.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
        }
      };
    };

    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── component ──────────────────────────────────────────────────────────────────
export function OscilloLab() {
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

    return () => {
      alive = false;
      inst?.remove();
    };
  }, []);

  // Per-chapter phosphor colors (CSS versions of beamRGB at chapter midpoints)
  const chipColors = [
    "rgba(0,255,120,0.55)",    // ch1 — green phosphor
    "rgba(20,205,255,0.55)",   // ch2 — cyan phosphor
    "rgba(255,165,0,0.55)",    // ch3 — amber phosphor
    "rgba(200,225,255,0.55)",  // ch4 — cold white
  ];
  const textColors = ["#a8f0c8", "#88d8f8", "#f8d070", "#d8e8ff"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "var(--font-mono, 'Courier New', monospace)",
    zIndex: 10,
  };
  const chip = (color: string): React.CSSProperties => ({
    fontSize: "0.58rem", letterSpacing: "0.30em", color,
    display: "block", marginBottom: 8, textTransform: "uppercase",
  });

  const positions: React.CSSProperties[] = [
    { top: "12%",    left:  "7%" },
    { bottom: "14%", right: "8%", textAlign: "right" },
    { top: "50%",    left:  "7%", transform: "translateY(-50%)" },
    { top: "12%",    right: "8%", textAlign: "right" },
    { bottom: "14%", left:  "7%" },
    { top: "50%",    right: "8%", textAlign: "right", transform: "translateY(-50%)" },
    { top: "12%",    left:  "7%" },
    { bottom: "14%", right: "8%", textAlign: "right" },
    { top: "50%",    left:  "7%", transform: "translateY(-50%)" },
    { top: "12%",    right: "8%", textAlign: "right" },
    { bottom: "14%", left:  "7%" },
    { top: "50%",    left:  "50%", textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#020804" }}>
      <div
        ref={containerRef}
        style={{ position: "fixed", inset: 0, zIndex: 1 }}
      />

      {SECTIONS.map(([ch, part], i) => {
        const tc = textColors[(ch as number) - 1];
        return (
          <div
            key={i}
            ref={(el) => { sectionEls.current[i] = el; }}
            style={{ ...base, ...positions[i] }}
          >
            <span style={chip(chipColors[(ch as number) - 1])}>
              {CHIP_LABELS[i]}
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem,4.2vw,3.4rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                margin: 0,
                color: tc,
                textShadow: `0 0 22px ${tc}55, 0 0 48px ${tc}22`,
              }}
            >
              Lorem ipsum
              <br />
              {part === "I" ? "dolor sit amet" : part === "II" ? "consectetur" : "adipiscing elit"}
            </h2>
          </div>
        );
      })}
    </div>
  );
}
