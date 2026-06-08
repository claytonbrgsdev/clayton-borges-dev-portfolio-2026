import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0A0909",
          position: "relative",
          padding: "60px 72px",
        }}
      >
        {/* Orange accent line top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "#FF6B00",
          }}
        />

        {/* Grid lines — decorative */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,107,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Top row: dot + identifier */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              background: "#FF6B00",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            CB-2025 · PORTFOLIO
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 0.9,
              color: "#FFFFFF",
            }}
          >
            Clayton
          </div>
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 0.9,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Borges
          </div>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 2,
              background: "#FF6B00",
              marginTop: 8,
              marginBottom: 4,
            }}
          />

          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 22,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 400,
            }}
          >
            Full-Stack &amp; Creative Developer
          </div>
        </div>

        {/* Bottom row: stack */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 40,
          }}
        >
          {["React", "Next.js", "Three.js", "GSAP", "Python"].map((tech) => (
            <span
              key={tech}
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                padding: "5px 12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Orange accent line bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(255,107,0,0.25)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
