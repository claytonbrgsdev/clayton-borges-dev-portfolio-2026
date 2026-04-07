import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://claytonborges.dev";

const routes = ["", "/projects", "/hardware", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "monthly" : "monthly",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
