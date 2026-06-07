"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LAB_PARTS, ROMAN } from "@/lib/data/lab-narrative";
import type { LabPart } from "@/lib/data/lab-narrative";
import { experiments } from "@/lib/data/experiments";
import type { LabFocus } from "@/lib/data/experiments";
import { useLabLocale } from "@/hooks/useLabLocale";
import type { LabLocale } from "@/hooks/useLabLocale";
import { LabLangSwitch } from "@/components/LabLangSwitch";

// ── Focus label translations ──────────────────────────────────────────────────
const FOCUS_LABELS_PT: Record<LabFocus | "ALL", string> = {
  ALL: "TODOS",
  Generative: "GENERATIVO",
  Mathematics: "MATEMÁTICA",
  Physics: "FÍSICA",
  Simulation: "SIMULAÇÃO",
};

// ── Visited phases hook ────────────────────────────────────────────────────────
function useVisitedPhases(): string[] {
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    try { setVisited(JSON.parse(localStorage.getItem("lab_visited") ?? "[]")); } catch {}
  }, []);
  return visited;
}

// ── Focus color map ────────────────────────────────────────────────────────────
const FOCUS_COLORS: Record<LabFocus, string> = {
  Generative: "#8B5CF6",
  Mathematics: "#06B6D4",
  Physics: "#F59E0B",
  Simulation: "#10B981",
};

const FOCUS_FILTERS: Array<LabFocus | "ALL"> = [
  "ALL",
  "Generative",
  "Mathematics",
  "Physics",
  "Simulation",
];

// ── SVG motifs ─────────────────────────────────────────────────────────────────
function MotifForm({ color }: { color: string }) {
  const pts: string[] = [];
  const R = 14, r = 5, d = 9;
  for (let i = 0; i <= 360; i += 3) {
    const t = (i * Math.PI) / 180;
    const x = 20 + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = 20 + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    pts.push(i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <path d={pts.join(" ") + "Z"} stroke={color} strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}

function MotifForce({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <ellipse cx="13" cy="20" rx="9" ry="6" stroke={color} strokeWidth="0.8" opacity="0.6" transform="rotate(-20 13 20)" />
      <ellipse cx="27" cy="20" rx="9" ry="6" stroke={color} strokeWidth="0.8" opacity="0.6" transform="rotate(20 27 20)" />
      <line x1="13" y1="20" x2="27" y2="20" stroke={color} strokeWidth="0.5" opacity="0.35" />
    </svg>
  );
}

function MotifMind({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <polygon points="20,4 36,34 4,34" stroke={color} strokeWidth="0.8" opacity="0.7" />
      <polygon points="20,12 29,28 11,28" stroke={color} strokeWidth="0.5" opacity="0.45" />
      <polygon points="20,19 25,28 15,28" stroke={color} strokeWidth="0.4" opacity="0.25" />
    </svg>
  );
}

// ── Field Guide part card (compact horizontal) ─────────────────────────────────
function PartCard({ part, visitedCount, locale }: { part: LabPart; visitedCount: number; locale: LabLocale }) {
  const [hovered, setHovered] = useState(false);
  const Motif = part.id === "form" ? MotifForm : part.id === "force" ? MotifForce : MotifMind;
  const title    = locale === "pt" ? part.titlePt    : part.title;
  const subtitle = locale === "pt" ? part.subtitlePt : part.subtitle;
  const tagline  = locale === "pt" ? part.taglinePt  : part.tagline;
  const partWord = locale === "pt" ? "PARTE" : "PART";
  const enterLabel  = locale === "pt" ? "ENTRAR →" : "ENTER →";
  const phasesLabel = (n: number) => locale === "pt" ? `${n} fases` : `${n} phases`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? part.accentMuted : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? part.accent + "40" : "rgba(255,255,255,0.07)"}`,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "background 0.3s, border-color 0.3s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top row: roman numeral + motif */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
            fontSize: "0.55rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: part.accent,
            opacity: 0.65,
          }}
        >
          {partWord} {ROMAN[part.number]}
        </span>
        <Motif color={part.accent} />
      </div>

      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: hovered ? "#fff" : "rgba(255,255,255,0.8)",
          transition: "color 0.3s",
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
          fontSize: "0.55rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        {subtitle}
      </div>

      {/* Tagline */}
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
          fontSize: "0.65rem",
          letterSpacing: "0.03em",
          fontStyle: "italic",
          color: part.accent,
          opacity: hovered ? 0.9 : 0.5,
          transition: "opacity 0.3s",
        }}
      >
        &ldquo;{tagline}&rdquo;
      </p>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(to right, ${part.accent}30, transparent)`,
        }}
      />

      {/* Footer: phase count + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
            fontSize: "0.55rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          {visitedCount > 0 ? (
            <>
              <span style={{ color: part.accent, opacity: 0.85 }}>{visitedCount}</span>
              <span> / {part.phases.length}</span>
            </>
          ) : (
            phasesLabel(part.phases.length)
          )}
        </span>
        <Link
          href={`/lab-part-${part.number}`}
          style={{
            fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
            fontSize: "0.55rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: part.accent,
            border: `1px solid ${part.accent}45`,
            padding: "6px 14px",
            background: hovered ? part.accentMuted : "transparent",
            transition: "background 0.3s",
            display: "inline-block",
          }}
        >
          {enterLabel}
        </Link>
      </div>
    </div>
  );
}

// ── Single experiment card ─────────────────────────────────────────────────────
function ExperimentCard({ exp, locale }: { exp: typeof experiments[number]; locale: LabLocale }) {
  const [hovered, setHovered] = useState(false);
  const focusColor = FOCUS_COLORS[exp.focus];
  const title = locale === "pt" ? exp.titlePt : exp.title;
  const description = locale === "pt" ? exp.descriptionPt : exp.description;
  const phaseWord = locale === "pt" ? "FASE" : "PHASE";
  const focusLabel = locale === "pt" ? FOCUS_LABELS_PT[exp.focus] : exp.focus;

  return (
    <Link
      href={exp.route}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        transition: "background 0.25s, border-color 0.25s, transform 0.25s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      {/* Gradient bar */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(to right, ${exp.gradient.from}, ${exp.gradient.to})`,
          opacity: hovered ? 1 : 0.7,
          transition: "opacity 0.25s",
        }}
      />

      {/* Card body */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Phase label + focus pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
              fontSize: "0.5rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D86020",
              opacity: 0.85,
            }}
          >
            {phaseWord} {exp.phase}
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
              fontSize: "0.48rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: focusColor,
              background: focusColor + "18",
              border: `1px solid ${focusColor}35`,
              padding: "2px 8px",
            }}
          >
            {focusLabel}
          </span>
        </div>

        {/* Title */}
        <h4
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            color: hovered ? "#fff" : "rgba(255,255,255,0.88)",
            transition: "color 0.2s",
          }}
        >
          {title}
        </h4>

        {/* Description */}
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.38)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>

        {/* Tech tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto", paddingTop: 4 }}>
          {exp.tech.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
                fontSize: "0.48rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "2px 7px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function LabLanding() {
  const visited = useVisitedPhases();
  const [activeFilter, setActiveFilter] = useState<LabFocus | "ALL">("ALL");
  const experimentsRef = useRef<HTMLDivElement>(null);
  const fieldGuideRef = useRef<HTMLDivElement>(null);
  const [locale, setLocale] = useLabLocale();
  const toggleLocale = () => setLocale(locale === "pt" ? "en" : "pt");

  const totalExperiments = experiments.length;

  const filteredExperiments =
    activeFilter === "ALL"
      ? experiments
      : experiments.filter((e) => e.focus === activeFilter);

  // Locale-aware string table
  const L = {
    back:         locale === "pt" ? "← Portfólio" : "← Portfolio",
    metaLabel:    locale === "pt"
      ? `THE LAB · ${totalExperiments} EXPERIMENTOS · 3 ATOS`
      : `THE LAB · ${totalExperiments} EXPERIMENTS · 3 ACTS`,
    eyebrow:      locale === "pt"
      ? "GUIA DE CAMPO PARA A EMERGÊNCIA · EXPERIMENTOS LATERAIS"
      : "FIELD GUIDE TO EMERGENCE · SIDE EXPERIMENTS",
    fieldGuideBtn: locale === "pt" ? "GUIA DE CAMPO PARA A EMERGÊNCIA →" : "FIELD GUIDE TO EMERGENCE →",
    fieldGuideSub: locale === "pt" ? "Narrativa sequencial. 3 atos." : "Sequential narrative. 3 acts.",
    browseBtn:    locale === "pt" ? "VER TODOS OS EXPERIMENTOS ↓" : "BROWSE ALL EXPERIMENTS ↓",
    browseSub:    locale === "pt"
      ? `${totalExperiments} experimentos. Qualquer ordem.`
      : `${totalExperiments} experiments. Any order.`,
    sectionField: locale === "pt" ? "GUIA DE CAMPO PARA A EMERGÊNCIA" : "FIELD GUIDE TO EMERGENCE",
    actsPhases:   locale === "pt"
      ? `3 ATOS · ${LAB_PARTS.reduce((s, p) => s + p.phases.length, 0)} FASES`
      : `3 ACTS · ${LAB_PARTS.reduce((s, p) => s + p.phases.length, 0)} PHASES`,
    sectionAll:   locale === "pt" ? "TODOS OS EXPERIMENTOS" : "ALL EXPERIMENTS",
  };

  const scrollToExperiments = () => {
    experimentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToFieldGuide = () => {
    fieldGuideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0909", color: "#fff" }}>
      {/* ── Top nav bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(10,9,9,0.90)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <Link
          href={locale === "pt" ? "/pt" : "/en"}
          style={{
            fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            opacity: 0.28,
            textDecoration: "none",
            color: "inherit",
            textTransform: "uppercase",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.28"; }}
        >
          {L.back}
        </Link>
        <span
          style={{
            fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
            fontSize: "0.55rem",
            opacity: 0.15,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          {L.metaLabel}
        </span>
        <LabLangSwitch locale={locale} onToggle={toggleLocale} />
      </div>

      {/* ── Section A — Hero ────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "clamp(56px, 10vh, 112px) clamp(24px, 6vw, 96px) clamp(48px, 8vh, 80px)",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
            fontSize: "0.55rem",
            letterSpacing: "0.36em",
            opacity: 0.25,
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          {L.eyebrow}
        </div>

        <h1
          style={{
            fontSize: "clamp(3.6rem, 10vw, 7.5rem)",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            margin: "0 0 32px",
          }}
        >
          THE<br />LAB
        </h1>

        <div
          style={{
            height: 1,
            background: "linear-gradient(to right, rgba(255,255,255,0.12), transparent)",
            marginBottom: 40,
          }}
        />

        {/* Entry buttons */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {/* Field Guide CTA */}
          <button
            onClick={scrollToFieldGuide}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 6,
              background: "rgba(216,96,32,0.07)",
              border: "1px solid rgba(216,96,32,0.35)",
              padding: "18px 28px",
              cursor: "pointer",
              transition: "background 0.25s, border-color 0.25s",
              minWidth: 240,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(216,96,32,0.13)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(216,96,32,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(216,96,32,0.07)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(216,96,32,0.35)";
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
                fontSize: "0.65rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#D86020",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {L.fieldGuideBtn}
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
                fontSize: "0.52rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              {L.fieldGuideSub}
            </span>
          </button>

          {/* Browse all CTA */}
          <button
            onClick={scrollToExperiments}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 6,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "18px 28px",
              cursor: "pointer",
              transition: "background 0.25s, border-color 0.25s",
              minWidth: 240,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
                fontSize: "0.65rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {L.browseBtn}
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
                fontSize: "0.52rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              {L.browseSub}
            </span>
          </button>
        </div>
      </div>

      {/* ── Section B — Field Guide ──────────────────────────────────────────── */}
      <div
        ref={fieldGuideRef}
        style={{
          padding: "clamp(48px, 8vh, 80px) clamp(24px, 6vw, 96px)",
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 20,
            marginBottom: 36,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "0.58rem",
              fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 400,
            }}
          >
            {L.sectionField}
          </h2>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span
            style={{
              fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
              fontSize: "0.52rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
            }}
          >
            {L.actsPhases}
          </span>
        </div>

        {/* Three-column part cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {LAB_PARTS.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              visitedCount={part.phases.filter((r) => visited.includes(r)).length}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* ── Section C — All Experiments ──────────────────────────────────────── */}
      <div
        ref={experimentsRef}
        style={{
          padding: "clamp(48px, 8vh, 80px) clamp(24px, 6vw, 96px) clamp(64px, 12vh, 128px)",
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "0.58rem",
              fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 400,
            }}
          >
            {L.sectionAll}
          </h2>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span
            style={{
              fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
              fontSize: "0.52rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
            }}
          >
            {filteredExperiments.length} / {totalExperiments}
          </span>
        </div>

        {/* Focus filter pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {FOCUS_FILTERS.map((f) => {
            const isActive = activeFilter === f;
            const pillColor = f === "ALL" ? "#D86020" : FOCUS_COLORS[f as LabFocus];
            const label = locale === "pt" ? FOCUS_LABELS_PT[f] : f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
                  fontSize: "0.52rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  border: `1px solid ${isActive ? pillColor + "70" : "rgba(255,255,255,0.1)"}`,
                  background: isActive ? pillColor + "18" : "transparent",
                  color: isActive ? pillColor : "rgba(255,255,255,0.35)",
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = pillColor + "50";
                    (e.currentTarget as HTMLElement).style.color = pillColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Experiment cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {filteredExperiments.map((exp) => (
            <ExperimentCard key={exp.route} exp={exp} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
