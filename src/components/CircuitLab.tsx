"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";

const TAU = Math.PI * 2;
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0, i1, sp) * (1 - ss(o0, o1, sp));
const sr = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
const distSeg = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

const SECTIONS = [
  [1, "SUBSTRATE",   "ground · power",     0.000, 0.018, 0.065, 0.083],
  [1, "POWER RAIL",  "regulate · filter",  0.083, 0.101, 0.149, 0.167],
  [1, "INPUT",       "source · signal",    0.167, 0.185, 0.232, 0.250],
  [2, "DATA BUS",    "parallel · channel", 0.250, 0.268, 0.315, 0.333],
  [2, "MEMORY",      "buffer · address",   0.333, 0.351, 0.399, 0.417],
  [2, "TRANSCEIVER", "drive · receive",    0.417, 0.435, 0.482, 0.500],
  [3, "LOGIC",       "gate · state",       0.500, 0.518, 0.565, 0.583],
  [3, "PROCESSOR",   "execute · compute",  0.583, 0.601, 0.649, 0.667],
  [3, "ROUTING",     "signal · path",      0.667, 0.685, 0.732, 0.750],
  [4, "OUTPUT",      "drive · amplify",    0.750, 0.768, 0.815, 0.833],
  [4, "INVERT",      "complement · flip",  0.833, 0.851, 0.899, 0.917],
  [4, "OPEN",        "release · end",      0.917, 0.935, 0.982, 1.000],
] as const;

interface Trace {
  x1: number; y1: number; x2: number; y2: number;
  thick: boolean; chapter: number; revealOrder: number; phase: number;
}
interface Via { x: number; y: number; chapter: number; }
interface Comp {
  x: number; y: number; w: number; h: number;
  type: "ic" | "passive" | "conn"; ref: string; chapter: number;
  pins: Array<[number, number]>;
}

const TRACES: Trace[] = [];
const VIAS:   Via[]   = [];
const COMPS:  Comp[]  = [];

(function buildPCB() {
  let s = 1;
  const tr = (x1: number, y1: number, x2: number, y2: number, ch: number, ro: number, thick = false) =>
    TRACES.push({ x1, y1, x2, y2, thick, chapter: ch, revealOrder: ro, phase: sr(s++) * TAU });
  const via = (x: number, y: number, ch: number) => VIAS.push({ x, y, chapter: ch });

  // ── Global layout constants ───────────────────────────────────────────────
  const VCC = 0.080, GND = 0.920;
  const TL = 0.065, TR = 0.935;

  // Vertical routing buses
  const V1  = 0.290;  // Ch1 right / Ch2 left boundary
  const V2R = 0.558;  // Ch2 right boundary
  const V3  = 0.778;  // Ch3/4 boundary

  // Passive rail y-positions
  const P1T = 0.168, P1B = 0.840;   // Ch1 top/bottom passives
  const PT  = 0.142, PB  = 0.858;   // Ch2-4 top/bottom passives

  // ── IC pin coordinates ────────────────────────────────────────────────────

  // U1 — Voltage regulator (Ch1, left zone)
  const U1L = 0.106, U1R = 0.250;
  const U1Y = [0.252, 0.284, 0.316, 0.348, 0.380] as const;

  // U2 — Filter/LDO (Ch1, left zone lower)
  const U2L = 0.106, U2R = 0.250;
  const U2Y = [0.606, 0.636, 0.666, 0.696] as const;

  // U3 — SRAM (Ch2, center-left)
  const U3L = 0.332, U3R = 0.534;
  const U3Y = [0.292, 0.324, 0.356, 0.388, 0.420, 0.452, 0.484, 0.516] as const;

  // U4 — Bus transceiver (Ch2, below U3)
  const U4L = 0.332, U4R = 0.534;
  const U4Y = [0.618, 0.646, 0.674, 0.702] as const;

  // U5 — CPU (Ch3, large central component)
  const U5L = 0.586, U5R = 0.756;
  const U5Y = [0.228, 0.260, 0.292, 0.324, 0.356, 0.388, 0.420, 0.452, 0.484, 0.516, 0.548, 0.580, 0.612] as const;
  const U5TX = [0.618, 0.643, 0.668, 0.693, 0.718] as const;
  const U5TY = 0.182, U5BY = 0.686;

  // U6 — Output driver (Ch4)
  const U6L = 0.812, U6R = 0.908;
  const U6Y = [0.256, 0.285, 0.314, 0.343, 0.372, 0.401] as const;

  // J1 — Output connector (Ch4)
  const J1XS = [0.838, 0.855, 0.872, 0.889, 0.906, 0.923] as const;
  const J1Y1 = 0.578, J1Y2 = 0.650;
  const J1_BUS = 0.558;

  // ── Ch1 — Power / Input ───────────────────────────────────────────────────

  // Power rails (thick)
  tr(0.060, VCC, 0.940, VCC, 1, 0.00, true);
  tr(0.060, GND, 0.940, GND, 1, 0.01, true);
  tr(TL, VCC, TL, GND, 1, 0.02, true);
  tr(TR, VCC, TR, GND, 1, 0.03, true);

  // Ch1 top passive row: TL ──R1──C1──R2── V1
  tr(TL,   P1T, 0.070, P1T, 1, 0.05);
  tr(0.110, P1T, 0.155, P1T, 1, 0.06);
  tr(0.195, P1T, 0.240, P1T, 1, 0.07);
  tr(0.280, P1T, V1,   P1T, 1, 0.08);
  tr(0.195, VCC, 0.195, P1T, 1, 0.09);   // VCC ↓ C1 right pin

  // V1 vertical spine (Ch1): P1T → U1 top → gap → U2 bottom → P1B
  tr(V1, P1T,    V1, U1Y[0],  1, 0.11);
  tr(V1, U1Y[4], V1, U2Y[0],  1, 0.37);
  tr(V1, U2Y[3], V1, P1B,     1, 0.57);

  // U1 left stubs: TL → U1 left pins
  tr(TL, U1Y[0], U1L, U1Y[0], 1, 0.13);
  tr(TL, U1Y[1], U1L, U1Y[1], 1, 0.16);
  tr(TL, U1Y[2], U1L, U1Y[2], 1, 0.19);
  tr(TL, U1Y[3], U1L, U1Y[3], 1, 0.22);
  tr(TL, U1Y[4], U1L, U1Y[4], 1, 0.25);

  // U1 right stubs: U1 right pins → V1
  tr(U1R, U1Y[0], V1, U1Y[0], 1, 0.28);
  tr(U1R, U1Y[1], V1, U1Y[1], 1, 0.30);
  tr(U1R, U1Y[2], V1, U1Y[2], 1, 0.32);
  tr(U1R, U1Y[3], V1, U1Y[3], 1, 0.34);
  tr(U1R, U1Y[4], V1, U1Y[4], 1, 0.36);

  // U2 left stubs: TL → U2 left pins
  tr(TL, U2Y[0], U2L, U2Y[0], 1, 0.42);
  tr(TL, U2Y[1], U2L, U2Y[1], 1, 0.46);
  tr(TL, U2Y[2], U2L, U2Y[2], 1, 0.50);
  tr(TL, U2Y[3], U2L, U2Y[3], 1, 0.54);

  // U2 right stubs: U2 right pins → V1
  tr(U2R, U2Y[0], V1, U2Y[0], 1, 0.44);
  tr(U2R, U2Y[1], V1, U2Y[1], 1, 0.48);
  tr(U2R, U2Y[2], V1, U2Y[2], 1, 0.52);
  tr(U2R, U2Y[3], V1, U2Y[3], 1, 0.56);

  // Ch1 bottom passive row: TL ──C2──R3──C3── V1
  tr(TL,   P1B, 0.070, P1B, 1, 0.60);
  tr(0.110, P1B, 0.155, P1B, 1, 0.63);
  tr(0.195, P1B, 0.240, P1B, 1, 0.66);
  tr(0.280, P1B, V1,   P1B, 1, 0.69);
  tr(0.175, P1B, 0.175, GND, 1, 0.72);   // R3 center ↓ GND

  // Ch1 vias at T-junctions on V1
  via(0.195, VCC, 1);
  via(V1, P1T,    1); via(V1, U1Y[0], 1); via(V1, U1Y[4], 1);
  via(V1, U2Y[0], 1); via(V1, U2Y[3], 1); via(V1, P1B,    1);

  // ── Ch2 — Data Bus ────────────────────────────────────────────────────────

  // V1/V2L vertical (Ch2 extends V1 to cover U3/U4 pin range)
  tr(V1, U3Y[0], V1, U4Y[3], 2, 0.04);

  // Data bus: 8 horizontal traces, V1 → U3 left pins
  tr(V1, U3Y[0], U3L, U3Y[0], 2, 0.07);
  tr(V1, U3Y[1], U3L, U3Y[1], 2, 0.10);
  tr(V1, U3Y[2], U3L, U3Y[2], 2, 0.13);
  tr(V1, U3Y[3], U3L, U3Y[3], 2, 0.16);
  tr(V1, U3Y[4], U3L, U3Y[4], 2, 0.19);
  tr(V1, U3Y[5], U3L, U3Y[5], 2, 0.22);
  tr(V1, U3Y[6], U3L, U3Y[6], 2, 0.25);
  tr(V1, U3Y[7], U3L, U3Y[7], 2, 0.28);

  // U3 right stubs → V2R
  tr(U3R, U3Y[0], V2R, U3Y[0], 2, 0.31);
  tr(U3R, U3Y[1], V2R, U3Y[1], 2, 0.34);
  tr(U3R, U3Y[2], V2R, U3Y[2], 2, 0.37);
  tr(U3R, U3Y[3], V2R, U3Y[3], 2, 0.40);
  tr(U3R, U3Y[4], V2R, U3Y[4], 2, 0.43);
  tr(U3R, U3Y[5], V2R, U3Y[5], 2, 0.46);
  tr(U3R, U3Y[6], V2R, U3Y[6], 2, 0.49);
  tr(U3R, U3Y[7], V2R, U3Y[7], 2, 0.52);

  // V2R vertical bus
  tr(V2R, U3Y[0], V2R, U4Y[3], 2, 0.55);

  // U4 left stubs: V1 → U4 left pins
  tr(V1, U4Y[0], U4L, U4Y[0], 2, 0.60);
  tr(V1, U4Y[1], U4L, U4Y[1], 2, 0.63);
  tr(V1, U4Y[2], U4L, U4Y[2], 2, 0.66);
  tr(V1, U4Y[3], U4L, U4Y[3], 2, 0.69);

  // U4 right stubs → V2R
  tr(U4R, U4Y[0], V2R, U4Y[0], 2, 0.72);
  tr(U4R, U4Y[1], V2R, U4Y[1], 2, 0.75);
  tr(U4R, U4Y[2], V2R, U4Y[2], 2, 0.78);
  tr(U4R, U4Y[3], V2R, U4Y[3], 2, 0.81);

  // Ch2 top passive row: V1 ──R4──C4──R5── V2R
  tr(V1,   PT, 0.335, PT, 2, 0.83);
  tr(0.375, PT, 0.410, PT, 2, 0.85);
  tr(0.450, PT, 0.490, PT, 2, 0.87);
  tr(0.530, PT, V2R,  PT, 2, 0.89);
  tr(0.430, VCC, 0.430, PT, 2, 0.91);   // VCC ↓ C4

  // Ch2 bottom passive row: V1 ──C5──R6── V2R
  tr(V1,   PB, 0.335, PB, 2, 0.93);
  tr(0.375, PB, 0.490, PB, 2, 0.95);
  tr(0.530, PB, V2R,  PB, 2, 0.97);
  tr(0.355, PB, 0.355, GND, 2, 0.99);   // C5 ↓ GND

  // Ch2 vias at bus T-junctions
  via(V1,  U3Y[0], 2); via(V1,  U3Y[7], 2);
  via(V1,  U4Y[0], 2); via(V1,  U4Y[3], 2);
  via(V2R, U3Y[0], 2); via(V2R, U3Y[7], 2);
  via(V2R, U4Y[0], 2); via(V2R, U4Y[3], 2);
  via(0.430, VCC,  2);

  // ── Ch3 — Logic / Processing ─────────────────────────────────────────────

  // Data bridge: V2R → U5 left pins (U5Y[2..9] align with U3Y[0..7])
  tr(V2R, U5Y[2],  U5L, U5Y[2],  3, 0.04);
  tr(V2R, U5Y[3],  U5L, U5Y[3],  3, 0.07);
  tr(V2R, U5Y[4],  U5L, U5Y[4],  3, 0.10);
  tr(V2R, U5Y[5],  U5L, U5Y[5],  3, 0.13);
  tr(V2R, U5Y[6],  U5L, U5Y[6],  3, 0.16);
  tr(V2R, U5Y[7],  U5L, U5Y[7],  3, 0.19);
  tr(V2R, U5Y[8],  U5L, U5Y[8],  3, 0.22);
  tr(V2R, U5Y[9],  U5L, U5Y[9],  3, 0.25);

  // V2R extends to cover full U5 left-pin range
  tr(V2R, U5Y[0],  V2R, U5Y[12], 3, 0.28);

  // U5 control/power pins (top and bottom of left side)
  tr(V2R, U5Y[0],  U5L, U5Y[0],  3, 0.31);
  tr(V2R, U5Y[1],  U5L, U5Y[1],  3, 0.33);
  tr(V2R, U5Y[10], U5L, U5Y[10], 3, 0.35);
  tr(V2R, U5Y[11], U5L, U5Y[11], 3, 0.37);
  tr(V2R, U5Y[12], U5L, U5Y[12], 3, 0.39);

  // U5 right stubs → V3
  tr(U5R, U5Y[0],  V3, U5Y[0],  3, 0.42);
  tr(U5R, U5Y[1],  V3, U5Y[1],  3, 0.44);
  tr(U5R, U5Y[2],  V3, U5Y[2],  3, 0.46);
  tr(U5R, U5Y[3],  V3, U5Y[3],  3, 0.48);
  tr(U5R, U5Y[4],  V3, U5Y[4],  3, 0.50);
  tr(U5R, U5Y[5],  V3, U5Y[5],  3, 0.52);
  tr(U5R, U5Y[6],  V3, U5Y[6],  3, 0.54);
  tr(U5R, U5Y[7],  V3, U5Y[7],  3, 0.56);
  tr(U5R, U5Y[8],  V3, U5Y[8],  3, 0.58);
  tr(U5R, U5Y[9],  V3, U5Y[9],  3, 0.60);
  tr(U5R, U5Y[10], V3, U5Y[10], 3, 0.62);
  tr(U5R, U5Y[11], V3, U5Y[11], 3, 0.64);
  tr(U5R, U5Y[12], V3, U5Y[12], 3, 0.66);

  // V3 vertical bus (collects all U5 right pins)
  tr(V3, U5Y[0], V3, U5Y[12], 3, 0.68);

  // U5 top pins → VCC (power supply columns)
  tr(U5TX[0], VCC, U5TX[0], U5TY, 3, 0.70);
  tr(U5TX[1], VCC, U5TX[1], U5TY, 3, 0.72);
  tr(U5TX[2], VCC, U5TX[2], U5TY, 3, 0.74);
  tr(U5TX[3], VCC, U5TX[3], U5TY, 3, 0.76);
  tr(U5TX[4], VCC, U5TX[4], U5TY, 3, 0.78);

  // U5 bottom pins → GND
  tr(U5TX[0], U5BY, U5TX[0], GND, 3, 0.80);
  tr(U5TX[1], U5BY, U5TX[1], GND, 3, 0.82);
  tr(U5TX[2], U5BY, U5TX[2], GND, 3, 0.84);
  tr(U5TX[3], U5BY, U5TX[3], GND, 3, 0.86);
  tr(U5TX[4], U5BY, U5TX[4], GND, 3, 0.88);

  // Ch3 top passive row: V2R ──C6──R7──C7── V3
  tr(V2R, PT, 0.598, PT, 3, 0.90);
  tr(0.638, PT, 0.648, PT, 3, 0.91);
  tr(0.688, PT, 0.698, PT, 3, 0.92);
  tr(0.738, PT, V3,   PT, 3, 0.93);
  tr(0.668, VCC, 0.668, PT, 3, 0.94);   // VCC ↓ R7

  // Ch3 bottom passive row: V2R ── V3 horizontal
  tr(V2R, PB, V3, PB, 3, 0.96);

  // Ch3 vias
  via(V2R, U5Y[0],  3); via(V2R, U5Y[12], 3);
  via(V3,  U5Y[0],  3); via(V3,  U5Y[12], 3);
  via(0.668, VCC,   3);
  via(V2R, PT, 3); via(V3, PT, 3);

  // ── Ch4 — Output ─────────────────────────────────────────────────────────

  // V3 extended to cover U6 pin range
  tr(V3, U6Y[0], V3, U6Y[5], 4, 0.04);

  // U6 left stubs: V3 → U6 left pins
  tr(V3, U6Y[0], U6L, U6Y[0], 4, 0.07);
  tr(V3, U6Y[1], U6L, U6Y[1], 4, 0.11);
  tr(V3, U6Y[2], U6L, U6Y[2], 4, 0.15);
  tr(V3, U6Y[3], U6L, U6Y[3], 4, 0.19);
  tr(V3, U6Y[4], U6L, U6Y[4], 4, 0.23);
  tr(V3, U6Y[5], U6L, U6Y[5], 4, 0.27);

  // U6 right stubs → TR
  tr(U6R, U6Y[0], TR, U6Y[0], 4, 0.30);
  tr(U6R, U6Y[1], TR, U6Y[1], 4, 0.33);
  tr(U6R, U6Y[2], TR, U6Y[2], 4, 0.36);
  tr(U6R, U6Y[3], TR, U6Y[3], 4, 0.39);
  tr(U6R, U6Y[4], TR, U6Y[4], 4, 0.42);
  tr(U6R, U6Y[5], TR, U6Y[5], 4, 0.45);

  // J1 signal bus: V3 → J1 area → TR (full width horizontal)
  tr(V3, J1_BUS, TR, J1_BUS, 4, 0.50);

  // J1 column stubs: bus → through both pad rows
  tr(J1XS[0], J1_BUS, J1XS[0], J1Y2, 4, 0.53);
  tr(J1XS[1], J1_BUS, J1XS[1], J1Y2, 4, 0.56);
  tr(J1XS[2], J1_BUS, J1XS[2], J1Y2, 4, 0.59);
  tr(J1XS[3], J1_BUS, J1XS[3], J1Y2, 4, 0.62);
  tr(J1XS[4], J1_BUS, J1XS[4], J1Y2, 4, 0.65);
  tr(J1XS[5], J1_BUS, J1XS[5], J1Y2, 4, 0.68);

  // Ch4 top passive row: V3 ──R8──C8── TR
  tr(V3,   PT, 0.810, PT, 4, 0.72);
  tr(0.850, PT, 0.860, PT, 4, 0.75);
  tr(0.900, PT, TR,   PT, 4, 0.78);
  tr(0.880, VCC, 0.880, PT, 4, 0.81);   // VCC ↓ C8

  // Ch4 bottom passive: V3 ──R9── TR
  tr(V3,   PB, 0.858, PB, 4, 0.84);
  tr(0.898, PB, TR,   PB, 4, 0.87);

  // Ch4 vias at T-junctions
  via(V3,  U6Y[0],  4); via(V3,  U6Y[5],  4);
  via(V3,  J1_BUS,  4);
  via(0.880, VCC,   4);
  for (const x of J1XS) via(x, J1_BUS, 4);

  // ── Components ────────────────────────────────────────────────────────────

  // U1 — Voltage regulator
  const u1pins: Array<[number,number]> = [];
  for (const y of U1Y) { u1pins.push([U1L, y]); u1pins.push([U1R, y]); }
  COMPS.push({
    x: U1L + 0.012, y: U1Y[0] - 0.020, w: U1R - U1L - 0.024,
    h: U1Y[4] - U1Y[0] + 0.040, type: "ic", ref: "U1", chapter: 1, pins: u1pins,
  });

  // U2 — Filter/LDO
  const u2pins: Array<[number,number]> = [];
  for (const y of U2Y) { u2pins.push([U2L, y]); u2pins.push([U2R, y]); }
  COMPS.push({
    x: U2L + 0.012, y: U2Y[0] - 0.020, w: U2R - U2L - 0.024,
    h: U2Y[3] - U2Y[0] + 0.040, type: "ic", ref: "U2", chapter: 1, pins: u2pins,
  });

  // U3 — SRAM
  const u3pins: Array<[number,number]> = [];
  for (const y of U3Y) { u3pins.push([U3L, y]); u3pins.push([U3R, y]); }
  COMPS.push({
    x: U3L + 0.012, y: U3Y[0] - 0.020, w: U3R - U3L - 0.024,
    h: U3Y[7] - U3Y[0] + 0.040, type: "ic", ref: "U3", chapter: 2, pins: u3pins,
  });

  // U4 — Bus transceiver
  const u4pins: Array<[number,number]> = [];
  for (const y of U4Y) { u4pins.push([U4L, y]); u4pins.push([U4R, y]); }
  COMPS.push({
    x: U4L + 0.012, y: U4Y[0] - 0.020, w: U4R - U4L - 0.024,
    h: U4Y[3] - U4Y[0] + 0.040, type: "ic", ref: "U4", chapter: 2, pins: u4pins,
  });

  // U5 — CPU (with top/bottom pins)
  const u5pins: Array<[number,number]> = [];
  for (const y of U5Y)  { u5pins.push([U5L, y]); u5pins.push([U5R, y]); }
  for (const x of U5TX) { u5pins.push([x, U5TY]); u5pins.push([x, U5BY]); }
  COMPS.push({
    x: U5L + 0.012, y: U5TY + 0.012, w: U5R - U5L - 0.024,
    h: U5BY - U5TY - 0.024, type: "ic", ref: "U5", chapter: 3, pins: u5pins,
  });

  // U6 — Output driver
  const u6pins: Array<[number,number]> = [];
  for (const y of U6Y) { u6pins.push([U6L, y]); u6pins.push([U6R, y]); }
  COMPS.push({
    x: U6L + 0.012, y: U6Y[0] - 0.020, w: U6R - U6L - 0.024,
    h: U6Y[5] - U6Y[0] + 0.040, type: "ic", ref: "U6", chapter: 4, pins: u6pins,
  });

  // J1 — Connector
  const j1pins: Array<[number,number]> = [];
  for (const x of J1XS) { j1pins.push([x, J1Y1]); j1pins.push([x, J1Y2]); }
  COMPS.push({
    x: J1XS[0] - 0.012, y: J1Y1 - 0.016,
    w: J1XS[5] - J1XS[0] + 0.024, h: J1Y2 - J1Y1 + 0.032,
    type: "conn", ref: "J1", chapter: 4, pins: j1pins,
  });

  // Passives
  const passiveDefs: Array<[number, number, string, number]> = [
    [0.090, P1T, "R1", 1], [0.175, P1T, "C1", 1], [0.260, P1T, "R2", 1],
    [0.090, P1B, "C2", 1], [0.175, P1B, "R3", 1], [0.260, P1B, "C3", 1],
    [0.355, PT,  "R4", 2], [0.430, PT,  "C4", 2], [0.510, PT,  "R5", 2],
    [0.355, PB,  "C5", 2], [0.510, PB,  "R6", 2],
    [0.618, PT,  "C6", 3], [0.668, PT,  "R7", 3], [0.718, PT,  "C7", 3],
    [0.830, PT,  "R8", 4], [0.880, PT,  "C8", 4],
    [0.878, PB,  "R9", 4],
  ];
  for (const [px, py, ref, ch] of passiveDefs) {
    COMPS.push({
      x: px - 0.015, y: py - 0.009, w: 0.030, h: 0.018,
      type: "passive", ref, chapter: ch,
      pins: [[px - 0.020, py] as [number,number], [px + 0.020, py] as [number,number]],
    });
  }
})();

// ── sketch ────────────────────────────────────────────────────────────────────

function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement | null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const sketch = (p: p5Type) => {
      let W = 0, H = 0, tau = 0;
      let prevMX = -1, prevMY = -1;

      p.setup = () => {
        W = el.offsetWidth; H = el.offsetHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style: (k: string, v: string) => void }).style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      };

      p.windowResized = () => { W = el.offsetWidth; H = el.offsetHeight; p.resizeCanvas(W, H); };

      const partialLine = (x1: number, y1: number, x2: number, y2: number, t: number) => {
        if (t <= 0) return;
        p.line(x1, y1, lerp(x1, x2, Math.min(t, 1)), lerp(y1, y2, Math.min(t, 1)));
      };

      const radialGlow = (cx: number, cy: number, r: number, brightness: number, alpha: number) => {
        const dc = p.drawingContext as CanvasRenderingContext2D;
        dc.save();
        const g = dc.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,   `rgba(${brightness},${brightness},${brightness},${alpha})`);
        g.addColorStop(0.4, `rgba(${brightness},${brightness},${brightness},${alpha * 0.3})`);
        g.addColorStop(1,   `rgba(${brightness},${brightness},${brightness},0)`);
        dc.fillStyle = g;
        dc.beginPath(); dc.arc(cx, cy, r, 0, TAU); dc.fill();
        dc.restore();
      };

      p.draw = () => {
        const sp = Math.max(0, Math.min(1, window.scrollY / (scrollEl.scrollHeight - H)));
        tau += 0.016;

        // inv: 0 = black bg / white lines, 1 = white bg / black lines
        const inv = ss(0.78, 0.95, sp);
        const bgC = Math.round(lerp(0, 255, inv));
        const fgC = Math.round(lerp(255, 0, inv));

        const cp = [
          ss(0.00, 0.25, sp), ss(0.25, 0.50, sp),
          ss(0.50, 0.75, sp), ss(0.75, 1.00, sp),
        ];
        const ca = [
          ss(0.00, 0.10, sp) * (1 - ss(0.22, 0.32, sp)) + ss(0.25, 0.50, sp) * 0.20,
          ss(0.25, 0.35, sp) * (1 - ss(0.47, 0.57, sp)) + ss(0.50, 0.75, sp) * 0.16,
          ss(0.50, 0.60, sp) * (1 - ss(0.72, 0.80, sp)) + ss(0.75, 1.00, sp) * 0.12,
          ss(0.75, 0.85, sp),
        ];

        // Cursor
        const curMX = p.mouseX, curMY = p.mouseY;
        const inCanvas = curMX >= 0 && curMX <= W && curMY >= 0 && curMY <= H;
        const curVel = prevMX >= 0 ? Math.min(1, Math.hypot(curMX - prevMX, curMY - prevMY) / 14) : 0;
        prevMX = curMX; prevMY = curMY;
        const curR = 60 + 12 * Math.sin(tau * 1.6) + curVel * 18;

        // ── Background ────────────────────────────────────────────────────
        p.background(bgC);

        // Inversion flash
        const flashW = ss(0.777, 0.783, sp) * (1 - ss(0.783, 0.820, sp));
        if (flashW > 0) {
          p.noStroke(); p.fill(255, 255, 255, Math.round(flashW * 230));
          p.rect(0, 0, W, H);
        }

        // ── Dot grid ──────────────────────────────────────────────────────
        const gridA = ss(0.02, 0.10, sp) * lerp(14, 9, inv);
        if (gridA > 1) {
          const step = Math.round(W * 0.042);
          p.noStroke();
          for (let gx = Math.round(0.04 * W); gx < 0.96 * W; gx += step) {
            for (let gy = Math.round(0.04 * H); gy < 0.96 * H; gy += step) {
              p.fill(fgC, fgC, fgC, gridA);
              p.circle(gx, gy, 1.2);
            }
          }
        }

        // ── PCB border ────────────────────────────────────────────────────
        const borderA = ss(0.02, 0.10, sp);
        if (borderA > 0) {
          p.noFill();
          p.stroke(fgC, fgC, fgC, Math.round(borderA * lerp(55, 95, inv)));
          p.strokeWeight(0.9);
          p.rect(0.04 * W, 0.04 * H, 0.92 * W, 0.92 * H, 4);
        }

        // ── Cursor crosshair ──────────────────────────────────────────────
        if (inCanvas) {
          p.stroke(fgC, fgC, fgC, Math.round(lerp(12, 20, curVel)));
          p.strokeWeight(0.5);
          p.line(0, curMY, W, curMY);
          p.line(curMX, 0, curMX, H);
        }

        // ── Traces ────────────────────────────────────────────────────────
        for (const t of TRACES) {
          const chi = t.chapter - 1;
          const prog = ss(t.revealOrder, t.revealOrder + 0.10, cp[chi]);
          if (prog <= 0) continue;

          const x1 = t.x1 * W, y1 = t.y1 * H;
          const x2 = t.x2 * W, y2 = t.y2 * H;

          let curBoost = 0;
          if (inCanvas) {
            const d = distSeg(curMX, curMY, x1, y1, x2, y2);
            curBoost = Math.max(0, 1 - d / curR);
            curBoost = curBoost * curBoost;
          }

          const baseA = Math.round(lerp(190, 172, inv) * prog);
          p.stroke(fgC, fgC, fgC, Math.min(255, baseA + Math.round(curBoost * 55)));
          p.strokeWeight(t.thick ? 2.6 : 1.2);
          p.strokeCap(p.SQUARE);
          partialLine(x1, y1, x2, y2, prog);

          if (curBoost > 0.08) {
            const bv = inv < 0.5 ? 255 : 0;
            p.stroke(bv, bv, bv, Math.round(curBoost * 80));
            p.strokeWeight(t.thick ? 3.8 : 1.9);
            partialLine(x1, y1, x2, y2, prog);
          }

          // Signal pulse
          if (prog > 0.92 && ca[chi] > 0.02) {
            const pulseP = ((tau * (t.thick ? 0.7 : 1.4) + t.phase) % TAU) / TAU;
            const px = lerp(x1, x2, pulseP);
            const py = lerp(y1, y2, pulseP);
            const dotR = t.thick ? 5 : 3.5;

            if (inv < 0.75) {
              radialGlow(px, py, dotR * 3.5, 255, (1 - inv * 1.3) * ca[chi] * 0.6);
            }
            p.noStroke();
            p.fill(fgC, fgC, fgC, Math.round(lerp(210, 195, inv)));
            p.circle(px, py, dotR);
          }
        }

        // ── Vias ──────────────────────────────────────────────────────────
        for (const v of VIAS) {
          const chi = v.chapter - 1;
          const prog = cp[chi];
          if (prog < 0.12) continue;

          const vx = v.x * W, vy = v.y * H;
          const vA = ss(0.12, 0.30, prog);

          let viaNear = 0;
          if (inCanvas) {
            viaNear = Math.max(0, 1 - Math.hypot(vx - curMX, vy - curMY) / 45);
          }

          p.noFill();
          p.stroke(fgC, fgC, fgC, Math.round(vA * lerp(165, 185, inv)));
          p.strokeWeight(1.0);
          p.circle(vx, vy, 10);

          p.noStroke();
          p.fill(bgC, bgC, bgC, 255);
          p.circle(vx, vy, 5.5);

          p.noFill();
          p.stroke(fgC, fgC, fgC, Math.round(vA * lerp(50, 65, inv)));
          p.strokeWeight(0.5);
          p.circle(vx, vy, 16);

          if (viaNear > 0.05) {
            for (let r = 0; r < 3; r++) {
              const rr = 8 + ((tau * 38 + r * 24) % 48);
              p.noFill();
              p.stroke(fgC, fgC, fgC, Math.round(viaNear * (1 - rr / 48) * lerp(85, 65, inv)));
              p.strokeWeight(0.5);
              p.circle(vx, vy, rr * 2);
            }
          }
        }

        // ── Components ────────────────────────────────────────────────────
        for (const c of COMPS) {
          const chi = c.chapter - 1;
          const prog = ss(0.20, 0.60, cp[chi]);
          if (prog <= 0) continue;

          const cx = c.x * W, cy = c.y * H;
          const cw = c.w * W, ch_ = c.h * H;

          const bodyOffset = Math.round(lerp(18, -18, inv));
          const bodyFill = Math.max(0, Math.min(255, bgC + bodyOffset));

          if (c.type === "ic") {
            p.noStroke();
            p.fill(bodyFill, bodyFill, bodyFill, Math.round(prog * 255));
            p.rect(cx, cy, cw, ch_, 2);
            p.noFill();
            p.stroke(fgC, fgC, fgC, Math.round(prog * lerp(105, 135, inv)));
            p.strokeWeight(0.8);
            p.rect(cx, cy, cw, ch_, 2);
            p.noStroke();
            p.fill(fgC, fgC, fgC, Math.round(prog * lerp(85, 105, inv)));
            p.circle(cx + 5, cy + 5, 3);
          } else if (c.type === "passive") {
            p.noStroke();
            p.fill(bodyFill, bodyFill, bodyFill, Math.round(prog * 248));
            p.rect(cx, cy, cw, ch_);
            p.noFill();
            p.stroke(fgC, fgC, fgC, Math.round(prog * lerp(65, 85, inv)));
            p.strokeWeight(0.5);
            p.rect(cx, cy, cw, ch_);
          } else {
            p.noStroke();
            p.fill(bodyFill, bodyFill, bodyFill, Math.round(prog * 248));
            p.rect(cx, cy, cw, ch_, 1);
            p.noFill();
            p.stroke(fgC, fgC, fgC, Math.round(prog * lerp(85, 105, inv)));
            p.strokeWeight(0.7);
            p.rect(cx, cy, cw, ch_, 1);
          }

          p.noStroke();
          for (const [px, py] of c.pins) {
            p.fill(fgC, fgC, fgC, Math.round(prog * lerp(165, 185, inv)));
            p.rect(px * W - 2.5, py * H - 2.5, 5, 5);
          }

          const refA = prog * 0.62;
          if (refA > 0.05) {
            p.noStroke();
            p.fill(fgC, fgC, fgC, Math.round(refA * lerp(120, 150, inv)));
            p.textSize(c.type === "ic" ? 8.5 : 6.5);
            p.textAlign(p.LEFT, p.TOP);
            p.text(c.ref, cx + (c.type === "ic" ? 3 : 1), cy - (c.type === "ic" ? 10 : 8));
          }
        }

        // ── Corner fiducials ──────────────────────────────────────────────
        const fidA = ss(0.03, 0.12, sp);
        if (fidA > 0.02) {
          const corners: Array<[number,number]> = [
            [0.055*W, 0.055*H], [0.945*W, 0.055*H],
            [0.055*W, 0.945*H], [0.945*W, 0.945*H],
          ];
          for (const [fx, fy] of corners) {
            p.noFill();
            p.stroke(fgC, fgC, fgC, Math.round(fidA * lerp(105, 135, inv)));
            p.strokeWeight(0.8);
            p.circle(fx, fy, 10);
            p.circle(fx, fy, 17);
            p.noStroke();
            p.fill(bgC, bgC, bgC, 255);
            p.circle(fx, fy, 6);
            p.fill(fgC, fgC, fgC, Math.round(fidA * lerp(145, 175, inv)));
            p.circle(fx, fy, 3);
          }
        }

        // ── Cursor scan ring ──────────────────────────────────────────────
        if (inCanvas) {
          const dc = p.drawingContext as CanvasRenderingContext2D;
          const ra = lerp(0.20, 0.30, curVel);

          dc.save();
          dc.setLineDash([3, 6]);
          dc.strokeStyle = `rgba(${fgC},${fgC},${fgC},${ra})`;
          dc.lineWidth = 0.7;
          dc.beginPath(); dc.arc(curMX, curMY, curR, 0, TAU); dc.stroke();
          dc.restore();

          dc.save();
          dc.setLineDash([2, 8]);
          dc.strokeStyle = `rgba(${fgC},${fgC},${fgC},${ra * 0.38})`;
          dc.lineWidth = 0.5;
          dc.beginPath(); dc.arc(curMX, curMY, curR * 0.44, 0, TAU); dc.stroke();
          dc.restore();

          p.noStroke();
          p.fill(fgC, fgC, fgC, 135 + Math.round(curVel * 80));
          p.circle(curMX, curMY, 3.5);
        }

        // ── Text overlays ─────────────────────────────────────────────────
        const textRgb = `rgb(${fgC},${fgC},${fgC})`;
        for (let i = 0; i < 12; i++) {
          const sec = SECTIONS[i];
          const alpha = secAlpha(sp, sec[3] as number, sec[4] as number, sec[5] as number, sec[6] as number);
          const divEl = sectionEls[i];
          if (!divEl) continue;
          divEl.style.opacity = alpha.toFixed(3);
          divEl.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
          divEl.style.color = textRgb;
        }
      };
    };
    return new P5(sketch, el) as unknown as p5Type;
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export function CircuitLab() {
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

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    fontFamily: "var(--font-mono, 'Courier New', monospace)",
    zIndex: 10, color: "#ffffff",
  };

  const positions: React.CSSProperties[] = [
    { top: "12%",    left: "7%" },
    { bottom: "14%", right: "8%",  textAlign: "right" },
    { top: "50%",    left: "7%",   transform: "translateY(-50%)" },
    { top: "12%",    right: "8%",  textAlign: "right" },
    { bottom: "14%", left: "7%" },
    { top: "50%",    right: "8%",  textAlign: "right", transform: "translateY(-50%)" },
    { top: "12%",    left: "7%" },
    { bottom: "14%", right: "8%",  textAlign: "right" },
    { top: "50%",    left: "7%",   transform: "translateY(-50%)" },
    { top: "12%",    right: "8%",  textAlign: "right" },
    { bottom: "14%", left: "7%" },
    { top: "50%",    left: "50%",  transform: "translate(-50%,-50%)", textAlign: "center" },
  ];

  return (
    <div ref={scrollRef} style={{ height: "1200vh", background: "#000000" }}>
      <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 1 }} />

      {SECTIONS.map((sec, i) => (
        <div
          key={i}
          ref={(el) => { sectionEls.current[i] = el; }}
          style={{ ...base, ...positions[i] }}
        >
          <span style={{
            fontSize: "0.55rem", letterSpacing: "0.32em", display: "block",
            marginBottom: 8, textTransform: "uppercase", opacity: 0.50,
          }}>
            {`ch${sec[0]} · ${String(sec[1]).toLowerCase()}`}
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 4.2vw, 3.4rem)", fontWeight: 700, lineHeight: 1.08, margin: 0 }}>
            {String(sec[1])}
            <br />
            <span style={{ fontSize: "0.44em", fontWeight: 300, opacity: 0.65, letterSpacing: "0.07em" }}>
              {String(sec[2])}
            </span>
          </h2>
        </div>
      ))}
    </div>
  );
}
