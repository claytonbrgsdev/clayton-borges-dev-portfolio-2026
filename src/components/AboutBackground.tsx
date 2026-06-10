"use client";

import { useEffect, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ss = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Renderer {
  init(w: number, h: number): void;
  draw(ctx: CanvasRenderingContext2D, p: number, t: number, w: number, h: number): void;
  reset(): void;
  destroy(): void;
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 23-c · IFS CHAOS GAME — iterated function systems
// 220×146 density buffer accumulating random affine transform applications.
// 3 fractals: Barnsley fern → Lévy curve → Heighway dragon.
// sqrt-mapped density gives natural luminance falloff.
// ══════════════════════════════════════════════════════════════════════════════
class IFSRenderer implements Renderer {
  private offEl: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;
  private offImg: ImageData | null = null;
  private readonly WI = 220; private readonly HI = 146; private readonly NI = 220*146;
  private readonly density = new Float32Array(220*146);
  private curX = 0; private curY = 0; private lastCh = -1; private chapterStartT = -1;

  // [a,b,c,d,e,f], cumulative probs
  private readonly SYSTEMS: { t: [number,number,number,number,number,number][]; cp: number[]; xMin:number;xMax:number;yMin:number;yMax:number }[] = [
    { // Barnsley fern
      t:  [[ 0.00, 0.00, 0.00, 0.16, 0.00, 0.00],[ 0.85, 0.04,-0.04, 0.85, 0.00, 1.60],[ 0.20,-0.26, 0.23, 0.22, 0.00, 1.60],[-0.15, 0.28, 0.26, 0.24, 0.00, 0.44]],
      cp: [0.01, 0.86, 0.93, 1.00], xMin:-2.5, xMax:2.5, yMin:0, yMax:10,
    },
    { // Lévy C curve
      t:  [[ 0.50,-0.50, 0.50, 0.50, 0.00, 0.00],[ 0.50, 0.50,-0.50, 0.50, 0.50, 0.50]],
      cp: [0.50,1.00], xMin:-0.55, xMax:1.55, yMin:-0.05, yMax:1.55,
    },
    { // Heighway dragon
      t:  [[ 0.50,-0.50, 0.50, 0.50, 0.00, 0.00],[-0.50,-0.50, 0.50,-0.50, 1.00, 0.00]],
      cp: [0.50,1.00], xMin:-0.4, xMax:1.4, yMin:-0.5, yMax:1.2,
    },
  ];
  private readonly PALS: [number,number,number,number,number,number][] = [
    [10,  9,  9,  30,  68, 240],  // BG → blue   (Barnsley fern)
    [10,  9,  9, 216,  96,  32],  // BG → orange (Lévy C)
    [10,  9,  9,  30,  68, 240],  // BG → blue   (Heighway dragon)
  ];

  init(_w: number, _h: number) {
    if (!this.offEl) {
      this.offEl = document.createElement("canvas");
      this.offEl.width = this.WI; this.offEl.height = this.HI;
      this.offCtx = this.offEl.getContext("2d");
    }
    this.offImg = this.offCtx!.createImageData(this.WI, this.HI);
    this.density.fill(0); this.lastCh = -1; this.curX = 0; this.curY = 0; this.chapterStartT = -1;
  }

  draw(ctx: CanvasRenderingContext2D, p: number, t: number, w: number, h: number) {
    const { WI, HI, NI, density, SYSTEMS, PALS } = this;
    const chIdx = Math.min(2, (p * 3) | 0);

    if (chIdx !== this.lastCh) {
      density.fill(0); this.curX = 0; this.curY = 0; this.lastCh = chIdx; this.chapterStartT = t;
    }

    const sys = SYSTEMS[chIdx];
    const SPLAT = 0.035, DECAY = 0.9987;
    // fractal formation: ramp N quadratically from ~0 to 6000 over 3s
    const buildRamp = Math.min(1, (t - this.chapterStartT) / 3.0);
    const N = Math.max(80, (6000 * buildRamp * buildRamp) | 0);

    for (let i = 0; i < NI; i++) density[i] *= DECAY;

    for (let i = 0; i < N; i++) {
      const r = Math.random();
      let ti = 0;
      while (ti < sys.cp.length - 1 && r >= sys.cp[ti]) ti++;
      const [a,b,c,d,e,f] = sys.t[ti];
      const nx = a*this.curX + b*this.curY + e;
      const ny = c*this.curX + d*this.curY + f;
      this.curX = nx; this.curY = ny;
      const pxX = ((nx - sys.xMin) / (sys.xMax - sys.xMin) * WI) | 0;
      const pxY = ((1 - (ny - sys.yMin) / (sys.yMax - sys.yMin)) * HI) | 0;
      if (pxX >= 0 && pxX < WI && pxY >= 0 && pxY < HI) {
        const di = pxY * WI + pxX;
        const v = density[di] + SPLAT; density[di] = v > 1 ? 1 : v;
      }
    }

    // hard palette per chapter — no RGB lerp between chapters (avoids green bleed)
    const pal = PALS[chIdx];
    const bgR = pal[0], bgG = pal[1], bgB = pal[2];
    const fgR = pal[3], fgG = pal[4], fgB = pal[5];

    const sd = this.offImg!.data;
    for (let idx = 0; idx < NI; idx++) {
      const brt = Math.min(1, Math.sqrt(density[idx] * 1.8));
      const pi = idx << 2;
      sd[pi]   = (bgR + (fgR-bgR)*brt) | 0;
      sd[pi+1] = (bgG + (fgG-bgG)*brt) | 0;
      sd[pi+2] = (bgB + (fgB-bgB)*brt) | 0;
      sd[pi+3] = 255;
    }
    this.offCtx!.putImageData(this.offImg!, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.offEl!, 0, 0, w, h);
  }

  reset() { this.density.fill(0); this.lastCh = -1; this.curX = 0; this.curY = 0; this.chapterStartT = -1; }
  destroy() { this.offEl = null; this.offCtx = null; this.offImg = null; }
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 24-c · L-SYSTEM — grammar-based branching structures
// 4 systems: Koch snowflake → Dragon curve → Hilbert → Plant.
// Segments pre-computed at init; progress drives how many are drawn.
// ══════════════════════════════════════════════════════════════════════════════
class LSystemRenderer implements Renderer {
  private data: { segs:Float32Array; nSegs:number; xMin:number; xMax:number; yMin:number; yMax:number } | null = null;
  private lastCh = -1;
  private chapterStartT = -1;

  private readonly SYS = [
    { axiom:"F--F--F",     rules:{ F:"F+F--F+F" },                              angle:60,  depth:4,  init:0 },
    { axiom:"FX",          rules:{ X:"X+YF+", Y:"-FX-Y" },                      angle:90,  depth:12, init:0 },
    { axiom:"A",           rules:{ A:"+BF-AFA-FB+", B:"-AF+BFB+FA-" },          angle:90,  depth:5,  init:0 },
    { axiom:"X",           rules:{ X:"F+[[X]-X]-F[-FX]+X", F:"FF" },            angle:25,  depth:6,  init:-Math.PI*0.5 },
  ];
  private readonly DARK = ["#0A0909","#0A0909","#0A0909","#0A0909"];
  private readonly COLS: [number,number,number][] = [[30,68,240],[216,96,32],[30,68,240],[216,96,32]];

  private expand(axiom: string, rules: Record<string,string>, n: number): string {
    let s = axiom;
    for (let i = 0; i < n; i++) {
      const parts: string[] = [];
      for (let j = 0; j < s.length; j++) parts.push(rules[s[j]] ?? s[j]);
      s = parts.join("");
      if (s.length > 800_000) break;
    }
    return s;
  }

  private interpret(s: string, angleDeg: number, initAngle: number) {
    const da = angleDeg * Math.PI / 180;
    const x0s: number[] = [], y0s: number[] = [], x1s: number[] = [], y1s: number[] = [];
    let x = 0, y = 0, θ = initAngle;
    const stack: [number,number,number][] = [];
    for (const c of s) {
      if (c==='F'||c==='G') { const nx=x+Math.cos(θ),ny=y+Math.sin(θ); x0s.push(x);y0s.push(y);x1s.push(nx);y1s.push(ny); x=nx;y=ny; }
      else if (c==='+') θ+=da; else if (c==='-') θ-=da;
      else if (c==='[') stack.push([x,y,θ]); else if (c===']') { const sv=stack.pop(); if(sv){x=sv[0];y=sv[1];θ=sv[2];} }
    }
    const n = x0s.length, segs = new Float32Array(n*4);
    let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity;
    for (let i = 0; i < n; i++) {
      segs[i*4]=x0s[i];segs[i*4+1]=y0s[i];segs[i*4+2]=x1s[i];segs[i*4+3]=y1s[i];
      if(x0s[i]<xMin)xMin=x0s[i];if(x1s[i]<xMin)xMin=x1s[i];
      if(x0s[i]>xMax)xMax=x0s[i];if(x1s[i]>xMax)xMax=x1s[i];
      if(y0s[i]<yMin)yMin=y0s[i];if(y1s[i]<yMin)yMin=y1s[i];
      if(y0s[i]>yMax)yMax=y0s[i];if(y1s[i]>yMax)yMax=y1s[i];
    }
    return { segs, nSegs:n, xMin, xMax, yMin, yMax };
  }

  init(_w: number, _h: number) { this.data = null; this.lastCh = -1; this.chapterStartT = -1; }

  draw(ctx: CanvasRenderingContext2D, p: number, t: number, w: number, h: number) {
    const chIdx = Math.min(3, (p * 4) | 0);
    if (chIdx !== this.lastCh) {
      const sys = this.SYS[chIdx];
      this.data = this.interpret(this.expand(sys.axiom, sys.rules as unknown as Record<string, string>, sys.depth), sys.angle, sys.init);
      this.lastCh = chIdx;
      this.chapterStartT = t;
    }
    if (!this.data) return;

    ctx.fillStyle = this.DARK[chIdx];
    ctx.fillRect(0, 0, w, h);

    const { segs, nSegs, xMin, xMax, yMin, yMax } = this.data;
    const pxR = xMax-xMin||1, pyR = yMax-yMin||1;
    const scale = Math.min(w*0.82/pxR, h*0.82/pyR);
    const offX = w/2 - (xMin+pxR/2)*scale;
    const offY = h/2 - (yMin+pyR/2)*scale;

    const elapsed = t - this.chapterStartT;
    const animFrac = (elapsed * 0.22) % 1;
    const drawCount = (nSegs * animFrac) | 0;
    const [r,g,b] = this.COLS[chIdx];

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${r},${g},${b},0.65)`;
    ctx.lineWidth = 0.9;
    for (let i = 0; i < drawCount; i++) {
      const si = i << 2;
      ctx.moveTo(segs[si]*scale+offX, segs[si+1]*scale+offY);
      ctx.lineTo(segs[si+2]*scale+offX, segs[si+3]*scale+offY);
    }
    ctx.stroke();
  }

  reset() { this.data = null; this.lastCh = -1; this.chapterStartT = -1; }
  destroy() {}
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 25-b · WIREWORLD — 4-state cellular automaton
// States: 0=empty  1=electron head  2=electron tail  3=copper wire.
// 4 wire patterns per chapter: concentric rings → Lissajous → 8-rose →
// hypocycloid (astroid). Electron signals orbit the wire paths.
// ══════════════════════════════════════════════════════════════════════════════
class WireWorldRenderer implements Renderer {
  private offEl: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;
  private offImg: ImageData | null = null;
  private readonly GW = 100; private readonly GH = 66; private readonly GN = 100*66;
  private grid: Uint8Array = new Uint8Array(100*66);
  private gridNext: Uint8Array = new Uint8Array(100*66);
  private lastCh = -1;

  private readonly CX = 50; private readonly CY = 33;
  // [bg, wire, head, tail] per chapter (RGB triples)
  // [bg, wire, head, tail] per chapter — unified palette
  private readonly PALS = [
    [[10,9,9],[20,38,95],[30,68,240],[12,25,60]],    // blue   (circles)
    [[10,9,9],[80,42,10],[216,96,32],[50,25,6]],     // orange (Lissajous)
    [[10,9,9],[20,38,95],[30,68,240],[12,25,60]],    // blue   (rose)
    [[10,9,9],[80,42,10],[216,96,32],[50,25,6]],     // orange (hypocycloid)
  ];

  private w(x: number, y: number) {
    const xi=Math.round(x),yi=Math.round(y);
    if(xi>=0&&xi<this.GW&&yi>=0&&yi<this.GH&&this.grid[yi*this.GW+xi]===0) this.grid[yi*this.GW+xi]=3;
  }
  private hd(x: number, y: number) {
    const xi=Math.round(x),yi=Math.round(y);
    if(xi>=0&&xi<this.GW&&yi>=0&&yi<this.GH) this.grid[yi*this.GW+xi]=1;
  }
  private tl(x: number, y: number) {
    const xi=Math.round(x),yi=Math.round(y);
    if(xi>=0&&xi<this.GW&&yi>=0&&yi<this.GH) this.grid[yi*this.GW+xi]=2;
  }

  private initCircles() {
    this.grid.fill(0);
    const { CX: cx, CY: cy } = this;
    for (const r of [9,14,20,27]) {
      const steps = Math.ceil(2*Math.PI*r*1.3)|0;
      for (let k=0; k<steps; k++) { const θ=k/steps*2*Math.PI; this.w(cx+r*Math.cos(θ),cy+r*Math.sin(θ)); }
      for (const θ0 of [0,Math.PI]) {
        const sa=2*Math.PI/steps;
        this.hd(cx+r*Math.cos(θ0),cy+r*Math.sin(θ0));
        this.tl(cx+r*Math.cos(θ0-sa),cy+r*Math.sin(θ0-sa));
      }
    }
  }

  private initLissajous() {
    this.grid.fill(0);
    const { CX: cx, CY: cy, GW, GH } = this;
    const A=GW*0.39,B=GH*0.39, steps=1800;
    for (let k=0; k<=steps; k++) { const t=k/steps*2*Math.PI; this.w(cx+A*Math.cos(2*t),cy+B*Math.sin(3*t)); }
    const t0=0; this.hd(cx+A*Math.cos(0),cy+B*Math.sin(0));
    const tp=(steps-1)/steps*2*Math.PI; this.tl(cx+A*Math.cos(2*tp),cy+B*Math.sin(3*tp));
    const t1=2*Math.PI/3,tp1=t1-2*Math.PI/1800;
    this.hd(cx+A*Math.cos(2*t1),cy+B*Math.sin(3*t1));
    this.tl(cx+A*Math.cos(2*tp1),cy+B*Math.sin(3*tp1));
  }

  private initRose() {
    this.grid.fill(0);
    const { CX: cx, CY: cy, GW, GH } = this;
    const a=Math.min(GW,GH)*0.44, steps=3000;
    for (let k=0; k<=steps; k++) { const θ=k/steps*2*Math.PI; this.w(cx+a*Math.cos(4*θ)*Math.cos(θ),cy+a*Math.cos(4*θ)*Math.sin(θ)); }
    for (let pp=0; pp<4; pp++) {
      const θh=pp*Math.PI/4, rh=a*Math.cos(4*θh);
      this.hd(cx+rh*Math.cos(θh),cy+rh*Math.sin(θh));
      const θt=θh-2*Math.PI/steps, rt=a*Math.cos(4*θt);
      this.tl(cx+rt*Math.cos(θt),cy+rt*Math.sin(θt));
    }
  }

  private initHypocycloid() {
    this.grid.fill(0);
    const { CX: cx, CY: cy } = this;
    const R=28,r=7, steps=2500;
    for (let k=0; k<=steps; k++) {
      const t=k/steps*2*Math.PI;
      this.w(cx+(R-r)*Math.cos(t)+r*Math.cos((R-r)/r*t), cy+(R-r)*Math.sin(t)-r*Math.sin((R-r)/r*t));
    }
    this.hd(cx+(R-r)+r,cy); this.tl(cx+(R-r)*Math.cos(-2*Math.PI/steps)+r*Math.cos((R-r)/r*(-2*Math.PI/steps)),cy+(R-r)*Math.sin(-2*Math.PI/steps)-r*Math.sin((R-r)/r*(-2*Math.PI/steps)));
  }

  private step() {
    const { GW, GH, GN, grid, gridNext } = this;
    gridNext.fill(0);
    for (let y=0; y<GH; y++) {
      for (let x=0; x<GW; x++) {
        const i=y*GW+x;
        if (grid[i]===1) { gridNext[i]=2; continue; }
        if (grid[i]===2) { gridNext[i]=3; continue; }
        if (grid[i]===0) continue;
        let heads=0;
        for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
          if (dx===0&&dy===0) continue;
          if (grid[((y+dy+GH)%GH)*GW+(x+dx+GW)%GW]===1) heads++;
        }
        gridNext[i]=(heads===1||heads===2)?1:3;
      }
    }
    void GN;
    const tmp=this.grid; this.grid=this.gridNext; this.gridNext=tmp;
  }

  init(_w: number, _h: number) {
    if (!this.offEl) {
      this.offEl = document.createElement("canvas");
      this.offEl.width = this.GW; this.offEl.height = this.GH;
      this.offCtx = this.offEl.getContext("2d");
    }
    this.offImg = this.offCtx!.createImageData(this.GW, this.GH);
    this.lastCh = -1;
    this.initCircles();
  }

  draw(ctx: CanvasRenderingContext2D, p: number, _t: number, w: number, h: number) {
    const chIdx = Math.min(3, (p * 4) | 0);
    if (chIdx !== this.lastCh) {
      this.lastCh = chIdx;
      switch (chIdx) {
        case 0: this.initCircles(); break;
        case 1: this.initLissajous(); break;
        case 2: this.initRose(); break;
        case 3: this.initHypocycloid(); break;
      }
    }
    this.step(); this.step(); this.step();

    const pal = this.PALS[chIdx];
    const sd = this.offImg!.data;
    const { GW, GH, grid } = this;
    for (let i=0; i<GW*GH; i++) {
      const s=grid[i], pi=i<<2;
      const [r,g,b] = pal[s===0?0:s===3?1:s===1?2:3];
      sd[pi]=r;sd[pi+1]=g;sd[pi+2]=b;sd[pi+3]=255;
    }
    this.offCtx!.putImageData(this.offImg!, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.offEl!, 0, 0, w, h);
  }

  reset() { this.lastCh = -1; }
  destroy() { this.offEl = null; this.offCtx = null; this.offImg = null; }
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 20-c · SAND — falling-sand physics simulation
// 3 materials: sand (amber), water (blue), stone (grey static platforms).
// Progress shifts spawn position; chapters swap between sand and water.
// ══════════════════════════════════════════════════════════════════════════════
class SandRenderer implements Renderer {
  private GW = 0; private GH = 0; private scale = 4;
  private grid: Uint8Array = new Uint8Array(0);
  private spawnTimer = 0;

  init(w: number, h: number) {
    this.scale = Math.max(3, Math.min(5, Math.floor(w / 200)));
    this.GW = Math.ceil(w / this.scale);
    this.GH = Math.ceil(h / this.scale);
    this.grid = new Uint8Array(this.GW * this.GH);
    this.spawnTimer = 0;
    this.buildPlatforms();
  }

  private buildPlatforms() {
    const GW: number = this.GW;
    const GH: number = this.GH;
    const grid: Uint8Array = this.grid;
    const midY: number = Math.floor(GH * 0.45);
    for (let x = Math.floor(GW*0.15); x < Math.floor(GW*0.38); x++) grid[midY*GW+x] = 3;
    for (let x = Math.floor(GW*0.62); x < Math.floor(GW*0.85); x++) grid[(midY+10)*GW+x] = 3;
    for (let x = Math.floor(GW*0.35); x < Math.floor(GW*0.65); x++) grid[(midY+20)*GW+x] = 3;
    for (let x = 0; x < GW; x++) grid[(GH-1)*GW+x] = 3;
  }

  private physStep() {
    const { GW, GH, grid } = this;
    for (let y = GH-2; y >= 0; y--) {
      for (let x = GW-1; x >= 0; x--) {
        const i = y*GW+x, cell = grid[i];
        if (cell===0||cell===3) continue;
        const below = (y+1)*GW+x;
        if (grid[below]===0) { grid[below]=cell; grid[i]=0; continue; }
        if (cell===1) { // sand diagonal
          const dl=(y+1)*GW+(x-1), dr=(y+1)*GW+(x+1);
          if (x>0&&grid[dl]===0) { grid[dl]=cell; grid[i]=0; }
          else if (x<GW-1&&grid[dr]===0) { grid[dr]=cell; grid[i]=0; }
        } else if (cell===2) { // water: diagonal + horizontal
          const dl=(y+1)*GW+(x-1), dr=(y+1)*GW+(x+1);
          const lf=y*GW+(x-1), rt=y*GW+(x+1);
          if (x>0&&grid[dl]===0)      { grid[dl]=cell; grid[i]=0; }
          else if (x<GW-1&&grid[dr]===0) { grid[dr]=cell; grid[i]=0; }
          else if (x>0&&grid[lf]===0)    { grid[lf]=cell; grid[i]=0; }
          else if (x<GW-1&&grid[rt]===0) { grid[rt]=cell; grid[i]=0; }
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: number, _t: number, w: number, h: number) {
    ctx.fillStyle = "#0A0909";
    ctx.fillRect(0, 0, w, h);

    // Spawn material
    this.spawnTimer += 0.016;
    if (this.spawnTimer > 0.025) {
      this.spawnTimer = 0;
      const sx = ((0.15 + p * 0.7) * this.GW) | 0;
      const mat = p < 0.4 ? 1 : (p < 0.7 ? 2 : 1);
      if (sx>=0&&sx<this.GW&&this.grid[sx]===0) this.grid[sx]=mat;
    }

    for (let s=0; s<3; s++) this.physStep();

    const { GW, GH, grid, scale } = this;
    for (let y=0; y<GH; y++) {
      for (let x=0; x<GW; x++) {
        const c = grid[y*GW+x];
        if (c===0) continue;
        ctx.fillStyle = c===1 ? "#D86020" : c===2 ? "#1E44F0" : "#1C1A18";
        ctx.fillRect(x*scale, y*scale, scale, scale);
      }
    }
  }

  reset() {
    this.grid.fill(0);
    this.buildPlatforms();
    this.spawnTimer = 0;
  }
  destroy() {}
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 23 · ISING — ferromagnetic spin lattice (Metropolis algorithm)
// Temperature schedule: hot disorder → Curie-point transition → ordered.
// Two-colour output: spin-up (warm red) vs spin-down (cool blue).
// ══════════════════════════════════════════════════════════════════════════════
class IsingRenderer implements Renderer {
  private GW = 0; private GH = 0;
  private spins: Int8Array = new Int8Array(0);
  private offEl: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;
  private offImg: ImageData | null = null;

  init(w: number, h: number) {
    const scale = Math.max(3, Math.min(6, Math.floor(w / 160)));
    this.GW = Math.ceil(w / scale);
    this.GH = Math.ceil(h / scale);
    this.spins = new Int8Array(this.GW * this.GH);
    for (let i=0; i<this.spins.length; i++) this.spins[i] = Math.random()<0.5?1:-1;
    if (!this.offEl) {
      this.offEl = document.createElement("canvas");
      this.offEl.width = this.GW; this.offEl.height = this.GH;
      this.offCtx = this.offEl.getContext("2d");
    }
    this.offImg = this.offCtx!.createImageData(this.GW, this.GH);
  }

  private metropolis(T: number, sweeps: number) {
    const { GW, GH, spins } = this;
    const N = GW * GH;
    for (let sw=0; sw<sweeps; sw++) {
      for (let i=0; i<N; i++) {
        const idx = (Math.random()*N)|0;
        const x=idx%GW, y=(idx/GW)|0;
        const s=spins[idx];
        const nb = spins[y*GW+(x-1+GW)%GW]+spins[y*GW+(x+1)%GW]+spins[((y-1+GH)%GH)*GW+x]+spins[((y+1)%GH)*GW+x];
        const dE = 2*s*nb;
        if (dE<=0||Math.random()<Math.exp(-dE/T)) spins[idx]=-s;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: number, _t: number, w: number, h: number) {
    // Temperature ramp: start hot (disorder) → pass through Tc≈2.27 → cold (order)
    const T = lerp(3.5, 1.5, ss(0, 0.8, p));
    this.metropolis(T, 2);

    const { GW, GH, spins } = this;
    const sd = this.offImg!.data;
    for (let i=0; i<GW*GH; i++) {
      const up = spins[i] > 0;
      const pi = i<<2;
      sd[pi]   = up ? 30  : 200;
      sd[pi+1] = up ? 98  : 106;
      sd[pi+2] = up ? 210 : 40;
      sd[pi+3] = 255;
    }
    this.offCtx!.putImageData(this.offImg!, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.offEl!, 0, 0, w, h);
  }

  reset() {
    for (let i=0; i<this.spins.length; i++) this.spins[i]=Math.random()<0.5?1:-1;
  }
  destroy() { this.offEl=null; this.offCtx=null; this.offImg=null; }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const PHASE_DURATION = 22;

export function AboutBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = document.documentElement.clientWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const renderers: Renderer[] = [
      new IFSRenderer(),
      new LSystemRenderer(),
      new WireWorldRenderer(),
      new SandRenderer(),
      new IsingRenderer(),
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
        if (phaseTime >= PHASE_DURATION) { phaseTime = 0; fadingOut = true; }
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
      ctx.globalAlpha = fadeAlpha * 0.45;
      renderers[activePhase].draw(ctx, p, t, W, H);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = document.documentElement.clientWidth; H = window.innerHeight;
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
