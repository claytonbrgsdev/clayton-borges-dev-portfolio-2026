"use client";

import { useCallback } from "react";
import type p5Type from "p5";
import { P5Canvas, type P5Sketch } from "@/lib/p5-react";

interface Orb {
  x: number; y: number;
  r: number; phase: number; speed: number;
}

/**
 * Subtle floating radial-gradient orbs behind the IDE/Projects section.
 * Very low opacity — adds depth without competing with content.
 */
export function ProjectsAmbient() {
  const sketch = useCallback<P5Sketch>((p) => {
    const orbs: Orb[] = [];
    let w = 0, h = 0;

    p.setup = () => {
      w = document.documentElement.clientWidth; h = p.windowHeight;
      p.createCanvas(w, h);
      p.pixelDensity(1);
      p.noStroke();
      for (let i = 0; i < 6; i++) {
        orbs.push({
          x: p.random(w * 0.15, w * 0.85),
          y: p.random(h * 0.1,  h * 0.9),
          r: p.random(100, 230),
          phase: p.random(Math.PI * 2),
          speed: p.random(0.00035, 0.00085),
        });
      }
    };

    p.windowResized = () => {
      w = document.documentElement.clientWidth; h = p.windowHeight;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.clear();
      const t   = p.frameCount;
      const ctx = p.drawingContext as CanvasRenderingContext2D;

      for (const orb of orbs) {
        orb.x += Math.cos(t * orb.speed + orb.phase)        * 0.22;
        orb.y += Math.sin(t * orb.speed * 1.3 + orb.phase)  * 0.22;

        // Soft radial gradient — barely-visible blue-grey tint
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0,   "rgba(75,125,195,0.042)");
        grad.addColorStop(0.5, "rgba(55,95,175,0.018)");
        grad.addColorStop(1,   "rgba(40,75,155,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
  }, []);

  return (
    <P5Canvas
      sketch={sketch}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 4,
      }}
    />
  );
}
