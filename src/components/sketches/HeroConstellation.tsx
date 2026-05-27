"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type p5Type from "p5";
import { P5Canvas, type P5Sketch } from "@/lib/p5-react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

const PARTICLE_COUNT = 600;
const GRID_SIZE = 60;

export function HeroConstellation() {
  const bodyRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    bodyRef.current = document.body;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    setEnabled(!reduced && !mobile);
  }, []);

  const progressRef = useScrollProgress(bodyRef);

  const sketch = useCallback<P5Sketch>((p) => {
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      hx: number;
      hy: number;
      life: number;
    };

    const particles: Particle[] = [];
    let w = 0;
    let h = 0;

    const seedParticle = (i: number): Particle => {
      const cols = Math.ceil(w / GRID_SIZE);
      const col = i % Math.max(1, cols);
      const row = Math.floor(i / Math.max(1, cols));
      return {
        x: p.random(w),
        y: p.random(h),
        vx: 0,
        vy: 0,
        hx: col * GRID_SIZE,
        hy: row * GRID_SIZE,
        life: p.random(1),
      };
    };

    p.setup = () => {
      w = p.windowWidth;
      h = p.windowHeight;
      const c = p.createCanvas(w, h);
      c.elt.style.display = "block";
      p.pixelDensity(1);
      p.noStroke();
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(seedParticle(i));
    };

    p.windowResized = () => {
      w = p.windowWidth;
      h = p.windowHeight;
      p.resizeCanvas(w, h);
      const cols = Math.ceil(w / GRID_SIZE);
      for (let i = 0; i < particles.length; i++) {
        const col = i % Math.max(1, cols);
        const row = Math.floor(i / Math.max(1, cols));
        particles[i].hx = col * GRID_SIZE;
        particles[i].hy = row * GRID_SIZE;
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    p.draw = () => {
      p.clear();
      const prog = progressRef.current;

      const wStructure = p.constrain(1 - prog / 0.25, 0, 1);
      const wFlow      = p.constrain(1 - Math.abs((prog - 0.375) / 0.125), 0, 1);
      const wDecay     = p.constrain(1 - Math.abs((prog - 0.625) / 0.125), 0, 1);
      const wField     = p.constrain((prog - 0.75) / 0.25, 0, 1);

      const scrollY = (typeof window !== "undefined") ? window.scrollY : 0;
      const attractorX = w * 0.5;
      const attractorY = (scrollY % h);

      const t = p.frameCount * 0.003;

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        let tx = pt.x;
        let ty = pt.y;

        if (wStructure > 0.001) {
          tx = lerp(tx, pt.hx, 0.08 * wStructure);
          ty = lerp(ty, pt.hy, 0.08 * wStructure);
        }

        if (wFlow > 0.001) {
          const n = p.noise(pt.x * 0.002, pt.y * 0.002, t);
          const angle = n * Math.PI * 4;
          pt.vx = lerp(pt.vx, Math.cos(angle) * 0.8, 0.05 * wFlow);
          pt.vy = lerp(pt.vy, Math.sin(angle) * 0.8, 0.05 * wFlow);
        } else {
          pt.vx *= 0.92;
          pt.vy *= 0.92;
        }

        if (wField > 0.001) {
          const dx = attractorX - pt.x;
          const dy = attractorY - pt.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          pt.vx = lerp(pt.vx, (dx / d) * 1.2, 0.04 * wField);
          pt.vy = lerp(pt.vy, (dy / d) * 1.2, 0.04 * wField);
        }

        pt.x = lerp(pt.x + pt.vx, tx, 0.5 * wStructure) + pt.vx * (1 - wStructure);
        pt.y = lerp(pt.y + pt.vy, ty, 0.5 * wStructure) + pt.vy * (1 - wStructure);

        if (pt.x < 0) pt.x += w;
        else if (pt.x > w) pt.x -= w;
        if (pt.y < 0) pt.y += h;
        else if (pt.y > h) pt.y -= h;

        let alpha = 102;
        if (wDecay > 0.001) {
          pt.life -= 0.004 * wDecay;
          alpha = 102 * Math.max(0, pt.life);
          if (pt.life <= 0) {
            pt.x = p.random(w);
            pt.y = p.random(h);
            pt.vx = 0;
            pt.vy = 0;
            pt.life = 1;
          }
        } else {
          pt.life = Math.min(1, pt.life + 0.01);
        }

        p.fill(255, alpha);
        p.rect(pt.x, pt.y, 1, 1);
      }
    };
  }, [progressRef]);

  if (!mounted || !enabled) return null;

  return (
    <P5Canvas
      sketch={sketch}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
