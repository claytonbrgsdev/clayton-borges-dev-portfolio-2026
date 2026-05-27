"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";

interface UseScrollProgressOptions {
  start?: string;
  end?: string;
}

export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  options: UseScrollProgressOptions = {},
): MutableRefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progressRef.current = 0;
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: options.start ?? "top bottom",
      end: options.end ?? "bottom top",
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, [ref, options.start, options.end]);

  return progressRef;
}
