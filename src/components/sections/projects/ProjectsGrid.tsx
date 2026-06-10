"use client";

import { useState } from "react";
import Link from "next/link";
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

// ── Card components ──────────────────────────────────────────────────────────

function FeaturedCard({ project, locale, dict }: { project: Project; locale: Locale; dict: Dictionary }) {
  const name = locale === "pt" ? project.namePt : project.nameEn;
  const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;

  return (
    <div className="border border-white/10 flex flex-col hover:border-white/30 transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative overflow-hidden border-b border-white/[0.08]" style={{ aspectRatio: "16/9" }}>
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={name}
            className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
            <span className="font-sans text-xs text-white/20 tracking-widest uppercase">
              {project.type ?? name}
            </span>
          </div>
        )}
        {/* Case study badge */}
        <span className="absolute top-3 right-3 font-sans text-xs bg-white text-black px-2 py-0.5 tracking-wide">
          Case Study
        </span>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="font-sans text-xs text-white/30">{project.year}</span>
          {project.client && (
            <span className="font-sans text-xs text-white/35">{project.client}</span>
          )}
        </div>

        <h3 className="font-bold text-xl mb-1 leading-tight">{name}</h3>
        {project.type && (
          <span className="font-sans text-xs text-white/35 block mb-3">{project.type}</span>
        )}

        <p className="font-sans text-sm text-white/50 leading-relaxed mb-4 flex-1 line-clamp-3">{desc}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="font-sans text-xs border border-white/10 px-2 py-0.5 text-white/45">
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="font-sans text-xs text-white/25">+{project.tech.length - 4}</span>
          )}
        </div>

        <div className="flex gap-5 mt-auto">
          <Link
            href={`/${locale}/projects/${project.id}`}
            className="font-sans text-xs tracking-wide text-white/60 hover:text-white transition-colors"
          >
            {dict.projects.view_case_study} →
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs tracking-wide text-white/35 hover:text-white/70 transition-colors"
            >
              {dict.projects.view_live} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function RegularCard({ project, locale, dict }: { project: Project; locale: Locale; dict: Dictionary }) {
  const name = locale === "pt" ? project.namePt : project.nameEn;
  const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;

  return (
    <div className="border border-white/10 flex flex-col hover:border-white/25 transition-all duration-300 group hover:-translate-y-0.5">
      {/* Thumbnail — only if image exists */}
      {project.image && (
        <div className="relative overflow-hidden border-b border-white/[0.08]" style={{ aspectRatio: "4/3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={name}
            className="w-full h-full object-cover opacity-65 group-hover:opacity-85 transition-opacity duration-500"
          />
        </div>
      )}

      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-xs text-white/28">{project.year}</span>
          {project.client && (
            <span className="font-sans text-xs text-white/30">{project.client}</span>
          )}
        </div>

        <h3 className="font-bold text-base mb-1 leading-snug">{name}</h3>
        {project.type && (
          <span className="font-sans text-xs text-white/30 block mb-2">{project.type}</span>
        )}

        <p className="font-sans text-xs text-white/45 leading-relaxed mb-3 flex-1 line-clamp-2">{desc}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.tech.slice(0, 3).map((t) => (
            <span key={t} className="font-sans text-xs border border-white/10 px-1.5 py-0.5 text-white/38">
              {t}
            </span>
          ))}
          {project.tech.length > 3 && (
            <span className="font-sans text-xs text-white/22">+{project.tech.length - 3}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-auto">
          {project.overview && (
            <Link
              href={`/${locale}/projects/${project.id}`}
              className="font-sans text-xs text-white/50 hover:text-white transition-colors"
            >
              {dict.projects.view_case_study} →
            </Link>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-white/32 hover:text-white/65 transition-colors"
            >
              {dict.projects.view_live} ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-white/28 hover:text-white/55 transition-colors"
            >
              {dict.projects.view_code} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main grid ────────────────────────────────────────────────────────────────

export function ProjectsGrid({ dict, locale, projects }: ProjectsGridProps) {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(active));

  const featured = filtered.filter((p) => p.overview);
  const regular  = filtered.filter((p) => !p.overview);

  const isPt = locale === "pt";
  const countLabel =
    filtered.length === projects.length
      ? `${projects.length} ${isPt ? "projetos" : "projects"}`
      : `${filtered.length} ${isPt ? "de" : "of"} ${projects.length}`;

  return (
    <div>
      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 sm:mb-10">
        {FILTERS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`font-sans text-xs tracking-wide px-2.5 sm:px-4 py-1.5 sm:py-2 border transition-colors ${
              active === key
                ? "border-white bg-white text-black"
                : "border-white/18 text-white/45 hover:text-white/80 hover:border-white/40"
            }`}
          >
            {dict.projects[labelKey] as string}
          </button>
        ))}
      </div>

      {/* ── Count ────────────────────────────────────────────────────────── */}
      <div className="mb-10 font-sans text-xs text-white/28 tracking-widest">
        {countLabel}
      </div>

      {/* ── Featured — 2-col with thumbnail ──────────────────────────────── */}
      {featured.length > 0 && (
        <div className="mb-14">
          <span className="font-sans text-xs tracking-widest uppercase text-white/25 block mb-5">
            {isPt ? "Case Studies" : "Case Studies"}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {featured.map((project) => (
              <FeaturedCard key={project.id} project={project} locale={locale} dict={dict} />
            ))}
          </div>
        </div>
      )}

      {/* ── Regular — 3-col ──────────────────────────────────────────────── */}
      {regular.length > 0 && (
        <div>
          {featured.length > 0 && (
            <span className="font-sans text-xs tracking-widest uppercase text-white/25 block mb-5">
              {isPt ? "Outros Projetos" : "Other Work"}
            </span>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {regular.map((project) => (
              <RegularCard key={project.id} project={project} locale={locale} dict={dict} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
