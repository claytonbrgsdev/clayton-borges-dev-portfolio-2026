"use client";
import { useEffect, useRef } from "react";

function animCounter(el: HTMLElement, target: number, duration: number) {
  const start = performance.now();
  const pad   = String(target).length;
  const step  = (now: number) => {
    const prog  = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.floor(eased * target).toString().padStart(pad, "0");
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = String(target).padStart(pad, "0");
  };
  requestAnimationFrame(step);
}

export function StatsStrip({ locale }: { locale: string }) {
  const isPt = locale === "pt";
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.querySelectorAll<HTMLElement>("[data-target]").forEach((counter, i) => {
        setTimeout(() => {
          animCounter(counter, parseInt(counter.dataset.target!), 1200);
        }, i * 180);
      });
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const CELL: React.CSSProperties = {
    background: "var(--bg)",
    padding: "clamp(16px,4vw,28px) clamp(16px,5vw,32px)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  const LABEL: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: 9,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  };

  const BIG: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "clamp(28px,6vw,80px)",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    lineHeight: 1,
  };

  const MED: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: "clamp(18px,2vw,28px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    color: "var(--text)",
  };

  const SUB: React.CSSProperties = {
    fontFamily: "var(--font-geist-mono)",
    fontSize: 10,
    letterSpacing: "0.04em",
    color: "var(--text-muted)",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  };

  return (
    <div
      ref={stripRef}
      className="grid grid-cols-1 sm:grid-cols-3"
      style={{
        gap: "1px",
        background: "var(--rule)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {/* Col 1 — 3 years in production (counter) */}
      <div style={CELL}>
        <div style={BIG}>
          <span data-target={3}>3</span>
        </div>
        <div style={LABEL}>
          {isPt ? "Anos em produção" : "Years in production"}
        </div>
      </div>

      {/* Col 2 — Freelance narrative */}
      <div style={CELL}>
        <div style={MED}>Freelance</div>
        <div style={SUB}>
          {isPt
            ? "Clientes e empresas\nno Brasil e no exterior"
            : "Clients & companies\nacross Brazil and beyond"}
        </div>
      </div>

      {/* Col 3 — The Lab */}
      <div style={CELL}>
        <div style={MED}>The Lab</div>
        <div style={SUB}>
          {isPt
            ? "Experimentos visuais interativos\nem física, matemática e design"
            : "Interactive experiments\nin physics, math & design"}
        </div>
      </div>
    </div>
  );
}
