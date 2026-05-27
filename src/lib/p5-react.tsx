"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type p5Type from "p5";

export type P5Sketch = (p: p5Type) => void;

interface P5CanvasProps {
  sketch: P5Sketch;
  className?: string;
  style?: CSSProperties;
}

export function P5Canvas({ sketch, className, style }: P5CanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let instance: p5Type | null = null;
    let alive = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!instance) return;
        if (entry.isIntersecting) instance.loop();
        else instance.noLoop();
      },
      { threshold: 0 },
    );
    observer.observe(host);

    import("p5").then(({ default: P5 }) => {
      if (!alive || !host) return;
      instance = new P5(sketch, host) as unknown as p5Type;
    });

    return () => {
      alive = false;
      observer.disconnect();
      if (instance) instance.remove();
      instance = null;
    };
  }, [sketch]);

  return <div ref={hostRef} className={className} style={style} />;
}
