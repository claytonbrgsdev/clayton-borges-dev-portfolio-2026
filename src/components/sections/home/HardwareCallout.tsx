"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { hardwareProjects } from "@/lib/data/hardware";

interface HardwareCalloutProps {
  dict: Dictionary;
  locale: Locale;
}

export function HardwareCallout({ dict, locale }: HardwareCalloutProps) {
  if (hardwareProjects.length === 0) return null;

  const { hardware_callout } = dict.home;

  return (
    <section
      id="hardware"
      className="relative py-24 px-6 md:px-12 border-t border-white/10"
      style={{ zIndex: 2 }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-xl">
            <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-4">
              Hardware
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {hardware_callout.heading}
            </h2>
            <p className="text-sm opacity-50 leading-relaxed mb-6">
              {hardware_callout.subheading}
            </p>

            {/* project names */}
            <div className="flex flex-wrap gap-3 mb-6">
              {hardwareProjects.map((hw) => (
                <span
                  key={hw.id}
                  className="font-mono text-xs border border-white/15 px-3 py-1.5 opacity-60"
                >
                  {locale === "pt" ? hw.namePt : hw.nameEn}
                </span>
              ))}
            </div>

            <Link
              href={`/${locale}/hardware`}
              className="inline-block px-6 py-2.5 border border-white/30 font-mono text-sm tracking-wide hover:border-white/70 transition-colors"
            >
              {hardware_callout.cta} →
            </Link>
          </div>

          {/* Decorative spec snippet */}
          <div className="border border-white/8 p-5 font-mono text-xs opacity-30 leading-loose max-w-xs select-none">
            <div className="opacity-50 mb-2">ESP32 Synthesizer</div>
            <div>MCU: Xtensa LX6 240MHz</div>
            <div>Audio: 32kHz Mozzi</div>
            <div>Waveforms: sin · saw · sqr · tri</div>
            <div>Controls: 4× ADC potentiometer</div>
            <div>Output: RC LPF → headphone amp</div>
          </div>
        </div>
      </div>
    </section>
  );
}
