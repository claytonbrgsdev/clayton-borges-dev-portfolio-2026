import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { contactInfo } from "@/lib/data/contact";

interface FooterProps {
  dict: Dictionary;
  locale: Locale;
}

export function Footer({ dict, locale }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-sm font-mono font-bold tracking-widest uppercase">
            CB<span className="text-blue-500">.</span>dev
          </span>
          <span className="text-xs opacity-40 font-mono">
            © {year} Clayton Borges. {dict.footer.rights}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={contactInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono opacity-50 hover:opacity-100 transition-opacity"
          >
            GitHub
          </Link>
          <Link
            href={contactInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono opacity-50 hover:opacity-100 transition-opacity"
          >
            LinkedIn
          </Link>
          <Link
            href={`mailto:${contactInfo.email}`}
            className="text-xs font-mono opacity-50 hover:opacity-100 transition-opacity"
          >
            Email
          </Link>
        </div>

        <span className="text-xs opacity-30 font-mono">{dict.footer.built_with}</span>
      </div>
    </footer>
  );
}
