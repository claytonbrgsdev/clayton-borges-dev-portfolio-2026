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
  const STATS = [
    { target: 27, label: isPt ? "Experimentos no Lab" : "Lab experiments"    },
    { target: 3,  label: isPt ? "Anos em produção"    : "Years in production" },
  ];
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

  return (
    <div
      ref={stripRef}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1px",
        background: "var(--rule)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {STATS.map(({ target, label }) => (
        <div
          key={label}
          style={{
            background: "var(--bg)",
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(40px,6vw,80px)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            <span data-target={target}>{String(target).padStart(String(target).length, "0")}</span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
