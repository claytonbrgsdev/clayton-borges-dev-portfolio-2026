"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { featuredProjects, projects } from "@/lib/data/projects";
import { stack } from "@/lib/data/stack";
import { contactInfo } from "@/lib/data/contact";
import { gsap, ScrollTrigger, SplitText, EASE_OUT } from "@/lib/gsap";

/**
 * ScrollPortfolio — same sober structure as SimplePortfolio, but the whole page
 * reveals itself on scroll via GSAP ScrollTrigger (synced to Lenis through the
 * GSAP ticker, wired in LenisProvider). Initial hidden state is set in CSS
 * (class `.r`) so there is no flash before hydration, and a reduced-motion
 * media query reveals everything instantly for accessibility.
 */

const mono = "font-mono uppercase tracking-[0.16em]";

export function ScrollPortfolio({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const isPt = locale === "pt";
  const { hero, about_preview, contact_cta } = dict.home;
  const rootRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // CSS reveals everything; skip motion

    const splits: SplitText[] = [];
    let ctx: ReturnType<typeof gsap.context> | undefined;

    // Defer one macrotask so LenisProvider (a parent effect, runs AFTER this
    // child effect) has wired Lenis into the GSAP ticker and ScrollTrigger.update
    // before we build any animations. This is the same pattern HorizontalLabFlow
    // uses — without it, the load timeline never advances.
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // ── Scroll progress bar (scrubbed to page scroll) ────────────────
        gsap.fromTo("[data-progress]", { scaleX: 0 }, {
          scaleX: 1, ease: "none", transformOrigin: "left center",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
        });

        // ── Hero — reveal on load ────────────────────────────────────────
        const tl = gsap.timeline({ defaults: { ease: EASE_OUT, duration: 0.85 } });
        tl.fromTo("[data-hero-meta]", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6 });

        const nameEl = root.querySelector<HTMLElement>("[data-hero-name]");
        if (nameEl) {
          const split = new SplitText(nameEl, { type: "lines", mask: "lines" });
          splits.push(split);
          gsap.set(nameEl, { opacity: 1 });
          tl.fromTo(split.lines, { yPercent: 120 }, { yPercent: 0, duration: 1.05, stagger: 0.12, ease: "power4.out" }, "-=0.25");
        }

        tl.fromTo("[data-hero-title]", { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, "-=0.6")
          .fromTo("[data-hero-hook]", { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, "-=0.65")
          .fromTo("[data-hero-tech]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.65")
          .fromTo("[data-hero-cta]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.6 }, "-=0.55")
          .fromTo("[data-hero-scrollcue]", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.2");

        // ── Generic "rise + fade" reveals on enter ───────────────────────
        gsap.utils.toArray<HTMLElement>("[data-up]").forEach((el) => {
          gsap.fromTo(el, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        // ── Section heading rules that "draw" in ─────────────────────────
        gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((el) => {
          gsap.fromTo(el, { scaleX: 0 }, {
            scaleX: 1, duration: 0.9, ease: "power3.inOut", transformOrigin: "left center",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // ── Project cards — staggered batch reveal ───────────────────────
        gsap.set("[data-card]", { opacity: 0, y: 40 });
        ScrollTrigger.batch("[data-card]", {
          start: "top 90%",
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: EASE_OUT, stagger: 0.09, overwrite: true }),
        });

        // ── Tech-stack chip groups — stagger per group ───────────────────
        gsap.utils.toArray<HTMLElement>("[data-stack-group]").forEach((group) => {
          const chips = group.querySelectorAll("[data-chip]");
          gsap.fromTo(chips, { opacity: 0, y: 14 }, {
            opacity: 1, y: 0, duration: 0.5, ease: EASE_OUT, stagger: 0.025,
            scrollTrigger: { trigger: group, start: "top 88%", once: true },
          });
        });

        // ── Contact heading — masked line reveal ─────────────────────────
        const contactEl = root.querySelector<HTMLElement>("[data-contact-heading]");
        if (contactEl) {
          const split = new SplitText(contactEl, { type: "lines", mask: "lines" });
          splits.push(split);
          gsap.set(contactEl, { opacity: 1 });
          gsap.fromTo(split.lines, { yPercent: 120 }, {
            yPercent: 0, duration: 1, stagger: 0.12, ease: "power4.out",
            scrollTrigger: { trigger: contactEl, start: "top 85%", once: true },
          });
        }
      }, root);

      ScrollTrigger.refresh();
    }, 0);

    return () => {
      clearTimeout(timer);
      splits.forEach((s) => s.revert());
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* Scoped reveal CSS — initial hidden state (no flash), reduced-motion safe */}
      <style dangerouslySetInnerHTML={{ __html: `
        .r { opacity: 0; will-change: transform, opacity; }
        @media (prefers-reduced-motion: reduce) {
          .r { opacity: 1 !important; transform: none !important; }
        }
      ` }} />

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div data-progress style={{ height: "100%", width: "100%", background: "var(--accent-orange)", transform: "scaleX(0)" }} />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section data-hero className="px-6 md:px-12 lg:px-16 pt-28 md:pt-32 pb-16 border-b" style={{ borderColor: "var(--rule)" }}>
        <div data-hero-inner className="max-w-6xl mx-auto">

          <div data-hero-meta className="r flex items-center justify-between mb-10 pb-3 border-b" style={{ borderColor: "var(--rule)" }}>
            <span className={mono} style={{ fontSize: 10, color: "var(--text-muted)" }}>CB · 2025 — Portfolio</span>
            <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>{t.available} · Brasília · BR</span>
          </div>

          <h1 data-hero-name className="r font-sans font-extrabold" style={{
            fontSize: "clamp(2.6rem, 8vw, 6rem)", letterSpacing: "-0.03em", lineHeight: 0.92, margin: 0,
          }}>
            {hero.name}
          </h1>

          <p data-hero-title className="r font-sans mt-5" style={{
            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--accent-orange)",
          }}>
            {hero.title}
          </p>
          <p data-hero-hook className="r font-sans mt-4 max-w-2xl" style={{
            fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.62)",
          }}>
            {hero.hook}
          </p>

          <p data-hero-tech className={`${mono} r mt-6`} style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {hero.tech_strip}
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <a data-hero-cta href="#work" className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text)", border: "1px solid var(--accent-orange)", padding: "13px 22px", minHeight: 44 }}>
              {t.viewProjects} ↓
            </a>
            <a data-hero-cta href={`mailto:${contactInfo.email}`} className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>
              Email ↗
            </a>
            <a data-hero-cta href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>
              LinkedIn ↗
            </a>
            <a data-hero-cta href={contactInfo.github} target="_blank" rel="noopener noreferrer" className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>
              GitHub ↗
            </a>
          </div>

          <div data-hero-scrollcue className={`${mono} r mt-14 flex items-center gap-3`} style={{ fontSize: 9, color: "var(--text-muted)" }}>
            <span>{isPt ? "Role para revelar" : "Scroll to reveal"}</span>
            <span style={{ fontSize: 13 }}>↓</span>
          </div>
        </div>
      </section>

      {/* ── Selected Work ────────────────────────────────────────────────── */}
      <section id="work" className="px-6 md:px-12 lg:px-16 py-16 md:py-20 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-3">
            <div className="flex items-center gap-4">
              <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>01 — {t.work}</span>
              <h2 data-up className="r font-sans font-extrabold" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em", margin: 0 }}>
                {t.selectedWork}
              </h2>
            </div>
            <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {String(featuredProjects.length).padStart(2, "0")}
            </span>
          </div>
          <div data-rule className="mb-10" style={{ height: 1, background: "var(--rule)" }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((p) => {
              const name = isPt ? p.namePt : p.nameEn;
              const desc = isPt ? p.descriptionPt : p.descriptionEn;
              return (
                <article key={p.id} data-card className="r group flex flex-col transition-colors" style={{ border: "1px solid var(--rule)", background: "var(--bg-elevated)" }}>
                  <Link href={`/${locale}/projects/${p.id}`} className="block">
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 10", background: "var(--bg-elevated)" }}>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04]" style={{ opacity: 0.62 }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                          <span aria-hidden className="font-sans font-extrabold" style={{ fontSize: "clamp(64px, 16vw, 128px)", lineHeight: 1, letterSpacing: "-0.05em", color: "#fff", opacity: 0.05, userSelect: "none", textTransform: "uppercase" }}>
                            {name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}
                          </span>
                          {p.type && (
                            <span className={mono} style={{ position: "absolute", left: 12, bottom: 12, fontSize: 8, color: "var(--text-muted)", maxWidth: "80%" }}>{p.type}</span>
                          )}
                        </div>
                      )}
                      <div className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100" style={{ background: "var(--accent-orange)", transition: "opacity 200ms" }} />
                      <span className={mono} style={{ position: "absolute", top: 12, right: 12, fontSize: 9, color: "var(--accent-orange)", background: "rgba(10,9,9,0.78)", padding: "3px 8px", border: "1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)" }}>
                        {p.year}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-sans font-bold" style={{ fontSize: "1.05rem", letterSpacing: "-0.01em", lineHeight: 1.15, margin: 0 }}>{name}</h3>
                      <p className="font-sans mt-2.5" style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {p.tech.slice(0, 4).map((tech) => (
                          <span key={tech} className={mono} style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", padding: "3px 7px", border: "1px solid rgba(255,255,255,0.1)" }}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  <div className="mt-auto flex items-stretch border-t" style={{ borderColor: "var(--rule)" }}>
                    <Link href={`/${locale}/projects/${p.id}`} className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 9, color: "var(--text-muted)", padding: "12px 8px" }}>
                      {t.caseStudy} →
                    </Link>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 9, color: "var(--text-muted)", padding: "12px 8px", borderLeft: "1px solid var(--rule)" }}>
                        {t.live} ↗
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div data-up className="r mt-10">
            <Link href={`/${locale}/projects`} className={`${mono} inline-flex items-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text)", borderBottom: "1px solid var(--accent-orange)", paddingBottom: 4 }}>
              {t.viewAll} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── About + Stack ────────────────────────────────────────────────── */}
      <section id="about" className="px-6 md:px-12 lg:px-16 py-16 md:py-20 border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">

          <div>
            <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>02 — {t.about}</span>
            <h2 data-up className="r font-sans font-extrabold mt-4" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", letterSpacing: "-0.02em", margin: "16px 0 0" }}>
              {about_preview.heading}
            </h2>
            <p data-up className="r font-sans mt-5 max-w-xl" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
              {about_preview.body}
            </p>
            <div data-up className="r">
              <Link href={`/${locale}/about`} className={`${mono} inline-flex mt-6 transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text-muted)", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>
                {about_preview.cta} →
              </Link>
            </div>
          </div>

          <div>
            <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>{t.stack}</span>
            <div className="mt-5 space-y-5">
              {stack.map((cat) => (
                <div key={cat.title} data-stack-group>
                  <span className={mono} style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>{cat.title}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <span key={item.name} data-chip className="r font-sans" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.62)", padding: "4px 9px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.3)" }}>
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
          <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>03 — {t.contact}</span>
          <h2 data-contact-heading className="r font-sans font-extrabold mt-4" style={{
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 1, margin: "16px 0 0",
          }}>
            {contact_cta.heading}
          </h2>
          <p data-up className="r font-sans mt-5" style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)" }}>
            {contact_cta.body}
          </p>

          <div data-up className="r flex flex-wrap items-center gap-3 mt-8">
            <a href={`mailto:${contactInfo.email}`} className="font-sans transition-colors hover:bg-white hover:text-black" style={{ fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.28)", padding: "14px 26px" }}>
              {contactInfo.email}
            </a>
            <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className={`${mono} transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text-muted)", padding: "14px 18px" }}>LinkedIn ↗</a>
            <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className={`${mono} transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text-muted)", padding: "14px 18px" }}>GitHub ↗</a>
          </div>
        </div>
      </section>
    </div>
  );
}
