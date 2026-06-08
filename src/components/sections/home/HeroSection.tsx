"use client";

import { useRef, useEffect } from "react";
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

  const nameRef = useRef<HTMLHeadingElement>(null);
  const greetRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!nameRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const split = new SplitText(nameRef.current, { type: "chars" });

    // chars enter from below with stagger
    gsap.from(split.chars, {
      y: 90,
      opacity: 0,
      duration: 0.9,
      stagger: 0.022,
      ease: "power4.out",
      delay: 0.15,
    });

    // greeting and subtitle slide in
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
      {/* Scanner vignette — fixed so it frames the canvas on every section */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative flex flex-col items-start" style={{ zIndex: 2, gap: 16 }}>
        <span
          ref={greetRef}
          style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.4,
          }}
        >
          {hero.greeting}
        </span>

        <h1
          ref={nameRef}
          style={{ lineHeight: 0.92, letterSpacing: "-0.03em", margin: 0 }}
        >
          <span
            className="block"
            style={{
              fontSize: "clamp(72px, 11vw, 180px)",
              fontWeight: 800,
              display: "block",
            }}
          >
            {firstName}
          </span>
          {lastName && (
            <span
              className="block"
              style={{
                fontSize: "clamp(48px, 7.5vw, 120px)",
                fontWeight: 800,
                opacity: 0.35,
                display: "block",
              }}
            >
              {lastName}
            </span>
          )}
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontSize: 14,
            opacity: 0.5,
            margin: "8px 0 0",
            fontFamily: "var(--font-geist-sans, sans-serif)",
            textTransform: "uppercase",
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
