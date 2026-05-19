"use client";

// TODO: Add GSAP scroll-triggered reveals for each block
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

export function AboutContent({ dict, locale }: AboutContentProps) {
  const { about } = dict;

  return (
    <div>
      {/* Header */}
      <div className="mb-20">
        <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
          {about.subheading}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-10">{about.heading}</h1>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
          <p className="opacity-60 leading-relaxed">{about.bio_1}</p>
          <p className="opacity-60 leading-relaxed">{about.bio_2}</p>
        </div>
        <p className="opacity-80 mt-6 font-medium">{about.bio_3}</p>
      </div>

      {/* Experience */}
      <div className="mb-20">
        <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-8">
          {about.experience_label}
        </span>
        <div className="flex flex-col gap-8">
          {experience.map((job) => (
            <div key={job.company} className="grid md:grid-cols-[200px_1fr] gap-4 pb-8 border-b border-white/10">
              <div>
                <span className="font-mono text-xs opacity-40">{job.period}</span>
              </div>
              <div>
                <h3 className="font-bold mb-1">{job.role}</h3>
                <span className="font-mono text-sm opacity-50 block mb-3">{job.company}</span>
                <ul className="flex flex-col gap-1">
                  {job.highlights.map((h) => (
                    <li key={h} className="text-sm opacity-50 before:content-['—'] before:mr-2">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-20">
        <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-8">
          {about.education_label}
        </span>
        <div className="flex flex-col gap-4">
          {education.map((edu) => (
            <div key={edu.school} className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-bold">{edu.school}</span>
                <span className="opacity-50 ml-3 text-sm">{edu.degree}</span>
              </div>
              <span className="font-mono text-xs opacity-40">{edu.period}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-20">
        <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-6">
          {about.languages_label}
        </span>
        <div className="flex gap-8">
          <span className="text-sm">{about.portuguese}</span>
          <span className="text-sm">{about.english}</span>
        </div>
      </div>

      {/* Resume CTA */}
      <a
        href={contactInfo.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-8 py-3 border border-white/30 font-mono text-sm tracking-wide hover:border-white/70 transition-colors"
      >
        {about.download_resume} ↗
      </a>
    </div>
  );
}
