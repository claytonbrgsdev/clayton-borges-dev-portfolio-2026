"use client";

import type { Dictionary } from "@/lib/i18n";
import { stack } from "@/lib/data/stack";

interface SkillsSectionProps {
  dict: Dictionary;
}

export function SkillsSection({ dict }: SkillsSectionProps) {
  const { skills } = dict.home;

  return (
    <section
      id="stack"
      className="relative py-32 px-6 md:px-12 border-t border-white/10"
      style={{ zIndex: 2 }}
    >
      <div className="mx-auto max-w-6xl">
        <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
          {skills.label}
        </span>
        <h2 className="text-3xl md:text-5xl font-bold mb-16">{skills.heading}</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {stack.map((category) => (
            <div key={category.title}>
              <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-5">
                {category.title}
              </span>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <span
                    key={item.name}
                    className="font-mono text-sm border border-white/15 px-3 py-1.5 opacity-70"
                    title={item.note}
                  >
                    {item.name}
                    {item.note && (
                      <span className="opacity-40 text-xs ml-1">·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
