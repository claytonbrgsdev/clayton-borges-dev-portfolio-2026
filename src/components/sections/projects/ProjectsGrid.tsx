"use client";

// TODO: Add filter animations with GSAP + category filter state
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { Project, ProjectCategory } from "@/lib/data/projects";

interface ProjectsGridProps {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}

const FILTERS: { key: ProjectCategory | "all"; labelKey: keyof Dictionary["projects"] }[] = [
  { key: "all", labelKey: "filter_all" },
  { key: "3d-visualization", labelKey: "filter_3d" },
  { key: "web-app", labelKey: "filter_web" },
  { key: "platform", labelKey: "filter_platform" },
  { key: "ai-ml", labelKey: "filter_ai" },
  { key: "audio", labelKey: "filter_audio" },
  { key: "data-engineering", labelKey: "filter_data" },
  { key: "embedded", labelKey: "filter_embedded" },
];

export function ProjectsGrid({ dict, locale, projects }: ProjectsGridProps) {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(active));

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-12">
        {FILTERS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`font-mono text-xs tracking-wide px-4 py-2 border transition-colors ${
              active === key
                ? "border-white bg-white text-black"
                : "border-white/20 opacity-50 hover:opacity-100 hover:border-white/50"
            }`}
          >
            {dict.projects[labelKey] as string}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="border border-white/10 p-6 hover:border-white/30 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="font-mono text-xs opacity-30">{project.year}</span>
              {project.client && (
                <span className="font-mono text-xs opacity-40">
                  {dict.projects.client_label}: {project.client}
                </span>
              )}
            </div>

            <h3 className="font-bold text-lg mb-3">
              {locale === "pt" ? project.namePt : project.nameEn}
            </h3>

            <p className="text-sm opacity-50 leading-relaxed mb-4 flex-1">
              {locale === "pt" ? project.descriptionPt : project.descriptionEn}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech.map((t) => (
                <span key={t} className="font-mono text-xs opacity-40 border border-white/10 px-2 py-0.5">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex gap-4 mt-auto">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs tracking-wide opacity-50 hover:opacity-100 transition-opacity"
                >
                  {dict.projects.view_code} ↗
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs tracking-wide opacity-50 hover:opacity-100 transition-opacity"
                >
                  {dict.projects.view_live} ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
