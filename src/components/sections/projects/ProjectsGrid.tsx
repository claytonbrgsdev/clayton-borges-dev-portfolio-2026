"use client";

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
  { key: "all",               labelKey: "filter_all" },
  { key: "3d-visualization",  labelKey: "filter_3d" },
  { key: "web-app",           labelKey: "filter_web" },
  { key: "platform",          labelKey: "filter_platform" },
  { key: "ai-ml",             labelKey: "filter_ai" },
  { key: "audio",             labelKey: "filter_audio" },
  { key: "data-engineering",  labelKey: "filter_data" },
  { key: "embedded",          labelKey: "filter_embedded" },
];

const border = "1px solid rgba(10,10,10,0.12)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const sans: React.CSSProperties = { fontFamily: "var(--font-geist-sans, sans-serif)" };

export function ProjectsGrid({ dict, locale, projects }: ProjectsGridProps) {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(active));

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 48 }}>
        {FILTERS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              ...mono,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              border: active === key ? "1px solid #0A0A0A" : border,
              background: active === key ? "#0A0A0A" : "transparent",
              color: active === key ? "#F2F0EC" : "rgba(10,10,10,0.5)",
              cursor: "pointer",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => {
              if (active !== key) (e.currentTarget as HTMLElement).style.color = "#0A0A0A";
            }}
            onMouseLeave={(e) => {
              if (active !== key) (e.currentTarget as HTMLElement).style.color = "rgba(10,10,10,0.5)";
            }}
          >
            {dict.projects[labelKey] as string}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, borderLeft: border, borderTop: border }}>
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} dict={dict} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, dict, locale }: { project: Project; dict: Dictionary; locale: Locale }) {
  return (
    <div
      style={{
        borderRight: border,
        borderBottom: border,
        padding: "20px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(10,10,10,0.025)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "rgba(10,10,10,0.35)" }}>
          {project.year}
        </span>
        {project.client && (
          <span style={{ ...mono, fontSize: 9, color: "rgba(10,10,10,0.35)" }}>
            {dict.projects.client_label}: {project.client}
          </span>
        )}
      </div>

      <h3 style={{ ...sans, fontSize: 17, fontWeight: 600, color: "#0A0A0A", margin: 0, letterSpacing: "-0.01em" }}>
        {locale === "pt" ? project.namePt : project.nameEn}
      </h3>

      <p style={{ ...sans, fontSize: 13, color: "#0A0A0A", opacity: 0.6, margin: "4px 0 0", lineHeight: 1.55, flex: 1 }}>
        {locale === "pt" ? project.descriptionPt : project.descriptionEn}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
        {project.tech.map((t) => (
          <span key={t} style={{ ...mono, fontSize: 9, color: "rgba(10,10,10,0.45)", border: "1px solid rgba(10,10,10,0.1)", padding: "3px 8px" }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...mono, fontSize: 10, color: "rgba(10,10,10,0.45)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.1s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6B35D9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(10,10,10,0.45)"; }}
          >
            {dict.projects.view_code} ↗
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...mono, fontSize: 10, color: "rgba(10,10,10,0.45)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.1s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6B35D9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(10,10,10,0.45)"; }}
          >
            {dict.projects.view_live} ↗
          </a>
        )}
      </div>
    </div>
  );
}
