"use client";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const BG        = "#050508";
const SCROLL_VH = 900;
const N_PTS     = 320; // polygon sample count — higher = sharper points preserved

// ─── math ─────────────────────────────────────────────────────────────────────
function ss(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
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

// ─── polar form functions — return radius multiplier at angle θ ────────────────

// Soft organic blob (phases 0 and 4)
function rBlob(θ: number, t: number) {
  return 1
    + 0.32 * Math.sin(3 * θ + t * 0.52)
    + 0.22 * Math.sin(5 * θ - t * 0.38)
    + 0.18 * Math.sin(2 * θ + t * 0.79);
}

// Radiant star — n sharp points
function rStar(θ: number, t: number, n = 8, amp = 0.52) {
  return 1 + amp * Math.cos(n * θ + t * 0.035);
}

// Spiral arms — like a galaxy viewed face-on
function rSpiral(θ: number, t: number, arms = 3, amp = 0.44) {
  return 1
    + amp       * Math.cos(arms * θ - t * 0.22)
    + amp * 0.3 * Math.cos(arms * 2 * θ + t * 0.14);
}

// Dense crystal — many harmonics, fractal-like spikes
function rCrystal(θ: number, t: number) {
  return 1
    + 0.30 * Math.cos(12 * θ + t * 0.018)
    + 0.18 * Math.cos( 7 * θ - t * 0.030)
    + 0.12 * Math.cos(20 * θ + t * 0.055)
    + 0.08 * Math.cos( 5 * θ - t * 0.042);
}

// ─── build canvas path from polar form ───────────────────────────────────────
function buildPath(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  fn: (θ: number) => number,
  rotOffset = 0
) {
  ctx.beginPath();
  for (let i = 0; i <= N_PTS; i++) {
    const θ  = (i / N_PTS) * Math.PI * 2 + rotOffset;
    const pr = fn(θ) * r;
    const x  = cx + Math.cos(θ) * pr;
    const y  = cy + Math.sin(θ) * pr;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// ─── chrome gradient fill ─────────────────────────────────────────────────────
function chromeFill(
  ctx: CanvasRenderingContext2D,
  lx1: number, ly1: number,
  lx2: number, ly2: number,
  t: number, phase: number
) {
  const sw = (Math.sin(t * 0.65 + phase) + 1) / 2;
  const g  = ctx.createLinearGradient(lx1, ly1, lx2, ly2);
  g.addColorStop(0,                          "rgba(4,4,10,1)");
  g.addColorStop(0.10,                       "rgba(40,44,58,1)");
  g.addColorStop(Math.max(0.01, sw - 0.22),  "rgba(80,88,108,1)");
  g.addColorStop(Math.max(0.02, sw - 0.08),  "rgba(150,158,182,1)");
  g.addColorStop(sw,                         "rgba(234,240,255,1)");
  g.addColorStop(Math.min(0.98, sw + 0.08),  "rgba(150,158,182,1)");
  g.addColorStop(Math.min(0.99, sw + 0.22),  "rgba(80,88,108,1)");
  g.addColorStop(0.90,                       "rgba(40,44,58,1)");
  g.addColorStop(1,                          "rgba(4,4,10,1)");
  ctx.fillStyle = g;
  ctx.fill();
}

// ─── morph scalar — explosion spike at transitions ────────────────────────────
function morphScale(sp: number) {
  // Brief scale burst right at each morph boundary
  const spike = (center: number, w: number) => {
    const d = Math.abs(sp - center) / w;
    return d < 1 ? (1 - d * d) : 0;
  };
  return 1
    + 0.22 * spike(0.385, 0.028)   // blob → star boundary
    + 0.18 * spike(0.615, 0.026)   // star → spiral boundary
    + 0.20 * spike(0.802, 0.028);  // spiral → crystal boundary
}

// ─── main draw ────────────────────────────────────────────────────────────────
function drawForm(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, baseR: number,
  t: number, sp: number
) {
  // Scroll morph zones:
  //   blob:    0.00 → 0.37
  //   star:    0.40 → 0.60
  //   spiral:  0.62 → 0.79
  //   crystal: 0.82 → 1.00
  //   transitions: narrow windows between zones (spike happens here)

  const blobPure   = ss(0.00, 0.12, sp) * (1 - ss(0.35, 0.42, sp));
  const blobToStar = ss(0.35, 0.42, sp) * (1 - ss(0.40, 0.47, sp));
  const starPure   = ss(0.40, 0.48, sp) * (1 - ss(0.58, 0.64, sp));
  const starToSpi  = ss(0.58, 0.64, sp) * (1 - ss(0.62, 0.68, sp));
  const spiralPure = ss(0.62, 0.70, sp) * (1 - ss(0.78, 0.84, sp));
  const spiToCryst = ss(0.78, 0.84, sp) * (1 - ss(0.82, 0.88, sp));
  const crystPure  = ss(0.82, 0.90, sp);

  // Composite polar function — weighted blend of all forms at current scroll
  const fn = (θ: number): number => {
    const b  = rBlob(θ, t);
    const s  = rStar(θ, t);
    const sp2 = rSpiral(θ, t);
    const c  = rCrystal(θ, t);

    const blobW   = blobPure   + blobToStar * (1 - ss(0.35, 0.42, sp));
    const bsW     = blobToStar;
    const starW   = starPure   + blobToStar * ss(0.35, 0.42, sp) + starToSpi * (1 - ss(0.58, 0.64, sp));
    const ssW     = starToSpi;
    const spiW    = spiralPure + starToSpi  * ss(0.58, 0.64, sp) + spiToCryst * (1 - ss(0.78, 0.84, sp));
    const scW     = spiToCryst;
    const crystW  = crystPure  + spiToCryst * ss(0.78, 0.84, sp);

    const total = blobW + bsW + starW + ssW + spiW + scW + crystW + 0.001;
    return (
      blobW   * b   +
      bsW     * lerp(b, s, ss(0.35, 0.42, sp)) +
      starW   * s   +
      ssW     * lerp(s, sp2, ss(0.58, 0.64, sp)) +
      spiW    * sp2 +
      scW     * lerp(sp2, c, ss(0.78, 0.84, sp)) +
      crystW  * c
    ) / total;
  };

  // Emergence + explosion scale
  const emerge = ss(0.00, 0.14, sp);
  const mscale = morphScale(sp);
  const r = baseR * emerge * mscale;
  if (r < 2) return;

  // Light angle drifts with scroll and time
  const lightAngle = -Math.PI * 0.55 + sp * Math.PI * 0.55 + t * 0.022;
  const lx1 = cx + Math.cos(lightAngle) * r * 1.22;
  const ly1 = cy + Math.sin(lightAngle) * r * 1.22;
  const lx2 = cx - Math.cos(lightAngle) * r * 1.22;
  const ly2 = cy - Math.sin(lightAngle) * r * 1.22;

  // Slow overall rotation
  const rot = t * 0.028 + sp * Math.PI * 0.5;

  // ── chrome ambient glow ───────────────────────────────────────────────────
  {
    const gr = r * 1.28;
    const ga = emerge * 0.07;
    const gg = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, gr);
    gg.addColorStop(0, `rgba(70,80,115,${ga.toFixed(3)})`);
    gg.addColorStop(1, "rgba(70,80,115,0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(cx, cy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── base chrome fill ─────────────────────────────────────────────────────
  buildPath(ctx, cx, cy, r, fn, rot);
  chromeFill(ctx, lx1, ly1, lx2, ly2, t, lightAngle);

  // ── edge depth vignette ───────────────────────────────────────────────────
  buildPath(ctx, cx, cy, r, fn, rot);
  {
    const ev = ctx.createRadialGradient(cx, cy, r * 0.30, cx, cy, r * 1.08);
    ev.addColorStop(0,    "rgba(0,0,0,0)");
    ev.addColorStop(0.52, "rgba(0,0,0,0)");
    ev.addColorStop(1,    "rgba(0,0,0,0.80)");
    ctx.fillStyle = ev;
    ctx.fill();
  }

  // ── inner specular highlight ──────────────────────────────────────────────
  buildPath(ctx, cx, cy, r, fn, rot);
  ctx.save();
  ctx.clip();
  {
    const hlx = cx + Math.cos(lightAngle) * r * 0.18;
    const hly = cy + Math.sin(lightAngle) * r * 0.18;
    const hl  = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, r * 0.46);
    hl.addColorStop(0, "rgba(255,255,255,0.24)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
  }
  ctx.restore();

  // ── secondary rim light ───────────────────────────────────────────────────
  buildPath(ctx, cx, cy, r, fn, rot);
  ctx.save();
  ctx.clip();
  {
    const s2ang = lightAngle + Math.PI * 0.70 + Math.sin(t * 0.20) * 0.28;
    const s2x   = cx + Math.cos(s2ang) * r * 0.55;
    const s2y   = cy + Math.sin(s2ang) * r * 0.55;
    const s2a   = 0.06 + ss(0.20, 0.70, sp) * 0.06;
    const s2    = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, r * 0.32);
    s2.addColorStop(0, `rgba(185,195,225,${s2a.toFixed(3)})`);
    s2.addColorStop(1, "rgba(185,195,225,0)");
    ctx.fillStyle = s2;
    ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
  }
  ctx.restore();

  // ── form label — tiny mono tag bottom-right, shows current morph state ────
  const label =
    crystPure > 0.3  ? "CRYSTAL"
    : spiralPure > 0.3 ? "SPIRAL"
    : starPure   > 0.3 ? "STAR"
    :                    "FLUX";
  ctx.fillStyle = "rgba(100,110,140,0.45)";
  ctx.font = "10px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, cx + r * 0.88, cy + r * 0.92 + 12);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// ─── component ────────────────────────────────────────────────────────────────
export function MorphLab() {
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

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const sp = scrollRef.current;
      // Info overlays appear in the quieter middle of each morph phase,
      // not during the dramatic transitions
      applyOverlay(s1Ref.current, secAlpha(sp, 0.13, 0.18, 0.27, 0.33)); // mid-blob
      applyOverlay(s2Ref.current, secAlpha(sp, 0.44, 0.48, 0.56, 0.61)); // mid-star
      applyOverlay(s3Ref.current, secAlpha(sp, 0.65, 0.69, 0.76, 0.81)); // mid-spiral
      applyOverlay(s4Ref.current, secAlpha(sp, 0.87, 0.91, 0.97, 1.00)); // crystal
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

      const baseR = Math.min(w, h) * 0.42;
      drawForm(ctx!, w * 0.5, h * 0.5, baseR, t, sp);

      if (sp < 0.025) {
        const ia = Math.max(0, 1 - sp * 40) * 0.32;
        ctx!.globalAlpha  = ia;
        ctx!.fillStyle    = "rgba(100,110,142,1)";
        ctx!.font         = "10px monospace";
        ctx!.textAlign    = "center";
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

      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, display: "block", background: BG }}
      />

      <div style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}>

        {/* Identity — mid-blob phase */}
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

        {/* Tech Stack — mid-star phase */}
        <div ref={s2Ref} style={{ ...panel, ...hidden, justifyContent: "center", alignItems: "flex-end", padding: "0 8vw" }}>
          <div style={{ maxWidth: 440, textAlign: "right" }}>
            <p style={mono}>Tools &amp; Craft</p>
            <h2 style={{ ...bold, fontSize: "clamp(30px, 5vw, 64px)", marginBottom: 28 }}>
              Tech<br />Stack
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px 18px", justifyContent: "flex-end" }}>
              {[
                "Next.js 16","Three.js","TypeScript","Python",
                "GSAP","Supabase","FastAPI","PostgreSQL",
                "Docker","AWS S3","React 19","Web Audio API",
              ].map(tech => (
                <span key={tech} style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(168,178,205,0.82)", letterSpacing: "0.07em" }}>{tech}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Projects — mid-spiral phase */}
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
                  <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 700, fontSize: 13, color: "#ededf3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(105,115,148,0.65)", letterSpacing: "0.06em", marginTop: 3 }}>{tags}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact — crystal phase */}
        <div ref={s4Ref} style={{ ...panel, ...hidden, justifyContent: "flex-end", alignItems: "center", padding: "0 0 10vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={mono}>Availability</p>
            <h2 style={{ ...bold, fontSize: "clamp(34px, 5.8vw, 76px)", marginBottom: 16 }}>Open to Work</h2>
            <p style={{ ...dim, fontSize: "clamp(11px, 1.3vw, 15px)", margin: "0 0 8px" }}>Open to Relocation · Remote-First</p>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(105,115,148,0.70)", margin: "18px 0 0", letterSpacing: "0.12em" }}>
              claytonborgesdev@gmail.com
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
