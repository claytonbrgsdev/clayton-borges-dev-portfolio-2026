"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";
import { featuredProjects } from "@/lib/data/projects";
import { stack } from "@/lib/data/stack";
import { hardwareProjects } from "@/lib/data/hardware";
import { contactInfo } from "@/lib/data/contact";
import { HeroConstellation } from "@/components/sketches/HeroConstellation";
import { IDEDeploySequence } from "@/components/sections/home/IDEDeploySequence";
import { StackOrbitField } from "@/components/sketches/StackOrbitField";
import { ContactWaveform, type ContactLink } from "@/components/sketches/ContactWaveform";
import { PrinciplesFullscreen } from "@/components/sections/home/PrinciplesFullscreen";
import { LabShowcase } from "@/components/sections/home/LabShowcase";

const SECTION_LABELS = ["Hero", "Projects", "About", "Approach", "Lab"];

interface PortfolioExperienceProps {
  dict: Dictionary;
  locale: Locale;
}

export function PortfolioExperience({ dict, locale }: PortfolioExperienceProps) {
  const sectionsRef    = useRef<(HTMLElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const navDotsRef     = useRef<(HTMLButtonElement | null)[]>([]);
  const heroContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Hero assembly animation
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion && heroContentRef.current) {
      const heroEl = heroContentRef.current;
      const children = Array.from(heroEl.children);

      gsap.set(children, { opacity: 0, y: 18 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(children, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 });
    }

    let activeSection = 0;

    const updateDots = (active: number) => {
      navDotsRef.current.forEach((dot, i) => {
        if (!dot) return;
        dot.style.height  = i === active ? "28px" : "6px";
        dot.style.opacity = i === active ? "0.75" : "0.22";
      });
    };
    updateDots(0);

    const onScroll = () => {
      if (progressBarRef.current) {
        const totalH = document.body.scrollHeight - window.innerHeight;
        progressBarRef.current.style.transform = `scaleX(${totalH > 0 ? window.scrollY / totalH : 0})`;
      }
      let cumY = 0;
      for (let i = 0; i < sectionsRef.current.length; i++) {
        const el = sectionsRef.current[i];
        if (!el) continue;
        const elH = el.offsetHeight;
        if (window.scrollY < cumY + elH) {
          if (i !== activeSection) { activeSection = i; updateDots(i); }
          break;
        }
        cumY += elH;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) {
      sectionsRef.current.forEach((section, i) => {
        if (i > 0 && section) section.style.opacity = "1";
      });
      return;
    }

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    // ── Section 1: Featured Projects grid (below IDE sequence) ────────────
    const s1 = sectionsRef.current[1];
    if (s1) {
      const projectsGrid = s1.querySelector<HTMLElement>("[data-projects-grid]");
      if (projectsGrid) {
        triggers.push(ScrollTrigger.create({
          trigger: projectsGrid,
          start: "top 78%",
          once: true,
          onEnter: () => {
            const gridCards = projectsGrid.querySelectorAll<HTMLElement>(".grid > div");
            if (gridCards.length) {
              gsap.from(Array.from(gridCards), { x: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" });
            }
          },
        }));
      }
    }

    // ── Section 2: About + Stack ───────────────────────────
    const s2 = sectionsRef.current[2];
    if (s2) {
      triggers.push(ScrollTrigger.create({
        trigger: s2,
        start: "top 78%",
        once: true,
        onEnter: () => {
          gsap.to(s2, { opacity: 1, duration: 0.4, ease: "power2.out" });
          // Row A: left tags col and right orbit col slide in from opposite sides
          const tagsCol = s2.querySelector<HTMLElement>("[data-about-tags]");
          const orbitCol = s2.querySelector<HTMLElement>("[data-about-orbit]");
          if (tagsCol) gsap.from(tagsCol, { x: -30, opacity: 0, duration: 0.6, ease: "power3.out", delay: 0.2 });
          if (orbitCol) gsap.from(orbitCol, { x: 30, opacity: 0, duration: 0.6, ease: "power3.out", delay: 0.2 });
          // Row B: about text fades in after Row A
          const aboutRow = s2.querySelector<HTMLElement>("[data-about-text]");
          if (aboutRow) gsap.from(aboutRow, { opacity: 0, y: 12, duration: 0.5, ease: "power2.out", delay: 0.45 });
        },
      }));
    }

    // ── Section 4: Lab + Contact ───────────────────────────
    const s4 = sectionsRef.current[4];
    if (s4) {
      triggers.push(ScrollTrigger.create({
        trigger: s4,
        start: "top 78%",
        once: true,
        onEnter: () => {
          gsap.to(s4, { opacity: 1, duration: 0.4, ease: "power2.out" });
          const labCards = s4.querySelectorAll<HTMLElement>('a[href*="lab"]');
          if (labCards.length) {
            gsap.from(Array.from(labCards), {
              y: 20,
              opacity: 0,
              duration: 0.45,
              stagger: { amount: 0.35, from: "start" },
              ease: "power3.out",
              delay: 0.15,
            });
          }
        },
      }));
    }

    return () => { triggers.forEach(t => t?.kill()); };
  }, []);

  const scrollToSection = (i: number) => {
    const el = sectionsRef.current[i];
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo(target: number | HTMLElement, opts?: Record<string, unknown>): void } }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const { home, projects: pDict } = dict;
  const gridProjects = featuredProjects.slice(0, 3);
  const contactLinks: ContactLink[] = [
    { label: "Email",    value: contactInfo.email,  href: `mailto:${contactInfo.email}` },
    { label: "GitHub",   value: "@claytonbrgsdev", href: contactInfo.github },
    { label: "LinkedIn", value: "clayton-borges",  href: contactInfo.linkedin },
  ];

  return (
    <div className="portfolio-bg-grid" style={{ background: "#07090e", color: "#fff" }}>
      <HeroConstellation />
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-px bg-white/8">
        <div ref={progressBarRef} className="h-full bg-white/35" style={{ width: "100%", transformOrigin: "left", transform: "scaleX(0)" }} />
      </div>

      {/* Edge vignette */}
      <div className="fixed inset-0 pointer-events-none z-10" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.45) 100%)"
      }} />

      {/* Section nav dots — right side */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 items-center">
        {SECTION_LABELS.map((label, i) => (
          <button
            key={label}
            ref={el => { navDotsRef.current[i] = el; }}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to ${label} section`}
            title={label}
            style={{ width: "4px", borderRadius: "99px", background: "#fff", transition: "height 0.35s ease, opacity 0.35s ease, width 0.25s ease", border: "none", cursor: "pointer", padding: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.width = "6px"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.width = "4px"; }}
          />
        ))}
      </div>

      {/* ── SECTION 0 — Hero ──────────────────────────────────────────────── */}
      <section ref={el => { sectionsRef.current[0] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 relative z-20">
        <div className="max-w-3xl" ref={heroContentRef}>
          <span className="font-mono text-xs tracking-widest uppercase mb-6 block" style={{ opacity: 0.45 }}>
            {home.hero.greeting}
          </span>
          <h1 className="font-bold leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(3.5rem,10vw,7rem)", textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}>
            {home.hero.name.split(" ")[0]}<br />
            <span style={{ opacity: 0.72 }}>{home.hero.name.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="font-light mb-3" style={{ fontSize: "clamp(1rem,2vw,1.25rem)", opacity: 0.58 }}>
            {home.hero.title}
          </p>
          <p className="font-mono text-sm mb-10" style={{ opacity: 0.32, letterSpacing: "0.1em" }}>
            {home.hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/${locale}/projects`}
              className="font-mono text-xs tracking-widest uppercase border px-6 py-3 hover:bg-white hover:text-black transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}>
              {home.hero.cta_projects}
            </Link>
            <Link href={`/${locale}/contact`}
              className="font-mono text-xs tracking-widest uppercase px-6 py-3 hover:opacity-100 transition-opacity"
              style={{ opacity: 0.45, border: "1px solid rgba(255,255,255,0.12)" }}>
              {home.hero.cta_contact}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style={{ opacity: 0.32 }}>
          <span className="font-mono text-[9px] tracking-widest uppercase">scroll</span>
          <span className="font-mono text-xs animate-bounce">↓</span>
        </div>
      </section>

      {/* ── SECTION 1 — Featured Projects ─────────────────────────────────── */}
      <section ref={el => { sectionsRef.current[1] = el; }} className="relative z-20">

        {/* IDE → Deploy → Browser cinematic sequence (Moveo Filmes) */}
        <IDEDeploySequence locale={locale} />

        {/* Section header + other projects grid */}
        <div data-projects-grid
          className="px-8 md:px-20 py-16 relative"
          style={{ background: "#07090e" }}>
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="font-mono text-xs tracking-widest uppercase block mb-3"
                  style={{ opacity: 0.35 }}>
                  {home.featured_projects.label}
                </span>
                <h2 className="font-bold" style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>
                  {home.featured_projects.heading}
                </h2>
              </div>
              <Link href={`/${locale}/projects`}
                className="hidden md:block font-mono text-xs tracking-wide underline underline-offset-4 transition-opacity"
                style={{ opacity: 0.45 }}>
                {home.featured_projects.cta} →
              </Link>
            </div>

            {/* 3-card grid */}
            <div className="grid md:grid-cols-3 gap-3">
              {gridProjects.map(project => {
                const name = locale === "pt" ? project.namePt : project.nameEn;
                const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;
                return (
                  <div key={project.id} className="border p-5 flex flex-col gap-3 hover:border-white/22 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">{name}</h3>
                      {project.type && <span className="font-mono text-xs" style={{ opacity: 0.33 }}>{project.type}</span>}
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ opacity: 0.45 }}>{desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.slice(0, 3).map(t => (
                        <span key={t} className="font-mono text-xs border px-1.5 py-0.5" style={{ opacity: 0.3, borderColor: "rgba(255,255,255,0.1)" }}>{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-auto">
                      {project.overview && <Link href={`/${locale}/projects/${project.id}`} className="font-mono text-xs hover:opacity-100 transition-opacity" style={{ opacity: 0.45 }}>{pDict.view_case_study} →</Link>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:opacity-100 transition-opacity" style={{ opacity: 0.32 }}>{pDict.view_live} ↗</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — About + Stack ─────────────────────────────────────── */}
      <section ref={el => { sectionsRef.current[2] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 py-20 relative z-20"
        style={{ opacity: 0 }}>
        <div className="max-w-5xl mx-auto w-full">

          {/* Row A — visual row: tag categories (left) + orbit canvas (right) */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-14">

            {/* Left col: "What I Work With" heading + tag categories */}
            <div data-about-tags>
              <span className="font-mono text-xs tracking-widest uppercase block mb-4" style={{ opacity: 0.35 }}>{home.skills.label}</span>
              <h2 className="font-bold mb-6" style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)" }}>{home.skills.heading}</h2>
              <div className="space-y-4">
                {stack.map(cat => (
                  <div key={cat.title}>
                    <span className="font-mono text-xs tracking-widest uppercase block mb-2" style={{ opacity: 0.28 }}>{cat.title}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map(item => (
                        <span key={item.name} className="font-mono text-xs border px-2.5 py-1 hover:border-white/30 transition-colors"
                          style={{ borderColor: "rgba(255,255,255,0.14)", opacity: 0.62, background: "rgba(0,0,0,0.4)" }}
                          title={item.note}>
                          {item.name}
                          {item.note && <span style={{ opacity: 0.4 }}> ·</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col: StackOrbitField canvas */}
            <div data-about-orbit className="flex items-center justify-center overflow-hidden" style={{ maxHeight: "460px" }}>
              <StackOrbitField stack={stack} />
            </div>
          </div>

          {/* Row B — about text row: full-width, more compact */}
          <div data-about-text className="border-t pt-10 max-w-2xl" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="font-mono text-xs tracking-widest uppercase block mb-3" style={{ opacity: 0.35 }}>{home.about_preview.label}</span>
            <h2 className="font-bold mb-4" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>{home.about_preview.heading}</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ opacity: 0.5 }}>{home.about_preview.body}</p>
            <Link href={`/${locale}/about`} className="font-mono text-xs tracking-wide underline underline-offset-4 hover:opacity-100 transition-opacity" style={{ opacity: 0.45 }}>
              {home.about_preview.cta} →
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 3 — How I Work ────────────────────────────────────────── */}
      <section ref={el => { sectionsRef.current[3] = el; }}
        className="min-h-screen flex flex-col justify-center relative z-20">
        <PrinciplesFullscreen dict={dict} locale={locale} />
      </section>

      {/* ── SECTION 4 — Lab + Hardware + Contact ─────────────────────────── */}
      <section ref={el => { sectionsRef.current[4] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 py-20 relative z-20"
        style={{ opacity: 0 }}>
        <div className="max-w-5xl mx-auto w-full">

          {/* Lab section — cinematic showcase */}
          <LabShowcase locale={locale} />

          {/* Hardware callout */}
          {hardwareProjects.length > 0 && (
            <div className="border p-5 backdrop-blur-sm mb-10"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.35)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="font-mono text-xs tracking-widest uppercase block mb-1" style={{ opacity: 0.35 }}>{home.hardware_callout.heading}</span>
                  <p className="text-sm mb-3" style={{ opacity: 0.48 }}>{home.hardware_callout.subheading}</p>
                  <div className="flex flex-wrap gap-2">
                    {hardwareProjects.map(hw => (
                      <span key={hw.id} className="font-mono text-xs border px-2 py-0.5"
                        style={{ borderColor: "rgba(255,255,255,0.12)", opacity: 0.42 }}>
                        {locale === "pt" ? hw.namePt : hw.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/${locale}/hardware`}
                  className="font-mono text-xs tracking-wide border px-5 py-2.5 hover:border-white/50 transition-colors whitespace-nowrap shrink-0"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                  {home.hardware_callout.cta} →
                </Link>
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="border-t pt-10" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="font-mono text-xs tracking-widest uppercase block mb-4" style={{ opacity: 0.40 }}>Contact</span>
            <h2 className="font-bold mb-4 leading-tight" style={{ fontSize: "clamp(2rem,6vw,4rem)" }}>
              {home.contact_cta.heading}
            </h2>
            <p className="text-sm mb-8 max-w-md" style={{ opacity: 0.55 }}>
              {home.contact_cta.body}
            </p>
            <div className="flex flex-wrap gap-4 items-center mb-8">
              <a href={`mailto:${contactInfo.email}`}
                className="font-mono text-sm border px-6 py-3 hover:bg-white hover:text-black transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.28)" }}>
                {contactInfo.email}
              </a>
              <Link href={`/${locale}/contact`}
                className="font-mono text-sm px-6 py-3 border hover:border-white/30 transition-colors hover:opacity-100"
                style={{ opacity: 0.45, borderColor: "rgba(255,255,255,0.12)" }}>
                {home.contact_cta.cta} →
              </Link>
            </div>
            <div className="flex items-center gap-6 font-mono text-xs" style={{ letterSpacing: "0.1em" }}>
              <a href={contactInfo.github} target="_blank" rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity" style={{ opacity: 0.32 }}>GitHub</a>
              <span style={{ opacity: 0.18 }}>·</span>
              <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity" style={{ opacity: 0.32 }}>LinkedIn</a>
              <span style={{ opacity: 0.18 }}>·</span>
              <span style={{ opacity: 0.22 }}>Brasília, BR</span>
            </div>
            <div className="w-full max-w-5xl mx-auto mt-12">
              <ContactWaveform links={contactLinks} />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
