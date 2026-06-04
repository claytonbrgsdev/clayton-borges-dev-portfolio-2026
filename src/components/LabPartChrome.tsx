"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const ACCENTS: Record<1 | 2 | 3, string> = {
  1: "#C84030",
  2: "#3060D0",
  3: "#8040C0",
};

interface Props {
  partNumber: 1 | 2 | 3;
  nextRoute?: string;
}

export function LabPartChrome({ partNumber, nextRoute }: Props) {
  const [visible, setVisible] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const check = () => {
      const sp = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setNearEnd(sp >= 0.88);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  const accent = ACCENTS[partNumber];
  const baseLink: React.CSSProperties = {
    fontFamily: "'Courier New', monospace",
    fontSize: "0.6rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: "rgba(255,255,255,0.28)",
    padding: "6px 10px",
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  };

  return (
    <>
      {/* ← LAB — top left */}
      <Link
        href="/lab"
        style={{
          ...baseLink,
          position: "fixed",
          top: 18,
          left: 18,
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease",
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

      {/* Bottom CTA — appears when near end of scroll */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          opacity: visible && nearEnd ? 1 : 0,
          transition: "opacity 0.8s ease",
          pointerEvents: visible && nearEnd ? "auto" : "none",
        }}
      >
        {nextRoute ? (
          <Link
            href={nextRoute}
            style={{
              ...baseLink,
              color: accent,
              borderColor: `${accent}60`,
              background: "rgba(0,0,0,0.7)",
              fontSize: "0.65rem",
              letterSpacing: "0.28em",
              padding: "10px 24px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = accent;
              (e.currentTarget as HTMLElement).style.background = `${accent}18`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`;
              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.7)";
            }}
          >
            PART {["II", "III"][partNumber - 1]} →
          </Link>
        ) : (
          <Link
            href="/lab"
            style={{
              ...baseLink,
              color: accent,
              borderColor: `${accent}60`,
              background: "rgba(0,0,0,0.7)",
              fontSize: "0.65rem",
              letterSpacing: "0.28em",
              padding: "10px 24px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = accent;
              (e.currentTarget as HTMLElement).style.background = `${accent}18`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`;
              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.7)";
            }}
          >
            ← LAB
          </Link>
        )}
      </div>
    </>
  );
}
