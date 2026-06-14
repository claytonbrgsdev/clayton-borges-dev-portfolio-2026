"use client";

import { useEffect, useRef } from "react";

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

// ─── ATTRACTOR FORMS ──────────────────────────────────────────────────────────

interface AttractorForm {
  a: number; b: number; c: number; d: number;
  label: string;
}

const FORMS: AttractorForm[] = [
  { a:  2.01, b: -2.53, c:  1.61, d: -0.33, label: "GENESIS"    },
  { a: -2.24, b:  0.43, c: -0.65, d: -2.43, label: "STRUCTURE"  },
  { a:  2.88, b: -0.77, c: -0.97, d:  0.74, label: "COMPLEXITY" },
  { a: -1.60, b:  1.65, c:  2.10, d: -0.74, label: "NETWORK"    },
  { a:  1.25, b: -1.25, c: -1.77, d: -1.25, label: "UNITY"      },
];

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

function lerpForm(fA: AttractorForm, fB: AttractorForm, t: number): [number, number, number, number] {
  return [
    fA.a + (fB.a - fA.a) * t,
    fA.b + (fB.b - fA.b) * t,
    fA.c + (fB.c - fA.c) * t,
    fA.d + (fB.d - fA.d) * t,
  ];
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BASE_ITERS      = 2_000;
const DECAY_ALPHA     = 0.015;
const DECAY_FILL      = `rgba(5, 5, 8, ${0.015})`; // precomputed — avoids string alloc + CSS parse every frame
const SCROLL_VH       = 500;
const ATTRACTOR_SCALE = 5.0;
const DPR             = 0.5;  // render at half resolution; CSS scales 2× — 4× fewer pixels per frame

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function BecomingLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);

  // Section refs — opacity driven imperatively in rAF, never via React state.
  // This eliminates re-renders entirely during scroll + canvas draw.
  const heroRef      = useRef<HTMLDivElement>(null);
  const aboutRef     = useRef<HTMLDivElement>(null);
  const skillsRef    = useRef<HTMLDivElement>(null);
  const projectsRef  = useRef<HTMLDivElement>(null);
  const contactRef   = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);

  const renderState = useRef({
    ax: 0.12, ay: -0.08,
    T: 0,
    iters: BASE_ITERS,
    lastMs: 0,
    a: FORMS[0].a, b: FORMS[0].b, c: FORMS[0].c, d: FORMS[0].d,
    formPhase: 0,
  });

  // Scroll tracker — mutates ref only, zero React state updates
  useEffect(() => {
    const handler = () => {
      const maxS = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = maxS > 0 ? Math.max(0, Math.min(1, window.scrollY / maxS)) : 0;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Canvas render loop + imperative section visibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let rafId = 0;

    // Pixel buffer — all drawing goes here; one putImageData per frame.
    // Avoids canvas path API overhead and GPU-blend fillRect entirely.
    let imageData = ctx.createImageData(1, 1);
    let buf: Uint8ClampedArray = imageData.data;

    // Per-channel decay look-up tables: buf[i] → decayed value toward bg.
    // Replaces per-pixel float multiply-add with a single array read.
    const decayR = new Uint8ClampedArray(256);
    const decayG = new Uint8ClampedArray(256);
    const decayB = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) {
      const f = 1 - DECAY_ALPHA;
      decayR[i] = (i * f + 5 * DECAY_ALPHA + 0.5) | 0;
      decayG[i] = (i * f + 5 * DECAY_ALPHA + 0.5) | 0;
      decayB[i] = (i * f + 8 * DECAY_ALPHA + 0.5) | 0;
    }

    const resize = () => {
      W = Math.round(window.innerWidth  * DPR);
      H = Math.round(window.innerHeight * DPR);
      canvas.width  = W;
      canvas.height = H;
      imageData = ctx.createImageData(W, H);
      buf = imageData.data;
      for (let i = 0; i < buf.length; i += 4) {
        buf[i] = 5; buf[i + 1] = 5; buf[i + 2] = 8; buf[i + 3] = 255;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const applyOverlay = (el: HTMLDivElement | null, alpha: number) => {
      if (!el) return;
      el.style.opacity       = alpha.toFixed(3);
      el.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
    };

    const draw = (nowMs: number) => {
      const rs = renderState.current;
      const sc = scrollRef.current;

      // Adaptive iteration count
      if (rs.lastMs > 0) {
        const dt = nowMs - rs.lastMs;
        if (dt > 18 && rs.iters > 800)   rs.iters -= 200;
        if (dt < 13 && rs.iters < 4_000) rs.iters += 200;
      }
      rs.lastMs = nowMs;
      rs.T += 0.0022;

      // Attractor parameter morph
      const scrollPhase = sc * (FORMS.length - 1);
      const breathe     = Math.sin(rs.T * 0.048) * 0.12;
      const phase       = Math.max(0, Math.min(FORMS.length - 1.001, scrollPhase + breathe));
      rs.formPhase      = phase;

      const fi = Math.floor(phase);
      const ft = phase - fi;
      const ts = ft * ft * (3 - 2 * ft);
      const fA = FORMS[fi];
      const fB = FORMS[Math.min(FORMS.length - 1, fi + 1)];
      const [a, b, c, d] = lerpForm(fA, fB, ts);

      // ── Decay: LUT lookup per pixel, no float ops, no GPU blend ──────────
      const len = buf.length;
      for (let i = 0; i < len; i += 4) {
        buf[i]     = decayR[buf[i]];
        buf[i + 1] = decayG[buf[i + 1]];
        buf[i + 2] = decayB[buf[i + 2]];
        // buf[i+3] = 255, never changes
      }

      // ── Attractor: direct pixel writes, no canvas path API ───────────────
      let ax = rs.ax, ay = rs.ay;
      const offX  = W * 0.5;
      const offY  = H * 0.5;
      const iters = rs.iters;

      for (let i = 0; i < iters; i++) {
        const nx = Math.sin(a * ay) - Math.cos(b * ax);
        const ny = Math.sin(c * ax) - Math.cos(d * ay);
        ax = nx;
        ay = ny;

        if (ax !== ax || ay !== ay || ax > 4 || ax < -4 || ay > 4 || ay < -4) {
          ax = (Math.random() - 0.5) * 0.4;
          ay = (Math.random() - 0.5) * 0.4;
          continue;
        }

        const px = (ax / ATTRACTOR_SCALE * W + offX) | 0;
        const py = (ay / ATTRACTOR_SCALE * H + offY) | 0;
        if (px < 0 || px >= W || py < 0 || py >= H) continue;

        const idx = (py * W + px) << 2;
        const r = buf[idx]     + 55; buf[idx]     = r > 255 ? 255 : r;
        const g = buf[idx + 1] + 55; buf[idx + 1] = g > 255 ? 255 : g;
        const b2= buf[idx + 2] + 63; buf[idx + 2] = b2 > 255 ? 255 : b2;
      }

      ctx.putImageData(imageData, 0, 0);
      rs.ax = ax;
      rs.ay = ay;

      // ── Imperative DOM updates — same frame as canvas, zero React re-renders ──
      applyOverlay(heroRef.current,     secAlpha(sc, 0,    0.04, 0.17, 0.26));
      applyOverlay(aboutRef.current,    secAlpha(sc, 0.15, 0.22, 0.33, 0.42));
      applyOverlay(skillsRef.current,   secAlpha(sc, 0.37, 0.44, 0.53, 0.60));
      applyOverlay(projectsRef.current, secAlpha(sc, 0.54, 0.62, 0.73, 0.82));
      applyOverlay(contactRef.current,  secAlpha(sc, 0.77, 0.84, 0.93, 1.0));

      if (scrollIndRef.current) {
        scrollIndRef.current.style.opacity = Math.max(0, 1 - sc * 50).toFixed(3);
      }

      // Stage name brightnesses
      if (stageRef.current) {
        const spans = stageRef.current.children;
        for (let i = 0; i < spans.length; i++) {
          const dist       = Math.abs(i - rs.formPhase);
          const brightness = Math.max(0.12, 0.55 - dist * 0.22);
          (spans[i] as HTMLElement).style.color = `rgba(255,255,255,${brightness.toFixed(2)})`;
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const textHalo = {
    textShadow: "0 0 48px rgba(5,5,8,0.98), 0 0 96px rgba(5,5,8,0.92), 0 0 180px rgba(5,5,8,0.80)",
  };

  const hidden = { opacity: 0, pointerEvents: "none" as const, willChange: "opacity" } as const;

  return (
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      {/* Scroll height provider */}
      <div style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      {/* Canvas — rendered at 50% resolution, CSS scales 2×; imageRendering keeps dots crisp */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, width: "100%", height: "100%", imageRendering: "pixelated" }}
      />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 10, ...hidden }}
      >
        <span
          className="font-mono uppercase block mb-8"
          style={{
            fontSize: "9px",
            letterSpacing: "0.42em",
            color: "rgba(255,255,255,0.22)",
            ...textHalo,
          }}
        >
          The Eternal Becoming
        </span>

        <h1
          className="font-black uppercase text-center"
          style={{
            fontSize: "clamp(80px, 15.5vw, 230px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#ededf3",
            ...textHalo,
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

        <div className="mt-8 flex flex-col items-center gap-1.5" style={textHalo}>
          <span
            className="font-mono uppercase"
            style={{ fontSize: "10px", letterSpacing: "0.26em", color: "rgba(255,255,255,0.30)" }}
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

        <div className="flex gap-5 mt-9 flex-wrap justify-center" style={textHalo}>
          <a
            href="mailto:claytonborgesdev@gmail.com"
            className="font-mono uppercase border transition-colors hover:border-white/50"
            style={{
              fontSize: "9px",
              letterSpacing: "0.18em",
              padding: "9px 18px",
              borderColor: "rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.60)",
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
              borderColor: "rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.60)",
            }}
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* ─── ABOUT ─────────────────────────────────────────────────────────── */}
      <div
        ref={aboutRef}
        className="fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ zIndex: 10, ...hidden }}
      >
        <span
          className="font-mono uppercase block mb-4"
          style={{
            fontSize: "8px",
            letterSpacing: "0.32em",
            color: "rgba(255,255,255,0.20)",
            ...textHalo,
          }}
        >
          About
        </span>

        <h2
          className="font-black uppercase text-center"
          style={{
            fontSize: "clamp(52px, 10vw, 155px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.87,
            color: "#ededf3",
            ...textHalo,
          }}
        >
          3 YEARS.
          <br />
          SHIPPED.
        </h2>

        <p
          className="font-mono text-center leading-loose mt-8 max-w-lg"
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.42)",
            ...textHalo,
          }}
        >
          Production web apps, interactive 3D experiences, and creative developer
          tools for clients in Brazil and worldwide.
          <br />
          Freelance through DISCLAYMER — co-run with Raphael Palmer.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3" style={textHalo}>
          {(
            [
              ["2025 →", "Freelance Dev", "Evolut Digital"],
              ["2024 →", "Freelance Dev", "Moveo Filmes"],
              ["2023 →", "Co-founder",   "DISCLAYMER"],
            ] as const
          ).map(([period, role, client]) => (
            <div key={client} className="flex gap-5 font-mono" style={{ fontSize: "9px" }}>
              <span style={{ color: "rgba(255,255,255,0.18)", width: "3.5rem", textAlign: "right" }}>
                {period}
              </span>
              <span style={{ color: "rgba(255,255,255,0.36)" }}>{role}</span>
              <span style={{ color: "rgba(255,255,255,0.20)" }}>{client}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SKILLS ────────────────────────────────────────────────────────── */}
      <div
        ref={skillsRef}
        className="fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ zIndex: 10, ...hidden }}
      >
        <span
          className="font-mono uppercase block mb-4"
          style={{
            fontSize: "8px",
            letterSpacing: "0.32em",
            color: "rgba(255,255,255,0.20)",
            ...textHalo,
          }}
        >
          Stack
        </span>

        <h2
          className="font-black uppercase text-center"
          style={{
            fontSize: "clamp(48px, 8.5vw, 128px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.89,
            color: "#ededf3",
            ...textHalo,
          }}
        >
          TOOLS
          <br />
          OF THE
          <br />
          TRADE
        </h2>

        <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 max-w-2xl" style={textHalo}>
          {SKILL_GROUPS.map((g) => (
            <div key={g.label} className="text-center">
              <span
                className="font-mono uppercase block mb-2"
                style={{ fontSize: "7px", letterSpacing: "0.24em", color: "rgba(255,255,255,0.24)" }}
              >
                {g.label}
              </span>
              <div className="flex flex-col gap-1.5">
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
        <div className="mb-4 shrink-0 text-center" style={textHalo}>
          <span
            className="font-mono uppercase block mb-1.5"
            style={{ fontSize: "8px", letterSpacing: "0.32em", color: "rgba(255,255,255,0.20)" }}
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
                  background: "rgba(5,5,8,0.76)",
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
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 10, ...hidden }}
      >
        <span
          className="font-mono uppercase block mb-4"
          style={{
            fontSize: "8px",
            letterSpacing: "0.32em",
            color: "rgba(255,255,255,0.20)",
            ...textHalo,
          }}
        >
          Contact
        </span>

        <h2
          className="font-black uppercase text-center"
          style={{
            fontSize: "clamp(72px, 13vw, 196px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#ededf3",
            ...textHalo,
          }}
        >
          LET&apos;S
          <br />
          WORK.
        </h2>

        <a
          href="mailto:claytonborgesdev@gmail.com"
          className="font-mono uppercase block mt-10 transition-opacity hover:opacity-70"
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.62)",
            ...textHalo,
          }}
        >
          claytonborgesdev@gmail.com →
        </a>

        <div className="flex gap-8 mt-6" style={textHalo}>
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
              style={{ fontSize: "8px", letterSpacing: "0.24em", color: "rgba(255,255,255,0.24)" }}
            >
              {l.label} ↗
            </a>
          ))}
        </div>

        <p
          className="font-mono mt-8"
          style={{
            fontSize: "8px",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.15)",
            ...textHalo,
          }}
        >
          Available for freelance, remote roles, and relocation.
        </p>
      </div>

      {/* ─── STAGE NAME INDICATOR ──────────────────────────────────────────── */}
      <div
        ref={stageRef}
        className="fixed bottom-7 left-1/2 -translate-x-1/2 flex gap-5 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {FORMS.map((f) => (
          <span
            key={f.label}
            className="font-mono uppercase"
            style={{
              fontSize: "7px",
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.12)",
            }}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* ─── SCROLL INDICATOR ──────────────────────────────────────────────── */}
      <div
        ref={scrollIndRef}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 10, opacity: 1 }}
      >
        <span
          className="font-mono uppercase"
          style={{ fontSize: "7px", letterSpacing: "0.44em", color: "rgba(255,255,255,0.14)" }}
        >
          scroll
        </span>
        <div className="h-7 w-px" style={{ background: "rgba(255,255,255,0.09)" }} />
      </div>
    </div>
  );
}
