"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LAB_PARTS } from "@/lib/data/lab-narrative";
import type { LabPart } from "@/lib/data/lab-narrative";

// ── Tiny SVG motifs per part ───────────────────────────────────────────────────
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
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d={pts.join(" ") + "Z"} stroke={color} strokeWidth="0.7" opacity="0.6" />
    </svg>
  );
}

function MotifForce({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <ellipse cx="13" cy="20" rx="9" ry="6" stroke={color} strokeWidth="0.7" opacity="0.5" transform="rotate(-20 13 20)" />
      <ellipse cx="27" cy="20" rx="9" ry="6" stroke={color} strokeWidth="0.7" opacity="0.5" transform="rotate(20 27 20)" />
      <line x1="13" y1="20" x2="27" y2="20" stroke={color} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

function MotifMind({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <polygon points="20,4 36,34 4,34" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <polygon points="20,12 29,28 11,28" stroke={color} strokeWidth="0.5" opacity="0.4" />
      <polygon points="20,19 25,28 15,28" stroke={color} strokeWidth="0.4" opacity="0.25" />
    </svg>
  );
}

// ── Part card ──────────────────────────────────────────────────────────────────
function PartCard({
  part,
  hovered,
  onHover,
  onLeave,
  lineReveal,
}: {
  part: LabPart;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  lineReveal: number;
}) {
  const Motif =
    part.id === "form" ? MotifForm : part.id === "force" ? MotifForce : MotifMind;

  return (
    <div
      style={{
        display: "flex",
        gap: 40,
        alignItems: "flex-start",
        padding: "48px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "default",
        transition: "background 0.3s",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Timeline node */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: 40,
          paddingTop: 4,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: hovered ? part.accent : "rgba(255,255,255,0.1)",
            boxShadow: hovered ? `0 0 14px ${part.accent}` : "none",
            border: `1px solid ${hovered ? part.accent : "rgba(255,255,255,0.2)"}`,
            transition: "all 0.4s ease",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
        />
        {part.number < 3 && (
          <div
            style={{
              width: 1,
              height: 80,
              background: `linear-gradient(to bottom, ${part.accent}40, transparent)`,
              marginTop: 4,
              opacity: lineReveal,
              transition: "opacity 0.4s",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: part.accent,
            opacity: 0.75,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>PART {["I", "II", "III"][part.number - 1]}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ opacity: 0.55 }}>{part.subtitle}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: hovered ? "#fff" : "rgba(255,255,255,0.72)",
              transition: "color 0.3s",
            }}
          >
            {part.title}
          </h2>
          <Motif color={part.accent} />
        </div>

        <p
          style={{
            margin: 0,
            fontFamily: "'Courier New', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.04em",
            fontStyle: "italic",
            color: part.accent,
            opacity: hovered ? 0.9 : 0.5,
            marginBottom: 14,
            transition: "opacity 0.3s",
          }}
        >
          &ldquo;{part.tagline}&rdquo;
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.35)",
            maxWidth: 480,
            lineHeight: 1.65,
            marginBottom: 24,
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 0.3s",
          }}
        >
          {part.arc}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
            }}
          >
            {part.phases.length} experiments
          </span>
          <Link
            href={part.phases[0]}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: part.accent,
              border: `1px solid ${part.accent}50`,
              padding: "7px 16px",
              background: hovered ? part.accentMuted : "transparent",
              transition: "background 0.3s",
              display: "inline-block",
            }}
          >
            ENTER →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Animated background canvas ─────────────────────────────────────────────────
function BackgroundField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let raf = 0;
    const pts: { x: number; y: number; vx: number; vy: number; a: number }[] = [];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 55; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random(),
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.06 + p.a * 0.04})`;
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 120) * 0.04})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function LabLanding() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [lineReveal, setLineReveal] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const dur = 1800;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setLineReveal(e);
      if (t < 1) requestAnimationFrame(animate);
    };
    const id = setTimeout(() => requestAnimationFrame(animate), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#030304", color: "#fff", position: "relative" }}>
      <BackgroundField />

      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(3,3,4,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "0.6rem",
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
          ← Portfolio
        </Link>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "0.58rem",
            opacity: 0.15,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          THE LAB · {LAB_PARTS.reduce((s, p) => s + p.phases.length, 0)} experiments
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Intro */}
        <div style={{ padding: "88px 0 64px" }}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.36em",
              opacity: 0.28,
              marginBottom: 22,
              textTransform: "uppercase",
            }}
          >
            FIELD GUIDE TO EMERGENCE
          </div>
          <h1
            style={{
              fontSize: "clamp(3.2rem, 9vw, 6.5rem)",
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.025em",
              margin: 0,
              marginBottom: 28,
            }}
          >
            THE<br />LAB
          </h1>
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.78rem",
              opacity: 0.38,
              maxWidth: 400,
              lineHeight: 1.75,
              margin: 0,
              letterSpacing: "0.03em",
            }}
          >
            Three acts. {LAB_PARTS.reduce((s, p) => s + p.phases.length, 0)} experiments.
            <br />
            A field guide to the rules that write themselves.
          </p>
        </div>

        <div
          style={{
            height: 1,
            background: "linear-gradient(to right, rgba(255,255,255,0.12), transparent)",
            marginBottom: 8,
          }}
        />

        {/* Roadmap */}
        <div>
          {LAB_PARTS.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              hovered={hovered === part.number}
              onHover={() => setHovered(part.number)}
              onLeave={() => setHovered(null)}
              lineReveal={lineReveal}
            />
          ))}
        </div>

        {/* Primary CTA */}
        <div style={{ padding: "64px 0 96px", display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/lab-phase-17"
            style={{
              display: "inline-block",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#C84030",
              textDecoration: "none",
              border: "1px solid rgba(200,64,48,0.45)",
              padding: "14px 32px",
              background: "transparent",
              transition: "background 0.25s, border-color 0.25s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(200,64,48,0.1)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,64,48,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,64,48,0.45)";
            }}
          >
            BEGIN FROM THE START →
          </Link>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              opacity: 0.2,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            PART I · FORM
          </span>
        </div>
      </div>
    </div>
  );
}
