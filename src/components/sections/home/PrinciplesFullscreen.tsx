"use client";

import { useEffect, useRef, useCallback, useState, type ReactElement } from "react";
import type { MutableRefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { P5Canvas } from "@/lib/p5-react";
import type { P5Sketch } from "@/lib/p5-react";
import { principles } from "@/lib/data/principles";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type p5Type from "p5";

interface Props {
  dict: Dictionary;
  locale: Locale;
}

// ─── Static SVG fallbacks (mobile) ──────────────────────────────────────────

function SvgDecisionTree() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      stroke="white"
      strokeOpacity="0.55"
      strokeWidth="1.2"
    >
      <circle cx="60" cy="18" r="6" />
      <line x1="60" y1="24" x2="30" y2="54" />
      <line x1="60" y1="24" x2="90" y2="54" />
      <circle cx="30" cy="60" r="6" />
      <circle cx="90" cy="60" r="6" />
      <line x1="30" y1="66" x2="16" y2="96" />
      <line x1="30" y1="66" x2="44" y2="96" />
      <line x1="90" y1="66" x2="76" y2="96" />
      <line x1="90" y1="66" x2="104" y2="96" />
      <circle cx="16" cy="102" r="5" />
      <circle cx="44" cy="102" r="5" />
      <circle cx="76" cy="102" r="5" />
      <circle cx="104" cy="102" r="5" />
    </svg>
  );
}

function SvgLayoutSkeleton() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      stroke="white"
      strokeOpacity="0.55"
      strokeWidth="1.2"
    >
      <rect x="10" y="10" width="100" height="20" />
      <line x1="10" y1="18" x2="110" y2="18" strokeOpacity="0.25" />
      <rect x="10" y="42" width="46" height="36" />
      <rect x="64" y="42" width="46" height="36" />
      <rect x="10" y="90" width="100" height="20" />
      <line x1="10" y1="98" x2="110" y2="98" strokeOpacity="0.25" />
    </svg>
  );
}

function SvgStackedLayers() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      stroke="white"
      strokeOpacity="0.55"
      strokeWidth="1.2"
    >
      <rect x="15" y="18" width="90" height="16" />
      <rect x="15" y="44" width="90" height="16" />
      <rect x="15" y="70" width="90" height="16" />
      <rect x="15" y="96" width="90" height="16" />
      <line x1="60" y1="34" x2="60" y2="44" />
      <line x1="60" y1="60" x2="60" y2="70" />
      <line x1="60" y1="86" x2="60" y2="96" />
      <polyline points="55,40 60,44 65,40" />
      <polyline points="55,66 60,70 65,66" />
      <polyline points="55,92 60,96 65,92" />
    </svg>
  );
}

function SvgParticleBurst() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ width: 120, height: 120 }} aria-hidden="true" />;

  const lines: ReactElement[] = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const inner = 18;
    const outer = 46 + (i % 3) * 8;
    lines.push(
      <line
        key={i}
        x1={60 + Math.cos(angle) * inner}
        y1={60 + Math.sin(angle) * inner}
        x2={60 + Math.cos(angle) * outer}
        y2={60 + Math.sin(angle) * outer}
      />
    );
  }
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      stroke="white"
      strokeOpacity="0.55"
      strokeWidth="1.2"
    >
      {lines}
    </svg>
  );
}

function SvgModularGrid() {
  const cells: ReactElement[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 18 + col * 30;
      const y = 18 + row * 30;
      const dotOnEdge = (row + col) % 2 === 0;
      cells.push(
        <g key={`${row}-${col}`}>
          <rect x={x} y={y} width="22" height="22" />
          {dotOnEdge && (
            <circle
              cx={x + 22}
              cy={y + 11}
              r="2.5"
              fill="white"
              fillOpacity="0.45"
            />
          )}
        </g>,
      );
    }
  }
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      stroke="white"
      strokeOpacity="0.55"
      strokeWidth="1.2"
    >
      {cells}
    </svg>
  );
}

const STATIC_SVGS: ReactElement[] = [
  <SvgDecisionTree key="0" />,
  <SvgLayoutSkeleton key="1" />,
  <SvgStackedLayers key="2" />,
  <SvgParticleBurst key="3" />,
  <SvgModularGrid key="4" />,
];

// ─── p5 sketch factories ─────────────────────────────────────────────────────

function makeDecisionTreeSketch(
  progressRef: MutableRefObject<number>,
): P5Sketch {
  return (p: p5Type) => {
    const nodes = [
      { x: 150, y: 40 },
      { x: 80, y: 110 },
      { x: 220, y: 110 },
      { x: 45, y: 180 },
      { x: 115, y: 180 },
      { x: 185, y: 180 },
      { x: 255, y: 180 },
    ];
    const edges: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ];

    p.setup = () => {
      p.createCanvas(300, 300);
      p.pixelDensity(1);
      p.frameRate(30);
    };

    p.draw = () => {
      p.clear();
      const prog = progressRef.current;
      const alpha = Math.min(prog / 0.4, 1) * 255;
      p.stroke(255, alpha);
      p.strokeWeight(1);
      p.noFill();

      for (const [a, b] of edges) {
        p.line(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y);
      }

      const pulseIndex = Math.floor(p.frameCount / 18) % nodes.length;
      for (let i = 0; i < nodes.length; i++) {
        const bright = i === pulseIndex ? 255 : Math.floor(alpha * 0.6);
        p.stroke(255, bright);
        p.fill(255, i === pulseIndex ? 80 : 0);
        p.circle(nodes[i].x, nodes[i].y, 12);
      }
    };
  };
}

function makeLayoutSkeletonSketch(
  progressRef: MutableRefObject<number>,
): P5Sketch {
  return (p: p5Type) => {
    const blocks = [
      { x: 30, y: 30, w: 240, h: 40 },
      { x: 30, y: 90, w: 110, h: 80 },
      { x: 160, y: 90, w: 110, h: 80 },
      { x: 30, y: 190, w: 240, h: 40 },
    ];
    const thresholds = [0, 0.25, 0.5, 0.75];

    p.setup = () => {
      p.createCanvas(300, 300);
      p.pixelDensity(1);
      p.frameRate(30);
    };

    p.draw = () => {
      p.clear();
      const prog = progressRef.current;
      p.noFill();

      for (let i = 0; i < blocks.length; i++) {
        const threshold = thresholds[i];
        const visible = prog >= threshold;
        const localProg = visible
          ? Math.min((prog - threshold) / 0.25, 1)
          : 0;
        const alpha = Math.floor(localProg * 200);
        if (alpha <= 0) continue;

        const b = blocks[i];
        p.stroke(255, alpha);
        p.strokeWeight(1);
        p.rect(b.x, b.y, b.w, b.h);
        p.stroke(255, Math.floor(alpha * 0.35));
        p.line(b.x + 6, b.y + 10, b.x + b.w - 6, b.y + 10);
      }
    };
  };
}

function makeStackedLayersSketch(
  progressRef: MutableRefObject<number>,
): P5Sketch {
  return (p: p5Type) => {
    const labels = ["INFRA", "DB", "API", "UI"];
    const layerH = 38;
    const gap = 16;
    const totalH = labels.length * layerH + (labels.length - 1) * gap;
    const startY = (300 - totalH) / 2;
    const rectW = 200;
    const rectX = (300 - rectW) / 2;

    p.setup = () => {
      p.createCanvas(300, 300);
      p.pixelDensity(1);
      p.frameRate(30);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
      p.textFont("monospace");
    };

    p.draw = () => {
      p.clear();
      const prog = progressRef.current;

      for (let i = 0; i < labels.length; i++) {
        const threshold = i * 0.22;
        const localProg = Math.max(0, Math.min((prog - threshold) / 0.25, 1));
        const alpha = Math.floor(localProg * 210);
        if (alpha <= 0) continue;

        const y = startY + (labels.length - 1 - i) * (layerH + gap);
        p.stroke(255, alpha);
        p.strokeWeight(1);
        p.noFill();
        p.rect(rectX, y, rectW, layerH);

        p.fill(255, alpha);
        p.noStroke();
        p.text(labels[i], 150, y + layerH / 2);

        if (i < labels.length - 1) {
          const arrowAlpha = Math.floor(
            Math.max(0, localProg - 0.5) * 2 * 150,
          );
          if (arrowAlpha > 0) {
            const arrowY = y - gap;
            p.stroke(255, arrowAlpha);
            p.strokeWeight(1);
            p.line(150, y, 150, arrowY + gap);
            p.line(145, arrowY + 5, 150, arrowY);
            p.line(155, arrowY + 5, 150, arrowY);
          }
        }
      }
    };
  };
}

function makeParticleBurstSketch(
  progressRef: MutableRefObject<number>,
): P5Sketch {
  return (p: p5Type) => {
    const COUNT = 24;

    p.setup = () => {
      p.createCanvas(300, 300);
      p.pixelDensity(1);
      p.frameRate(30);
    };

    p.draw = () => {
      p.clear();
      const prog = progressRef.current;
      const baseAlpha = Math.min(prog / 0.4, 1) * 220;
      p.stroke(255, baseAlpha);
      p.strokeWeight(1);

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2;
        const breathe = p.sin(p.frameCount * 0.07 + i * 0.4) * 18;
        const inner = 22;
        const outer = 55 + breathe + (i % 4) * 6;
        const x1 = 150 + Math.cos(angle) * inner;
        const y1 = 150 + Math.sin(angle) * inner;
        const x2 = 150 + Math.cos(angle) * outer;
        const y2 = 150 + Math.sin(angle) * outer;
        p.line(x1, y1, x2, y2);
      }
    };
  };
}

function makeModularGridSketch(
  progressRef: MutableRefObject<number>,
): P5Sketch {
  return (p: p5Type) => {
    const COLS = 3;
    const ROWS = 3;
    const cellSize = 60;
    const padding = 8;
    const gridW = COLS * cellSize;
    const gridH = ROWS * cellSize;
    const startX = (300 - gridW) / 2;
    const startY = (300 - gridH) / 2;
    const order = [4, 0, 8, 2, 6, 1, 3, 5, 7];

    p.setup = () => {
      p.createCanvas(300, 300);
      p.pixelDensity(1);
      p.frameRate(30);
    };

    p.draw = () => {
      p.clear();
      const prog = progressRef.current;

      for (let k = 0; k < COLS * ROWS; k++) {
        const threshold = k * 0.1;
        const localProg = Math.max(
          0,
          Math.min((prog - threshold) / 0.12, 1),
        );
        const alpha = Math.floor(localProg * 200);
        if (alpha <= 0) continue;

        const idx = order[k];
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);
        const x = startX + col * cellSize + padding;
        const y = startY + row * cellSize + padding;
        const s = cellSize - padding * 2;

        p.stroke(255, alpha);
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, s, s);

        if ((row + col) % 2 === 0) {
          p.fill(255, Math.floor(alpha * 0.55));
          p.noStroke();
          p.circle(x + s, y + s / 2, 5);
        }
      }
    };
  };
}

// Stable factory lookup so hooks can rely on index only
const SKETCH_FACTORIES = [
  makeDecisionTreeSketch,
  makeLayoutSkeletonSketch,
  makeStackedLayersSketch,
  makeParticleBurstSketch,
  makeModularGridSketch,
] as const;

// ─── Per-card component ──────────────────────────────────────────────────────

interface CardProps {
  index: number;
  title: string;
  description: string;
  progressRef: MutableRefObject<number>;
}

function PrincipleCard({ index, title, description, progressRef }: CardProps) {
  // Stable sketch instance — created once, never recreated
  const sketchRef = useRef<P5Sketch | null>(null);
  if (!sketchRef.current) {
    sketchRef.current = SKETCH_FACTORIES[index](progressRef);
  }

  // useCallback with empty deps so P5Canvas identity is stable
  const stableSketch = useCallback(() => sketchRef.current!, []); // eslint-disable-line react-hooks/exhaustive-deps
  void stableSketch; // consumed below via sketchRef.current directly

  const idxLabel = `0${index + 1} / 05`;

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen px-6 md:px-16">
      {/* Index label */}
      <span
        className="absolute top-14 left-6 md:left-16 font-mono text-xs text-white/40 select-none"
        aria-hidden="true"
      >
        {idxLabel}
      </span>

      {/* Inner layout */}
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 w-full max-w-5xl">
        {/* Geometry zone */}
        <div
          className="card-geometry flex-shrink-0 flex items-center justify-center"
        >
          {/* Desktop: p5 canvas */}
          <div className="hidden md:block" style={{ width: 300, height: 300 }}>
            <P5Canvas
              sketch={sketchRef.current}
              style={{ width: 300, height: 300 }}
            />
          </div>
          {/* Mobile: static SVG */}
          <div className="md:hidden">{STATIC_SVGS[index]}</div>
        </div>

        {/* Text zone */}
        <div className="card-text flex-1 min-w-0">
          {/* Horizontal rule connector (desktop only) */}
          <div
            className="hidden md:block w-12 h-px bg-white/20 mb-8"
            aria-hidden="true"
          />
          <h3 className="card-title font-bold text-3xl md:text-4xl mb-5 leading-tight">
            {title}
          </h3>
          <p className="card-description text-sm md:text-base text-white/85 leading-relaxed max-w-md">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main section ────────────────────────────────────────────────────────────

export function PrinciplesFullscreen({ dict, locale }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Per-card progress refs — stable across renders
  const progressRefs = useRef<MutableRefObject<number>[]>(
    Array.from({ length: principles.length }, () => ({ current: 0 })),
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    // Skip on reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip on mobile (< 768px) — no pin/scrub on small screens
    if (window.innerWidth < 768) return;

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      const progressRef = progressRefs.current[i];
      const geomEl = card.querySelector<HTMLElement>(".card-geometry");
      const titleEl = card.querySelector<HTMLElement>(".card-title");
      const descEl = card.querySelector<HTMLElement>(".card-description");

      if (!geomEl || !titleEl || !descEl) return;

      // Set initial animation state
      gsap.set(geomEl, { scale: 0.85, opacity: 0 });
      gsap.set(titleEl, { y: 50, opacity: 0 });
      gsap.set(descEl, { opacity: 0 });

      const tl = gsap.timeline({ paused: true });

      // progress 0 → 0.4 : geometry in
      tl.to(geomEl, { scale: 1, opacity: 1, ease: "power2.out", duration: 0.4 }, 0);
      // progress 0.4 → 0.6 : title slides up
      tl.to(titleEl, { y: 0, opacity: 1, ease: "power3.out", duration: 0.2 }, 0.4);
      // progress 0.35 → 0.75 : description fades in (earlier, so it's readable mid-scroll)
      tl.to(descEl, { opacity: 1, ease: "power2.out", duration: 0.4 }, 0.35);

      const st = ScrollTrigger.create({
        trigger: card,
        pin: true,
        scrub: 1.5,
        start: "top top",
        end: "+=600",
        onUpdate: (self) => {
          tl.progress(self.progress);
          progressRef.current = self.progress;
        },
      });

      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const p = dict.home.principles;

  return (
    <section
      ref={sectionRef}
      id="how-i-work"
      className="relative border-t border-white/10"
      style={{ zIndex: 2 }}
    >
      {/* Section header */}
      <div className="px-6 md:px-16 pt-24 pb-4 max-w-6xl mx-auto">
        <span className="font-mono text-xs tracking-widest uppercase block mb-3 text-white/35">
          {p?.approach_label ?? "Approach"}
        </span>
        <h2 className="font-bold text-2xl md:text-3xl mb-16">
          {p?.heading ?? "How I Work"}
        </h2>
      </div>

      {/* Five full-screen principle cards */}
      {principles.map((principle, i) => {
        const title = locale === "pt" ? principle.titlePt : principle.title;
        const description =
          locale === "pt" ? principle.descriptionPt : principle.description;

        return (
          <div
            key={principle.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          >
            <PrincipleCard
              index={i}
              title={title}
              description={description}
              progressRef={progressRefs.current[i]}
            />
          </div>
        );
      })}
    </section>
  );
}
