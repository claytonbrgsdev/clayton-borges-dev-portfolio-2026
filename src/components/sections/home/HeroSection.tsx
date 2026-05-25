"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface HeroSectionProps {
  dict: Dictionary;
  locale: Locale;
}

export function HeroSection({ dict, locale }: HeroSectionProps) {
  const { hero } = dict.home;

  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      {/* Left-to-right scrim — darkens the text column regardless of background content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.62) 38%, rgba(0,0,0,0.22) 65%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* Bottom scrim — lifts content off the floor */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 30%)",
        }}
      />

      {/* Hero content — left-aligned, anchored to lower-left */}
      <div
        className="relative flex flex-col items-start gap-5 px-10 md:px-16 pb-20 md:pb-28 max-w-3xl"
        style={{ zIndex: 2 }}
      >
        <span className="font-mono text-xs tracking-widest uppercase text-white/60">
          {hero.greeting}
        </span>

        <h1
          className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.92] text-white"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          {hero.name}
        </h1>

        <p className="text-lg md:text-xl text-white/80 font-light">
          {hero.title}
        </p>

        <p className="font-mono text-sm text-white/55 tracking-wide">
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <Link
            href={`/${locale}/projects`}
            className="px-8 py-3 bg-white text-black font-mono text-sm tracking-wide hover:bg-white/90 transition-colors"
          >
            {hero.cta_projects}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="px-8 py-3 border border-white/40 font-mono text-sm tracking-wide hover:border-white/75 transition-colors"
          >
            {hero.cta_contact}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 right-10 flex flex-col items-center gap-3 select-none"
        style={{ zIndex: 2 }}
      >
        <div className="h-10 w-px bg-white/30" />
        <span className="font-mono text-[10px] tracking-widest uppercase text-white/30">scroll</span>
      </div>
    </section>
  );
}
