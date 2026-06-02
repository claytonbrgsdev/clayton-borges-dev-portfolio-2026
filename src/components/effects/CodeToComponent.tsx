"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface CodeToComponentProps {
  children: ReactNode;
  codeBlock: ReactNode;
  className?: string;
}

export function CodeToComponent({ children, codeBlock, className }: CodeToComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const codeLayerRef = useRef<HTMLDivElement>(null);
  const renderedLayerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [skipEffect, setSkipEffect] = useState<boolean | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    setSkipEffect(prefersReducedMotion || isMobile);
  }, []);

  useEffect(() => {
    if (skipEffect !== false) return;

    const container = containerRef.current;
    const codeLayer = codeLayerRef.current;
    const renderedLayer = renderedLayerRef.current;
    const hint = hintRef.current;
    if (!container || !codeLayer || !renderedLayer || !hint) return;

    gsap.set(codeLayer, { opacity: 1, filter: "blur(0px)" });
    gsap.set(renderedLayer, { opacity: 0, scale: 0.98 });
    gsap.set(hint, { opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: container,
      // Wider scroll window — gives the user ~3× more time to read the transition
      start: "top 92%",
      end: "bottom 20%",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        // 0.00 → 0.35  — code fully visible, hint hidden
        if (p < 0.35) {
          gsap.set(codeLayer, { opacity: 1, filter: "blur(0px)" });
          gsap.set(renderedLayer, { opacity: 0, scale: 0.98 });
          gsap.set(hint, { opacity: 0 });
        }
        // 0.35 → 0.65  — hint fades in, code starts blurring
        else if (p < 0.65) {
          const local = (p - 0.35) / 0.30;
          gsap.set(codeLayer, { opacity: 1 - local * 0.9, filter: `blur(${local * 5}px)` });
          gsap.set(hint, { opacity: Math.min(local * 2, 0.55) }); // peak at 0.55
          gsap.set(renderedLayer, { opacity: 0, scale: 0.98 });
        }
        // 0.65 → 1.00  — hint fades out, rendered fades in
        else {
          const local = (p - 0.65) / 0.35;
          gsap.set(codeLayer, { opacity: 0, filter: "blur(5px)" });
          gsap.set(hint, { opacity: 0.55 * (1 - local) });
          gsap.set(renderedLayer, { opacity: local, scale: 0.98 + local * 0.02 });
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [skipEffect]);

  if (skipEffect === null) {
    return <div className={className}>{children}</div>;
  }

  if (skipEffect) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* Rendered layer — destination state */}
      <div ref={renderedLayerRef} style={{ opacity: 0 }}>
        {children}
      </div>

      {/* Code layer — source state */}
      <div
        ref={codeLayerRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Source label */}
        <div className="font-mono text-xs mb-2 select-none" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
          {"</ JSX Source >"}
        </div>
        {codeBlock}
      </div>

      {/* Mid-transition hint — appears only during the crossfade */}
      <div
        ref={hintRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0 }}
      >
        <span className="font-mono text-xs select-none" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>
          source → rendered
        </span>
      </div>
    </div>
  );
}

interface CodeBlockProps {
  lines: ReactNode[];
  className?: string;
}

export function CodeBlock({ lines, className }: CodeBlockProps) {
  return (
    <pre
      className={`font-mono text-xs md:text-sm leading-relaxed overflow-hidden rounded-sm backdrop-blur-sm ${className ?? ""}`}
      style={{
        background: "rgba(5, 8, 14, 0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "1.25rem 1.25rem 1.25rem 0",
        margin: 0,
        color: "#cfd8dc",
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", gap: "1rem", paddingInline: "0.5rem" }}>
          <span
            aria-hidden="true"
            style={{
              color: "#546e7a",
              userSelect: "none",
              width: "2ch",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{line}</span>
        </div>
      ))}
    </pre>
  );
}

const SYNTAX_COLORS = {
  tag: "rgba(130, 170, 255, 0.85)",
  attr: "rgba(199, 146, 234, 0.85)",
  string: "rgba(195, 232, 141, 0.85)",
  expr: "#f78c6c",
  comment: "#546e7a",
  punct: "#cfd8dc",
} as const;

export const Syntax = {
  Tag: ({ children }: { children: ReactNode }) => (
    <span style={{ color: SYNTAX_COLORS.tag }}>{children}</span>
  ),
  Attr: ({ children }: { children: ReactNode }) => (
    <span style={{ color: SYNTAX_COLORS.attr }}>{children}</span>
  ),
  Str: ({ children }: { children: ReactNode }) => (
    <span style={{ color: SYNTAX_COLORS.string }}>{children}</span>
  ),
  Expr: ({ children }: { children: ReactNode }) => (
    <span style={{ color: SYNTAX_COLORS.expr }}>{children}</span>
  ),
  Comment: ({ children }: { children: ReactNode }) => (
    <span style={{ color: SYNTAX_COLORS.comment, fontStyle: "italic" }}>{children}</span>
  ),
  Punct: ({ children }: { children: ReactNode }) => (
    <span style={{ color: SYNTAX_COLORS.punct }}>{children}</span>
  ),
};
