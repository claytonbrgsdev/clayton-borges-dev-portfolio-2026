"use client";

import { useEffect, useRef } from "react";
import type p5Type from "p5";

// ─── CONTENT ─────────────────────────────────────────────────────────────────

interface ProjectEntry {
  title: string;
  year: string;
  desc: string;
  tags: readonly string[];
  href?: string;
  github?: string;
}

const PROJECTS: ProjectEntry[] = [
  {
    title: "MzPrime 3D",
    year: "2025",
    desc: "3D car cover showroom with live customization. One rigged GLB per vehicle category (12+ types); Three.js applies fabric color, sewing line color, and customer-uploaded logo in real time. Zero pre-rendered composites.",
    tags: ["Three.js", "GLB", "Next.js", "TypeScript"],
    href: "https://claytonbrgsdev.github.io/mz-prime/",
  },
  {
    title: "Moveo Filmes",
    year: "2024",
    desc: "Scroll-animated site for a film production company. Full catalog, TipTap CMS, dnd-kit drag ordering, admin panel, Supabase RLS auth. GSAP ScrollTrigger throughout.",
    tags: ["Next.js 16", "GSAP", "Supabase", "TipTap"],
  },
  {
    title: "Metanova Labs",
    year: "2025",
    desc: "Dashboard for Bittensor subnet 68 — an on-chain AI drug-discovery network. Algorithms tab frontend/backend integration. Tracks molecular competitions, miner leaderboards, protein data.",
    tags: ["Next.js 15", "Bittensor", "TypeScript", "Radix UI"],
    href: "https://metanovalabs.ai/dashboard",
  },
  {
    title: "DSRPTV Records",
    year: "2023",
    desc: "Music e-commerce and streaming platform. Stripe + Mercado Pago dual checkout, Spotify API, AWS S3, Three.js visuals. Built with Raphael Palmer (DISCLAYMER).",
    tags: ["React", "Three.js", "Stripe", "Firebase"],
    href: "http://dsrptvrec.com",
  },
  {
    title: "Novo Rio",
    year: "2025",
    desc: "Gamified agroforestry simulation funded by a FAC Brazilian Art & Culture grant, developed at the intersection of performing arts and technology.",
    tags: ["FastAPI", "Next.js", "PostgreSQL", "Docker"],
    github: "https://github.com/claytonbrgsdev/novo-rio",
  },
  {
    title: "Habitos",
    year: "2025",
    desc: "Full-stack habit and therapy tracking app for patient/therapist pairs. Built for ADHD support, then adapted and open-sourced.",
    tags: ["Next.js 16", "Prisma", "PostgreSQL", "Tailwind v4"],
    github: "https://github.com/claytonbrgsdev/habitos",
  },
  {
    title: "Slack Translator",
    year: "2025",
    desc: "Real-time PT↔EN Slack translation via WebSocket + AI, built in Ruby. Sole candidate to deliver within the stipulated timeframe.",
    tags: ["Ruby", "WebSocket", "OpenAI API"],
    github: "https://github.com/claytonbrgsdev/slack-translator_websocket-version",
  },
  {
    title: "Medication Tracker",
    year: "2025",
    desc: "3D spiral timeline for ADHD medication cycle tracking with scheduled reminders.",
    tags: ["Next.js", "Three.js", "TypeScript"],
    href: "https://claytonbrgsdev.github.io/medication-cycles-tracker/",
    github: "https://github.com/claytonbrgsdev/medication-cycles-tracker",
  },
  {
    title: "REACTO",
    year: "2025",
    desc: "Web audio-visual experiments with tweakable real-time parameters. Canvas and 3D scenes driven by live audio analysis.",
    tags: ["React", "Three.js", "Web Audio API"],
    href: "https://claytonbrgsdev.github.io/reacto/",
    github: "https://github.com/claytonbrgsdev/reacto",
  },
  {
    title: "ASA Player",
    year: "2025",
    desc: "Retro-styled web music player with a real-time ASCII spectrum analyzer on Web Audio API.",
    tags: ["Next.js", "Web Audio API", "TypeScript"],
    href: "https://claytonbrgsdev.github.io/aacs-player/",
    github: "https://github.com/claytonbrgsdev/aacs-player",
  },
  {
    title: "SPECtations",
    year: "2025",
    desc: "macOS desktop app for real-time audio waveform and spectrogram visualization.",
    tags: ["Python", "PySide6", "Audio DSP"],
    github: "https://github.com/claytonbrgsdev/SPECtations",
  },
  {
    title: "estock-control",
    year: "2025",
    desc: "Inventory management system with full CRUD, filtering, and reporting.",
    tags: ["React", "TypeScript", "Vite"],
    github: "https://github.com/estock-dev/estock-control",
  },
];

const SKILL_GROUPS = [
  { label: "Frontend",     skills: ["React 19", "Next.js 16", "TypeScript", "Three.js", "GSAP", "Tailwind"] },
  { label: "Backend",      skills: ["Node.js", "FastAPI", "Python", "Ruby", "REST / GraphQL", "WebSocket"] },
  { label: "Data & Cloud", skills: ["PostgreSQL", "Prisma", "Supabase", "Redis", "Docker", "AWS S3"] },
  { label: "Creative",     skills: ["Web Audio API", "React Three Fiber", "PySide6", "FFmpeg", "OpenAI"] },
] as const;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function secAlpha(p: number, i0: number, i1: number, o0: number, o1: number): number {
  if (p <= i0 || p >= o1) return 0;
  if (p < i1) return smoothstep(i0, i1, p);
  if (p > o0) return 1 - smoothstep(o0, o1, p);
  return 1;
}

// ─── WAVE SYSTEM ─────────────────────────────────────────────────────────────
//
// Six harmonic components superimposed over a grid of scan lines.
// Each component: amp (relative weight), kx / ky (spatial frequencies rad/px),
// wt (temporal frequency rad/s of T), p0 (initial phase rad).
//
// Total nominal amplitude weight sums to 1.20 → divide by this for normalised disp.

const WAVES = [
  // Fundamental — long, slow, dominant backbone
  { amp: 0.36, kx: 0.0095, ky: 0.0000, wt: 0.30, p0: 0.00 },
  // Second harmonic — medium frequency cross-field
  { amp: 0.22, kx: 0.0235, ky: 0.0028, wt: 0.52, p0: 1.30 },
  // Fine detail — short, fast, high-frequency texture
  { amp: 0.11, kx: 0.0560, ky: 0.0012, wt: 0.97, p0: 2.75 },
  // Diagonal 1 — oblique component, ~15° off horizontal
  { amp: 0.19, kx: 0.0148, ky: 0.0062, wt: 0.21, p0: 3.80 },
  // Diagonal 2 — counter-oblique, creates cross-hatch interference
  { amp: 0.11, kx: 0.0340, ky: -0.0038, wt: 0.72, p0: 0.55 },
  // Deep structure — very long wave, slow drift
  { amp: 0.21, kx: 0.0068, ky: 0.0018, wt: 0.12, p0: 5.10 },
] as const;

const WAVE_NORM = WAVES.reduce((s, w) => s + w.amp, 0); // ≈ 1.20

// Global amplitude envelope keyed by scroll progress.
// Returns fraction of canvas height to use as max displacement.
function ampEnvelope(sc: number): number {
  const rise = smoothstep(0, 0.52, sc);       // ramp up toward skills/projects peak
  const fall = smoothstep(0.70, 1.00, sc);    // calm down for contact section
  return (0.019 + rise * 0.044) * (1 - fall * 0.76);
}

// Reading zone X-mask. Text lives in the left ~44% of the canvas; waves there
// are suppressed to 3% amplitude. Blend smoothly into the wave field over the
// next 11% of width.
function xMask(x: number, W: number): number {
  const edge  = W * 0.44;
  const blend = W * 0.11;
  if (x <= edge)         return 0.03;
  if (x >= edge + blend) return 1.00;
  const t = (x - edge) / blend;
  return 0.03 + 0.97 * t * t * (3 - 2 * t);
}

// ─── SKETCH BUILDER ───────────────────────────────────────────────────────────

const N_LINES    = 88;  // horizontal scan lines
const STEP_PX    = 4;   // horizontal vertex step (px) — lower = smoother
const SCROLL_VH  = 500;

function buildWaveSketch(
  container: HTMLElement,
  scrollRef: React.MutableRefObject<number>
) {
  return import("p5").then(({ default: P5 }) => {
    let inst: p5Type | null = null;

    const sketch = (p: p5Type) => {
      let W = 0, H = 0, T = 0;
      let prevSc = 0;

      p.setup = () => {
        W = window.innerWidth;
        H = window.innerHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style(a: string, b: string): void }).style("display", "block");
        p.colorMode(p.RGB);
      };

      p.draw = () => {
        const sc = scrollRef.current;

        // Time ticks slightly slower as the field settles (higher scroll = more stillness)
        T += 0.0028 * (1 - sc * 0.38);

        // Scroll velocity — briefly boosts amplitude on fast scroll
        const velBoost = Math.min(0.28, Math.abs(sc - prevSc) * 80);
        prevSc = sc;

        // Full clear — no trails; this gives a sharp, analytical aesthetic
        p.background(5, 5, 8);

        const maxDisp = H * ampEnvelope(sc) * (1 + velBoost);

        // ── Subtle structural grid lines ────────────────────────────────────
        p.strokeWeight(0.45);
        p.noFill();

        // Vertical axis at the reading-zone boundary
        p.stroke(255, 255, 255, 5);
        p.line(W * 0.44, 0, W * 0.44, H);
        // Horizontal horizon at vertical midpoint
        p.line(0, H * 0.5, W, H * 0.5);

        // ── Wave scan lines ─────────────────────────────────────────────────
        p.strokeWeight(0.75);

        for (let row = 0; row < N_LINES; row++) {
          const y0 = ((row + 0.5) / N_LINES) * H; // baseline Y for this scan line

          // Alpha — lines brightest near vertical centre, dimming toward edges.
          // This creates a natural focal "depth" with the horizon as the plane.
          const cy = Math.abs(y0 / H - 0.5) * 2; // 0 at centre, 1 at edge
          const lineAlpha = 11 + (1 - cy) * 10;   // 11–21 range

          p.stroke(238, 238, 246, lineAlpha);
          p.beginShape();

          for (let xi = -STEP_PX; xi <= W + STEP_PX; xi += STEP_PX) {
            // Sum all wave components for this (x, y0, T) position
            let disp = 0;
            for (const w of WAVES) {
              disp +=
                (w.amp / WAVE_NORM) *
                Math.sin(w.kx * xi + w.ky * y0 + w.wt * T + w.p0);
            }

            // Apply masks — reading zone + viewport scale
            const mask = xMask(xi, W);
            const y = y0 + disp * maxDisp * mask;

            p.vertex(xi, y);
          }

          p.endShape();
        }

        // ── Cursor resonance: draw a faint ripple ring at mouse position ────
        // The ring expands/contracts with the field phase, giving the cursor
        // an "esoteric lens" quality.
        const ringPhase = T * 1.8;
        const ringR = 38 + Math.sin(ringPhase) * 10;
        p.noFill();
        p.stroke(255, 255, 255, 6 + Math.sin(ringPhase) * 4);
        p.strokeWeight(0.5);
        p.circle(p.mouseX, p.mouseY, ringR * 2);
        // Second ring, phase-shifted
        const ringR2 = 72 + Math.sin(ringPhase + Math.PI * 0.6) * 16;
        p.stroke(255, 255, 255, 3);
        p.circle(p.mouseX, p.mouseY, ringR2 * 2);
      };

      p.windowResized = () => {
        W = window.innerWidth;
        H = window.innerHeight;
        p.resizeCanvas(W, H);
      };
    };

    inst = new P5(sketch, container);
    return inst;
  });
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function WaveLab() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const scrollRef     = useRef(0);
  const heroRef       = useRef<HTMLDivElement>(null);
  const aboutRef      = useRef<HTMLDivElement>(null);
  const skillsRef     = useRef<HTMLDivElement>(null);
  const projectsRef   = useRef<HTMLDivElement>(null);
  const contactRef    = useRef<HTMLDivElement>(null);
  const scrollIndRef  = useRef<HTMLDivElement>(null);
  const readoutAmpRef = useRef<HTMLSpanElement>(null);

  // Scroll tracker — ref only, no React state
  useEffect(() => {
    const handler = () => {
      const maxS = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = maxS > 0 ? Math.max(0, Math.min(1, window.scrollY / maxS)) : 0;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Section visibility — imperative rAF loop, zero React re-renders
  useEffect(() => {
    const applyOverlay = (el: HTMLDivElement | null, alpha: number) => {
      if (!el) return;
      el.style.opacity       = alpha.toFixed(3);
      el.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
    };

    let rafId: number;
    const tick = () => {
      const sc = scrollRef.current;
      applyOverlay(heroRef.current,     secAlpha(sc, 0,    0.04, 0.17, 0.26));
      applyOverlay(aboutRef.current,    secAlpha(sc, 0.15, 0.22, 0.33, 0.42));
      applyOverlay(skillsRef.current,   secAlpha(sc, 0.37, 0.44, 0.53, 0.60));
      applyOverlay(projectsRef.current, secAlpha(sc, 0.54, 0.62, 0.73, 0.82));
      applyOverlay(contactRef.current,  secAlpha(sc, 0.77, 0.84, 0.93, 1.0));
      if (scrollIndRef.current) {
        scrollIndRef.current.style.opacity = Math.max(0, 1 - sc * 50).toFixed(3);
      }
      if (readoutAmpRef.current) {
        readoutAmpRef.current.textContent = `A=${Math.round(ampEnvelope(sc) * 1000) / 10}%H`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // p5 sketch
  useEffect(() => {
    if (!containerRef.current) return;
    let inst: p5Type | null = null;
    let alive = true;

    buildWaveSketch(containerRef.current, scrollRef).then((p5inst) => {
      if (!alive) { p5inst.remove(); return; }
      inst = p5inst;
    });

    return () => { alive = false; inst?.remove(); };
  }, []);

  const hidden = { opacity: 0, pointerEvents: "none" as const, willChange: "opacity" } as const;

  return (
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      {/* Scroll height provider */}
      <div style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      {/* p5 canvas */}
      <div
        ref={containerRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}
      />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="fixed inset-0 flex flex-col justify-end pb-[10vh] px-[5vw]"
        style={{ zIndex: 10, ...hidden }}
      >
        {/* Name — stacked at bottom-left, reads upward */}
        <h1
          className="font-black uppercase"
          style={{
            fontSize: "clamp(72px, 13.5vw, 210px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#ededf3",
            maxWidth: "44vw",
          }}
        >
          CLAY
          <br />
          TON
          <br />
          BOR
          <br />
          GES
        </h1>

        {/* Meta row below name */}
        <div className="mt-6 flex flex-col gap-2" style={{ maxWidth: "44vw" }}>
          <span
            className="font-mono uppercase"
            style={{ fontSize: "10px", letterSpacing: "0.26em", color: "rgba(255,255,255,0.32)" }}
          >
            Creative / Full-Stack Developer
          </span>
          <span
            className="font-mono uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.20em", color: "rgba(255,255,255,0.18)" }}
          >
            Brasília · Open to Relocation
          </span>
        </div>

        <div className="flex gap-4 mt-7 flex-wrap">
          <a
            href="mailto:claytonborgesdev@gmail.com"
            className="font-mono uppercase border transition-colors hover:border-white/50"
            style={{
              fontSize: "9px",
              letterSpacing: "0.18em",
              padding: "9px 18px",
              borderColor: "rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.58)",
            }}
          >
            Contact →
          </a>
          <a
            href="https://github.com/claytonbrgsdev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono uppercase border transition-colors hover:border-white/50"
            style={{
              fontSize: "9px",
              letterSpacing: "0.18em",
              padding: "9px 18px",
              borderColor: "rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.58)",
            }}
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* ─── ABOUT ─────────────────────────────────────────────────────────── */}
      <div
        ref={aboutRef}
        className="fixed inset-0 flex flex-col justify-center px-[5vw]"
        style={{ zIndex: 10, ...hidden }}
      >
        <span
          className="font-mono uppercase block mb-3"
          style={{ fontSize: "8px", letterSpacing: "0.30em", color: "rgba(255,255,255,0.20)" }}
        >
          About
        </span>

        <h2
          className="font-black uppercase"
          style={{
            fontSize: "clamp(52px, 9.5vw, 148px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.87,
            color: "#ededf3",
            maxWidth: "42vw",
          }}
        >
          3 YEARS.
          <br />
          SHIPPED.
        </h2>

        <p
          className="font-mono leading-loose mt-7"
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.42)",
            maxWidth: "36vw",
          }}
        >
          Production web apps, interactive 3D experiences, and creative developer tools
          for clients in Brazil and worldwide. Freelance through DISCLAYMER — co-run
          with Raphael Palmer.
        </p>

        {/* Work history as minimal table */}
        <div
          className="mt-7 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)", maxWidth: "36vw" }}
        >
          {(
            [
              ["2025 →", "Freelance Dev", "Evolut Digital"],
              ["2024 →", "Freelance Dev", "Moveo Filmes"],
              ["2023 →", "Co-founder",   "DISCLAYMER"],
            ] as const
          ).map(([period, role, client]) => (
            <div
              key={client}
              className="flex gap-4 py-2.5 border-b font-mono"
              style={{ fontSize: "9px", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <span style={{ color: "rgba(255,255,255,0.18)", width: "3.5rem", flexShrink: 0 }}>
                {period}
              </span>
              <span style={{ color: "rgba(255,255,255,0.36)", flexShrink: 0 }}>{role}</span>
              <span style={{ color: "rgba(255,255,255,0.18)" }}>{client}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SKILLS ────────────────────────────────────────────────────────── */}
      <div
        ref={skillsRef}
        className="fixed inset-0 flex flex-col justify-center px-[5vw]"
        style={{ zIndex: 10, ...hidden }}
      >
        <span
          className="font-mono uppercase block mb-3"
          style={{ fontSize: "8px", letterSpacing: "0.30em", color: "rgba(255,255,255,0.20)" }}
        >
          Stack
        </span>

        <h2
          className="font-black uppercase"
          style={{
            fontSize: "clamp(48px, 8vw, 122px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.89,
            color: "#ededf3",
            maxWidth: "42vw",
          }}
        >
          TOOLS
          <br />
          OF THE
          <br />
          TRADE
        </h2>

        {/* Skills as horizontal rule-divided list — compact, no chip borders */}
        <div
          className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5"
          style={{ maxWidth: "40vw" }}
        >
          {SKILL_GROUPS.map((g) => (
            <div key={g.label}>
              <span
                className="font-mono uppercase block mb-2"
                style={{ fontSize: "7px", letterSpacing: "0.24em", color: "rgba(255,255,255,0.24)" }}
              >
                {g.label}
              </span>
              <div className="flex flex-col gap-1">
                {g.skills.map((s) => (
                  <span
                    key={s}
                    className="font-mono"
                    style={{ fontSize: "10px", color: "rgba(255,255,255,0.50)" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PROJECTS ──────────────────────────────────────────────────────── */}
      <div
        ref={projectsRef}
        className="fixed inset-0 flex flex-col pt-7 px-[4vw] pb-5"
        style={{ zIndex: 10, ...hidden }}
      >
        <div className="mb-4 shrink-0">
          <span
            className="font-mono uppercase block mb-1.5"
            style={{ fontSize: "8px", letterSpacing: "0.30em", color: "rgba(255,255,255,0.20)" }}
          >
            Work
          </span>
          <h2
            className="font-black uppercase"
            style={{
              fontSize: "clamp(44px, 7.5vw, 108px)",
              letterSpacing: "-0.035em",
              lineHeight: 0.87,
              color: "#ededf3",
            }}
          >
            12 PROJECTS.
            <br />
            ALL REAL.
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pb-2">
            {PROJECTS.map((proj) => (
              <div
                key={proj.title}
                className="p-4 border transition-colors hover:border-white/22"
                style={{
                  borderColor: "rgba(255,255,255,0.09)",
                  background: "rgba(5,5,8,0.72)",
                }}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span
                    className="font-black uppercase leading-tight"
                    style={{ fontSize: "11px", color: "#ededf3" }}
                  >
                    {proj.title}
                  </span>
                  <span
                    className="font-mono ml-2 shrink-0"
                    style={{ fontSize: "8px", color: "rgba(255,255,255,0.20)" }}
                  >
                    {proj.year}
                  </span>
                </div>

                <p
                  className="font-mono leading-relaxed mb-2.5 line-clamp-3"
                  style={{ fontSize: "9px", color: "rgba(255,255,255,0.36)" }}
                >
                  {proj.desc}
                </p>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono border px-1.5 py-0.5"
                      style={{
                        fontSize: "7px",
                        borderColor: "rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.28)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  {proj.href && (
                    <a
                      href={proj.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono tracking-widest transition-opacity hover:opacity-100"
                      style={{ fontSize: "7px", color: "rgba(255,255,255,0.44)" }}
                    >
                      LIVE ↗
                    </a>
                  )}
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono tracking-widest transition-opacity hover:opacity-100"
                      style={{ fontSize: "7px", color: "rgba(255,255,255,0.44)" }}
                    >
                      CODE ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTACT ───────────────────────────────────────────────────────── */}
      <div
        ref={contactRef}
        className="fixed inset-0 flex flex-col justify-end pb-[9vh] items-end pr-[5vw]"
        style={{ zIndex: 10, ...hidden }}
      >
        <p
          className="font-mono uppercase mb-3"
          style={{ fontSize: "8px", letterSpacing: "0.30em", color: "rgba(255,255,255,0.20)" }}
        >
          Contact
        </p>

        <h2
          className="font-black uppercase text-right"
          style={{
            fontSize: "clamp(68px, 12vw, 185px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#ededf3",
            // Backdrop blur lets the heading pierce the wave field legibly
            textShadow:
              "0 0 60px rgba(5,5,8,0.9), 0 0 120px rgba(5,5,8,0.7)",
          }}
        >
          LET&apos;S
          <br />
          WORK.
        </h2>

        <a
          href="mailto:claytonborgesdev@gmail.com"
          className="font-mono uppercase block mt-8 transition-opacity hover:opacity-70"
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.60)",
          }}
        >
          claytonborgesdev@gmail.com →
        </a>

        <div className="flex gap-7 mt-5">
          {(
            [
              { label: "GitHub",    href: "https://github.com/claytonbrgsdev" },
              { label: "LinkedIn",  href: "https://linkedin.com/in/clayton-borges-web-dev" },
              { label: "Instagram", href: "https://instagram.com/azulbic_" },
            ] as const
          ).map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono uppercase transition-opacity hover:opacity-70"
              style={{ fontSize: "8px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.24)" }}
            >
              {l.label} ↗
            </a>
          ))}
        </div>

        <p
          className="font-mono mt-7"
          style={{ fontSize: "8px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.15)" }}
        >
          Available for freelance, remote roles, and relocation.
        </p>
      </div>

      {/* ─── SCROLL INDICATOR ──────────────────────────────────────────────── */}
      <div
        ref={scrollIndRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 10, opacity: 1 }}
      >
        <span
          className="font-mono uppercase"
          style={{ fontSize: "7px", letterSpacing: "0.42em", color: "rgba(255,255,255,0.14)" }}
        >
          scroll
        </span>
        <div className="h-7 w-px" style={{ background: "rgba(255,255,255,0.09)" }} />
      </div>

      {/* ─── FIELD READOUT (top-right corner) ──────────────────────────────── */}
      {/* Minimal oscilloscope-style data readout — adds to the "instrument" aesthetic */}
      <div
        className="fixed top-7 right-7 flex flex-col gap-1.5 pointer-events-none"
        style={{ zIndex: 10, opacity: 0.28 }}
      >
        <span className="font-mono" style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}>
          Ψ INTERFERENCE FIELD
        </span>
        <span className="font-mono" style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.10em" }}>
          n=6 harmonics · {N_LINES} lines
        </span>
        <span ref={readoutAmpRef} className="font-mono" style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.10em" }}>
          A=0.0%H
        </span>
      </div>
    </div>
  );
}
