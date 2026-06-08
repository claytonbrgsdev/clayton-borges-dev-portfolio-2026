"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { stack } from "@/lib/data/stack";
import { hardwareProjects } from "@/lib/data/hardware";
import { contactInfo } from "@/lib/data/contact";
import { AboutBackground } from "@/components/AboutBackground";
import { StackOrbitField } from "@/components/sketches/StackOrbitField";
import { ContactWaveform, type ContactLink } from "@/components/sketches/ContactWaveform";
import { PrinciplesFullscreen } from "@/components/sections/home/PrinciplesFullscreen";
import { LabShowcase } from "@/components/sections/home/LabShowcase";
import { StatsStrip } from "@/components/StatsStrip";
import { WorkHorizontal } from "@/components/sections/home/WorkHorizontal";
import { HorizontalLabFlow } from "@/components/sections/home/HorizontalLabFlow";

// Section labels resolved at render time from dict — see usages below

// ── Scramble ticker ───────────────────────────────────────────────────────────
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/—";
function ScrambleTicker({ locale }: { locale: string }) {
  const phrases = locale === "pt"
    ? ["DISPONÍVEL", "FULL-STACK", "REACT/NEXT.JS", "THREE.JS·3D", "CÓDIGO CRIATIVO"]
    : ["AVAILABLE",  "FULL-STACK", "REACT/NEXT.JS", "THREE.JS·3D", "CREATIVE CODE"];
  const [text, setText] = useState(phrases[0]);
  const idx = useRef(0);
  const ivl = useRef<ReturnType<typeof setInterval> | null>(null);
  const tmr = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const scrambleTo = (target: string, cb?: () => void) => {
    if (ivl.current) clearInterval(ivl.current);
    let i = 0;
    ivl.current = setInterval(() => {
      setText(target.split("").map((ch, j) => {
        if (ch === " ") return " ";
        if (j < i) return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join(""));
      i += 0.7;
      if (i >= target.length) {
        clearInterval(ivl.current!); ivl.current = null;
        setText(target); cb?.();
      }
    }, 35);
  };

  useEffect(() => {
    const tick = () => {
      idx.current = (idx.current + 1) % phrases.length;
      scrambleTo(phrases[idx.current], () => { tmr.current = setTimeout(tick, 2500); });
    };
    tmr.current = setTimeout(tick, 2500);
    return () => {
      if (tmr.current) clearTimeout(tmr.current);
      if (ivl.current) clearInterval(ivl.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span
      style={{ display: "inline-block", minWidth: "13ch", cursor: "default" }}
      onMouseEnter={() => scrambleTo(phrases[idx.current])}
    >
      {text}
    </span>
  );
}

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
      fontFamily: "var(--font-geist-sans)", fontSize: 9,
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
  const sl = dict.home.section_labels ?? {
    entry: "01 — Entry", work: "02 — Work", selected_projects: "Selected\nProjects",
    about: "03 — About", lab: "04 — Lab", contact: "05 — Contact", scroll: "Scroll",
    nav_dots: ["Hero", "Work", "About", "Approach", "Lab"], lang_tooltip: "",
  };
  const SECTION_LABELS = sl.nav_dots;

  const sectionsRef    = useRef<(HTMLElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const navDotsRef     = useRef<(HTMLButtonElement | null)[]>([]);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const claytonRef     = useRef<HTMLSpanElement>(null);
  const borgesRef      = useRef<HTMLSpanElement>(null);
  const labFlowRef     = useRef<HTMLElement | null>(null);

  // ── Match BORGES width to CLAYTON width via scaleX ──────────────────────
  useEffect(() => {
    const match = () => {
      const c = claytonRef.current;
      const b = borgesRef.current;
      if (!c || !b) return;
      b.style.transform = "";
      void b.offsetWidth;              // force reflow — measure natural inline-block width
      const cw = c.getBoundingClientRect().width;
      const bw = b.getBoundingClientRect().width;
      if (cw === 0 || bw === 0) return;
      b.style.transform = `scaleX(${cw / bw})`;
      b.style.transformOrigin = "left center";
    };
    const t = setTimeout(match, 60); // after first paint
    window.addEventListener("resize", match);
    return () => { clearTimeout(t); window.removeEventListener("resize", match); };
  }, []);

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

    // Refresh after all triggers in this effect are created so that their start/end
    // positions are computed against the final DOM (including the hero pin spacer).
    // HorizontalLabFlow defers its own ScrollTrigger to the next macrotask, so it
    // measures positions independently after this refresh has already settled.
    ScrollTrigger.refresh();

    return () => { triggers.forEach(t => t?.kill()); };
  }, []);

  const scrollToSection = (i: number) => {
    const el = sectionsRef.current[i];
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo(target: number | HTMLElement, opts?: Record<string, unknown>): void } }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const scrollToLabFlow = () => {
    const el = labFlowRef.current;
    if (!el) return;
    type LenisType = { scrollTo(target: number | HTMLElement, opts?: Record<string, unknown>): void };
    const lenis = (window as unknown as { __lenis?: LenisType }).__lenis;
    const top = el.offsetTop;
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo({ top });
  };

  const { home } = dict;
  const contactLinks: ContactLink[] = [
    { label: "Email",    value: contactInfo.email,  href: `mailto:${contactInfo.email}` },
    { label: "GitHub",   value: "@claytonbrgsdev", href: contactInfo.github },
    { label: "LinkedIn", value: "clayton-borges",  href: contactInfo.linkedin },
  ];

  return (
    <div className="portfolio-bg-grid" style={{ background: "#0A0909", color: "#fff" }}>

      <AboutBackground />

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
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(24px, 4vw, 64px) clamp(32px, 5vh, 64px)",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div ref={heroContentRef} style={{ width: "100%" }}>

          {/* ── Top metadata rule ── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "clamp(32px, 5vh, 56px)",
            paddingBottom: 14,
            borderBottom: "1px solid var(--rule)",
            opacity: 0,
            animation: "fadeIn 0.5s ease-out 0.2s forwards",
          }}>
            <span style={{ fontFamily: "var(--font-geist-sans)", fontSize: "var(--fs-sm)", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              {sl.entry}
            </span>
            <span style={{ fontFamily: "var(--font-geist-sans)", fontSize: "var(--fs-sm)", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Brasília · BR
            </span>
          </div>

          {/* ── Name + secondary — 2-col grid ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "clamp(24px, 4vw, 64px)",
            alignItems: "flex-end",
            marginBottom: "clamp(24px, 3vh, 40px)",
          }}>
            {/* Name */}
            <h1 style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "var(--fs-lg)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 0.82,
              textTransform: "uppercase",
              margin: 0,
              padding: "0.15em 0 0.05em",
              clipPath: "inset(0 100% 0 0)",
              animation: "revealName 1s cubic-bezier(0.16,1,0.3,1) 0.35s forwards",
            }}>
              <span ref={claytonRef} style={{ display: "block", width: "fit-content" }}>{home.hero.name.split(" ")[0]}</span>
              <span ref={borgesRef} style={{ display: "inline-block", opacity: 0.22 }}>{home.hero.name.split(" ").slice(1).join(" ")}</span>
            </h1>

            {/* Secondary: ticker + title */}
            <div style={{
              textAlign: "right",
              paddingBottom: 6,
              opacity: 0,
              animation: "fadeIn 0.5s ease-out 0.75s forwards",
            }}>
              <div style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "var(--fs-sm)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent-orange)",
                marginBottom: 10,
              }}>
                <ScrambleTicker locale={locale} />
              </div>
              <p style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "var(--fs-md)",
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: 1.4,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {home.hero.title}
              </p>
            </div>
          </div>

          {/* ── Horizontal datum ── */}
          <div style={{
            height: 1,
            background: "var(--rule)",
            marginBottom: "clamp(20px, 3vh, 36px)",
            opacity: 0,
            animation: "fadeIn 0.4s ease-out 0.9s forwards",
          }} />

          {/* ── Bottom: hook + CTAs ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "clamp(24px, 4vw, 64px)",
            alignItems: "flex-end",
            opacity: 0,
            animation: "fadeIn 0.5s ease-out 1s forwards",
          }}>
            <p style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "var(--fs-md)",
              color: "var(--text-muted)",
              lineHeight: 1.65,
              margin: 0,
              maxWidth: 520,
            }}>
              {home.hero.hook}
            </p>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <Link
                href={`/${locale}/projects`}
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "var(--fs-sm)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: "var(--text)",
                  border: "1px solid var(--rule)",
                  padding: "10px 18px",
                  transition: "border-color 200ms, color 200ms",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent-orange)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-orange)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rule)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              >
                {home.hero.cta_projects}
              </Link>
              <Link
                href={`/${locale}/contact`}
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "var(--fs-sm)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: "var(--text-muted)",
                  padding: "10px 18px",
                  border: "1px solid transparent",
                  transition: "color 200ms, border-color 200ms",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rule)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent"; }}
              >
                {home.hero.cta_contact}
              </Link>
            </div>
          </div>

          {/* Fork — two scroll paths */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "clamp(20px, 3vh, 32px)",
            paddingTop: "clamp(14px, 2vh, 22px)",
            borderTop: "1px solid var(--rule)",
          }}>

            {/* ↓ THE WORK — passive indicator */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              opacity: 0.22,
              userSelect: "none",
            }}>
              <span style={{ fontFamily: "var(--font-geist-sans)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {locale === "pt" ? "O trabalho" : "The work"}
              </span>
              <span style={{ fontSize: 14 }}>↓</span>
            </div>

            {/* Separator */}
            <div style={{ height: 32, width: 1, background: "rgba(255,255,255,0.1)" }} />

            {/* → CREATIVE LAB — active CTA */}
            <button
              onClick={scrollToLabFlow}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                opacity: 0.55,
                transition: "opacity 200ms",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.55"; }}
            >
              <span style={{ fontFamily: "var(--font-geist-sans)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent-orange)" }}>
                {locale === "pt" ? "Lab Criativo" : "Creative Lab"}
              </span>
              <span style={{ fontSize: 14, color: "var(--accent-orange)" }}>→</span>
            </button>

          </div>

        </div>
      </section>

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

          <SectionLabel label={sl.about} />

          {/* Heading — line reveal */}
          <div className="mb-6 font-bold font-sans uppercase" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
            <LineReveal delay={0}>
              <span style={{ display: "block" }}>{home.about_preview.heading}</span>
            </LineReveal>
          </div>

          {/* Bio */}
          <div data-about-text className="mb-14 max-w-2xl">
            <LineReveal delay={80}>
              <p className="font-sans text-sm leading-relaxed mb-6" style={{ opacity: 0.52 }}>
                {home.about_preview.body}
              </p>
            </LineReveal>
            <Link
              href={`/${locale}/about`}
              className="font-sans text-xs tracking-wide underline underline-offset-4 hover:opacity-100 transition-opacity"
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
                fontFamily: "var(--font-geist-sans)", fontSize: 9,
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
                    <span className="font-sans text-xs tracking-widest uppercase block mb-2" style={{ opacity: 0.28 }}>{cat.title}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map(item => (
                        <span
                          key={item.name}
                          className="font-sans text-xs border px-2.5 py-1 hover:border-white/30 transition-colors"
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

      {/* ── Horizontal Lab Flow ─────────────────────────────────────────────── */}
      <section
        ref={el => { labFlowRef.current = el; }}
        className="relative z-20"
      >
        <HorizontalLabFlow locale={locale} />
      </section>

      {/* ── SECTION 4 — Lab + Hardware + Contact ─────────────────────────── */}
      <section
        ref={el => { sectionsRef.current[4] = el; }}
        className="min-h-screen flex flex-col justify-center px-8 md:px-20 py-20 relative z-20"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto w-full">

          <SectionLabel label={sl.lab} />

          <LabShowcase locale={locale} />

          {/* Hardware callout */}
          {hardwareProjects.length > 0 && (
            <div
              className="border p-5 backdrop-blur-sm mb-10"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.35)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="font-sans text-xs tracking-widest uppercase block mb-1" style={{ opacity: 0.35 }}>
                    {home.hardware_callout.heading}
                  </span>
                  <p className="font-sans text-sm mb-3" style={{ opacity: 0.48 }}>{home.hardware_callout.subheading}</p>
                  <div className="flex flex-wrap gap-2">
                    {hardwareProjects.map(hw => (
                      <span
                        key={hw.id}
                        className="font-sans text-xs border px-2 py-0.5"
                        style={{ borderColor: "rgba(255,255,255,0.12)", opacity: 0.42 }}
                      >
                        {locale === "pt" ? hw.namePt : hw.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/${locale}/hardware`}
                  className="font-sans text-xs tracking-wide border px-5 py-2.5 hover:border-white/50 transition-colors whitespace-nowrap shrink-0"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                >
                  {home.hardware_callout.cta} →
                </Link>
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="border-t pt-16" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <SectionLabel label={sl.contact} />
            <WordSplitReveal
              text={home.contact_cta.heading}
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(42px,7.5vw,116px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBottom: 80,
                textTransform: "uppercase",
              }}
            />
            <p className="font-sans text-sm mb-8 max-w-md" style={{ opacity: 0.55 }}>
              {home.contact_cta.body}
            </p>
            <div className="flex flex-wrap gap-4 items-center mb-8">
              <a
                href={`mailto:${contactInfo.email}`}
                className="font-sans text-sm border px-6 py-3 hover:bg-white hover:text-black transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.28)" }}
              >
                {contactInfo.email}
              </a>
              <Link
                href={`/${locale}/contact`}
                className="font-sans text-sm px-6 py-3 border hover:border-white/30 transition-colors hover:opacity-100"
                style={{ opacity: 0.45, borderColor: "rgba(255,255,255,0.12)" }}
              >
                {home.contact_cta.cta} →
              </Link>
            </div>
            <div className="flex items-center gap-6 font-sans text-xs" style={{ letterSpacing: "0.1em" }}>
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
