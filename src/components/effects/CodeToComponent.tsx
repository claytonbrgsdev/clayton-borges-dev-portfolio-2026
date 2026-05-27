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
    if (!container || !codeLayer || !renderedLayer) return;

    gsap.set(codeLayer, { opacity: 1, filter: "blur(0px)" });
    gsap.set(renderedLayer, { opacity: 0, scale: 0.98 });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      end: "center 10%",
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        // Code layer: fully visible for first 30%, then fades out through 80%
        if (p < 0.3) {
          gsap.set(codeLayer, { opacity: 1, filter: "blur(0px)" });
          gsap.set(renderedLayer, { opacity: 0, scale: 0.98 });
        } else if (p < 0.8) {
          const local = (p - 0.3) / 0.5;
          gsap.set(codeLayer, { opacity: 1 - local, filter: `blur(${local * 4}px)` });
          gsap.set(renderedLayer, { opacity: 0, scale: 0.98 });
        } else {
          const local = (p - 0.5) / 0.5;
          gsap.set(codeLayer, { opacity: 0, filter: "blur(4px)" });
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
      <div ref={renderedLayerRef} style={{ opacity: 0 }}>
        {children}
      </div>
      <div
        ref={codeLayerRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="font-mono text-xs text-white/40 mb-2 tracking-widest uppercase select-none">
          ← source code
        </div>
        {codeBlock}
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
