"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface HeaderProps {
  dict: Dictionary;
}

/** Mono: logo identifier, tooltips, lang-switch — always IBM Plex Mono */
const MONO: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: "9px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  lineHeight: 1,
};

/** Sans: nav links — follows the swappable display font (--font-geist-sans) */
const SANS: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans)",
  fontSize: "9px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  lineHeight: 1,
};

export function Header({ dict }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const params   = useParams();
  const pathname = usePathname();
  const locale   = (params.locale as Locale) ?? "en";

  const otherLocale: Locale = locale === "en" ? "pt" : "en";
  const altLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  // Tooltip: mounted=false on SSR to avoid hydration mismatch, then shows for 5s.
  const tooltipText = dict.home.section_labels.lang_tooltip;
  const [tipVisible, setTipVisible] = useState(false);
  useEffect(() => {
    setTipVisible(true);
    const t = setTimeout(() => setTipVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const navLinks = [
    { label: dict.nav.home,     href: `/${locale}`         },
    { label: dict.nav.projects, href: `/${locale}/projects` },
    { label: dict.nav.hardware, href: `/${locale}/hardware` },
    { label: dict.nav.about,    href: `/${locale}/about`    },
    { label: dict.nav.contact,  href: `/${locale}/contact`  },
  ];

  return (
    <>
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "transparent",
      }}>

        {/* Left: logo */}
        <Link
          href={`/${locale}`}
          aria-label="Home"
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <span style={{ display: "block", width: 5, height: 5, background: "var(--accent-orange)", flexShrink: 0 }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ ...SANS, color: "var(--text)", opacity: 0.85 }}>Clayton Borges</span>
            <span style={{ ...MONO, color: "var(--text-muted)", textTransform: "none", letterSpacing: "0.05em", fontSize: "8px" }}>{dict.nav.logo_tagline}</span>
          </span>
        </Link>

        {/* Center: nav — desktop */}
        <nav className="hidden md:flex" style={{ alignItems: "center", gap: 0 }}>
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <span key={link.href} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ ...MONO, color: "var(--text-muted)", opacity: 0.3, padding: "0 8px", userSelect: "none" }}>·</span>
                )}
                <Link
                  href={link.href}
                  style={{
                    ...SANS,
                    textDecoration: "none",
                    color: isActive ? "var(--accent-orange)" : "var(--text-muted)",
                    transition: "color 180ms",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
                >
                  {link.label}
                </Link>
              </span>
            );
          })}
        </nav>

        {/* Right: locale — desktop */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 8, position: "relative" }}>
          {/* Tooltip */}
          <div style={{
            position: "absolute",
            right: "calc(100% + 12px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--accent-orange)",
            padding: "5px 10px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "8px",
            letterSpacing: "0.1em",
            color: "var(--accent-orange)",
            opacity: tipVisible ? 1 : 0,
            transition: "opacity 600ms ease",
          }}>
            {tooltipText}
            {/* Arrow */}
            <span style={{
              position: "absolute",
              right: -5,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0, height: 0,
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: "5px solid var(--accent-orange)",
            }} />
          </div>

          <Link
            href={altLocalePath}
            style={{ ...MONO, color: "var(--text-muted)", textDecoration: "none", transition: "color 180ms" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
              setTipVisible(true);
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
              setTipVisible(false);
            }}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden"
          style={{ display: "flex", flexDirection: "column", gap: 5, padding: 6, background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: "block", height: "1px", width: 20, background: "var(--text)",
              transition: "transform 200ms, opacity 200ms",
              transform: i === 0 && menuOpen ? "rotate(45deg) translateY(6px)"
                       : i === 2 && menuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
              opacity: i === 1 && menuOpen ? 0 : 1,
            }} />
          ))}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed md:hidden" style={{
          top: 56, left: 0, right: 0, zIndex: 49,
          background: "rgba(10,9,9,0.96)",
          borderBottom: "1px solid var(--rule)",
          display: "flex", flexDirection: "column",
          padding: "20px 28px",
          gap: 18,
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                ...SANS, fontSize: "11px",
                textDecoration: "none",
                color: pathname === link.href ? "var(--accent-orange)" : "var(--text)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <span style={{ width: 20, height: 1, background: "var(--rule)" }} />
          <Link
            href={altLocalePath}
            onClick={() => setMenuOpen(false)}
            style={{ ...MONO, fontSize: "11px", textDecoration: "none", color: "var(--text-muted)" }}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      )}
    </>
  );
}
