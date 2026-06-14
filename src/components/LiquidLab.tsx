"use client";

import { useEffect, useRef, useState } from "react";
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
    desc: "Scroll-animated site for a film production company. Full catalog, Instagram feed integration, TipTap CMS, dnd-kit drag ordering, admin panel, Supabase RLS auth. GSAP ScrollTrigger-driven UX throughout.",
    tags: ["Next.js 16", "GSAP", "Supabase", "TipTap"],
  },
  {
    title: "Metanova Labs",
    year: "2025",
    desc: "Dashboard for Bittensor subnet 68 — an on-chain AI drug-discovery network. Algorithms tab frontend/backend integration. Tracks molecular competitions, miner leaderboards, and protein data across epochs.",
    tags: ["Next.js 15", "Bittensor", "TypeScript", "Radix UI"],
    href: "https://metanovalabs.ai/dashboard",
  },
  {
    title: "DSRPTV Records",
    year: "2023",
    desc: "Music e-commerce and streaming platform. Stripe + Mercado Pago dual checkout, Spotify API, AWS S3 asset storage, Three.js visuals. Built with Raphael Palmer (DISCLAYMER).",
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
    desc: "Real-time PT↔EN Slack translation via WebSocket + AI, built in Ruby. Job interview challenge — sole candidate to deliver within the stipulated timeframe.",
    tags: ["Ruby", "WebSocket", "OpenAI API"],
    github:
      "https://github.com/claytonbrgsdev/slack-translator_websocket-version",
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
  {
    label: "Frontend",
    skills: ["React 19", "Next.js 16", "TypeScript", "Three.js", "GSAP", "Tailwind"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "FastAPI", "Python", "Ruby", "REST / GraphQL", "WebSocket"],
  },
  {
    label: "Data & Cloud",
    skills: ["PostgreSQL", "Prisma", "Supabase", "Redis", "Docker", "AWS S3"],
  },
  {
    label: "Creative",
    skills: ["Web Audio API", "React Three Fiber", "PySide6", "FFmpeg", "OpenAI"],
  },
] as const;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function secAlpha(
  p: number,
  inS: number,
  inE: number,
  outS: number,
  outE: number
): number {
  if (p <= inS || p >= outE) return 0;
  if (p < inE) return smoothstep(inS, inE, p);
  if (p > outS) return 1 - smoothstep(outS, outE, p);
  return 1;
}

// ─── SKETCH ───────────────────────────────────────────────────────────────────

const N_PARTICLES = 2200;

// Golden ratio — drives non-repeating orbital spacing
const PHI = 1.6180339887;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Noise space offsets (unique per particle)
  nx: number;
  ny: number;
  // Orbit state
  orbitR: number; // initial distance from center
  orbitA: number; // current orbit angle
  orbitSpeed: number; // angular velocity
  // Visual
  sz: number; // base point size (radius)
  baseAlpha: number;
  // 0 = nebula (outer, large, dim), 1 = matter (mid), 2 = core (inner, small, bright)
  layer: 0 | 1 | 2;
}

function buildSketch(containerEl: HTMLElement, scrollRef: React.MutableRefObject<number>) {
  return import("p5").then(({ default: P5 }) => {
    let inst: p5Type | null = null;

    const sketch = (p: p5Type) => {
      const pts: Particle[] = [];
      let W = 0;
      let H = 0;
      let T = 0; // running time for noise / breath

      p.setup = () => {
        W = window.innerWidth;
        H = window.innerHeight;
        const cnv = p.createCanvas(W, H);
        (cnv as unknown as { style(prop: string, val: string): void }).style(
          "display",
          "block"
        );
        p.colorMode(p.RGB);

        for (let i = 0; i < N_PARTICLES; i++) {
          const layer: 0 | 1 | 2 =
            i < N_PARTICLES * 0.50 ? 0 : i < N_PARTICLES * 0.82 ? 1 : 2;

          let x: number, y: number;

          if (layer === 0) {
            // Nebula — distributed across whole canvas
            x = p.random(W);
            y = p.random(H);
          } else {
            // Matter & core — seeded along golden-angle spiral around center
            const goldenA = i * PHI * Math.PI * 2;
            const r =
              layer === 1
                ? p.random(55, Math.min(W, H) * 0.40)
                : p.random(8, 72);
            x = W / 2 + Math.cos(goldenA) * r;
            y = H / 2 + Math.sin(goldenA) * r;
          }

          const dx = x - W / 2;
          const dy = y - H / 2;

          // Alternating orbit direction, speed scaled by golden ratio harmonics
          const dir = i % 2 === 0 ? 1 : -1;
          const speed = dir * (0.003 + (i % 7) * PHI * 0.0004);

          pts.push({
            x,
            y,
            vx: p.random(-0.28, 0.28),
            vy: p.random(-0.28, 0.28),
            nx: p.random(3000),
            ny: p.random(3000),
            orbitR: Math.hypot(dx, dy),
            orbitA: Math.atan2(dy, dx),
            orbitSpeed: speed,
            sz:
              layer === 0
                ? p.random(3, 11)
                : layer === 1
                ? p.random(0.9, 3.2)
                : p.random(0.4, 1.4),
            baseAlpha:
              layer === 0
                ? p.random(6, 20)
                : layer === 1
                ? p.random(32, 82)
                : p.random(120, 250),
            layer,
          });
        }
      };

      p.draw = () => {
        T += 0.004;
        const sc = scrollRef.current;
        const cx = W / 2;
        const cy = H / 2;

        // Trailing ghost — shorter trail as matter condenses (more defined streaks)
        const trailAlpha = 16 + sc * 38;
        p.fill(5, 5, 8, trailAlpha);
        p.noStroke();
        p.rect(0, 0, W, H);

        // Phase curve weights
        const condense    = smoothstep(0.04, 0.34, sc); // flow → gravity
        const crystallize = smoothstep(0.30, 0.62, sc); // gravity → orbit
        const singular    = smoothstep(0.76, 0.97, sc); // orbit → collapse

        for (const pt of pts) {
          let ax = 0;
          let ay = 0;

          // ① Perlin flow field (dissipates as condensation grows)
          const flowStr = (1 - condense) * 0.13;
          if (flowStr > 0.005) {
            const ns = 0.00195;
            const fa =
              p.noise(
                pt.x * ns + pt.nx * 0.001,
                pt.y * ns + pt.ny * 0.001,
                T * 0.30
              ) *
              Math.PI *
              7.2;
            ax += Math.cos(fa) * flowStr;
            ay += Math.sin(fa) * flowStr;
          }

          // ② Gravity condensation — matter falls toward the center
          if (condense > 0.01) {
            const gs = condense * 0.0021;
            ax += (cx - pt.x) * gs;
            ay += (cy - pt.y) * gs;
          }

          // ③ Orbital crystallization — particles lock into golden-ratio orbits
          if (crystallize > 0.01) {
            pt.orbitA += pt.orbitSpeed * (1 + crystallize * 1.7);
            const r = Math.max(5, pt.orbitR * 0.37 * (1 - singular * 0.91));
            const tx = cx + Math.cos(pt.orbitA) * r;
            const ty = cy + Math.sin(pt.orbitA) * r;
            const os = crystallize * 0.043;
            ax += (tx - pt.x) * os;
            ay += (ty - pt.y) * os;
          }

          // ④ Singularity — all matter collapses to the origin
          if (singular > 0.01) {
            ax += (cx - pt.x) * singular * 0.13;
            ay += (cy - pt.y) * singular * 0.13;
          }

          // ⑤ Cosmological breath — gentle sinusoidal pulse throughout
          const breathAmp = 0.0055 * (1 - sc * 0.55);
          const breath = Math.sin(T * 0.62 + pt.orbitA * 0.5) * breathAmp;
          ax += (cx - pt.x) * breath;
          ay += (cy - pt.y) * breath;

          // ⑥ Cursor disturbance — esoteric touch
          const mdx = pt.x - p.mouseX;
          const mdy = pt.y - p.mouseY;
          const md2 = mdx * mdx + mdy * mdy;
          if (md2 < 9800 && md2 > 0.5) {
            const mf = (1 - md2 / 9800) * 1.7;
            const md = Math.sqrt(md2);
            ax += (mdx / md) * mf;
            ay += (mdy / md) * mf;
          }

          // Integrate
          pt.vx = (pt.vx + ax) * 0.963;
          pt.vy = (pt.vy + ay) * 0.963;
          pt.x += pt.vx;
          pt.y += pt.vy;

          // Torus topology — particles re-enter from opposite edge
          if (pt.x < -28) pt.x = W + 28;
          else if (pt.x > W + 28) pt.x = -28;
          if (pt.y < -28) pt.y = H + 28;
          else if (pt.y > H + 28) pt.y = -28;

          // Size: diffuse blobs → crisp specks
          const szFinal = Math.max(0.3, pt.sz * (1 - sc * 0.70));

          // Alpha: nebula dims then blooms, matter/core steady
          let aFinal: number;
          if (pt.layer === 0) {
            aFinal = pt.baseAlpha * (1 + sc * 2.6);
          } else if (pt.layer === 1) {
            aFinal = pt.baseAlpha * (1 + sc * 0.30);
          } else {
            aFinal = pt.baseAlpha * (1 - sc * 0.18);
          }
          aFinal = Math.min(255, Math.max(0, aFinal));

          p.noStroke();

          // Core layer: soft glow halo (double-draw)
          if (pt.layer === 2 && sc > 0.25) {
            const haloA = aFinal * 0.12 * (sc - 0.25) * 4;
            p.fill(230, 230, 242, haloA);
            p.circle(pt.x, pt.y, szFinal * 9);
          }

          p.fill(238, 238, 246, aFinal);
          p.circle(pt.x, pt.y, szFinal * 2);
        }
      };

      p.windowResized = () => {
        W = window.innerWidth;
        H = window.innerHeight;
        p.resizeCanvas(W, H);
      };
    };

    inst = new P5(sketch, containerEl);
    return inst;
  });
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const SCROLL_VH = 500;

export function LiquidLab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [sp, setSp] = useState(0);

  // Scroll tracker
  useEffect(() => {
    const handler = () => {
      const maxS = document.body.scrollHeight - window.innerHeight;
      const val =
        maxS > 0 ? Math.max(0, Math.min(1, window.scrollY / maxS)) : 0;
      scrollRef.current = val;
      setSp(val);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // p5 lifecycle
  useEffect(() => {
    if (!containerRef.current) return;
    let inst: p5Type | null = null;
    let alive = true;

    buildSketch(containerRef.current, scrollRef).then((p5inst) => {
      if (!alive) {
        p5inst.remove();
        return;
      }
      inst = p5inst;
    });

    return () => {
      alive = false;
      inst?.remove();
    };
  }, []);

  // Typography overlay — section alpha values
  const heroA     = secAlpha(sp, 0,    0.04, 0.17, 0.26);
  const aboutA    = secAlpha(sp, 0.15, 0.22, 0.33, 0.42);
  const skillsA   = secAlpha(sp, 0.37, 0.44, 0.53, 0.60);
  const projectsA = secAlpha(sp, 0.54, 0.62, 0.73, 0.82);
  const contactA  = secAlpha(sp, 0.77, 0.84, 0.93, 1.0);

  const overlay = (a: number) => ({
    opacity: a,
    pointerEvents: a > 0.05 ? ("auto" as const) : ("none" as const),
  });

  return (
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      {/* Scroll height provider */}
      <div style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      {/* p5 canvas container — p5 appends its canvas here */}
      <div
        ref={containerRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}
      />

      {/* Radial vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, transparent 36%, rgba(5,5,8,0.52) 66%, rgba(5,5,8,0.93) 100%)",
        }}
      />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 flex flex-col justify-center px-[5vw]"
        style={{ zIndex: 10, ...overlay(heroA) }}
      >
        <span
          className="font-mono uppercase block mb-5"
          style={{
            fontSize: "10px",
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          Creative / Full-Stack Developer
        </span>

        <h1
          className="font-black uppercase"
          style={{
            fontSize: "clamp(88px, 17vw, 252px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#ededf3",
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

        <span
          className="font-mono uppercase block mt-7"
          style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          Brasília · Open to Relocation
        </span>

        <div className="flex gap-5 mt-8 flex-wrap">
          <a
            href="mailto:claytonborgesdev@gmail.com"
            className="font-mono uppercase border transition-colors hover:border-white/55"
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              padding: "10px 20px",
              borderColor: "rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.62)",
            }}
          >
            Contact →
          </a>
          <a
            href="https://github.com/claytonbrgsdev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono uppercase border transition-colors hover:border-white/55"
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              padding: "10px 20px",
              borderColor: "rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.62)",
            }}
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* ─── ABOUT ────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 flex flex-col justify-center px-[5vw]"
        style={{ zIndex: 10, ...overlay(aboutA) }}
      >
        <span
          className="font-mono uppercase block mb-4"
          style={{
            fontSize: "9px",
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          About
        </span>

        <h2
          className="font-black uppercase"
          style={{
            fontSize: "clamp(60px, 11vw, 172px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.87,
            color: "#ededf3",
          }}
        >
          3 YEARS.
          <br />
          SHIPPED.
        </h2>

        <p
          className="font-mono leading-loose mt-8 max-w-md"
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.44)",
          }}
        >
          3 years building production web apps, interactive 3D experiences,
          <br />
          and creative developer tools for clients in Brazil and worldwide.
          <br />
          Freelance through DISCLAYMER — co-run with Raphael Palmer.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          {(
            [
              ["2025 →", "Freelance Dev", "Evolut Digital"],
              ["2024 →", "Freelance Dev", "Moveo Filmes"],
              ["2023 →", "Co-founder", "DISCLAYMER"],
            ] as const
          ).map(([period, role, client]) => (
            <div
              key={client}
              className="flex gap-5 font-mono"
              style={{ fontSize: "9px" }}
            >
              <span style={{ color: "rgba(255,255,255,0.20)", width: "3.8rem" }}>
                {period}
              </span>
              <span style={{ color: "rgba(255,255,255,0.38)" }}>{role}</span>
              <span style={{ color: "rgba(255,255,255,0.20)" }}>{client}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SKILLS ───────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 flex flex-col justify-center px-[5vw]"
        style={{ zIndex: 10, ...overlay(skillsA) }}
      >
        <span
          className="font-mono uppercase block mb-4"
          style={{
            fontSize: "9px",
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          Stack
        </span>

        <h2
          className="font-black uppercase"
          style={{
            fontSize: "clamp(56px, 9.5vw, 142px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.9,
            color: "#ededf3",
          }}
        >
          TOOLS
          <br />
          OF THE
          <br />
          TRADE
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-3xl">
          {SKILL_GROUPS.map((g) => (
            <div key={g.label}>
              <span
                className="font-mono uppercase block mb-3"
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.26)",
                }}
              >
                {g.label}
              </span>
              <div className="flex flex-col gap-1.5">
                {g.skills.map((s) => (
                  <span
                    key={s}
                    className="font-mono"
                    style={{ fontSize: "10px", color: "rgba(255,255,255,0.52)" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PROJECTS ─────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 flex flex-col pt-8 px-[4vw] pb-6"
        style={{ zIndex: 10, ...overlay(projectsA) }}
      >
        <div className="mb-4 shrink-0">
          <span
            className="font-mono uppercase block mb-2"
            style={{
              fontSize: "9px",
              letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.22)",
            }}
          >
            Work
          </span>
          <h2
            className="font-black uppercase"
            style={{
              fontSize: "clamp(50px, 8.5vw, 118px)",
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

        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pb-2">
            {PROJECTS.map((proj) => (
              <div
                key={proj.title}
                className="p-4 border transition-colors hover:border-white/25"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  background: "rgba(5,5,8,0.68)",
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="font-black uppercase leading-tight"
                    style={{ fontSize: "12px", color: "#ededf3" }}
                  >
                    {proj.title}
                  </span>
                  <span
                    className="font-mono ml-2 shrink-0"
                    style={{ fontSize: "8px", color: "rgba(255,255,255,0.22)" }}
                  >
                    {proj.year}
                  </span>
                </div>

                <p
                  className="font-mono leading-relaxed mb-3 line-clamp-3"
                  style={{ fontSize: "10px", color: "rgba(255,255,255,0.38)" }}
                >
                  {proj.desc}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono border px-1.5 py-0.5"
                      style={{
                        fontSize: "8px",
                        borderColor: "rgba(255,255,255,0.13)",
                        color: "rgba(255,255,255,0.30)",
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
                      style={{ fontSize: "8px", color: "rgba(255,255,255,0.46)" }}
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
                      style={{ fontSize: "8px", color: "rgba(255,255,255,0.46)" }}
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

      {/* ─── CONTACT ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 flex flex-col justify-center px-[5vw]"
        style={{ zIndex: 10, ...overlay(contactA) }}
      >
        <span
          className="font-mono uppercase block mb-4"
          style={{
            fontSize: "9px",
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          Contact
        </span>

        <h2
          className="font-black uppercase"
          style={{
            fontSize: "clamp(80px, 14vw, 205px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#ededf3",
          }}
        >
          LET&apos;S
          <br />
          WORK.
        </h2>

        <a
          href="mailto:claytonborgesdev@gmail.com"
          className="font-mono uppercase block mt-10 w-fit transition-opacity hover:opacity-70"
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.62)",
          }}
        >
          claytonborgesdev@gmail.com →
        </a>

        <div className="flex gap-8 mt-7">
          {(
            [
              { label: "GitHub", href: "https://github.com/claytonbrgsdev" },
              {
                label: "LinkedIn",
                href: "https://linkedin.com/in/clayton-borges-web-dev",
              },
              { label: "Instagram", href: "https://instagram.com/azulbic_" },
            ] as const
          ).map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono uppercase transition-opacity hover:opacity-70"
              style={{
                fontSize: "9px",
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.26)",
              }}
            >
              {l.label} ↗
            </a>
          ))}
        </div>

        <p
          className="font-mono mt-10"
          style={{
            fontSize: "9px",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.17)",
          }}
        >
          Available for freelance, remote roles, and relocation.
        </p>
      </div>

      {/* ─── SCROLL INDICATOR ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 10, opacity: Math.max(0, 1 - sp * 45) }}
      >
        <span
          className="font-mono uppercase"
          style={{
            fontSize: "8px",
            letterSpacing: "0.38em",
            color: "rgba(255,255,255,0.17)",
          }}
        >
          scroll
        </span>
        <div
          className="h-8 w-px"
          style={{ background: "rgba(255,255,255,0.11)" }}
        />
      </div>
    </div>
  );
}
