"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Slider } from "@/components/instrument/Slider";
import type { InstrumentLabels, InstrumentSketchProps } from "@/components/instrument/InstrumentSketch";

export type { InstrumentLabels };

// Dynamic imports — both components use p5 so must be client-only
const DrumMachineSketch = dynamic(
  () => import("@/components/instrument/DrumMachineSketch").then(m => ({ default: m.DrumMachineSketch })),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", background: "#F2F0EC" }} /> },
);

const InstrumentSketchDynamic = dynamic<InstrumentSketchProps>(
  () => import("@/components/instrument/InstrumentSketch").then(m => ({ default: m.InstrumentSketch })),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", background: "#F2F0EC" }} /> },
);

interface DualInstrumentProps {
  labels: InstrumentLabels;
}

export function DualInstrument({ labels }: DualInstrumentProps) {
  // Shared refs — owned here, passed to both sub-components
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mutedRef    = useRef<boolean>(false);
  const bpmRef      = useRef<number>(120);
  const swingRef    = useRef<number>(15);
  const velRef      = useRef<number>(75);

  // New slider refs
  const atckRef = useRef<number>(30);
  const relRef  = useRef<number>(40);
  const filtRef = useRef<number>(70);
  const chdRef  = useRef<number>(50);

  // Knob/slider state (drives UI and syncs refs)
  const [knobs, setKnobs] = useState({ rate: 50, swing: 15, vel: 75, dens: 50, mod: 50, atck: 30, rel: 40, filt: 70, chd: 50 });
  const [muted,      setMuted]      = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const [activeMode, setActiveMode] = useState(1);

  // Sync refs from state on every render
  bpmRef.current   = Math.round(60 + (knobs.rate / 100) * 120);
  swingRef.current = knobs.swing;
  velRef.current   = knobs.vel;
  mutedRef.current = muted;
  atckRef.current  = knobs.atck;
  relRef.current   = knobs.rel;
  filtRef.current  = knobs.filt;
  chdRef.current   = knobs.chd;

  // Mobile detection
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Keyboard shortcut: M = mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "m" || e.key === "M") setMuted(v => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const border  = "1px solid rgba(10,10,10,0.12)";
  const mono    = "var(--font-geist-mono, monospace)";
  const bpmVal  = Math.round(60 + (knobs.rate / 100) * 120);

  const sliderLabels = activeMode === 6
    ? ["NODES", "TENSION", "CHAOS", "GLOW", "WARMTH", "CHORD"]
    : ["DENS",  "MOD",     "ATCK",  "REL",  "FILT",   "CHD"];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#F2F0EC",
      fontFamily: mono,
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: border,
        padding: "0 16px",
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: 12,
      }}>
        <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "#9A9A9A", textTransform: "uppercase", flexShrink: 0 }}>
          {labels.portfolio_code}
        </span>
        <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "#9A9A9A", textTransform: "uppercase" }}>
          {labels.tagline}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.06em", color: "#9A9A9A" }}>
            {bpmVal} BPM
          </span>
          <button
            onClick={() => setMuted(m => !m)}
            title="Mute (M)"
            style={{
              fontSize: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted ? "rgba(10,10,10,0.28)" : "#1E44F0",
              fontFamily: mono,
              padding: 0,
              lineHeight: 1,
            }}
          >
            {muted ? "○" : "●"}
          </button>
        </div>
      </div>

      {/* Main row */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        flexDirection: isMobile ? "column" : "row",
      }}>
        {/* Identity column — desktop only */}
        {!isMobile && (
          <div style={{
            width: 160,
            borderRight: border,
            flexShrink: 0,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}>
            <h1 style={{
              fontFamily: "var(--font-geist-sans, sans-serif)",
              fontSize: "clamp(1.2rem,2vw,1.8rem)",
              fontWeight: 700,
              lineHeight: 1.02,
              margin: "0 0 10px 0",
              color: "#0A0A0A",
              letterSpacing: "-0.02em",
            }}>
              Clayton<br />Borges
            </h1>
            <p style={{ fontFamily: mono, fontSize: 9, color: "#9A9A9A", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 6px 0", lineHeight: 1.5 }}>
              Creative /<br />Full-Stack Dev.
            </p>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#0A0A0A", letterSpacing: "0.04em" }}>
              {labels.live_label}
            </span>
          </div>
        )}

        {/* Drum machine panel — compact */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: border,
          minWidth: 0,
          minHeight: isMobile ? 220 : "auto",
        }}>
          <div style={{ padding: "3px 10px", borderBottom: border, flexShrink: 0 }}>
            <span style={{ fontSize: 8, color: "#9A9A9A", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
              DRUM-01
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <DrumMachineSketch
              audioCtxRef={audioCtxRef}
              mutedRef={mutedRef}
              bpmRef={bpmRef}
              swingRef={swingRef}
              velRef={velRef}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Synth panel — dominant */}
        <div style={{
          flex: 1.6,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: isMobile ? 320 : "auto",
        }}>
          <div style={{ padding: "3px 10px", borderBottom: border, flexShrink: 0 }}>
            <span style={{ fontSize: 8, color: "#9A9A9A", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
              SYNTH-01
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <InstrumentSketchDynamic
              labels={labels}
              audioCtxRef={audioCtxRef}
              mutedRef={mutedRef}
              bpmRef={bpmRef}
              dens={knobs.dens}
              mod={knobs.mod}
              onDensChange={(v) => setKnobs(k => ({ ...k, dens: v }))}
              onModChange={(v) => setKnobs(k => ({ ...k, mod: v }))}
              atck={knobs.atck}
              rel={knobs.rel}
              filt={knobs.filt}
              chd={knobs.chd}
              onAtckChange={(v) => setKnobs(k => ({ ...k, atck: v }))}
              onRelChange={(v)  => setKnobs(k => ({ ...k, rel: v }))}
              onFiltChange={(v) => setKnobs(k => ({ ...k, filt: v }))}
              onChdChange={(v)  => setKnobs(k => ({ ...k, chd: v }))}
              muted={muted}
              onMuteToggle={() => setMuted(m => !m)}
              isMobile={isMobile}
              onModeChange={setActiveMode}
            />
          </div>
        </div>
      </div>

      {/* Unified groovebox control strip */}
      <div style={{
        borderTop: border,
        padding: "8px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        flexShrink: 0,
      }}>
        {/* Synth sliders */}
        <Slider label={sliderLabels[0]} value={knobs.dens}  onDrag={(v) => setKnobs(k => ({ ...k, dens: v }))} />
        <Slider label={sliderLabels[1]} value={knobs.mod}   onDrag={(v) => setKnobs(k => ({ ...k, mod: v }))}  />
        <Slider label={sliderLabels[2]} value={knobs.atck}  onDrag={(v) => setKnobs(k => ({ ...k, atck: v }))} />
        <Slider label={sliderLabels[3]} value={knobs.rel}   onDrag={(v) => setKnobs(k => ({ ...k, rel: v }))}  />
        <Slider label={sliderLabels[4]} value={knobs.filt}  onDrag={(v) => setKnobs(k => ({ ...k, filt: v }))} />
        <Slider label={sliderLabels[5]} value={knobs.chd}   onDrag={(v) => setKnobs(k => ({ ...k, chd: v }))}  />

        {/* Divider */}
        <div style={{ width: 1, alignSelf: "stretch", background: "rgba(10,10,10,0.12)", marginTop: 4, marginBottom: 4, flexShrink: 0 }} />

        {/* Drum sliders */}
        <Slider label="SWING" value={knobs.swing} onDrag={(v) => setKnobs(k => ({ ...k, swing: v }))} />
        <Slider label="VEL"   value={knobs.vel}   onDrag={(v) => setKnobs(k => ({ ...k, vel: v }))}   />

        {/* BPM */}
        <Slider
          label="BPM"
          value={knobs.rate}
          onDrag={(v) => setKnobs(k => ({ ...k, rate: v }))}
          displayValue={String(bpmVal)}
          compact={true}
        />

        {/* KB hint */}
        {!isMobile && (
          <span style={{ fontSize: 8, color: "#9A9A9A", letterSpacing: "0.05em", alignSelf: "flex-end", marginLeft: "auto", paddingBottom: 4 }}>
            {labels.kb_hint}
          </span>
        )}
      </div>
    </div>
  );
}
