"use client";
import { useCallback, useEffect, useState } from "react";

export type LabLocale = "pt" | "en";

const KEY = "lab_locale";

/**
 * Reads the initial lab locale.
 *
 * Priority:
 * 1. Referrer from main site (/en or /pt) — session continuity when clicking
 *    "Lab" from the portfolio. Always overrides stored value so the lab
 *    inherits whatever language the visitor was already using.
 * 2. localStorage stored value — preserved when navigating between lab pages
 *    or returning to the lab later.
 * 3. Default "en" — site root redirects to /en, so EN is the safe fallback.
 */
function readInitial(): LabLocale {
  if (typeof window === "undefined") return "en";
  try {
    const ref = document.referrer;
    // A referrer that doesn't contain "/lab" means we're entering from the main site.
    const isFromMainSite = !!ref && !ref.includes("/lab");
    if (isFromMainSite) {
      if (ref.includes("/en")) return "en";
      if (ref.includes("/pt")) return "pt";
    }
    // In-lab navigation or direct access → honour stored preference.
    const stored = localStorage.getItem(KEY);
    if (stored === "pt" || stored === "en") return stored;
  } catch {}
  // No stored value, no useful referrer → default EN (mirrors site root).
  return "en";
}

export function useLabLocale(): [LabLocale, (l: LabLocale) => void] {
  // Start with "en" to match the default fallback and avoid a PT flash on
  // the initial render before the useEffect fires.
  const [locale, setLocaleState] = useState<LabLocale>("en");

  useEffect(() => {
    setLocaleState(readInitial());
  }, []);

  const setLocale = useCallback((l: LabLocale) => {
    try { localStorage.setItem(KEY, l); } catch {}
    setLocaleState(l);
  }, []);

  return [locale, setLocale];
}
