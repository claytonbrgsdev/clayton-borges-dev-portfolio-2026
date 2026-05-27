"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { featuredExperiments } from "@/lib/data/experiments";

interface LabSectionProps {
  dict: Dictionary;
}

export function LabSection({ dict }: LabSectionProps) {
  const { lab } = dict.home;

  return (
    <section
      id="lab"
      className="relative py-32 px-6 md:px-12 border-t border-white/10"
      style={{ zIndex: 2 }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
              Creative Lab
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{lab.heading}</h2>
            <p className="text-sm opacity-50 max-w-lg">{lab.subheading}</p>
          </div>
          <Link
            href="/lab"
            className="hidden md:block font-mono text-sm tracking-wide underline underline-offset-4 hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            {lab.explore_all}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredExperiments.map((exp) => (
            <Link
              key={exp.phase}
              href={exp.route}
              className="group relative block overflow-hidden border border-white/10 hover:border-white/30 transition-colors"
              style={{
                background: `linear-gradient(135deg, ${exp.gradient.from}, ${exp.gradient.to})`,
                minHeight: "200px",
              }}
            >
              {/* Phase badge */}
              <span className="absolute top-4 left-4 font-mono text-xs opacity-40 tracking-widest">
                {exp.phase}
              </span>

              {/* Focus tag */}
              <span className="absolute top-4 right-4 font-mono text-xs opacity-30 border border-white/15 px-2 py-0.5">
                {exp.focus}
              </span>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-bold text-base mb-1 text-white">{exp.title}</h3>
                <p className="text-xs opacity-50 leading-relaxed text-white line-clamp-2">
                  {exp.description}
                </p>
                <span className="font-mono text-xs opacity-0 group-hover:opacity-60 transition-opacity mt-3 block text-white">
                  {lab.enter} →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/lab"
            className="font-mono text-sm tracking-wide underline underline-offset-4"
          >
            {lab.explore_all}
          </Link>
        </div>
      </div>
    </section>
  );
}
