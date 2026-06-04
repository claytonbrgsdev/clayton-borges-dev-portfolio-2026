"use client";

import { useEffect, useRef } from "react";
import type p5Type from "p5";
import { makeNoiseBuffer, fireKick, fireSnare, fireHiHat, fireTom } from "@/lib/audio/drum-synth";

// ── Color constants ────────────────────────────────────────────────────────────
const BG:        [number, number, number] = [242, 240, 236]; // #F2F0EC
const FG:        [number, number, number] = [10,  10,  10];  // #0A0A0A
const ACC:       [number, number, number] = [107, 53,  217]; // #6B35D9
const MUT:       [number, number, number] = [100, 100, 100]; // dim
const OLED_BG:     [number,number,number] = [8,   12,  20];   // dark blue-black
const OLED_FG:     [number,number,number] = [190, 210, 240];  // cold blue-white
const OLED_DIM:    [number,number,number] = [80,  100, 130];  // grey-blue
const OLED_BRIGHT: [number,number,number] = [220, 235, 255];  // bright cold white

// ── Default groove preset ──────────────────────────────────────────────────────
const DEFAULT_GRID: boolean[][] = [
  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0].map(Boolean), // KICK
  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0].map(Boolean), // SNARE
  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0].map(Boolean), // HIHAT
  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0].map(Boolean), // TOM
];
const TRACK_LABELS = ["KICK", "SNRE", "HIHT", "TOM"];

// ── Props ─────────────────────────────────────────────────────────────────────
interface DrumMachineProps {
  audioCtxRef: React.MutableRefObject<AudioContext | null>;
  mutedRef:    React.MutableRefObject<boolean>;
  bpmRef:      React.MutableRefObject<number>;
  swingRef:    React.MutableRefObject<number>;
  velRef:      React.MutableRefObject<number>;
  isMobile:    boolean;
}

export function DrumMachineSketch({ audioCtxRef, mutedRef, bpmRef, swingRef, velRef }: DrumMachineProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    // Closure state
    const grid: boolean[][] = DEFAULT_GRID.map(row => [...row]);
    let currentStep = 0;
    let stepTimer   = 0;
    let prevTime    = 0;
    const beatFlash: [number, number, number, number] = [0, 0, 0, 0];
    let noiseBuffer: AudioBuffer | null = null;
    let inst: p5Type | null = null;

    // Layout vars — recomputed each draw frame
    let oledX  = 0;
    const oledY  = 12;
    let oledW  = 256;
    let oledH  = 96;
    let ox     = 48;
    let oy     = 130;
    let cellW  = 20;
    let cellH  = 36;
    let gridH  = 144;

    function recomputeLayout(W: number, H: number): void {
      oledW = Math.min(Math.floor(W * 0.45), 200);
      oledH = Math.floor(oledW / 2);
      oledX = Math.floor((W - oledW) / 2);
      const labelColW = 54;
      ox    = labelColW;
      oy    = oledY + oledH + 22;
      cellW = (W - ox - 10) / 16;
      cellH = Math.min(44, (H - oy - 6) / 4);
      gridH = cellH * 4;
    }

    function fireDrum(track: 0 | 1 | 2 | 3, masterVel: number, swingOffset: number): void {
      const ctx = audioCtxRef.current;
      if (!ctx || mutedRef.current) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const vol  = 0.1 + masterVel * 0.8;
      const when = ctx.currentTime + swingOffset;
      if (!noiseBuffer) noiseBuffer = makeNoiseBuffer(ctx);
      switch (track) {
        case 0: fireKick(ctx, vol, when);                    break;
        case 1: fireSnare(ctx, vol, when, noiseBuffer);      break;
        case 2: fireHiHat(ctx, vol, when, noiseBuffer);      break;
        case 3: fireTom(ctx, vol, when);                     break;
      }
    }

    function drawOled(p: p5Type, bpm: number, step: number): void {
      // Module panel border
      p.stroke(FG[0], FG[1], FG[2], 18);
      p.strokeWeight(1);
      p.noFill();
      p.rect(oledX - 8, oledY - 14, oledW + 16, oledH + 18, 3);

      // Module code label
      p.noStroke();
      p.fill(154, 154, 154, 180);
      p.textSize(7);
      p.textFont("monospace");
      p.textAlign(p.LEFT, p.TOP);
      p.text("SCR-01", oledX - 6, oledY - 12);

      // Bezel
      p.fill(14, 18, 28); p.noStroke();
      p.rect(oledX - 4, oledY - 4, oledW + 8, oledH + 8, 4);
      // Screen bg
      p.fill(OLED_BG[0], OLED_BG[1], OLED_BG[2]);
      p.rect(oledX, oledY, oledW, oledH);
      // Scanlines
      p.noStroke();
      for (let sy = oledY; sy < oledY + oledH; sy += 2) {
        p.fill(0, 0, 0, 12);
        p.rect(oledX, sy, oledW, 1);
      }
      // BPM readout (large)
      p.fill(OLED_BRIGHT[0], OLED_BRIGHT[1], OLED_BRIGHT[2]);
      p.textSize(Math.floor(oledH * 0.28)); p.textFont("monospace");
      p.textAlign(p.LEFT, p.TOP);
      p.noStroke();
      p.text(String(bpm) + " BPM", oledX + 8, oledY + 8);
      // Step indicator
      p.textSize(Math.floor(oledH * 0.12));
      p.fill(OLED_FG[0], OLED_FG[1], OLED_FG[2], 180);
      p.text("STEP " + String(step + 1).padStart(2, "0") + "/16", oledX + 8, oledY + 44);
      // Pattern label
      p.textAlign(p.RIGHT, p.TOP);
      p.textSize(Math.floor(oledH * 0.11));
      p.fill(OLED_DIM[0], OLED_DIM[1], OLED_DIM[2]);
      p.text("PATTERN A", oledX + oledW - 8, oledY + 8);
      // Mini step preview dots (16 dots at bottom of OLED)
      const dotW = Math.floor((oledW - 16) / 16);
      for (let i = 0; i < 16; i++) {
        const dx = oledX + 8 + i * dotW;
        const dy = oledY + oledH - 14;
        const anyActive = [0, 1, 2, 3].some(t => grid[t][i]);
        if (i === step) {
          p.fill(OLED_BRIGHT[0], OLED_BRIGHT[1], OLED_BRIGHT[2]);
        } else if (anyActive) {
          p.fill(OLED_FG[0], OLED_FG[1], OLED_FG[2], 160);
        } else {
          p.fill(OLED_FG[0], OLED_FG[1], OLED_FG[2], 40);
        }
        p.rect(dx, dy, dotW - 2, 5, 1);
      }
      p.textAlign(p.LEFT, p.BASELINE); // reset
    }

    function drawDrumGrid(p: p5Type): void {
      // Track labels — redesigned
      for (let t = 0; t < 4; t++) {
        const ly = oy + t * cellH;

        // Label background panel
        p.noStroke();
        p.fill(FG[0], FG[1], FG[2], 7);
        p.rect(2, ly + 3, ox - 4, cellH - 6, 2);

        // Beat flash indicator dot (left edge)
        const dotAlphas: [number, number, number, number] = [210, 170, 130, 90];
        const flash = beatFlash[t as 0|1|2|3];
        const flashedAlpha = Math.floor(dotAlphas[t as 0|1|2|3] + flash * (255 - dotAlphas[t as 0|1|2|3]));
        p.fill(ACC[0], ACC[1], ACC[2], flashedAlpha);
        p.noStroke();
        const dotR = flash > 0.15 ? 9 : 6;
        p.circle(11, ly + cellH * 0.5, dotR);

        // Label text — brightens on hit
        p.textFont("monospace");
        p.textSize(8);
        p.textAlign(p.LEFT, p.CENTER);
        p.fill(FG[0], FG[1], FG[2], flash > 0.15 ? 220 : 120);
        p.text(TRACK_LABELS[t], 20, ly + cellH * 0.5);
      }

      // Playhead sweep background
      const px = ox + currentStep * cellW;
      p.noStroke();
      p.fill(ACC[0], ACC[1], ACC[2], 20);
      p.rect(px, oy, cellW, gridH, 0);

      // Playhead thin line
      const allFlash = (beatFlash[0] + beatFlash[1] + beatFlash[2] + beatFlash[3]) / 4;
      p.stroke(ACC[0], ACC[1], ACC[2], Math.floor(50 + allFlash * 100));
      p.strokeWeight(1);
      p.line(ox + currentStep * cellW, oy - 2, ox + currentStep * cellW, oy + gridH + 2);
      p.noStroke();

      // Step cells — redesigned
      for (let t = 0; t < 4; t++) {
        for (let s = 0; s < 16; s++) {
          const cx = ox + s * cellW;
          const cy = oy + t * cellH;
          const isBar1 = s % 4 === 0;
          const cw = cellW * 0.82;
          const ch = isBar1 ? cellH * 0.78 : cellH * 0.68;
          const cx2 = cx + (cellW - cw) * 0.5;
          const cy2 = cy + (cellH - ch) * 0.5;
          const isActive = grid[t][s];
          const isHead   = s === currentStep;
          const flash    = beatFlash[t as 0|1|2|3];

          if (isActive && isHead) {
            // Outer glow halo
            p.fill(ACC[0], ACC[1], ACC[2], Math.floor(flash * 50 + 15));
            p.noStroke();
            p.rect(cx2 - 4, cy2 - 4, cw + 8, ch + 8, 5);
            // Main fill
            p.fill(ACC[0], ACC[1], ACC[2], 255);
            p.rect(cx2, cy2, cw, ch, 3);
          } else if (isActive) {
            p.fill(FG[0], FG[1], FG[2], 210);
            p.noStroke();
            p.rect(cx2, cy2, cw, ch, 3);
          } else if (isHead) {
            p.fill(ACC[0], ACC[1], ACC[2], 20);
            p.stroke(ACC[0], ACC[1], ACC[2], 85);
            p.strokeWeight(1);
            p.rect(cx2, cy2, cw, ch, 3);
            p.noStroke();
          } else {
            p.fill(FG[0], FG[1], FG[2], isBar1 ? 28 : 16);
            p.noStroke();
            p.rect(cx2, cy2, cw, ch, 3);
          }
        }
      }

      // Group dividers every 4 steps — stronger
      p.stroke(FG[0], FG[1], FG[2], 55);
      p.strokeWeight(1.5);
      for (let g = 4; g < 16; g += 4) {
        const gx = ox + g * cellW;
        p.line(gx, oy - 6, gx, oy + gridH + 6);
      }
      p.noStroke();
    }

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    import("p5").then(({ default: P5 }) => {
      if (!alive || !canvasRef.current) return;
      inst = new P5((p: p5Type) => {
        p.setup = () => {
          const cnv = p.createCanvas(canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
          cnv.parent(canvasRef.current!);
          p.pixelDensity(1);
          p.noLoop();
          recomputeLayout(p.width, p.height);
          prevTime = p.millis() / 1000;
          p.loop();
        };

        p.draw = () => {
          const now = p.millis() / 1000;
          const dt  = Math.min(now - prevTime, 0.05);
          prevTime  = now;

          recomputeLayout(p.width, p.height);

          p.background(BG[0], BG[1], BG[2]);

          const bpm     = bpmRef.current;
          const stepDur = 60 / bpm / 4; // 16th notes

          stepTimer += dt;
          while (stepTimer >= stepDur) {
            stepTimer  -= stepDur;
            currentStep = (currentStep + 1) % 16;
            const vel = velRef.current / 100;
            for (let t = 0; t < 4; t++) {
              if (grid[t][currentStep]) {
                const isOdd   = currentStep % 2 === 1;
                const swing   = isOdd ? (swingRef.current / 100) * 0.030 : 0;
                fireDrum(t as 0 | 1 | 2 | 3, vel, swing);
                beatFlash[t as 0 | 1 | 2 | 3] = 1.0;
              }
            }
          }

          // Decay flash
          for (let t = 0; t < 4; t++) beatFlash[t as 0 | 1 | 2 | 3] *= 0.82;

          drawOled(p, Math.round(bpm), currentStep);
          drawDrumGrid(p);
        };

        p.mousePressed = (_e?: object): void => {
          const col = Math.floor((p.mouseX - ox) / cellW);
          const row = Math.floor((p.mouseY - oy) / cellH);
          if (col >= 0 && col < 16 && row >= 0 && row < 4) {
            grid[row][col] = !grid[row][col];
          }
        };

        p.windowResized = (): void => {
          if (canvasRef.current) {
            p.resizeCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
          }
        };
      }) as p5Type;
    });

    const ro = new ResizeObserver(() => {
      if (inst && canvasEl) {
        const pi = inst as unknown as { resizeCanvas: (w: number, h: number) => void };
        pi.resizeCanvas(canvasEl.offsetWidth, canvasEl.offsetHeight);
      }
    });
    ro.observe(canvasEl);

    return () => {
      alive = false;
      inst?.remove();
      ro.disconnect();
    };
  }, [audioCtxRef, mutedRef, bpmRef, swingRef, velRef]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#F2F0EC" }}>
      <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
