"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLabLocale } from "@/hooks/useLabLocale";
import { LabLangSwitch } from "@/components/LabLangSwitch";

const ACCENTS: Record<1 | 2 | 3, string> = {
  1: "#C84030",
  2: "#3060D0",
  3: "#8040C0",
};

// RGB channels for glow stops
const ACCENT_RGB: Record<1 | 2 | 3, string> = {
  1: "200,64,48",
  2: "48,96,208",
  3: "128,64,192",
};

// Next-part info shown in the centered CTA gate
const NEXT_INFO: Record<1 | 2 | 3, {
  roman: { en: string; pt: string };
  title: { en: string; pt: string };
}> = {
  1: { roman: { en: "PART II",   pt: "PARTE II"  }, title: { en: "FORCE",  pt: "FORÇA"  } },
  2: { roman: { en: "PART III",  pt: "PARTE III" }, title: { en: "MIND",   pt: "MENTE"  } },
  3: { roman: { en: "← THE LAB",pt: "← O LAB"   }, title: { en: "END",    pt: "FIM"    } },
};

interface Props {
  partNumber: 1 | 2 | 3;
  nextRoute?: string;
}

export function LabPartChrome({ partNumber, nextRoute }: Props) {
  const [visible, setVisible]   = useState(false);
  const [nearEnd, setNearEnd]   = useState(false);
  const [locale, setLocale]     = useLabLocale();
  const toggleLocale = () => setLocale(locale === "pt" ? "en" : "pt");

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

  const accent   = ACCENTS[partNumber];
  const accentRgb = ACCENT_RGB[partNumber];
  const info     = NEXT_INFO[partNumber];
  const dest     = nextRoute ?? "/lab";

  const romanLabel = locale === "pt" ? info.roman.pt : info.roman.en;
  const titleLabel = locale === "pt" ? info.title.pt : info.title.en;
  const ctaLabel   = locale === "pt" ? "CONTINUAR" : "CONTINUE";

  const smallLink: React.CSSProperties = {
    fontFamily:       "'Courier New', monospace",
    fontSize:         "0.6rem",
    letterSpacing:    "0.22em",
    textTransform:    "uppercase",
    textDecoration:   "none",
    color:            "rgba(255,255,255,0.28)",
    padding:          "6px 10px",
    border:           "1px solid rgba(255,255,255,0.09)",
    background:       "rgba(0,0,0,0.5)",
    backdropFilter:   "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  };

  return (
    <>
      {/* Animation keyframes injected once per render */}
      <style>{`
        @keyframes _labGateIn {
          0%   { opacity: 0; transform: scale(0.91); }
          100% { opacity: 1; transform: scale(1);    }
        }
        @keyframes _labGatePulse {
          0%, 100% {
            box-shadow:
              0 0  0  0   rgba(${accentRgb}, 0.28),
              0 0 24px 0  rgba(${accentRgb}, 0.10);
          }
          50% {
            box-shadow:
              0 0  0  10px rgba(${accentRgb}, 0.00),
              0 0 48px 0   rgba(${accentRgb}, 0.28);
          }
        }
        ._labGate:hover {
          background: rgba(${accentRgb}, 0.09) !important;
          border-color: rgba(${accentRgb}, 1) !important;
        }
      `}</style>

      {/* ← LAB — top left */}
      <Link
        href="/lab"
        style={{
          ...smallLink,
          position: "fixed",
          top: 18,
          left: 18,
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease, color 160ms, border-color 160ms",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
        }}
      >
        ← LAB
      </Link>

      {/* Lang switch — top right */}
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        <LabLangSwitch locale={locale} onToggle={toggleLocale} />
      </div>

      {/* ── Centered chapter gate ── appears when near end of scroll */}
      {nearEnd && (
        <div
          style={{
            position:  "fixed",
            top:       "50%",
            left:      "50%",
            transform: "translate(-50%, -50%)",
            zIndex:    200,
          }}
        >
          <Link
            href={dest}
            className="_labGate"
            style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            16,
              padding:        "40px 64px",
              background:     "rgba(0,0,0,0.84)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border:         `1px solid rgba(${accentRgb}, 0.50)`,
              textDecoration: "none",
              cursor:         "pointer",
              animation:      "_labGateIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards, _labGatePulse 2.8s ease-in-out 0.6s infinite",
              transition:     "background 200ms ease, border-color 200ms ease",
              minWidth:       "clamp(240px, 30vw, 400px)",
            }}
          >
            {/* Part label — small mono */}
            <span style={{
              fontFamily:    "'Courier New', monospace",
              fontSize:      "0.6rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color:         accent,
              opacity:       0.85,
            }}>
              {romanLabel}
            </span>

            {/* Divider line */}
            <div style={{
              width:      40,
              height:     1,
              background: `rgba(${accentRgb}, 0.4)`,
              flexShrink: 0,
            }} />

            {/* Chapter title — large */}
            <span style={{
              fontFamily:    "'Courier New', monospace",
              fontSize:      "clamp(2rem, 5vw, 3.4rem)",
              fontWeight:    700,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color:         "#f0ede8",
              lineHeight:    1,
            }}>
              {titleLabel}
            </span>

            {/* CTA arrow */}
            <span style={{
              fontFamily:    "'Courier New', monospace",
              fontSize:      "0.62rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color:         `rgba(${accentRgb}, 0.75)`,
              marginTop:     4,
            }}>
              {ctaLabel} →
            </span>
          </Link>
        </div>
      )}
    </>
  );
}
