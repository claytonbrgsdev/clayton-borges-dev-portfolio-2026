"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

const OscilloscopeSketch = dynamic(
  () => import("@/components/hero/OscilloscopeSketch").then(m => ({ default: m.OscilloscopeSketch })),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", background: "#F2F0EC" }} /> },
);

interface IndexSectionProps {
  dict: Dictionary;
  locale: Locale;
}

const border = "1px solid rgba(10,10,10,0.12)";
const mono   = "var(--font-geist-mono, monospace)";
const sans   = "var(--font-geist-sans, sans-serif)";

export function IndexSection({ dict }: IndexSectionProps) {
  const h = dict.home.hero;
  const t = dict.home.instrument;

  return (
    <section
      id="index"
      style={{
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "#F2F0EC",
        borderBottom: border,
        paddingTop: 56,
        fontFamily: mono,
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{
        height: 36,
        borderBottom: border,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(10,10,10,0.45)", textTransform: "uppercase" }}>
          {h.index_code}
        </span>
        <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(10,10,10,0.45)", textTransform: "uppercase" }}>
          {t.portfolio_code}
        </span>
        {/* LIVE indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#FF4F00",
              animation: "pulse-live 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(10,10,10,0.55)", textTransform: "uppercase" }}>
            {t.live_label}
          </span>
        </div>
      </div>

      {/* ── Main row ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* Left panel — identity */}
        <div style={{
          width: "clamp(220px, 28vw, 340px)",
          borderRight: border,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px 24px",
        }}>
          {/* Name block */}
          <div>
            <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.10em", color: "rgba(10,10,10,0.40)", textTransform: "uppercase", marginBottom: 18 }}>
              {t.tagline}
            </p>
            <h1 style={{
              fontFamily: sans,
              fontSize: "clamp(2.4rem, 4.5vw, 4.2rem)",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "#0A0A0A",
              margin: 0,
            }}>
              Clayton<br />Borges
            </h1>
            <p style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(10,10,10,0.50)",
              marginTop: 16,
              lineHeight: 1.6,
            }}>
              Creative /<br />Full-Stack Dev.
            </p>
          </div>

          {/* Descriptor block */}
          <div>
            <div style={{ height: 1, background: "rgba(10,10,10,0.10)", marginBottom: 16 }} />
            <p style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.08em", color: "rgba(10,10,10,0.35)", textTransform: "uppercase", lineHeight: 1.8, margin: 0 }}>
              {h.descriptor}
            </p>
          </div>
        </div>

        {/* Right panel — oscilloscope */}
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <OscilloscopeSketch />
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div style={{
        height: 34,
        borderTop: border,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 8, letterSpacing: "0.10em", color: "rgba(10,10,10,0.32)", textTransform: "uppercase" }}>
          {h.tech_strip}
        </span>
        <span style={{ fontSize: 8, letterSpacing: "0.08em", color: "rgba(10,10,10,0.32)", textTransform: "uppercase" }}>
          {h.scroll_hint}
        </span>
      </div>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </section>
  );
}
