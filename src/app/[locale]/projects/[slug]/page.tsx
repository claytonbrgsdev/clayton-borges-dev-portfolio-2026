import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { projects } from "@/lib/data/projects";
import { getCaseStudy } from "@/lib/data/case-studies";
import type { Locale } from "@/types";

interface CaseStudyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return projects
    .filter((p) => p.overview)
    .flatMap((p) => [
      { locale: "en", slug: p.id },
      { locale: "pt", slug: p.id },
    ]);
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) return {};
  return {
    title: `${locale === "pt" ? project.namePt : project.nameEn} — Case Study`,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale as Locale);
  const p = dict.projects;

  const project = projects.find((proj) => proj.id === slug);
  if (!project || !project.overview) notFound();

  const caseStudy = getCaseStudy(slug);

  // If no case study data, fall back to the slim project-level content
  if (!caseStudy) {
    const name = locale === "pt" ? project.namePt : project.nameEn;
    const desc =
      locale === "pt" ? project.descriptionPt : project.descriptionEn;
    const overview =
      locale === "pt"
        ? project.overviewPt ?? project.overview
        : project.overview;
    const problem =
      locale === "pt" ? project.problemPt ?? project.problem : project.problem;
    const goal =
      locale === "pt" ? project.goalPt ?? project.goal : project.goal;
    const role =
      locale === "pt" ? project.rolePt ?? project.role : project.role;
    const decisions =
      locale === "pt"
        ? project.technicalDecisionsPt ?? project.technicalDecisions
        : project.technicalDecisions;
    const learnings =
      locale === "pt"
        ? project.learningsPt ?? project.learnings
        : project.learnings;
    const status =
      locale === "pt" ? project.statusPt ?? project.status : project.status;

    return (
      <div className="min-h-screen">
        <div className="fixed left-0 top-0 bottom-0 w-px bg-white/5 z-10" />
        <div className="pt-24 pb-40 px-6 md:px-16 lg:px-24">
          <div className="mx-auto max-w-2xl">
            <Link
              href={`/${locale}/projects`}
              className="font-mono text-xs tracking-widest uppercase opacity-30 hover:opacity-70 transition-opacity mb-14 inline-flex items-center gap-2"
            >
              ← {p.back_to_projects}
            </Link>
            <div className="mb-14">
              {project.client && (
                <span className="font-mono text-xs opacity-35 block mb-3">
                  {p.client_label}: {project.client}
                </span>
              )}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  {name}
                </h1>
                <span className="font-mono text-xs opacity-25 border border-white/10 px-2.5 py-1.5 shrink-0 mt-1">
                  {project.year}
                </span>
              </div>
              {project.type && (
                <span className="font-mono text-xs opacity-35 block mb-5">
                  {project.type}
                </span>
              )}
              <p className="text-sm leading-relaxed opacity-50 border-l border-white/[0.12] pl-4">
                {desc}
              </p>
            </div>
            <div className="space-y-12">
              {overview && (
                <Section label={p.case_study_overview}>
                  <p className="text-sm opacity-55 leading-relaxed">{overview}</p>
                </Section>
              )}
              {problem && (
                <Section label={p.case_study_problem}>
                  <p className="text-sm opacity-55 leading-relaxed">{problem}</p>
                </Section>
              )}
              {goal && (
                <Section label={p.case_study_goal}>
                  <p className="text-sm opacity-55 leading-relaxed">{goal}</p>
                </Section>
              )}
              {role && role.length > 0 && (
                <Section label={p.case_study_role}>
                  <ul className="space-y-2">
                    {role.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-3 text-sm opacity-55"
                      >
                        <span className="font-mono opacity-35 mt-0.5 shrink-0 text-xs">
                          ◈
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              <Section label={p.case_study_stack}>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs border border-white/[0.12] px-3 py-1.5 opacity-60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
              {decisions && decisions.length > 0 && (
                <Section label={p.case_study_decisions}>
                  <ol className="space-y-5">
                    {decisions.map((d, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 text-sm opacity-55 leading-relaxed"
                      >
                        <span className="font-mono opacity-25 shrink-0 w-5 text-right text-xs mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}
              {learnings && learnings.length > 0 && (
                <Section label={p.case_study_learnings}>
                  <ul className="space-y-5">
                    {learnings.map((l, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm opacity-55 leading-relaxed"
                      >
                        <span className="font-mono opacity-30 shrink-0 mt-0.5">
                          →
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {status && (
                <Section label={p.case_study_status}>
                  <p className="font-mono text-sm opacity-55">{status}</p>
                </Section>
              )}
              {(project.liveUrl || project.githubUrl) && (
                <Section label={p.case_study_links}>
                  <div className="flex flex-wrap gap-6">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm opacity-55 hover:opacity-100 transition-opacity border-b border-white/20 pb-0.5"
                      >
                        {p.view_live} ↗
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm opacity-55 hover:opacity-100 transition-opacity border-b border-white/20 pb-0.5"
                      >
                        {p.view_code} ↗
                      </a>
                    )}
                  </div>
                </Section>
              )}
            </div>
            <BottomNav locale={locale} slug={slug} projects={projects} p={p} />
          </div>
        </div>
      </div>
    );
  }

  // Rich case study layout
  const isPt = locale === "pt";
  const title = isPt ? caseStudy.titlePt : caseStudy.title;
  const tagline = isPt ? caseStudy.taglinePt : caseStudy.tagline;
  const projectType = isPt ? caseStudy.projectTypePt : caseStudy.projectType;
  const sections = isPt ? caseStudy.sectionsPt : caseStudy.sections;
  const outcomes = isPt ? caseStudy.outcomesPt : caseStudy.outcomes;

  return (
    <div className="min-h-screen">
      {/* Progress spine */}
      <div className="fixed left-0 top-0 bottom-0 w-px bg-white/5 z-10" />

      <div className="pt-24 pb-40 px-6 md:px-16 lg:px-24">
        <div className="mx-auto max-w-3xl">

          {/* 1. Back link */}
          <Link
            href={`/${locale}/projects`}
            className="font-mono text-xs tracking-widest uppercase opacity-30 hover:opacity-70 transition-opacity mb-16 inline-flex items-center gap-2"
          >
            ← {p.back_to_projects}
          </Link>

          {/* 2. Hero section */}
          <div className="mb-16">
            {/* Project type badge */}
            <span className="font-mono text-xs text-white/40 uppercase tracking-widest block mb-4">
              {projectType}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
              {title}
            </h1>

            {/* Tagline */}
            <p className="text-xl text-white/70 leading-snug mb-8 max-w-2xl">
              {tagline}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 font-mono text-xs text-white/40">
              <span>
                {p.client_label}: {caseStudy.client}
              </span>
              <span>{caseStudy.year}</span>
              {caseStudy.liveUrl && (
                <a
                  href={caseStudy.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white/90 transition-colors border-b border-white/20 pb-px"
                >
                  Live ↗
                </a>
              )}
              {caseStudy.githubUrl && (
                <a
                  href={caseStudy.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white/90 transition-colors border-b border-white/20 pb-px"
                >
                  GitHub ↗
                </a>
              )}
            </div>

            {/* Hero image */}
            {caseStudy.heroImage ? (
              <div className="w-full" style={{ aspectRatio: "16/9" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={caseStudy.heroImage}
                  alt={title}
                  className="w-full h-full object-cover border border-white/10"
                />
              </div>
            ) : (
              <div
                className="w-full border border-white/10 bg-white/5 flex items-center justify-center"
                style={{ aspectRatio: "16/9" }}
              >
                <span className="font-mono text-xs text-white/30">
                  {isPt ? "Imagem em breve" : "Image coming soon"}
                </span>
              </div>
            )}

            {/* Demo video — shown below hero when available */}
            {caseStudy.demoVideo && (
              <div className="w-full mt-4 border border-white/10 overflow-hidden">
                <video
                  src={caseStudy.demoVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto block"
                  style={{ maxHeight: "520px", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          {/* 3. Content sections */}
          <div className="space-y-12 mb-16">
            {sections.map((section) => (
              <div key={section.heading} className="border-t border-white/[0.08] pt-10">
                <h2 className="text-xl font-light tracking-tight border-b border-white/10 pb-2 mb-4 text-white/90">
                  {section.heading}
                </h2>
                <div className="text-sm text-white/80 leading-relaxed max-w-2xl whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* 4. Gallery */}
          <div className="border-t border-white/[0.08] pt-10 mb-16">
            <span className="font-mono text-xs tracking-widest uppercase text-white/30 block mb-6">
              {isPt ? "Galeria" : "Gallery"}
            </span>
            {caseStudy.galleryImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.galleryImages.map((src, i) => (
                  <div key={i} className="w-full overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${title} gallery ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full border border-white/10 bg-white/5 flex items-center justify-center"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <span className="font-mono text-xs text-white/30">
                      {isPt ? "Imagem em breve" : "Image coming soon"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Tech Stack */}
          <div className="border-t border-white/[0.08] pt-10 mb-16">
            <span className="font-mono text-xs tracking-widest uppercase text-white/30 block mb-6">
              Stack
            </span>
            <div className="flex flex-wrap gap-2">
              {caseStudy.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs border border-white/20 px-3 py-1 text-white/70"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 6. Key Outcomes */}
          {outcomes.length > 0 && (
            <div className="border-t border-white/[0.08] pt-10 mb-16">
              <span className="font-mono text-xs tracking-widest uppercase text-white/30 block mb-6">
                {isPt ? "Resultados" : "Key Outcomes"}
              </span>
              <ul className="space-y-3">
                {outcomes.map((outcome, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-white/90 leading-relaxed"
                  >
                    <span className="font-mono text-white/40 shrink-0 mt-0.5">
                      →
                    </span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7. Bottom nav */}
          <BottomNav locale={locale} slug={slug} projects={projects} p={p} />
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-white/[0.08] pt-10">
      <span className="font-mono text-xs tracking-widest uppercase opacity-30 block mb-5">
        {label}
      </span>
      {children}
    </div>
  );
}

function BottomNav({
  locale,
  slug,
  projects,
  p,
}: {
  locale: string;
  slug: string;
  projects: Array<{ id: string; overview?: string; nameEn: string; namePt: string }>;
  p: { back_to_projects: string };
}) {
  const withCaseStudy = projects.filter((proj) => proj.overview);
  const idx = withCaseStudy.findIndex((proj) => proj.id === slug);
  const next = withCaseStudy[(idx + 1) % withCaseStudy.length];
  const nextName =
    next && next.id !== slug
      ? locale === "pt"
        ? next.namePt
        : next.nameEn
      : null;

  return (
    <div className="mt-20 pt-10 border-t border-white/[0.08] flex items-center justify-between">
      <Link
        href={`/${locale}/projects`}
        className="font-mono text-sm opacity-40 hover:opacity-100 transition-opacity"
      >
        ← {p.back_to_projects}
      </Link>
      {nextName && next && (
        <Link
          href={`/${locale}/projects/${next.id}`}
          className="font-mono text-xs opacity-30 hover:opacity-70 transition-opacity text-right"
        >
          {locale === "pt" ? "Próximo" : "Next"}: {nextName} →
        </Link>
      )}
    </div>
  );
}
