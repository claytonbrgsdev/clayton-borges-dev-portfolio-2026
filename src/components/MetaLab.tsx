"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

/*
 * MetaLab — Phase 26 · EPILOGUE
 *
 * The closing question of the lab series.
 * Visual: a single parametric Lissajous curve that morphs with scroll —
 * the simplest demonstration of rule → form. The complexity of the
 * previous 25 labs is remembered in this one shape.
 *
 * The text asks: what were you watching, all this time?
 */

const ss   = (a: number, b: number, t: number) => { const x = Math.max(0, Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp) * (1 - ss(o0,o1,sp));

// ── Sections (12 × 4 chapters) ────────────────────────────────────────────────
const SECTIONS = [
  [1,"I",   0.000, 0.018, 0.065, 0.083],
  [1,"II",  0.083, 0.101, 0.149, 0.167],
  [1,"III", 0.167, 0.185, 0.232, 0.250],
  [2,"I",   0.250, 0.268, 0.315, 0.333],
  [2,"II",  0.333, 0.351, 0.399, 0.417],
  [2,"III", 0.417, 0.435, 0.482, 0.500],
  [3,"I",   0.500, 0.518, 0.565, 0.583],
  [3,"II",  0.583, 0.601, 0.649, 0.667],
  [3,"III", 0.667, 0.685, 0.732, 0.750],
  [4,"I",   0.750, 0.768, 0.815, 0.833],
  [4,"II",  0.833, 0.851, 0.899, 0.917],
  [4,"III", 0.917, 0.935, 0.982, 1.000],
] as const;

const CH_NAMES = ["REPRESENTATION", "SIMULATION", "RECOGNITION", "QUESTION"];
const CH_NAMES_PT = ["REPRESENTAÇÃO", "SIMULAÇÃO", "RECONHECIMENTO", "QUESTÃO"];

const HEADINGS: [string, string][] = [
  // CH1 · REPRESENTATION
  ["THE MODEL",      "is not the phenomenon"],
  ["THE MAP",        "has never been the territory"],
  ["MATHEMATICS",    "does not explain — it compresses"],
  // CH2 · SIMULATION
  ["TO SIMULATE",    "is to run a rule in time"],
  ["EACH FRAME",     "is a consequence of the last"],
  ["THE PROGRAM",    "and the phenomenon — same grammar"],
  // CH3 · RECOGNITION
  ["YOU ALREADY",    "knew these shapes"],
  ["THE PATTERN",    "is in you too"],
  ["INTUITION",      "is the body's own simulation"],
  // CH4 · QUESTION
  ["WHAT IS",        "a simulation?"],
  ["EVERY SYSTEM",   "in this lab was already running"],
  ["YOU",            "were watching yourself think"],
];

const HEADINGS_PT: [string, string][] = [
  ["O MODELO",        "não é o fenômeno"],
  ["O MAPA",          "nunca foi o território"],
  ["A MATEMÁTICA",    "não explica — comprime"],
  ["SIMULAR",         "é executar uma regra no tempo"],
  ["CADA FRAME",      "é uma consequência do último"],
  ["O PROGRAMA",      "e o fenômeno — mesma gramática"],
  ["VOCÊ JÁ",         "conhecia essas formas"],
  ["O PADRÃO",        "também está em você"],
  ["INTUIÇÃO",        "é a própria simulação do corpo"],
  ["O QUE É",         "uma simulação?"],
  ["CADA SISTEMA",    "neste lab já estava em execução"],
  ["VOCÊ",            "estava se observando pensar"],
];

// ── Lissajous configurations per chapter ──────────────────────────────────────
// [a, b, delta] — x(t)=sin(a·t+δ), y(t)=sin(b·t)
// CH1: simple circle/ellipse (a=1,b=1,δ=π/2)
// CH2: figure-8 family (a=1,b=2,δ=π/4)
// CH3: complex flower (a=3,b=4,δ=π/6)
// CH4: returns to the simplest form (a=1,b=1,δ=0) — the loop closes
const LISSA_CONFIGS: [number, number, number][] = [
  [1, 1, Math.PI / 2],
  [1, 2, Math.PI / 4],
  [3, 4, Math.PI / 6],
  [1, 1, 0],
];

const N_TRACE = 5000; // number of trace points

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
  localeRef: { current: "pt"|"en" },
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const sketch = (p: p5Type) => {
      let W = 0, H = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.noFill();
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        p.resizeCanvas(W, H);
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
        ));

        // Background: very dark, slow fade between chapter tones
        const chF   = sp * 4;
        const chIdx = Math.min(3, Math.floor(chF));
        const chT   = chF - chIdx;
        const next  = Math.min(3, chIdx + 1);
        const bt    = ss(0.7, 1.0, chT);

        // Background colours per chapter: near-black with subtle hue shifts
        const bgPalette: [number,number,number][] = [
          [5, 5, 8],   // CH1: cold near-black
          [6, 5, 5],   // CH2: warm near-black
          [5, 8, 5],   // CH3: cool-green near-black
          [4, 4, 6],   // CH4: indigo near-black
        ];
        const bg0 = bgPalette[chIdx], bg1 = bgPalette[next];
        const bgR = Math.round(lerp(bg0[0], bg1[0], bt));
        const bgG = Math.round(lerp(bg0[1], bg1[1], bt));
        const bgB = Math.round(lerp(bg0[2], bg1[2], bt));

        p.background(bgR, bgG, bgB);

        // Lissajous parameters — interpolate between chapter configs
        const [a0, b0, d0] = LISSA_CONFIGS[chIdx];
        const [a1, b1, d1] = LISSA_CONFIGS[next];
        const a   = lerp(a0, a1, bt);
        const b   = lerp(b0, b1, bt);
        const d   = lerp(d0, d1, bt);

        // Scale: 28% of the smaller canvas dimension
        const R   = Math.min(W, H) * 0.28;
        const cx  = W * 0.5, cy = H * 0.5;

        // Time-driven rotation — slow drift
        const tDrift = p.frameCount * 0.0006;

        // ── Draw trail: oldest to newest, fading alpha ──────────────────
        const ctx = p.drawingContext as CanvasRenderingContext2D;
        ctx.save();
        ctx.lineWidth  = 0.8;
        ctx.lineCap    = "round";
        ctx.lineJoin   = "round";
        ctx.strokeStyle = `rgba(210,222,255,0.22)`;

        ctx.beginPath();
        for (let i = 0; i <= N_TRACE; i++) {
          const t = (i / N_TRACE) * Math.PI * 2 * (a * 3 + 2);
          const x = cx + R * Math.sin(a * t + d + tDrift);
          const y = cy + R * Math.sin(b * t       + tDrift * 0.7);
          if (i === 0) ctx.moveTo(x, y);
          else         ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Bright trace head — current position
        const tHead = (p.frameCount * 0.012) % (Math.PI * 2 * (a * 3 + 2));
        const hx = cx + R * Math.sin(a * tHead + d + tDrift);
        const hy = cy + R * Math.sin(b * tHead       + tDrift * 0.7);
        ctx.fillStyle = `rgba(220,230,255,0.65)`;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // ── Corner HUD ─────────────────────────────────────────────────
        const hudA = ss(0.04, 0.16, sp);
        if (hudA > 0.01) {
          p.noStroke();
          p.fill(210, 222, 255, Math.round(hudA * 55));
          p.textSize(7);
          p.textAlign(p.LEFT,  p.TOP);    p.text(localeRef.current === "pt" ? "FASE 26 · EPÍLOGO" : "PHASE 26 · EPILOGUE", W * 0.018, H * 0.018);
          p.textAlign(p.RIGHT, p.TOP);    p.text(`sp ${sp.toFixed(4)}`,  W * 0.982, H * 0.018);
          p.textAlign(p.LEFT,  p.BOTTOM); p.text(`CH${chIdx+1} · ${(localeRef.current === "pt" ? CH_NAMES_PT : CH_NAMES)[chIdx]}`, W * 0.018, H * 0.982);
          p.textAlign(p.RIGHT, p.BOTTOM); p.text(`a=${a.toFixed(2)} b=${b.toFixed(2)} δ=${d.toFixed(2)}`, W * 0.982, H * 0.982);
        }

        // ── Text overlays ───────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [,, i0, i1, o0, o1] = SECTIONS[i];
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

// ── Component ─────────────────────────────────────────────────────────────────
export function MetaLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(12).fill(null));
  const [locale] = useLabLocale();
  const localeRef = useRef<"pt"|"en">(locale);
  localeRef.current = locale;
  const activeChNames = locale === "pt" ? CH_NAMES_PT : CH_NAMES;
  const activeHeadings = locale === "pt" ? HEADINGS_PT : HEADINGS;

  useEffect(() => {
    const container = containerRef.current;
    const scroll    = scrollRef.current;
    if (!container || !scroll) return;
    let inst: p5Type | null = null;
    let alive = true;
    buildSketch(container, scroll, sectionEls.current, localeRef).then((p5inst) => {
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
    // Final line — centered, large — the book's last sentence
    { top: "50%",    left: "50%", textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  // Per-chapter accent colours — cool, introspective, progressively warmer
  const chips = ["#4a6898", "#885840", "#407858", "#6850a0"];
  const texts = ["#c8d8f8", "#f0d0b8", "#b8d8c8", "#d8c8f8"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "30rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#050508" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = activeHeadings[i];
        // Last section gets special large treatment
        const isLast = i === 11;
        return (
          <div
            key={i}
            ref={(el) => { sectionEls.current[i] = el; }}
            style={{ ...base, ...positions[i] }}
          >
            <span style={{
              display: "block", fontSize: "0.55rem", letterSpacing: "0.38em",
              color: chips[chIdx], textTransform: "uppercase", marginBottom: 10,
            }}>
              {`CH${chIdx + 1} · ${activeChNames[chIdx]}`}
            </span>
            <h2 style={{
              margin: 0,
              fontSize: isLast
                ? "clamp(2.8rem,6vw,5.5rem)"
                : "clamp(1.7rem,3.8vw,3.2rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color: texts[chIdx],
            }}>
              {headline}
              {!isLast && (
                <>
                  <br />
                  <span style={{
                    fontWeight: 300,
                    fontSize: isLast
                      ? "clamp(1.4rem,3vw,2.8rem)"
                      : "clamp(1.0rem,2.3vw,1.9rem)",
                    letterSpacing: "0.09em",
                    color: chips[chIdx],
                    textTransform: "lowercase",
                  }}>
                    {sub}
                  </span>
                </>
              )}
            </h2>
            {isLast && (
              <p style={{
                marginTop: "1.2rem",
                fontSize: "clamp(0.9rem,1.8vw,1.3rem)",
                fontWeight: 300,
                letterSpacing: "0.12em",
                color: chips[chIdx],
                textTransform: "lowercase",
                opacity: 0.8,
              }}>
                {sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
