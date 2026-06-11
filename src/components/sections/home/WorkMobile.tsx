"use client";
import { featuredProjects } from "@/lib/data/projects";

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export function WorkMobile({ locale }: { locale: string }) {
  const isPt = locale === "pt";

  return (
    <section id="work" style={{ background: "#0A0909", borderTop: "1px solid var(--rule)" }}>

      {/* ── Mobile editorial header — wraps, never clips mid-word ── */}
      <div style={{
        borderBottom: "1px solid var(--rule)",
        padding: "clamp(28px, 8vw, 44px) clamp(20px, 5vw, 32px) clamp(20px, 5vw, 28px)",
      }}>
        <span style={{ ...MONO, fontSize: 11, color: "var(--accent-orange)" }}>
          {isPt ? "02 — Trabalhos" : "02 — Work"}
        </span>
        <h2 style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "clamp(34px, 11vw, 60px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 0.92,
          textTransform: "uppercase",
          margin: "14px 0 0",
          overflowWrap: "break-word",
        }}>
          {isPt ? "Projetos Selecionados" : "Selected Projects"}
        </h2>
      </div>

      {/* ── Vertical stack of self-contained project cards ── */}
      {featuredProjects.map((p, i) => {
        const name = isPt ? p.namePt : p.nameEn;
        const desc = isPt ? p.descriptionPt : p.descriptionEn;
        const isLast = i === featuredProjects.length - 1;

        return (
          <article
            key={p.id}
            style={{
              borderBottom: isLast ? undefined : "1px solid var(--rule)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Hero image */}
            <div style={{
              position: "relative",
              aspectRatio: "4 / 3",
              overflow: "hidden",
              background: "var(--bg-elevated)",
              borderBottom: "1px solid var(--rule)",
            }}>
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.7,
                  }}
                />
              )}
              {/* Orange top accent line */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 2,
                background: "var(--accent-orange)",
              }} />
              {/* Index badge */}
              <span style={{
                ...MONO,
                position: "absolute",
                top: 12,
                left: 14,
                fontSize: 11,
                color: "var(--accent-orange)",
                background: "rgba(10,9,9,0.75)",
                padding: "4px 10px",
                border: "1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Year badge */}
              <span style={{
                ...MONO,
                position: "absolute",
                top: 12,
                right: 14,
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                background: "rgba(10,9,9,0.75)",
                padding: "4px 10px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                {p.year}
              </span>
            </div>

            {/* Card body */}
            <div style={{
              padding: "clamp(20px, 5vw, 28px) clamp(20px, 5vw, 32px) clamp(24px, 6vw, 32px)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              <h3 style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(20px, 6.5vw, 28px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                textTransform: "uppercase",
                lineHeight: 1.02,
                margin: 0,
                overflowWrap: "break-word",
              }}>
                {name}
              </h3>

              <p style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "clamp(13px, 3.8vw, 15px)",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
                margin: 0,
              }}>
                {desc}
              </p>

              {/* Tech chips — first 4 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {p.tech.slice(0, 4).map(t => (
                  <span key={t} style={{
                    ...MONO,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    padding: "5px 10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* CTA */}
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...MONO,
                    fontSize: 12,
                    color: "var(--accent-orange)",
                    textDecoration: "none",
                    border: "1px solid color-mix(in srgb, var(--accent-orange) 40%, transparent)",
                    padding: "0 18px",
                    minHeight: 44,
                    display: "inline-flex",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  {isPt ? "Ver Projeto →" : "View Project →"}
                </a>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
