"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { Project } from "@/lib/data/projects";

interface FeaturedProjectsProps {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}

// ─── ProjectLinks ────────────────────────────────────────────────────────────

function ProjectLinks({
  project,
  dict,
  locale,
}: {
  project: Project;
  dict: Dictionary;
  locale: Locale;
}) {
  const linkBase: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    opacity: 0.55,
    textDecoration: "none",
    color: "inherit",
    transition: "opacity 0.2s",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "auto", paddingTop: "12px" }}>
      {project.overview && (
        <Link
          href={`/${locale}/projects/${project.id}`}
          style={linkBase}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.55")}
        >
          {dict.projects.view_case_study} →
        </Link>
      )}
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkBase}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.55")}
        >
          {dict.projects.view_live} ↗
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkBase}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.55")}
        >
          {dict.projects.view_code} ↗
        </a>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FeaturedProjects({ dict, locale, projects }: FeaturedProjectsProps) {
  const { featured_projects } = dict.home;

  const main = projects[0];
  const right = projects.slice(1, 4);

  const [mainHovered, setMainHovered] = useState(false);
  const [hoveredRight, setHoveredRight] = useState<number | null>(null);

  if (!main) return null;

  const mainName = locale === "pt" ? main.namePt : main.nameEn;
  const mainDesc = locale === "pt" ? main.descriptionPt : main.descriptionEn;

  // ── Styles ──────────────────────────────────────────────────────────────────

  const sectionStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    borderTop: "1px solid var(--rule)",
    padding: "clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)",
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  };

  const headerRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "clamp(24px, 4vh, 40px)",
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "9px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    opacity: 0.35,
    display: "block",
    marginBottom: "6px",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "clamp(20px, 2.5vw, 30px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    margin: 0,
    lineHeight: 1,
  };

  const ctaLinkStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    opacity: 0.45,
    textDecoration: "none",
    color: "inherit",
    transition: "opacity 0.2s",
    display: "none",
  };

  // Two-column grid
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "58fr 42fr",
    gap: "0",
    flex: 1,
    minHeight: 0,
  };

  // ── Main card (left) ────────────────────────────────────────────────────────

  const mainCardStyle: React.CSSProperties = {
    borderRight: "1px solid rgba(255,255,255,0.08)",
    borderLeft: mainHovered ? "2px solid var(--accent-orange)" : "2px solid transparent",
    padding: "clamp(24px, 3vw, 40px)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "border-left-color 0.25s ease",
    cursor: "default",
    overflow: "hidden",
  };

  const mainClientStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "9px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    opacity: 0.4,
    display: "block",
    marginBottom: "6px",
  };

  const mainNameStyle: React.CSSProperties = {
    fontSize: "clamp(28px, 3.5vw, 48px)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    margin: 0,
  };

  const typeTagStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "9px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    opacity: 0.35,
    marginTop: "6px",
    display: "inline-block",
  };

  const descStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "clamp(12px, 1.1vw, 14px)",
    lineHeight: 1.65,
    opacity: 0.5,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    margin: 0,
  };

  const techWrapStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  };

  const techTagStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "9px",
    letterSpacing: "0.08em",
    opacity: 0.35,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "2px 7px",
  };

  // ── Right column ─────────────────────────────────────────────────────────────

  const rightColStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <section id="projects" style={sectionStyle}>
      {/* Header row */}
      <div style={headerRowStyle}>
        <div>
          <span style={labelStyle}>02 — {featured_projects.label}</span>
          <h2 style={headingStyle}>{featured_projects.heading}</h2>
        </div>
        <Link
          href={`/${locale}/projects`}
          style={{ ...ctaLinkStyle, display: "block" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.45")}
        >
          {featured_projects.cta} →
        </Link>
      </div>

      {/* Two-column panoramic layout */}
      <div style={gridStyle}>

        {/* ── Left: main card ── */}
        <div
          style={mainCardStyle}
          onMouseEnter={() => setMainHovered(true)}
          onMouseLeave={() => setMainHovered(false)}
        >
          {/* Client + name */}
          <div>
            {main.client && (
              <span style={mainClientStyle}>
                {dict.projects.client_label}: {main.client}
              </span>
            )}
            <h3 style={mainNameStyle}>{mainName}</h3>
            {main.type && <span style={typeTagStyle}>{main.type}</span>}
          </div>

          {/* Description */}
          <p style={descStyle}>{mainDesc}</p>

          {/* Tech stack */}
          <div style={techWrapStyle}>
            {main.tech.map((t) => (
              <span key={t} style={techTagStyle}>{t}</span>
            ))}
          </div>

          {/* Year badge */}
          {main.year && (
            <span
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "9px",
                opacity: 0.25,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "2px 7px",
                alignSelf: "flex-start",
                letterSpacing: "0.1em",
              }}
            >
              {main.year}
            </span>
          )}

          <ProjectLinks project={main} dict={dict} locale={locale} />
        </div>

        {/* ── Right: 3 compact cards ── */}
        <div style={rightColStyle}>
          {right.map((project, idx) => {
            const name = locale === "pt" ? project.namePt : project.nameEn;
            const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;
            const isLast = idx === right.length - 1;
            const isHovered = hoveredRight === idx;

            const compactCardStyle: React.CSSProperties = {
              position: "relative",
              flex: 1,
              borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.07)",
              padding: "clamp(16px, 2.5vh, 28px) clamp(20px, 2.5vw, 32px)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              overflow: "hidden",
              transition: "background 0.2s",
              background: isHovered ? "rgba(255,255,255,0.02)" : "transparent",
            };

            const ghostNumberStyle: React.CSSProperties = {
              position: "absolute",
              top: "50%",
              right: "20px",
              transform: "translateY(-50%)",
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(64px, 6vw, 96px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              opacity: 0.045,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
            };

            const compactClientStyle: React.CSSProperties = {
              fontFamily: "var(--font-geist-sans)",
              fontSize: "8px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: 0.35,
            };

            const compactNameStyle: React.CSSProperties = {
              fontSize: "clamp(14px, 1.4vw, 18px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              margin: 0,
            };

            const compactDescStyle: React.CSSProperties = {
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(11px, 0.9vw, 13px)",
              lineHeight: 1.55,
              opacity: 0.45,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: 0,
            };

            return (
              <div
                key={project.id}
                style={compactCardStyle}
                onMouseEnter={() => setHoveredRight(idx)}
                onMouseLeave={() => setHoveredRight(null)}
              >
                {/* Ghost index number */}
                <span style={ghostNumberStyle} aria-hidden>
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Client + Name */}
                <div style={{ zIndex: 1 }}>
                  {project.client && (
                    <span style={compactClientStyle}>
                      {dict.projects.client_label}: {project.client}
                    </span>
                  )}
                  <h3 style={compactNameStyle}>{name}</h3>
                  {project.type && (
                    <span
                      style={{
                        fontFamily: "var(--font-geist-sans)",
                        fontSize: "8px",
                        opacity: 0.3,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase" as const,
                        display: "inline-block",
                        marginTop: "3px",
                      }}
                    >
                      {project.type}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ ...compactDescStyle, zIndex: 1 }}>{desc}</p>

                {/* Tech tags (max 3) */}
                <div style={{ ...techWrapStyle, zIndex: 1 }}>
                  {project.tech.slice(0, 3).map((t) => (
                    <span key={t} style={techTagStyle}>{t}</span>
                  ))}
                  {project.tech.length > 3 && (
                    <span
                      style={{
                        fontFamily: "var(--font-geist-sans)",
                        fontSize: "9px",
                        opacity: 0.22,
                        letterSpacing: "0.06em",
                      }}
                    >
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div style={{ zIndex: 1 }}>
                  <ProjectLinks project={project} dict={dict} locale={locale} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile CTA fallback */}
      <div style={{ marginTop: "28px", display: "block" }}>
        <Link
          href={`/${locale}/projects`}
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: 0.45,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            color: "inherit",
          }}
        >
          {featured_projects.cta} →
        </Link>
      </div>
    </section>
  );
}
