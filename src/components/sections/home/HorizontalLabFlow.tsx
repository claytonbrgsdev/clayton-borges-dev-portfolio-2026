"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
}

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const SANS: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const PANEL_COUNT = 4;

export function HorizontalLabFlow({ locale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isPt = locale === "pt";

  const textPanels = isPt
    ? [
        {
          tag: "01 / 03",
          heading: "Eu construo\ncoisas que\nse movem.",
          body: "Não só interfaces. Sistemas que respiram, reagem e surpreendem.",
        },
        {
          tag: "02 / 03",
          heading: "Arte\ngenerativa.\nMatemática.\nFísica.",
          body: "Três anos de experimentos que vivem fora dos projetos de cliente.",
        },
        {
          tag: "03 / 03",
          heading: "O lab é onde\neu penso\nem voz alta.",
          body: "27 experimentos e contando — todos documentados abaixo.",
        },
      ]
    : [
        {
          tag: "01 / 03",
          heading: "I build things\nthat move.",
          body: "Not just interfaces. Systems that breathe, react, and surprise.",
        },
        {
          tag: "02 / 03",
          heading: "Generative\nart. Math.\nPhysics.",
          body: "Three years of experiments that live outside client work.",
        },
        {
          tag: "03 / 03",
          heading: "The lab is\nwhere I think\nout loud.",
          body: "27 experiments and counting — all documented below.",
        },
      ];

  useEffect(() => {
    const container = containerRef.current;
    const wrapper   = wrapperRef.current;
    if (!container || !wrapper) return;
    if (window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ─── Lenis snap helpers ──────────────────────────────────────────────────
    type LenisSnap = {
      on(event: string, handler: () => void): void;
      off(event: string, handler: () => void): void;
      scrollTo(target: number, opts?: Record<string, unknown>): void;
    };

    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let lenisSnap:  LenisSnap | null = null;
    let tween:      ReturnType<typeof gsap.to> | null = null;
    let lenisTimer: ReturnType<typeof setTimeout> | null = null;

    // Reads pin spacer from live DOM every snap — always correct, never stale.
    const snapToPanel = () => {
      const pinSpacer = container.closest<HTMLElement>(".pin-spacer");
      if (!pinSpacer) return;
      const pinTop = Math.round(pinSpacer.getBoundingClientRect().top + window.scrollY);
      const total  = window.innerWidth * (PANEL_COUNT - 1);
      const progress = (window.scrollY - pinTop) / total;
      if (progress < 0 || progress > 1) return;
      const idx    = Math.round(progress * (PANEL_COUNT - 1));
      const target = Math.round(pinTop + (idx / (PANEL_COUNT - 1)) * total);
      if (Math.abs(window.scrollY - target) > 2 && lenisSnap) {
        lenisSnap.scrollTo(target, { duration: 0.4 });
      }
    };

    const onScrollForSnap = () => {
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToPanel, 200);
    };

    // ─── Deferred GSAP setup ─────────────────────────────────────────────────
    //
    // React runs child useEffects BEFORE parent useEffects.  This component
    // (child of PortfolioExperience) would therefore create its ScrollTrigger
    // before PortfolioExperience creates the hero pin spacer.  GSAP would then
    // measure trigger.start without the hero's extra pin height — yielding a
    // value short by exactly `window.innerHeight * 0.45`.
    //
    // Deferring to the next macrotask (setTimeout 0) guarantees that
    // PortfolioExperience's useEffect has already run, created the hero pin,
    // and called ScrollTrigger.refresh() before we measure anything.
    const setupTimer = setTimeout(() => {
      const scrollEnd = () => window.innerWidth * (PANEL_COUNT - 1);

      tween = gsap.to(wrapper, {
        x: () => -scrollEnd(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          start: "top top",
          end: () => `+=${scrollEnd()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const newActive = Math.round(self.progress * (PANEL_COUNT - 1));
            if (newActive !== activeRef.current) {
              activeRef.current = newActive;
              setActive(newActive);
            }
          },
          onEnter: () => {
            activeRef.current = 0;
            setActive(0);
          },
          onLeaveBack: () => {
            activeRef.current = 0;
            setActive(0);
          },
        },
      });

      // Tell Lenis about the new document height introduced by the pin spacer.
      // Lenis caches scrollHeight at init time — before GSAP inflates the page
      // with pin spacers — so its limit is stale.  Calling resize() here ensures
      // programmatic scrollTo() and wheel-scroll reach panels 3 & 4 (which live
      // beyond the stale limit).  ResizeObserver will keep it accurate after this.
      {
        type LenisResizable = LenisSnap & { resize(): void };
        const lenisForResize = (window as unknown as { __lenis?: LenisResizable }).__lenis;
        lenisForResize?.resize();
      }

      // Subscribe to Lenis for panel snap.  Extra tick needed because Lenis
      // itself is also set up in a parent effect that may still be pending.
      lenisTimer = setTimeout(() => {
        const lenis = (window as unknown as { __lenis?: LenisSnap }).__lenis;
        if (lenis) {
          lenisSnap = lenis;
          lenis.on("scroll", onScrollForSnap);
        }
      }, 0);
    }, 0);

    return () => {
      clearTimeout(setupTimer);
      if (lenisTimer) clearTimeout(lenisTimer);
      if (snapTimer)  clearTimeout(snapTimer);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      if (lenisSnap) lenisSnap.off("scroll", onScrollForSnap);
    };
  }, []);

  // Helper: per-element reveal style
  const r = (panelIdx: number, delayMs = 0): React.CSSProperties => ({
    opacity: active === panelIdx ? 1 : 0,
    transform: active === panelIdx ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${delayMs}ms, transform 0.5s ease ${delayMs}ms`,
  });

  /* ── Mobile: vertical stack of all panels ── */
  if (isMobile) {
    const allPanels = [
      ...textPanels,
      {
        tag: isPt ? "Lado Criativo" : "Creative Side",
        heading: isPt ? "Explore os\nexperimentos." : "Explore the\nexperiments.",
        body: isPt
          ? "Abaixo você encontra os experimentos que preparei. Física, matemática, arte generativa — tudo interativo."
          : "Below you'll find the experiments I've built. Physics, math, generative art — all interactive.",
      },
    ];
    return (
      <div
        id="creative-lab"
        style={{ background: "#0A0909", borderTop: "1px solid var(--rule)" }}
      >
        {allPanels.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "clamp(40px,8vh,72px) clamp(20px,5vw,48px)",
              borderBottom: i < allPanels.length - 1 ? "1px solid var(--rule)" : undefined,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ ...SANS, fontSize: 9, color: "var(--accent-orange)", marginBottom: 20 }}>
              {p.tag}
            </div>
            <h2 style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(32px, 8vw, 72px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              textTransform: "uppercase",
              margin: "0 0 clamp(16px, 4vw, 28px)",
              whiteSpace: "pre-line",
            }}>
              {p.heading}
            </h2>
            <p style={{
              ...SANS,
              fontSize: "clamp(11px, 3.5vw, 13px)",
              color: "rgba(255,255,255,0.45)",
              maxWidth: 420,
              lineHeight: 1.85,
              margin: 0,
            }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="creative-lab"
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        background: "#0A0909",
        borderTop: "1px solid var(--rule)",
      }}
    >
      {/* Orange progress bar — grows left→right as panels advance */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 1,
          background: "rgba(255,255,255,0.08)",
          zIndex: 10,
        }}
      >
        <div
          ref={progressRef}
          style={{
            height: "100%",
            background: "var(--accent-orange)",
            transformOrigin: "left",
            transform: "scaleX(0)",
          }}
        />
      </div>

      {/* 4 panels side by side */}
      <div
        ref={wrapperRef}
        style={{
          display: "flex",
          width: `${PANEL_COUNT * 100}vw`,
          height: "100%",
          willChange: "transform",
        }}
      >
        {/* Narrative panels 1 – 3 */}
        {textPanels.map((p, i) => (
          <div
            key={i}
            style={{
              width: "100vw",
              height: "100%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "0 clamp(24px, 6vw, 96px) clamp(48px, 8vh, 96px)",
              position: "relative",
              overflow: "hidden",
              borderRight: "1px solid var(--rule)",
            }}
          >
            {/* Ghost panel number */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: -24,
                bottom: -40,
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(200px, 36vw, 480px)",
                fontWeight: 800,
                letterSpacing: "-0.07em",
                lineHeight: 0.75,
                color: "#fff",
                opacity: 0.028,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>

            {/* Tag */}
            <div
              style={{
                ...SANS,
                fontSize: 9,
                color: "var(--accent-orange)",
                marginBottom: 28,
                ...r(i, 0),
              }}
            >
              {p.tag}
            </div>

            {/* Heading */}
            <h2
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(44px, 8vw, 116px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                textTransform: "uppercase",
                margin: "0 0 clamp(24px, 3.5vh, 48px)",
                padding: "0.1em 0 0.05em",
                whiteSpace: "pre-line",
                ...r(i, 80),
              }}
            >
              {p.heading}
            </h2>

            {/* Body */}
            <p
              style={{
                ...SANS,
                fontSize: "clamp(11px, 1vw, 13px)",
                color: "rgba(255,255,255,0.4)",
                maxWidth: 480,
                lineHeight: 1.85,
                margin: 0,
                ...r(i, 160),
              }}
            >
              {p.body}
            </p>
          </div>
        ))}

        {/* Panel 4 — Lab entry */}
        <div
          style={{
            width: "100vw",
            height: "100%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 clamp(24px, 6vw, 96px) clamp(48px, 8vh, 96px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ghost "LAB" watermark */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: -24,
              bottom: -40,
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(200px, 36vw, 480px)",
              fontWeight: 800,
              letterSpacing: "-0.07em",
              lineHeight: 0.75,
              color: "var(--accent-orange)",
              opacity: 0.04,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            LAB
          </div>

          {/* Orange accent bar */}
          <div
            style={{
              width: "clamp(40px, 6vw, 80px)",
              height: 2,
              background: "var(--accent-orange)",
              marginBottom: 28,
              opacity: active === 3 ? 1 : 0,
              transition: "opacity 0.45s ease",
            }}
          />

          {/* Tag */}
          <div
            style={{
              ...SANS,
              fontSize: 9,
              color: "var(--accent-orange)",
              marginBottom: 28,
              ...r(3, 0),
            }}
          >
            {isPt ? "Lado Criativo" : "Creative Side"}
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(44px, 8vw, 116px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.88,
              textTransform: "uppercase",
              margin: "0 0 clamp(24px, 3.5vh, 48px)",
              padding: "0.1em 0 0.05em",
              whiteSpace: "pre-line",
              ...r(3, 80),
            }}
          >
            {isPt ? "Explore os\nexperimentos." : "Explore the\nexperiments."}
          </h2>

          {/* Body */}
          <p
            style={{
              ...SANS,
              fontSize: "clamp(11px, 1vw, 13px)",
              color: "rgba(255,255,255,0.4)",
              maxWidth: 480,
              lineHeight: 1.85,
              margin: "0 0 clamp(28px, 4vh, 48px)",
              ...r(3, 160),
            }}
          >
            {isPt
              ? "Abaixo você encontra os experimentos que preparei. Física, matemática, arte generativa — tudo interativo."
              : "Below you'll find the experiments I've built. Physics, math, generative art — all interactive."}
          </p>

          {/* Scroll-down hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.32)",
              ...r(3, 240),
            }}
          >
            <span style={{ ...SANS, fontSize: 9 }}>
              {isPt ? "Role para baixo" : "Scroll down"}
            </span>
            <span style={{ fontSize: 14 }}>↓</span>
          </div>
        </div>
      </div>

      {/* Panel progress pills — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === active ? 20 : 4,
              height: 4,
              borderRadius: 2,
              background: i === active ? "var(--accent-orange)" : "rgba(255,255,255,0.18)",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Skip hint — top right */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: "clamp(24px, 4vw, 60px)",
          zIndex: 10,
          opacity: 0.2,
        }}
      >
        <span style={{ ...SANS, fontSize: 8 }}>
          {isPt ? "Pular → role para baixo" : "Skip → scroll down ↓"}
        </span>
      </div>
    </div>
  );
}
