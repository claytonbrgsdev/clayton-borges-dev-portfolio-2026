"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// ── Content ────────────────────────────────────────────────────────────────
const CODE_LINES = [
  `// src/app/[slug]/page.tsx`,
  `import { getCachedFilm } from "@/lib/moveo"`,
  `import { FilmLayout }    from "@/components/FilmLayout"`,
  ``,
  `export async function generateStaticParams() {`,
  `  const films = await getCachedFilm()`,
  `  return films.map(f => ({`,
  `    slug: f.slug,`,
  `  }))`,
  `}`,
  ``,
  `export default async function FilmPage({`,
  `  params: { slug },`,
  `}: {`,
  `  params: { slug: string }`,
  `}) {`,
  `  const film = await getCachedFilm(slug)`,
  `  return <FilmLayout film={film} />`,
  `}`,
];

const TERM_LINES: { t: string; kind: "cmd" | "out" | "success" | "blank" }[] = [
  { t: "$ git add .",                                      kind: "cmd" },
  { t: "$ git commit -m 'feat: auto-generate film pages'", kind: "cmd" },
  { t: "$ git push origin main",                           kind: "cmd" },
  { t: "",                                                 kind: "blank" },
  { t: "remote: Resolving deltas: 100% done.",             kind: "out" },
  { t: "remote: Vercel — deploying to production...",      kind: "out" },
  { t: "✓  deployed  moveofilmes.com.br  [2.4s]",          kind: "success" },
];

const TECH       = ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Vercel"];
const HIGHLIGHTS = [
  "38 páginas auto-geradas",
  "Sync via headless CMS",
  "99.8% uptime",
];
const MACOS_DOTS = ["#ff5f57", "#febc2e", "#28c840"];

// ── Sub-components ─────────────────────────────────────────────────────────
function TitleBar({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "8px 13px",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.025)",
      flexShrink: 0,
    }}>
      {MACOS_DOTS.map(c => (
        <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8, flexShrink: 0 }} />
      ))}
      <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: "10px", opacity: 0.28, letterSpacing: "0.04em" }}>
        {label}
      </span>
    </div>
  );
}

// Simulated Moveo page (placeholder until real recording arrives)
function MoveoMockup() {
  const FILMS = ["ARRIVAL", "DUNE", "OPPENHEIMER", "BARBIE", "TENET", "INTERSTELLAR", "PAST LIVES", "THE ZONE OF INTEREST", "POOR THINGS"];
  return (
    <div style={{ width: "100%", height: "100%", background: "#08090e", overflow: "hidden", fontFamily: "sans-serif" }}>
      {/* Fake nav */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em" }}>MOVEO FILMES</span>
        <div style={{ display: "flex", gap: "12px" }}>
          {["Catálogo", "Sobre", "Contato"].map(l => (
            <span key={l} style={{ fontSize: "10px", opacity: 0.35, letterSpacing: "0.06em" }}>{l}</span>
          ))}
        </div>
      </div>
      {/* Film grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", padding: "12px" }}>
        {FILMS.map((title, i) => {
          const hues = [220, 260, 200, 300, 180, 240, 210, 190, 270];
          const h = hues[i % hues.length];
          return (
            <div key={title} style={{
              height: "70px",
              background: `linear-gradient(160deg, hsla(${h},40%,12%,1), hsla(${h+20},30%,8%,1))`,
              display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "7px 8px",
              border: "1px solid rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.15, background: `linear-gradient(to bottom, transparent 50%, hsla(${h},60%,20%,0.6))` }} />
              <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.7, position: "relative" }}>{title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main animation component ────────────────────────────────────────────────
function IDEDeploySequence() {
  const sectionRef    = useRef<HTMLDivElement>(null);
  const codeWinRef    = useRef<HTMLDivElement>(null);
  const termWinRef    = useRef<HTMLDivElement>(null);
  const browserWinRef = useRef<HTMLDivElement>(null);
  const cardInfoRef   = useRef<HTMLDivElement>(null);
  const codeLineRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const termLineRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef     = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section    = sectionRef.current;
    const codeWin    = codeWinRef.current;
    const termWin    = termWinRef.current;
    const browserWin = browserWinRef.current;
    const cardInfo   = cardInfoRef.current;
    if (!section || !codeWin || !termWin || !browserWin) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const codeLines = codeLineRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const termLines = termLineRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const cardItems = cardInfo
      ? Array.from(cardInfo.querySelectorAll<HTMLElement>("[data-item]"))
      : [];

    // ── Initial GSAP states ────────────────────────────────────────────────
    // Code window: centered, hidden
    gsap.set(codeWin,    { opacity: 0, scale: 0.92, xPercent: -50, yPercent: -50, y: -80 });
    // Terminal: below code, hidden
    gsap.set(termWin,    { opacity: 0, scale: 0.92, xPercent: -50, yPercent: -50, y: 230 });
    // Browser: centered, hidden
    gsap.set(browserWin, { opacity: 0, scale: 0.88, xPercent: -50, yPercent: -50 });

    gsap.set(codeLines, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(termLines, { opacity: 0, x: -10 });
    gsap.set(cardItems, { opacity: 0, y: 12 });

    // ── Master timeline ────────────────────────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Phase 1a — code window fades in
    tl.to(codeWin, { opacity: 1, scale: 1, duration: 0.5 });

    // Phase 1b — lines type in sequentially
    codeLines.forEach((line, i) => {
      const chars = CODE_LINES[i]?.length ?? 0;
      const dur   = Math.max(0.05, chars * 0.008);
      tl.to(line, { clipPath: "inset(0 0% 0 0)", duration: dur, ease: "none" },
            i === 0 ? ">" : ">-0.005");
    });

    // Hide cursor after typing
    tl.to(cursorRef.current, { opacity: 0, duration: 0.25 }, ">");

    // Phase 2 — terminal opens
    tl.to(termWin, { opacity: 1, scale: 1, duration: 0.35 }, ">");

    // Terminal lines stagger in
    termLines.forEach(line => {
      tl.to(line, { opacity: 1, x: 0, duration: 0.16 }, ">-0.01");
    });

    // Phase 3 — both windows shrink + move to left corners simultaneously
    const CORNER_X = -(window.innerWidth  * 0.26);
    const CORNER_Y = window.innerHeight   * 0.22;

    tl.to(codeWin, {
      scale: 0.48,
      x: CORNER_X,
      y: -(CORNER_Y + 80),
      duration: 0.85,
      ease: "power2.inOut",
    }, ">");
    tl.to(termWin, {
      scale: 0.48,
      x: CORNER_X,
      y: CORNER_Y + 60,
      duration: 0.85,
      ease: "power2.inOut",
    }, "<"); // SAME time as code window

    // Phase 4 — browser window opens in center
    tl.to(browserWin, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.65,
      ease: "power3.out",
    }, ">-0.15");

    // Phase 5 — project info surfaces around browser
    tl.to(cardItems, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.07,
      ease: "power2.out",
    }, ">-0.05");

    // ── Pin + scrub ────────────────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger:   section,
      start:     "top top",
      end:       "+=3400",
      pin:       true,
      scrub:     2,
      animation: tl,
    });

    return () => { st.kill(); tl.kill(); };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        height: "100vh",
        background: "#07090e",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: 0.018,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* Workspace (all windows anchored to center) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>

        {/* ═══ CODE EDITOR WINDOW ═══════════════════════════════════════════ */}
        <div ref={codeWinRef} style={{
          position: "absolute", left: "50%", top: "50%",
          width: "440px",
          background: "rgba(12,15,21,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          boxShadow: "0 24px 70px rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column",
          willChange: "transform",
        }}>
          <TitleBar label="[slug]/page.tsx" />
          <div style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "11px", lineHeight: 1.72, overflowX: "hidden" }}>
            {CODE_LINES.map((line, i) => (
              <div
                key={i}
                ref={el => { codeLineRefs.current[i] = el; }}
                style={{
                  whiteSpace: "pre",
                  minHeight: "1.72em",
                  color: line.startsWith("//")
                    ? "rgba(100,140,100,0.6)"
                    : line === ""
                    ? "transparent"
                    : "rgba(218,224,234,0.88)",
                }}
              >
                {line || " "}
              </div>
            ))}
            {/* blinking cursor */}
            <span
              ref={cursorRef}
              style={{
                display: "inline-block", width: "7px", height: "13px",
                background: "rgba(255,255,255,0.65)", verticalAlign: "middle",
                animation: "blink 0.9s step-end infinite",
              }}
            />
          </div>
        </div>

        {/* ═══ TERMINAL WINDOW ══════════════════════════════════════════════ */}
        <div ref={termWinRef} style={{
          position: "absolute", left: "50%", top: "50%",
          width: "390px",
          background: "rgba(5,7,11,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          boxShadow: "0 24px 70px rgba(0,0,0,0.85)",
          willChange: "transform",
        }}>
          <TitleBar label="zsh — moveo-filmes" />
          <div style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "11px", lineHeight: 1.7 }}>
            {TERM_LINES.map((line, i) => (
              <div
                key={i}
                ref={el => { termLineRefs.current[i] = el; }}
                style={{
                  minHeight: "1.7em",
                  color: line.kind === "success" ? "#28c840"
                       : line.kind === "out"     ? "rgba(255,255,255,0.32)"
                       :                           "rgba(255,255,255,0.78)",
                  fontWeight: line.kind === "success" ? 600 : 400,
                }}
              >
                {line.t}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ BROWSER WINDOW ═══════════════════════════════════════════════ */}
        <div ref={browserWinRef} style={{
          position: "absolute", left: "50%", top: "50%",
          width: "580px",
          height: "400px",
          background: "rgba(12,14,20,0.97)",
          border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: "8px",
          boxShadow: "0 30px 90px rgba(0,0,0,0.9)",
          display: "flex", flexDirection: "column",
          zIndex: 20,
          willChange: "transform",
        }}>
          {/* Browser chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 13px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.025)",
            flexShrink: 0,
          }}>
            {MACOS_DOTS.map(c => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8, flexShrink: 0 }} />
            ))}
            {/* URL bar — intentionally blank/dimmed */}
            <div style={{
              flex: 1, marginLeft: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "4px",
              padding: "3px 10px",
              fontFamily: "monospace", fontSize: "10px",
              color: "rgba(255,255,255,0.2)",
            }}>
              moveofilmes.com.br
            </div>
          </div>

          {/* Viewport — swap this div with a <video> element once recording is ready */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {/*
              TO SWAP IN VIDEO:
              <video
                src="/videos/moveo-demo.mp4"
                autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            */}
            <MoveoMockup />
          </div>
        </div>

        {/* ═══ PROJECT INFO AROUND BROWSER ══════════════════════════════════ */}
        <div
          ref={cardInfoRef}
          style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(1100px, calc(100vw - 60px))", height: "580px",
            pointerEvents: "none",
            zIndex: 15,
          }}
        >
          {/* Project name — above browser */}
          <div data-item style={{
            position: "absolute", top: "30px", left: "50%",
            transform: "translateX(-50%)", textAlign: "center",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", opacity: 0.3, display: "block", marginBottom: "4px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              01 · Client Work
            </span>
            <h3 style={{ fontWeight: 700, fontSize: "1.7rem", lineHeight: 1 }}>Moveo Filmes</h3>
          </div>

          {/* Year + type — top right */}
          <div data-item style={{
            position: "absolute", top: "50%", right: "12px",
            transform: "translateY(-50%)", textAlign: "right",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: 0.38, display: "block", marginBottom: "5px" }}>CMS Platform</span>
            <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: 0.22 }}>2024</span>
          </div>

          {/* Highlights — left */}
          <div data-item style={{
            position: "absolute", top: "50%", left: "12px",
            transform: "translateY(-50%)",
          }}>
            {HIGHLIGHTS.map(h => (
              <div key={h} style={{
                fontFamily: "monospace", fontSize: "10.5px", opacity: 0.4,
                marginBottom: "9px", display: "flex", gap: "7px", alignItems: "center",
                whiteSpace: "nowrap",
              }}>
                <span style={{ opacity: 0.55 }}>▸</span>{h}
              </div>
            ))}
          </div>

          {/* Tech tags — below browser */}
          <div data-item style={{
            position: "absolute", bottom: "30px", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center",
          }}>
            {TECH.map(t => (
              <span key={t} style={{
                fontFamily: "monospace", fontSize: "10px",
                border: "1px solid rgba(255,255,255,0.14)", padding: "3px 9px", opacity: 0.42,
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function PreviewIDEPage() {
  return (
    <div style={{ background: "#07090e", color: "#fff" }}>
      {/* Intro */}
      <div style={{ minHeight: "40vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 5rem 3rem" }}>
        <span style={{ fontFamily: "monospace", fontSize: "10px", opacity: 0.28, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
          Preview · IDE → Deploy → Browser
        </span>
        <h1 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: "8px" }}>Desktop Sequence</h1>
        <p style={{ fontFamily: "monospace", fontSize: "12px", opacity: 0.38, lineHeight: 1.7, maxWidth: "480px" }}>
          Scroll para acionar a sequência completa:<br />
          código sendo digitado → git push → janelas se movem → browser abre.
        </p>
      </div>

      {/* The animation */}
      <IDEDeploySequence />

      {/* Footer space so there's room to scroll past the pin */}
      <div style={{ height: "50vh", display: "flex", alignItems: "center", padding: "0 5rem" }}>
        <span style={{ fontFamily: "monospace", fontSize: "12px", opacity: 0.25 }}>
          ← sequência completa. integrar no site como componente principal da seção Projects.
        </span>
      </div>
    </div>
  );
}
