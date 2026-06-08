import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { projects } from "@/lib/data/projects";
import type { Locale } from "@/types";
import { ProjectsGrid } from "@/components/sections/projects/ProjectsGrid";
import { ProjectsBackground } from "@/components/ProjectsBackground";

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <>
      <ProjectsBackground />
      <div className="relative z-10 pt-24 pb-20 px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-4">
              Work
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              {dict.projects.heading}
            </h1>
            <p className="font-sans text-lg opacity-60 max-w-2xl">{dict.projects.subheading}</p>
          </div>
          <ProjectsGrid dict={dict} locale={locale as Locale} projects={projects} />
        </div>
      </div>
    </>
  );
}
