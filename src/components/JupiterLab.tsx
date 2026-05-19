"use client";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const BG = "#050508";
const SCROLL_VH = 900;

// ─── math ─────────────────────────────────────────────────────────────────────
function ss(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function secAlpha(p: number, i0: number, i1: number, o0: number, o1: number) {
  if (p <= i0 || p >= o1) return 0;
  if (p < i1) return ss(i0, i1, p);
  if (p > o0) return 1 - ss(o0, o1, p);
  return 1;
}
function applyOverlay(el: HTMLDivElement | null, a: number) {
  if (!el) return;
  el.style.opacity       = a.toFixed(3);
  el.style.pointerEvents = a > 0.05 ? "auto" : "none";
}

// ─── atmospheric band definitions ─────────────────────────────────────────────
// [yFrom, yTo (−1..1 of radius), [R,G,B], driftRate, turbFrac (of band height)]
type Band = readonly [number, number, readonly [number,number,number], number, number];

const BANDS: Band[] = [
  [-1.00, -0.74, [ 10,  12,  22], 0.08, 0.22], // north polar — deep dark
  [-0.74, -0.60, [ 78,  84, 104], 0.18, 0.52], // north temperate zone — cool blue-gray
  [-0.60, -0.44, [ 30,  32,  44], 0.30, 0.70], // north temperate belt — dark
  [-0.44, -0.26, [148, 142, 132], 0.42, 0.88], // north equatorial zone — warm silver
  [-0.26, -0.08, [ 40,  36,  34], 0.54, 1.10], // north equatorial belt — deep charcoal
  [-0.08,  0.10, [174, 176, 188], 0.60, 0.78], // equatorial zone — brightest band
  [ 0.10,  0.32, [ 36,  34,  42], 0.54, 1.20], // south equatorial belt — vortex lives here
  [ 0.32,  0.48, [130, 124, 116], 0.42, 0.88], // south tropical zone — warm gray
  [ 0.48,  0.62, [ 32,  34,  48], 0.30, 0.65], // south temperate belt — cool dark
  [ 0.62,  0.75, [ 66,  70,  88], 0.18, 0.48], // south zone — muted blue
  [ 0.75,  0.86, [ 22,  24,  36], 0.12, 0.32], // south polar belt — dark
  [ 0.86,  1.00, [ 10,  12,  22], 0.08, 0.18], // south polar cap — deepest dark
];

// ─── draw one atmospheric band ────────────────────────────────────────────────
// Both edges undulate with multi-frequency sine waves (differential drift per band).
// Called while clipped to the planet sphere.
function drawBand(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  band: Band,
  t: number,
  turbMult: number   // 0→1, grows with scroll — bands calm early, turbulent later
) {
  const [y0f, y1f, col, drift, turbFrac] = band;
  const y0   = cy + y0f * r;
  const y1   = cy + y1f * r;
  const amp  = Math.abs(y1 - y0) * turbFrac * turbMult;
  const nPts = 72;

  ctx.beginPath();

  // Top edge — left to right
  for (let i = 0; i <= nPts; i++) {
    const fx = i / nPts;
    const x  = cx - r + fx * 2 * r;
    const dy =
      amp * 0.55 * Math.sin(fx * 4.7  + t * drift) +
      amp * 0.30 * Math.sin(fx * 9.1  + t * drift * 1.6 + 1.3) +
      amp * 0.15 * Math.sin(fx * 16.8 + t * drift * 0.9 + 2.7);
    if (i === 0) ctx.moveTo(x, y0 + dy);
    else         ctx.lineTo(x, y0 + dy);
  }

  // Bottom edge — right to left
  for (let i = nPts; i >= 0; i--) {
    const fx = i / nPts;
    const x  = cx - r + fx * 2 * r;
    const dy =
      amp * 0.55 * Math.sin(fx * 5.3  + t * drift + 0.9) +
      amp * 0.30 * Math.sin(fx * 8.6  + t * drift * 1.4 + 2.2) +
      amp * 0.15 * Math.sin(fx * 14.9 + t * drift * 0.8 + 0.5);
    ctx.lineTo(x, y1 + dy);
  }

  ctx.closePath();
  ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
  ctx.fill();
}

// ─── draw subtle wisp tendrils at a band boundary ────────────────────────────
// Thin curving strokes that bleed across band edges — where gas clouds shear.
function drawWisps(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  yBoundaryFrac: number,
  t: number, drift: number,
  alpha: number
) {
  if (alpha < 0.008) return;
  const yB = cy + yBoundaryFrac * r;
  const nWisps = 8;

  for (let i = 0; i < nWisps; i++) {
    const phase  = (i / nWisps) * Math.PI * 2;
    const fx     = 0.1 + ((i + 0.5) / nWisps) * 0.8;
    const x0     = cx - r + fx * 2 * r;
    const length = r * (0.05 + 0.08 * Math.abs(Math.sin(phase + t * 0.2)));
    const curl   = Math.sin(t * drift * 0.6 + phase) * length * 0.5;

    ctx.strokeStyle = `rgba(200,204,220,${(alpha * (0.08 + 0.12 * Math.sin(phase + t * 0.3))).toFixed(4)})`;
    ctx.lineWidth   = 0.6 + 0.4 * Math.sin(phase);
    ctx.beginPath();
    ctx.moveTo(x0, yB);
    ctx.bezierCurveTo(
      x0 + curl, yB - length * 0.4,
      x0 + curl * 1.5, yB + length * 0.4,
      x0 + curl * 0.5, yB + length
    );
    ctx.stroke();
  }
}

// ─── draw the Great Vortex (our "Great Red Spot") ─────────────────────────────
function drawVortex(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  t: number, alpha: number
) {
  if (alpha < 0.005) return;

  // Positioned in the South Equatorial Belt
  const vcx = cx - r * 0.08;
  const vcy = cy + r * 0.20;
  const vw  = r * 0.21;  // semi-major
  const vh  = r * 0.13;  // semi-minor

  ctx.save();
  ctx.globalAlpha = alpha;

  // Base oval — chrome radial gradient
  ctx.beginPath();
  ctx.ellipse(vcx, vcy, vw, vh, 0, 0, Math.PI * 2);
  const base = ctx.createRadialGradient(vcx - vw * 0.1, vcy - vh * 0.12, 0, vcx, vcy, vw);
  base.addColorStop(0,    "rgba(200,204,222,1)");
  base.addColorStop(0.28, "rgba(145,150,170,1)");
  base.addColorStop(0.65, "rgba(68, 72, 88, 1)");
  base.addColorStop(1,    "rgba(34, 36, 50, 1)");
  ctx.fillStyle = base;
  ctx.fill();

  // Clip to oval for swirl rings
  ctx.beginPath();
  ctx.ellipse(vcx, vcy, vw, vh, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.clip();

  const nRings = 8;
  for (let i = 1; i <= nRings; i++) {
    const f  = i / nRings;
    const rw = vw * (1 - f * 0.86);
    const rh = vh * (1 - f * 0.86);
    if (rw < 3 || rh < 3) continue;
    // Inner rings rotate faster (differential rotation inside the storm)
    const ang = t * 0.06 * (0.4 + f * 1.0);
    ctx.strokeStyle = `rgba(195,200,220,${(0.07 + f * 0.20).toFixed(3)})`;
    ctx.lineWidth   = 0.7 + f * 0.5;
    ctx.beginPath();
    ctx.ellipse(vcx, vcy, rw, rh, ang, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore(); // restore to sphere clip (oval clip removed)

  // Eye — bright center
  const eye = ctx.createRadialGradient(vcx - vw * 0.06, vcy - vh * 0.08, 0, vcx, vcy, vw * 0.26);
  eye.addColorStop(0, "rgba(235,238,252,0.75)");
  eye.addColorStop(1, "rgba(235,238,252,0)");
  ctx.fillStyle = eye;
  ctx.beginPath();
  ctx.ellipse(vcx, vcy, vw * 0.26, vh * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── full planet render ───────────────────────────────────────────────────────
function drawPlanet(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  t: number, sp: number
) {
  const emerge    = ss(0.00, 0.14, sp);
  const develop   = ss(0.12, 0.58, sp);
  const vortexAlpha = ss(0.20, 0.42, sp) * (1 - ss(0.93, 1.0, sp));

  // Planet scale: emerges from 28% to full
  const er = r * (0.28 + 0.72 * emerge);

  // Turbulence multiplier: calm early → turbulent mid → calm at end
  const turbMult = 0.35 + 0.65 * develop * (1 - ss(0.88, 1.0, sp) * 0.5);

  // ── outer atmospheric glow (before sphere clip) ──────────────────────────
  if (emerge > 0.04) {
    const glowR = er * 1.10;
    const ga    = emerge * 0.055;
    const gg    = ctx.createRadialGradient(cx, cy, er * 0.92, cx, cy, glowR);
    gg.addColorStop(0, `rgba(75,82,112,${ga.toFixed(3)})`);
    gg.addColorStop(1, "rgba(75,82,112,0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── clip to planet sphere ────────────────────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, er, 0, Math.PI * 2);
  ctx.clip();

  // Dark base
  ctx.fillStyle = "rgb(8,10,18)";
  ctx.fillRect(cx - er, cy - er, er * 2, er * 2);

  // Atmospheric bands (all 12)
  for (const band of BANDS) {
    drawBand(ctx, cx, cy, er, band, t, turbMult);
  }

  // Wisp tendrils at key band boundaries (visible as develop increases)
  if (develop > 0.15) {
    const wispA = develop * 0.7;
    drawWisps(ctx, cx, cy, er, -0.44, t, 0.42, wispA);
    drawWisps(ctx, cx, cy, er, -0.08, t, 0.60, wispA * 1.2);
    drawWisps(ctx, cx, cy, er,  0.10, t, 0.54, wispA * 1.1);
    drawWisps(ctx, cx, cy, er,  0.32, t, 0.42, wispA * 0.8);
  }

  // ── sunlight specular — upper right ─────────────────────────────────────
  {
    const slx = cx + er * 0.24;
    const sly = cy - er * 0.22;
    const sa  = 0.12 + develop * 0.12;
    const sg  = ctx.createRadialGradient(slx, sly, 0, slx, sly, er * 1.35);
    sg.addColorStop(0,   `rgba(225,228,244,${sa.toFixed(3)})`);
    sg.addColorStop(0.38, `rgba(195,198,218,${(sa * 0.38).toFixed(3)})`);
    sg.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(cx - er, cy - er, er * 2, er * 2);
  }

  // ── shadow terminator — left side ────────────────────────────────────────
  {
    const tg = ctx.createRadialGradient(cx + er * 0.28, cy, er * 0.25, cx - er * 0.38, cy, er * 1.15);
    tg.addColorStop(0,   "rgba(0,0,0,0)");
    tg.addColorStop(0.52, "rgba(0,0,0,0.05)");
    tg.addColorStop(1,    "rgba(0,0,0,0.68)");
    ctx.fillStyle = tg;
    ctx.fillRect(cx - er, cy - er, er * 2, er * 2);
  }

  // ── Great Vortex ─────────────────────────────────────────────────────────
  drawVortex(ctx, cx, cy, er, t, vortexAlpha);

  // ── limb darkening — applied last, inside clip ───────────────────────────
  {
    const ld = ctx.createRadialGradient(cx, cy, er * 0.46, cx, cy, er * 1.01);
    ld.addColorStop(0,    "rgba(0,0,0,0)");
    ld.addColorStop(0.58, "rgba(0,0,0,0)");
    ld.addColorStop(0.80, "rgba(0,0,0,0.14)");
    ld.addColorStop(1,    "rgba(0,0,0,0.90)");
    ctx.fillStyle = ld;
    ctx.fillRect(cx - er, cy - er, er * 2, er * 2);
  }

  // ── remove sphere clip ───────────────────────────────────────────────────
  ctx.restore();
}

// ─── component ────────────────────────────────────────────────────────────────
export function JupiterLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s1Ref     = useRef<HTMLDivElement>(null);
  const s2Ref     = useRef<HTMLDivElement>(null);
  const s3Ref     = useRef<HTMLDivElement>(null);
  const s4Ref     = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // HTML section alpha — no setState, pure refs
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const sp = scrollRef.current;
      // Scroll timeline (art gets ~65% of the 900vh journey):
      //  0-17%  art: planet emerges
      // 17-34%  info: identity
      // 34-48%  art: bands develop, wisps appear
      // 48-65%  info: tech stack
      // 65-71%  art: vortex at peak, turbulence maximum
      // 71-89%  info: projects
      // 89-93%  art: resolution
      // 93-100% info: contact
      applyOverlay(s1Ref.current, secAlpha(sp, 0.17, 0.21, 0.30, 0.36));
      applyOverlay(s2Ref.current, secAlpha(sp, 0.48, 0.52, 0.61, 0.67));
      applyOverlay(s3Ref.current, secAlpha(sp, 0.71, 0.75, 0.84, 0.90));
      applyOverlay(s4Ref.current, secAlpha(sp, 0.92, 0.95, 0.99, 1.00));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const DPR = Math.min(devicePixelRatio, 2);
    let raf = 0;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);
    let t = 0;

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      const w  = window.innerWidth;
      const h  = window.innerHeight;
      const sp = scrollRef.current;

      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, w, h);

      // Planet: 46% of the shorter viewport dimension — large and imposing
      const r = Math.min(w, h) * 0.46;
      drawPlanet(ctx!, w * 0.5, h * 0.5, r, t, sp);

      // Scroll hint — first 2.5% of scroll
      if (sp < 0.025) {
        const ia = Math.max(0, 1 - sp * 40) * 0.32;
        ctx!.globalAlpha = ia;
        ctx!.fillStyle   = "rgba(100,110,142,1)";
        ctx!.font        = "10px monospace";
        ctx!.textAlign   = "center";
        ctx!.textBaseline = "bottom";
        ctx!.fillText("SCROLL", w / 2, h - 26);
        ctx!.strokeStyle = "rgba(100,110,142,1)";
        ctx!.lineWidth   = 1;
        ctx!.beginPath();
        ctx!.moveTo(w / 2 - 7, h - 15);
        ctx!.lineTo(w / 2,     h - 8);
        ctx!.lineTo(w / 2 + 7, h - 15);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── styles ──────────────────────────────────────────────────────────────────
  const hidden: CSSProperties = { opacity: 0, pointerEvents: "none", willChange: "opacity" };
  const panel: CSSProperties  = { position: "fixed", inset: 0, display: "flex", flexDirection: "column", willChange: "opacity" };
  const mono: CSSProperties   = { fontFamily: "monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "rgba(105,115,148,0.65)", margin: "0 0 16px" };
  const bold: CSSProperties   = { fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, lineHeight: 0.94, letterSpacing: "-0.015em", textTransform: "uppercase" as const, color: "#ededf3", margin: 0 };
  const dim: CSSProperties    = { fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(237,237,243,0.46)" };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: `${SCROLL_VH}vh`, background: BG }} />

      {/* Canvas — the planet only */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, display: "block", background: BG }}
      />

      {/* Typography — appears between art phases */}
      <div style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}>

        {/* Identity — right side, reads against terminator shadow */}
        <div ref={s1Ref} style={{ ...panel, ...hidden, justifyContent: "center", alignItems: "flex-end", padding: "0 8vw" }}>
          <div style={{ maxWidth: 500, textAlign: "right" }}>
            <p style={mono}>Portfolio · 2026</p>
            <h1 style={{ ...bold, fontSize: "clamp(50px, 7.8vw, 96px)" }}>
              Clayton<br />Borges
            </h1>
            <p style={{ ...dim, fontSize: "clamp(13px, 1.7vw, 20px)", marginTop: 22 }}>
              Creative Full-Stack Developer
            </p>
            <p style={{ ...mono, marginTop: 14, marginBottom: 0 }}>
              Brasília · BR · Open to Relocation
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div ref={s2Ref} style={{ ...panel, ...hidden, justifyContent: "center", alignItems: "flex-end", padding: "0 8vw" }}>
          <div style={{ maxWidth: 440, textAlign: "right" }}>
            <p style={mono}>Tools &amp; Craft</p>
            <h2 style={{ ...bold, fontSize: "clamp(30px, 5vw, 64px)", marginBottom: 28 }}>
              Tech<br />Stack
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px 18px", justifyContent: "flex-end" }}>
              {[
                "Next.js 16", "Three.js", "TypeScript", "Python",
                "GSAP", "Supabase", "FastAPI", "PostgreSQL",
                "Docker", "AWS S3", "React 19", "Web Audio API",
              ].map(tech => (
                <span key={tech} style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(168,176,202,0.82)", letterSpacing: "0.07em" }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Projects — top-left, reads against dark polar region */}
        <div ref={s3Ref} style={{ ...panel, ...hidden, justifyContent: "flex-start", alignItems: "flex-start", padding: "9vh 0 0 8vw" }}>
          <div>
            <p style={mono}>Delivered Work</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(10px,1.8vw,22px)", marginBottom: 22 }}>
              <span style={{ ...bold, fontSize: "clamp(64px, 10.5vw, 126px)" }}>3</span>
              <div>
                <div style={{ ...bold, fontSize: "clamp(17px, 2.6vw, 34px)" }}>Years</div>
                <div style={{ ...bold, fontSize: "clamp(17px, 2.6vw, 34px)" }}>Shipped</div>
              </div>
              <span style={{ ...bold, fontSize: "clamp(64px, 10.5vw, 126px)", color: "rgba(237,237,243,0.18)" }}>12</span>
              <div>
                <div style={{ ...bold, fontSize: "clamp(17px, 2.6vw, 34px)", color: "rgba(237,237,243,0.38)" }}>Projects</div>
                <div style={{ ...bold, fontSize: "clamp(17px, 2.6vw, 34px)", color: "rgba(237,237,243,0.38)" }}>Delivered</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "18px 36px", flexWrap: "wrap", maxWidth: "50vw" }}>
              {[
                ["MzPrime 3D",     "Three.js · 3D Showroom"],
                ["Moveo Filmes",   "Next.js · GSAP · Supabase"],
                ["Metanova Labs",  "Bittensor · AI Dashboard"],
                ["DSRPTV Records", "Music E-commerce · Three.js"],
                ["Novo Rio",       "FastAPI · FAC Arts Grant"],
                ["DISCLAYMER",     "Creative Studio · Raphael Palmer"],
              ].map(([name, tags]) => (
                <div key={name}>
                  <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 700, fontSize: 13, color: "#ededf3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {name}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(105,115,148,0.65)", letterSpacing: "0.06em", marginTop: 3 }}>
                    {tags}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div ref={s4Ref} style={{ ...panel, ...hidden, justifyContent: "flex-end", alignItems: "center", padding: "0 0 10vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={mono}>Availability</p>
            <h2 style={{ ...bold, fontSize: "clamp(34px, 5.8vw, 76px)", marginBottom: 16 }}>
              Open to Work
            </h2>
            <p style={{ ...dim, fontSize: "clamp(11px, 1.3vw, 15px)", margin: "0 0 8px" }}>
              Open to Relocation · Remote-First
            </p>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(105,115,148,0.70)", margin: "18px 0 0", letterSpacing: "0.12em" }}>
              claytonborgesdev@gmail.com
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
