"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { contactInfo } from "@/lib/data/contact";

interface AboutContentProps {
  dict: Dictionary;
  locale: Locale;
}

const border = "1px solid rgba(10,10,10,0.1)";
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const sans: React.CSSProperties = { fontFamily: "var(--font-geist-sans, sans-serif)" };

const experience = [
  {
    role: "Freelance Dev",
    company: "Evolut Digital",
    period: "Jan 2025 – Present",
    highlights: ["MzPrime 3D — real-time vehicle cover customization (Three.js + GLB)"],
  },
  {
    role: "Freelance Dev",
    company: "Moveo Filmes",
    period: "Jun 2024 – Present",
    highlights: ["Bilingual film production platform with admin CMS", "GSAP ScrollTrigger + Lenis + Supabase RLS"],
  },
  {
    role: "Co-founder / Dev",
    company: "DISCLAYMER (DSRPTV Records)",
    period: "Dec 2023 – Present",
    highlights: ["Music e-commerce + streaming platform (DSRPTV)", "Stripe + Mercado Pago + Spotify API + Three.js"],
  },
];

const education = [
  { school: "Casa Thomas Jefferson", degree: "Advanced English", period: "2013 – 2015" },
  { school: "Udemy", degree: "Web Development", period: "2023 – Present" },
];

export function AboutContent({ dict }: AboutContentProps) {
  const { about } = dict;

  return (
    <div style={{ ...sans, color: "#0A0A0A" }}>
      {/* Header */}
      <div style={{ marginBottom: 80 }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)", display: "block", marginBottom: 16 }}>
          {about.subheading}
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 40 }}>
          {about.heading}
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, maxWidth: 720, marginBottom: 24 }}>
          <p style={{ opacity: 0.6, lineHeight: 1.7, fontSize: 14 }}>{about.bio_1}</p>
          <p style={{ opacity: 0.6, lineHeight: 1.7, fontSize: 14 }}>{about.bio_2}</p>
        </div>
        <p style={{ opacity: 0.8, fontWeight: 500, fontSize: 14 }}>{about.bio_3}</p>
      </div>

      {/* Experience */}
      <div style={{ marginBottom: 80 }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)", display: "block", marginBottom: 32 }}>
          {about.experience_label}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {experience.map((job) => (
            <div key={job.company} style={{ borderBottom: border, padding: "20px 0", display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}>
              <span style={{ ...mono, fontSize: 10, color: "rgba(10,10,10,0.4)", paddingTop: 2 }}>{job.period}</span>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{job.role}</h3>
                <span style={{ ...mono, fontSize: 11, color: "rgba(10,10,10,0.45)", display: "block", marginBottom: 10 }}>{job.company}</span>
                <ul style={{ display: "flex", flexDirection: "column", gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
                  {job.highlights.map((h) => (
                    <li key={h} style={{ fontSize: 13, color: "rgba(10,10,10,0.55)", lineHeight: 1.5 }}>
                      <span style={{ marginRight: 8, opacity: 0.4 }}>—</span>{h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div style={{ marginBottom: 80 }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)", display: "block", marginBottom: 32 }}>
          {about.education_label}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {education.map((edu) => (
            <div key={edu.school} style={{ borderBottom: border, padding: "14px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{edu.school}</span>
                <span style={{ fontSize: 13, color: "rgba(10,10,10,0.5)", marginLeft: 12 }}>{edu.degree}</span>
              </div>
              <span style={{ ...mono, fontSize: 10, color: "rgba(10,10,10,0.4)" }}>{edu.period}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div style={{ marginBottom: 80 }}>
        <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)", display: "block", marginBottom: 24 }}>
          {about.languages_label}
        </span>
        <div style={{ display: "flex", gap: 32 }}>
          <span style={{ fontSize: 14 }}>{about.portuguese}</span>
          <span style={{ fontSize: 14 }}>{about.english}</span>
        </div>
      </div>

      {/* Resume CTA */}
      <a
        href={contactInfo.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "inline-block",
          padding: "12px 28px",
          border: "1px solid rgba(10,10,10,0.3)",
          color: "#0A0A0A",
          textDecoration: "none",
          transition: "border-color 0.12s, color 0.12s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#6B35D9";
          (e.currentTarget as HTMLAnchorElement).style.color = "#6B35D9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,10,10,0.3)";
          (e.currentTarget as HTMLAnchorElement).style.color = "#0A0A0A";
        }}
      >
        {about.download_resume} ↗
      </a>
    </div>
  );
}
