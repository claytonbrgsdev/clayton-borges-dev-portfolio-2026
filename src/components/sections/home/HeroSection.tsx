"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { gsap, SplitText } from "@/lib/gsap";

interface HeroSectionProps {
  dict: Dictionary;
  locale: Locale;
}

export function HeroSection({ dict, locale }: HeroSectionProps) {
  const { hero } = dict.home;

  const nameParts = hero.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  const nameRef    = useRef<HTMLHeadingElement>(null);
  const greetRef   = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // ── Dynamic contrast via canvas pixel sampling ──────────────────────────
  // Reads the p5 canvas pixels directly behind the text block.
  // When the Lorenz butterfly sweeps into the text area (bright pixels),
  // text GLOWS BRIGHTER — the inverse of mix-blend-mode:difference which
  // would have dimmed the text instead. Amplified ×10 for visible intensity.
  const [glow, setGlow] = useState(0);

  useEffect(() => {
    let rafId: number;
    let tick   = 0;
    let smooth = 0;

    const detect = () => {
      tick++;
      // Sample every 10 frames (~6× per second at 60fps)
      if (tick % 10 === 0 && heroTextRef.current) {
        const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
        if (canvas) {
          try {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const rect   = heroTextRef.current.getBoundingClientRect();
              const scaleX = canvas.width  / window.innerWidth;
              const scaleY = canvas.height / window.innerHeight;

              const ix = Math.max(0, Math.floor(rect.left  * scaleX));
              const iy = Math.max(0, Math.floor(rect.top   * scaleY));
              const iw = Math.max(1, Math.min(canvas.width  - ix, Math.floor(rect.width  * scaleX)));
              const ih = Math.max(1, Math.min(canvas.height - iy, Math.floor(rect.height * scaleY)));

              const { data } = ctx.getImageData(ix, iy, iw, ih);
              let sum = 0;
              const n = data.length / 4;

              for (let i = 0; i < data.length; i += 4) {
                const a = data[i + 3] / 255;
                if (a < 0.005) continue;
                const r = data[i]     / 255;
                const g = data[i + 1] / 255;
                const b = data[i + 2] / 255;
                // Premultiplied luminance: weight by alpha (canvas bg is transparent → black body)
                sum += a * (0.2126 * r + 0.7152 * g + 0.0722 * b);
              }

              const raw = sum / n;
              // Lerp for smooth transitions (fast attack, fast decay)
              smooth = smooth * 0.78 + raw * 0.22;
              // ×10 amplification — relevant intensity gain
              setGlow(Math.min(1, smooth * 10));
            }
          } catch {
            // Canvas not accessible (tainted, hidden, etc.)
          }
        }
      }
      rafId = requestAnimationFrame(detect);
    };

    rafId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Glow shadow: text brightens when canvas brightens — inverse of dimming
  const shadow = glow > 0.04
    ? [
        `0 0 ${Math.round(12 + 20 * glow)}px rgba(255,255,255,${(0.6 * glow).toFixed(2)})`,
        `0 0 ${Math.round(24 + 40 * glow)}px rgba(210,222,255,${(0.3 * glow).toFixed(2)})`,
      ].join(", ")
    : "none";

  // ── GSAP entrance animation ──────────────────────────────────────────────
  useEffect(() => {
    if (!nameRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const split = new SplitText(nameRef.current, { type: "chars" });

    gsap.from(split.chars, {
      y: 90,
      opacity: 0,
      duration: 0.9,
      stagger: 0.022,
      ease: "power4.out",
      delay: 0.15,
    });

    gsap.from([greetRef.current, subtitleRef.current], {
      y: 18,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.6,
    });

    return () => split.revert();
  }, []);

  return (
    <section
      className="relative flex min-h-screen flex-col items-start justify-center overflow-hidden"
      style={{ paddingLeft: "clamp(32px, 5vw, 80px)", paddingRight: "clamp(32px, 5vw, 80px)" }}
    >
      {/* Scanner vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Hero content — z:3 so it sits above the canvas (z:2) */}
      <div
        ref={heroTextRef}
        className="relative flex flex-col items-start"
        style={{ zIndex: 3, gap: 16 }}
      >
        <span
          ref={greetRef}
          style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "white",
            opacity: 0.55,
            textShadow: shadow,
            transition: "text-shadow 180ms ease",
          }}
        >
          {hero.greeting}
        </span>

        <h1
          ref={nameRef}
          style={{
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "white",
            textShadow: shadow,
            transition: "text-shadow 180ms ease",
          }}
        >
          <span
            className="block"
            style={{ fontSize: "clamp(72px, 11vw, 180px)", fontWeight: 800, display: "block" }}
          >
            {firstName}
          </span>
          {lastName && (
            <span
              className="block"
              style={{ fontSize: "clamp(48px, 7.5vw, 120px)", fontWeight: 800, opacity: 0.55, display: "block" }}
            >
              {lastName}
            </span>
          )}
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontSize: 14,
            opacity: 0.6,
            margin: "8px 0 0",
            fontFamily: "var(--font-geist-sans, sans-serif)",
            textTransform: "uppercase",
            color: "white",
            textShadow: shadow,
            transition: "text-shadow 180ms ease",
          }}
        >
          {hero.title}
        </p>

        <div className="flex flex-col sm:flex-row" style={{ gap: 16, marginTop: 16 }}>
          <Link
            href={`/${locale}/projects`}
            className="px-8 py-3 bg-white text-black font-sans text-sm tracking-wide hover:bg-white/90 transition-colors"
          >
            {hero.cta_projects}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="px-8 py-3 border border-white/30 font-sans text-sm tracking-wide hover:border-white/70 transition-colors"
          >
            {hero.cta_contact}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-25 select-none"
        style={{ zIndex: 2 }}
      >
        <span className="font-sans text-xs tracking-widest uppercase">scroll</span>
        <div className="h-10 w-px bg-white" />
      </div>
    </section>
  );
}
