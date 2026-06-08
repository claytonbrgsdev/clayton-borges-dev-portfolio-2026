"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface ContactCTAProps {
  dict: Dictionary;
  locale: Locale;
}

export function ContactCTA({ dict, locale }: ContactCTAProps) {
  const { contact_cta } = dict.home;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll("[data-reveal]");

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: "top 75%",
        },
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="relative py-40 px-6 md:px-12 border-t border-white/10 text-center" style={{ zIndex: 2 }}>
      <div ref={containerRef} className="mx-auto max-w-2xl">
        <h2 data-reveal className="text-4xl md:text-6xl font-bold mb-6">{contact_cta.heading}</h2>
        <p data-reveal className="font-sans opacity-50 mb-10 text-lg">{contact_cta.body}</p>
        <Link
          data-reveal
          href={`/${locale}/contact`}
          className="inline-block px-10 py-4 bg-white text-black font-sans text-sm tracking-wide hover:bg-white/90 transition-colors"
        >
          {contact_cta.cta} →
        </Link>
      </div>
    </section>
  );
}
