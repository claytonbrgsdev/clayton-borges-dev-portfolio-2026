"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type p5Type from "p5";
import type { ModeSynth, AudioFeedback, CursorAudio, KnobValues } from "@/lib/audio/instrument-synth";
import { MeshSynth, OrbitSynth, FlowSynth, LissSynth, NodeSynth, PENTATONIC_A_MINOR } from "@/lib/audio/instrument-synth";
import { DubChordSynth } from "@/lib/audio/dub-chord-synth";
import type { SliderValues } from "@/lib/audio/instrument-synth";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG  = [242, 240, 236] as const;
const FG  = [10,  10,  10]  as const;
const ACC = [107, 53,  217] as const;
const MUT = [154, 154, 154] as const;
const TAU = Math.PI * 2;

// ── Types ─────────────────────────────────────────────────────────────────────
interface SharedState { mode: number; knobs: SliderValues; seed: number; }

// ── Mode 1: MESH ─────────────────────────────────────────────────────────────
const MESH_COLS = 16, MESH_ROWS = 10;

function drawMesh(p: p5Type, S: SharedState, tau: number) {
  const W = p.width, H = p.height;
  const rate = S.knobs.rate / 100;
  const dens = S.knobs.dens / 100;
  const mod  = S.knobs.mod  / 100;
  const connR = 80 + dens * 180;
  const amp   = mod * 38;
  const mx = p.mouseX, my = p.mouseY;

  const nodes: Array<[number, number]> = [];
  for (let r = 0; r < MESH_ROWS; r++) {
    for (let c = 0; c < MESH_COLS; c++) {
      const bx = (c / (MESH_COLS - 1)) * W * 0.90 + W * 0.05;
      const by = (r / (MESH_ROWS - 1)) * H * 0.84 + H * 0.08;
      const ph = c * 0.48 + r * 0.73 + S.seed * 0.01;
      const dx = Math.sin(tau * (0.5 + rate * 1.6) + ph) * amp;
      const dy = Math.cos(tau * (0.42 + rate * 1.3) + ph * 1.4) * amp;
      nodes.push([bx + dx, by + dy]);
    }
  }

  p.strokeWeight(0.7);
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < connR) {
        p.stroke(FG[0], FG[1], FG[2], Math.floor((1 - d / connR) * 130));
        p.line(nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]);
      }
    }
  }

  p.noStroke();
  for (const [nx, ny] of nodes) {
    const dx = nx - mx, dy = ny - my;
    const inf = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 130);
    if (inf > 0.12) {
      p.fill(ACC[0], ACC[1], ACC[2], Math.floor(140 + inf * 115));
      p.circle(nx, ny, 3 + inf * 7);
    } else {
      p.fill(FG[0], FG[1], FG[2], 110);
      p.circle(nx, ny, 2.5);
    }
  }
}

// ── Mode 2: ORBIT ─────────────────────────────────────────────────────────────
function drawOrbit(p: p5Type, S: SharedState, tau: number) {
  const W = p.width, H = p.height;
  const cx = W * 0.5, cy = H * 0.5;
  const maxR = Math.min(W, H) * 0.42;
  const rate = S.knobs.rate / 100;
  const dens = S.knobs.dens / 100;
  const mod  = S.knobs.mod  / 100;
  const numOrbits = 5;
  const ecc = mod * 0.72;
  const ptPerOrbit = Math.floor(3 + dens * 18);
  const spd = 0.004 + rate * 0.028;

  for (let o = 0; o < numOrbits; o++) {
    const fr = (o + 1) / numOrbits;
    const a = maxR * fr;
    const b = a * (1 - ecc * (0.2 + fr * 0.6));
    const tilt = o * Math.PI * 0.42 + S.seed * 0.001;
    p.noFill();
    p.stroke(FG[0], FG[1], FG[2], 18);
    p.strokeWeight(0.5);
    p.push();
    p.translate(cx, cy);
    p.rotate(tilt);
    p.ellipse(0, 0, a * 2, b * 2);
    p.pop();

    const orbitSpd = spd * (1 + (numOrbits - o) * 0.22);
    p.noStroke();
    for (let i = 0; i < ptPerOrbit; i++) {
      const ph = (i / ptPerOrbit) * TAU;
      const t  = tau * orbitSpd + ph;
      const ex = a * Math.cos(t) * Math.cos(tilt) - b * Math.sin(t) * Math.sin(tilt) + cx;
      const ey = a * Math.cos(t) * Math.sin(tilt) + b * Math.sin(t) * Math.cos(tilt) + cy;
      if (o === 2 || o === 4) {
        p.fill(ACC[0], ACC[1], ACC[2], 200);
        p.circle(ex, ey, 3.5);
      } else {
        p.fill(FG[0], FG[1], FG[2], 155 + o * 14);
        p.circle(ex, ey, 2.5);
      }
    }
  }

  p.stroke(FG[0], FG[1], FG[2], 28);
  p.strokeWeight(0.5);
  p.line(cx - 18, cy, cx + 18, cy);
  p.line(cx, cy - 18, cx, cy + 18);
}

// ── Mode 3: SEQ ───────────────────────────────────────────────────────────────
const SEQ_COLS = 16;
const SEQ_ROWS_MAX = 8;

interface SeqState {
  pattern: boolean[][];
  beat: number;
  timer: number;
  flash: number[];
}

function initSeq(seed: number): SeqState {
  const pattern: boolean[][] = [];
  for (let r = 0; r < SEQ_ROWS_MAX; r++) {
    pattern[r] = [];
    for (let c = 0; c < SEQ_COLS; c++) {
      const n = (r * 16 + c) * 7919 + seed * 31337;
      pattern[r][c] = ((Math.sin(n) * 0.5 + 0.5) * 43758) % 1 > 0.53;
    }
  }
  // Apply default melodic pattern
  pattern[0] = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0].map(Boolean);
  pattern[2] = [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0].map(Boolean);
  pattern[4] = [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0].map(Boolean);
  pattern[7] = [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0].map(Boolean);
  return { pattern, beat: 0, timer: 0, flash: new Array(SEQ_COLS).fill(0) };
}

function drawSeq(p: p5Type, S: SharedState, seq: SeqState, dt: number, bpmRef: React.MutableRefObject<number>, onNote?: (row: number, numRows: number) => void) {
  const W = p.width, H = p.height;
  const dens = S.knobs.dens / 100;
  const rows = Math.floor(4 + dens * 4);

  const margin = Math.min(W, H) * 0.1;
  const cellW = (W - margin * 2) / SEQ_COLS;
  const cellH = Math.min(52, (H - margin * 2) / rows);
  const gridW = cellW * SEQ_COLS;
  const gridH = cellH * rows;
  const ox = (W - gridW) * 0.5;
  const oy = (H - gridH) * 0.5;

  // BPM-synced step advancement: 16th notes per second
  const bpm = bpmRef.current;
  const stepsPerSec = (bpm / 60) * 4;
  seq.timer += dt * stepsPerSec;
  if (seq.timer >= 1) {
    seq.timer -= 1;
    seq.beat = (seq.beat + 1) % SEQ_COLS;
    seq.flash[seq.beat] = 1.0;
    if (onNote) {
      for (let r = 0; r < rows; r++) {
        if (seq.pattern[r]?.[seq.beat]) onNote(r, rows);
      }
    }
  }
  for (let c = 0; c < SEQ_COLS; c++) seq.flash[c] *= 0.80;

  for (let r = 0; r < rows; r++) {
    if (!seq.pattern[r]) continue;
    for (let c = 0; c < SEQ_COLS; c++) {
      const px = ox + c * cellW + cellW * 0.5;
      const py = oy + r * cellH + cellH * 0.5;
      const isActive = seq.pattern[r][c];
      const isBeat = c === seq.beat;
      p.noStroke();
      if (isActive) {
        if (isBeat) {
          p.fill(ACC[0], ACC[1], ACC[2], Math.floor(180 + seq.flash[c] * 75));
          p.circle(px, py, cellH * 0.62);
        } else {
          p.fill(FG[0], FG[1], FG[2], 190);
          p.circle(px, py, cellH * 0.44);
        }
      } else {
        p.fill(FG[0], FG[1], FG[2], isBeat ? 38 : 18);
        p.circle(px, py, cellH * 0.22);
      }
    }
  }

  const phX = ox + seq.beat * cellW;
  p.stroke(ACC[0], ACC[1], ACC[2], Math.floor(38 + seq.flash[seq.beat] * 130));
  p.strokeWeight(1);
  p.line(phX, oy - 12, phX, oy + gridH + 12);

  p.noStroke();
  p.fill(MUT[0], MUT[1], MUT[2], 110);
  p.textAlign(p.CENTER);
  p.textFont("monospace");
  p.textSize(8);
  for (let c = 0; c < SEQ_COLS; c++) {
    p.text(String(c + 1).padStart(2, "0"), ox + c * cellW + cellW * 0.5, oy - 5);
  }
}

// ── Mode 4: FLOW ─────────────────────────────────────────────────────────────
interface FlowPt { x: number; y: number; life: number; maxLife: number; }

function flowAngle(x: number, y: number, t: number, mod: number, W: number, H: number): number {
  const nx = (x / W) * 4;
  const ny = (y / H) * 4;
  const freq = 1 + mod * 2;
  let angle = Math.sin(nx * freq + t) * Math.cos(ny * freq + t * 0.72) * Math.PI;
  if (mod > 0.35) {
    angle += Math.sin(nx * freq * 1.7 - ny * freq * 1.4 + t * 0.85) * (mod - 0.35) * Math.PI * 1.4;
  }
  return angle;
}

function drawFlow(p: p5Type, S: SharedState, pts: FlowPt[], flowTau: number): FlowPt[] {
  const W = p.width, H = p.height;
  const rate = S.knobs.rate / 100;
  const dens = S.knobs.dens / 100;
  const mod  = S.knobs.mod  / 100;
  const maxPt = Math.floor(60 + dens * 440);
  const spd = 1.2 + rate * 4;

  while (pts.length < maxPt) {
    pts.push({ x: Math.random() * W, y: Math.random() * H, life: 0, maxLife: 60 + Math.random() * 100 });
  }

  p.strokeWeight(0.7);
  p.noFill();
  const next: FlowPt[] = [];
  for (const fp of pts) {
    fp.life++;
    const lr = fp.life / fp.maxLife;
    const a = Math.min(1, fp.life / 20) * (1 - Math.max(0, (lr - 0.7) / 0.3));
    if (a > 0.02) {
      const angle = flowAngle(fp.x, fp.y, flowTau, mod, W, H);
      const nx2 = fp.x + Math.cos(angle) * spd;
      const ny2 = fp.y + Math.sin(angle) * spd;
      p.stroke(FG[0], FG[1], FG[2], Math.floor(a * 95));
      p.line(fp.x, fp.y, nx2, ny2);
      fp.x = nx2;
      fp.y = ny2;
    }
    if (fp.life < fp.maxLife && fp.x > -10 && fp.x < W + 10 && fp.y > -10 && fp.y < H + 10) {
      next.push(fp);
    }
  }

  const mx = p.mouseX, my = p.mouseY;
  if (mx >= 0 && mx <= W && my >= 0 && my <= H) {
    const angle = flowAngle(mx, my, flowTau, mod, W, H);
    p.stroke(ACC[0], ACC[1], ACC[2], 230);
    p.strokeWeight(1.5);
    p.line(mx, my, mx + Math.cos(angle) * 26, my + Math.sin(angle) * 26);
    p.noStroke();
    p.fill(ACC[0], ACC[1], ACC[2], 200);
    p.circle(mx, my, 4);
  }
  return next;
}

// ── Mode 5: LISS ─────────────────────────────────────────────────────────────
function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const m = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i];
  return [Math.round(m[0]*255), Math.round(m[1]*255), Math.round(m[2]*255)];
}

function warmthToHue(w: number): number {
  // [0,50]: 220→270 (blue→violet), [50,100]: 270→395%360=35 (violet→amber through magenta)
  if (w <= 50) return 220 + (w / 50) * 50;
  return (270 + ((w - 50) / 50) * 125) % 360;
}

interface LissPoint { x: number; y: number; }

function drawLiss(
  p: p5Type, S: SharedState,
  trail: LissPoint[], lissTau: number, prevA: number,
): [LissPoint[], number, number] {
  const W = p.width, H = p.height;
  const cx = W * 0.5, cy = H * 0.5;
  const rx = Math.min(W, H) * 0.40;
  const ry = rx * 0.9;
  const rate = S.knobs.rate / 100;
  const dens = S.knobs.dens / 100;
  const mod  = S.knobs.mod  / 100;

  const a = 1 + Math.floor(rate * 5.99);
  const bMult = 1 + mod * 2;
  const b = a * bMult;
  const delta = Math.PI / 3 + mod * Math.PI;

  let newTau = lissTau;
  let newPrevA = prevA;
  if (a !== prevA) { trail.length = 0; newTau = 0; newPrevA = a; }

  const maxTrail = Math.floor(300 + dens * 1700);
  const drawSpeed = 0.007 + rate * 0.055;
  const steps = Math.max(1, Math.floor(1 + rate * 14));

  for (let i = 0; i < steps; i++) {
    newTau += drawSpeed / steps;
    trail.push({
      x: cx + rx * Math.sin(a * newTau + delta),
      y: cy + ry * Math.sin(b * newTau),
    });
  }
  while (trail.length > maxTrail) trail.shift();

  p.noFill();
  for (let i = 1; i < trail.length; i++) {
    const t = i / trail.length;
    const isHead = i > trail.length * 0.93;
    if (isHead) {
      p.stroke(ACC[0], ACC[1], ACC[2], Math.floor(t * 255));
      p.strokeWeight(1.5);
    } else {
      const dx = trail[i].x - trail[i - 1].x;
      const dy = trail[i].y - trail[i - 1].y;
      const hue = ((Math.atan2(dy, dx) / Math.PI) * 180 + 360) % 360;
      const [r, g, b] = hsv2rgb(hue, 0.55, 0.52);
      p.stroke(r, g, b, Math.floor(t * 140));
      p.strokeWeight(0.6);
    }
    p.line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }

  p.stroke(FG[0], FG[1], FG[2], 11);
  p.strokeWeight(0.5);
  p.noFill();
  p.circle(cx, cy, rx * 2);
  p.circle(cx, cy, ry * 2);

  p.noStroke();
  p.fill(MUT[0], MUT[1], MUT[2], 130);
  p.textFont("monospace");
  p.textSize(9);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text(`x=sin(${a}t+δ)  y=sin(${b.toFixed(1)}t)  δ=${(delta / Math.PI).toFixed(2)}π`, 16, H - 12);

  return [trail, newTau, newPrevA];
}

// ── Mode 6: NODE ─────────────────────────────────────────────────────────────
interface GNode { x: number; y: number; vx: number; vy: number; }
interface GEdge { a: number; b: number; }

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;   // 1.0 → 0.0
  hue: number;    // captured from WARMTH at spawn time
}

const MAX_PARTICLES = 120;

function spawnParticles(
  x: number,
  y: number,
  warmth: number,
  particles: Particle[],
): void {
  if (particles.length >= MAX_PARTICLES) return;
  const hue = warmthToHue(warmth);
  for (let i = 0; i < 5; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 80;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      hue,
    });
  }
}

function updateAndDrawParticles(p: p5Type, particles: Particle[], dt: number): void {
  p.noStroke();
  let i = particles.length;
  while (i--) {
    const pt = particles[i];
    pt.vx *= 0.93;
    pt.vy *= 0.93;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt * 2.5;
    if (pt.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.fill(pt.hue, 80, 90, Math.floor(200 * pt.life));
    p.circle(pt.x, pt.y, 6 * pt.life);
  }
}

function buildGraph(seed: number, densKnob: number, W: number, H: number): [GNode[], GEdge[]] {
  const count = Math.floor(12 + densKnob * 0.68);
  const rng = (n: number) => {
    const x = Math.sin((n + 1) * 9301 + seed * 49297) * 233280;
    return x - Math.floor(x);
  };
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({ x: rng(i) * W * 0.8 + W * 0.1, y: rng(i + count) * H * 0.8 + H * 0.1, vx: 0, vy: 0 });
  }
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 200 || rng(i * count + j + 1000) < 0.05) {
        edges.push({ a: i, b: j });
      }
    }
  }
  return [nodes, edges];
}

function drawNode(
  p: p5Type,
  S: SharedState,
  nodes: GNode[],
  edges: GEdge[],
  dt: number,
  excite: Float32Array,
  particles: Particle[],
  beatenStep: number,
): [GNode[], GEdge[]] {
  const W = p.width, H = p.height;
  const mod  = S.knobs.mod  / 100;

  let gN = nodes, gE = edges;
  if (gN.length === 0) {
    [gN, gE] = buildGraph(S.seed, S.knobs.dens, W, H);
  }

  const chaos = S.knobs.atck / 100;  // CHAOS = atck in mode 6
  const force = 0.2 + chaos * 6;
  const natLen = 60 + mod * 160;
  const mx = p.mouseX, my = p.mouseY;
  const mouseIn = mx >= 0 && mx <= W && my >= 0 && my <= H;

  for (let i = 0; i < gN.length; i++) {
    const ni = gN[i];
    let fx = 0, fy = 0;
    for (let j = 0; j < gN.length; j++) {
      if (i === j) continue;
      const dx = ni.x - gN[j].x, dy = ni.y - gN[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 40000 && d2 > 1) {
        const d = Math.sqrt(d2);
        fx += (dx / d) * force * 800 / d2;
        fy += (dy / d) * force * 800 / d2;
      }
    }
    for (const e of gE) {
      const other = e.a === i ? e.b : e.b === i ? e.a : -1;
      if (other < 0) continue;
      const dx = gN[other].x - ni.x, dy = gN[other].y - ni.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const spr = force * 0.002 * (d - natLen);
      fx += (dx / d) * spr;
      fy += (dy / d) * spr;
    }
    if (mouseIn) {
      const dx = mx - ni.x, dy = my - ni.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      if (d < 200) { fx += dx * force * 0.5 / d; fy += dy * force * 0.5 / d; }
    }
    fx += (W * 0.5 - ni.x) * 0.002;
    fy += (H * 0.5 - ni.y) * 0.002;
    ni.vx = (ni.vx + fx * dt) * 0.88;
    ni.vy = (ni.vy + fy * dt) * 0.88;
    ni.x  = Math.max(20, Math.min(W - 20, ni.x + ni.vx));
    ni.y  = Math.max(20, Math.min(H - 20, ni.y + ni.vy));
  }

  // Decay excite values
  const glowNorm = S.knobs.rel / 100;
  const decayFactor = 1 - (0.001 + (1 - glowNorm) * 0.04);
  for (let i = 0; i < excite.length; i++) {
    excite[i] = Math.max(0, excite[i] * decayFactor);
  }

  // Mark newly beaten nodes and spawn particles
  if (beatenStep >= 0) {
    for (let i = 0; i < gN.length; i++) {
      if (i % 16 === beatenStep) {
        excite[i] = 1.0;
        spawnParticles(gN[i].x, gN[i].y, S.knobs.filt, particles);
      }
    }
  }

  const warmth  = S.knobs.filt;
  const baseHue = warmthToHue(warmth);
  const natLen2 = 60 + (S.knobs.mod / 100) * 160;

  p.push();
  p.colorMode(p.HSB as unknown as p5Type["HSB"], 360, 100, 100, 255);

  // Draw edges
  p.noFill();
  for (const e of gE) {
    const ea   = excite[e.a] ?? 0;
    const eb   = excite[e.b] ?? 0;
    const eMax = Math.max(ea, eb);
    const eAvg = (ea + eb) * 0.5;
    if (eMax > 0.02) {
      p.strokeWeight(0.7 + eAvg * 3.5);
      p.stroke(baseHue, 60 + eMax * 30, 70 + eMax * 25, Math.floor(80 + eMax * 160));
    } else {
      const dx = gN[e.a].x - gN[e.b].x;
      const dy = gN[e.a].y - gN[e.b].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const stress = Math.max(0, d / natLen2 - 1);
      p.strokeWeight(0.7);
      if (stress > 0.4) {
        p.stroke(baseHue, 65, 65, Math.floor(stress * 130));
      } else {
        p.stroke(baseHue, 30, 40, 65);
      }
    }
    p.line(gN[e.a].x, gN[e.a].y, gN[e.b].x, gN[e.b].y);
  }

  // Draw nodes
  p.noStroke();
  const mx2 = p.mouseX, my2 = p.mouseY;
  const mouseIn2 = mx2 >= 0 && mx2 <= W && my2 >= 0 && my2 <= H;
  for (let i = 0; i < gN.length; i++) {
    const n  = gN[i];
    const ex = excite[i] ?? 0;
    let cursorInf = 0;
    if (mouseIn2) {
      const dx = mx2 - n.x, dy = my2 - n.y;
      cursorInf = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 100);
    }
    const r     = 3 + cursorInf * 2 + ex * 12;
    const alpha = Math.floor(120 + cursorInf * 60 + ex * 135);
    const sat   = 55 + ex * 35;
    const bri   = 60 + ex * 35;
    if (ex > 0.1) {
      p.fill(baseHue, sat * 0.7, bri, Math.floor(ex * 60));
      p.circle(n.x, n.y, (r + 8) * 2);
    }
    p.fill(baseHue, sat, bri, alpha);
    p.circle(n.x, n.y, r * 2);
  }

  // Draw particles
  updateAndDrawParticles(p, particles, dt);

  p.pop();

  return [gN, gE];
}

// ── Audio feedback overlay ────────────────────────────────────────────────────
function drawAudioFeedback(
  p: p5Type,
  feedback: AudioFeedback,
  mode: number,
  cursor: CursorAudio,
  acc: readonly [number, number, number],
  mut: readonly [number, number, number],
): void {
  const amp = feedback.amplitude;
  const mx  = cursor.nx * p.width;
  const my  = cursor.ny * p.height;

  p.push();
  p.noFill();

  if (mode === 1) {
    if (cursor.active && amp > 0.01) {
      p.stroke(acc[0], acc[1], acc[2], Math.floor(amp * 100));
      p.strokeWeight(1.5);
      p.circle(mx, my, 12 + amp * 60);
    }
    if (feedback.pitch > 0) {
      p.noStroke();
      p.fill(mut[0], mut[1], mut[2], 140);
      p.textSize(8);
      p.textFont("monospace");
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(feedback.pitch.toFixed(0) + " Hz · " + feedback.filterCutoff.toFixed(0) + " lp", 14, p.height - 12);
    }
  }

  if (mode === 2) {
    if (cursor.active && amp > 0.05) {
      p.stroke(acc[0], acc[1], acc[2], Math.floor(amp * 180));
      p.strokeWeight(1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = 8 + amp * 30;
        p.line(mx, my, mx + Math.cos(a) * r, my + Math.sin(a) * r);
      }
    }
    if (feedback.pitch > 0) {
      p.noStroke();
      p.fill(mut[0], mut[1], mut[2], 140);
      p.textSize(8);
      p.textFont("monospace");
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(feedback.pitch.toFixed(0) + " Hz", 14, p.height - 12);
    }
  }

  if (mode === 4) {
    if (cursor.active && amp > 0.01) {
      const barH = (1 - cursor.ny) * p.height;
      p.stroke(acc[0], acc[1], acc[2], Math.floor(amp * 180));
      p.strokeWeight(4);
      p.line(2, p.height, 2, p.height - barH);
    }
    if (feedback.pitch > 0) {
      p.noStroke();
      p.fill(mut[0], mut[1], mut[2], 140);
      p.textSize(8);
      p.textFont("monospace");
      p.textAlign(p.RIGHT, p.TOP);
      p.text(feedback.pitch.toFixed(0) + " Hz", p.width - 60, 20);
    }
  }

  if (mode === 5) {
    if (amp > 0.01) {
      p.stroke(acc[0], acc[1], acc[2], Math.floor(amp * 140));
      p.strokeWeight(1);
      p.circle(p.width / 2, p.height / 2, 20 + amp * 60);
    }
    if (feedback.pitch > 0) {
      p.noStroke();
      p.fill(mut[0], mut[1], mut[2], 140);
      p.textSize(8);
      p.textFont("monospace");
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(feedback.pitch.toFixed(0) + " Hz", 14, p.height - 12);
    }
  }

  if (mode === 6) {
    for (let i = 0; i < Math.min(feedback.voiceCount, 4); i++) {
      p.fill(acc[0], acc[1], acc[2], Math.floor(amp * 200));
      p.noStroke();
      p.circle(14 + i * 10, 14, 5);
    }
    if (feedback.pitch > 0) {
      p.noStroke();
      p.fill(mut[0], mut[1], mut[2], 140);
      p.textSize(8);
      p.textFont("monospace");
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(feedback.pitch.toFixed(0) + " Hz", 14, p.height - 12);
    }
  }

  p.pop();
}

// ── Synth sequencer row ───────────────────────────────────────────────────────
interface SynthSeqState { steps: boolean[]; beat: number; timer: number; }
const ACC_S: [number,number,number] = [30, 68, 240]; // accent-blue #1E44F0
const FG_S:  [number,number,number] = [10, 10, 10];

function drawSynthSeq(p: p5Type, synthSeq: SynthSeqState): void {
  const W = p.width;
  const H = p.height;
  const rowH   = 36;
  const rowY   = H - rowH - 4;
  const labelW = 44;
  const padL   = labelW + 4;
  const padR   = 8;
  const seqW   = W - padL - padR;
  const cellW  = seqW / 16;
  const cellH  = 22;
  const cellY  = rowY + (rowH - cellH) / 2;

  // Row background
  p.noStroke();
  p.fill(FG_S[0], FG_S[1], FG_S[2], 5);
  p.rect(0, rowY - 2, W, rowH + 4);

  // Top separator
  p.stroke(FG_S[0], FG_S[1], FG_S[2], 22);
  p.strokeWeight(1);
  p.line(0, rowY - 2, W, rowY - 2);
  p.noStroke();

  // SEQ label
  p.fill(154, 154, 154, 150);
  p.textFont("monospace");
  p.textSize(8);
  p.textAlign(p.LEFT, p.CENTER);
  p.text("SEQ", 8, rowY + rowH / 2);

  for (let s = 0; s < 16; s++) {
    const cx    = padL + s * cellW;
    const isOn  = synthSeq.steps[s];
    const isB   = s === synthSeq.beat;
    const cw    = cellW * 0.80;
    const cx2   = cx + (cellW - cw) / 2;
    const isBar = s % 4 === 0;

    if (isOn && isB) {
      p.fill(ACC_S[0], ACC_S[1], ACC_S[2], 44);
      p.noStroke();
      p.rect(cx2 - 3, cellY - 3, cw + 6, cellH + 6, 5);
      p.fill(ACC_S[0], ACC_S[1], ACC_S[2], 255);
      p.rect(cx2, cellY, cw, cellH, 3);
    } else if (isOn) {
      p.fill(ACC_S[0], ACC_S[1], ACC_S[2], 185);
      p.noStroke();
      p.rect(cx2, cellY, cw, cellH, 3);
    } else if (isB) {
      p.noFill();
      p.stroke(ACC_S[0], ACC_S[1], ACC_S[2], 75);
      p.strokeWeight(1);
      p.rect(cx2, cellY, cw, cellH, 3);
      p.noStroke();
    } else {
      p.fill(FG_S[0], FG_S[1], FG_S[2], isBar ? 26 : 14);
      p.noStroke();
      p.rect(cx2, cellY, cw, cellH, 3);
    }
  }

  // Group dividers
  p.stroke(FG_S[0], FG_S[1], FG_S[2], 40);
  p.strokeWeight(1);
  for (let g = 4; g < 16; g += 4) {
    const gx = padL + g * cellW;
    p.line(gx, cellY - 3, gx, cellY + cellH + 3);
  }
  p.noStroke();
  p.textAlign(p.LEFT, p.BASELINE);
}

// ── Mode button ───────────────────────────────────────────────────────────────
function ModeBtn({ code, label, active, onClick }: { code: string; label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "var(--font-geist-mono,monospace)",
        fontSize: 11,
        letterSpacing: "0.06em",
        padding: "8px 0",
        minHeight: 32,
        border: active ? "1.5px solid #1E44F0" : "1px solid rgba(10,10,10,0.18)",
        background: active ? "#1E44F0" : hov ? "rgba(30,68,240,0.06)" : "transparent",
        color: active ? "#F2F0EC" : hov ? "#1E44F0" : "#9A9A9A",
        cursor: "pointer",
        borderRadius: 2,
        transition: "background 0.1s, border-color 0.1s, color 0.1s",
        flex: 1,
        outline: "none",
      }}
    >
      {code}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export interface InstrumentLabels {
  live_label: string;
  portfolio_code: string;
  tagline: string;
  seed_label: string;
  kb_hint: string;
}

export interface InstrumentSketchProps {
  labels: InstrumentLabels;
  audioCtxRef: React.MutableRefObject<AudioContext | null>;
  mutedRef: React.MutableRefObject<boolean>;
  bpmRef: React.MutableRefObject<number>;
  dens: number;
  mod: number;
  onDensChange: (v: number) => void;
  onModChange: (v: number) => void;
  atck: number;
  rel:  number;
  filt: number;
  chd:  number;
  onAtckChange: (v: number) => void;
  onRelChange:  (v: number) => void;
  onFiltChange: (v: number) => void;
  onChdChange:  (v: number) => void;
  muted: boolean;
  onMuteToggle: () => void;
  isMobile: boolean;
  onModeChange?: (mode: number) => void;
}

const MODES = [
  { code: "M01", label: "MESH — pulsing node network" },
  { code: "M02", label: "ORBIT — elliptic particle orbits" },
  { code: "M03", label: "SEQ — rhythmic dot sequencer" },
  { code: "M04", label: "FLOW — vector flow field" },
  { code: "M05", label: "LISS — Lissajous curves" },
  { code: "M06", label: "NODE — force-directed graph" },
];

export function InstrumentSketch({
  audioCtxRef,
  mutedRef,
  bpmRef,
  dens,
  mod,
  atck,
  rel,
  filt,
  chd,
  isMobile,
  onModeChange,
}: InstrumentSketchProps) {
  const [mode, setMode]   = useState(1);
  const [seed, setSeed]   = useState(42);

  // slidersRef holds current values readable by p5 closure
  const slidersRef = useRef<SliderValues>({ dens, mod, rate: 50, atck, rel, filt, chd });
  slidersRef.current = { dens, mod, rate: 50, atck, rel, filt, chd };

  // knobsRef for backward compat with synth classes that expect KnobValues
  const knobsRef = useRef<KnobValues>({ dens, mod, rate: 50 });
  knobsRef.current = { dens, mod, rate: 50 };

  const stateRef    = useRef<SharedState>({ mode: 1, knobs: { dens, mod, rate: 50, atck: 30, rel: 40, filt: 70, chd: 50 }, seed: 42 });
  const canvasRef   = useRef<HTMLDivElement>(null);
  const p5Ref       = useRef<p5Type | null>(null);

  // Updated each render so p5 closure always calls the latest version
  const onSeqNoteRef = useRef<((row: number, numRows: number) => void) | null>(null);

  // Synth instances — keyed by mode number
  const synthsRef   = useRef<Partial<Record<number, ModeSynth>>>({});
  const cursorRef   = useRef<CursorAudio>({ nx: 0.5, ny: 0.5, active: false });
  const feedbackRef = useRef<AudioFeedback>({ amplitude: 0, pitch: 0, voiceCount: 0, filterCutoff: 800 });

  // DubChordSynth for mode 3 backing chords
  const dubChordSynthRef = useRef<DubChordSynth | null>(null);

  // SEQ-mode cursor for pitch/filter modulation
  const seqCursorRef = useRef<{ nx: number; ny: number; active: boolean }>({ nx: 0.5, ny: 0.5, active: false });
  const seqFilterRef = useRef<BiquadFilterNode | null>(null);
  const seqAmpRef    = useRef<number>(0);
  const seqPitchRef  = useRef<number>(0);
  const seqCutoffRef = useRef<number>(800);

  // Keep stateRef.knobs in sync with props
  stateRef.current.knobs = slidersRef.current;

  // ── Audio helpers ────────────────────────────────────────────────────────────
  const ensureCtx = useCallback((): AudioContext | null => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new AudioContext(); } catch { return null; }
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }, [audioCtxRef]);

  const getSynth = useCallback((m: number): ModeSynth | null => {
    if (mutedRef.current) return null;
    if (!synthsRef.current[m]) {
      switch (m) {
        case 1: synthsRef.current[1] = new MeshSynth();  break;
        case 2: synthsRef.current[2] = new OrbitSynth(); break;
        case 4: synthsRef.current[4] = new FlowSynth();  break;
        case 5: synthsRef.current[5] = new LissSynth();  break;
        case 6: synthsRef.current[6] = new NodeSynth();  break;
      }
    }
    return synthsRef.current[m] ?? null;
  }, [mutedRef]);

  const ensureCtxRef = useRef(ensureCtx);
  const getSynthRef  = useRef(getSynth);
  ensureCtxRef.current = ensureCtx;
  getSynthRef.current  = getSynth;

  // SEQ note callback — updated each render
  onSeqNoteRef.current = (row: number, numRows: number) => {
    if (mutedRef.current) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    } catch { return; }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const pitchIdx = Math.round((numRows - 1 - row) / (numRows - 1) * (PENTATONIC_A_MINOR.length - 1));
    const baseFreq = PENTATONIC_A_MINOR[Math.max(0, Math.min(pitchIdx, PENTATONIC_A_MINOR.length - 1))];

    const semitoneShift = Math.round((seqCursorRef.current.nx - 0.5) * 24);
    const shiftedFreq   = baseFreq * Math.pow(2, semitoneShift / 12);

    const attackSec = 0.005 + (slidersRef.current.atck / 100) * 0.495;
    const relSec    = 0.05  + (slidersRef.current.rel  / 100) * 1.95;
    const filterHz  = 200   + (slidersRef.current.filt / 100) * 7800;

    if (!seqFilterRef.current) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = filterHz;
      f.connect(ctx.destination);
      seqFilterRef.current = f;
    }
    seqFilterRef.current.frequency.setTargetAtTime(filterHz, ctx.currentTime, 0.02);

    const vol  = 0.10 * (stateRef.current.knobs.dens / 100 * 0.7 + 0.3);
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(seqFilterRef.current);
    osc.type = "sine";
    osc.frequency.value = shiftedFreq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attackSec);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + attackSec + relSec * 0.7);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + attackSec + relSec);

    seqAmpRef.current    = 1.0;
    seqPitchRef.current  = shiftedFreq;
    seqCutoffRef.current = filterHz;
  };

  const handleMode = (m: number) => {
    setMode(m);
    stateRef.current.mode = m;
    onModeChange?.(m);
  };
  const handleSeed = () => {
    const ns = (stateRef.current.seed + Math.floor(Math.random() * 199) + 17) % 9999;
    setSeed(ns);
    stateRef.current.seed = ns;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 6) handleMode(n);
      if (e.key === " ") { e.preventDefault(); handleSeed(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // p5 sketch
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    let alive = true;
    let inst: p5Type | null = null;

    let meshTau  = 0;
    let orbitTau = 0;
    let seqState = initSeq(42);
    let flowPts: FlowPt[] = [];
    let flowTau  = 0;
    let lissTrail: LissPoint[] = [];
    let lissTau  = 0;
    let prevLissA = -1;
    let gNodes: GNode[] = [];
    let gEdges: GEdge[] = [];
    let nodeExcite: Float32Array = new Float32Array(80);
    const particles: Particle[] = [];
    let beatenStepThisFrame = -1;
    let prevMode = -1;
    let prevSeed = -1;

    // Synth sequencer state (closure variable — NOT React state)
    const synthSeq: SynthSeqState = {
      steps: new Array(16).fill(false) as boolean[],
      beat:  0,
      timer: 0,
    };
    synthSeq.steps[0] = true;
    synthSeq.steps[4] = true;
    synthSeq.steps[8] = true;
    synthSeq.steps[12] = true;

    import("p5").then(({ default: P5 }) => {
      if (!alive) return;

      const sketch = (p: p5Type) => {
        p.setup = () => {
          const w = container.offsetWidth  || 600;
          const h = container.offsetHeight || 400;
          const cvs = p.createCanvas(w, h);
          (cvs.elt as HTMLCanvasElement).style.display = "block";
          p.pixelDensity(1);
          p.textFont("monospace");
        };

        p.draw = () => {
          const S = stateRef.current;
          const dt = Math.min(p.deltaTime / 1000, 0.05);

          if (S.mode !== prevMode || S.seed !== prevSeed) {
            if (S.mode !== prevMode) {
              const prevSynth = synthsRef.current[prevMode];
              if (prevSynth && audioCtxRef.current) {
                prevSynth.onCursorLeave(audioCtxRef.current);
              }
              cursorRef.current = { ...cursorRef.current, active: false };

              meshTau = 0; orbitTau = 0;
              flowPts = []; flowTau = 0;
              lissTrail = []; lissTau = 0; prevLissA = -1;
              gNodes = []; gEdges = [];
              nodeExcite = new Float32Array(80);
              particles.length = 0;
              beatenStepThisFrame = -1;
              if (S.mode === 3) seqState = initSeq(S.seed);
            }
            if (S.mode === 3 && S.seed !== prevSeed) seqState = initSeq(S.seed);
            if (S.mode === 6 && S.seed !== prevSeed) {
              gNodes = []; gEdges = [];
              nodeExcite = new Float32Array(80);
              particles.length = 0;
              beatenStepThisFrame = -1;
            }
            prevMode = S.mode;
            prevSeed = S.seed;
          }

          p.background(BG[0], BG[1], BG[2]);

          // Advance synth sequencer
          {
            const stepsPerSec = (bpmRef.current / 60) * 4;
            synthSeq.timer += dt * stepsPerSec;
            if (synthSeq.timer >= 1) {
              synthSeq.timer -= 1;
              synthSeq.beat = (synthSeq.beat + 1) % 16;
              if (synthSeq.steps[synthSeq.beat] && !mutedRef.current) {
                const sl = slidersRef.current;
                const ctx = audioCtxRef.current;
                if (S.mode === 3) {
                  if (!dubChordSynthRef.current) dubChordSynthRef.current = new DubChordSynth();
                  dubChordSynthRef.current.trigger(sl, ctx, cursorRef.current.ny);
                } else if (S.mode === 6) {
                  beatenStepThisFrame = synthSeq.beat;
                  const nodeSynth = getSynthRef.current(6) as NodeSynth | null;
                  if (nodeSynth && audioCtxRef.current) {
                    nodeSynth.triggerChord(synthSeq.beat, slidersRef.current, audioCtxRef.current);
                  }
                } else {
                  onSeqNoteRef.current?.(Math.floor(Math.random() * 8), 8);
                }
              }
            }
          }

          let capturedNodes: Array<{ x: number; y: number }> = [];

          switch (S.mode) {
            case 1:
              drawMesh(p, S, meshTau);
              meshTau  += dt * (0.5 + (S.knobs.rate / 100) * 1.8);
              break;
            case 2:
              drawOrbit(p, S, orbitTau);
              orbitTau += dt * 0.8;
              break;
            case 3:
              drawSeq(p, S, seqState, dt, bpmRef, (row, numRows) => onSeqNoteRef.current?.(row, numRows));
              break;
            case 4:
              flowPts = drawFlow(p, S, flowPts, flowTau);
              flowTau += dt * (0.3 + (S.knobs.rate / 100) * 2);
              break;
            case 5: {
              const [nt, ntau, npa] = drawLiss(p, S, lissTrail, lissTau, prevLissA);
              lissTrail = nt; lissTau = ntau; prevLissA = npa;
              break;
            }
            case 6: {
              const [nn, ne] = drawNode(p, S, gNodes, gEdges, dt, nodeExcite, particles, beatenStepThisFrame);
              gNodes = nn; gEdges = ne;
              capturedNodes = gNodes;
              beatenStepThisFrame = -1;
              break;
            }
          }

          if (audioCtxRef.current) {
            const ctx   = audioCtxRef.current;
            const cursor = cursorRef.current;
            const m     = S.mode;

            if (m !== 3) {
              const synth = getSynthRef.current(m);
              if (synth && !mutedRef.current) {
                let extra: Record<string, unknown> | undefined;
                if (m === 6) {
                  extra = { nodes: capturedNodes, width: p.width, height: p.height };
                }
                synth.tick?.(cursor, S.knobs, ctx, dt, extra);
                feedbackRef.current = synth.getFeedback();
              } else {
                feedbackRef.current = { amplitude: 0, pitch: 0, voiceCount: 0, filterCutoff: 800 };
              }
            } else {
              seqAmpRef.current *= 0.85;
              feedbackRef.current = {
                amplitude:   seqAmpRef.current,
                pitch:       seqPitchRef.current,
                voiceCount:  0,
                filterCutoff: seqCutoffRef.current,
              };
            }
          }

          drawAudioFeedback(p, feedbackRef.current, S.mode, cursorRef.current, ACC, MUT);

          // Draw synth sequencer row
          drawSynthSeq(p, synthSeq);

          p.noStroke();
          p.fill(MUT[0], MUT[1], MUT[2], 100);
          p.textSize(9);
          p.textAlign(p.RIGHT, p.TOP);
          p.text(MODES[S.mode - 1].code, p.width - 12, 12);
        };

        p.windowResized = () => {
          const w = container.offsetWidth;
          const h = container.offsetHeight;
          if (w > 0 && h > 0) p.resizeCanvas(w, h);
        };

        p.mouseMoved = (_e?: object): void => {
          const inCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
          const nx = Math.max(0, Math.min(1, p.mouseX / p.width));
          const ny = Math.max(0, Math.min(1, p.mouseY / p.height));
          cursorRef.current    = { nx, ny, active: inCanvas };
          seqCursorRef.current = { nx, ny, active: inCanvas };
          if (inCanvas && !mutedRef.current) {
            const ctx  = ensureCtxRef.current();
            const m    = stateRef.current.mode;
            if (ctx && m !== 3) {
              getSynthRef.current(m)?.onCursorMove({ nx, ny, active: true }, stateRef.current.knobs, ctx);
            }
          }
        };

        p.mousePressed = (_e?: object): void => {
          // Synth sequencer row click
          const seqRowY = p.height - 36 - 4;
          if (p.mouseY >= seqRowY - 2 && p.mouseY <= seqRowY + 40) {
            const labelW = 48;
            const cellW  = (p.width - labelW - 8) / 16;
            const col    = Math.floor((p.mouseX - labelW) / cellW);
            if (col >= 0 && col < 16) {
              synthSeq.steps[col] = !synthSeq.steps[col];
              return; // don't process other click logic
            }
          }

          const nx = Math.max(0, Math.min(1, p.mouseX / p.width));
          const ny = Math.max(0, Math.min(1, p.mouseY / p.height));
          const inCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
          if (inCanvas && !mutedRef.current) {
            const ctx  = ensureCtxRef.current();
            const m    = stateRef.current.mode;
            if (ctx && m !== 3) {
              getSynthRef.current(m)?.onCursorClick?.({ nx, ny, active: true }, stateRef.current.knobs, ctx);
            }
          }
        };

        p.mouseDragged = (_e?: object): void => {
          p.mouseMoved();
        };

        (p as unknown as Record<string, unknown>).touchMoved = (): boolean => {
          p.mouseMoved();
          return false;
        };
      };

      inst = new P5(sketch, container) as p5Type;
      p5Ref.current = inst;
    });

    const ro = new ResizeObserver(() => {
      const pi = p5Ref.current as unknown as { resizeCanvas: (w: number, h: number) => void } | null;
      if (pi && container.offsetWidth > 0) pi.resizeCanvas(container.offsetWidth, container.offsetHeight);
    });
    ro.observe(container);

    return () => {
      alive = false;
      inst?.remove();
      ro.disconnect();
      const ctx = audioCtxRef.current;
      if (ctx) {
        Object.values(synthsRef.current).forEach(s => s?.dispose(ctx));
      }
      synthsRef.current = {};
      dubChordSynthRef.current?.dispose();
      dubChordSynthRef.current = null;
    };
  }, [audioCtxRef, mutedRef, bpmRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const border = "1px solid rgba(10,10,10,0.12)";
  const mono   = "var(--font-geist-mono,monospace)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Mode button row */}
      <div style={{ borderBottom: border, padding: "6px 10px", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4, flex: 1 }}>
          {MODES.map((m, i) => (
            <ModeBtn key={m.code} code={m.code} label={m.label} active={mode === i + 1} onClick={() => handleMode(i + 1)} />
          ))}
        </div>
        {!isMobile && (
          <button
            onClick={handleSeed}
            title="Randomize seed (Space)"
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: "0.08em",
              color: "#9A9A9A",
              background: "transparent",
              border: "1px solid rgba(10,10,10,0.15)",
              borderRadius: 2,
              padding: "3px 7px",
              cursor: "pointer",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            SEED: {String(seed).padStart(4, "0")}
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={{ flex: 1, minHeight: 0, overflow: "hidden", background: "#F2F0EC", cursor: "crosshair" }}
      />
    </div>
  );
}
