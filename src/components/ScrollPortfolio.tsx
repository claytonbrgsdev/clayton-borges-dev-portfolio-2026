"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { featuredProjects, projects, type Project } from "@/lib/data/projects";
import { stack } from "@/lib/data/stack";
import { experiments, featuredExperiments, type LabFocus } from "@/lib/data/experiments";
import { contactInfo } from "@/lib/data/contact";
import { gsap, ScrollTrigger, SplitText, EASE_OUT } from "@/lib/gsap";

/**
 * ScrollPortfolio — sober structure, structurally bolder execution.
 *
 * • Work section is a PINNED HORIZONTAL gallery on desktop (scroll down →
 *   travel sideways through the projects), with a vertical card grid fallback
 *   on mobile (≥/< 1024px) — never reuse a horizontal layout on touch.
 * • Visual layer: fixed dot-grid backdrop, an orange hero glow, oversized
 *   ghost section watermarks, and an infinite tech marquee band.
 * • Everything reveals on scroll via GSAP ScrollTrigger (synced to Lenis).
 *   Initial hidden state is in a scoped `.r` class (no flash); a
 *   prefers-reduced-motion override reveals everything instantly.
 */

const mono = "font-mono uppercase tracking-[0.16em]";

const ghostStyle: React.CSSProperties = {
  position: "absolute", right: "-2vw", bottom: "-4vw", zIndex: 0,
  fontFamily: "var(--font-geist-sans)", fontWeight: 800,
  fontSize: "clamp(140px, 26vw, 460px)", lineHeight: 0.8, letterSpacing: "-0.05em",
  color: "#fff", opacity: 0.03, userSelect: "none", pointerEvents: "none",
  textTransform: "uppercase", whiteSpace: "nowrap",
};

const FOCUS_LABEL: Record<LabFocus, { en: string; pt: string }> = {
  Generative: { en: "Generative", pt: "Generativo" },
  Mathematics: { en: "Mathematics", pt: "Matemática" },
  Simulation: { en: "Simulation", pt: "Simulação" },
  Physics: { en: "Physics", pt: "Física" },
};

const MARQUEE = [
  "React", "Next.js", "TypeScript", "Three.js", "WebGL", "GLSL", "GSAP",
  "p5.js", "Node.js", "FastAPI", "PostgreSQL", "Supabase", "Docker", "Python",
];

function TechChip({ label }: { label: string }) {
  return (
    <span className={`${mono} inline-flex items-center gap-3`} style={{ fontSize: 13, color: "var(--text-muted)" }}>
      <span style={{ width: 5, height: 5, background: "var(--accent-orange)", borderRadius: 99, flexShrink: 0 }} />
      {label}
    </span>
  );
}

/** Horizontal gallery panel (desktop) */
function ProjectPanel({ p, i, locale, isPt, caseLabel, liveLabel }: {
  p: Project; i: number; locale: Locale; isPt: boolean; caseLabel: string; liveLabel: string;
}) {
  const name = isPt ? p.namePt : p.nameEn;
  const desc = isPt ? p.descriptionPt : p.descriptionEn;
  return (
    <article
      className="relative flex flex-col"
      style={{ width: "clamp(300px, 40vw, 440px)", height: "min(70vh, 560px)", flexShrink: 0, border: "1px solid var(--rule)", background: "var(--bg-elevated)" }}
    >
      <span aria-hidden className="font-sans font-extrabold" style={{ position: "absolute", top: 8, right: 14, fontSize: 64, lineHeight: 1, letterSpacing: "-0.05em", color: "#fff", opacity: 0.06, zIndex: 2, pointerEvents: "none" }}>
        {String(i + 1).padStart(2, "0")}
      </span>

      <Link href={`/${locale}/projects/${p.id}`} className="group relative block flex-1 min-h-0 overflow-hidden">
        {p.videos && p.videos.length > 0 ? (
          <video src={p.videos[0]} autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.72 }} />
        ) : p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img data-panel-img src={p.image} alt={name} className="absolute object-cover transition-transform duration-500 group-hover:scale-[1.05]" style={{ left: 0, width: "100%", top: "-8%", height: "116%", opacity: 0.6 }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span aria-hidden className="font-sans font-extrabold" style={{ fontSize: "clamp(72px,12vw,150px)", lineHeight: 1, letterSpacing: "-0.05em", color: "#fff", opacity: 0.05, textTransform: "uppercase" }}>
              {name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100" style={{ background: "var(--accent-orange)", transition: "opacity 200ms" }} />
        <span className={mono} style={{ position: "absolute", top: 12, left: 12, fontSize: 9, color: "var(--accent-orange)", background: "rgba(10,9,9,0.78)", padding: "3px 8px", border: "1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)" }}>
          {p.year}
        </span>
      </Link>

      <div className="p-5">
        <h3 className="font-sans font-bold" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em", lineHeight: 1.15, margin: 0 }}>{name}</h3>
        <p className="font-sans mt-2" style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "rgba(255,255,255,0.5)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{desc}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.tech.slice(0, 3).map((tech) => (
            <span key={tech} className={mono} style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", padding: "3px 7px", border: "1px solid rgba(255,255,255,0.1)" }}>{tech}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-stretch border-t" style={{ borderColor: "var(--rule)" }}>
        <Link href={`/${locale}/projects/${p.id}`} className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 9, color: "var(--text-muted)", padding: "11px 8px" }}>
          {caseLabel} →
        </Link>
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 9, color: "var(--text-muted)", padding: "11px 8px", borderLeft: "1px solid var(--rule)" }}>
            {liveLabel} ↗
          </a>
        )}
      </div>
    </article>
  );
}

/** Vertical grid card (mobile) */
function ProjectCard({ p, locale, isPt, caseLabel, liveLabel }: {
  p: Project; locale: Locale; isPt: boolean; caseLabel: string; liveLabel: string;
}) {
  const name = isPt ? p.namePt : p.nameEn;
  const desc = isPt ? p.descriptionPt : p.descriptionEn;
  return (
    <article data-card className="r group flex flex-col" style={{ border: "1px solid var(--rule)", background: "var(--bg-elevated)" }}>
      <Link href={`/${locale}/projects/${p.id}`} className="block">
        <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 10", background: "var(--bg-elevated)" }}>
          {p.videos && p.videos.length > 0 ? (
            <video src={p.videos[0]} autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.72 }} />
          ) : p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" style={{ opacity: 0.62 }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span aria-hidden className="font-sans font-extrabold" style={{ fontSize: "clamp(64px,16vw,128px)", lineHeight: 1, letterSpacing: "-0.05em", color: "#fff", opacity: 0.05, textTransform: "uppercase" }}>
                {name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}
              </span>
            </div>
          )}
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
          {caseLabel} →
        </Link>
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={`${mono} flex-1 text-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 9, color: "var(--text-muted)", padding: "12px 8px", borderLeft: "1px solid var(--rule)" }}>
            {liveLabel} ↗
          </a>
        )}
      </div>
    </article>
  );
}

export function ScrollPortfolio({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const isPt = locale === "pt";
  const { hero, about_preview, contact_cta } = dict.home;
  const rootRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

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
    drag: isPt ? "Role para percorrer" : "Scroll to travel",
    lab: "Lab",
    labHeading: isPt ? "O Lab" : "The Lab",
    labLead: isPt
      ? "Um universo paralelo de experimentos guiados por scroll — arte generativa, matemática, física e simulação."
      : "A parallel universe of scroll-driven experiments — generative art, math, physics, and simulation.",
    enterLab: isPt ? "Entrar no Lab" : "Enter the Lab",
  };

  // Desktop ↔ mobile switch (horizontal gallery vs vertical grid)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const splits: SplitText[] = [];
    let ctx: ReturnType<typeof gsap.context> | undefined;

    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // ── Page scroll progress bar ─────────────────────────────────────
        gsap.fromTo("[data-progress]", { scaleX: 0 }, {
          scaleX: 1, ease: "none", transformOrigin: "left center",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
        });

        // ── Hero — character-level reveal on load ────────────────────────
        const tl = gsap.timeline({ defaults: { ease: EASE_OUT, duration: 0.85 } });
        tl.fromTo("[data-hero-meta]", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6 });
        const nameEl = root.querySelector<HTMLElement>("[data-hero-name]");
        if (nameEl) {
          const split = new SplitText(nameEl, { type: "chars", mask: "chars" });
          splits.push(split);
          gsap.set(nameEl, { opacity: 1 });
          tl.fromTo(split.chars, { yPercent: 120 }, { yPercent: 0, duration: 0.9, stagger: 0.03, ease: "power4.out" }, "-=0.25");
        }
        tl.fromTo("[data-hero-underline]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut", transformOrigin: "left center" }, "-=0.55")
          .fromTo("[data-hero-title]", { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, "-=0.5")
          .fromTo("[data-hero-hook]", { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, "-=0.65")
          .fromTo("[data-hero-tech]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.65")
          .fromTo("[data-hero-cta]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.6 }, "-=0.55")
          .fromTo("[data-hero-scrollcue]", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.2");

        // Hero glow drifts slightly with scroll
        gsap.to("[data-hero-glow]", {
          yPercent: 30, ease: "none",
          scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
        });

        // ── Ghost watermark drift ────────────────────────────────────────
        gsap.utils.toArray<HTMLElement>("[data-ghost]").forEach((el) => {
          gsap.fromTo(el, { yPercent: -9 }, {
            yPercent: 9, ease: "none",
            scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // ── Infinite tech marquee ────────────────────────────────────────
        gsap.to("[data-marquee]", { xPercent: -50, repeat: -1, duration: 30, ease: "none" });

        // ── HORIZONTAL work gallery (desktop only) ───────────────────────
        if (isDesktop) {
          const wrap = root.querySelector<HTMLElement>("[data-hwrap]");
          const track = root.querySelector<HTMLElement>("[data-track]");
          const bar = root.querySelector<HTMLElement>("[data-hbar]");
          if (wrap && track) {
            const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
            gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: wrap, pin: true, start: "top top", end: () => `+=${distance()}`,
                scrub: 1, invalidateOnRefresh: true,
                onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
              },
            });
            const lenis = (window as unknown as { __lenis?: { resize?: () => void } }).__lenis;
            lenis?.resize?.();
          }
        } else {
          // Mobile: vertical card stagger reveal
          gsap.set("[data-card]", { opacity: 0, y: 48, scale: 0.97 });
          ScrollTrigger.batch("[data-card]", {
            start: "top 92%",
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "expo.out", stagger: 0.08, overwrite: true }),
          });
        }

        // ── Generic reveals (about / contact / view-all) ─────────────────
        gsap.utils.toArray<HTMLElement>("[data-up]").forEach((el) => {
          gsap.fromTo(el, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((el) => {
          gsap.fromTo(el, { scaleX: 0 }, {
            scaleX: 1, duration: 0.9, ease: "power3.inOut", transformOrigin: "left center",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-stack-group]").forEach((group) => {
          const chips = group.querySelectorAll("[data-chip]");
          gsap.fromTo(chips, { opacity: 0, y: 14 }, {
            opacity: 1, y: 0, duration: 0.5, ease: EASE_OUT, stagger: 0.025,
            scrollTrigger: { trigger: group, start: "top 88%", once: true },
          });
        });
        // ── Lab cards — stagger reveal ───────────────────────────────────
        gsap.set("[data-lab-card]", { opacity: 0, y: 36 });
        ScrollTrigger.batch("[data-lab-card]", {
          start: "top 90%",
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.08, overwrite: true }),
        });

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
  }, [isDesktop]);

  return (
    <div ref={rootRef} className="relative" style={{ background: "var(--bg)", color: "var(--text)" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        .r { opacity: 0; will-change: transform, opacity; }
        @media (prefers-reduced-motion: reduce) {
          .r { opacity: 1 !important; transform: none !important; }
          [data-hero-underline] { transform: scaleX(1) !important; }
        }
      ` }} />

      {/* Fixed dot-grid backdrop */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 35%, transparent 80%)",
        maskImage: "radial-gradient(ellipse at 50% 40%, black 35%, transparent 80%)",
      }} />

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div data-progress style={{ height: "100%", width: "100%", background: "var(--accent-orange)", transform: "scaleX(0)" }} />
      </div>

      <div className="relative z-[1]">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section data-hero className="relative overflow-hidden px-6 md:px-12 lg:px-16 pt-28 md:pt-32 pb-16 border-b" style={{ borderColor: "var(--rule)" }}>
          {/* Orange glow */}
          <div data-hero-glow aria-hidden style={{
            position: "absolute", top: "-10%", left: "-5%", width: "55%", height: "120%", zIndex: 0, pointerEvents: "none",
            background: "radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--accent-orange) 22%, transparent), transparent 62%)",
            filter: "blur(40px)", opacity: 0.55,
          }} />
          <div data-hero-inner className="relative z-[1] max-w-6xl mx-auto">

            <div data-hero-meta className="r flex items-center justify-between mb-10 pb-3 border-b" style={{ borderColor: "var(--rule)" }}>
              <span className={mono} style={{ fontSize: 10, color: "var(--text-muted)" }}>CB · 2025 — Portfolio</span>
              <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>{t.available} · Brasília · BR</span>
            </div>

            <h1 data-hero-name className="r font-sans font-extrabold" style={{ fontSize: "clamp(2.8rem, 9vw, 7rem)", letterSpacing: "-0.035em", lineHeight: 0.9, margin: 0 }}>
              {hero.name}
            </h1>
            <div data-hero-underline style={{ height: 3, width: "min(280px, 60%)", background: "var(--accent-orange)", transform: "scaleX(0)", transformOrigin: "left center", marginTop: 18 }} />

            <p data-hero-title className="r font-sans mt-6" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--accent-orange)" }}>
              {hero.title}
            </p>
            <p data-hero-hook className="r font-sans mt-4 max-w-2xl" style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.62)" }}>
              {hero.hook}
            </p>
            <p data-hero-tech className={`${mono} r mt-6`} style={{ fontSize: 11, color: "var(--text-muted)" }}>{hero.tech_strip}</p>

            <div className="flex flex-wrap gap-3 mt-9">
              <a data-hero-cta href="#work" className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text)", border: "1px solid var(--accent-orange)", padding: "13px 22px", minHeight: 44 }}>{t.viewProjects} ↓</a>
              <a data-hero-cta href={`mailto:${contactInfo.email}`} className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>Email ↗</a>
              <a data-hero-cta href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>LinkedIn ↗</a>
              <a data-hero-cta href={contactInfo.github} target="_blank" rel="noopener noreferrer" className={`${mono} r inline-flex items-center`} style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--rule)", padding: "13px 22px", minHeight: 44 }}>GitHub ↗</a>
            </div>

            <div data-hero-scrollcue className={`${mono} r mt-14 flex items-center gap-3`} style={{ fontSize: 9, color: "var(--text-muted)" }}>
              <span>{isPt ? "Role para revelar" : "Scroll to reveal"}</span>
              <span style={{ fontSize: 13 }}>↓</span>
            </div>
          </div>
        </section>

        {/* ── Selected Work ──────────────────────────────────────────────── */}
        {isDesktop ? (
          /* Desktop: pinned horizontal gallery */
          <section id="work" data-hwrap className="relative overflow-hidden border-b" style={{ height: "100vh", borderColor: "var(--rule)", background: "var(--bg)" }}>
            <div data-track className="flex items-center" style={{ height: "100%", width: "max-content", paddingLeft: "clamp(24px,6vw,96px)", paddingRight: "clamp(24px,6vw,96px)", gap: 24 }}>
              {/* Title panel */}
              <div className="flex flex-col justify-end" style={{ width: "clamp(280px, 60vw, 520px)", height: "min(70vh, 560px)", flexShrink: 0, paddingBottom: 24 }}>
                <span className={mono} style={{ fontSize: 11, color: "var(--accent-orange)" }}>01 — {t.work}</span>
                <h2 className="font-sans font-extrabold mt-3" style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 0.92, margin: 0, textTransform: "uppercase" }}>
                  {t.selectedWork}
                </h2>
                <div className="mt-6 flex items-center gap-4" style={{ color: "var(--text-muted)" }}>
                  <span className={mono} style={{ fontSize: 10 }}>{String(featuredProjects.length).padStart(2, "0")} {isPt ? "projetos" : "projects"}</span>
                  <span style={{ width: 40, height: 1, background: "var(--rule)" }} />
                  <span className={mono} style={{ fontSize: 10, color: "var(--accent-orange)" }}>{t.drag} →</span>
                </div>
              </div>

              {featuredProjects.map((p, i) => (
                <ProjectPanel key={p.id} p={p} i={i} locale={locale} isPt={isPt} caseLabel={t.caseStudy} liveLabel={t.live} />
              ))}

              {/* Outro panel */}
              <div className="flex flex-col justify-center" style={{ width: "clamp(240px, 28vw, 380px)", height: "min(70vh, 560px)", flexShrink: 0 }}>
                <Link href={`/${locale}/projects`} className="group">
                  <span className={mono} style={{ fontSize: 10, color: "var(--text-muted)" }}>{isPt ? "Continuar" : "Keep going"}</span>
                  <div className="font-sans font-extrabold mt-3 transition-colors group-hover:text-[var(--accent-orange)]" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                    {t.viewAll} →
                  </div>
                </Link>
              </div>
            </div>

            {/* Gallery progress bar */}
            <div className="absolute left-0 right-0 bottom-0" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
              <div data-hbar style={{ height: "100%", background: "var(--accent-orange)", transform: "scaleX(0)", transformOrigin: "left center" }} />
            </div>
          </section>
        ) : (
          /* Mobile: vertical card grid */
          <section id="work" className="relative overflow-hidden px-6 md:px-12 py-16 border-b" style={{ borderColor: "var(--rule)" }}>
            <span data-ghost style={ghostStyle}>{t.work}</span>
            <div className="relative z-[1] max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-center gap-4">
                  <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>01 — {t.work}</span>
                  <h2 data-up className="r font-sans font-extrabold" style={{ fontSize: "clamp(1.5rem, 6vw, 2.4rem)", letterSpacing: "-0.02em", margin: 0 }}>{t.selectedWork}</h2>
                </div>
              </div>
              <div data-rule className="mb-8" style={{ height: 1, background: "var(--rule)" }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {featuredProjects.map((p) => (
                  <ProjectCard key={p.id} p={p} locale={locale} isPt={isPt} caseLabel={t.caseStudy} liveLabel={t.live} />
                ))}
              </div>
              <div data-up className="r mt-8">
                <Link href={`/${locale}/projects`} className={`${mono} inline-flex items-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text)", borderBottom: "1px solid var(--accent-orange)", paddingBottom: 4 }}>{t.viewAll} →</Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Tech marquee band ──────────────────────────────────────────── */}
        <div className="overflow-hidden border-b" style={{ borderColor: "var(--rule)", padding: "16px 0", background: "var(--bg)" }}>
          <div data-marquee className="flex items-center" style={{ width: "max-content", gap: 40 }}>
            {[...MARQUEE, ...MARQUEE].map((label, i) => <TechChip key={i} label={label} />)}
          </div>
        </div>

        {/* ── About + Stack ──────────────────────────────────────────────── */}
        <section id="about" className="relative overflow-hidden px-6 md:px-12 lg:px-16 py-16 md:py-20 border-b" style={{ borderColor: "var(--rule)" }}>
          <span data-ghost style={{ ...ghostStyle, left: "-2vw", right: "auto" }}>{t.about}</span>
          <div className="relative z-[1] max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>02 — {t.about}</span>
              <h2 data-up className="r font-sans font-extrabold mt-4" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", letterSpacing: "-0.02em", margin: "16px 0 0" }}>{about_preview.heading}</h2>
              <p data-up className="r font-sans mt-5 max-w-xl" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>{about_preview.body}</p>
              <div data-up className="r">
                <Link href={`/${locale}/about`} className={`${mono} inline-flex mt-6 transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text-muted)", borderBottom: "1px solid var(--rule)", paddingBottom: 4 }}>{about_preview.cta} →</Link>
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
                        <span key={item.name} data-chip className="r font-sans" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.62)", padding: "4px 9px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.3)" }}>{item.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Lab ────────────────────────────────────────────────────────── */}
        <section id="lab" className="relative overflow-hidden px-6 md:px-12 lg:px-16 py-16 md:py-20 border-b" style={{ borderColor: "var(--rule)" }}>
          <span data-ghost style={ghostStyle}>Lab</span>
          <div className="relative z-[1] max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-center gap-4">
                <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>03 — {t.lab}</span>
                <h2 data-up className="r font-sans font-extrabold" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em", margin: 0 }}>{t.labHeading}</h2>
              </div>
              <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--text-muted)" }}>{String(experiments.length).padStart(2, "0")}</span>
            </div>
            <div data-rule className="mb-8" style={{ height: 1, background: "var(--rule)" }} />
            <p data-up className="r font-sans max-w-2xl mb-10" style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>{t.labLead}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredExperiments.map((e) => {
                const title = isPt ? e.titlePt : e.title;
                const focus = FOCUS_LABEL[e.focus][isPt ? "pt" : "en"];
                return (
                  <Link key={e.route} href={e.route} data-lab-card className="r group relative overflow-hidden flex flex-col justify-between" style={{ border: "1px solid var(--rule)", minHeight: 184, padding: 18 }}>
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(140deg, ${e.gradient.from}, ${e.gradient.to})`, opacity: 0.6 }} />
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,9,9,0.82), rgba(10,9,9,0.25))" }} />
                    <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100" style={{ background: "var(--accent-orange)", transition: "opacity 200ms" }} />
                    <div className="relative z-[1] flex items-center justify-between">
                      <span className={mono} style={{ fontSize: 9, color: "var(--accent-orange)" }}>P{e.phase}</span>
                      <span className={mono} style={{ fontSize: 8, color: "rgba(255,255,255,0.55)" }}>{focus}</span>
                    </div>
                    <div className="relative z-[1]">
                      <h3 className="font-sans font-bold" style={{ fontSize: "1rem", letterSpacing: "-0.01em", lineHeight: 1.15, margin: 0 }}>{title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {e.tech.slice(0, 2).map((tch) => (
                            <span key={tch} className={mono} style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", padding: "3px 6px", border: "1px solid rgba(255,255,255,0.14)" }}>{tch}</span>
                          ))}
                        </div>
                        <span className={`${mono} transition-transform group-hover:translate-x-1`} style={{ fontSize: 12, color: "var(--accent-orange)" }}>→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div data-up className="r mt-10">
              <Link href="/lab" className={`${mono} inline-flex items-center transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text)", borderBottom: "1px solid var(--accent-orange)", paddingBottom: 4 }}>
                {t.enterLab} →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Contact ────────────────────────────────────────────────────── */}
        <section id="contact" className="relative overflow-hidden px-6 md:px-12 lg:px-16 py-20 md:py-28">
          <span data-ghost style={ghostStyle}>{t.contact}</span>
          <div className="relative z-[1] max-w-6xl mx-auto">
            <span data-up className={`${mono} r`} style={{ fontSize: 10, color: "var(--accent-orange)" }}>04 — {t.contact}</span>
            <h2 data-contact-heading className="r font-sans font-extrabold mt-4" style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 1, margin: "16px 0 0" }}>{contact_cta.heading}</h2>
            <p data-up className="r font-sans mt-5" style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)" }}>{contact_cta.body}</p>
            <div data-up className="r flex flex-wrap items-center gap-3 mt-8">
              <a href={`mailto:${contactInfo.email}`} className="font-sans transition-colors hover:bg-white hover:text-black" style={{ fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.28)", padding: "14px 26px" }}>{contactInfo.email}</a>
              <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className={`${mono} transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text-muted)", padding: "14px 18px" }}>LinkedIn ↗</a>
              <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className={`${mono} transition-colors hover:text-[var(--accent-orange)]`} style={{ fontSize: 11, color: "var(--text-muted)", padding: "14px 18px" }}>GitHub ↗</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
