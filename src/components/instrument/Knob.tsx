"use client";

import { useRef } from "react";

interface KnobProps {
  label: string;
  value: number;
  onDrag: (v: number) => void;
  displayValue?: string;
}

export function Knob({ label, value, onDrag, displayValue }: KnobProps) {
  const drag = useRef<{ sy: number; sv: number } | null>(null);
  const angle = -135 + (value / 100) * 270;
  const rad   = (angle * Math.PI) / 180;
  const CX = 22, CY = 22, R = 14;
  const lx  = CX + R * Math.sin(rad);
  const ly  = CY - R * Math.cos(rad);

  // filled arc endpoints
  const startRad = -135 * Math.PI / 180;
  const endRad   = rad;
  const sx = CX + R * Math.sin(startRad);
  const sy2 = CY - R * Math.cos(startRad);
  const ex = CX + R * Math.sin(endRad);
  const ey = CY - R * Math.cos(endRad);
  const largeArc = (angle - (-135)) > 180 ? 1 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{ fontFamily: "var(--font-geist-mono,monospace)", fontSize: 9, letterSpacing: "0.1em", color: "#9A9A9A", textTransform: "uppercase" }}>
        {label}
      </span>
      <div
        style={{ cursor: "ns-resize", userSelect: "none", touchAction: "none" }}
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { sy: e.clientY, sv: value }; }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          onDrag(Math.round(Math.max(0, Math.min(100, drag.current.sv + (drag.current.sy - e.clientY) / 1.5))));
        }}
        onPointerUp={() => { drag.current = null; }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp")   onDrag(Math.min(100, value + 2));
          if (e.key === "ArrowDown") onDrag(Math.max(0,   value - 2));
        }}
      >
        <svg width={44} height={44} viewBox="0 0 44 44" style={{ display: "block" }}>
          {/* Track: full 270° arc */}
          <path d="M 12.1 31.9 A 14 14 0 1 1 31.9 31.9" fill="none" stroke="rgba(10,10,10,0.12)" strokeWidth={2} strokeLinecap="round" />
          {/* Filled portion (start → current value) */}
          {value > 0 && (
            <path
              d={`M ${sx.toFixed(1)} ${sy2.toFixed(1)} A 14 14 0 ${largeArc} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`}
              fill="none"
              stroke="#0A0A0A"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
          {/* Indicator line */}
          <line x1={CX} y1={CY} x2={lx.toFixed(2)} y2={ly.toFixed(2)} stroke="#0A0A0A" strokeWidth={2} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={2} fill="#0A0A0A" />
        </svg>
      </div>
      <span style={{ fontFamily: "var(--font-geist-mono,monospace)", fontSize: 10, color: "#0A0A0A", letterSpacing: "0.04em" }}>
        {displayValue ?? String(value).padStart(3, "0")}
      </span>
    </div>
  );
}
