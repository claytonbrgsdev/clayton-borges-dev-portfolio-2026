"use client";

// TODO: Add GSAP scroll-triggered reveal per project card
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { HardwareProject } from "@/lib/data/hardware";
import { HardwareCard } from "./HardwareCard";

interface HardwareListProps {
  dict: Dictionary;
  locale: Locale;
  projects: HardwareProject[];
}

export function HardwareList({ dict, locale, projects }: HardwareListProps) {
  return (
    <div className="flex flex-col gap-32">
      {projects.map((project, index) => (
        <HardwareCard
          key={project.id}
          project={project}
          dict={dict}
          locale={locale}
          index={index}
        />
      ))}
    </div>
  );
}
