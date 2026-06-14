"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

interface WorkSectionProps {
  dict: Dictionary;
  locale: Locale;
}

// Geometric SVG thumbnails — monochromatic, hardware-aesthetic
function ThumbGrid() {
  return (
    <svg viewBox="0 0 200 120" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 50 + 2}
            y={row * 40 + 2}
            width={44}
            height={33}
            stroke="rgba(10,10,10,0.25)"
            strokeWidth={1}
            rx={2}
          />
        ))
      )}
      <rect x={2} y={2} width={94} height={73} stroke="rgba(10,10,10,0.5)" strokeWidth={1} rx={2} fill="rgba(10,10,10,0.04)" />
    </svg>
  );
}

function ThumbOrbs() {
  const cx = 100, cy = 60;
  return (
    <svg viewBox="0 0 200 120" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {[48, 35, 22, 10].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} stroke="rgba(10,10,10,0.22)" strokeWidth={1} />
      ))}
      {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x2  = Math.round((cx + 48 * Math.cos(rad)) * 100) / 100;
        const y2  = Math.round((cy + 48 * Math.sin(rad)) * 100) / 100;
        return (
          <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(10,10,10,0.12)" strokeWidth={0.5} />
        );
      })}
      <circle cx={cx + 35} cy={cy} r={3.5} fill="rgba(10,10,10,0.5)" />
      <circle cx={cx - 22} cy={cy - 20} r={2.5} fill="rgba(10,10,10,0.3)" />
      <circle cx={cx + 10} cy={cy + 32} r={2} fill="rgba(10,10,10,0.3)" />
    </svg>
  );
}

function ThumbNet() {
  const pts: Array<[number, number]> = [
    [40, 30], [80, 20], [130, 45], [160, 30],
    [50, 75], [100, 60], [150, 80], [75, 100],
  ];
  const edges: Array<[number, number]> = [[0,1],[1,2],[2,3],[0,4],[1,5],[2,5],[3,6],[4,5],[5,6],[4,7],[5,7]];
  return (
    <svg viewBox="0 0 200 120" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {edges.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="rgba(10,10,10,0.2)" strokeWidth={1} />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 2 || i === 5 ? 4.5 : 3} fill="rgba(10,10,10,0.4)" />
      ))}
    </svg>
  );
}

function ThumbWave() {
  const points: string[] = [];
  for (let x = 0; x <= 200; x += 2) {
    const y = Math.round((60 + Math.sin((x / 200) * Math.PI * 4) * 22 + Math.sin((x / 200) * Math.PI * 9) * 10) * 100) / 100;
    points.push(`${x},${y}`);
  }
  const points2: string[] = [];
  for (let x = 0; x <= 200; x += 2) {
    const y = Math.round((60 + Math.sin((x / 200) * Math.PI * 4 + 0.8) * 14 + Math.sin((x / 200) * Math.PI * 6 + 1.2) * 7) * 100) / 100;
    points2.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 200 120" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <polyline points={points.join(" ")} stroke="rgba(10,10,10,0.35)" strokeWidth={1} fill="none" />
      <polyline points={points2.join(" ")} stroke="rgba(10,10,10,0.18)" strokeWidth={0.8} fill="none" />
      {[0, 50, 100, 150, 200].map((x) => (
        <line key={x} x1={x} y1={20} x2={x} y2={100} stroke="rgba(10,10,10,0.06)" strokeWidth={0.5} />
      ))}
    </svg>
  );
}

const PROJECT_BASE = [
  { id: "W-001", name: "Moveo Filmes", tech: "Next.js 16 · Supabase RLS · TipTap · dnd-kit · GSAP", Thumb: ThumbGrid, href: null },
  { id: "W-002", name: "MzPrime",       tech: "Three.js · React Three Fiber · MeshStandardMaterial · CanvasTexture", Thumb: ThumbOrbs, href: "https://claytonbrgsdev.github.io/mz-prime/" },
  { id: "W-003", name: "Metanova Labs", tech: "Next.js 15 · TypeScript · Radix UI · SWR", Thumb: ThumbNet, href: "https://metanovalabs.ai/dashboard" },
  { id: "W-004", name: "DSRPTV Records", tech: "Stripe · Mercado Pago · Spotify API · AWS S3 · Three.js", Thumb: ThumbWave, href: "http://dsrptvrec.com" },
];

interface ProjectCardData {
  id: string;
  name: string;
  type: string;
  role: string;
  desc: string;
  tech: string;
  Thumb: () => React.JSX.Element;
  href: string | null;
}

const border = "1px solid rgba(10,10,10,0.12)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };

export function WorkSection({ dict, locale }: WorkSectionProps) {
  const t = dict.home.work_section;
  const CLIENT_PROJECTS = PROJECT_BASE.map((p, i) => ({
    ...p,
    type: t.projects[i].type,
    role: t.projects[i].role,
    desc: t.projects[i].desc,
  }));
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const split = new SplitText(el, { type: "chars" });
    gsap.from(split.chars, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
    return () => split.revert();
  }, []);

  return (
    <section
      id="work"
      style={{ background: "#F2F0EC", borderBottom: border }}
    >
      {/* Section header */}
      <div style={{ borderBottom: border, padding: "14px 32px", display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 9, letterSpacing: "0.12em", color: "#9A9A9A", textTransform: "uppercase" }}>
          {t.code}
        </span>
        <h2 ref={headingRef} style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 13, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
          {t.heading}
        </h2>
      </div>

      {/* Grid */}
      <div style={{ padding: "40px 32px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1 }}>
        {CLIENT_PROJECTS.map((proj) => (
          <ProjectCard key={proj.id} proj={proj} />
        ))}
      </div>

      {/* Footer bar */}
      <div style={{ borderTop: border, margin: "40px 0 0", padding: "14px 32px", display: "flex", justifyContent: "flex-end" }}>
        <Link
          href={`/${locale}/projects`}
          style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(10,10,10,0.45)", textDecoration: "none", transition: "color 0.1s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1E44F0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(10,10,10,0.45)"; }}
        >
          {t.cta_all}
        </Link>
      </div>
    </section>
  );
}

function ProjectCard({ proj }: { proj: ProjectCardData }) {
  const { id, name, role, type, desc, tech, Thumb, href } = proj;
  const cardRef  = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Perspective tilt on the whole card
  useEffect(() => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotationY: x * 8,
        rotationX: -y * 6,
        transformPerspective: 800,
        ease: "power2.out",
        duration: 0.3,
        overwrite: "auto",
      });
    };
    const onLeave = () =>
      gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.5, ease: "power2.out" });

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Clip-path reveal on thumbnail as it enters viewport
  useEffect(() => {
    const el = thumbRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(el, { clipPath: "inset(100% 0 0 0)" });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "top 35%",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = (1 - self.progress) * 100;
        gsap.set(el, { clipPath: `inset(${p}% 0 0 0)` });
      },
    });
    return () => st.kill();
  }, []);

  const inner = (
    <div
      ref={cardRef}
      style={{
        border,
        borderRadius: 3,
        background: "#F2F0EC",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: href ? "pointer" : "default",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Thumbnail */}
      <div
        ref={thumbRef}
        style={{ background: "rgba(10,10,10,0.03)", padding: "20px 24px", borderBottom: border, height: 130, display: "flex", alignItems: "center" }}
      >
        <Thumb />
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A" }}>{id}</span>
          <span style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 9, color: "#9A9A9A" }}>{type}</span>
        </div>

        <h3 style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 17, fontWeight: 600, color: "#0A0A0A", margin: 0, letterSpacing: "-0.01em" }}>
          {name}
        </h3>

        <p style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
          {role}
        </p>

        <p style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 13, color: "#0A0A0A", opacity: 0.7, margin: "4px 0 0", lineHeight: 1.5 }}>
          {desc}
        </p>

        <p style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 10, color: "#9A9A9A", margin: "4px 0 0", lineHeight: 1.6 }}>
          {tech}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
        {inner}
      </a>
    );
  }
  return inner;
}
