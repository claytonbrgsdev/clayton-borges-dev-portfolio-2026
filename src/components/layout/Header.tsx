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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)", backdropFilter: "none" }}>
      {/* Logo */}
      <Link href={`/${locale}`} className="text-sm font-mono font-bold tracking-widest uppercase">
        CB<span className="text-blue-500">.</span>dev
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-mono tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          >
            {link.label}
          </Link>
        ))}
        {/* Locale switcher */}
        <Link
          href={altLocalePath}
          className="text-xs font-mono tracking-widest uppercase border border-current px-2 py-1 opacity-50 hover:opacity-100 transition-opacity"
        >
          {otherLocale.toUpperCase()}
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span className={`block h-px w-6 bg-current transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block h-px w-6 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block h-px w-6 bg-current transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 flex flex-col items-center gap-6 py-8 bg-black/90 backdrop-blur-sm md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-mono tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={altLocalePath}
            className="text-xs font-mono tracking-widest uppercase border border-current px-2 py-1"
            onClick={() => setMenuOpen(false)}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      )}
    </header>
  );
}
