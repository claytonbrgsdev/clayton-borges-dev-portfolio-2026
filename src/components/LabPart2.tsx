"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { LabPartChrome } from "./LabPartChrome";

// ── Helpers ────────────────────────────────────────────────────────────────────
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── Palette ────────────────────────────────────────────────────────────────────
const PAL_BG  = [0,   0,   12 ] as const;
const PAL_PRI = [232, 238, 255] as const;
const PAL_ACC = [30,  68,  240] as const;
const BG      = "#00000c";
const PRIMARY = "#e8eeff";
const ACCENT  = "#1E44F0";

// ── Grid / wave constants ──────────────────────────────────────────────────────
const GW = 80, GH = 50, N_CELLS = GW * GH;
const WAVE_W = 240;

// ── Module-level wave buffers (avoid per-frame allocation) ─────────────────────
const waveY      = new Float32Array(WAVE_W); // current rendered wave
const waveTarget = new Float32Array(WAVE_W); // simulation target
const ptsX       = new Float32Array(WAVE_W); // screen-space x (updated on resize)
const ptsY       = new Float32Array(WAVE_W); // screen-space y

// ── CH1: Sandpile ──────────────────────────────────────────────────────────────
const sandpile = new Uint8Array(N_CELLS);
const sandNext = new Uint8Array(N_CELLS);
const TOPPLE_THR = 4;

function sandpileInit() { sandpile.fill(0); }
function sandpileStep(steps: number) {
  const cx = Math.floor(GW / 2), cy = Math.floor(GH / 2);
  for (let s = 0; s < steps; s++) {
    sandpile[cy * GW + cx] = Math.min(255, sandpile[cy * GW + cx] + 1);
    let anyToppled = true, iters = 0;
    while (anyToppled && iters < 60) {
      anyToppled = false;
      sandNext.set(sandpile);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        const i = y * GW + x;
        if (sandpile[i] >= TOPPLE_THR) {
          anyToppled = true;
          sandNext[i] -= TOPPLE_THR;
          if (x > 0)      sandNext[i - 1] = Math.min(255, sandNext[i - 1] + 1);
          if (x < GW - 1) sandNext[i + 1] = Math.min(255, sandNext[i + 1] + 1);
          if (y > 0)      sandNext[i - GW] = Math.min(255, sandNext[i - GW] + 1);
          if (y < GH - 1) sandNext[i + GW] = Math.min(255, sandNext[i + GW] + 1);
        }
      }
      sandpile.set(sandNext);
      iters++;
    }
  }
}

// ── CH2: Lorenz x(t) time series ──────────────────────────────────────────────
// Single particle — x(t) shows butterfly wing-switching clearly
const lorXp = new Float32Array(1), lorYp = new Float32Array(1), lorZp = new Float32Array(1);
const LOR_HIST = new Float32Array(WAVE_W);
let lorHistHead = 0;
const SIGMA_L = 10, BETA_L = 8 / 3, RHO_L = 28, DT_LOR = 0.014;

function lorenzInit() {
  lorXp[0] = 1.0; lorYp[0] = 0.0; lorZp[0] = 0.0;
  LOR_HIST.fill(0); lorHistHead = 0;
}
function lorenzStep() {
  const dx = SIGMA_L * (lorYp[0] - lorXp[0]);
  const dy = lorXp[0] * (RHO_L - lorZp[0]) - lorYp[0];
  const dz = lorXp[0] * lorYp[0] - BETA_L * lorZp[0];
  lorXp[0] += dx * DT_LOR; lorYp[0] += dy * DT_LOR; lorZp[0] += dz * DT_LOR;
  if (!isFinite(lorXp[0])) { lorXp[0] = 1.0 + Math.random() * 0.1; lorYp[0] = 0; lorZp[0] = 0; }
  LOR_HIST[lorHistHead] = lorXp[0] / 18;       // x ≈ ±18, normalize → ±1
  lorHistHead = (lorHistHead + 1) % WAVE_W;
}

// ── CH3: Game of Life ──────────────────────────────────────────────────────────
const glCur = new Uint8Array(N_CELLS), glNxt = new Uint8Array(N_CELLS);
let glFrame = 0;
function glSeededRng(seed: number) {
  let s = seed | 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 0xffffffff; };
}
function glStep() {
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      nb += glCur[((y + dy + GH) % GH) * GW + ((x + dx + GW) % GW)];
    }
    const a = glCur[y * GW + x];
    glNxt[y * GW + x] = (a && (nb === 2 || nb === 3)) || (!a && nb === 3) ? 1 : 0;
  }
  for (let i = 0; i < N_CELLS; i++) glCur[i] = glNxt[i];
  glFrame++;
}
function glInit(seed: number) {
  const rng = glSeededRng(seed);
  for (let i = 0; i < N_CELLS; i++) glCur[i] = rng() < 0.30 ? 1 : 0;
  for (let g = 0; g < 50; g++) glStep();
  glFrame = 0;
}

// ── CH4: CA Rule 30 / 110 ──────────────────────────────────────────────────────
const caGrid = new Uint8Array(GH * GW);
let caRule = 30, caHead = 0;
function caInit(rule: number) {
  caRule = rule; caGrid.fill(0); caHead = 0;
  for (let x = 0; x < GW; x++) caGrid[x] = Math.random() < 0.5 ? 1 : 0;
}
function caStep() {
  const prev = caHead;
  caHead = (caHead + 1) % GH;
  for (let x = 0; x < GW; x++) {
    const l = caGrid[prev * GW + ((x - 1 + GW) % GW)];
    const c = caGrid[prev * GW + x];
    const r = caGrid[prev * GW + ((x + 1) % GW)];
    caGrid[caHead * GW + x] = (caRule >> ((l << 2) | (c << 1) | r)) & 1;
  }
}

// ── CH5: Ising 2D ─────────────────────────────────────────────────────────────
const isingGrid = new Int8Array(N_CELLS);
function isingInit() { for (let i = 0; i < N_CELLS; i++) isingGrid[i] = Math.random() < 0.5 ? 1 : -1; }
function isingStep(steps: number, T: number) {
  for (let s = 0; s < steps; s++) {
    const x = Math.floor(Math.random() * GW), y = Math.floor(Math.random() * GH);
    const i = y * GW + x, spin = isingGrid[i];
    const sumN =
      isingGrid[y * GW + ((x + 1) % GW)] + isingGrid[y * GW + ((x - 1 + GW) % GW)] +
      isingGrid[((y + 1) % GH) * GW + x]  + isingGrid[((y - 1 + GH) % GH) * GW + x];
    const dE = 2 * spin * sumN;
    if (dE <= 0 || Math.random() < Math.exp(-dE / T)) isingGrid[i] = spin === 1 ? -1 : 1;
  }
}

// ── buildSketch ────────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    sandpileInit(); lorenzInit(); glInit(42); caInit(30); isingInit();
    waveY.fill(0); waveTarget.fill(0);

    let lastCh = -1;
    let isingT  = 3.0;
    let wavePhase = 0;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0, frameN = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      p.draw = () => {
        frameN++;
        const sp = Math.max(0, Math.min(1,
          window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight)
        ));

        const BOUNDS = [0, 0.17, 0.34, 0.51, 0.67, 0.84, 1.0];
        let chIdx = 0;
        for (let i = 0; i < 6; i++) if (sp >= BOUNDS[i] && sp < BOUNDS[i + 1]) { chIdx = i; break; }
        if (sp >= 1.0) chIdx = 5;
        const chStart = BOUNDS[chIdx], chEnd = BOUNDS[chIdx + 1];
        const chT = Math.max(0, Math.min(1, (sp - chStart) / Math.max(0.001, chEnd - chStart)));

        if (chIdx !== lastCh) {
          lastCh = chIdx;
          waveY.fill(0); waveTarget.fill(0);
          if (chIdx === 0) {
            sandpileInit();
            for (let pw = 0; pw < 800; pw++) sandpileStep(1); // pre-warm visible mound
          } else if (chIdx === 1) {
            lorenzInit();
            for (let pw = 0; pw < 3000; pw++) lorenzStep(); // settle onto attractor
          } else if (chIdx === 2) {
            glInit(42); // already pre-warmed 50 gens inside glInit
          } else if (chIdx === 3) {
            caInit(30);
            for (let pw = 0; pw < GH; pw++) caStep(); // fill history
          } else if (chIdx === 4) {
            isingInit(); isingT = 3.0;
            for (let pw = 0; pw < GW * GH * 4; pw++) isingStep(1, 3.0); // initial equilibrium
          } else {
            wavePhase = 0;
          }
        }

        // Amplitude envelope — birth (0→0.12) and death (0.88→1)
        let amp = 1.0;
        if (chT < 0.12)      amp = ss(0.0, 0.12, chT);
        else if (chT > 0.88) amp = 1 - ss(0.88, 1.0, chT);

        // ── Simulate + fill waveTarget ─────────────────────────────────────
        if (chIdx === 0) {
          // GRAIN: wave = sandpile height profile
          // Seismic spikes appear when columns are toppling
          sandpileStep(3);
          let peakH = 1;
          for (let i = 0; i < N_CELLS; i++) if (sandpile[i] > peakH) peakH = sandpile[i];
          for (let i = 0; i < WAVE_W; i++) {
            const gx = Math.round(i / (WAVE_W - 1) * (GW - 1));
            let colMax = 0, toppling = 0;
            for (let gy = 0; gy < GH; gy++) {
              const h = sandpile[gy * GW + gx];
              if (h > colMax) colMax = h;
              if (h >= TOPPLE_THR) toppling++;
            }
            const mound = colMax / peakH;                   // 0→1 height profile
            const spike = Math.min(0.45, toppling / GH * 4); // avalanche spikes
            waveTarget[i] = mound * 0.65 + spike;
          }
          // Subtract center so the mound straddles zero
          const mid = waveTarget[Math.floor(WAVE_W / 2)];
          for (let i = 0; i < WAVE_W; i++) waveTarget[i] -= mid * 0.6;
        }
        else if (chIdx === 1) {
          // FLOW: scrolling x(t) time series — butterfly wing-switching visible
          for (let s = 0; s < 4; s++) lorenzStep();
          for (let i = 0; i < WAVE_W; i++) {
            const idx = (lorHistHead - WAVE_W + i + WAVE_W) % WAVE_W;
            waveTarget[i] = LOR_HIST[idx] * 0.88;
          }
        }
        else if (chIdx === 2) {
          // LIFE: alive/dead per column → wave amplitude
          if (frameN % 6 === 0) glStep();
          for (let i = 0; i < WAVE_W; i++) {
            const gx = Math.round(i / (WAVE_W - 1) * (GW - 1));
            let alive = 0;
            for (let gy = 0; gy < GH; gy++) alive += glCur[gy * GW + gx];
            waveTarget[i] = (alive / GH - 0.3) * 2.4; // center ≈ 0
          }
        }
        else if (chIdx === 3) {
          // RULE: digital step wave — current CA row
          const rule = chT < 0.45 ? 30 : 110;
          if (caRule !== rule) caInit(rule);
          caStep();
          for (let i = 0; i < WAVE_W; i++) {
            const col = Math.round(i / (WAVE_W - 1) * (GW - 1));
            waveTarget[i] = caGrid[caHead * GW + col] ? 0.78 : -0.78;
          }
        }
        else if (chIdx === 4) {
          // SPIN: magnetization per column → domain structure
          isingT = lerp(3.0, 1.5, chT);
          for (let s = 0; s < GW * 3; s++) isingStep(1, isingT);
          for (let i = 0; i < WAVE_W; i++) {
            const gx = Math.round(i / (WAVE_W - 1) * (GW - 1));
            let mag = 0;
            for (let gy = 0; gy < GH; gy++) mag += isingGrid[gy * GW + gx];
            waveTarget[i] = mag / GH; // -1 to 1
          }
        }
        else {
          // SIGNAL: N-slit diffraction — nSlits grows with chT
          wavePhase += 0.038;
          const nSlits = Math.max(1, Math.min(6, 1 + Math.floor(chT * 6)));
          const lambda = 0.48;
          for (let i = 0; i < WAVE_W; i++) {
            const theta = ((i / (WAVE_W - 1)) - 0.5) * Math.PI * 2.2;
            let re = 0, im = 0;
            for (let ns = 0; ns < nSlits; ns++) {
              const d = (ns - (nSlits - 1) / 2) * 0.13;
              const phi = 2 * Math.PI * d * Math.sin(theta) / lambda + wavePhase * 0.25;
              re += Math.cos(phi); im += Math.sin(phi);
            }
            waveTarget[i] = Math.sqrt(re * re + im * im) / nSlits * 0.85;
          }
        }

        // Smooth lerp — CA snaps fast for digital feel, others flow
        const lerpSpd = chIdx === 3 ? 0.90 : 0.13;
        for (let i = 0; i < WAVE_W; i++) {
          waveY[i] = lerp(waveY[i], waveTarget[i] * amp, lerpSpd);
        }

        // ── Screen-space points ────────────────────────────────────────────
        const wCy    = H * 0.5;
        const scaleY = H * 0.30;
        for (let i = 0; i < WAVE_W; i++) {
          ptsX[i] = (i / (WAVE_W - 1)) * W;
          ptsY[i] = wCy - waveY[i] * scaleY;
        }

        // ── Render ────────────────────────────────────────────────────────
        p.background(PAL_BG[0], PAL_BG[1], PAL_BG[2]);
        const dc = p.drawingContext as CanvasRenderingContext2D;

        // Baseline
        dc.strokeStyle = `rgba(${PAL_ACC[0]},${PAL_ACC[1]},${PAL_ACC[2]},0.15)`;
        dc.lineWidth = 0.5;
        dc.setLineDash([3, 9]);
        dc.beginPath(); dc.moveTo(0, wCy); dc.lineTo(W, wCy); dc.stroke();
        dc.setLineDash([]);

        // Fill below wave
        dc.fillStyle = `rgba(${PAL_ACC[0]},${PAL_ACC[1]},${PAL_ACC[2]},0.07)`;
        dc.beginPath(); dc.moveTo(ptsX[0], wCy);
        for (let i = 0; i < WAVE_W; i++) dc.lineTo(ptsX[i], ptsY[i]);
        dc.lineTo(ptsX[WAVE_W - 1], wCy);
        dc.closePath(); dc.fill();

        // Glow stroke
        dc.strokeStyle = `rgba(${PAL_ACC[0]},${PAL_ACC[1]},${PAL_ACC[2]},0.22)`;
        dc.lineWidth = 9; dc.lineJoin = "round";
        dc.beginPath();
        for (let i = 0; i < WAVE_W; i++) {
          if (i === 0) dc.moveTo(ptsX[i], ptsY[i]); else dc.lineTo(ptsX[i], ptsY[i]);
        }
        dc.stroke();

        // Main wave stroke
        dc.strokeStyle = `rgba(${PAL_PRI[0]},${PAL_PRI[1]},${PAL_PRI[2]},0.92)`;
        dc.lineJoin = "round";
        if (chIdx === 3) {
          // Digital step wave for CA
          dc.lineWidth = 1.2;
          dc.beginPath();
          for (let i = 0; i < WAVE_W; i++) {
            if (i === 0) { dc.moveTo(ptsX[i], ptsY[i]); continue; }
            const mx = (ptsX[i - 1] + ptsX[i]) * 0.5;
            dc.lineTo(mx, ptsY[i - 1]);
            dc.lineTo(mx, ptsY[i]);
            dc.lineTo(ptsX[i], ptsY[i]);
          }
          dc.stroke();
        } else {
          dc.lineWidth = 1.8;
          dc.beginPath();
          for (let i = 0; i < WAVE_W; i++) {
            if (i === 0) dc.moveTo(ptsX[i], ptsY[i]); else dc.lineTo(ptsX[i], ptsY[i]);
          }
          dc.stroke();
        }

        // Peak dot — rides the highest point of the wave
        let maxV = -99, maxI = WAVE_W >> 1;
        for (let i = 0; i < WAVE_W; i++) if (waveY[i] > maxV) { maxV = waveY[i]; maxI = i; }
        if (maxV > 0.06) {
          const dotX = ptsX[maxI], dotY = ptsY[maxI];
          const grd = dc.createRadialGradient(dotX, dotY, 0, dotX, dotY, 20);
          grd.addColorStop(0, `rgba(${PAL_ACC[0]},${PAL_ACC[1]},${PAL_ACC[2]},0.50)`);
          grd.addColorStop(1, `rgba(${PAL_ACC[0]},${PAL_ACC[1]},${PAL_ACC[2]},0)`);
          dc.fillStyle = grd;
          dc.beginPath(); dc.arc(dotX, dotY, 20, 0, Math.PI * 2); dc.fill();
          dc.fillStyle = `rgba(${PAL_PRI[0]},${PAL_PRI[1]},${PAL_PRI[2]},0.95)`;
          dc.beginPath(); dc.arc(dotX, dotY, 3.5, 0, Math.PI * 2); dc.fill();
        }

        // HUD
        dc.font = `${Math.round(W * 0.009 + 5)}px 'Arial','Helvetica Neue',sans-serif`;
        dc.fillStyle = `rgba(${PAL_ACC[0]},${PAL_ACC[1]},${PAL_ACC[2]},0.35)`;
        dc.textAlign = "left";
        dc.fillText(`CH${chIdx + 1} · ${["GRAIN","FLOW","LIFE","RULE","SPIN","SIGNAL"][chIdx]}`, W * 0.018, H * 0.97);
        dc.textAlign = "right";
        dc.fillText(`sp ${sp.toFixed(4)}`, W * 0.982, H * 0.97);

        // Section text overlays
        const fadeWindows = [
          [0.01, 0.04, 0.13, 0.16],
          [0.18, 0.21, 0.30, 0.33],
          [0.35, 0.38, 0.47, 0.50],
          [0.52, 0.55, 0.63, 0.66],
          [0.68, 0.71, 0.80, 0.83],
          [0.85, 0.88, 0.96, 0.99],
        ];
        for (let i = 0; i < 6; i++) {
          const [i0, i1, o0, o1] = fadeWindows[i];
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

// ── Chapter copy ───────────────────────────────────────────────────────────────
const CH_LABELS = [
  "CH1 · GRAIN",
  "CH2 · FLOW",
  "CH3 · LIFE",
  "CH4 · RULE",
  "CH5 · SPIN",
  "CH6 · SIGNAL",
];

const CH_HEADINGS: [string, string][] = [
  ["CRITICALITY",  "grains at the threshold"],
  ["CHAOS",        "the signal that never repeats"],
  ["LIFE",         "the rule that breathes"],
  ["AUTOMATON",    "one rule · infinite complexity"],
  ["ISING",        "where order emerges from noise"],
  ["DIFFRACTION",  "the same wave. different slits.\ndifferent worlds."],
];

const CH_SUBS = [
  "self-organized criticality — one grain tips the balance",
  "Lorenz x(t): butterfly wing-switching, drawn in real time",
  "Conway's Game of Life — density per column, generation by generation",
  "Rule 30 → Rule 110 — the wave learns to compute",
  "Metropolis-Hastings — magnetic domains crystallize from randomness",
  "N slits, one wave equation — the pattern was always there",
];

// ── Component ──────────────────────────────────────────────────────────────────
export function LabPart2() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement | null>>(Array(6).fill(null));

  useEffect(() => {
    const container = containerRef.current, scroll = scrollRef.current;
    if (!container || !scroll) return;
    let inst: p5Type | null = null, alive = true;
    buildSketch(container, scroll, sectionEls.current).then(p5inst => {
      if (!alive) { p5inst.remove(); return; }
      inst = p5inst;
    });
    return () => { alive = false; inst?.remove(); };
  }, []);

  const positions: React.CSSProperties[] = [
    { top: "12%",   right: "7%",  textAlign: "right" },
    { bottom: "14%",left:  "6%" },
    { top: "50%",   right: "7%",  textAlign: "right", transform: "translateY(-50%)" },
    { bottom: "14%",left:  "6%" },
    { top: "12%",   right: "7%",  textAlign: "right" },
    { top: "50%",   left:  "50%", textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial','Helvetica Neue',sans-serif",
    zIndex: 10, maxWidth: "30rem",
    transition: "opacity 0.1s linear",
  };

  return (
    <>
      <LabPartChrome partNumber={2} nextRoute="/lab-part-3" />
      <div ref={scrollRef} style={{ height: "1600vh", background: BG }}>
        <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
        {CH_LABELS.map((label, i) => {
          const [heading, sub2] = CH_HEADINGS[i];
          const subtitle = CH_SUBS[i];
          return (
            <div key={i} ref={el => { sectionEls.current[i] = el; }} style={{ ...base, ...positions[i] }}>
              <span style={{
                display: "block", fontSize: "0.52rem", letterSpacing: "0.42em",
                color: ACCENT, textTransform: "uppercase", marginBottom: 10, opacity: 0.85,
              }}>
                {label}
              </span>
              <h2 style={{
                margin: 0, fontSize: "clamp(1.6rem,3.5vw,3rem)", fontWeight: 700,
                lineHeight: 1.05, letterSpacing: "-0.01em",
                textTransform: "uppercase", color: PRIMARY, whiteSpace: "pre-line",
              }}>
                {heading}
                {i === 5 ? (
                  <span style={{
                    display: "block", fontWeight: 400,
                    fontSize: "clamp(0.95rem, 2vw, 1.55rem)",
                    letterSpacing: "0.04em", color: `rgba(232,238,255,0.6)`,
                    textTransform: "none", marginTop: "0.5rem", lineHeight: 1.5,
                  }}>{sub2}</span>
                ) : (
                  <span style={{
                    display: "block", fontWeight: 300,
                    fontSize: "clamp(0.9rem,2vw,1.5rem)",
                    letterSpacing: "0.1em", color: `rgba(232,238,255,0.6)`,
                    textTransform: "lowercase", marginTop: 6,
                  }}>{sub2}</span>
                )}
              </h2>
              <p style={{
                margin: "12px 0 0", fontSize: "clamp(0.65rem,1.1vw,0.82rem)",
                letterSpacing: "0.06em", lineHeight: 1.6,
                color: `rgba(232,238,255,0.6)`, maxWidth: "24rem",
                fontWeight: 300, textTransform: "none",
              }}>
                {subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
