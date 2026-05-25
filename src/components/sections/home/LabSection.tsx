"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

interface LabSectionProps {
  dict: Dictionary;
  locale: Locale;
}

const FEATURED_LABS = [
  {
    code:  "LAB-05",
    route: "/lab-phase-5",
    name:  "Becoming",
    tech:  "Peter de Jong attractor",
    desc:  "Strange-attractor pixel buffer. 5 parameter sets traversed by scroll.",
  },
  {
    code:  "LAB-12",
    route: "/lab-phase-12",
    name:  "Recur",
    tech:  "Fourier harmonic circles",
    desc:  "Harmonic construction lines tracing closed orbits from superposed frequencies.",
  },
  {
    code:  "LAB-14",
    route: "/lab-phase-14",
    name:  "Circuit",
    tech:  "p5.js · PCB substrate",
    desc:  "Printed circuit board animation. Copper traces reveal across 4 chapters.",
  },
  {
    code:  "LAB-15",
    route: "/lab-phase-15",
    name:  "Phosphor",
    tech:  "Lissajous · CRT oscilloscope",
    desc:  "x=sin(at+δ) y=sin(bt). Beam traces phosphor paths through frequency space.",
  },
  {
    code:  "LAB-21b",
    route: "/lab-phase-21-b",
    name:  "Lorenz",
    tech:  "Chaotic attractor · RK4",
    desc:  "620-particle swarm on the Lorenz attractor. ρ from 14→60 drives chaos onset.",
  },
  {
    code:  "LAB-24",
    route: "/lab-phase-24",
    name:  "Mandelbrot",
    tech:  "Complex iteration · smooth coloring",
    desc:  "5-keyframe zoom into the Mandelbrot set. Julia companion PiP.",
  },
  {
    code:  "LAB-25b",
    route: "/lab-phase-25-b",
    name:  "WireWorld",
    tech:  "4-state cellular automaton",
    desc:  "Electron signals propagate through circuit topologies. Ring, Lissajous, rose, hypocycloid.",
  },
  {
    code:  "LAB-26",
    route: "/lab-phase-26",
    name:  "Superposition",
    tech:  "Schrödinger · finite difference",
    desc:  "Time-dependent wave equation. Gaussian beam through single/double/triple slits. Phase-hue coloring: hue = arg ψ, brightness = |ψ|².",
  },
];

const border = "1px solid rgba(10,10,10,0.12)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };

export function LabSection({ dict }: LabSectionProps) {
  const t = dict.home.lab_section;

  return (
    <section
      id="lab"
      style={{ background: "#F2F0EC", borderBottom: border }}
    >
      {/* Section header */}
      <div style={{ borderBottom: border, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", color: "#9A9A9A", textTransform: "uppercase" }}>
            {t.code}
          </span>
          <h2 style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 13, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
            {t.heading}
          </h2>
        </div>
        <span style={{ ...mono, fontSize: 10, color: "#9A9A9A" }}>
          {t.sub}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", borderLeft: border, borderTop: border, borderBottom: border }}>
        {FEATURED_LABS.map((lab) => (
          <Link
            key={lab.code}
            href={lab.route}
            style={{ textDecoration: "none", display: "block", borderRight: border, borderBottom: border }}
          >
            <div
              style={{
                padding: "22px 24px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(10,10,10,0.025)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: "#6B35D9" }}>{lab.code}</span>
              <h3 style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 16, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
                {lab.name}
              </h3>
              <p style={{ ...mono, fontSize: 9, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                {lab.tech}
              </p>
              <p style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 12, color: "#0A0A0A", opacity: 0.6, margin: "4px 0 0", lineHeight: 1.55 }}>
                {lab.desc}
              </p>
              <div style={{ marginTop: "auto", paddingTop: 10 }}>
                <span style={{ ...mono, fontSize: 9, color: "#6B35D9", letterSpacing: "0.08em" }}>
                  {t.open}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer bar */}
      <div style={{ padding: "14px 32px", display: "flex", justifyContent: "flex-end" }}>
        <a
          href="/lab"
          style={{ ...mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(10,10,10,0.45)", textDecoration: "none", transition: "color 0.1s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6B35D9"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(10,10,10,0.45)"; }}
        >
          ALL 42 PHASES →
        </a>
      </div>
    </section>
  );
}
