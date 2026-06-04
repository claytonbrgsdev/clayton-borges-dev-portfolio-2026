"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const TAU = Math.PI * 2;
const PI  = Math.PI;
const ss  = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));

// ── Palette: Bauhaus primaries on near-black linen ────────────────────────────
const BgR = 12,  BgG = 10,  BgB = 9;
const FgR = 238, FgG = 234, FgB = 228;  // warm off-white
const RdR = 210, RdG = 38,  RdB = 28;   // Bauhaus rot
const BlR = 22,  BlG = 82,  BlB = 160;  // Bauhaus blau
const YlR = 238, YlG = 178, YlB = 38;   // Bauhaus gelb

const PISTON_RGB: [number, number, number][] = [
  [RdR, RdG, RdB],
  [BlR, BlG, BlB],
  [YlR, YlG, YlB],
];

// ── Engine geometry (normalized to M = min(W,H)) ──────────────────────────────
const CRANK_R    = 0.090;
const ROD_L      = 0.215;
const FW_R       = 0.155;
const TRACK_PAD  = 0.055;
const PISTON_W   = 0.034;
const PISTON_LEN = 0.022;

// 3 radial tracks 120° apart, starting from top (-90°)
const PHI = [
  -PI / 2,
  -PI / 2 + TAU / 3,
  -PI / 2 + TAU * 2 / 3,
] as const;

// Piston distance from center: d = R·cos(θ-φ) + √(L²−R²·sin²(θ-φ))
function pistonD(i: number, theta: number, R: number, L: number): number {
  const s = Math.sin(theta - PHI[i]);
  return R * Math.cos(theta - PHI[i]) + Math.sqrt(L * L - R * R * s * s);
}

// ── Section windows (4 chapters × 3 sections) ────────────────────────────────
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

const HEADINGS: [string, string][] = [
  ["FORM",          "follows function"],
  ["STRUCTURE",     "precedes motion"],
  ["BEFORE FORCE",  "there is geometry"],
  ["THE MACHINE",   "awakens"],
  ["FORCE THROUGH", "mechanism"],
  ["ROTATION",      "becomes translation"],
  ["SYSTEM",        "in equilibrium"],
  ["EVERY PART",    "a function"],
  ["MEASURE",       "what moves"],
  ["THE PATH",      "reveals the principle"],
  ["MOTION LEAVES", "its trace"],
  ["PURE",          "geometry"],
];

const CH_NAMES = ["STASIS", "DRIVE", "RESONANCE", "DISSOLUTION"];

// ── buildSketch ───────────────────────────────────────────────────────────────
function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const TRACE_MAX = 520;
    // Rod midpoints trace ovals — accumulate per piston
    const midTraces: [number, number][][] = [[], [], []];
    const crankTrace: [number, number][] = [];

    const sketch = (p: p5Type) => {
      let W = 0, H = 0, M = 0, cx = 0, cy = 0;
      let theta = 0;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        M = Math.min(W, H); cx = W / 2; cy = H / 2;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.background(BgR, BgG, BgB);
      };

      p.windowResized = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        M = Math.min(W, H); cx = W / 2; cy = H / 2;
        p.resizeCanvas(W, H);
        p.background(BgR, BgG, BgB);
        for (let i = 0; i < 3; i++) midTraces[i] = [];
        crankTrace.length = 0;
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1,
          window.scrollY / (scrollEl.scrollHeight - window.innerHeight),
        ));

        const motionW = ss(0.25, 0.47, sp);
        theta += lerp(0.005, 0.028, sp) * motionW;

        const R   = CRANK_R * M;
        const L   = ROD_L   * M;
        const fwR = FW_R    * M;

        const crankX = cx + R * Math.cos(theta);
        const crankY = cy + R * Math.sin(theta);

        const pins:  [number, number][] = [];
        const mids:  [number, number][] = [];
        for (let i = 0; i < 3; i++) {
          const d  = pistonD(i, theta, R, L);
          pins.push([cx + d * Math.cos(PHI[i]), cy + d * Math.sin(PHI[i])]);
          mids.push([(crankX + pins[i][0]) / 2, (crankY + pins[i][1]) / 2]);
        }

        if (motionW > 0.08) {
          for (let i = 0; i < 3; i++) {
            midTraces[i].push(mids[i]);
            if (midTraces[i].length > TRACE_MAX) midTraces[i].shift();
          }
          crankTrace.push([crankX, crankY]);
          if (crankTrace.length > TRACE_MAX) crankTrace.shift();
        }

        // ── Background ────────────────────────────────────────────────────
        const dissW = ss(0.80, 0.96, sp);
        if (dissW < 0.01) {
          p.background(BgR, BgG, BgB);
        } else {
          const dc = p.drawingContext as CanvasRenderingContext2D;
          dc.save();
          dc.fillStyle = `rgba(${BgR},${BgG},${BgB},${lerp(1.0, 0.028, dissW).toFixed(4)})`;
          dc.fillRect(0, 0, W, H);
          dc.restore();
        }

        // ── Grid ──────────────────────────────────────────────────────────
        const gridA = ss(0.01, 0.10, sp);
        if (gridA > 0.004) {
          p.noFill();
          p.stroke(FgR, FgG, FgB, Math.round(gridA * 12));
          p.strokeWeight(0.35);
          for (let gx = 1; gx < 16; gx++) p.line(gx * W / 16, 0, gx * W / 16, H);
          for (let gy = 1; gy < 10; gy++) p.line(0, gy * H / 10, W, gy * H / 10);
          p.stroke(FgR, FgG, FgB, Math.round(gridA * 26));
          p.strokeWeight(0.5);
          for (let gx = 4; gx < 16; gx += 4) p.line(gx * W / 16, 0, gx * W / 16, H);
          for (let gy = 2; gy < 10; gy += 2) p.line(0, gy * H / 10, W, gy * H / 10);
        }

        // ── Frame ─────────────────────────────────────────────────────────
        const frameA = ss(0.02, 0.20, sp);
        if (frameA > 0.004) {
          const dc = p.drawingContext as CanvasRenderingContext2D;

          // Dashed housing ring
          dc.save();
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(frameA * 0.38).toFixed(3)})`;
          dc.lineWidth = 0.7;
          dc.setLineDash([5, 9]);
          dc.beginPath(); dc.arc(cx, cy, fwR + 0.04 * M, 0, TAU); dc.stroke();
          dc.setLineDash([]);
          dc.restore();

          // Radial rail tracks
          const halfW = PISTON_W * M * 0.5;
          const tin  = (ROD_L - CRANK_R - TRACK_PAD) * M;
          const tout = (ROD_L + CRANK_R + TRACK_PAD) * M;
          for (let i = 0; i < 3; i++) {
            const phi = PHI[i];
            const [r, g, b] = PISTON_RGB[i];
            const nx = -Math.sin(phi) * halfW, ny = Math.cos(phi) * halfW;
            const x1 = cx + tin  * Math.cos(phi), y1 = cy + tin  * Math.sin(phi);
            const x2 = cx + tout * Math.cos(phi), y2 = cy + tout * Math.sin(phi);
            dc.save();
            dc.strokeStyle = `rgba(${r},${g},${b},${(frameA * 0.36).toFixed(3)})`;
            dc.lineWidth = 0.8;
            dc.beginPath(); dc.moveTo(x1+nx, y1+ny); dc.lineTo(x2+nx, y2+ny); dc.stroke();
            dc.beginPath(); dc.moveTo(x1-nx, y1-ny); dc.lineTo(x2-nx, y2-ny); dc.stroke();
            dc.beginPath(); dc.moveTo(x2+nx*1.6, y2+ny*1.6); dc.lineTo(x2-nx*1.6, y2-ny*1.6); dc.stroke();
            dc.restore();
          }

          // Central bearing hub
          p.noFill(); p.stroke(FgR, FgG, FgB, Math.round(frameA * 85));
          p.strokeWeight(0.9); p.ellipse(cx, cy, R * 0.28 * 2, R * 0.28 * 2);

          // Corner fiducials
          const fidA = Math.round(frameA * 32);
          if (fidA > 2) {
            p.stroke(FgR, FgG, FgB, fidA); p.strokeWeight(0.6);
            const fs = 9;
            for (const [fx, fy] of [[0.055,0.06],[0.945,0.06],[0.055,0.94],[0.945,0.94]]) {
              const fpx = fx * W, fpy = fy * H;
              p.line(fpx-fs, fpy, fpx+fs, fpy); p.line(fpx, fpy-fs, fpx, fpy+fs);
              p.noFill(); p.rect(fpx-fs*1.7, fpy-fs*1.7, fs*3.4, fs*3.4);
            }
          }

          // Track reference labels
          p.textSize(7.5); p.noStroke();
          const tout2 = (ROD_L + CRANK_R + TRACK_PAD + 0.04) * M;
          for (let i = 0; i < 3; i++) {
            const phi = PHI[i];
            const [r, g, b] = PISTON_RGB[i];
            p.fill(r, g, b, Math.round(frameA * 110));
            p.textAlign(p.CENTER, p.CENTER);
            p.text(["PST-01","PST-02","PST-03"][i],
              cx + tout2 * Math.cos(phi), cy + tout2 * Math.sin(phi));
          }
        }

        // ── Connecting rods (under flywheel) ──────────────────────────────
        const rodA = ss(0.26, 0.48, sp);
        if (rodA > 0.004) {
          for (let i = 0; i < 3; i++) {
            const [px, py] = pins[i];
            const [r, g, b] = PISTON_RGB[i];
            p.stroke(r, g, b, Math.round(rodA * 165)); p.strokeWeight(1.5);
            p.line(crankX, crankY, px, py);
            p.noStroke(); p.fill(r, g, b, Math.round(rodA * 75));
            p.ellipse(mids[i][0], mids[i][1], 3.5, 3.5);
          }
        }

        // ── Flywheel (covers inner rod section) ───────────────────────────
        const fwA = ss(0.04, 0.22, sp);
        if (fwA > 0.004) {
          const dc = p.drawingContext as CanvasRenderingContext2D;
          dc.save();
          // 3 colored sectors
          for (let s = 0; s < 3; s++) {
            const a0 = theta + s * TAU / 3;
            const [sr, sg, sb] = [[RdR,RdG,RdB],[BlR,BlG,BlB],[YlR,YlG,YlB]][s];
            dc.beginPath(); dc.moveTo(cx, cy);
            dc.arc(cx, cy, fwR, a0, a0 + TAU / 3); dc.closePath();
            dc.fillStyle = `rgba(${sr},${sg},${sb},${(fwA * 0.38).toFixed(3)})`; dc.fill();
          }
          // Outer rim
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(fwA * 0.70).toFixed(3)})`;
          dc.lineWidth = 1.2;
          dc.beginPath(); dc.arc(cx, cy, fwR, 0, TAU); dc.stroke();
          // Inner rim
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(fwA * 0.36).toFixed(3)})`;
          dc.lineWidth = 0.5;
          dc.beginPath(); dc.arc(cx, cy, fwR * 0.52, 0, TAU); dc.stroke();
          // Spokes
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(fwA * 0.48).toFixed(3)})`;
          dc.lineWidth = 0.7;
          for (let s = 0; s < 3; s++) {
            const a = theta + s * TAU / 3;
            dc.beginPath(); dc.moveTo(cx, cy);
            dc.lineTo(cx + fwR * Math.cos(a), cy + fwR * Math.sin(a)); dc.stroke();
          }
          dc.restore();

          const lwA = Math.round(ss(0.10, 0.26, sp) * 105);
          if (lwA > 3) {
            p.noStroke(); p.fill(FgR, FgG, FgB, lwA);
            p.textSize(7); p.textAlign(p.CENTER, p.CENTER);
            p.text("FW-01", cx, cy + fwR + 16);
          }
        }

        // ── Crank pin + joint pins (above flywheel) ───────────────────────
        if (rodA > 0.004) {
          p.noStroke(); p.fill(FgR, FgG, FgB, Math.round(rodA * 240));
          p.ellipse(crankX, crankY, 7, 7);
          p.fill(BgR, BgG, BgB); p.ellipse(crankX, crankY, 3, 3);
          p.fill(FgR, FgG, FgB, Math.round(rodA * 185));
          for (const [px, py] of pins) p.ellipse(px, py, 5, 5);
        }

        // ── Pistons ───────────────────────────────────────────────────────
        const pistA = ss(0.06, 0.26, sp);
        if (pistA > 0.004) {
          const pw = PISTON_W * M, ph = PISTON_LEN * M;
          for (let i = 0; i < 3; i++) {
            const [px, py] = pins[i];
            const [r, g, b] = PISTON_RGB[i];
            p.push(); p.translate(px, py); p.rotate(PHI[i] + PI / 2);
            p.noStroke(); p.fill(r, g, b, Math.round(pistA * 215));
            p.rect(-pw/2, -ph/2, pw, ph);
            p.noFill(); p.stroke(FgR, FgG, FgB, Math.round(pistA * 155));
            p.strokeWeight(0.8); p.rect(-pw/2, -ph/2, pw, ph);
            p.stroke(FgR, FgG, FgB, Math.round(pistA * 65)); p.strokeWeight(0.5);
            p.line(-pw*0.28, 0, pw*0.28, 0); p.line(0, -ph/2, 0, ph/2);
            p.pop();
          }
        }

        // ── Annotations: crank radius, rod length, ω arc (ch3) ───────────
        const annA = ss(0.52, 0.72, sp);
        if (annA > 0.02) {
          const da = Math.round(annA * 160);
          // Crank radius
          p.stroke(FgR, FgG, FgB, da); p.strokeWeight(0.7);
          p.line(cx, cy, crankX, crankY);
          p.noStroke(); p.fill(FgR, FgG, FgB, da);
          p.textSize(8); p.textAlign(p.CENTER, p.CENTER);
          p.text(`r ${(CRANK_R*100).toFixed(0)}`,
            (cx+crankX)/2 + Math.sin(theta)*12, (cy+crankY)/2 - Math.cos(theta)*12);
          // Rod length (rod 0)
          p.fill(RdR, RdG, RdB, da);
          p.text(`L ${(ROD_L*100).toFixed(0)}`, (crankX+pins[0][0])/2+14, (crankY+pins[0][1])/2);

          // ω arc
          const dc = p.drawingContext as CanvasRenderingContext2D;
          const ωR = fwR + 24;
          dc.save();
          dc.strokeStyle = `rgba(${FgR},${FgG},${FgB},${(annA*0.58).toFixed(3)})`;
          dc.lineWidth = 0.8;
          dc.beginPath(); dc.arc(cx, cy, ωR, theta+0.12, theta+PI*0.64); dc.stroke();
          const arA = theta + PI * 0.64;
          const axe = cx + ωR*Math.cos(arA), aye = cy + ωR*Math.sin(arA);
          const tx = -Math.sin(arA), ty = Math.cos(arA);
          dc.fillStyle = `rgba(${FgR},${FgG},${FgB},${(annA*0.58).toFixed(3)})`;
          dc.beginPath(); dc.moveTo(axe, aye);
          dc.lineTo(axe-tx*6+ty*3, aye-ty*6-tx*3);
          dc.lineTo(axe-tx*6-ty*3, aye-ty*6+tx*3);
          dc.closePath(); dc.fill();
          dc.restore();
          p.noStroke(); p.fill(FgR, FgG, FgB, da); p.textSize(9);
          p.text("ω", cx+ωR*Math.cos(theta+PI*0.33)-10, cy+ωR*Math.sin(theta+PI*0.33)-12);
        }

        // ── Trace accumulation + dissolution (ch4) ────────────────────────
        const traceA = ss(0.77, 0.94, sp);
        if (traceA > 0.01) {
          for (let i = 0; i < 3; i++) {
            const pts = midTraces[i];
            if (pts.length < 4) continue;
            const [r, g, b] = PISTON_RGB[i];
            p.noFill(); p.stroke(r, g, b, Math.round(traceA*58)); p.strokeWeight(0.9);
            p.beginShape();
            for (const [tx, ty] of pts) p.vertex(tx, ty);
            p.endShape();
          }
          if (crankTrace.length > 4) {
            p.noFill(); p.stroke(FgR, FgG, FgB, Math.round(traceA*38)); p.strokeWeight(0.6);
            p.beginShape();
            for (const [tx, ty] of crankTrace) p.vertex(tx, ty);
            p.endShape();
          }
          // Analytical overlays at full dissolution
          const deepA = ss(0.90, 1.00, sp);
          if (deepA > 0.01) {
            const tin  = (ROD_L - CRANK_R - TRACK_PAD) * M;
            const tout = (ROD_L + CRANK_R + TRACK_PAD) * M;
            p.noFill(); p.stroke(FgR, FgG, FgB, Math.round(deepA*135)); p.strokeWeight(1.8);
            p.ellipse(cx, cy, R*2, R*2);
            for (let i = 0; i < 3; i++) {
              const phi = PHI[i]; const [r, g, b] = PISTON_RGB[i];
              p.stroke(r, g, b, Math.round(deepA*145)); p.strokeWeight(2.2);
              p.line(cx+tin*Math.cos(phi), cy+tin*Math.sin(phi),
                     cx+tout*Math.cos(phi), cy+tout*Math.sin(phi));
            }
            p.stroke(FgR, FgG, FgB, Math.round(deepA*55)); p.strokeWeight(1.1);
            p.ellipse(cx, cy, fwR*2, fwR*2);
          }
        }

        // ── HUD ───────────────────────────────────────────────────────────
        const hudA = ss(0.04, 0.18, sp);
        if (hudA > 0.01) {
          p.noStroke(); p.fill(FgR, FgG, FgB, Math.round(hudA*88)); p.textSize(7.5);
          p.textAlign(p.LEFT,  p.TOP);    p.text(`θ ${(theta%TAU).toFixed(3)} rad`, W*0.018, H*0.018);
          p.textAlign(p.RIGHT, p.TOP);    p.text(`sp ${sp.toFixed(4)}`, W*0.982, H*0.018);
          p.textAlign(p.LEFT,  p.BOTTOM); p.text(`CH${Math.min(4,Math.floor(sp*4)+1)}`, W*0.018, H*0.982);
          p.textAlign(p.RIGHT, p.BOTTOM); p.text("RADIAL · ENGINE · FW-01", W*0.982, H*0.982);
        }

        // ── Text overlays ─────────────────────────────────────────────────
        for (let i = 0; i < 12; i++) {
          const [,,i0,i1,o0,o1] = SECTIONS[i];
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

// ── Component ─────────────────────────────────────────────────────────────────
export function NexusLab() {
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
    { top: "50%", left: "50%", textAlign: "center", transform: "translate(-50%,-50%)" },
  ];

  const chips  = ["#e06050", "#5080d0", "#c8a030", "#c8c4be"];
  const texts  = ["#f0dcd0", "#c8d8f0", "#f0e4b8", "#eeeae4"];

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    zIndex: 10, maxWidth: "28rem",
  };

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#0c0a09" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => {
        const chIdx = (sec[0] as number) - 1;
        const [headline, sub] = HEADINGS[i];
        return (
          <div
            key={i}
            ref={(el) => { sectionEls.current[i] = el; }}
            style={{ ...base, ...positions[i] }}
          >
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
