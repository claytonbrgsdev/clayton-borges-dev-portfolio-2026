"use client";
import { useEffect, useRef } from "react";

export function CursorCanvas() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = cursorRef.current;
    if (!el) return;

    document.body.style.cursor = "none";

    let cx = -100, cy = -100, tx = -100, ty = -100;
    let rafId: number;

    let scrollVel = 0;
    let prevScrollY = window.scrollY;

    // Track velocity via RAF — works with Lenis (no native scroll event)
    const decayLoop = () => {
      const delta = Math.abs(window.scrollY - prevScrollY);
      prevScrollY = window.scrollY;
      scrollVel = scrollVel * 0.80 + delta * 0.20;
      (window as unknown as Record<string, unknown>).__scrollVel = scrollVel;
      rafId = requestAnimationFrame(decayLoop);
    };
    decayLoop();

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    document.addEventListener("mousemove", onMove);

    const animCursor = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.left = cx + "px";
      el.style.top  = cy + "px";
      el.dataset.blue = scrollVel > 15 ? "true" : "false";
      rafId = requestAnimationFrame(animCursor);
    };
    rafId = requestAnimationFrame(animCursor);

    const addRing = () => { el.dataset.ring = "true"; };
    const rmRing  = () => { el.dataset.ring = "false"; };
    const interactives = document.querySelectorAll("a, button, [role='button']");
    interactives.forEach(i => {
      i.addEventListener("mouseenter", addRing);
      i.addEventListener("mouseleave", rmRing);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.body.style.cursor = "";
      interactives.forEach(i => {
        i.removeEventListener("mouseenter", addRing);
        i.removeEventListener("mouseleave", rmRing);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        width: 7,
        height: 7,
        background: "var(--accent-orange)",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        transition: "width 200ms, height 200ms, background 300ms, border 200ms",
      }}
    />
  );
}
