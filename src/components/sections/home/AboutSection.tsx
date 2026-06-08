"use client";

import { useState, useEffect } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface AboutSectionProps {
  dict: Dictionary;
  locale: Locale;
}

const border = "1px solid rgba(10,10,10,0.12)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };

const STACK_CATEGORIES = [
  { label: "FRONTEND",  items: "React 19 · Next.js 16 · TypeScript · Tailwind · GSAP · Lenis" },
  { label: "3D / ART",  items: "Three.js · React Three Fiber · WebGL · GLSL · Canvas 2D · p5.js · Web Audio" },
  { label: "BACKEND",   items: "Node.js · FastAPI · Python · Ruby · REST · GraphQL · WebSocket" },
  { label: "DATA",      items: "PostgreSQL · Prisma · Supabase · Redis · MongoDB · AWS S3" },
  { label: "HARDWARE",  items: "ESP32 · embedded audio synthesis · circuit design · microcontrollers" },
];

export function AboutSection({ dict }: AboutSectionProps) {
  const t = dict.home.about_section;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <section
      id="about"
      style={{ background: "#F2F0EC", borderBottom: border }}
    >
      {/* Section header */}
      <div style={{ borderBottom: border, padding: "14px 32px", display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", color: "#9A9A9A", textTransform: "uppercase" }}>
          {t.code}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", borderBottom: border }}>
        {/* Left: manifesto + bio */}
        <div style={{ borderRight: isMobile ? "none" : border, borderBottom: isMobile ? border : "none", padding: "48px 40px 48px 32px" }}>
          <p style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: "clamp(1.5rem, 2.4vw, 2.4rem)",
            fontWeight: 700,
            lineHeight: 1.12,
            color: "#0A0A0A",
            margin: "0 0 32px 0",
            letterSpacing: "-0.02em",
          }}>
            {t.manifesto}
          </p>
          <p style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: 14,
            lineHeight: 1.7,
            color: "#0A0A0A",
            opacity: 0.7,
            margin: "0 0 16px 0",
          }}>
            {t.bio}
          </p>
          <p style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: 14,
            lineHeight: 1.7,
            color: "#0A0A0A",
            opacity: 0.5,
            margin: 0,
          }}>
            {t.available_for}
          </p>
        </div>

        {/* Right: product datasheet */}
        <div style={{ padding: isMobile ? "32px 32px 32px 32px" : "48px 32px 48px 40px" }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A", textTransform: "uppercase", marginBottom: 24 }}>
            {t.spec_heading}
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {[
                [t.spec_location,   t.location_val],
                [t.spec_discipline, t.discipline_val],
                [t.spec_year,       t.year_val],
                [t.spec_studio,     t.studio_val],
                [t.spec_available,  t.available_val],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid rgba(10,10,10,0.08)" }}>
                  <td style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A", textTransform: "uppercase", padding: "10px 16px 10px 0", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {label}
                  </td>
                  <td style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 13, color: "#0A0A0A", padding: "10px 0", lineHeight: 1.5 }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stack categories */}
      <div style={{ padding: "0 32px" }}>
        <div style={{ borderBottom: "1px solid rgba(10,10,10,0.08)", padding: "12px 0", display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A", textTransform: "uppercase" }}>
            {t.spec_tools}
          </span>
        </div>
        {STACK_CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            style={{ borderBottom: "1px solid rgba(10,10,10,0.06)", padding: "12px 0", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 4 : 32, alignItems: isMobile ? "flex-start" : "baseline" }}
          >
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A", textTransform: "uppercase", minWidth: 90 }}>
              {cat.label}
            </span>
            <span style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 13, color: "#0A0A0A", opacity: 0.75, lineHeight: 1.5 }}>
              {cat.items}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
