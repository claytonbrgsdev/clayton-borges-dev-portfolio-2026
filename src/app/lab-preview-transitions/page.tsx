"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const PROJECT = {
  label: "01 · Client Work",
  name: "Moveo Filmes",
  type: "CMS Platform · 2024",
  desc: "Database-driven CMS — each new film auto-generates its own page. Zero code changes per update.",
  highlights: [
    "38 pages auto-generated from a single template",
    "Film data synced via headless CMS in real time",
    "SEO-optimised static routes per title",
  ],
  tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Vercel"],
  metrics: [
    { label: "Lines of code", target: 1240, suffix: "" },
    { label: "Pages auto-generated", target: 38, suffix: "" },
    { label: "Build time", target: 2.4, suffix: "s", decimals: 1 },
    { label: "Uptime", target: 99.8, suffix: "%", decimals: 1 },
  ],
};

const BUILD_LINES = [
  { text: "$ git push origin main", delay: 0 },
  { text: "> CI pipeline triggered", delay: 0.18 },
  { text: "> installing dependencies... done in 1.2s", delay: 0.36 },
  { text: "> compiling TypeScript... 0 errors", delay: 0.58 },
  { text: "> generating 38 static routes...", delay: 0.78 },
  { text: "> bundling assets... 847 kB", delay: 1.05 },
  { text: "> running tests... 42 passed", delay: 1.28 },
  { text: "> deploying to Vercel edge...", delay: 1.55 },
  { text: "✓ deployed  moveofilmes.com.br  in 2.4s", delay: 1.82, highlight: true },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Shared project card (plain, no effect — the "revealed" final state)         */
function ProjectCard({ dim = false }: { dim?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        padding: "2.25rem",
        opacity: dim ? 0.45 : 1,
        transition: "opacity 0.3s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: 0.4, display: "block", marginBottom: "4px" }}>{PROJECT.label}</span>
          <h3 style={{ fontWeight: 700, fontSize: "1.35rem", marginBottom: "4px" }}>{PROJECT.name}</h3>
          <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: 0.38 }}>{PROJECT.type}</span>
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid rgba(255,255,255,0.15)", padding: "3px 8px", opacity: 0.28 }}>2024</span>
      </div>
      <p style={{ fontSize: "13px", lineHeight: 1.65, opacity: 0.52, marginBottom: "1.25rem", maxWidth: "520px" }}>{PROJECT.desc}</p>
      <ul style={{ marginBottom: "1.25rem", listStyle: "none", padding: 0 }}>
        {PROJECT.highlights.map(h => (
          <li key={h} style={{ fontSize: "12px", opacity: 0.5, marginBottom: "6px", display: "flex", gap: "8px" }}>
            <span style={{ opacity: 0.4, fontFamily: "monospace", flexShrink: 0 }}>●</span>{h}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {PROJECT.tech.map(t => (
          <span key={t} style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 8px", opacity: 0.36 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* OPTION A — Terminal build log                                                */
function OptionA() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const termRef    = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const linesRef   = useRef<HTMLDivElement[]>([]);
  const cursorRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const term = termRef.current;
    const card = cardRef.current;
    if (!wrap || !term || !card) return;

    gsap.set(card, { opacity: 0, y: 16 });
    const lines = linesRef.current.filter(Boolean);
    gsap.set(lines, { opacity: 0, x: -8 });

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    triggers.push(ScrollTrigger.create({
      trigger: wrap,
      start: "top 72%",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        lines.forEach((line, i) => {
          tl.to(line, { opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }, BUILD_LINES[i].delay);
        });
        tl.to(cursorRef.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.5 }, "+=0.1");
        tl.to(card, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "+=0.3");
      },
    }));

    return () => triggers.forEach(t => t.kill());
  }, []);

  return (
    <div ref={wrapRef}>
      {/* Terminal */}
      <div
        ref={termRef}
        style={{
          fontFamily: "monospace",
          fontSize: "12px",
          background: "rgba(0,0,0,0.82)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "20px 24px",
          marginBottom: "0",
          borderBottom: "none",
          position: "relative",
        }}
      >
        {/* Terminal title bar */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block", opacity: 0.7 }} />
          ))}
          <span style={{ marginLeft: "auto", opacity: 0.2, fontSize: "10px", letterSpacing: "0.1em" }}>MOVEO FILMES · DEPLOY</span>
        </div>
        {BUILD_LINES.map((line, i) => (
          <div
            key={i}
            ref={el => { if (el) linesRef.current[i] = el; }}
            style={{
              marginBottom: "4px",
              color: line.highlight ? "rgb(40,200,64)" : "rgba(255,255,255,0.7)",
              fontWeight: line.highlight ? 600 : 400,
            }}
          >
            {line.text}
          </div>
        ))}
        <span ref={cursorRef} style={{ display: "inline-block", width: 8, height: 13, background: "rgba(255,255,255,0.6)", verticalAlign: "middle", marginTop: "4px" }} />
      </div>

      {/* Connector line */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "0" }} />

      {/* Revealed card */}
      <div ref={cardRef}>
        <ProjectCard />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* OPTION B — Metric counters                                                   */
function OptionB() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const metricRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    triggers.push(ScrollTrigger.create({
      trigger: wrap,
      start: "top 75%",
      once: true,
      onEnter: () => {
        PROJECT.metrics.forEach((m, i) => {
          const el = metricRefs.current[i];
          if (!el) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: m.target,
            duration: 1.6,
            delay: i * 0.12,
            ease: "power2.out",
            onUpdate: () => {
              const v = m.decimals ? obj.val.toFixed(m.decimals) : Math.round(obj.val);
              el.textContent = `${v}${m.suffix}`;
            },
          });
        });
      },
    }));

    return () => triggers.forEach(t => t.kill());
  }, []);

  return (
    <div ref={wrapRef}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          padding: "2.25rem",
        }}
      >
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: 0.4, display: "block", marginBottom: "4px" }}>{PROJECT.label}</span>
            <h3 style={{ fontWeight: 700, fontSize: "1.35rem", marginBottom: "4px" }}>{PROJECT.name}</h3>
            <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: 0.38 }}>{PROJECT.type}</span>
          </div>
          <span style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid rgba(255,255,255,0.15)", padding: "3px 8px", opacity: 0.28 }}>2024</span>
        </div>

        {/* Metric counters row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1.5rem",
          }}
        >
          {PROJECT.metrics.map((m, i) => (
            <div
              key={m.label}
              style={{
                padding: "1rem",
                background: "rgba(0,0,0,0.4)",
                textAlign: "center",
              }}
            >
              <span
                ref={el => { if (el) metricRefs.current[i] = el; }}
                style={{ display: "block", fontWeight: 700, fontSize: "1.5rem", fontFamily: "monospace", marginBottom: "4px" }}
              >
                0
              </span>
              <span style={{ fontFamily: "monospace", fontSize: "10px", opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "13px", lineHeight: 1.65, opacity: 0.52, marginBottom: "1.25rem", maxWidth: "520px" }}>{PROJECT.desc}</p>
        <ul style={{ marginBottom: "1.25rem", listStyle: "none", padding: 0 }}>
          {PROJECT.highlights.map(h => (
            <li key={h} style={{ fontSize: "12px", opacity: 0.5, marginBottom: "6px", display: "flex", gap: "8px" }}>
              <span style={{ opacity: 0.4, fontFamily: "monospace", flexShrink: 0 }}>●</span>{h}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {PROJECT.tech.map(t => (
            <span key={t} style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 8px", opacity: 0.36 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* OPTION C — Wireframe → Render                                                */
function OptionC() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const wireRef      = useRef<HTMLDivElement>(null);
  const realRef      = useRef<HTMLDivElement>(null);
  const labelWireRef = useRef<HTMLSpanElement>(null);
  const labelRealRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const wire = wireRef.current;
    const real = realRef.current;
    if (!wrap || !wire || !real) return;

    gsap.set(real, { opacity: 0 });
    gsap.set(labelWireRef.current, { opacity: 0.55 });
    gsap.set(labelRealRef.current, { opacity: 0 });

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    triggers.push(ScrollTrigger.create({
      trigger: wrap,
      start: "top 80%",
      end: "top 20%",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        if (wire) wire.style.opacity = String(1 - p);
        if (real) real.style.opacity = String(p);
        if (labelWireRef.current) labelWireRef.current.style.opacity = String((1 - p) * 0.55);
        if (labelRealRef.current) labelRealRef.current.style.opacity = String(p * 0.55);
      },
    }));

    return () => triggers.forEach(t => t.kill());
  }, []);

  const Skel = ({ w, h, mb = 10 }: { w: string; h: number; mb?: number }) => (
    <div style={{ width: w, height: `${h}px`, background: "rgba(255,255,255,0.08)", borderRadius: "1px", marginBottom: `${mb}px` }} />
  );

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* State labels */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px", fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <span ref={labelWireRef} style={{ color: "rgba(255,255,255,0.55)" }}>← wireframe</span>
        <span style={{ opacity: 0.15 }}>·</span>
        <span ref={labelRealRef} style={{ color: "rgba(255,255,255,0.55)" }}>rendered →</span>
      </div>

      {/* Stack: wireframe below, real on top */}
      <div style={{ position: "relative" }}>

        {/* Wireframe layer */}
        <div ref={wireRef} style={{ position: "absolute", inset: 0 }}>
          <div style={{ border: "1px dashed rgba(255,255,255,0.14)", padding: "2.25rem", background: "rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ flex: 1, marginRight: "16px" }}>
                <Skel w="38%" h={8} mb={8} />
                <Skel w="55%" h={18} mb={6} />
                <Skel w="42%" h={7} />
              </div>
              <Skel w="48px" h={26} mb={0} />
            </div>
            <Skel w="100%" h={6} mb={5} />
            <Skel w="90%" h={6} mb={5} />
            <Skel w="75%" h={6} mb={16} />
            <Skel w="100%" h={5} mb={4} />
            <Skel w="88%" h={5} mb={4} />
            <Skel w="60%" h={5} mb={16} />
            <div style={{ display: "flex", gap: "6px" }}>
              {[60, 80, 70, 55, 90].map((w, i) => (
                <Skel key={i} w={`${w}px`} h={20} mb={0} />
              ))}
            </div>
          </div>
        </div>

        {/* Real card layer (same height as wireframe, rendered invisible initially) */}
        <div ref={realRef} style={{ opacity: 0 }}>
          <ProjectCard />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Page                                                                         */
export default function PreviewTransitionsPage() {
  const OPTIONS = [
    {
      id: "A",
      label: "Terminal Build Log",
      desc: "Scroll revela um terminal com as linhas de build/deploy rolando, depois o card emerge abaixo.",
      component: <OptionA />,
    },
    {
      id: "B",
      label: "Metric Counters",
      desc: "O card aparece normalmente, mas os números-chave contam de 0 → valor real quando entram no viewport.",
      component: <OptionB />,
    },
    {
      id: "C",
      label: "Wireframe → Render",
      desc: "O card começa como esqueleto (linhas e retângulos) e scrub de scroll preenche com conteúdo real.",
      component: <OptionC />,
    },
  ];

  return (
    <div style={{ background: "#07090e", color: "#fff", minHeight: "100vh", paddingBottom: "12vh" }}>

      {/* Header */}
      <div style={{ padding: "3.5rem 5rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", maxWidth: "860px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.14em", opacity: 0.3, textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
          Preview · CodeToComponent replacements
        </span>
        <h1 style={{ fontWeight: 700, fontSize: "1.75rem", marginBottom: "8px" }}>3 opções para o card principal</h1>
        <p style={{ fontSize: "13px", opacity: 0.42, lineHeight: 1.6 }}>
          Scroll por cada seção para ver o efeito em ação. Escolha A, B ou C.
        </p>
      </div>

      {/* Options */}
      {OPTIONS.map(opt => (
        <section
          key={opt.id}
          style={{ padding: "6rem 5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", maxWidth: "860px" }}
        >
          {/* Option header */}
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "8px" }}>
              <span style={{
                fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.12em",
                border: "1px solid rgba(255,255,255,0.22)", padding: "2px 10px",
                opacity: 0.6, textTransform: "uppercase"
              }}>
                Option {opt.id}
              </span>
              <h2 style={{ fontWeight: 700, fontSize: "1.2rem" }}>{opt.label}</h2>
            </div>
            <p style={{ fontFamily: "monospace", fontSize: "12px", opacity: 0.38, maxWidth: "520px", lineHeight: 1.6 }}>
              {opt.desc}
            </p>
          </div>

          {opt.component}
        </section>
      ))}

      {/* Footer nav */}
      <div style={{ padding: "3rem 5rem 0", fontFamily: "monospace", fontSize: "12px", opacity: 0.28 }}>
        Responda ao Claude qual opção (A, B ou C) e integra no site.
      </div>
    </div>
  );
}
