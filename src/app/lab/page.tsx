import Link from "next/link";
import type { Metadata } from "next";
import { experiments } from "@/lib/data/experiments";
import type { LabFocus } from "@/lib/data/experiments";

export const metadata: Metadata = {
  title: "The Lab — Clayton Borges",
  description: "27 generative experiments — computational art, physics simulations, and interactive systems.",
};

const FOCUS_ORDER: LabFocus[] = ["Generative", "Simulation", "Mathematics", "Physics"];

const FOCUS_DESCRIPTIONS: Record<LabFocus, string> = {
  Generative:  "Emergent patterns and form from iterative rules",
  Simulation:  "Physical and biological systems modelled in real time",
  Mathematics: "Abstract structures made visible",
  Physics:     "Natural forces approximated on screen",
};

export default function LabPage() {
  const byFocus = FOCUS_ORDER.map(focus => ({
    focus,
    items: experiments.filter(e => e.focus === focus),
  })).filter(g => g.items.length > 0);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/8 px-6 md:px-16 py-6 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-sm z-10">
        <Link href="/" className="font-mono text-xs tracking-widest uppercase opacity-30 hover:opacity-70 transition-opacity">
          ← Clayton Borges
        </Link>
        <span className="font-mono text-xs opacity-20">{experiments.length} experiments</span>
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-12 pt-20 pb-32">
        {/* Title */}
        <div className="mb-20">
          <span className="font-mono text-xs tracking-widest uppercase opacity-30 block mb-4">Creative Lab</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-5">The Lab</h1>
          <p className="text-sm opacity-40 max-w-lg leading-relaxed">
            27 scroll-driven generative experiments. Each phase is a standalone canvas experience
            — physics, mathematics, and emergence made interactive.
          </p>
        </div>

        {/* Groups */}
        {byFocus.map(({ focus, items }) => (
          <div key={focus} className="mb-20">
            <div className="mb-8 pb-4 border-b border-white/8">
              <div className="flex items-baseline gap-5">
                <h2 className="text-xl font-bold">{focus}</h2>
                <span className="font-mono text-xs opacity-30">{items.length}</span>
              </div>
              <p className="text-xs opacity-30 mt-1.5 font-mono">{FOCUS_DESCRIPTIONS[focus]}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map(exp => (
                <Link
                  key={exp.phase}
                  href={exp.route}
                  className="group relative block overflow-hidden border border-white/8 hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${exp.gradient.from}, ${exp.gradient.to})`,
                    minHeight: "168px",
                  }}
                >
                  {/* Phase + focus */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between z-10">
                    <span className="font-mono text-xs opacity-35 tracking-widest">{exp.phase}</span>
                    <span className="font-mono text-xs opacity-22 border border-white/12 px-1.5 py-0.5">{exp.focus}</span>
                  </div>

                  {/* Bottom gradient */}
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="font-bold text-sm text-white mb-1 leading-tight">{exp.title}</h3>
                    <p className="text-xs text-white leading-relaxed line-clamp-2" style={{ opacity:0.42 }}>{exp.description}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {exp.tech.map(t => (
                        <span key={t} className="font-mono text-xs text-white" style={{ opacity:0.25 }}>{t}</span>
                      ))}
                    </div>
                    <span className="font-mono text-xs text-white opacity-0 group-hover:opacity-50 transition-opacity mt-2 block">
                      Enter →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Footer count */}
        <div className="border-t border-white/8 pt-10 flex items-center justify-between">
          <span className="font-mono text-xs opacity-18">{experiments.length} total experiments</span>
          <Link href="/" className="font-mono text-xs opacity-25 hover:opacity-60 transition-opacity">
            Back to portfolio →
          </Link>
        </div>
      </div>
    </main>
  );
}
