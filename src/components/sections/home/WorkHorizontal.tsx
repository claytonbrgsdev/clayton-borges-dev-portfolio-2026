"use client";
import { useEffect, useRef } from "react";
import { featuredProjects } from "@/lib/data/projects";

export function WorkHorizontal({ locale }: { locale: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;

    const setHeight = () => {
      const range = track.scrollWidth - window.innerWidth + 80;
      outer.style.height = `calc(100vh + ${range}px)`;
    };
    setHeight();
    window.addEventListener("resize", setHeight);

    const onScroll = () => {
      const outerTop    = outer.getBoundingClientRect().top + window.scrollY;
      const scrollIn    = window.scrollY - outerTop;
      const scrollRange = outer.offsetHeight - window.innerHeight;
      let progress = 0;
      if (scrollIn > 0 && scrollIn < scrollRange) {
        progress = scrollIn / scrollRange;
      } else if (scrollIn >= scrollRange) {
        progress = 1;
      }
      const trackRange = track.scrollWidth - window.innerWidth;
      track.style.transform = `translateX(${-trackRange * progress}px)`;
      if (fillRef.current)
        fillRef.current.style.width = (progress * 100) + "%";
    };
    // LenisProvider's effect runs after this (parent effects run after children).
    // Defer subscription via setTimeout so __lenis is available.
    let lenisCleanup: (() => void) | null = null;
    const timer = setTimeout(() => {
      const lenis = (window as unknown as Record<string, unknown>).__lenis as
        { on: (e: string, fn: () => void) => void; off: (e: string, fn: () => void) => void } | undefined;
      if (lenis) {
        lenis.on("scroll", onScroll);
        lenisCleanup = () => lenis.off("scroll", onScroll);
      } else {
        // Fallback: RAF polling if Lenis isn't available
        let rafId: number;
        const loop = () => { onScroll(); rafId = requestAnimationFrame(loop); };
        rafId = requestAnimationFrame(loop);
        lenisCleanup = () => cancelAnimationFrame(rafId);
      }
      onScroll();
    }, 0);

    return () => {
      clearTimeout(timer);
      lenisCleanup?.();
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  return (
    <div ref={outerRef} style={{ position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          position: "absolute", top: 32, left: 32, right: 32, zIndex: 10,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-geist-mono)", fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: 16,
              marginBottom: 12,
            }}>
              02 — Work
              <span style={{ flex: 1, height: 1, background: "var(--rule)", display: "block", minWidth: 60 }} />
            </div>
            <h2 style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(28px,4vw,54px)", fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 0.95,
            }}>
              Selected<br />Projects
            </h2>
          </div>

          {/* Progress bar */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "var(--font-geist-mono)", fontSize: 9,
              color: "var(--text-muted)", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Scroll
            </div>
            <div style={{ width: 120, height: 1, background: "var(--rule)", position: "relative", marginLeft: "auto" }}>
              <div
                ref={fillRef}
                style={{
                  position: "absolute", top: 0, left: 0,
                  height: "100%", width: "0%",
                  background: "var(--accent-orange)",
                  transition: "width 80ms linear",
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrolling track */}
        <div
          ref={trackRef}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 40,
            padding: "0 32px",
            paddingTop: "calc(48px + 32px + 54px * 1.2 + 60px)",
            paddingBottom: 32,
            height: "100%",
            willChange: "transform",
          }}
        >
          {featuredProjects.map((project, i) => {
            const name = locale === "pt" ? project.namePt : project.nameEn;
            const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;

            const cardStyle: React.CSSProperties = {
              flexShrink: 0,
              width: "clamp(440px,68vw,860px)",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "45% 55%",
              border: "1px solid var(--rule)",
              textDecoration: "none",
              color: "inherit",
              overflow: "hidden",
              transition: "border-color 300ms",
            };

            const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-orange)";
            };
            const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--rule)";
            };

            const inner = (
              <>
                {/* Left col */}
                <div style={{
                  padding: 32, display: "flex", flexDirection: "column",
                  justifyContent: "space-between",
                  borderRight: "1px solid var(--rule)",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "clamp(22px,3vw,36px)", fontWeight: 800,
                      letterSpacing: "-0.02em", lineHeight: 1.05,
                      marginBottom: 16,
                    }}>
                      {name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-geist-mono)", fontSize: 11,
                      color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16,
                    }}>
                      {desc}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {project.year && (
                      <span style={{
                        fontFamily: "var(--font-geist-mono)", fontSize: 8,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "var(--accent-orange)", padding: "3px 7px",
                        border: "1px solid color-mix(in srgb, var(--accent-orange) 30%, transparent)",
                      }}>
                        {project.year}
                      </span>
                    )}
                    {project.tech.slice(0, 3).map(t => (
                      <span key={t} style={{
                        fontFamily: "var(--font-geist-mono)", fontSize: 8,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "var(--text-muted)", padding: "3px 7px",
                        border: "1px solid var(--rule)",
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right col */}
                <div style={{
                  background: "var(--bg-elevated)",
                  position: "relative", overflow: "hidden",
                  display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                  padding: 16,
                }}>
                  {project.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image}
                      alt={name}
                      style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover", opacity: 0.45,
                      }}
                    />
                  )}
                  <span style={{
                    fontFamily: "var(--font-geist-mono)", fontSize: 8,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--rule)", writingMode: "vertical-rl",
                    position: "relative", zIndex: 1,
                  }}>
                    {project.id.toUpperCase()}.SYS
                  </span>
                </div>
              </>
            );

            if (project.liveUrl) {
              return (
                <a
                  key={project.id}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={cardStyle}
                  onMouseEnter={handleEnter}
                  onMouseLeave={handleLeave}
                >
                  {inner}
                </a>
              );
            }
            return (
              <div
                key={project.id}
                style={cardStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
