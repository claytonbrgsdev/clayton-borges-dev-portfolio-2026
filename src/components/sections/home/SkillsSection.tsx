"use client";

// TODO: Add GSAP scroll-triggered marquee or stagger reveal
import type { Dictionary } from "@/lib/i18n";

interface SkillsSectionProps {
  dict: Dictionary;
}

const skillGroups = [
  {
    category: "Frontend",
    skills: ["React 19", "Next.js 15/16", "TypeScript", "Three.js", "React Three Fiber", "GSAP", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    skills: ["Node.js", "Express.js", "FastAPI", "Python", "Ruby/Rack", "REST APIs", "WebSocket", "GraphQL"],
  },
  {
    category: "Databases & Cloud",
    skills: ["PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase", "AWS S3", "Docker", "GitHub Actions"],
  },
  {
    category: "AI / Audio / Embedded",
    skills: ["OpenAI API", "Whisper", "pyannote.audio", "Web Audio API", "FFmpeg", "ESP32", "Arduino", "C++"],
  },
];

export function SkillsSection({ dict }: SkillsSectionProps) {
  const { skills } = dict.home;

  return (
    <section className="relative py-32 px-6 md:px-12 border-t border-white/10" style={{ zIndex: 2 }}>
      <div className="mx-auto max-w-6xl">
        <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
          {skills.label}
        </span>
        <h2 className="text-3xl md:text-5xl font-bold mb-16">{skills.heading}</h2>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
                {group.category}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-sm border border-white/15 px-3 py-1.5 opacity-70"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
