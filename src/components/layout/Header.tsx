"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface HeaderProps {
  dict: Dictionary;
}

export function Header({ dict }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as Locale) ?? "en";

  const otherLocale: Locale = locale === "en" ? "pt" : "en";

  // Build alternate locale path
  const altLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const navLinks = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.projects, href: `/${locale}/projects` },
    { label: dict.nav.hardware, href: `/${locale}/hardware` },
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.nav.contact, href: `/${locale}/contact` },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background:
          "linear-gradient(to bottom, rgba(10,9,9,0.95) 0%, transparent 100%)",
      }}
    >
      {/* ── Desktop layout ── */}
      <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] items-center px-6 md:px-10 h-16">
        {/* Left: CLAYTON display text */}
        <Link
          href={`/${locale}`}
          aria-label="Home"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(1.4rem, 3.5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--text)",
            textDecoration: "none",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          CLAYTON
        </Link>

        {/* Center: nav strip */}
        <nav
          className="flex items-center justify-center gap-0"
          style={{ minWidth: 0 }}
        >
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <span key={link.href} className="flex items-center">
                {i > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                      padding: "0 6px",
                      userSelect: "none",
                    }}
                  >
                    ·
                  </span>
                )}
                <Link
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: isActive
                      ? "var(--accent-orange)"
                      : "var(--text-muted)",
                    opacity: isActive ? 1 : 0.7,
                    transition: "color 0.2s, opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--text)";
                      (e.currentTarget as HTMLAnchorElement).style.opacity =
                        "1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--text-muted)";
                      (e.currentTarget as HTMLAnchorElement).style.opacity =
                        "0.7";
                    }
                  }}
                >
                  {link.label}
                </Link>
              </span>
            );
          })}

          {/* rule separator before locale switcher */}
          <span
            style={{
              display: "inline-block",
              width: "1px",
              height: "10px",
              background: "var(--rule)",
              margin: "0 12px",
              flexShrink: 0,
            }}
          />

          {/* Locale switcher */}
          <Link
            href={altLocalePath}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--text-muted)",
              opacity: 0.5,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.5";
            }}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </nav>

        {/* Right: BORGES display text */}
        <span
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(1.4rem, 3.5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--text)",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          BORGES
        </span>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden items-center justify-between px-5 h-14">
        {/* Mobile logo (compact) */}
        <Link
          href={`/${locale}`}
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          CB
        </Link>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ color: "var(--text)" }}
        >
          <span
            className="block"
            style={{
              height: "1px",
              width: "24px",
              background: "currentColor",
              transition: "transform 0.2s",
              transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
            }}
          />
          <span
            className="block"
            style={{
              height: "1px",
              width: "24px",
              background: "currentColor",
              transition: "opacity 0.2s",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block"
            style={{
              height: "1px",
              width: "24px",
              background: "currentColor",
              transition: "transform 0.2s",
              transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
            }}
          />
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 flex flex-col items-start gap-5 px-5 py-8 md:hidden"
          style={{
            background: "rgba(10,9,9,0.97)",
            borderTop: "1px solid var(--rule)",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: isActive ? "var(--accent-orange)" : "var(--text)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          {/* Mobile locale switcher */}
          <span
            style={{
              display: "block",
              width: "24px",
              height: "1px",
              background: "var(--rule)",
              marginTop: "4px",
            }}
          />
          <Link
            href={altLocalePath}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--text-muted)",
            }}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      )}
    </header>
  );
}
