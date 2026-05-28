"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { P5Canvas } from "@/lib/p5-react";
import type { P5Sketch } from "@/lib/p5-react";
import { experiments, featuredExperiments } from "@/lib/data/experiments";
import type { LabFocus } from "@/lib/data/experiments";
import type p5Type from "p5";

// ── Color + mode config per focus category ─────────────────────────────────
const FOCUS_CONFIG: Record<
  LabFocus,
  { r: number; g: number; b: number; noiseScale: number; speed: number; trailAlpha: number }
> = {
  Generative:  { r: 140, g: 210, b: 255, noiseScale: 0.0030, speed: 1.6, trailAlpha: 0.040 },
  Mathematics: { r: 255, g: 195, b:  65, noiseScale: 0.0022, speed: 2.1, trailAlpha: 0.055 },
  Simulation:  { r:  60, g: 215, b: 145, noiseScale: 0.0060, speed: 1.1, trailAlpha: 0.030 },
  Physics:     { r: 160, g: 115, b: 255, noiseScale: 0.0045, speed: 2.4, trailAlpha: 0.048 },
};

const FOCUS_LABEL: Record<LabFocus, string> = {
  Generative:  "GENERATIVE",
  Mathematics: "MATHEMATICS",
  Simulation:  "SIMULATION",
  Physics:     "PHYSICS",
};

const TOTAL = experiments.length;
const FEATURED = featuredExperiments;

interface Props {
  locale: string;
}

export function LabShowcase({ locale }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered]     = useState(false);
  const [mounted, setMounted]     = useState(false);

  // Refs read by sketch — no re-render needed
  const focusRef      = useRef<LabFocus>(FEATURED[0].focus as LabFocus);
  const transitionRef = useRef(0); // >0 → accelerate fade

  const current = FEATURED[activeIdx];
  const focus   = current.focus as LabFocus;
  const cfg     = FOCUS_CONFIG[focus];

  // Sync focus ref + trigger transition on change
  useEffect(() => {
    if (focusRef.current !== focus) {
      focusRef.current = focus;
      transitionRef.current = 1;
    }
  }, [focus]);

  // Mount guard (avoid SSR)
  useEffect(() => { setMounted(true); }, []);

  // Auto-advance every 4 s, paused on hover
  useEffect(() => {
    if (hovered || !mounted) return;
    const id = setInterval(() => {
      setActiveIdx(i => (i + 1) % FEATURED.length);
    }, 4200);
    return () => clearInterval(id);
  }, [hovered, mounted]);

  // ── p5 sketch (stable closure — reads all state from refs) ──────────────
  const sketch = useCallback<P5Sketch>((p) => {
    const NUM = 340;

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number;
    };

    let particles: Particle[] = [];

    // Interpolated color state
    let curR = 140, curG = 210, curB = 255;
    let tgtR = 140, tgtG = 210, tgtB = 255;
    let colorLerp = 1;

    // Interpolated field params
    let curScale = 0.003,   tgtScale = 0.003;
    let curSpeed = 1.6,     tgtSpeed = 1.6;
    let curTrail = 0.04,    tgtTrail = 0.04;
    let paramLerp = 1;

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function spawnParticle(overrideXY?: [number, number]): Particle {
      const x = overrideXY ? overrideXY[0] : p.random(p.width);
      const y = overrideXY ? overrideXY[1] : p.random(p.height);
      return {
        x, y, vx: 0, vy: 0,
        life: overrideXY ? 0 : p.random(200),
        maxLife: p.random(140, 280),
        size: p.random(1.2, 2.8),
      };
    }

    p.setup = () => {
      const w = p.windowWidth;
      const h = Math.round(p.windowHeight * 0.82);
      p.createCanvas(w, h);
      p.colorMode(p.RGB, 255, 255, 255, 1);
      p.noStroke();
      p.background(7, 9, 14);
      for (let i = 0; i < NUM; i++) particles.push(spawnParticle());
    };

    p.draw = () => {
      // ── Sync targets from refs ──────────────────────────────────────────
      const cfg = FOCUS_CONFIG[focusRef.current];
      if (cfg.r !== tgtR || cfg.g !== tgtG || cfg.b !== tgtB) {
        tgtR = cfg.r; tgtG = cfg.g; tgtB = cfg.b;
        tgtScale = cfg.noiseScale;
        tgtSpeed = cfg.speed;
        tgtTrail = cfg.trailAlpha;
        colorLerp = 0;
        paramLerp = 0;
      }

      // ── Lerp color + params ─────────────────────────────────────────────
      if (colorLerp < 1) {
        colorLerp = Math.min(1, colorLerp + 0.018);
        curR = lerp(curR, tgtR, colorLerp);
        curG = lerp(curG, tgtG, colorLerp);
        curB = lerp(curB, tgtB, colorLerp);
      }
      if (paramLerp < 1) {
        paramLerp = Math.min(1, paramLerp + 0.025);
        curScale = lerp(curScale, tgtScale, paramLerp);
        curSpeed = lerp(curSpeed, tgtSpeed, paramLerp);
        curTrail = lerp(curTrail, tgtTrail, paramLerp);
      }

      // ── Background trail (faster during transition) ─────────────────────
      let bgAlpha = curTrail;
      if (transitionRef.current > 0) {
        bgAlpha = 0.28;
        transitionRef.current = Math.max(0, transitionRef.current - 0.025);
      }
      p.fill(7, 9, 14, bgAlpha);
      p.noStroke();
      p.rect(0, 0, p.width, p.height);

      // ── Particles ──────────────────────────────────────────────────────
      const t = p.frameCount * 0.0025;
      for (const pt of particles) {
        const angle  = p.noise(pt.x * curScale, pt.y * curScale, t) * p.TWO_PI * 4;
        const force  = curSpeed * 0.12;
        pt.vx = pt.vx * 0.88 + Math.cos(angle) * force;
        pt.vy = pt.vy * 0.88 + Math.sin(angle) * force;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life += 1;

        // wrap
        if (pt.x < -2)        pt.x = p.width + 2;
        if (pt.x > p.width+2) pt.x = -2;
        if (pt.y < -2)        pt.y = p.height + 2;
        if (pt.y > p.height+2) pt.y = -2;

        // reset when old
        if (pt.life > pt.maxLife) {
          const np = spawnParticle();
          pt.x = np.x; pt.y = np.y; pt.vx = 0; pt.vy = 0;
          pt.life = 0; pt.maxLife = np.maxLife; pt.size = np.size;
          continue;
        }

        const alpha = Math.sin((pt.life / pt.maxLife) * Math.PI) * 0.65;
        p.fill(curR, curG, curB, alpha);
        p.circle(pt.x, pt.y, pt.size * (0.8 + alpha * 0.6));
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, Math.round(p.windowHeight * 0.82));
      p.background(7, 9, 14);
    };
  }, []); // stable — reads from refs

  // ── UI helpers ──────────────────────────────────────────────────────────
  const go     = (i: number) => setActiveIdx(i);
  const prev   = () => setActiveIdx(i => (i - 1 + FEATURED.length) % FEATURED.length);
  const next   = () => setActiveIdx(i => (i + 1)                   % FEATURED.length);

  const focusBorderColor = {
    Generative:  "rgba(140,210,255,0.4)",
    Mathematics: "rgba(255,195,65,0.4)",
    Simulation:  "rgba(60,215,145,0.4)",
    Physics:     "rgba(160,115,255,0.4)",
  }[focus];

  const focusTextColor = {
    Generative:  "rgb(140,210,255)",
    Mathematics: "rgb(255,195,65)",
    Simulation:  "rgb(60,215,145)",
    Physics:     "rgb(160,115,255)",
  }[focus];

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: "80vh" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── p5 background canvas ──────────────────────────────────────────── */}
      {mounted && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <P5Canvas
            sketch={sketch}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* ── Left readability gradient ─────────────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 z-[1] pointer-events-none"
        style={{
          width: "55%",
          background: "linear-gradient(to right, rgba(7,9,14,0.88) 55%, transparent)",
        }}
      />
      {/* bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: "120px", background: "linear-gradient(to top, rgba(7,9,14,0.85), transparent)" }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-[2] flex flex-col min-h-[80vh] px-8 md:px-20 py-14">

        {/* Header row */}
        <div className="flex items-center justify-between mb-10">
          <span className="font-mono text-xs tracking-widest uppercase" style={{ opacity: 0.35 }}>
            Creative Lab
          </span>
          <Link
            href="/lab"
            className="hidden md:block font-mono text-xs tracking-wide hover:opacity-100 transition-opacity"
            style={{ opacity: 0.4 }}
          >
            Explore all {TOTAL} experiments →
          </Link>
        </div>

        {/* Main card — left side */}
        <div className="flex-1 flex flex-col justify-center max-w-md">

          {/* Focus badge */}
          <span
            className="font-mono text-xs tracking-widest inline-block border px-2.5 py-1 mb-4 w-fit transition-all duration-500"
            style={{ borderColor: focusBorderColor, color: focusTextColor, opacity: 0.85 }}
          >
            {FOCUS_LABEL[focus]}
          </span>

          {/* Phase + index */}
          <span className="font-mono text-xs mb-2" style={{ opacity: 0.28 }}>
            Phase {current.phase} &nbsp;·&nbsp; {activeIdx + 1} / {FEATURED.length}
          </span>

          {/* Title */}
          <h2
            className="font-bold leading-none mb-4 transition-all duration-300"
            style={{ fontSize: "clamp(2.4rem,6vw,4.2rem)" }}
          >
            {current.title}
          </h2>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-6 max-w-sm"
            style={{ opacity: 0.52 }}
          >
            {current.description}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {current.tech.map(t => (
              <span
                key={t}
                className="font-mono text-xs border px-2.5 py-0.5"
                style={{ borderColor: "rgba(255,255,255,0.12)", opacity: 0.38 }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={current.route}
            className="font-mono text-xs tracking-widest uppercase border px-6 py-3 w-fit transition-colors duration-200 hover:bg-white hover:text-black"
            style={{ borderColor: "rgba(255,255,255,0.28)" }}
          >
            Enter Experiment →
          </Link>
        </div>

        {/* ── Navigation bar ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-10">

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {FEATURED.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to experiment ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width:        i === activeIdx ? "22px" : "6px",
                  height:       "6px",
                  borderRadius: "99px",
                  background:   "white",
                  opacity:      i === activeIdx ? 0.75 : 0.22,
                  border:       "none",
                  cursor:       "pointer",
                  padding:      0,
                }}
              />
            ))}
          </div>

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="font-mono text-sm border w-9 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.18)", opacity: 0.55 }}
              aria-label="Previous experiment"
            >
              ←
            </button>
            <button
              onClick={next}
              className="font-mono text-sm border w-9 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.18)", opacity: 0.55 }}
              aria-label="Next experiment"
            >
              →
            </button>
          </div>
        </div>

        {/* Mobile: explore all */}
        <Link
          href="/lab"
          className="md:hidden font-mono text-xs tracking-wide mt-4 block hover:opacity-100 transition-opacity"
          style={{ opacity: 0.38 }}
        >
          Explore all {TOTAL} experiments →
        </Link>
      </div>
    </div>
  );
}
