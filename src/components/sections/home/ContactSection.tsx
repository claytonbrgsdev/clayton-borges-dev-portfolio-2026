"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface ContactSectionProps {
  dict: Dictionary;
  locale: Locale;
}

const border = "1px solid rgba(10,10,10,0.12)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };

const LINKS = [
  { label: "EMAIL",     href: "mailto:claytonborgesdev@gmail.com",              value: "claytonborgesdev@gmail.com" },
  { label: "GITHUB",    href: "https://github.com/claytonbrgsdev",               value: "github.com/claytonbrgsdev" },
  { label: "LINKEDIN",  href: "https://linkedin.com/in/clayton-borges-web-dev",  value: "in/clayton-borges-web-dev" },
  { label: "INSTAGRAM", href: "https://instagram.com/azulbic_",                  value: "@azulbic_" },
];

export function ContactSection({ dict, locale }: ContactSectionProps) {
  const t = dict.home.contact_section;

  return (
    <section
      id="contact"
      style={{ background: "#F2F0EC", borderBottom: border }}
    >
      {/* Section header */}
      <div style={{ borderBottom: border, padding: "14px 32px", display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", color: "#9A9A9A", textTransform: "uppercase" }}>
          {t.code}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* Left: links */}
        <div style={{ borderRight: border, padding: "48px 40px 48px 32px" }}>
          {LINKS.map((lnk) => (
            <div key={lnk.label} style={{ borderBottom: "1px solid rgba(10,10,10,0.07)", padding: "14px 0", display: "flex", alignItems: "baseline", gap: 24 }}>
              <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A", textTransform: "uppercase", minWidth: 80 }}>
                {lnk.label}
              </span>
              <a
                href={lnk.href}
                target={lnk.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)",
                  fontSize: 14,
                  color: "#0A0A0A",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(10,10,10,0.2)",
                  transition: "border-color 0.12s",
                  paddingBottom: 1,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#6B35D9"; (e.currentTarget as HTMLAnchorElement).style.color = "#6B35D9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,10,10,0.2)"; (e.currentTarget as HTMLAnchorElement).style.color = "#0A0A0A"; }}
              >
                {lnk.value}
              </a>
            </div>
          ))}
        </div>

        {/* Right: CTA */}
        <div style={{ padding: "48px 32px 48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 24 }}>
          <p style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 18, color: "#0A0A0A", opacity: 0.7, margin: 0, lineHeight: 1.5, maxWidth: 340 }}>
            Open to freelance contracts, full-time positions, and relocation.
            <br />Remote or on-site.
          </p>
          <Link
            href={`/${locale}/contact`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 28px",
              background: "#0A0A0A",
              color: "#F2F0EC",
              textDecoration: "none",
              borderRadius: 2,
              ...mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#6B35D9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#0A0A0A"; }}
          >
            <span style={{ ...mono, fontSize: 10, opacity: 0.6 }}>{t.cta_code}</span>
            <span>{t.cta_label}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
