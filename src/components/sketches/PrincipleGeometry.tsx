"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { P5Canvas, type P5Sketch } from "@/lib/p5-react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

interface Props {
  variant: number;
  className?: string;
}

const CANVAS = 64;
const STROKE = "rgba(255,255,255,0.5)";

function StaticGeometry({ variant }: { variant: number }) {
  const v = ((variant % 4) + 4) % 4;
  const cx = CANVAS / 2;
  const cy = CANVAS / 2;

  if (v === 0) {
    const r = CANVAS * 0.2;
    const circles: Array<{ x: number; y: number }> = [{ x: cx, y: cy }];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      circles.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    return (
      <svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
        {circles.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={r}
            fill="none"
            stroke={STROKE}
            strokeWidth={1}
          />
        ))}
      </svg>
    );
  }

  if (v === 1) {
    const rects = [0, 1, 2, 3].map((i) => {
      const size = CANVAS * (0.8 - i * 0.15);
      const angle = i * 22.5;
      return { size, angle };
    });
    return (
      <svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
        {rects.map((r, i) => (
          <rect
            key={i}
            x={cx - r.size / 2}
            y={cy - r.size / 2}
            width={r.size}
            height={r.size}
            fill="none"
            stroke={STROKE}
            strokeWidth={1}
            transform={`rotate(${r.angle} ${cx} ${cy})`}
          />
        ))}
      </svg>
    );
  }

  if (v === 2) {
    const r = CANVAS * 0.3;
    const pts: Array<{ x: number; y: number }> = [{ x: cx, y: cy }];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    const poly = pts
      .slice(1)
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
    return (
      <svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
        <polygon points={poly} fill="none" stroke={STROKE} strokeWidth={1} />
        {pts.slice(1).map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={STROKE}
            strokeWidth={1}
          />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.2} fill={STROKE} />
        ))}
      </svg>
    );
  }

  const lines = [];
  const maxR = CANVAS * 0.42;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const len = maxR * (1 - i * 0.05);
    lines.push({
      x2: cx + Math.cos(a) * len,
      y2: cy + Math.sin(a) * len,
    });
  }
  return (
    <svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={l.x2}
          y2={l.y2}
          stroke={STROKE}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

export function PrincipleGeometry({ variant, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobile = window.innerWidth < 768;
    setEnabled(!reduced && !mobile);
  }, []);

  const progressRef = useScrollProgress(containerRef, {
    start: "top 90%",
    end: "top 60%",
  });

  const v = ((variant % 4) + 4) % 4;

  const sketch = useCallback<P5Sketch>(
    (p) => {
      p.setup = () => {
        const c = p.createCanvas(CANVAS, CANVAS);
        c.elt.style.display = "block";
        p.pixelDensity(1);
        p.noFill();
        p.frameRate(30);
      };

      p.draw = () => {
        p.clear();
        const prog = Math.min(1, Math.max(0, progressRef.current));
        const cx = CANVAS / 2;
        const cy = CANVAS / 2;

        let alpha = 0.5;
        if (prog >= 1) {
          alpha = 0.4 + 0.1 * (Math.sin(p.frameCount * 0.04) * 0.5 + 0.5);
        }
        p.stroke(255, 255 * alpha);
        p.strokeWeight(1);

        if (v === 0) {
          const r = CANVAS * 0.2;
          const TWO_PI = Math.PI * 2;
          const totalArcs = 7;
          for (let i = 0; i < totalArcs; i++) {
            const segStart = i / totalArcs;
            const segEnd = (i + 1) / totalArcs;
            if (prog <= segStart) continue;
            const local = Math.min(
              1,
              (prog - segStart) / (segEnd - segStart),
            );
            let x = cx;
            let y = cy;
            if (i > 0) {
              const a = ((i - 1) / 6) * TWO_PI;
              x = cx + Math.cos(a) * r;
              y = cy + Math.sin(a) * r;
            }
            p.arc(x, y, r * 2, r * 2, 0, TWO_PI * local);
          }
        } else if (v === 1) {
          const totalEdges = 16;
          const edgesDrawn = Math.floor(prog * totalEdges);
          const partial = prog * totalEdges - edgesDrawn;
          for (let i = 0; i < 4; i++) {
            const size = CANVAS * (0.8 - i * 0.15);
            const angle = (i * 22.5 * Math.PI) / 180;
            const half = size / 2;
            const corners: Array<{ x: number; y: number }> = [];
            for (let k = 0; k < 4; k++) {
              const ax = (k === 0 || k === 3 ? -1 : 1) * half;
              const ay = (k < 2 ? -1 : 1) * half;
              const rx = ax * Math.cos(angle) - ay * Math.sin(angle);
              const ry = ax * Math.sin(angle) + ay * Math.cos(angle);
              corners.push({ x: cx + rx, y: cy + ry });
            }
            for (let k = 0; k < 4; k++) {
              const globalIdx = i * 4 + k;
              if (globalIdx >= edgesDrawn && globalIdx !== edgesDrawn) continue;
              const a = corners[k];
              const b = corners[(k + 1) % 4];
              if (globalIdx < edgesDrawn) {
                p.line(a.x, a.y, b.x, b.y);
              } else if (globalIdx === edgesDrawn) {
                p.line(
                  a.x,
                  a.y,
                  a.x + (b.x - a.x) * partial,
                  a.y + (b.y - a.y) * partial,
                );
              }
            }
          }
        } else if (v === 2) {
          const r = CANVAS * 0.3;
          const pts: Array<{ x: number; y: number }> = [{ x: cx, y: cy }];
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
          }
          const pointPhase = Math.min(1, prog / 0.4);
          const visiblePts = Math.floor(pointPhase * pts.length);
          for (let i = 0; i < visiblePts; i++) {
            p.push();
            p.noStroke();
            p.fill(255, 255 * alpha);
            p.circle(pts[i].x, pts[i].y, 2.4);
            p.pop();
          }
          if (prog > 0.4) {
            const linePhase = Math.min(1, (prog - 0.4) / 0.3);
            const totalSpokes = 6;
            const spokesDrawn = Math.floor(linePhase * totalSpokes);
            const partial = linePhase * totalSpokes - spokesDrawn;
            for (let i = 0; i < spokesDrawn; i++) {
              p.line(cx, cy, pts[i + 1].x, pts[i + 1].y);
            }
            if (spokesDrawn < totalSpokes) {
              const target = pts[spokesDrawn + 1];
              p.line(
                cx,
                cy,
                cx + (target.x - cx) * partial,
                cy + (target.y - cy) * partial,
              );
            }
          }
          if (prog > 0.7) {
            const hexPhase = Math.min(1, (prog - 0.7) / 0.3);
            const totalEdges = 6;
            const drawn = Math.floor(hexPhase * totalEdges);
            const partial = hexPhase * totalEdges - drawn;
            for (let i = 0; i < drawn; i++) {
              const a = pts[i + 1];
              const b = pts[((i + 1) % 6) + 1];
              p.line(a.x, a.y, b.x, b.y);
            }
            if (drawn < totalEdges) {
              const a = pts[drawn + 1];
              const b = pts[((drawn + 1) % 6) + 1];
              p.line(
                a.x,
                a.y,
                a.x + (b.x - a.x) * partial,
                a.y + (b.y - a.y) * partial,
              );
            }
          }
        } else {
          const totalLines = 12;
          const drawn = Math.floor(prog * totalLines);
          const partial = prog * totalLines - drawn;
          const maxR = CANVAS * 0.42;
          for (let i = 0; i < drawn; i++) {
            const a = (i / totalLines) * Math.PI * 2;
            const len = maxR * (1 - i * 0.05);
            p.line(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          }
          if (drawn < totalLines) {
            const a = (drawn / totalLines) * Math.PI * 2;
            const len = maxR * (1 - drawn * 0.05) * partial;
            p.line(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          }
        }
      };
    },
    [progressRef, v],
  );

  const containerClass = `relative w-16 h-16${className ? ` ${className}` : ""}`;

  if (!mounted) {
    return <div ref={containerRef} className={containerClass} />;
  }

  if (!enabled) {
    return (
      <div ref={containerRef} className={containerClass}>
        <StaticGeometry variant={variant} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={containerClass}>
      <P5Canvas sketch={sketch} />
    </div>
  );
}
