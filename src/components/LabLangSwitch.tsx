"use client";
import type { LabLocale } from "@/hooks/useLabLocale";

interface Props {
  locale: LabLocale;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export function LabLangSwitch({ locale, onToggle, style }: Props) {
  return (
    <button
      onClick={onToggle}
      title={locale === "pt" ? "Switch to English" : "Mudar para Português"}
      style={{
        background: "none",
        border: "1px solid rgba(255,255,255,0.13)",
        cursor: "pointer",
        fontFamily: "'Courier New', monospace",
        fontSize: "0.55rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.38)",
        padding: "4px 9px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "color 200ms, border-color 200ms",
        ...style,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.13)";
      }}
    >
      <span style={{ opacity: locale === "pt" ? 1 : 0.38 }}>PT</span>
      <span style={{ opacity: 0.22 }}>|</span>
      <span style={{ opacity: locale === "en" ? 1 : 0.38 }}>EN</span>
    </button>
  );
}
