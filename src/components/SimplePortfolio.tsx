import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { featuredProjects, projects } from "@/lib/data/projects";
import { stack } from "@/lib/data/stack";
import { contactInfo } from "@/lib/data/contact";

/**
 * SimplePortfolio — a single, efficient, recruiter-facing page.
 *
 * Keeps the visual language (black + orange, Geist/IBM Plex Mono, thin rules,
 * editorial micro-labels) but strips the heavy interaction layer (pinned
 * horizontal scroll, p5 centerpieces, Lab flow, nav dots). Everything a hiring
 * manager needs — who, the work, the stack, and how to reach out — visible and
 * scannable top to bottom. Server component, no client JS.
 */

const mono = "font-mono uppercase tracking-[0.16em]";

export function SimplePortfolio({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const isPt = locale === "pt";
  const { hero, about_preview, contact_cta } = dict.home;

  const t = {
    available: isPt ? "Disponível" : "Available",
    selectedWork: isPt ? "Trabalhos Selecionados" : "Selected Work",
    work: isPt ? "Trabalho" : "Work",
    viewAll: isPt ? `Ver todos os ${projects.length} projetos` : `View all ${projects.length} projects`,
    caseStudy: isPt ? "Estudo de caso" : "Case study",
    live: isPt ? "Ver ao vivo" : "Live",
    about: isPt ? "Sobre" : "About",
    stack: isPt ? "Tecnologias" : "Tech Stack",
    contact: isPt ? "Contato" : "Contact",
    viewProjects: isPt ? "Ver projetos" : "View projects",
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-16 pt-28 md:pt-32 pb-16 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto">

          {/* Meta rule */}
          <div className="flex items-center justify-between mb-10 pb-3 border-b" style={{ borderColor: "var(--rule)" }}>
            <span className={mono} style={{ fontSize: 10, color: "var(--text-muted)" }}>
              CB · 2025 — Portfolio
            </span>
            <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>
              {t.available} · Brasília · BR
            </span>
          </div>

          {/* Name */}
          <h1 className="font-sans font-extrabold" style={{
            fontSize: "clamp(2.6rem, 8vw, 6rem)",
            letterSpacing: "-0.03em",
            lineHeight: 0.92,
            margin: 0,
          }}>
            {hero.name}
          </h1>

          {/* Title + hook */}
          <p className="font-sans mt-5" style={{
            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--accent-orange)",
          }}>
            {hero.title}
          </p>
          <p className="font-sans mt-4 max-w-2xl" style={{
            fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.62)",
          }}>
            {hero.hook}
          </p>

          {/* Tech strip */}
          <p className={`${mono} mt-6`} style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {hero.tech_strip}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-9">
            <a href="#work"
              className={`${mono} inline-flex items-center transition-colors`}
              style={{ fontSize: 11, color: "var(--text)", border: "1px solid var(--accent-orange)", padding: "13px 22px", minHeight: 44 }}>
              {t.viewProjects} ↓
            </a>
            <a href={`mailto:${contactInfo.email}`}
              className={`${mono} inline-flex items-center transition-colors hover:opacity-100`}
              style={{ fontSize: 11, color: "var(--text)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>
              Email ↗
            </a>
            <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer"
              className={`${mono} inline-flex items-center transition-colors`}
              style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>
              LinkedIn ↗
            </a>
            <a href={contactInfo.github} target="_blank" rel="noopener noreferrer"
              className={`${mono} inline-flex items-center transition-colors`}
              style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>
              GitHub ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Selected Work ────────────────────────────────────────────────── */}
      <section id="work" className="px-6 md:px-12 lg:px-16 py-16 md:py-20 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-4">
              <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>01 — {t.work}</span>
              <h2 className="font-sans font-extrabold" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em", margin: 0 }}>
                {t.selectedWork}
              </h2>
            </div>
            <span className={mono} style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {String(featuredProjects.length).padStart(2, "0")}
            </span>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((p) => {
              const name = isPt ? p.namePt : p.nameEn;
              const desc = isPt ? p.descriptionPt : p.descriptionEn;
              return (
                <article
                  key={p.id}
                  className="group flex flex-col transition-colors"
                  style={{ border: "1px solid var(--rule)", background: "var(--bg-elevated)" }}
                >
                  <Link href={`/${locale}/projects/${p.id}`} className="block">
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 10", background: "var(--bg-elevated)" }}>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={name}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04]"
                          style={{ opacity: 0.62 }}
                        />
                      ) : (
                        /* Branded placeholder for projects without a preview image */
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                          <span aria-hidden className="font-sans font-extrabold" style={{
                            fontSize: "clamp(64px, 16vw, 128px)", lineHeight: 1, letterSpacing: "-0.05em",
                            color: "#fff", opacity: 0.05, userSelect: "none", textTransform: "uppercase",
                          }}>
                            {name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}
                          </span>
                          {p.type && (
                            <span className={mono} style={{ position: "absolute", left: 12, bottom: 12, fontSize: 8, color: "var(--text-muted)", maxWidth: "80%" }}>
                              {p.type}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100" style={{ background: "var(--accent-orange)", transition: "opacity 200ms" }} />
                      <span className={mono} style={{ position: "absolute", top: 12, right: 12, fontSize: 9, color: "var(--accent-orange)", background: "rgba(10,9,9,0.78)", padding: "3px 8px", border: "1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)" }}>
                        {p.year}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-sans font-bold" style={{ fontSize: "1.05rem", letterSpacing: "-0.01em", lineHeight: 1.15, margin: 0 }}>
                        {name}
                      </h3>
                      <p className="font-sans mt-2.5" style={{
                        fontSize: "0.82rem", lineHeight: 1.6, color: "rgba(255,255,255,0.5)",
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {p.tech.slice(0, 4).map((tech) => (
                          <span key={tech} className={mono} style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", padding: "3px 7px", border: "1px solid rgba(255,255,255,0.1)" }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  {/* Footer links */}
                  <div className="mt-auto flex items-stretch border-t" style={{ borderColor: "var(--rule)" }}>
                    <Link href={`/${locale}/projects/${p.id}`}
                      className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`}
                      style={{ fontSize: 9, color: "var(--text-muted)", padding: "12px 8px" }}>
                      {t.caseStudy} →
                    </Link>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`}
                        style={{ fontSize: 9, color: "var(--text-muted)", padding: "12px 8px", borderLeft: "1px solid var(--rule)" }}>
                        {t.live} ↗
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* View all */}
          <div className="mt-10">
            <Link href={`/${locale}/projects`}
              className={`${mono} inline-flex items-center transition-colors hover:text-[var(--accent-orange)]`}
              style={{ fontSize: 11, color: "var(--text)", borderBottom: "1px solid var(--accent-orange)", paddingBottom: 4 }}>
              {t.viewAll} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── About + Stack ────────────────────────────────────────────────── */}
      <section id="about" className="px-6 md:px-12 lg:px-16 py-16 md:py-20 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* About */}
          <div>
            <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>02 — {t.about}</span>
            <h2 className="font-sans font-extrabold mt-4" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", letterSpacing: "-0.02em", margin: "16px 0 0" }}>
              {about_preview.heading}
            </h2>
            <p className="font-sans mt-5 max-w-xl" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
              {about_preview.body}
            </p>
            <Link href={`/${locale}/about`}
              className={`${mono} inline-flex mt-6 transition-colors hover:text-[var(--accent-orange)]`}
              style={{ fontSize: 11, color: "var(--text-muted)", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
              {about_preview.cta} →
            </Link>
          </div>

          {/* Stack */}
          <div>
            <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>{t.stack}</span>
            <div className="mt-5 space-y-5">
              {stack.map((cat) => (
                <div key={cat.title}>
                  <span className={mono} style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>{cat.title}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <span key={item.name} className="font-sans" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.62)", padding: "4px 9px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.3)" }}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="px-6 md:px-12 lg:px-16 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>03 — {t.contact}</span>
          <h2 className="font-sans font-extrabold mt-4" style={{
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 1, margin: "16px 0 0",
          }}>
            {contact_cta.heading}
          </h2>
          <p className="font-sans mt-5" style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)" }}>
            {contact_cta.body}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <a href={`mailto:${contactInfo.email}`}
              className="font-sans transition-colors hover:bg-white hover:text-black"
              style={{ fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.28)", padding: "14px 26px" }}>
              {contactInfo.email}
            </a>
            <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer"
              className={`${mono} transition-colors hover:text-[var(--accent-orange)]`}
              style={{ fontSize: 11, color: "var(--text-muted)", padding: "14px 18px" }}>
              LinkedIn ↗
            </a>
            <a href={contactInfo.github} target="_blank" rel="noopener noreferrer"
              className={`${mono} transition-colors hover:text-[var(--accent-orange)]`}
              style={{ fontSize: 11, color: "var(--text-muted)", padding: "14px 18px" }}>
              GitHub ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
