"use client";
import { useRef, useState, useCallback } from "react";

interface SliderProps {
  label: string;
  value: number;          // 0–100
  onDrag: (v: number) => void;
  displayValue?: string;  // override shown below slider
  accent?: string;        // defaults to "#6B35D9"
  compact?: boolean;      // true = shorter slider for bottom bar
}

export function Slider({ label, value, onDrag, displayValue, accent = "#6B35D9", compact = false }: SliderProps) {
  const dragRef = useRef<{ sy: number; sv: number } | null>(null);
  const [focused, setFocused] = useState(false);

  const trackH  = compact ? 36 : 72;
  const thumbH  = compact ? 16 : 20;
  const thumbW  = 12;
  const totalH  = compact ? 64 : 120;
  const trackTop = 8;
  const sensitivity = compact ? 0.4 : 0.65;

  // thumbY: 8 (value=100) to trackTop + trackH - thumbH (value=0)
  const thumbY    = trackTop + (1 - value / 100) * (trackH - thumbH);
  const thumbCtrY = thumbY + thumbH / 2;
  const trackBot  = trackTop + trackH;

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sy: e.clientY, sv: value };
    e.preventDefault();
  }, [value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const delta = dragRef.current.sy - e.clientY;
    const newVal = clamp(Math.round(dragRef.current.sv + delta * sensitivity));
    onDrag(newVal);
  }, [onDrag, sensitivity]);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp")   { onDrag(clamp(value + 2)); e.preventDefault(); }
    if (e.key === "ArrowDown") { onDrag(clamp(value - 2)); e.preventDefault(); }
    if (e.key === "Home")      { onDrag(0); e.preventDefault(); }
    if (e.key === "End")       { onDrag(100); e.preventDefault(); }
  }, [value, onDrag]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, userSelect: "none" }}>
      {/* Label */}
      <span style={{
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: 8,
        letterSpacing: "0.1em",
        color: "#9A9A9A",
        textTransform: "uppercase" as const,
        marginBottom: 4,
        lineHeight: 1,
      }}>
        {label}
      </span>

      {/* Interactive track area */}
      <div
        role="slider"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: "relative",
          width: 36,
          height: totalH - 28, // subtract label + value heights
          cursor: "ns-resize",
          touchAction: "none",
          outline: focused ? `2px solid ${accent}` : "none",
          borderRadius: 2,
        }}
      >
        {/* Track background */}
        <div style={{
          position: "absolute",
          left: 17,
          top: trackTop,
          width: 2,
          height: trackH,
          background: "rgba(10,10,10,0.14)",
          borderRadius: 1,
        }} />

        {/* Track fill (thumb center to bottom) */}
        {thumbCtrY < trackBot && (
          <div style={{
            position: "absolute",
            left: 17,
            top: thumbCtrY,
            width: 2,
            height: trackBot - thumbCtrY,
            background: accent,
            borderRadius: 1,
          }} />
        )}

        {/* Thumb */}
        <div style={{
          position: "absolute",
          left: (36 - thumbW) / 2,
          top: thumbY,
          width: thumbW,
          height: thumbH,
          background: accent,
          borderRadius: 2,
          boxShadow: `0 1px 4px rgba(107,53,217,0.25)`,
        }} />
      </div>

      {/* Value */}
      <span style={{
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: 9,
        color: "#0A0A0A",
        letterSpacing: "0.04em",
        marginTop: 4,
        lineHeight: 1,
      }}>
        {displayValue ?? String(value).padStart(3, "0")}
      </span>
    </div>
  );
}
