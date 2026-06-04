"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLabNav, LAB_PARTS, LAB_SEQUENCE, ROMAN } from "@/lib/data/lab-narrative";
import type { LabPartNumber } from "@/lib/data/lab-narrative";

interface Props {
  route: string;
}

// Atmosphere gradient per part — very subtle corner glow
const ATMOSPHERE: Record<LabPartNumber, string> = {
  1: "radial-gradient(ellipse 45% 45% at 102% 102%, rgba(200,64,48,0.07) 0%, transparent 70%)",
  2: "radial-gradient(ellipse 45% 45% at 102% -2%, rgba(48,96,208,0.07) 0%, transparent 70%)",
  3: "radial-gradient(ellipse 45% 45% at -2% -2%, rgba(128,64,192,0.07) 0%, transparent 70%)",
};

interface Transition {
  partNumber: LabPartNumber;
  title: string;
  tagline: string;
  accent: string;
  nextRoute: string;
}

export function LabChrome({ route }: Props) {
  const router = useRouter();
  const nav = getLabNav(route);
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [transition, setTransition] = useState<Transition | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const check = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      setAtBottom(scrolled >= total - window.innerHeight * 0.12);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  // Auto-advance interstitial after 3.5s
  useEffect(() => {
    if (!transition) return;
    const t = setTimeout(() => router.push(transition.nextRoute), 3500);
    return () => clearTimeout(t);
  }, [transition, router]);

  // Mark current phase visited in localStorage
  useEffect(() => {
    try {
      const prev: string[] = JSON.parse(localStorage.getItem("lab_visited") ?? "[]");
      if (!prev.includes(route)) {
        localStorage.setItem("lab_visited", JSON.stringify([...prev, route]));
      }
    } catch {}
  }, [route]);

  const goNext = useCallback(() => {
    if (!nav?.nextRoute) return;
    if (nav.isLastInPart && nav.partNumber < 3) {
      const nextPartNum = (nav.partNumber + 1) as LabPartNumber;
      const nextPart = LAB_PARTS.find((p) => p.number === nextPartNum);
      if (nextPart) {
        setTransition({
          partNumber: nextPart.number,
          title: nextPart.title,
          tagline: nextPart.tagline,
          accent: nextPart.accent,
          nextRoute: nav.nextRoute,
        });
        return;
      }
    }
    router.push(nav.nextRoute);
  }, [nav, router]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "]") {
        e.preventDefault();
        if (transition) { router.push(transition.nextRoute); return; }
        goNext();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/lab");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, router, transition]);

  if (!nav) return null;

  const globalIdx = LAB_SEQUENCE.findIndex((s) => s.route === route);
  const globalTotal = LAB_SEQUENCE.length;
  const globalProgress = globalTotal > 1 ? (globalIdx / (globalTotal - 1)) * 100 : 0;

  const roman = ROMAN[nav.partNumber];
  const phaseNum = nav.indexInPart + 1;
  const accent = nav.partAccent;
  const nextPartRoman =
    nav.isLastInPart && nav.partNumber < 3
      ? ROMAN[(nav.partNumber + 1) as LabPartNumber]
      : null;
  const nextLabel = !nav.nextRoute
    ? null
    : nextPartRoman
    ? `PART ${nextPartRoman} →`
    : "NEXT →";

  const baseOpacity: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: "opacity 0.8s ease",
  };

  return (
    <>
      {/* Global story progress bar — top of viewport */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 300,
          height: 2,
          width: `${globalProgress}%`,
          background: accent,
          opacity: visible ? 0.65 : 0,
          transition: "width 1s ease, opacity 0.8s ease",
          pointerEvents: "none",
          boxShadow: `0 0 6px ${accent}`,
        }}
      />

      {/* Atmosphere overlay — subtle corner glow per act */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background: ATMOSPHERE[nav.partNumber],
          transition: "background 1.2s ease",
        }}
      />

      {/* Part-transition interstitial */}
      {transition && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "#030304",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => router.push(transition.nextRoute)}
        >
          <style>{`
            @keyframes lcFadeUp {
              from { opacity: 0; transform: translateY(18px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes lcBlink {
              0%, 100% { opacity: 0.22; }
              50%       { opacity: 0.55; }
            }
          `}</style>
          <div style={{ textAlign: "center", padding: "0 32px" }}>
            <p
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.42em",
                color: transition.accent,
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 20,
                animation: "lcFadeUp 0.6s 0.1s both",
              }}
            >
              PART {ROMAN[transition.partNumber]}
            </p>
            <h2
              style={{
                fontSize: "clamp(4rem, 12vw, 8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 0.88,
                color: "#fff",
                margin: 0,
                marginBottom: 28,
                animation: "lcFadeUp 0.7s 0.35s both",
              }}
            >
              {transition.title}
            </h2>
            <p
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "0.75rem",
                fontStyle: "italic",
                color: transition.accent,
                letterSpacing: "0.04em",
                margin: 0,
                marginBottom: 56,
                animation: "lcFadeUp 0.6s 0.65s both",
              }}
            >
              &ldquo;{transition.tagline}&rdquo;
            </p>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                animation: "lcBlink 1.8s 1.5s infinite",
              }}
            >
              CLICK OR PRESS → TO CONTINUE
            </span>
          </div>
        </div>
      )}

      {/* ← LAB — top left */}
      <Link
        href="/lab"
        style={{
          ...baseOpacity,
          position: "fixed",
          top: 18,
          left: 18,
          zIndex: 200,
          fontFamily: "'Courier New', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          textDecoration: "none",
          padding: "6px 10px",
          border: "1px solid rgba(255,255,255,0.09)",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
        }}
      >
        ← LAB
      </Link>

      {/* Bottom chrome strip */}
      <div
        style={{
          ...baseOpacity,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: 38,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          fontFamily: "'Courier New', monospace",
          fontSize: "0.58rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        {/* Part indicator */}
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: accent,
              display: "inline-block",
              boxShadow: `0 0 5px ${accent}`,
              flexShrink: 0,
            }}
          />
          <span style={{ color: accent, opacity: 0.85 }}>
            PART {roman} · {nav.partTitle}
          </span>
        </span>

        {/* Phase counter */}
        <span style={{ color: "rgba(255,255,255,0.18)" }}>
          {phaseNum} / {nav.totalInPart}
        </span>

        {/* Next / back */}
        {nav.nextRoute && nextLabel ? (
          <button
            onClick={goNext}
            style={{
              color: atBottom ? accent : "rgba(255,255,255,0.2)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.5s",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: 0,
            }}
          >
            {nextLabel}
          </button>
        ) : nav.isLastOverall ? (
          <Link
            href="/lab"
            style={{
              color: atBottom ? accent : "rgba(255,255,255,0.2)",
              textDecoration: "none",
              transition: "color 0.5s",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
            }}
          >
            ← LAB
          </Link>
        ) : null}
      </div>
    </>
  );
}
