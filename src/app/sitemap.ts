import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { projects } from "@/lib/data/projects";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://claytonborges.dev";

const routes = ["", "/projects", "/hardware", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Locale-based routes
  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: route === "" ? 1 : 0.8,
      });
    }
    // Case study pages
    for (const p of projects.filter(p => p.overview)) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${p.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Lab (locale-free route)
  entries.push({
    url: `${BASE_URL}/lab`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  });

  return entries;
}
