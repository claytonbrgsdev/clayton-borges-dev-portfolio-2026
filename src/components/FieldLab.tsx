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
    desc: "3D car cover showroom with live customization. One rigged GLB per vehicle category (12+ types); Three.js applies fabric color, sewing line color, and customer-uploaded logo in real time.",
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
    desc: "Dashboard for Bittensor subnet 68 — on-chain AI drug-discovery network. Algorithms tab frontend/backend integration. Tracks molecular competitions, miner leaderboards, protein data.",
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
    desc: "Gamified agroforestry simulation funded by a FAC Brazilian Art & Culture grant, at the intersection of performing arts and technology.",
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

// 500 single-pixel particles in a compound-sine flow field.
// One fillRect decay + one batched beginPath/fill = <2ms/frame total.
const N_PARTICLES = 500;
const SCROLL_VH   = 500;
const DPR         = 0.5; // half-res canvas, CSS scales 2×

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface Particle { x: number; y: number; vx: number; vy: number; phase: number }

export function FieldLab() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const scrollRef    = useRef(0);
  const heroRef      = useRef<HTMLDivElement>(null);
  const aboutRef     = useRef<HTMLDivElement>(null);
  const skillsRef    = useRef<HTMLDivElement>(null);
  const projectsRef  = useRef<HTMLDivElement>(null);
  const contactRef   = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  const rs = useRef({ T: 0, particles: [] as Particle[], lastMs: 0 });

  // Scroll — ref only, no React state
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Canvas + imperative DOM
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let W = 0, H = 0, rafId = 0;
    const state = rs.current;

    const initParticles = () => {
      state.particles = Array.from({ length: N_PARTICLES }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    (Math.random() - 0.5) * 0.6,
        vy:    (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      W = Math.round(window.innerWidth  * DPR);
      H = Math.round(window.innerHeight * DPR);
      canvas.width  = W;
      canvas.height = H;
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, H);
      initParticles();
    };

    resize();
    window.addEventListener("resize", resize);

    const applyOverlay = (el: HTMLDivElement | null, alpha: number) => {
      if (!el) return;
      el.style.opacity       = alpha.toFixed(3);
      el.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
    };

    const draw = (nowMs: number) => {
      const sc = scrollRef.current;

      if (state.lastMs > 0) {
        // no adaptive iters needed — 500 particles is always <1ms
      }
      state.lastMs = nowMs;
      state.T += 0.0016;
      const T = state.T;

      // ── Decay — single semi-transparent fill, trivial at 50% DPR ──────────
      ctx.fillStyle = "rgba(5,5,8,0.016)";
      ctx.fillRect(0, 0, W, H);

      // ── Particles — all batched into one path ─────────────────────────────
      ctx.fillStyle = "rgba(228,228,242,0.75)";
      ctx.beginPath();

      for (let i = 0; i < N_PARTICLES; i++) {
        const p = state.particles[i];

        // Compound-sine flow field: organic, no library required
        const nx = p.x * 0.0045;
        const ny = p.y * 0.0045;
        const angle =
          Math.sin(nx + T * 0.55 + p.phase) * Math.cos(ny + T * 0.40) * Math.PI * 2 +
          Math.sin(nx * 2.3 - ny * 1.8 + T * 0.18 + p.phase * 0.6) * 1.8;

        p.vx = p.vx * 0.92 + Math.cos(angle) * 0.10;
        p.vy = p.vy * 0.92 + Math.sin(angle) * 0.10;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x += W; else if (p.x >= W) p.x -= W;
        if (p.y < 0) p.y += H; else if (p.y >= H) p.y -= H;

        ctx.rect(p.x | 0, p.y | 0, 1, 1);
      }

      ctx.fill();

      // ── Imperative DOM — zero React re-renders ────────────────────────────
      applyOverlay(heroRef.current,     secAlpha(sc, 0,    0.04, 0.17, 0.26));
      applyOverlay(aboutRef.current,    secAlpha(sc, 0.15, 0.22, 0.33, 0.42));
      applyOverlay(skillsRef.current,   secAlpha(sc, 0.37, 0.44, 0.53, 0.60));
      applyOverlay(projectsRef.current, secAlpha(sc, 0.54, 0.62, 0.73, 0.82));
      applyOverlay(contactRef.current,  secAlpha(sc, 0.77, 0.84, 0.93, 1.0));

      if (scrollIndRef.current) {
        scrollIndRef.current.style.opacity = Math.max(0, 1 - sc * 50).toFixed(3);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const halo = {
    textShadow: "0 0 40px rgba(5,5,8,0.98), 0 0 80px rgba(5,5,8,0.90)",
  };

  const hidden = { opacity: 0, pointerEvents: "none" as const, willChange: "opacity" } as const;

  return (
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      <div style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      {/* Canvas — half-res, pixelated so dots stay crisp */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          width: "100%", height: "100%",
          imageRendering: "pixelated",
        }}
      />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ zIndex: 10, ...hidden }}
      >
        {/* Role is the headline — name is secondary */}
        <h1
          className="font-black uppercase text-center"
          style={{
            fontSize: "clamp(52px, 8.8vw, 128px)",
            letterSpacing: "-0.03em",
            lineHeight: 0.88,
            color: "#ededf3",
            ...halo,
          }}
        >
          CREATIVE /
          <br />
          FULL-STACK
          <br />
          DEVELOPER
        </h1>

        <div
          className="mt-7 flex flex-col items-center gap-1"
          style={halo}
        >
          <span
            className="font-black uppercase tracking-widest"
            style={{ fontSize: "clamp(14px, 2vw, 24px)", color: "rgba(255,255,255,0.55)", letterSpacing: "0.22em" }}
          >
            CLAYTON BORGES
          </span>
          <span
            className="font-mono uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)" }}
          >
            Brasília · Open to Relocation
          </span>
        </div>

        <div className="flex gap-4 mt-9 flex-wrap justify-center" style={halo}>
          <a
            href="mailto:claytonborgesdev@gmail.com"
            className="font-mono uppercase border transition-colors hover:border-white/50"
            style={{
              fontSize: "9px", letterSpacing: "0.18em", padding: "9px 18px",
              borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.60)",
            }}
          >
            Contact →
          </a>
          <a
            href="https://github.com/claytonbrgsdev"
            target="_blank" rel="noopener noreferrer"
            className="font-mono uppercase border transition-colors hover:border-white/50"
            style={{
              fontSize: "9px", letterSpacing: "0.18em", padding: "9px 18px",
              borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.60)",
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
        <span className="font-mono uppercase block mb-4" style={{ fontSize: "8px", letterSpacing: "0.32em", color: "rgba(255,255,255,0.20)", ...halo }}>
          About
        </span>

        <h2
          className="font-black uppercase text-center"
          style={{ fontSize: "clamp(52px, 9vw, 132px)", letterSpacing: "-0.035em", lineHeight: 0.87, color: "#ededf3", ...halo }}
        >
          3 YEARS.
          <br />
          SHIPPED.
        </h2>

        <p className="font-mono text-center leading-loose mt-8 max-w-lg" style={{ fontSize: "11px", color: "rgba(255,255,255,0.42)", ...halo }}>
          Production web apps, interactive 3D experiences, and creative developer
          tools for clients in Brazil and worldwide.
          <br />
          Freelance through DISCLAYMER — co-run with Raphael Palmer.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3" style={halo}>
          {([
            ["2025 →", "Freelance Dev", "Evolut Digital"],
            ["2024 →", "Freelance Dev", "Moveo Filmes"],
            ["2023 →", "Co-founder",   "DISCLAYMER"],
          ] as const).map(([period, role, client]) => (
            <div key={client} className="flex gap-5 font-mono" style={{ fontSize: "9px" }}>
              <span style={{ color: "rgba(255,255,255,0.18)", width: "3.5rem", textAlign: "right" }}>{period}</span>
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
        <span className="font-mono uppercase block mb-4" style={{ fontSize: "8px", letterSpacing: "0.32em", color: "rgba(255,255,255,0.20)", ...halo }}>
          Stack
        </span>

        <h2
          className="font-black uppercase text-center"
          style={{ fontSize: "clamp(48px, 8.2vw, 120px)", letterSpacing: "-0.035em", lineHeight: 0.89, color: "#ededf3", ...halo }}
        >
          TOOLS
          <br />
          OF THE
          <br />
          TRADE
        </h2>

        <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 max-w-2xl" style={halo}>
          {SKILL_GROUPS.map((g) => (
            <div key={g.label} className="text-center">
              <span className="font-mono uppercase block mb-2" style={{ fontSize: "7px", letterSpacing: "0.24em", color: "rgba(255,255,255,0.24)" }}>
                {g.label}
              </span>
              <div className="flex flex-col gap-1.5">
                {g.skills.map((s) => (
                  <span key={s} className="font-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.50)" }}>
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
        <div className="mb-4 shrink-0 text-center" style={halo}>
          <span className="font-mono uppercase block mb-1.5" style={{ fontSize: "8px", letterSpacing: "0.32em", color: "rgba(255,255,255,0.20)" }}>
            Work
          </span>
          <h2
            className="font-black uppercase"
            style={{ fontSize: "clamp(40px, 7vw, 100px)", letterSpacing: "-0.035em", lineHeight: 0.87, color: "#ededf3" }}
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
                style={{ borderColor: "rgba(255,255,255,0.09)", background: "rgba(5,5,8,0.72)" }}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-black uppercase leading-tight" style={{ fontSize: "11px", color: "#ededf3" }}>
                    {proj.title}
                  </span>
                  <span className="font-mono ml-2 shrink-0" style={{ fontSize: "8px", color: "rgba(255,255,255,0.20)" }}>
                    {proj.year}
                  </span>
                </div>

                <p className="font-mono leading-relaxed mb-2.5 line-clamp-3" style={{ fontSize: "9px", color: "rgba(255,255,255,0.36)" }}>
                  {proj.desc}
                </p>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {proj.tags.map((t) => (
                    <span key={t} className="font-mono border px-1.5 py-0.5" style={{ fontSize: "7px", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.28)" }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  {proj.href && (
                    <a href={proj.href} target="_blank" rel="noopener noreferrer"
                      className="font-mono tracking-widest transition-opacity hover:opacity-100"
                      style={{ fontSize: "7px", color: "rgba(255,255,255,0.44)" }}>
                      LIVE ↗
                    </a>
                  )}
                  {proj.github && (
                    <a href={proj.github} target="_blank" rel="noopener noreferrer"
                      className="font-mono tracking-widest transition-opacity hover:opacity-100"
                      style={{ fontSize: "7px", color: "rgba(255,255,255,0.44)" }}>
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
        <span className="font-mono uppercase block mb-4" style={{ fontSize: "8px", letterSpacing: "0.32em", color: "rgba(255,255,255,0.20)", ...halo }}>
          Contact
        </span>

        <h2
          className="font-black uppercase text-center"
          style={{ fontSize: "clamp(68px, 12vw, 180px)", letterSpacing: "-0.04em", lineHeight: 0.87, color: "#ededf3", ...halo }}
        >
          LET&apos;S
          <br />
          WORK.
        </h2>

        <a
          href="mailto:claytonborgesdev@gmail.com"
          className="font-mono uppercase block mt-10 transition-opacity hover:opacity-70"
          style={{ fontSize: "12px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.62)", ...halo }}
        >
          claytonborgesdev@gmail.com →
        </a>

        <div className="flex gap-8 mt-6" style={halo}>
          {([
            { label: "GitHub",    href: "https://github.com/claytonbrgsdev" },
            { label: "LinkedIn",  href: "https://linkedin.com/in/clayton-borges-web-dev" },
            { label: "Instagram", href: "https://instagram.com/azulbic_" },
          ] as const).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="font-mono uppercase transition-opacity hover:opacity-70"
              style={{ fontSize: "8px", letterSpacing: "0.24em", color: "rgba(255,255,255,0.24)" }}>
              {l.label} ↗
            </a>
          ))}
        </div>

        <p className="font-mono mt-8" style={{ fontSize: "8px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.15)", ...halo }}>
          Available for freelance, remote roles, and relocation.
        </p>
      </div>

      {/* ─── SCROLL INDICATOR ──────────────────────────────────────────────── */}
      <div
        ref={scrollIndRef}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 10, opacity: 1 }}
      >
        <span className="font-mono uppercase" style={{ fontSize: "7px", letterSpacing: "0.44em", color: "rgba(255,255,255,0.14)" }}>
          scroll
        </span>
        <div className="h-7 w-px" style={{ background: "rgba(255,255,255,0.09)" }} />
      </div>
    </div>
  );
}
