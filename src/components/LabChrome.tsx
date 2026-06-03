"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getLabNav, ROMAN } from "@/lib/data/lab-narrative";

interface Props {
  route: string;
}

export function LabChrome({ route }: Props) {
  const nav = getLabNav(route);
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

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

  if (!nav) return null;

  const roman = ROMAN[nav.partNumber];
  const phaseNum = nav.indexInPart + 1;
  const accent = nav.partAccent;
  const isLastInPart = nav.isLastInPart;
  const nextPartRoman = nav.partNumber < 3 ? ROMAN[(nav.partNumber + 1) as 1 | 2 | 3] : null;

  const nextLabel = !nav.nextRoute
    ? null
    : isLastInPart && nextPartRoman
    ? `PART ${nextPartRoman} →`
    : "NEXT →";

  const base: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: "opacity 0.8s ease",
  };

  return (
    <>
      {/* ← LAB — top left */}
      <Link
        href="/lab"
        style={{
          ...base,
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
          ...base,
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

        {/* Next CTA */}
        {nav.nextRoute && nextLabel ? (
          <Link
            href={nav.nextRoute}
            style={{
              color: atBottom ? accent : "rgba(255,255,255,0.2)",
              textDecoration: "none",
              transition: "color 0.5s",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              pointerEvents: "auto",
            }}
          >
            {nextLabel}
          </Link>
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
