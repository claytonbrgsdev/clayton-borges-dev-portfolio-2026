"use client";

// TODO: Add GSAP ScrollTrigger fade-in + text reveal animations
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface AboutPreviewProps {
  dict: Dictionary;
  locale: Locale;
}

export function AboutPreview({ dict, locale }: AboutPreviewProps) {
  const { about_preview } = dict.home;

  return (
    <section className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-6">
            {about_preview.label}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
            {about_preview.heading}
          </h2>
          <p className="opacity-60 leading-relaxed mb-8">{about_preview.body}</p>
          <Link
            href={`/${locale}/about`}
            className="font-mono text-sm tracking-wide underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {about_preview.cta} →
          </Link>
        </div>
        {/* Decorative placeholder — will be replaced with 3D element or image */}
        <div className="aspect-square bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="font-mono text-xs opacity-20">[ visual ]</span>
        </div>
      </div>
    </section>
  );
}
