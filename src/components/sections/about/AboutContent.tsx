"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { contactInfo } from "@/lib/data/contact";

interface AboutContentProps {
  dict: Dictionary;
  locale: Locale;
}

const experience = [
  {
    role: "Freelance Dev",
    company: "Evolut Digital",
    period: "2025 – Present",
    highlights: ["MzPrime 3D — real-time vehicle cover customization (Three.js + GLB)"],
  },
  {
    role: "Freelance Dev",
    company: "Moveo Filmes",
    period: "2025 – Present",
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

export function AboutContent({ dict, locale }: AboutContentProps) {
  const { about } = dict;

  return (
    <div>
      {/* Header */}
      <div className="mb-20">
        <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-4">
          {about.subheading}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-10">{about.heading}</h1>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
          <p className="font-sans opacity-60 leading-relaxed">{about.bio_1}</p>
          <p className="font-sans opacity-60 leading-relaxed">{about.bio_2}</p>
        </div>
        <p className="font-sans opacity-80 mt-6 font-medium">{about.bio_3}</p>
      </div>

      {/* Experience */}
      <div className="mb-20 border-t border-white/10 pt-12">
        <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-8">
          {about.experience_label}
        </span>
        <div className="flex flex-col gap-0">
          {experience.map((job, idx) => (
            <div key={job.company} className="grid md:grid-cols-[200px_1fr] gap-4 py-8 border-b border-white/8">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs opacity-20 select-none">{String(idx + 1).padStart(2, "0")}</span>
                <span className="font-sans text-xs opacity-40">{job.period}</span>
              </div>
              <div>
                <h3 className="font-bold mb-0.5">{job.role}</h3>
                <span className="font-sans text-sm opacity-45 block mb-4">{job.company}</span>
                <ul className="flex flex-col gap-1.5">
                  {job.highlights.map((h) => (
                    <li key={h} className="font-sans flex items-start gap-2 text-sm opacity-50">
                      <span className="font-sans opacity-40 shrink-0 mt-0.5">→</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-20 border-t border-white/10 pt-12">
        <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-8">
          {about.education_label}
        </span>
        <div className="flex flex-col gap-4">
          {education.map((edu) => (
            <div key={edu.school} className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-sans font-bold">{edu.school}</span>
                <span className="font-sans opacity-50 ml-3 text-sm">{edu.degree}</span>
              </div>
              <span className="font-sans text-xs opacity-40">{edu.period}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-20 border-t border-white/10 pt-12">
        <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-8">
          {about.languages_label}
        </span>
        <div className="flex flex-col gap-4 max-w-xs">
          {[
            { label: about.portuguese, level: 1.0 },
            { label: about.english, level: 0.88 },
          ].map(({ label, level }) => {
            const [lang, proficiency] = label.split(" — ");
            return (
              <div key={label}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-sans text-sm font-medium">{lang}</span>
                  <span className="font-sans text-xs opacity-35">{proficiency}</span>
                </div>
                <div className="h-px bg-white/8 relative">
                  <div className="h-px bg-white/40 absolute left-0 top-0" style={{ width: `${level * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume / Connect */}
      <div className="border-t border-white/10 pt-12 flex flex-wrap gap-4">
        <a
          href={contactInfo.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 border border-white/30 font-sans text-sm tracking-wide hover:border-white/70 transition-colors"
        >
          {about.download_resume} ↗
        </a>
        <a
          href={contactInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 border border-white/10 font-sans text-sm tracking-wide opacity-50 hover:opacity-90 hover:border-white/30 transition-all"
        >
          GitHub ↗
        </a>
      </div>
    </div>
  );
}
