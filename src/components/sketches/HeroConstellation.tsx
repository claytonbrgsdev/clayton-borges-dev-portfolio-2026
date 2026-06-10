"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type p5Type from "p5";
import { P5Canvas, type P5Sketch } from "@/lib/p5-react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

/*
 * HeroConstellation — Lorenz strange attractor.
 *
 * A single trajectory of the Lorenz system traced in real time. The
 * butterfly shape emerges from deterministic chaos, a direct echo of
 * Clayton's LorenzLab. Mouse rotates the 3D projection; scroll morphs
 * the rho parameter toward the sub-critical bifurcation point.
 */

// ── Lorenz constants ───────────────────────────────────────────────────────
const SIGMA   = 10.0;
const BETA    = 8.0 / 3.0;
const DT      = 0.003;
const STEPS   = 4;          // integration steps per frame
const TRAIL   = 1800;       // max trail points

export function HeroConstellation() {
  const bodyRef    = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  // Normalised mouse position 0→1
  const mouseXRef  = useRef(0.5);
  // Scroll velocity — pixels/frame, smoothed via lerp (0 when still)
  const velocityRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    bodyRef.current = document.body;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile  = window.innerWidth < 768;
    setEnabled(!reduced && !mobile);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX / window.innerWidth;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  const progressRef = useScrollProgress(bodyRef);

  // Track scroll velocity for sketch modulation
  useEffect(() => {
    if (!enabled) return;
    let prevY = window.scrollY;
    let rafId: number;
    const measure = () => {
      const curr = window.scrollY;
      const delta = Math.abs(curr - prevY);
      // Lerp: decay quickly when idle, respond fast when moving
      velocityRef.current = velocityRef.current * 0.78 + delta * 0.22;
      prevY = curr;
      rafId = requestAnimationFrame(measure);
    };
    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  const sketch = useCallback<P5Sketch>((p) => {
    // Lorenz state
    let lx = 0.1, ly = 0.0, lz = 0.0;

    // Screen-space trail (simple array — push newest, shift oldest)
    type Pt = { sx: number; sy: number };
    const trail: Pt[] = [];

    let w = 0, h = 0;
    let theta    = 0.0; // current rotation angle (smoothed)
    let thetaTgt = 0.0;

    // ── Lorenz RK4 ───────────────────────────────────────────────────────
    const deriv = (x: number, y: number, z: number, rho: number): [number, number, number] => [
      SIGMA * (y - x),
      x * (rho - z) - y,
      x * y - BETA * z,
    ];

    const rk4 = (x: number, y: number, z: number, rho: number): [number, number, number] => {
      const [a1, b1, c1] = deriv(x, y, z, rho);
      const [a2, b2, c2] = deriv(x + DT/2*a1, y + DT/2*b1, z + DT/2*c1, rho);
      const [a3, b3, c3] = deriv(x + DT/2*a2, y + DT/2*b2, z + DT/2*c2, rho);
      const [a4, b4, c4] = deriv(x + DT*a3,   y + DT*b3,   z + DT*c3,   rho);
      return [
        x + DT/6 * (a1 + 2*a2 + 2*a3 + a4),
        y + DT/6 * (b1 + 2*b2 + 2*b3 + b4),
        z + DT/6 * (c1 + 2*c2 + 2*c3 + c4),
      ];
    };

    // ── 3D → screen projection ───────────────────────────────────────────
    // Rotates around Z axis by theta, then uses (rotated-X, Z) as screen coords.
    const project = (x: number, y: number, z: number, th: number, scale: number): Pt => ({
      sx: w * 0.65 + (x * Math.cos(th) + y * Math.sin(th)) * scale,
      sy: h * 0.46 - (z - 25) * scale * 0.95,
    });

    p.setup = () => {
      w = document.documentElement.clientWidth; h = p.windowHeight;
      const c = p.createCanvas(w, h);
      c.elt.style.display = "block";
      p.pixelDensity(1);

      // Warm up: advance to steady-state on the attractor
      const WARMUP = Math.ceil(10 / DT);
      for (let i = 0; i < WARMUP; i++) [lx, ly, lz] = rk4(lx, ly, lz, 28);

      // Pre-fill trail with 2.5 Lorenz-seconds of history so the butterfly
      // is already partially visible on first render.
      const PREFILL = Math.ceil(2.5 / DT);
      const scale   = Math.min(w, h) * 0.0085;
      for (let i = 0; i < PREFILL; i++) {
        [lx, ly, lz] = rk4(lx, ly, lz, 28);
        if (i % 2 === 0) trail.push(project(lx, ly, lz, 0, scale));
      }
      while (trail.length > TRAIL) trail.shift();
    };

    p.windowResized = () => {
      w = document.documentElement.clientWidth; h = p.windowHeight;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.clear();
      const prog  = progressRef.current;

      // Scroll velocity — how fast the user is scrolling (px/frame, smoothed)
      const vel = velocityRef.current;

      // Mouse → rotation target, smoothly tracked.
      // Velocity adds a small angular nudge — fast scroll spins the butterfly slightly.
      thetaTgt  = (mouseXRef.current - 0.5) * Math.PI * 0.65;
      thetaTgt += vel * 0.00045;                   // velocity → extra rotation
      theta    += (thetaTgt - theta) * 0.025;

      // Scroll → shrink trail, morph rho toward bifurcation (ρ=24.06),
      //          fade alpha, pull butterfly toward screen center
      const rho       = 28 - prog * 4.8;          // 28 → 23.2
      const trailCap  = Math.max(40, Math.floor(TRAIL * (1 - prog * 0.82)));
      const scale     = Math.min(w, h) * (0.0085 - prog * 0.002);
      const headAlpha = 0.65 - prog * 0.48;

      // Velocity → extra integration steps: fast scroll = more chaos per frame.
      // Clamped to STEPS+4 so it never gets out of hand.
      const activeSteps = STEPS + Math.min(4, Math.floor(vel * 0.18));

      // Advance attractor activeSteps steps
      for (let s = 0; s < activeSteps; s++) {
        [lx, ly, lz] = rk4(lx, ly, lz, rho);
        trail.push(project(lx, ly, lz, theta, scale));
        while (trail.length > TRAIL) trail.shift();
      }

      // ── Draw trail via 8-bucket alpha grouping ─────────────────────────
      // Newest point is trail[trail.length-1], oldest is trail[0].
      const ctx  = p.drawingContext as CanvasRenderingContext2D;
      const len  = Math.min(trailCap, trail.length);
      const base = trail.length - 1; // index of newest point

      ctx.save();
      ctx.lineWidth = 0.95;
      ctx.lineCap   = "round";
      ctx.lineJoin  = "round";

      const BUCKETS = 8;
      for (let b = 0; b < BUCKETS; b++) {
        const alpha = ((b + 1) / BUCKETS) * Math.max(0.02, headAlpha);
        ctx.strokeStyle = `rgba(210,222,255,${alpha.toFixed(3)})`;
        ctx.beginPath();
        let started = false;

        for (let k = 0; k < len; k++) {
          // t=0 → newest, t=1 → oldest
          const t      = k / len;
          const bucket = Math.floor((1 - t) * BUCKETS);
          if (bucket !== b) continue;

          const pt = trail[base - k];
          if (!pt) continue;

          if (!started) {
            ctx.moveTo(pt.sx, pt.sy);
            started = true;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        }
        if (started) ctx.stroke();
      }

      ctx.restore();
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
