"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { principles } from "@/lib/data/principles";

interface HowIWorkProps {
  dict: Dictionary;
  locale: Locale;
}

export function HowIWork({ dict, locale }: HowIWorkProps) {
  const { principles: p } = dict.home;

  return (
    <section
      id="how-i-work"
      className="relative py-32 px-6 md:px-12 border-t border-white/10"
      style={{ zIndex: 2 }}
    >
      <div className="mx-auto max-w-6xl">
        <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-4">
          Approach
        </span>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">{p.heading}</h2>
        <p className="font-sans text-sm opacity-50 mb-16 max-w-xl">{p.subheading}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="border border-white/10 p-7 hover:border-white/25 transition-colors"
            >
              <span className="font-mono text-2xl opacity-30 block mb-4 select-none">
                {principle.icon}
              </span>
              <h3 className="font-bold text-base mb-3">
                {locale === "pt" ? principle.titlePt : principle.title}
              </h3>
              <p className="font-sans text-sm opacity-50 leading-relaxed">
                {locale === "pt" ? principle.descriptionPt : principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
