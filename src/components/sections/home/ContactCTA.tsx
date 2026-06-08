"use client";

// TODO: Add GSAP scroll-triggered reveal
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface ContactCTAProps {
  dict: Dictionary;
  locale: Locale;
}

export function ContactCTA({ dict, locale }: ContactCTAProps) {
  const { contact_cta } = dict.home;

  return (
    <section className="relative py-40 px-6 md:px-12 border-t border-white/10 text-center" style={{ zIndex: 2 }}>
      <div className="mx-auto max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">{contact_cta.heading}</h2>
        <p className="font-sans opacity-50 mb-10 text-lg">{contact_cta.body}</p>
        <Link
          href={`/${locale}/contact`}
          className="inline-block px-10 py-4 bg-white text-black font-sans text-sm tracking-wide hover:bg-white/90 transition-colors"
        >
          {contact_cta.cta} →
        </Link>
      </div>
    </section>
  );
}
