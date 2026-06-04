"use client";

import { useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$&";

interface ScrambleTextProps {
  text: string;
  delay?: number;    // ms before scramble resolves
  duration?: number; // ms for the resolve sweep
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders text that scrambles into its final form.
 * Characters reveal left-to-right over `duration` ms, after `delay` ms.
 * Parent opacity/transform is handled externally (e.g. GSAP).
 */
export function ScrambleText({
  text,
  delay = 0,
  duration = 720,
  className,
  style,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = text;
      return;
    }

    let raf: number;
    const startAt = performance.now() + delay;
    let resolvedAt = 0;

    const update = () => {
      const now = performance.now();

      if (now < startAt) {
        // Pre-delay: keep scrambling so the effect is visible as parent fades in
        el.textContent = text
          .split("")
          .map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join("");
        raf = requestAnimationFrame(update);
        return;
      }

      if (!resolvedAt) resolvedAt = now;
      const progress = Math.min((now - resolvedAt) / duration, 1);

      // Characters reveal left-to-right with a rolling window
      el.textContent = text
        .split("")
        .map((c, i) => {
          if (c === " ") return " ";
          const threshold = (i / text.length) * 0.65;
          return progress > threshold + 0.35
            ? c
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      if (progress < 1) {
        raf = requestAnimationFrame(update);
      } else {
        el.textContent = text;
      }
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  );
}
