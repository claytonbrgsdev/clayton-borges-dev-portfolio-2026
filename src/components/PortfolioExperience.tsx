"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { stack } from "@/lib/data/stack";
import { hardwareProjects } from "@/lib/data/hardware";
import { contactInfo } from "@/lib/data/contact";
import { HeroConstellation } from "@/components/sketches/HeroConstellation";
import { StackOrbitField } from "@/components/sketches/StackOrbitField";
import { ContactWaveform, type ContactLink } from "@/components/sketches/ContactWaveform";
import { PrinciplesFullscreen } from "@/components/sections/home/PrinciplesFullscreen";
import { LabShowcase } from "@/components/sections/home/LabShowcase";
import { StatsStrip } from "@/components/StatsStrip";
import { WorkHorizontal } from "@/components/sections/home/WorkHorizontal";

const SECTION_LABELS = ["Hero", "Work", "About", "Approach", "Lab"];

interface PortfolioExperienceProps {
  dict: Dictionary;
  locale: Locale;
}

// ── Line-by-line reveal ──────────────────────────────────────────────────────
function LineReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        (el.firstChild as HTMLElement).style.transform = "translateY(0)";
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <div style={{
        transform: "translateY(110%)",
        transition: `transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        display: "block",
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Word-split reveal ────────────────────────────────────────────────────────
function WordSplitReveal({ text, style }: { text: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll<HTMLElement>(".w-inner").forEach((inner, i) => {
          setTimeout(() => { inner.style.transform = "translateY(0)"; }, i * 90);
        });
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");
  return (
    <div ref={ref} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.18em" }}
        >
          <span
            className="w-inner"
            style={{
              display: "inline-block",
              transform: "translateY(105%)",
              transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-geist-mono)", fontSize: 9,
      letterSpacing: "0.16em", textTransform: "uppercase",
      color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: 16,
      marginBottom: 32,
    }}>
      {label}
      <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
    </div>
  );
}

export function PortfolioExperience({ dict, locale }: PortfolioExperienceProps) {
  const sectionsRef    = useRef<(HTMLElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const navDotsRef     = useRef<(HTMLButtonElement | null)[]>([]);
  const heroContentRef = useRef<HTMLDivElement>(null);

  // ── Scroll progress bar + nav dots ──────────────────────────────────────
  useEffect(() => {
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
      const totalH = document.body.scrollHeight - window.innerHeight;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${totalH > 0 ? window.scrollY / totalH : 0})`;
        const vel = ((window as unknown as Record<string, unknown>).__scrollVel as number) ?? 0;
        progressBarRef.current.style.background = vel > 15 ? "var(--accent-blue)" : "var(--accent-orange)";
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

    // LenisProvider effect runs after this component's effect (parent after child).
    // Defer to ensure __lenis is available when we subscribe.
    let lenisCleanup: (() => void) | null = null;
    const timer = setTimeout(() => {
      const lenis = (window as unknown as Record<string, unknown>).__lenis as
        { on: (e: string, fn: () => void) => void; off: (e: string, fn: () => void) => void } | undefined;
      if (lenis) {
        lenis.on("scroll", onScroll);
        lenisCleanup = () => lenis.off("scroll", onScroll);
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        lenisCleanup = () => window.removeEventListener("scroll", onScroll);
      }
      onScroll();
    }, 0);
    return () => { clearTimeout(timer); lenisCleanup?.(); };
  }, []);

  // ── GSAP ScrollTrigger animations ────────────────────────────────────────
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

    // Hero pin: content fades + lifts as user scrolls into Work
    const heroEl = sectionsRef.current[0];
    if (heroEl && heroContentRef.current) {
      const heroContent = heroContentRef.current;
      triggers.push(ScrollTrigger.create({
        trigger: heroEl,
        pin: true,
        start: "top top",
        end: "+=45%",
        scrub: 1.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(heroContent, {
            opacity: Math.max(0, 1 - p * 2.2),
            y: -p * 80,
          });
        },
        onLeaveBack: () => {
          gsap.set(heroContent, { opacity: 1, y: 0 });
        },
      }));
    }

    // About section fade-in
    const s2 = sectionsRef.current[2];
    if (s2) {
      triggers.push(ScrollTrigger.create({
        trigger: s2,
        start: "top 78%",
        once: true,
        onEnter: () => {
          gsap.to(s2, { opacity: 1, duration: 0.4, ease: "power2.out" });
        },
      }));
    }

    // Lab + Contact section
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
              y: 20, opacity: 0, duration: 0.45,
              stagger: { amount: 0.35, from: "start" },
              ease: "power3.out", delay: 0.15,
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

  const { home } = dict;
  const contactLinks: ContactLink[] = [
    { label: "Email",    value: contactInfo.email,  href: `mailto:${contactInfo.email}` },
    { label: "GitHub",   value: "@claytonbrgsdev", href: contactInfo.github },
    { label: "LinkedIn", value: "clayton-borges",  href: contactInfo.linkedin },
  ];

  return (
    <div className="portfolio-bg-grid" style={{ background: "#0A0909", color: "#fff" }}>
      <HeroConstellation />

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-px" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "100%",
            background: "var(--accent-orange)",
            transformOrigin: "left",
            transform: "scaleX(0)",
            transition: "background 300ms",
          }}
        />
      </div>

      {/* Edge vignette */}
      <div className="fixed inset-0 pointer-events-none z-10" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.45) 100%)",
      }} />

      {/* Section nav dots */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 items-center">
        {SECTION_LABELS.map((label, i) => (
          <button
            key={label}
            ref={el => { navDotsRef.current[i] = el; }}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to ${label} section`}
            title={label}
            style={{
              width: "4px", borderRadius: "99px", background: "#fff",
              transition: "height 0.35s ease, opacity 0.35s ease, width 0.25s ease",
              border: "none", cursor: "pointer", padding: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.width = "6px"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.width = "4px"; }}
          />
        ))}
      </div>

      {/* ── SECTION 0 — Hero ──────────────────────────────────────────────── */}
      <section
        ref={el => { sectionsRef.current[0] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 relative z-20"
      >
        <div className="max-w-3xl" ref={heroContentRef}>
          <span
            className="font-mono text-xs tracking-widest uppercase mb-6 block"
            style={{ opacity: 0, animation: "fadeIn 0.6s ease-out 0.9s forwards" }}
          >
            {home.hero.greeting}
          </span>
          <h1
            className="font-bold leading-[0.9] tracking-tight mb-6"
            style={{ textShadow: "0 2px 60px rgba(0,0,0,0.6)" }}
          >
            <span
              className="block hero-name-line"
              style={{
                fontSize: "clamp(4.2rem,11vw,9rem)",
                letterSpacing: "-0.03em",
                clipPath: "inset(0 100% 0 0)",
                animation: "revealName 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s forwards",
              }}
            >
              {home.hero.name.split(" ")[0]}
            </span>
            <span
              className="block hero-name-line"
              style={{
                fontSize: "clamp(2.8rem,7.5vw,6rem)",
                letterSpacing: "-0.02em",
                opacity: 0.35,
                clipPath: "inset(0 100% 0 0)",
                animation: "revealName 1.1s cubic-bezier(0.16,1,0.3,1) 0.22s forwards",
              }}
            >
              {home.hero.name.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p
            className="font-light mb-4"
            style={{ fontSize: "clamp(1rem,2vw,1.2rem)", opacity: 0, animation: "fadeIn 0.6s ease-out 0.95s forwards" }}
          >
            {home.hero.title}
          </p>
          <p
            className="text-sm leading-relaxed mb-5 max-w-xl"
            style={{ opacity: 0, animation: "fadeIn 0.6s ease-out 1.05s forwards" }}
          >
            {home.hero.hook}
          </p>
          <p
            className="font-mono text-xs mb-10"
            style={{ opacity: 0, letterSpacing: "0.1em", animation: "fadeIn 0.6s ease-out 1.15s forwards" }}
          >
            {home.hero.subtitle}
          </p>
          <div
            className="flex flex-wrap gap-4"
            style={{ opacity: 0, animation: "fadeIn 0.6s ease-out 1.25s forwards" }}
          >
            <Link
              href={`/${locale}/projects`}
              className="font-mono text-xs tracking-widest uppercase border px-6 py-3 hover:bg-white hover:text-black transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
            >
              {home.hero.cta_projects}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="font-mono text-xs tracking-widest uppercase px-6 py-3 hover:opacity-100 transition-opacity"
              style={{ opacity: 0.40, border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {home.hero.cta_contact}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style={{ opacity: 0.28 }}>
          <span className="font-mono text-[9px] tracking-widest uppercase">scroll</span>
          <span className="font-mono text-xs animate-bounce">↓</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
          height: "180px",
          background: "linear-gradient(to bottom, transparent, rgba(10,9,9,0.72))",
          zIndex: 1,
        }} />
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div className="relative z-20">
        <StatsStrip />
      </div>

      {/* ── SECTION 1 — Work (horizontal scroll) ─────────────────────────── */}
      <section ref={el => { sectionsRef.current[1] = el; }} className="relative z-20">
        <WorkHorizontal locale={locale} />
      </section>

      {/* ── SECTION 2 — About + Stack ─────────────────────────────────────── */}
      <section
        ref={el => { sectionsRef.current[2] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 py-20 relative z-20"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto w-full">

          <SectionLabel label="03 — About" />

          {/* Heading — line reveal */}
          <div className="mb-6 font-bold" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
            <LineReveal delay={0}>
              <span style={{ display: "block" }}>{home.about_preview.heading}</span>
            </LineReveal>
          </div>

          {/* Bio */}
          <div data-about-text className="mb-14 max-w-2xl">
            <LineReveal delay={80}>
              <p className="text-sm leading-relaxed mb-6" style={{ opacity: 0.52 }}>
                {home.about_preview.body}
              </p>
            </LineReveal>
            <Link
              href={`/${locale}/about`}
              className="font-mono text-xs tracking-wide underline underline-offset-4 hover:opacity-100 transition-opacity"
              style={{ opacity: 0.45 }}
            >
              {home.about_preview.cta} →
            </Link>
          </div>

          {/* Skills + orbit */}
          <div
            className="grid md:grid-cols-2 gap-10 lg:gap-16 border-t pt-12"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div data-about-tags>
              <div style={{
                fontFamily: "var(--font-geist-mono)", fontSize: 9,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "var(--accent-orange)", marginBottom: 16,
              }}>
                {home.skills.label}
              </div>
              <LineReveal delay={0}>
                <h2 className="font-bold mb-6" style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)" }}>
                  {home.skills.heading}
                </h2>
              </LineReveal>
              <div className="space-y-4">
                {stack.map(cat => (
                  <div key={cat.title}>
                    <span className="font-mono text-xs tracking-widest uppercase block mb-2" style={{ opacity: 0.28 }}>{cat.title}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map(item => (
                        <span
                          key={item.name}
                          className="font-mono text-xs border px-2.5 py-1 hover:border-white/30 transition-colors"
                          style={{ borderColor: "rgba(255,255,255,0.14)", opacity: 0.62, background: "rgba(0,0,0,0.4)" }}
                          title={item.note}
                        >
                          {item.name}
                          {item.note && <span style={{ opacity: 0.4 }}> ·</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-about-orbit className="flex items-center justify-center overflow-hidden" style={{ maxHeight: "460px" }}>
              <StackOrbitField stack={stack} />
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 3 — How I Work ────────────────────────────────────────── */}
      <section
        ref={el => { sectionsRef.current[3] = el; }}
        className="min-h-screen flex flex-col justify-center relative z-20"
      >
        <PrinciplesFullscreen dict={dict} locale={locale} />
      </section>

      {/* ── SECTION 4 — Lab + Hardware + Contact ─────────────────────────── */}
      <section
        ref={el => { sectionsRef.current[4] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 py-20 relative z-20"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto w-full">

          <SectionLabel label="04 — Lab" />

          <LabShowcase locale={locale} />

          {/* Hardware callout */}
          {hardwareProjects.length > 0 && (
            <div
              className="border p-5 backdrop-blur-sm mb-10"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.35)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="font-mono text-xs tracking-widest uppercase block mb-1" style={{ opacity: 0.35 }}>
                    {home.hardware_callout.heading}
                  </span>
                  <p className="text-sm mb-3" style={{ opacity: 0.48 }}>{home.hardware_callout.subheading}</p>
                  <div className="flex flex-wrap gap-2">
                    {hardwareProjects.map(hw => (
                      <span
                        key={hw.id}
                        className="font-mono text-xs border px-2 py-0.5"
                        style={{ borderColor: "rgba(255,255,255,0.12)", opacity: 0.42 }}
                      >
                        {locale === "pt" ? hw.namePt : hw.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/${locale}/hardware`}
                  className="font-mono text-xs tracking-wide border px-5 py-2.5 hover:border-white/50 transition-colors whitespace-nowrap shrink-0"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                >
                  {home.hardware_callout.cta} →
                </Link>
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="border-t pt-16" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <SectionLabel label="05 — Contact" />
            <WordSplitReveal
              text={home.contact_cta.heading}
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(42px,7.5vw,116px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBottom: 80,
              }}
            />
            <p className="text-sm mb-8 max-w-md" style={{ opacity: 0.55 }}>
              {home.contact_cta.body}
            </p>
            <div className="flex flex-wrap gap-4 items-center mb-8">
              <a
                href={`mailto:${contactInfo.email}`}
                className="font-mono text-sm border px-6 py-3 hover:bg-white hover:text-black transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.28)" }}
              >
                {contactInfo.email}
              </a>
              <Link
                href={`/${locale}/contact`}
                className="font-mono text-sm px-6 py-3 border hover:border-white/30 transition-colors hover:opacity-100"
                style={{ opacity: 0.45, borderColor: "rgba(255,255,255,0.12)" }}
              >
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
