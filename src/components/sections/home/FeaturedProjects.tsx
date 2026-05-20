"use client";

// TODO: Add GSAP staggered scroll-reveal for project cards
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { Project } from "@/lib/data/projects";

interface FeaturedProjectsProps {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}

export function FeaturedProjects({ dict, locale, projects }: FeaturedProjectsProps) {
  const { featured_projects } = dict.home;

  return (
    <section className="relative py-32 px-6 md:px-12 border-t border-white/10" style={{ zIndex: 2 }}>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group border border-white/10 p-6 hover:border-white/30 transition-colors"
            >
              {project.client && (
                <span className="font-mono text-xs opacity-40 block mb-3">
                  {dict.projects.client_label}: {project.client}
                </span>
              )}
              <h3 className="font-bold text-lg mb-3">
                {locale === "pt" ? project.namePt : project.nameEn}
              </h3>
              <p className="text-sm opacity-50 leading-relaxed mb-4 line-clamp-3">
                {locale === "pt" ? project.descriptionPt : project.descriptionEn}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.slice(0, 4).map((t) => (
                  <span key={t} className="font-mono text-xs opacity-40 border border-white/10 px-2 py-0.5">
                    {t}
                  </span>
                ))}
                {project.tech.length > 4 && (
                  <span className="font-mono text-xs opacity-30">+{project.tech.length - 4}</span>
                )}
              </div>
              <div className="flex gap-4">
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

        <div className="mt-12 md:hidden">
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
