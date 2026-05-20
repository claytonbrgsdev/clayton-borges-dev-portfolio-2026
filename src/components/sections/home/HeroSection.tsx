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
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center overflow-hidden">
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
      <div className="relative flex flex-col items-center gap-6" style={{ zIndex: 2 }}>
        <span className="font-mono text-sm tracking-widest uppercase opacity-50">
          {hero.greeting}
        </span>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight">
          {hero.name}
        </h1>
        <p className="text-xl md:text-2xl opacity-70 font-light">{hero.title}</p>
        <p className="font-mono text-sm opacity-40 tracking-wide">{hero.subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href={`/${locale}/projects`}
            className="px-8 py-3 bg-white text-black font-mono text-sm tracking-wide hover:bg-white/90 transition-colors"
          >
            {hero.cta_projects}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="px-8 py-3 border border-white/30 font-mono text-sm tracking-wide hover:border-white/70 transition-colors"
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
        <span className="font-mono text-xs tracking-widest uppercase">scroll</span>
        <div className="h-10 w-px bg-white" />
      </div>
    </section>
  );
}
