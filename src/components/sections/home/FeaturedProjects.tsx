"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { Project } from "@/lib/data/projects";

interface FeaturedProjectsProps {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}

function ProjectLinks({
  project,
  dict,
  locale,
}: {
  project: Project;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap gap-4 mt-auto pt-4">
      {project.overview && (
        <Link
          href={`/${locale}/projects/${project.id}`}
          className="font-mono text-xs tracking-wide opacity-70 hover:opacity-100 transition-opacity"
        >
          {dict.projects.view_case_study} →
        </Link>
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
    </div>
  );
}

export function FeaturedProjects({ dict, locale, projects }: FeaturedProjectsProps) {
  const { featured_projects } = dict.home;

  // First 4 featured: Moveo as main, next 3 in grid
  const main = projects[0];
  const grid = projects.slice(1, 4);

  if (!main) return null;

  const mainName   = locale === "pt" ? main.namePt   : main.nameEn;
  const mainDesc   = locale === "pt" ? main.descriptionPt : main.descriptionEn;

  return (
    <section
      id="projects"
      className="relative py-32 px-6 md:px-12 border-t border-white/10"
      style={{ zIndex: 2 }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
              {featured_projects.label}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold">{featured_projects.heading}</h2>
          </div>
          <Link
            href={`/${locale}/projects`}
            className="hidden md:block font-mono text-sm tracking-wide underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {featured_projects.cta} →
          </Link>
        </div>

        {/* Main featured card — full width */}
        <div className="border border-white/20 p-8 md:p-10 mb-6 hover:border-white/35 transition-colors flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {main.client && (
                <span className="font-mono text-xs opacity-40 block mb-2">
                  {dict.projects.client_label}: {main.client}
                </span>
              )}
              <h3 className="font-bold text-2xl md:text-3xl mb-1">{mainName}</h3>
              {main.type && (
                <span className="font-mono text-xs opacity-40">{main.type}</span>
              )}
            </div>
            <span className="font-mono text-xs opacity-30 border border-white/10 px-2 py-1">
              {main.year}
            </span>
          </div>

          <p className="text-sm opacity-55 leading-relaxed max-w-2xl">{mainDesc}</p>

          {main.highlights && main.highlights.length > 0 && (
            <ul className="space-y-2">
              {main.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm opacity-60">
                  <span className="font-mono opacity-50 mt-0.5 shrink-0">●</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            {main.tech.map((t) => (
              <span
                key={t}
                className="font-mono text-xs opacity-40 border border-white/10 px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>

          <ProjectLinks project={main} dict={dict} locale={locale} />
        </div>

        {/* 3-card grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {grid.map((project) => {
            const name = locale === "pt" ? project.namePt : project.nameEn;
            const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;

            return (
              <div
                key={project.id}
                className="group border border-white/10 p-6 hover:border-white/25 transition-colors flex flex-col gap-4"
              >
                {project.client && (
                  <span className="font-mono text-xs opacity-40">
                    {dict.projects.client_label}: {project.client}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-base mb-1">{name}</h3>
                  {project.type && (
                    <span className="font-mono text-xs opacity-35">{project.type}</span>
                  )}
                </div>
                <p className="text-sm opacity-50 leading-relaxed line-clamp-3 flex-1">{desc}</p>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className="space-y-1.5">
                    {project.highlights.slice(0, 3).map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs opacity-45">
                        <span className="font-mono opacity-50 mt-0.5 shrink-0">●</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.tech.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs opacity-35 border border-white/10 px-2 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                  {project.tech.length > 4 && (
                    <span className="font-mono text-xs opacity-25">
                      +{project.tech.length - 4}
                    </span>
                  )}
                </div>

                <ProjectLinks project={project} dict={dict} locale={locale} />
              </div>
            );
          })}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href={`/${locale}/projects`}
            className="font-mono text-sm tracking-wide underline underline-offset-4"
          >
            {featured_projects.cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
