"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { P5Canvas, type P5Sketch } from "@/lib/p5-react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { gsap } from "@/lib/gsap";
import type { StackCategory, StackItem } from "@/lib/data/stack";

interface Props {
  stack: StackCategory[];
  className?: string;
}

type FlatItem = {
  name: string;
  categoryIndex: number;
  categoryCount: number;
};

function flatten(stack: StackCategory[]): FlatItem[] {
  const out: FlatItem[] = [];
  stack.forEach((cat, i) => {
    cat.items.forEach((it: StackItem) => {
      out.push({ name: it.name, categoryIndex: i, categoryCount: stack.length });
    });
  });
  return out;
}

export function StackOrbitField({ stack, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [fallback, setFallback] = useState(false);

  const flat = useMemo(() => flatten(stack), [stack]);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    setFallback(reduced || mobile);
  }, []);

  const progressRef = useScrollProgress(containerRef, {
    start: "top bottom",
    end: "bottom top",
  });

  const radiusScaleRef = useRef(0);
  const introPlayedRef = useRef(false);
  const mousePosRef = useRef<{ x: number; y: number; inside: boolean }>({
    x: 0,
    y: 0,
    inside: false,
  });

  useEffect(() => {
    if (fallback) return;
    let raf = 0;
    const tick = () => {
      if (!introPlayedRef.current && progressRef.current > 0.05) {
        introPlayedRef.current = true;
        gsap.to(radiusScaleRef, {
          current: 1,
          duration: 1.5,
          ease: "power3.out",
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fallback, progressRef]);

  const sketch = useCallback<P5Sketch>(
    (p) => {
      type Body = {
        angle: number;
        baseSpeed: number;
        speed: number;
        radiusFactor: number;
        name: string;
        brightness: number;
        targetBrightness: number;
      };

      const bodies: Body[] = [];
      let size = 0;

      const buildBodies = () => {
        bodies.length = 0;
        const totalCats = Math.max(1, stack.length);
        flat.forEach((item, i) => {
          const catT = totalCats > 1 ? item.categoryIndex / (totalCats - 1) : 0;
          const radiusFactor = 0.5 + catT * 0.45 + (p.random() - 0.5) * 0.04;
          const dir = i % 2 === 0 ? 1 : -1;
          const speed = (0.002 + p.random() * 0.003) * dir;
          bodies.push({
            angle: p.random(p.TWO_PI),
            baseSpeed: speed,
            speed,
            radiusFactor: p.constrain(radiusFactor, 0.5, 0.95),
            name: item.name,
            brightness: 0.8,
            targetBrightness: 0.8,
          });
        });
      };

      p.setup = () => {
        const host = (p as unknown as { _userNode?: HTMLElement })._userNode;
        const rect = host?.getBoundingClientRect();
        size = rect ? Math.min(rect.width, rect.height) : 400;
        const c = p.createCanvas(size, size);
        c.elt.style.display = "block";
        p.pixelDensity(1);
        p.textFont("monospace");
        p.textSize(10);
        buildBodies();
      };

      p.windowResized = () => {
        const host = (p as unknown as { _userNode?: HTMLElement })._userNode;
        const rect = host?.getBoundingClientRect();
        const next = rect ? Math.min(rect.width, rect.height) : size;
        if (Math.abs(next - size) > 1) {
          size = next;
          p.resizeCanvas(size, size);
        }
      };

      p.mouseMoved = () => {
        const inside =
          p.mouseX >= 0 && p.mouseX <= size && p.mouseY >= 0 && p.mouseY <= size;
        mousePosRef.current = { x: p.mouseX, y: p.mouseY, inside };
      };

      (p as unknown as { mouseOut: () => void }).mouseOut = () => {
        mousePosRef.current.inside = false;
      };

      p.draw = () => {
        p.clear();
        const cx = size / 2;
        const cy = size / 2;
        const halfW = size / 2;
        const scale = radiusScaleRef.current;

        p.noStroke();
        p.fill(255, 255);
        p.circle(cx, cy, 8);

        const positions: { x: number; y: number; idx: number }[] = [];

        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          b.angle += b.speed;
          const r = halfW * b.radiusFactor * scale;
          const x = cx + Math.cos(b.angle) * r;
          const y = cy + Math.sin(b.angle) * r;
          positions.push({ x, y, idx: i });
        }

        let nearestIdx = -1;
        if (mousePosRef.current.inside) {
          const mx = mousePosRef.current.x;
          const my = mousePosRef.current.y;
          let bestD = 30;
          for (let i = 0; i < positions.length; i++) {
            const dx = positions[i].x - mx;
            const dy = positions[i].y - my;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < bestD) {
              bestD = d;
              nearestIdx = i;
            }
          }
        }

        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          if (i === nearestIdx) {
            b.speed = b.baseSpeed * 0.3;
            b.targetBrightness = 1.0;
          } else {
            b.speed = b.baseSpeed;
            b.targetBrightness = 0.8;
          }
          b.brightness += (b.targetBrightness - b.brightness) * 0.15;
        }

        p.strokeWeight(1);
        for (let i = 0; i < positions.length; i++) {
          for (let j = i + 1; j < positions.length; j++) {
            const dx = positions[i].x - positions[j].x;
            const dy = positions[i].y - positions[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
              const a = (1 - d / 120) * 0.15 * 255;
              p.stroke(255, a);
              p.line(positions[i].x, positions[i].y, positions[j].x, positions[j].y);
            }
          }
        }

        p.noStroke();
        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          const b = bodies[pos.idx];
          p.fill(255, 0.6 * 255);
          p.circle(pos.x, pos.y, 4);

          const dx = pos.x - cx;
          const dy = pos.y - cy;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const lx = pos.x + (dx / len) * 10;
          const ly = pos.y + (dy / len) * 10;

          p.fill(255, b.brightness * 255);
          const tw = p.textWidth(b.name);
          let tx = lx;
          if (dx < 0) tx = lx - tw;
          else if (Math.abs(dx) < 4) tx = lx - tw / 2;
          // Clamp so labels stay within canvas bounds (8px margin each side)
          tx = Math.max(8, Math.min(size - tw - 8, tx));
          p.text(b.name, tx, ly + 3);
        }
      };
    },
    [flat, stack.length],
  );

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className={
          className ?? "relative aspect-square w-full max-w-[500px]"
        }
      />
    );
  }

  if (fallback) {
    const cx = 250;
    const cy = 250;
    const totalCats = Math.max(1, stack.length);
    return (
      <div
        ref={containerRef}
        className={
          className ?? "relative aspect-square w-full max-w-[500px]"
        }
      >
        <svg viewBox="0 0 500 500" className="h-full w-full">
          <circle cx={cx} cy={cy} r={4} fill="white" />
          {flat.map((item, i) => {
            const catT =
              totalCats > 1 ? item.categoryIndex / (totalCats - 1) : 0;
            const r = 250 * (0.5 + catT * 0.45);
            const angle = (i / flat.length) * Math.PI * 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const tx = cx + Math.cos(angle) * (r + 10);
            const ty = cy + Math.sin(angle) * (r + 10);
            const anchor =
              Math.cos(angle) > 0.2
                ? "start"
                : Math.cos(angle) < -0.2
                  ? "end"
                  : "middle";
            return (
              <g key={`${item.name}-${i}`}>
                <circle cx={x} cy={y} r={2} fill="white" fillOpacity={0.6} />
                <text
                  x={tx}
                  y={ty + 3}
                  fill="white"
                  fillOpacity={0.8}
                  fontSize={10}
                  fontFamily="monospace"
                  textAnchor={anchor}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className ?? "relative aspect-square w-full max-w-[500px]"}
    >
      <P5Canvas sketch={sketch} className="absolute inset-0" />
    </div>
  );
}
