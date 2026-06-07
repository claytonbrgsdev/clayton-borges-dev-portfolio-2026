"use client";
import { useState } from "react";
import { featuredProjects } from "@/lib/data/projects";

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

// 4 mosaic columns × 2 rows = all 8 featured projects visible simultaneously
// without vertical scrolling (panoramic single-viewport layout).
const COLS = 4;

export function WorkHorizontal({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const project = featuredProjects[active];
  const name    = locale === "pt" ? project.namePt    : project.nameEn;
  const desc    = locale === "pt" ? project.descriptionPt : project.descriptionEn;

  const lastRowStart = featuredProjects.length - (featuredProjects.length % COLS || COLS);

  return (
    <section id="work" style={{ background: "#0A0909", borderTop: "1px solid var(--rule)" }}>

      {/* ── Editorial header ── */}
      <div style={{
        borderBottom: "1px solid var(--rule)",
        padding: "0 clamp(20px, 4vw, 60px)",
        display: "flex",
        alignItems: "stretch",
      }}>
        {/* Section label */}
        <div style={{
          borderRight: "1px solid var(--rule)",
          padding: "18px 28px 18px 0",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ ...MONO, fontSize: 9, color: "var(--accent-orange)", whiteSpace: "nowrap" }}>
            {locale === "pt" ? "02 — Trabalhos" : "02 — Work"}
          </span>
        </div>

        {/* Oversized title — clips at right edge for editorial effect */}
        <div style={{ overflow: "hidden", flex: 1, paddingLeft: 24, paddingTop: 10, paddingBottom: 6 }}>
          <h2 style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(52px, 10vw, 136px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            textTransform: "uppercase",
            margin: 0,
            whiteSpace: "nowrap",
            padding: "0.1em 0 0.05em",
          }}>
            {locale === "pt" ? "Projetos Selecionados" : "Selected Projects"}
          </h2>
        </div>

        {/* Counter */}
        <div style={{
          borderLeft: "1px solid var(--rule)",
          padding: "18px 0 18px 24px",
          display: "flex",
          alignItems: "flex-end",
          flexShrink: 0,
        }}>
          <span style={{ ...MONO, fontSize: 9, color: "var(--text-muted)" }}>
            {String(active + 1).padStart(2, "0")} / {String(featuredProjects.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Body: mosaic left + detail right ── */}
      {/* 1fr 1fr: equal split — panoramic mosaic balances against the detail panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* ── Left: 4-col contact-sheet mosaic ── */}
        {/* COLS=4 → 8 projects fill exactly 2 rows, eliminating the need to scroll */}
        <div style={{
          borderRight: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        }}>
          {featuredProjects.map((p, i) => {
            const pName    = locale === "pt" ? p.namePt : p.nameEn;
            const isActive = active === i;
            const isRightCol = (i + 1) % COLS === 0;
            const isLastRow  = i >= lastRowStart;

            return (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  aspectRatio: "4 / 3",
                  display: "block",
                  borderRight: !isRightCol ? "1px solid var(--rule)" : "none",
                  borderBottom: !isLastRow ? "1px solid var(--rule)" : "none",
                }}
              >
                {/* Orange active left bar */}
                <div style={{
                  position: "absolute",
                  left: 0, top: 0, bottom: 0,
                  width: 2,
                  background: "var(--accent-orange)",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 180ms",
                  zIndex: 2,
                }} />

                {/* thumbnail */}
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={pName}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isActive ? 0.55 : 0.18,
                      transition: "opacity 280ms",
                    }}
                  />
                ) : (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: isActive
                      ? "color-mix(in srgb, var(--accent-orange) 10%, var(--bg-elevated))"
                      : "var(--bg-elevated)",
                    transition: "background 280ms",
                  }} />
                )}

                {/* overlay: index + name */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "7px 9px",
                  background: isActive
                    ? "linear-gradient(to top, rgba(10,9,9,0.84) 50%, transparent)"
                    : "linear-gradient(to top, rgba(10,9,9,0.94) 60%, transparent)",
                }}>
                  <span style={{
                    ...MONO,
                    fontSize: 7,
                    color: isActive ? "var(--accent-orange)" : "rgba(255,255,255,0.22)",
                    alignSelf: "flex-end",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "clamp(7px, 0.65vw, 10px)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.38)",
                    lineHeight: 1.1,
                    textAlign: "left",
                    transition: "color 200ms",
                  }}>
                    {pName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right: detail panel ── */}
        {/* No minHeight — mosaic grid row drives the section height */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Ghost project number watermark */}
          <div style={{
            position: "absolute",
            right: -12,
            bottom: -10,
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(100px, 20vw, 280px)",
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.75,
            color: "#fff",
            opacity: 0.035,
            userSelect: "none",
            pointerEvents: "none",
            transition: "opacity 300ms",
          }}>
            {String(active + 1).padStart(2, "0")}
          </div>

          {/* Hero image */}
          <div style={{
            position: "relative",
            flex: "0 0 52%",
            overflow: "hidden",
            background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--rule)",
          }}>
            {project.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={project.id}
                src={project.image}
                alt={name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.65,
                }}
              />
            )}
            {/* Orange top accent line */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: 2,
              background: "var(--accent-orange)",
            }} />
            {/* Year badge */}
            <span style={{
              ...MONO,
              position: "absolute",
              top: 14,
              left: 16,
              fontSize: 8,
              color: "var(--accent-orange)",
              background: "rgba(10,9,9,0.75)",
              padding: "3px 9px",
              border: "1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)",
            }}>
              {project.year}
            </span>
          </div>

          {/* Project info */}
          <div style={{
            flex: 1,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 10,
            position: "relative",
            zIndex: 1,
          }}>
            <div>
              <h3 style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(16px, 1.8vw, 28px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                textTransform: "uppercase",
                lineHeight: 1,
                margin: "0 0 10px",
                padding: "0.08em 0",
              }}>
                {name}
              </h3>
              <p style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "clamp(9px, 0.75vw, 11px)",
                color: "rgba(255,255,255,0.48)",
                lineHeight: 1.8,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {desc}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {project.tech.slice(0, 4).map(t => (
                  <span key={t} style={{
                    ...MONO,
                    fontSize: 7,
                    color: "rgba(255,255,255,0.32)",
                    padding: "3px 7px",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...MONO,
                    fontSize: 8,
                    color: "var(--accent-orange)",
                    textDecoration: "none",
                    border: "1px solid color-mix(in srgb, var(--accent-orange) 40%, transparent)",
                    padding: "6px 14px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "background 180ms",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "color-mix(in srgb, var(--accent-orange) 12%, transparent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  {locale === "pt" ? "Ver Projeto →" : "View Project →"}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
