"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// ── Project data ────────────────────────────────────────────────────────────
const PROJECT_EN = {
  index:       "01",
  type:        "Client Work · CMS Platform",
  year:        "2024",
  name:        "Moveo Filmes",
  description: "CMS platform for Brazil's independent film industry. 38 film pages auto-generated from a headless CMS, serving a full catalog at national scale with 99.8% uptime.",
  highlights:  ["38 auto-generated pages", "Synced via headless CMS", "99.8% uptime"],
  tech:        ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Vercel"],
  video:       "/videos/moveo/moveo_2.mp4",
  slug:        "moveo-filmes",
  liveUrl:     "https://moveofilmes.com.br",
};

const PROJECT_PT = {
  ...PROJECT_EN,
  type:        "Trabalho para Cliente · Plataforma CMS",
  description: "Plataforma CMS para a indústria cinematográfica independente do Brasil. 38 páginas de filmes auto-geradas a partir de um headless CMS, servindo um catálogo completo em escala nacional com 99,8% de uptime.",
  highlights:  ["38 páginas auto-geradas", "Sincronizado via headless CMS", "99,8% uptime"],
};

const MACOS_DOTS = ["#ff5f57", "#febc2e", "#28c840"];

interface FeaturedProjectCardProps {
  locale?: string;
}

export function FeaturedProjectCard({ locale = "en" }: FeaturedProjectCardProps) {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  // Stall recovery — keeps video looping on cold-start dev server
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let retries = 0;
    const onStalled = () => {
      if (retries++ < 5) setTimeout(() => { v.load(); v.play().catch(() => {}); }, 800);
    };
    v.addEventListener("stalled", onStalled);
    return () => v.removeEventListener("stalled", onStalled);
  }, []);

  // Scroll-reveal entrance — wrapRef: simple fade; videoWrap: clip-path reveal
  useEffect(() => {
    const el  = wrapRef.current;
    const vid = videoWrapRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Wrapper fade-in (left column + overall)
    gsap.set(el, { opacity: 0, y: 28 });
    const fadeTrigger = ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }),
    });

    // Video column — clip-path reveal from bottom
    if (vid) {
      gsap.set(vid, { clipPath: "inset(100% 0 0 0)" });
      const clipTrigger = ScrollTrigger.create({
        trigger: vid,
        start: "top 78%",
        end: "top 30%",
        scrub: 1.4,
        onUpdate: (self) => {
          const p = (1 - self.progress) * 100;
          gsap.set(vid, { clipPath: `inset(${p}% 0 0 0)` });
        },
      });
      return () => { fadeTrigger.kill(); clipTrigger.kill(); };
    }

    return () => fadeTrigger.kill();
  }, []);

  // Perspective tilt on video wrapper
  useEffect(() => {
    const el = videoWrapRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotationY: x * 10,
        rotationX: -y * 8,
        transformPerspective: 900,
        ease: "power2.out",
        duration: 0.35,
        overwrite: "auto",
      });
    };
    const onLeave = () =>
      gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.55, ease: "power2.out" });

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const isEn   = locale !== "pt";
  const PROJECT = isEn ? PROJECT_EN : PROJECT_PT;

  return (
    <div
      style={{
        background: "#0A0909",
        padding: "0 0 72px",
        position: "relative",
      }}
    >
      <div
        ref={wrapRef}
        style={{
          maxWidth: "1020px",
          margin: "0 auto",
          padding: "0 clamp(32px, 5vw, 80px)",
        }}
      >
        {/* ── Two-column grid ────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
          gap: "clamp(40px, 6vw, 72px)",
          alignItems: "center",
        }}
          className="max-md:grid-cols-1"
        >

          {/* Left — info ───────────────────────────────────────────── */}
          <div>
            <span style={{
              fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: "10px",
              letterSpacing: "0.14em", textTransform: "uppercase",
              opacity: 0.30, display: "block", marginBottom: "18px",
            }}>
              {PROJECT.index} · {PROJECT.type} · {PROJECT.year}
            </span>

            <h3 style={{
              fontSize: "clamp(2rem,3.8vw,3rem)",
              fontWeight: 700, lineHeight: 1,
              marginBottom: "18px",
            }}>
              {PROJECT.name}
            </h3>

            <p style={{
              fontFamily: "var(--font-geist-sans, sans-serif)",
              fontSize: "13px", lineHeight: 1.75,
              opacity: 0.50, marginBottom: "22px",
              maxWidth: "340px",
            }}>
              {PROJECT.description}
            </p>

            {/* Highlights */}
            <div style={{ marginBottom: "26px" }}>
              {PROJECT.highlights.map(h => (
                <div key={h} style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: "11px",
                  opacity: 0.38, marginBottom: "5px",
                }}>
                  <span style={{ opacity: 0.5 }}>▸</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "6px",
              marginBottom: "30px",
            }}>
              {PROJECT.tech.map(t => (
                <span key={t} style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: "10px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "3px 9px", opacity: 0.36,
                }}>
                  {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "22px", alignItems: "center" }}>
              <Link
                href={`/${locale}/projects/${PROJECT.slug}`}
                style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: "11px",
                  opacity: 0.58, letterSpacing: "0.07em",
                  textDecoration: "none", color: "inherit",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.95")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.58")}
              >
                {isEn ? "View Case Study →" : "Ver Case Study →"}
              </Link>
              <a
                href={PROJECT.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: "11px",
                  opacity: 0.30, letterSpacing: "0.07em",
                  textDecoration: "none", color: "inherit",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.65")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.30")}
              >
                {isEn ? "Live Site ↗" : "Ver site ↗"}
              </a>
            </div>
          </div>

          {/* Right — video preview ─────────────────────────────────── */}
          <div
            ref={videoWrapRef}
            style={{
              border: "1px solid rgba(255,255,255,0.09)",
              overflow: "hidden",
              background: "rgba(0,0,0,0.4)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Minimal browser-chrome strip */}
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 11px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}>
              {MACOS_DOTS.map(c => (
                <span key={c} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: c, opacity: 0.7, flexShrink: 0,
                }} />
              ))}
              <span style={{
                marginLeft: 8, fontFamily: "var(--font-geist-mono, monospace)", fontSize: "9px",
                opacity: 0.22, letterSpacing: "0.04em",
              }}>
                moveofilmes.com.br
              </span>
            </div>

            <div style={{ aspectRatio: "16/10", overflow: "hidden" }}>
              <video
                ref={videoRef}
                src={PROJECT.video}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", display: "block",
                  opacity: 0.72,
                  transition: "opacity 0.4s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.92")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.72")}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
