"use client";

import { useEffect, useRef } from "react";
import type p5Type from "p5";

const BG  = [242, 240, 236] as const;
const FG  = [10,  10,  10]  as const;
const ACC = [216, 96,  32]  as const; // accent-orange #D86020
const TAU = Math.PI * 2;

const CHANNELS = [
  { freq: 1.0,   phaseOff: 0,    label: "CH-01" },
  { freq: 1.618, phaseOff: 1.1,  label: "CH-02" },
  { freq: 2.5,   phaseOff: 2.4,  label: "CH-03" },
] as const;

export function OscilloscopeSketch() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let alive = true;
    let inst: p5Type | null = null;

    let phase = 0;
    let mx = 0.5, my = 0.5;

    import("p5").then(({ default: P5 }) => {
      if (!alive || !containerRef.current) return;

      inst = new P5((p: p5Type) => {
        p.setup = () => {
          const cnv = p.createCanvas(el.offsetWidth, el.offsetHeight);
          cnv.parent(el);
          p.pixelDensity(1);
          p.textFont("monospace");
        };

        p.draw = () => {
          const dt = Math.min(p.deltaTime / 1000, 0.05);
          phase += dt * 0.35;

          const W = p.width, H = p.height;
          p.background(BG[0], BG[1], BG[2]);

          // Oscilloscope grid
          p.stroke(FG[0], FG[1], FG[2], 12);
          p.strokeWeight(0.5);
          const gCols = 8, gRows = 6;
          for (let c = 1; c < gCols; c++) p.line((c / gCols) * W, 0, (c / gCols) * W, H);
          for (let r = 1; r < gRows; r++) p.line(0, (r / gRows) * H, W, (r / gRows) * H);

          // Center tick marks (shorter, crisper)
          p.stroke(FG[0], FG[1], FG[2], 22);
          p.strokeWeight(0.5);
          for (let c = 0; c <= gCols; c++) {
            const gx = (c / gCols) * W;
            p.line(gx, H / 2 - 4, gx, H / 2 + 4);
          }

          const amp        = 0.10 + (1 - my) * 0.13;
          const phaseShift = (mx - 0.5) * TAU * 0.6;

          CHANNELS.forEach((ch, i) => {
            const cy   = H * ((i + 0.5) / 3);
            const bandH = H / 3;

            // Channel divider
            if (i > 0) {
              p.stroke(FG[0], FG[1], FG[2], 10);
              p.strokeWeight(0.5);
              p.line(0, cy - bandH / 2, W, cy - bandH / 2);
            }

            // Channel label
            p.noStroke();
            p.fill(FG[0], FG[1], FG[2], 45);
            p.textSize(7);
            p.textAlign(p.LEFT, p.CENTER);
            p.text(ch.label, 10, cy);

            // Waveform — composite sine for richer shape
            const steps = Math.min(W, 400);
            p.stroke(FG[0], FG[1], FG[2], 190);
            p.strokeWeight(1.1);
            p.noFill();
            p.beginShape();
            for (let s = 0; s <= steps; s++) {
              const t   = s / steps;
              const x   = t * W;
              const sin = Math.sin(TAU * ch.freq * (t * 2.5 + phase) + ch.phaseOff + phaseShift)
                        + Math.sin(TAU * ch.freq * 0.5 * (t * 2.5 + phase * 1.3) + ch.phaseOff) * 0.3;
              const y   = cy + sin * bandH * amp;
              p.vertex(x, y);
            }
            p.endShape();

            // Trigger dot (orange accent at left edge, tracks waveform)
            const y0 = cy
              + (Math.sin(TAU * ch.freq * phase + ch.phaseOff + phaseShift)
               + Math.sin(TAU * ch.freq * 0.5 * phase * 1.3 + ch.phaseOff) * 0.3)
              * bandH * amp;
            p.noStroke();
            p.fill(ACC[0], ACC[1], ACC[2], 220);
            p.circle(5, y0, 5);
          });

          // Module code (bottom-right, very dim)
          p.noStroke();
          p.fill(FG[0], FG[1], FG[2], 28);
          p.textSize(8);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text("OSC-01", W - 10, H - 8);
        };

        p.mouseMoved = (_e?: object): void => {
          mx = Math.max(0, Math.min(1, p.mouseX / p.width));
          my = Math.max(0, Math.min(1, p.mouseY / p.height));
        };

        p.windowResized = (): void => {
          if (containerRef.current) {
            p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
          }
        };
      }) as p5Type;
    });

    const ro = new ResizeObserver(() => {
      const pi = inst as unknown as { resizeCanvas: (w: number, h: number) => void } | null;
      if (pi && el.offsetWidth > 0) pi.resizeCanvas(el.offsetWidth, el.offsetHeight);
    });
    ro.observe(el);

    return () => {
      alive = false;
      inst?.remove();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
    />
  );
}
