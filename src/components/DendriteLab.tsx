"use client";
import { useEffect, useRef } from "react";

// ── constants ────────────────────────────────────────────────────────────────
const BG = "#050508";
const VIRTUAL_RATIO = 5; // virtual space = 5 × viewport height

// Spring / damping
const K_TITLE  = 0.055;
const K_PHRASE = 0.07;
const DAMP     = 0.82;

// Cursor repulsion (title) / attraction (phrases)
const REPEL_R  = 140;
const REPEL_F  = 14000;
const ATTRACT_R = 160;
const ATTRACT_F = 4000;

// ── types ────────────────────────────────────────────────────────────────────
interface P {
  ax: number;
  ay: number; // absolute virtual-space pixels
  sx: number;
  sy: number;
  dvx: number;
  dvy: number;
  label: string;
  fs: number;
  alpha: number;
  metallic: boolean;
  shimmer: number;
  weight: string;
}

// ── content ───────────────────────────────────────────────────────────────────
const TITLE = "CLAYTON·BORGES";

// [label, xFrac, yFrac (of virtual height 5h), fontSize, metallic, fontWeight]
type PhraseRow = [string, number, number, number, boolean, string];
const PHRASE_DATA: PhraseRow[] = [
  ["CREATIVE",              0.50, 0.220, 19, false, "900"],
  ["FULL-STACK",            0.50, 0.262, 19, false, "900"],
  ["DEVELOPER",             0.50, 0.304, 19, false, "900"],

  ["NEXT.JS",               0.17, 0.405, 14, true,  "700"],
  ["THREE.JS",              0.33, 0.405, 14, true,  "700"],
  ["TYPESCRIPT",            0.52, 0.405, 14, true,  "700"],
  ["PYTHON",                0.70, 0.405, 14, true,  "700"],
  ["GSAP",                  0.84, 0.405, 14, true,  "700"],
  ["SUPABASE",              0.17, 0.450, 14, true,  "700"],
  ["FASTAPI",               0.33, 0.450, 14, true,  "700"],
  ["POSTGRESQL",            0.52, 0.450, 14, true,  "700"],
  ["DOCKER",                0.70, 0.450, 14, true,  "700"],
  ["AWS S3",                0.84, 0.450, 14, true,  "700"],

  ["3 YEARS",               0.50, 0.600, 54, false, "900"],
  ["SHIPPED",               0.50, 0.658, 54, false, "900"],
  ["12 PROJECTS",           0.50, 0.718, 20, false, "700"],

  ["BRASÍLIA · BR",         0.50, 0.840, 13, false, "400"],
  ["OPEN TO RELOCATION",    0.50, 0.877, 13, false, "400"],
  ["AVAILABLE FOR HIRE",    0.50, 0.922, 20, false, "900"],
  ["claytonborgesdev@gmail.com", 0.50, 0.960, 11, false, "400"],
];

// ── chrome gradient ───────────────────────────────────────────────────────────
function chromeGrad(
  ctx: CanvasRenderingContext2D,
  cx: number,
  halfW: number,
  t: number,
  phase: number
) {
  const g = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
  const sweep = (Math.sin(t * 1.1 + phase) + 1) / 2;
  g.addColorStop(0,                           "hsl(225,10%,52%)");
  g.addColorStop(Math.max(0.01, sweep - 0.2), "hsl(225,8%,62%)");
  g.addColorStop(sweep,                       "hsl(220,5%,94%)");
  g.addColorStop(Math.min(0.99, sweep + 0.2), "hsl(225,8%,62%)");
  g.addColorStop(1,                           "hsl(225,10%,52%)");
  return g;
}

// ── component ─────────────────────────────────────────────────────────────────
export function DendriteLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const pRef      = useRef<P[]>([]);
  const sizeRef   = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const out  = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseleave", out);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", out);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const DPR = Math.min(devicePixelRatio, 2);
    let raf = 0;

    function initParticles(w: number, h: number) {
      const vH = h * VIRTUAL_RATIO;
      const ps: P[] = [];

      // Title chars
      ctx!.save();
      ctx!.font = `900 68px "Arial Black", Arial, sans-serif`;
      const chars = TITLE.split("");
      const GAP = 3;
      const widths = chars.map(c => ctx!.measureText(c).width + GAP);
      const totalW = widths.reduce((a, b) => a + b, 0);
      let curX = (w - totalW) / 2;

      chars.forEach((ch, i) => {
        const halfW = widths[i] / 2;
        const anchorX = curX + halfW;
        const anchorY = 0.11 * vH;
        ps.push({
          ax: anchorX, ay: anchorY,
          sx: anchorX + (Math.random() - 0.5) * w * 0.65,
          sy: anchorY  + (Math.random() - 0.5) * h * 0.55,
          dvx: (Math.random() - 0.5) * 4,
          dvy: (Math.random() - 0.5) * 4,
          label: ch, fs: 68,
          alpha: 1, metallic: true,
          shimmer: i * 0.45, weight: "900",
        });
        curX += widths[i];
      });
      ctx!.restore();

      // Phrase particles
      PHRASE_DATA.forEach(([label, xFrac, yFrac, fs, metallic, weight], i) => {
        ps.push({
          ax: xFrac * w, ay: yFrac * vH,
          sx: xFrac * w + (Math.random() - 0.5) * 80,
          sy: yFrac * vH,
          dvx: (Math.random() - 0.5) * 1.5,
          dvy: (Math.random() - 0.5) * 1.5,
          label, fs, alpha: 0, metallic,
          shimmer: i * 0.28, weight,
        });
      });

      pRef.current = ps;
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      sizeRef.current = { w, h };
      initParticles(w, h);
    }

    resize();
    window.addEventListener("resize", resize);

    // ── glow blob ─────────────────────────────────────────────────────────
    function drawGlow(x: number, y: number, r: number, a: number) {
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(170,180,210,${(a * 0.20).toFixed(3)})`);
      g.addColorStop(0.5, `rgba(150,160,190,${(a * 0.08).toFixed(3)})`);
      g.addColorStop(1,   "rgba(150,160,190,0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    // ── liquid metal bridge ────────────────────────────────────────────────
    function drawBridge(
      ax: number, ay: number, bx: number, by: number,
      rA: number, rB: number, alpha: number
    ) {
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) return;
      const nx = -dy / len, ny = dx / len;

      ctx!.beginPath();
      ctx!.moveTo(ax + nx * rA, ay + ny * rA);
      ctx!.bezierCurveTo(
        ax + dx * 0.38 + nx * rA, ay + dy * 0.38 + ny * rA,
        bx - dx * 0.38 + nx * rB, by - dy * 0.38 + ny * rB,
        bx + nx * rB, by + ny * rB
      );
      ctx!.lineTo(bx - nx * rB, by - ny * rB);
      ctx!.bezierCurveTo(
        bx - dx * 0.38 - nx * rB, by - dy * 0.38 - ny * rB,
        ax + dx * 0.38 - nx * rA, ay + dy * 0.38 - ny * rA,
        ax - nx * rA, ay - ny * rA
      );
      ctx!.closePath();

      const g = ctx!.createLinearGradient(ax, ay, bx, by);
      const s = alpha.toFixed(3);
      g.addColorStop(0,   `rgba(155,165,192,${s})`);
      g.addColorStop(0.5, `rgba(210,218,235,${s})`);
      g.addColorStop(1,   `rgba(155,165,192,${s})`);
      ctx!.fillStyle = g;
      ctx!.fill();
    }

    // ── grid texture ──────────────────────────────────────────────────────
    function drawGrid(w: number, h: number, time: number) {
      const sp = scrollRef.current;
      const a = 0.016 + sp * 0.008;
      const cell = 80;
      ctx!.strokeStyle = `rgba(120,130,160,${a.toFixed(4)})`;
      ctx!.lineWidth = 0.5;
      const ox = (time * 4) % cell;
      const oy = (time * 2) % cell;
      ctx!.beginPath();
      for (let x = -cell + ox; x < w + cell; x += cell) {
        ctx!.moveTo(x, 0); ctx!.lineTo(x, h);
      }
      for (let y = -cell + oy; y < h + cell; y += cell) {
        ctx!.moveTo(0, y); ctx!.lineTo(w, y);
      }
      ctx!.stroke();
    }

    // ── HUD readout ───────────────────────────────────────────────────────
    const ZONES: [number, number, string][] = [
      [0.00, 0.20, "IDENTITY"],
      [0.20, 0.38, "ROLE"],
      [0.38, 0.58, "TECH STACK"],
      [0.58, 0.78, "OUTPUT"],
      [0.78, 1.00, "CONTACT"],
    ];
    function drawHUD(w: number, sp: number) {
      const zone = ZONES.find(([a, b]) => sp >= a && sp < b) ?? ZONES[4];
      ctx!.font = "10px monospace";
      ctx!.fillStyle = "rgba(120,130,160,0.55)";
      ctx!.textAlign = "right";
      ctx!.textBaseline = "top";
      ctx!.fillText(`⬤ ${zone[2]}`, w - 22, 22);
      ctx!.fillText(`${Math.round(sp * 100).toString().padStart(3, "0")}%`, w - 22, 37);
      ctx!.textAlign = "left";
      ctx!.textBaseline = "alphabetic";
    }

    // ── scroll hint ───────────────────────────────────────────────────────
    function drawScrollHint(w: number, h: number, sp: number) {
      if (sp > 0.06) return;
      const a = Math.max(0, 1 - sp * 16) * 0.40;
      ctx!.globalAlpha = a;
      ctx!.font = "10px monospace";
      ctx!.fillStyle = "#ededf3";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "bottom";
      ctx!.fillText("SCROLL TO EXPLORE", w / 2, h - 30);
      ctx!.strokeStyle = "#ededf3";
      ctx!.lineWidth = 1;
      const yc = h - 18;
      ctx!.beginPath();
      ctx!.moveTo(w / 2 - 9, yc - 5);
      ctx!.lineTo(w / 2, yc + 2);
      ctx!.lineTo(w / 2 + 9, yc - 5);
      ctx!.stroke();
      ctx!.globalAlpha = 1;
    }

    // ── main tick ─────────────────────────────────────────────────────────
    let t = 0;

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      const { w, h } = sizeRef.current;
      if (w === 0) return;

      const sp = scrollRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ps = pRef.current;
      if (!ps.length) return;

      const vH  = h * VIRTUAL_RATIO;
      const camY = sp * (vH - h);

      // physics
      for (const p of ps) {
        const sax = p.ax;
        const say = p.ay - camY;
        const k = (p.metallic && p.fs >= 60) ? K_TITLE : K_PHRASE;

        const fx_s = k * (sax - p.sx);
        const fy_s = k * (say - p.sy);

        const ddx = p.sx - mx;
        const ddy = p.sy - my;
        const d2  = ddx * ddx + ddy * ddy;
        let fx_c = 0, fy_c = 0;

        if (p.metallic && p.fs >= 60) {
          if (d2 < REPEL_R * REPEL_R && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = REPEL_F / d2;
            fx_c = (ddx / d) * f;
            fy_c = (ddy / d) * f;
          }
        } else {
          if (d2 < ATTRACT_R * ATTRACT_R && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = ATTRACT_F / d2;
            fx_c = -(ddx / d) * f;
            fy_c = -(ddy / d) * f;
          }
        }

        p.dvx = (p.dvx + fx_s + fx_c) * DAMP;
        p.dvy = (p.dvy + fy_s + fy_c) * DAMP;
        p.sx  += p.dvx;
        p.sy  += p.dvy;

        const buf  = 180;
        const inView = p.sy > -buf && p.sy < h + buf;
        p.alpha += ((inView ? 1 : 0) - p.alpha) * 0.05;
      }

      // background
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, w, h);
      drawGrid(w, h, t);

      // metallic glow layer
      const metals = ps.filter(p => p.metallic && p.alpha > 0.03);
      for (const p of metals) {
        drawGlow(p.sx, p.sy, p.fs * 2.0, p.alpha);
      }

      // liquid metal bridges
      const MAX_BD = 200;
      const MIN_BD = 28;
      for (let i = 0; i < metals.length; i++) {
        for (let j = i + 1; j < metals.length; j++) {
          const a = metals[i], b = metals[j];
          const dx = a.sx - b.sx, dy = a.sy - b.sy;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > MAX_BD || d < MIN_BD) continue;
          const t01 = 1 - d / MAX_BD;
          const ba = Math.min(a.alpha, b.alpha) * t01 * 0.55;
          drawBridge(a.sx, a.sy, b.sx, b.sy, a.fs * 0.12, b.fs * 0.12, ba);
        }
      }

      // glyphs
      ctx!.textAlign    = "center";
      ctx!.textBaseline = "middle";

      for (const p of ps) {
        if (p.alpha < 0.006) continue;
        ctx!.globalAlpha = p.alpha;
        ctx!.font = `${p.weight} ${p.fs}px "Arial Black", Arial, sans-serif`;

        if (p.metallic) {
          const hw = p.fs * p.label.length * 0.34;
          ctx!.fillStyle = chromeGrad(ctx!, p.sx, hw, t, p.shimmer);
        } else {
          ctx!.fillStyle =
            p.fs >= 50 ? "rgba(237,237,243,0.98)"
            : p.fs >= 18 ? "rgba(237,237,243,0.90)"
            : "rgba(180,185,200,0.72)";
        }

        ctx!.fillText(p.label, p.sx, p.sy);
      }
      ctx!.globalAlpha = 1;

      // pin anchors: dashed line + dot for title chars
      const titlePs = ps.filter(p => p.metallic && p.fs >= 60 && p.alpha > 0.25);
      for (const p of titlePs) {
        const sax = p.ax;
        const say = p.ay - camY;
        const dist = Math.hypot(p.sx - sax, p.sy - say);
        if (dist < 4) continue;
        const la = Math.min(p.alpha, dist / 70) * 0.38;
        ctx!.strokeStyle = `rgba(140,155,185,${la.toFixed(3)})`;
        ctx!.lineWidth = 0.5;
        ctx!.setLineDash([2, 5]);
        ctx!.beginPath();
        ctx!.moveTo(p.sx, p.sy);
        ctx!.lineTo(sax, say);
        ctx!.stroke();
        ctx!.setLineDash([]);
        ctx!.fillStyle = `rgba(200,210,235,${(la * 1.6).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(sax, say, 2.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      drawHUD(w, sp);
      drawScrollHint(w, h, sp);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: "500vh", background: BG }} />
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, display: "block", background: BG }}
      />
    </div>
  );
}
