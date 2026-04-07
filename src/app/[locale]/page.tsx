import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { featuredProjects } from "@/lib/data/projects";
import type { Locale } from "@/types";

import { PointCloudWorld } from "@/components/sections/home/PointCloudWorld";
import { HeroSection } from "@/components/sections/home/HeroSection";
import { AboutPreview } from "@/components/sections/home/AboutPreview";
import { FeaturedProjects } from "@/components/sections/home/FeaturedProjects";
import { SkillsSection } from "@/components/sections/home/SkillsSection";
import { ContactCTA } from "@/components/sections/home/ContactCTA";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Clayton Borges — Full-Stack Developer",
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <>
      {/* Fixed point cloud world — persists behind all home sections */}
      <PointCloudWorld />
      <HeroSection dict={dict} locale={locale as Locale} />
      <AboutPreview dict={dict} locale={locale as Locale} />
      <FeaturedProjects dict={dict} locale={locale as Locale} projects={featuredProjects} />
      <SkillsSection dict={dict} />
      <ContactCTA dict={dict} locale={locale as Locale} />
    </>
  );
}
