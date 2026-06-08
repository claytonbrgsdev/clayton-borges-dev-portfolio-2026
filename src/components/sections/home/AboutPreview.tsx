"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface AboutPreviewProps {
  dict: Dictionary;
  locale: Locale;
}

export function AboutPreview({ dict, locale }: AboutPreviewProps) {
  const { about_preview } = dict.home;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll("[data-reveal]");

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="relative py-32 px-6 md:px-12" style={{ zIndex: 2 }}>
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <div ref={containerRef}>
          <span data-reveal className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-6">
            {about_preview.label}
          </span>
          <h2 data-reveal className="text-3xl md:text-5xl font-bold leading-tight mb-8">
            {about_preview.heading}
          </h2>
          <p data-reveal className="font-sans opacity-60 leading-relaxed mb-8">{about_preview.body}</p>
          <Link
            data-reveal
            href={`/${locale}/about`}
            className="font-sans text-sm tracking-wide underline underline-offset-4 hover:opacity-70 transition-opacity"
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
