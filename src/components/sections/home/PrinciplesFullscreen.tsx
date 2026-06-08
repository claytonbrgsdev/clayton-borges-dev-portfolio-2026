"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { principles } from "@/lib/data/principles";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface Props {
  dict: Dictionary;
  locale: Locale;
}

/** MONO: numeric counters (01/05, 02/05…) — always IBM Plex Mono */
const MONO: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono, monospace)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

/** SANS: section/approach labels — follows swappable display font */
const SANS_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans, sans-serif)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export function PrinciplesFullscreen({ dict, locale }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!rows.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(rows, { opacity: 0, y: 24 });

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 78%",
      once: true,
      onEnter: () => {
        gsap.to(rows, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.09,
        });
      },
    });

    return () => st.kill();
  }, []);

  const p = dict.home.principles;

  return (
    <section
      ref={sectionRef}
      id="how-i-work"
      style={{
        background: "#0A0909",
        borderTop: "1px solid var(--rule)",
      }}
    >

      {/* ── Editorial header ── */}
      <div style={{
        borderBottom: "1px solid var(--rule)",
        padding: "0 clamp(20px, 4vw, 60px)",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}>
        {/* Section label */}
        <div style={{
          borderRight: "1px solid var(--rule)",
          padding: "18px 28px 18px 0",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ ...SANS_LABEL, fontSize: 9, color: "var(--accent-orange, #D86020)", whiteSpace: "nowrap" }}>
            {p?.approach_label ?? "Approach"}
          </span>
        </div>

        {/* Oversized heading */}
        <div style={{ overflow: "hidden", flex: 1, paddingLeft: 24, paddingTop: 10, paddingBottom: 6 }}>
          <h2 style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: "clamp(52px, 10vw, 136px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            textTransform: "uppercase",
            margin: 0,
            whiteSpace: "nowrap",
            padding: "0.1em 0 0.05em",
          }}>
            {p?.heading ?? "How I Work"}
          </h2>
        </div>

        {/* Principle count */}
        <div style={{
          borderLeft: "1px solid var(--rule)",
          padding: "18px 0 18px 24px",
          display: "flex",
          alignItems: "flex-end",
          flexShrink: 0,
        }}>
          <span style={{ ...SANS_LABEL, fontSize: 9, color: "var(--text-muted)" }}>
            {String(principles.length).padStart(2, "0")} {locale === "pt" ? "princípios" : "principles"}
          </span>
        </div>
      </div>

      {/* ── Principles list ── */}
      <div style={{ padding: "0 clamp(20px, 4vw, 60px) clamp(48px, 6vw, 80px)" }}>
        {principles.map((principle, i) => {
          const title   = locale === "pt" ? principle.titlePt : principle.title;
          const desc    = locale === "pt" ? principle.descriptionPt : principle.description;
          const isHover = hovered === i;

          return (
            <div
              key={principle.title}
              ref={el => { rowRefs.current[i] = el; }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "clamp(64px, 8vw, 100px) 1fr",
                gap: "0 clamp(24px, 3vw, 48px)",
                padding: "clamp(28px, 4vw, 48px) 0",
                borderBottom: "1px solid var(--rule)",
                alignItems: "start",
                overflow: "hidden",
                cursor: "default",
              }}
            >
              {/* Orange left bar on hover */}
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: 2,
                background: "var(--accent-orange)",
                opacity: isHover ? 1 : 0,
                transition: "opacity 180ms",
              }} />

              {/* Ghost large number */}
              <div style={{
                position: "absolute",
                right: -8,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-geist-sans, sans-serif)",
                fontSize: "clamp(80px, 14vw, 180px)",
                fontWeight: 800,
                letterSpacing: "-0.06em",
                lineHeight: 1,
                color: isHover ? "var(--accent-orange)" : "#fff",
                opacity: isHover ? 0.055 : 0.025,
                userSelect: "none",
                pointerEvents: "none",
                transition: "opacity 280ms, color 280ms",
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Index column */}
              <div style={{ paddingTop: 4 }}>
                <span style={{
                  ...MONO,
                  fontSize: 9,
                  color: isHover ? "var(--accent-orange, #D86020)" : "rgba(255,255,255,0.22)",
                  display: "block",
                  marginBottom: 8,
                  transition: "color 180ms",
                }}>
                  {String(i + 1).padStart(2, "0")} / {String(principles.length).padStart(2, "0")}
                </span>
                <span style={{
                  ...MONO,
                  fontSize: 8,
                  color: isHover ? "var(--accent-orange, #D86020)" : "rgba(255,255,255,0.18)",
                  transition: "color 180ms",
                }}>
                  {principle.icon}
                </span>
              </div>

              {/* Content column */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)",
                  fontSize: "clamp(1.15rem, 2vw, 1.55rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 14,
                  color: isHover ? "#fff" : "rgba(255,255,255,0.88)",
                  transition: "color 180ms",
                }}>
                  {title}
                </span>
                <p style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)",
                  fontSize: "clamp(12px, 1.1vw, 14px)",
                  lineHeight: 1.8,
                  color: isHover ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)",
                  margin: 0,
                  maxWidth: 600,
                  transition: "color 180ms",
                }}>
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
