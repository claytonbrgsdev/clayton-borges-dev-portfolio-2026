import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { projects } from "@/lib/data/projects";
import type { Locale } from "@/types";

interface CaseStudyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return projects
    .filter(p => p.overview)
    .flatMap(p => [
      { locale: "en", slug: p.id },
      { locale: "pt", slug: p.id },
    ]);
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = projects.find(p => p.id === slug);
  if (!project) return {};
  return { title: `${locale === "pt" ? project.namePt : project.nameEn} — Case Study` };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale as Locale);
  const p = dict.projects;

  const project = projects.find(proj => proj.id === slug);
  if (!project || !project.overview) notFound();

  const name      = locale === "pt" ? project.namePt      : project.nameEn;
  const desc      = locale === "pt" ? project.descriptionPt : project.descriptionEn;
  const overview  = locale === "pt" ? (project.overviewPt         ?? project.overview)         : project.overview;
  const problem   = locale === "pt" ? (project.problemPt          ?? project.problem)           : project.problem;
  const goal      = locale === "pt" ? (project.goalPt             ?? project.goal)              : project.goal;
  const role      = locale === "pt" ? (project.rolePt             ?? project.role)              : project.role;
  const decisions = locale === "pt" ? (project.technicalDecisionsPt ?? project.technicalDecisions) : project.technicalDecisions;
  const learnings = locale === "pt" ? (project.learningsPt        ?? project.learnings)         : project.learnings;
  const status    = locale === "pt" ? (project.statusPt           ?? project.status)            : project.status;

  return (
    <div className="min-h-screen">
      {/* Progress spine — decorative left bar */}
      <div className="fixed left-0 top-0 bottom-0 w-px bg-white/5 z-10" />

      <div className="pt-24 pb-40 px-6 md:px-16 lg:px-24">
        <div className="mx-auto max-w-2xl">

          {/* Back */}
          <Link
            href={`/${locale}/projects`}
            className="font-mono text-xs tracking-widest uppercase opacity-30 hover:opacity-70 transition-opacity mb-14 inline-flex items-center gap-2"
          >
            ← {p.back_to_projects}
          </Link>

          {/* Project header */}
          <div className="mb-14">
            {project.client && (
              <span className="font-mono text-xs opacity-35 block mb-3">
                {p.client_label}: {project.client}
              </span>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{name}</h1>
              <span className="font-mono text-xs opacity-25 border border-white/10 px-2.5 py-1.5 shrink-0 mt-1">
                {project.year}
              </span>
            </div>
            {project.type && (
              <span className="font-mono text-xs opacity-35 block mb-5">{project.type}</span>
            )}
            <p className="text-sm leading-relaxed opacity-50 border-l border-white/12 pl-4">{desc}</p>
          </div>

          {/* Case study content */}
          <div className="space-y-12">
            {overview && <Section label={p.case_study_overview}><p className="text-sm opacity-55 leading-relaxed">{overview}</p></Section>}

            {problem && <Section label={p.case_study_problem}><p className="text-sm opacity-55 leading-relaxed">{problem}</p></Section>}

            {goal && <Section label={p.case_study_goal}><p className="text-sm opacity-55 leading-relaxed">{goal}</p></Section>}

            {role && role.length > 0 && (
              <Section label={p.case_study_role}>
                <ul className="space-y-2">
                  {role.map(r => (
                    <li key={r} className="flex items-start gap-3 text-sm opacity-55">
                      <span className="font-mono opacity-35 mt-0.5 shrink-0 text-xs">◈</span>{r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section label={p.case_study_stack}>
              <div className="flex flex-wrap gap-2">
                {project.tech.map(t => (
                  <span key={t} className="font-mono text-xs border border-white/12 px-3 py-1.5 opacity-60">{t}</span>
                ))}
              </div>
            </Section>

            {decisions && decisions.length > 0 && (
              <Section label={p.case_study_decisions}>
                <ol className="space-y-5">
                  {decisions.map((d, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm opacity-55 leading-relaxed">
                      <span className="font-mono opacity-25 shrink-0 w-5 text-right text-xs mt-0.5">{String(i+1).padStart(2,"0")}</span>
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
                    <li key={i} className="flex items-start gap-3 text-sm opacity-55 leading-relaxed">
                      <span className="font-mono opacity-30 shrink-0 mt-0.5">→</span>{l}
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
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-sm opacity-55 hover:opacity-100 transition-opacity border-b border-white/20 pb-0.5">
                      {p.view_live} ↗
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-sm opacity-55 hover:opacity-100 transition-opacity border-b border-white/20 pb-0.5">
                      {p.view_code} ↗
                    </a>
                  )}
                </div>
              </Section>
            )}
          </div>

          {/* Bottom nav */}
          <div className="mt-20 pt-10 border-t border-white/8 flex items-center justify-between">
            <Link href={`/${locale}/projects`}
              className="font-mono text-sm opacity-40 hover:opacity-100 transition-opacity">
              ← {p.back_to_projects}
            </Link>
            {/* Next project shortcut (wraps around) */}
            {(() => {
              const withCaseStudy = projects.filter(proj => proj.overview);
              const idx = withCaseStudy.findIndex(proj => proj.id === slug);
              const next = withCaseStudy[(idx + 1) % withCaseStudy.length];
              if (!next || next.id === slug) return null;
              const nextName = locale === "pt" ? next.namePt : next.nameEn;
              return (
                <Link href={`/${locale}/projects/${next.id}`}
                  className="font-mono text-xs opacity-30 hover:opacity-70 transition-opacity text-right">
                  Next: {nextName} →
                </Link>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/8 pt-10">
      <span className="font-mono text-xs tracking-widest uppercase opacity-30 block mb-5">{label}</span>
      {children}
    </div>
  );
}
