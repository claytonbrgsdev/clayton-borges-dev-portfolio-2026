"use client";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const BG = "#050508";
const SCROLL_VH = 900; // 9× viewport — art gets room to breathe

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

// ─── smooth blob path ─────────────────────────────────────────────────────────
function blobPath(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  t: number, irr: number, n = 22
) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = 1 + irr * (
      0.44 * Math.sin(a * 3 + t * 0.50) +
      0.30 * Math.sin(a * 5 - t * 0.36) +
      0.26 * Math.sin(a * 2 + t * 0.77)
    );
    pts.push([cx + Math.cos(a) * r * m, cy + Math.sin(a) * r * m]);
  }
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i];
    const [bx2, by2] = pts[(i + 1) % n];
    const [cx2, cy2] = pts[(i + 2) % n];
    if (i === 0) ctx.moveTo((ax + bx2) / 2, (ay + by2) / 2);
    ctx.quadraticCurveTo(bx2, by2, (bx2 + cx2) / 2, (by2 + cy2) / 2);
  }
  ctx.closePath();
}

// ─── chrome sculpture — the single art subject ────────────────────────────────
// The blob is the star. It evolves through four acts driven by scroll progress.
function drawSculpture(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, baseR: number,
  t: number, sp: number
) {
  // Act 1 (0-20%): emergence — smooth, calm, growing into itself
  // Act 2 (20-60%): development — surface texture, contour lines, liquid quality
  // Act 3 (60-90%): transformation — dramatic deformation, deeper detail
  // Act 4 (90-100%): resolution — smooths, recenters, final form

  const emerge  = ss(0.00, 0.16, sp);
  const develop = ss(0.20, 0.58, sp);
  const peak    = ss(0.60, 0.82, sp) * (1 - ss(0.85, 1.0, sp));
  const resolve = ss(0.88, 1.00, sp);

  // Irregularity: smooth at start/end, complex during development/peak
  const irr = 0.14 + 0.28 * develop * (1 - resolve * 0.55) + 0.10 * peak;

  // Scale: emerges from nothing, breathes, slight growth, calms
  const breath = 1 + 0.022 * Math.sin(t * 0.41);
  const scale  = (0.35 + 0.65 * emerge) * (1 + develop * 0.06) * (1 - resolve * 0.04) * breath;
  const r = baseR * scale;

  // Subtle horizontal drift during transformation
  const drift = peak * baseR * 0.07 * Math.sin(t * 0.12);
  const bx = cx + drift;
  const by = cy;

  // Light direction rotates slowly with both scroll and time
  const lightAngle = -Math.PI * 0.58 + sp * Math.PI * 0.5 + t * 0.035;
  const lx1 = bx + Math.cos(lightAngle) * r * 1.18;
  const ly1 = by + Math.sin(lightAngle) * r * 1.18;
  const lx2 = bx - Math.cos(lightAngle) * r * 1.18;
  const ly2 = by - Math.sin(lightAngle) * r * 1.18;

  // Specular sweep position (oscillates independently from light direction)
  const sw = (Math.sin(t * 0.62 + lightAngle) + 1) / 2;

  // ── base chrome fill ────────────────────────────────────────────────────────
  blobPath(ctx, bx, by, r, t, irr);
  const g = ctx.createLinearGradient(lx1, ly1, lx2, ly2);
  g.addColorStop(0,                          "rgba(4,4,10,1)");
  g.addColorStop(0.10,                       "rgba(42,46,60,1)");
  g.addColorStop(Math.max(0.01, sw - 0.22),  "rgba(82,90,110,1)");
  g.addColorStop(Math.max(0.02, sw - 0.08),  "rgba(152,160,185,1)");
  g.addColorStop(sw,                         "rgba(235,240,254,1)");
  g.addColorStop(Math.min(0.98, sw + 0.08),  "rgba(152,160,185,1)");
  g.addColorStop(Math.min(0.99, sw + 0.22),  "rgba(82,90,110,1)");
  g.addColorStop(0.90,                       "rgba(42,46,60,1)");
  g.addColorStop(1,                          "rgba(4,4,10,1)");
  ctx.fillStyle = g;
  ctx.fill();

  // ── edge depth — gives the shape 3D volume without any outline ─────────────
  blobPath(ctx, bx, by, r, t, irr);
  const ev = ctx.createRadialGradient(bx, by, r * 0.30, bx, by, r * 1.04);
  ev.addColorStop(0,    "rgba(0,0,0,0)");
  ev.addColorStop(0.55, "rgba(0,0,0,0)");
  ev.addColorStop(1,    "rgba(0,0,0,0.78)");
  ctx.fillStyle = ev;
  ctx.fill();

  // ── liquid metal surface contours ───────────────────────────────────────────
  // Appear as `develop` grows — thin curved lines that mimic liquid surface.
  // These are clipped strictly inside the blob, so no hard edge visible.
  const detail = Math.max(develop, peak * 0.7);
  if (detail > 0.02) {
    blobPath(ctx, bx, by, r, t, irr);
    ctx.save();
    ctx.clip();

    const nLines = Math.round(5 + detail * 24 + peak * 8);
    for (let i = 0; i < nLines; i++) {
      const fy = -1 + (2 * (i + 0.5) / nLines);
      const lineY = by + fy * r * 0.90;
      const halfW = Math.sqrt(Math.max(0, r * r - (lineY - by) ** 2)) * 0.93;
      if (halfW < 14) continue;

      const distFromCenter = Math.abs(fy);
      const bright = 1 - distFromCenter * 0.72;

      // Undulating warp — the "liquid" quality
      const phase = t * 0.36 + i * 0.88;
      const warpY = Math.sin(phase) * r * 0.036 * (1 - distFromCenter * 0.5);
      const warpX = Math.sin(fy * Math.PI * 2.2 + t * 0.26) * halfW * 0.09;

      // Slightly brighter lines near specular zone
      const nearSpec = 1 - Math.abs(fy - (sw * 2 - 1)) * 0.8;
      const la = detail * (0.020 + 0.055 * bright * bright + 0.025 * nearSpec * nearSpec);
      ctx.strokeStyle = `rgba(210,218,244,${la.toFixed(4)})`;
      ctx.lineWidth = 0.42 + bright * 0.76;

      ctx.beginPath();
      ctx.moveTo(bx - halfW, lineY);
      ctx.bezierCurveTo(
        bx - halfW * 0.42 + warpX,  lineY + warpY,
        bx + halfW * 0.42 + warpX,  lineY - warpY,
        bx + halfW, lineY
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── primary inner highlight ─────────────────────────────────────────────────
  blobPath(ctx, bx, by, r, t, irr);
  ctx.save();
  ctx.clip();
  const hlx = bx + Math.cos(lightAngle) * r * 0.20;
  const hly = by + Math.sin(lightAngle) * r * 0.20;
  const hl  = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, r * 0.48);
  hl.addColorStop(0, "rgba(255,255,255,0.22)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(bx - r * 2, by - r * 2, r * 4, r * 4);
  ctx.restore();

  // ── secondary reflection (rim light, grows with development) ───────────────
  if (develop > 0.06) {
    blobPath(ctx, bx, by, r, t, irr);
    ctx.save();
    ctx.clip();
    const s2ang = lightAngle + Math.PI * 0.68 + Math.sin(t * 0.21) * 0.30;
    const s2x   = bx + Math.cos(s2ang) * r * 0.54;
    const s2y   = by + Math.sin(s2ang) * r * 0.54;
    const s2a   = develop * 0.08 + peak * 0.05;
    const s2    = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, r * 0.30);
    s2.addColorStop(0, `rgba(188,198,228,${s2a.toFixed(3)})`);
    s2.addColorStop(1, "rgba(188,198,228,0)");
    ctx.fillStyle = s2;
    ctx.fillRect(bx - r * 2, by - r * 2, r * 4, r * 4);
    ctx.restore();
  }

  // ── deep glow ambient — makes background feel infinite ─────────────────────
  const glowR = r * 1.55;
  const glowA = emerge * 0.06 + develop * 0.04;
  if (glowA > 0.005) {
    const glow = ctx.createRadialGradient(bx, by, r * 0.8, bx, by, glowR);
    glow.addColorStop(0, `rgba(80,90,118,${glowA.toFixed(3)})`);
    glow.addColorStop(1, "rgba(80,90,118,0)");
    // Draw BEFORE blob (visual order: glow then blob)
    // Since we already drew the blob, draw glow with 'destination-over' is complex.
    // Instead: subtle outer glow as additional fill pass, globalCompositeOperation = "source-over"
    // The blob edge vignette makes the blob dark at edges anyway, so glow blends naturally.
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bx, by, glowR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── component ────────────────────────────────────────────────────────────────
export function ChromaLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s1Ref     = useRef<HTMLDivElement>(null); // identity
  const s2Ref     = useRef<HTMLDivElement>(null); // tech
  const s3Ref     = useRef<HTMLDivElement>(null); // projects
  const s4Ref     = useRef<HTMLDivElement>(null); // contact
  const scrollRef = useRef(0);

  // scroll progress (0-1)
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // HTML section alpha — refs only, zero setState
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const sp = scrollRef.current;
      // Scroll timeline:
      //   0-18%  — art only: emergence
      //  18-32%  — identity overlay
      //  32-50%  — art only: surface develops
      //  50-62%  — tech overlay
      //  62-72%  — art only: peak transformation
      //  72-88%  — projects overlay
      //  88-94%  — art only: resolution
      //  94-100% — contact overlay
      applyOverlay(s1Ref.current, secAlpha(sp, 0.18, 0.22, 0.29, 0.34));
      applyOverlay(s2Ref.current, secAlpha(sp, 0.50, 0.54, 0.60, 0.65));
      applyOverlay(s3Ref.current, secAlpha(sp, 0.72, 0.76, 0.84, 0.90));
      applyOverlay(s4Ref.current, secAlpha(sp, 0.93, 0.96, 0.99, 1.00));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // canvas animation loop
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

      const w   = window.innerWidth;
      const h   = window.innerHeight;
      const sp  = scrollRef.current;

      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, w, h);

      // Blob radius: 44% of the shorter dimension — fills the screen
      const baseR = Math.min(w, h) * 0.44;
      drawSculpture(ctx!, w * 0.5, h * 0.5, baseR, t, sp);

      // Scroll hint — only at the very start
      if (sp < 0.025) {
        const ia = Math.max(0, 1 - sp * 40) * 0.34;
        ctx!.globalAlpha = ia;
        ctx!.fillStyle   = "rgba(110,122,150,1)";
        ctx!.font        = "10px monospace";
        ctx!.textAlign   = "center";
        ctx!.textBaseline = "bottom";
        ctx!.fillText("SCROLL", w / 2, h - 26);
        ctx!.strokeStyle = "rgba(110,122,150,1)";
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

  // ── shared styles ────────────────────────────────────────────────────────────
  const hidden: CSSProperties = {
    opacity: 0, pointerEvents: "none", willChange: "opacity",
  };
  const panel: CSSProperties = {
    position: "fixed", inset: 0,
    display: "flex", flexDirection: "column",
    willChange: "opacity",
  };
  const mono: CSSProperties = {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "rgba(118,128,155,0.65)",
    margin: "0 0 16px",
  };
  const bold: CSSProperties = {
    fontFamily: '"Arial Black", Arial, sans-serif',
    fontWeight: 900,
    lineHeight: 0.94,
    letterSpacing: "-0.015em",
    textTransform: "uppercase" as const,
    color: "#ededf3",
    margin: 0,
  };
  const dim: CSSProperties = {
    fontFamily: '"Arial Black", Arial, sans-serif',
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "rgba(237,237,243,0.46)",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 9× scroll height — art gets room to live */}
      <div style={{ height: `${SCROLL_VH}vh`, background: BG }} />

      {/* Canvas: the blob sculpture only — no rings, no circles, no shards */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, display: "block", background: BG }}
      />

      {/* Typography — appears briefly between art phases, text is secondary */}
      <div style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}>

        {/* Identity — right side, clear of blob center */}
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

        {/* Tech Stack — right side */}
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
                <span key={tech} style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "rgba(170,178,202,0.82)",
                  letterSpacing: "0.07em",
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Projects — top-left, numbers are the hero */}
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
                ["MzPrime 3D",      "Three.js · 3D Showroom"],
                ["Moveo Filmes",    "Next.js · GSAP · Supabase"],
                ["Metanova Labs",   "Bittensor · AI Dashboard"],
                ["DSRPTV Records",  "Music E-commerce · Three.js"],
                ["Novo Rio",        "FastAPI · FAC Arts Grant"],
                ["DISCLAYMER",      "Creative Studio · Raphael Palmer"],
              ].map(([name, tags]) => (
                <div key={name}>
                  <div style={{
                    fontFamily: '"Arial Black", Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#ededf3",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {name}
                  </div>
                  <div style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "rgba(118,128,155,0.65)",
                    letterSpacing: "0.06em",
                    marginTop: 3,
                  }}>
                    {tags}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact — bottom center */}
        <div ref={s4Ref} style={{ ...panel, ...hidden, justifyContent: "flex-end", alignItems: "center", padding: "0 0 10vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={mono}>Availability</p>
            <h2 style={{ ...bold, fontSize: "clamp(34px, 5.8vw, 76px)", marginBottom: 16 }}>
              Open to Work
            </h2>
            <p style={{ ...dim, fontSize: "clamp(11px, 1.3vw, 15px)", margin: "0 0 8px" }}>
              Open to Relocation · Remote-First
            </p>
            <p style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "rgba(118,128,155,0.70)",
              margin: "18px 0 0",
              letterSpacing: "0.12em",
            }}>
              claytonborgesdev@gmail.com
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
