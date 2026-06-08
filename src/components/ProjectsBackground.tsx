"use client";

import { useEffect, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

class LCG {
  private s: number;
  constructor(seed = 42) { this.s = seed >>> 0; }
  next(): number {
    this.s = Math.imul(this.s, 1664525) + 1013904223 >>> 0;
    return this.s / 0x100000000;
  }
}

interface Renderer {
  init(w: number, h: number): void;
  draw(ctx: CanvasRenderingContext2D, p: number, t: number, w: number, h: number): void;
  reset(): void;
  destroy(): void;
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 14 · CIRCUIT  — simplified PCB aesthetic
// Horizontal + vertical traces, via circles, signal-pulse dots.
// Black background, white strokes. Reveals progressively with p.
// ══════════════════════════════════════════════════════════════════════════════
class CircuitRenderer implements Renderer {
  private traces: { x1:number; y1:number; x2:number; y2:number; ph:number; thick:boolean }[] = [];
  private vias: { x:number; y:number }[] = [];

  init(w: number, h: number) {
    this.traces = []; this.vias = [];
    const rng = new LCG(14);

    // Power rails (thick)
    this.traces.push({ x1:0.04*w, y1:0.08*h, x2:0.96*w, y2:0.08*h, ph:rng.next()*6.28, thick:true });
    this.traces.push({ x1:0.04*w, y1:0.92*h, x2:0.96*w, y2:0.92*h, ph:rng.next()*6.28, thick:true });
    this.traces.push({ x1:0.065*w, y1:0.08*h, x2:0.065*w, y2:0.92*h, ph:rng.next()*6.28, thick:true });
    this.traces.push({ x1:0.935*w, y1:0.08*h, x2:0.935*w, y2:0.92*h, ph:rng.next()*6.28, thick:true });

    // Horizontal data traces
    const ySlots = [0.168, 0.252, 0.316, 0.380, 0.452, 0.516, 0.606, 0.636, 0.666, 0.696, 0.840];
    for (const y of ySlots) {
      let x = 0.065;
      while (x < 0.935) {
        const len = 0.06 + rng.next() * 0.22;
        const x2 = Math.min(0.935, x + len);
        this.traces.push({ x1:x*w, y1:y*h, x2:x2*w, y2:y*h, ph:rng.next()*6.28, thick:false });
        this.vias.push({ x:x2*w, y:y*h });
        x = x2 + 0.01 + rng.next() * 0.05;
      }
    }

    // Vertical buses
    for (const xb of [0.290, 0.558, 0.778]) {
      this.traces.push({ x1:xb*w, y1:0.08*h, x2:xb*w, y2:0.92*h, ph:rng.next()*6.28, thick:false });
      this.vias.push({ x:xb*w, y:0.08*h }); this.vias.push({ x:xb*w, y:0.92*h });
    }

    // Short vertical stubs
    for (let i = 0; i < 16; i++) {
      const x = 0.1 + rng.next() * 0.8;
      const y1 = 0.08 + rng.next() * 0.35;
      const y2 = y1 + 0.05 + rng.next() * 0.18;
      this.traces.push({ x1:x*w, y1:y1*h, x2:x*w, y2:Math.min(0.92,y2)*h, ph:rng.next()*6.28, thick:false });
      this.vias.push({ x:x*w, y:y1*h });
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: number, t: number, w: number, h: number) {
    ctx.fillStyle = "#0A0909";
    ctx.fillRect(0, 0, w, h);

    // Dot grid
    const step = Math.round(w * 0.042);
    ctx.fillStyle = "rgba(30,98,210,0.04)";
    for (let gx = Math.round(0.04*w); gx < 0.96*w; gx += step)
      for (let gy = Math.round(0.04*h); gy < 0.96*h; gy += step)
        ctx.fillRect(gx-0.6, gy-0.6, 1.2, 1.2);

    // PCB border
    ctx.strokeStyle = "rgba(30,98,210,0.10)";
    ctx.lineWidth = 0.9;
    ctx.strokeRect(0.04*w, 0.04*h, 0.92*w, 0.92*h);

    // Traces
    const revA = ss(0.0, 0.35, p);
    for (const tr of this.traces) {
      if (revA <= 0) continue;
      ctx.strokeStyle = tr.thick
        ? `rgba(30,98,210,${(revA * 0.52).toFixed(3)})`
        : `rgba(110,80,192,${(revA * 0.38).toFixed(3)})`;
      ctx.lineWidth = tr.thick ? 2.5 : 1.2;
      ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke();

      if (revA > 0.85) {
        const pp = ((t * (tr.thick ? 0.4 : 0.75) + tr.ph) % (Math.PI * 2)) / (Math.PI * 2);
        const px = lerp(tr.x1, tr.x2, pp), py = lerp(tr.y1, tr.y2, pp);
        ctx.beginPath(); ctx.arc(px, py, tr.thick ? 3.5 : 2, 0, Math.PI*2);
        ctx.fillStyle = "rgba(200,106,40,0.92)"; ctx.fill();
      }
    }

    // Vias
    const viaA = ss(0.3, 0.65, p);
    for (const v of this.vias) {
      if (viaA <= 0) continue;
      ctx.strokeStyle = `rgba(30,98,210,${(viaA * 0.32).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(v.x, v.y, 5, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = "#0A0909";
      ctx.beginPath(); ctx.arc(v.x, v.y, 2.8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(30,98,210,${(viaA * 0.45).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(v.x, v.y, 1.4, 0, Math.PI*2); ctx.fill();
    }

    // Corner fiducials
    const fidA = ss(0.06, 0.28, p);
    if (fidA > 0.01) {
      ctx.strokeStyle = `rgba(110,80,192,${(fidA * 0.18).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      for (const [fx, fy] of [[0.055*w,0.055*h],[0.945*w,0.055*h],[0.055*w,0.945*h],[0.945*w,0.945*h]]) {
        ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(fx, fy, 8.5, 0, Math.PI*2); ctx.stroke();
      }
    }
  }

  reset() {}
  destroy() {}
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 22-b · WOLFRAM — Rule 110 cellular automaton
// 1-D rows grow downward, scrolling upward as new generations are added.
// Blue-teal palette shading older rows darker.
// ══════════════════════════════════════════════════════════════════════════════
class WolframRenderer implements Renderer {
  private ncols = 0;
  private rowH = 4;
  private cells: Uint8Array = new Uint8Array(0);
  private rows: Uint8Array[] = [];
  private readonly RULE = 110;
  private ruleSet: boolean[] = [];

  init(w: number, h: number) {
    this.rowH = Math.max(2, Math.floor(h / 90));
    this.ncols = Math.ceil(w / this.rowH);
    this.ruleSet = Array.from({ length: 8 }, (_, i) => !!(this.RULE & (1 << i)));
    this.cells = new Uint8Array(this.ncols);
    this.cells[Math.floor(this.ncols / 2)] = 1;
    this.rows = [new Uint8Array(this.cells)];
  }

  private step() {
    const next = new Uint8Array(this.ncols);
    for (let i = 0; i < this.ncols; i++) {
      const l = i > 0 ? this.cells[i-1] : 0;
      const c = this.cells[i];
      const r = i < this.ncols-1 ? this.cells[i+1] : 0;
      next[i] = this.ruleSet[(l<<2)|(c<<1)|r] ? 1 : 0;
    }
    this.cells = next;
    this.rows.push(new Uint8Array(next));
  }

  draw(ctx: CanvasRenderingContext2D, p: number, _t: number, w: number, h: number) {
    ctx.fillStyle = "#0A0909";
    ctx.fillRect(0, 0, w, h);

    const nVisible = Math.ceil(h / this.rowH) + 2;
    while (this.rows.length < nVisible) this.step();

    const stepsPerFrame = 1 + (p > 0.5 ? 1 : 0);
    for (let s = 0; s < stepsPerFrame; s++) this.step();

    const startRow = Math.max(0, this.rows.length - nVisible);
    for (let ri = 0; ri < nVisible; ri++) {
      const rowIdx = startRow + ri;
      if (rowIdx >= this.rows.length) break;
      const row = this.rows[rowIdx];
      const y = ri * this.rowH;
      const age = ri / nVisible;
      // Dark violet → electric blue gradient as rows age (newer=darker)
      const r = Math.round(lerp(18, 30, age));
      const g = Math.round(lerp(12, 98, age));
      const b = Math.round(lerp(80, 210, age));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      for (let ci = 0; ci < this.ncols; ci++) {
        if (row[ci]) ctx.fillRect(ci * this.rowH, y, this.rowH - 1, this.rowH - 1);
      }
    }
  }

  reset() {
    this.cells = new Uint8Array(this.ncols);
    this.cells[Math.floor(this.ncols / 2)] = 1;
    this.rows = [new Uint8Array(this.cells)];
  }

  destroy() {}
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 22-c · LANGTON'S ANT — 2-state cellular automaton
// White cell: turn right, flip to black. Black cell: turn left, flip to white.
// Coloured by grid position to reveal the emergent highway pattern.
// ══════════════════════════════════════════════════════════════════════════════
class LangtonRenderer implements Renderer {
  private CW = 0; private CH = 0; private CS = 4;
  private grid: Uint8Array = new Uint8Array(0);
  private antX = 0; private antY = 0; private antDir = 0;

  init(w: number, h: number) {
    this.CS = Math.max(3, Math.min(6, Math.floor(w / 160)));
    this.CW = Math.ceil(w / this.CS);
    this.CH = Math.ceil(h / this.CS);
    this.grid = new Uint8Array(this.CW * this.CH);
    this.antX = Math.floor(this.CW / 2);
    this.antY = Math.floor(this.CH / 2);
    this.antDir = 0;
  }

  private step(n: number) {
    const { CW, CH, grid } = this;
    const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];
    for (let i = 0; i < n; i++) {
      const ci = this.antY * CW + this.antX;
      if (grid[ci] === 0) { grid[ci] = 1; this.antDir = (this.antDir + 1) % 4; }
      else                { grid[ci] = 0; this.antDir = (this.antDir + 3) % 4; }
      this.antX = (this.antX + dx[this.antDir] + CW) % CW;
      this.antY = (this.antY + dy[this.antDir] + CH) % CH;
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: number, _t: number, w: number, h: number) {
    ctx.fillStyle = "#0A0909";
    ctx.fillRect(0, 0, w, h);

    this.step(80 + Math.floor(p * 350));

    const { CW, CH, CS, grid } = this;
    const LPAL = [[30,98,210],[110,80,192],[200,106,40]] as const;
    for (let cy = 0; cy < CH; cy++) {
      for (let cx = 0; cx < CW; cx++) {
        if (!grid[cy * CW + cx]) continue;
        const t = ((cx / CW * 0.65 + cy / CH * 0.35) % 1 + 1) % 1;
        const band = Math.min(2, (t * 3) | 0);
        const u = t * 3 - band;
        const [r0,g0,b0] = LPAL[band], [r1,g1,b1] = LPAL[(band+1)%3];
        ctx.fillStyle = `rgba(${(r0+u*(r1-r0))|0},${(g0+u*(g1-g0))|0},${(b0+u*(b1-b0))|0},0.75)`;
        ctx.fillRect(cx * CS, cy * CS, CS - 1, CS - 1);
      }
    }

    // Ant marker
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(this.antX * CS - 1, this.antY * CS - 1, CS + 2, CS + 2);
  }

  reset() {
    this.grid.fill(0);
    this.antX = Math.floor(this.CW / 2);
    this.antY = Math.floor(this.CH / 2);
    this.antDir = 0;
  }

  destroy() {}
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 17 · KIKAI — monochrome technical typography
// Circuit-layer vocabulary arranged in varying sizes and opacities.
// Each term pulses at its own frequency; p drives the reveal fade-in.
// ══════════════════════════════════════════════════════════════════════════════
class KikaiRenderer implements Renderer {
  private terms: { text: string; x: number; y: number; size: number; baseAlpha: number; freq: number; phase: number }[] = [];

  private readonly WORDS = [
    "SUBSTRATE","LOGIC","DATA BUS","PROCESSOR","ROUTING","CLOCK",
    "POWER","SIGNAL","TRANSCEIVER","MEMORY","INPUT","OUTPUT",
    "BUFFER","GATE","REGISTER","ALU","CACHE","INTERRUPT","ADDRESS",
    "DECODE","FETCH","WRITE","VOLTAGE","CRYSTAL","GROUND","VCC",
  ];

  init(w: number, h: number) {
    const rng = new LCG(17);
    this.terms = this.WORDS.map(text => ({
      text,
      x: 0.06*w + rng.next() * 0.88*w,
      y: 0.08*h + rng.next() * 0.84*h,
      size: 10 + rng.next() * 52,
      baseAlpha: 0.06 + rng.next() * 0.22,
      freq: 0.3 + rng.next() * 0.9,
      phase: rng.next() * Math.PI * 2,
    }));
  }

  draw(ctx: CanvasRenderingContext2D, p: number, t: number, w: number, h: number) {
    ctx.fillStyle = "#0A0909";
    ctx.fillRect(0, 0, w, h);

    const revA = ss(0.05, 0.55, p);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const KCOLS = [[30,98,210],[200,106,40],[110,80,192]] as const;

    for (let ti = 0; ti < this.terms.length; ti++) {
      const term = this.terms[ti];
      const pulse = 0.7 + 0.3 * Math.sin(t * term.freq + term.phase);
      const alpha = term.baseAlpha * pulse * revA;
      ctx.globalAlpha = alpha;
      ctx.font = `${term.size | 0}px monospace`;
      const [kr,kg,kb] = KCOLS[ti % 3];
      ctx.fillStyle = `rgb(${kr},${kg},${kb})`;
      ctx.fillText(term.text, term.x, term.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  reset() {}
  destroy() {}
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 23-b · WAVE OPTICS — interference pattern pixel buffer
// 200×133 low-res canvas, sin(k·dist − phase) superposition from N sources.
// 4 chapter source configs: double-slit, wider slit, 4-slit grating, ring.
// Palette cycles from gold → teal → near-white → orange with progress.
// ══════════════════════════════════════════════════════════════════════════════
class WaveOpticsRenderer implements Renderer {
  private offEl: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;
  private offImg: ImageData | null = null;
  private frame = 0;

  private readonly WW = 200; private readonly HW = 133;
  private readonly TAU = Math.PI * 2;

  // Source positions in simulation space (WW=200, HW=133, centre=100,66.5)
  private readonly SRC_CFGS: [number,number][][] = [
    [[90, 66.5], [110, 66.5]],
    [[74, 66.5], [126, 66.5]],
    [[64, 66.5], [88, 66.5], [112, 66.5], [136, 66.5]],
    Array.from({length:8}, (_,k): [number,number] => [100+28*Math.cos(Math.PI*2*k/8), 66.5+28*Math.sin(Math.PI*2*k/8)]),
  ];
  private readonly K_BY_CH = [Math.PI*2/30, Math.PI*2/20, Math.PI*2/16, Math.PI*2/18];
  // [bgR,bgG,bgB, brightR,brightG,brightB]
  private readonly CH_PALS: [number,number,number,number,number,number][] = [
    [10,  9,  9,  30,  68, 240],  // BG → blue C1 (double-slit)
    [10,  9,  9, 110,  80, 192],  // BG → violet C3 (wider slit)
    [10,  9,  9,  30, 140, 210],  // BG → lighter blue (4-slit)
    [10,  9,  9, 216,  96,  32],  // BG → amber C2 (ring)
  ];

  init(_w: number, _h: number) {
    if (!this.offEl) {
      this.offEl = document.createElement("canvas");
      this.offEl.width = this.WW; this.offEl.height = this.HW;
      this.offCtx = this.offEl.getContext("2d");
    }
    this.offImg = this.offCtx!.createImageData(this.WW, this.HW);
    this.frame = 0;
  }

  draw(ctx: CanvasRenderingContext2D, p: number, _t: number, w: number, h: number) {
    this.frame++;
    const { WW, HW, TAU, SRC_CFGS, K_BY_CH, CH_PALS } = this;
    const chF = p * 4, chIdx = Math.min(3, chF|0), chT = chF - chIdx;
    const next = Math.min(3, chIdx + 1);
    const blend = ss(0.72, 1.0, chT);
    const phase = this.frame * 0.16 + p * TAU * 6;

    const cfg0 = SRC_CFGS[chIdx], cfg1 = SRC_CFGS[next];
    const n0 = cfg0.length, n1 = cfg1.length, nSrc = Math.max(n0, n1);
    const kBlend = lerp(K_BY_CH[chIdx], K_BY_CH[next], blend);
    const p0 = CH_PALS[chIdx], p1 = CH_PALS[next];
    const bgR=lerp(p0[0],p1[0],blend)|0, bgG=lerp(p0[1],p1[1],blend)|0, bgB=lerp(p0[2],p1[2],blend)|0;
    const brR=lerp(p0[3],p1[3],blend)|0, brG=lerp(p0[4],p1[4],blend)|0, brB=lerp(p0[5],p1[5],blend)|0;

    const sd = this.offImg!.data;
    for (let py = 0; py < HW; py++) {
      for (let px = 0; px < WW; px++) {
        let field = 0;
        for (let s = 0; s < nSrc; s++) {
          const [sx0,sy0] = cfg0[s%n0], [sx1,sy1] = cfg1[s%n1];
          const sx = lerp(sx0, sx1, blend), sy = lerp(sy0, sy1, blend);
          const dist = Math.sqrt((px-sx)*(px-sx) + (py-sy)*(py-sy));
          field += Math.sin(kBlend * dist - phase);
        }
        const brt = Math.max(0, Math.min(1, (field / nSrc + 1) * 0.5));
        const brt2 = brt * brt;
        const pi = (py * WW + px) << 2;
        sd[pi]   = (bgR + (brR-bgR) * brt2) | 0;
        sd[pi+1] = (bgG + (brG-bgG) * brt2) | 0;
        sd[pi+2] = (bgB + (brB-bgB) * brt2) | 0;
        sd[pi+3] = 255;
      }
    }
    this.offCtx!.putImageData(this.offImg!, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.offEl!, 0, 0, w, h);
  }

  reset() { this.frame = 0; }
  destroy() { this.offEl = null; this.offCtx = null; this.offImg = null; }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const PHASE_DURATION = 22; // seconds per phase

export function ProjectsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const renderers: Renderer[] = [
      new CircuitRenderer(),
      new WolframRenderer(),
      new LangtonRenderer(),
      new KikaiRenderer(),
      new WaveOpticsRenderer(),
    ];
    renderers.forEach(r => r.init(W, H));

    let activePhase = 0;
    let fadeAlpha = 1;
    let fadingOut = false, fadingIn = false;
    let phaseTime = 0;
    let lastTs = -1;
    let raf: number;

    const tick = (ts: number) => {
      if (lastTs < 0) lastTs = ts;
      const dt = Math.min(0.06, (ts - lastTs) * 0.001);
      lastTs = ts;

      if (!fadingOut && !fadingIn) {
        phaseTime += dt;
        if (phaseTime >= PHASE_DURATION) {
          phaseTime = 0; fadingOut = true;
        }
      }
      if (fadingOut) {
        fadeAlpha = Math.max(0, fadeAlpha - dt * 2.2);
        if (fadeAlpha <= 0) {
          fadingOut = false; fadingIn = true;
          activePhase = (activePhase + 1) % renderers.length;
          renderers[activePhase].reset();
          renderers[activePhase].init(W, H);
        }
      }
      if (fadingIn) {
        fadeAlpha = Math.min(1, fadeAlpha + dt * 2.2);
        if (fadeAlpha >= 1) fadingIn = false;
      }

      const p = Math.min(1, phaseTime / PHASE_DURATION);
      const t = ts * 0.001;

      ctx.fillStyle = "rgb(10,9,9)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = fadeAlpha * 0.50;
      renderers[activePhase].draw(ctx, p, t, W, H);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W; canvas.height = H;
        renderers.forEach(r => r.init(W, H));
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      renderers.forEach(r => r.destroy());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
