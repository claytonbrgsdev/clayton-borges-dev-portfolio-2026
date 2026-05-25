"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { HardwareProject, HardwareImage } from "@/lib/data/hardware";

interface HardwareCardProps {
  project: HardwareProject;
  dict: Dictionary;
  locale: Locale;
  index: number;
}

const IMAGE_TYPE_LABELS: Record<HardwareImage["type"], keyof Dictionary["hardware"]> = {
  photo:      "photo_label",
  schematic:  "schematic_label",
  diagram:    "diagram_label",
  breadboard: "breadboard_label",
  pcb:        "pcb_label",
};

const STATUS_LABELS: Record<HardwareProject["status"], keyof Dictionary["hardware"]> = {
  completed:   "status_completed",
  "in-progress": "status_in_progress",
  prototype:   "status_prototype",
};

const STATUS_STYLE: Record<HardwareProject["status"], React.CSSProperties> = {
  completed:   { border: "1px solid rgba(42,157,92,0.5)",  color: "#2A9D5C" },
  "in-progress": { border: "1px solid rgba(214,158,46,0.5)", color: "#8B6914" },
  prototype:   { border: "1px solid rgba(10,10,10,0.2)",   color: "rgba(10,10,10,0.45)" },
};

const border = "1px solid rgba(10,10,10,0.1)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const sans: React.CSSProperties = { fontFamily: "var(--font-geist-sans, sans-serif)" };

export function HardwareCard({ project, dict, locale }: HardwareCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const name        = locale === "pt" ? project.namePt        : project.nameEn;
  const tagline     = locale === "pt" ? project.taglinePt     : project.taglineEn;
  const description = locale === "pt" ? project.descriptionPt : project.descriptionEn;
  const body        = locale === "pt" ? project.bodyPt        : project.bodyEn;
  const paragraphs  = body.split("\n\n").filter(Boolean);

  const hw = dict.hardware;

  return (
    <article style={{ borderTop: border, paddingTop: 48, ...sans, color: "#0A0A0A" }}>
      {/* Header row */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)" }}>
              {project.microcontroller}
            </span>
            <span style={{ color: "rgba(10,10,10,0.25)", fontSize: 10 }}>·</span>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "rgba(10,10,10,0.4)" }}>{project.year}</span>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", ...STATUS_STYLE[project.status] }}>
              {hw[STATUS_LABELS[project.status]] as string}
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{name}</h2>
          <p style={{ fontSize: 15, color: "rgba(10,10,10,0.5)", lineHeight: 1.5 }}>{tagline}</p>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", border, padding: "8px 16px", color: "rgba(10,10,10,0.5)", textDecoration: "none", transition: "all 0.1s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#0A0A0A"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,10,10,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(10,10,10,0.5)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,10,10,0.1)"; }}
            >
              {hw.view_code} ↗
            </a>
          )}
          {project.videoUrl && (
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", border, padding: "8px 16px", color: "rgba(10,10,10,0.5)", textDecoration: "none", transition: "all 0.1s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#0A0A0A"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,10,10,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(10,10,10,0.5)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,10,10,0.1)"; }}
            >
              {hw.view_video} ↗
            </a>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48 }}>
        {/* Left — Image gallery */}
        <div>
          {project.images.length > 0 ? (
            <div>
              {/* Main image */}
              <div
                style={{ position: "relative", aspectRatio: "4/3", background: "rgba(10,10,10,0.04)", border, overflow: "hidden", cursor: "zoom-in", marginBottom: 10 }}
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={project.images[activeImage].src}
                  alt={project.images[activeImage].alt}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ ...mono, fontSize: 9, color: "rgba(10,10,10,0.25)" }}>
                    [{hw[IMAGE_TYPE_LABELS[project.images[activeImage].type]] as string}]
                  </span>
                </div>
                <div style={{ position: "absolute", bottom: 10, right: 10, ...mono, fontSize: 9, color: "rgba(10,10,10,0.4)", background: "rgba(242,240,236,0.85)", padding: "2px 8px" }}>
                  {hw[IMAGE_TYPE_LABELS[project.images[activeImage].type]] as string}
                </div>
              </div>

              {/* Caption */}
              {project.images[activeImage].caption && (
                <p style={{ ...mono, fontSize: 10, color: "rgba(10,10,10,0.4)", marginBottom: 12 }}>
                  {project.images[activeImage].caption}
                </p>
              )}

              {/* Thumbnails */}
              {project.images.length > 1 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {project.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      style={{
                        position: "relative",
                        width: 56,
                        height: 56,
                        border: i === activeImage ? "1.5px solid #0A0A0A" : "1px solid rgba(10,10,10,0.15)",
                        overflow: "hidden",
                        opacity: i === activeImage ? 1 : 0.55,
                        cursor: "pointer",
                        background: "rgba(10,10,10,0.04)",
                        transition: "opacity 0.1s, border-color 0.1s",
                        padding: 0,
                      }}
                      aria-label={img.alt}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="56px"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ ...mono, fontSize: 7, color: "rgba(10,10,10,0.3)" }}>
                          {hw[IMAGE_TYPE_LABELS[img.type]] as string}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ aspectRatio: "4/3", background: "rgba(10,10,10,0.04)", border, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ ...mono, fontSize: 9, color: "rgba(10,10,10,0.25)" }}>[{hw.gallery_label}]</span>
            </div>
          )}
        </div>

        {/* Right — Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(10,10,10,0.7)" }}>{description}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(10,10,10,0.55)" }}>{para}</p>
            ))}
          </div>

          {/* Tech stack */}
          <div>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)", display: "block", marginBottom: 10 }}>
              Stack
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {project.tech.map((t) => (
                <span key={t} style={{ ...mono, fontSize: 9, border: "1px solid rgba(10,10,10,0.15)", padding: "4px 10px", color: "rgba(10,10,10,0.55)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Specs table */}
          {project.specs.length > 0 && (
            <div>
              <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)", display: "block", marginBottom: 10 }}>
                {hw.specs_label}
              </span>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {project.specs.map((spec) => (
                    <tr key={spec.label} style={{ borderBottom: "1px solid rgba(10,10,10,0.06)" }}>
                      <td style={{ ...mono, fontSize: 9, color: "rgba(10,10,10,0.4)", padding: "8px 14px 8px 0", whiteSpace: "nowrap", verticalAlign: "top", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {spec.label}
                      </td>
                      <td style={{ fontSize: 13, color: "rgba(10,10,10,0.7)", padding: "8px 0", verticalAlign: "top", lineHeight: 1.5 }}>
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && project.images.length > 0 && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            style={{ position: "absolute", top: 24, right: 24, ...mono, fontSize: 11, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setLightboxOpen(false)}
          >
            ✕ close
          </button>
          <div style={{ position: "relative", maxWidth: 900, width: "100%", maxHeight: "80vh", aspectRatio: "4/3" }}>
            <Image
              src={project.images[activeImage].src}
              alt={project.images[activeImage].alt}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
            />
          </div>
          {project.images[activeImage].caption && (
            <p style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", ...mono, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              {project.images[activeImage].caption}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
