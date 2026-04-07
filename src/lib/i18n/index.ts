import type { Locale } from "@/types";
import en from "./en.json";
import pt from "./pt.json";

const dictionaries = { en, pt };

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "pt"];
