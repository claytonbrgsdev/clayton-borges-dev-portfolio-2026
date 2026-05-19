"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x = Math.max(0, Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a + (b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));
const TAU = Math.PI*2;

const W_T = 200, H_T = 130, N_T = W_T*H_T;
const N_AGENTS = 4000;
const SA  = Math.PI/8;   // 22.5° sensor angle
const RA  = Math.PI/4;   // 45° rotation step
const SO  = 9;           // sensor offset
const WT  = 5;           // deposit amount
const SS_AGENT = 1.3;    // step size

const SECTIONS = [
  [1,"I",  0.000,0.018,0.065,0.083],
  [1,"II", 0.083,0.101,0.149,0.167],
  [1,"III",0.167,0.185,0.232,0.250],
  [2,"I",  0.250,0.268,0.315,0.333],
  [2,"II", 0.333,0.351,0.399,0.417],
  [2,"III",0.417,0.435,0.482,0.500],
  [3,"I",  0.500,0.518,0.565,0.583],
  [3,"II", 0.583,0.601,0.649,0.667],
  [3,"III",0.667,0.685,0.732,0.750],
  [4,"I",  0.750,0.768,0.815,0.833],
  [4,"II", 0.833,0.851,0.899,0.917],
  [4,"III",0.917,0.935,0.982,1.000],
] as const;

const CH_NAMES = ["MYCELIA","VESSEL","MEMBRANE","DISSOLUTION"];

const HEADINGS: [string,string][] = [
  ["SPORE",       "the first agent has no plan"],
  ["FILAMENT",    "grows where the path rewards itself"],
  ["NETWORK",     "emerges without a center"],
  ["VESSEL",      "routes become arteries"],
  ["THE MACHINE", "is distributed and mindless"],
  ["OPTIMIZATION","without intention"],
  ["MEMBRANE",    "a surface defined by use"],
  ["BOUNDARY",    "where two trails stopped meeting"],
  ["MINIMUM",     "the network forgets its excess"],
  ["DISSOLUTION", "the organism withdraws"],
  ["TRACE",       "of what connected everything"],
  ["ABSENCE",     "remembers the shape of presence"],
];

// [bg_r,bg_g,bg_b, trail_r,trail_g,trail_b]
const PALETTES: [number,number,number,number,number,number][] = [
  [ 8,  6, 10, 185, 215, 200],  // near-black → sage biological green
  [ 6,  8, 14, 225, 175, 120],  // dark blue-black → warm amber
  [10,  6,  8, 200, 185, 215],  // dark red-black → pale violet
  [ 5,  5,  7, 238, 232, 222],  // pure black → cold white
];

function buildSketch(
  el: HTMLElement,
  scrollEl: HTMLElement,
  sectionEls: Array<HTMLDivElement|null>,
): Promise<p5Type> {
  return import("p5").then(({ default: P5 }) => {
    const trail  = new Float32Array(N_T);
    const trail2 = new Float32Array(N_T);
    const ax     = new Float32Array(N_AGENTS);
    const ay     = new Float32Array(N_AGENTS);
    const aa     = new Float32Array(N_AGENTS);

    // Init agents in a ring facing inward
    for (let i = 0; i < N_AGENTS; i++) {
      const theta = (i / N_AGENTS) * TAU;
      const r = Math.min(W_T, H_T) * 0.3 * (0.7 + Math.random()*0.3);
      ax[i] = W_T*0.5 + r*Math.cos(theta);
      ay[i] = H_T*0.5 + r*Math.sin(theta);
      aa[i] = theta + Math.PI;
    }

    // Seed faint circular gradient to anchor early network
    for (let j = 0; j < H_T; j++) {
      for (let i = 0; i < W_T; i++) {
        const dx = i-W_T*0.5, dy = j-H_T*0.5;
        const r2 = dx*dx+dy*dy;
        trail[j*W_T+i] = Math.max(0, 1-Math.sqrt(r2)/(Math.min(W_T,H_T)*0.38))*14;
      }
    }

    function sampleT(x: number, y: number): number {
      const xi = Math.round(x), yi = Math.round(y);
      if (xi<0||xi>=W_T||yi<0||yi>=H_T) return 0;
      return trail[yi*W_T+xi];
    }

    function stepSim(decay: number) {
      for (let wi = 0; wi < N_AGENTS; wi++) {
        const x = ax[wi], y = ay[wi], a = aa[wi];
        const fF  = sampleT(x+Math.cos(a)*SO,    y+Math.sin(a)*SO);
        const fFL = sampleT(x+Math.cos(a-SA)*SO, y+Math.sin(a-SA)*SO);
        const fFR = sampleT(x+Math.cos(a+SA)*SO, y+Math.sin(a+SA)*SO);

        let na = a;
        if (fF>=fFL && fF>=fFR) { /* stay */ }
        else if (fFL>fFR) na = a - RA*(0.5+Math.random()*0.5);
        else if (fFR>fFL) na = a + RA*(0.5+Math.random()*0.5);
        else na = a + (Math.random()>0.5?1:-1)*RA;
        na += (Math.random()-0.5)*0.07;

        let nx = x+Math.cos(na)*SS_AGENT, ny = y+Math.sin(na)*SS_AGENT;
        if (nx<1)      { nx=1;      na=Math.PI-na; }
        if (nx>W_T-2)  { nx=W_T-2;  na=Math.PI-na; }
        if (ny<1)      { ny=1;      na=-na; }
        if (ny>H_T-2)  { ny=H_T-2;  na=-na; }

        ax[wi]=nx; ay[wi]=ny; aa[wi]=na;
        const di = Math.round(ny)*W_T + Math.round(nx);
        if (di>=0&&di<N_T) trail[di]+=WT;
      }

      // 3×3 box diffusion (interior only)
      for (let j=1; j<H_T-1; j++) {
        for (let i=1; i<W_T-1; i++) {
          const idx=j*W_T+i;
          trail2[idx]=(
            trail[idx-W_T-1]+trail[idx-W_T]+trail[idx-W_T+1]+
            trail[idx-1   ]+trail[idx    ]+trail[idx+1    ]+
            trail[idx+W_T-1]+trail[idx+W_T]+trail[idx+W_T+1]
          )/9;
        }
      }
      for (let j=1; j<H_T-1; j++) {
        for (let i=1; i<W_T-1; i++) {
          const idx=j*W_T+i;
          trail[idx]=trail2[idx]*(1-decay);
        }
      }
      // Zero edges
      for (let i=0;i<W_T;i++) { trail[i]=0; trail[(H_T-1)*W_T+i]=0; }
      for (let j=0;j<H_T;j++) { trail[j*W_T]=0; trail[j*W_T+W_T-1]=0; }
    }

    const sketch = (p: p5Type) => {
      let W=0, H=0;
      let offscreen: HTMLCanvasElement;
      let offCtx: CanvasRenderingContext2D;
      let imgData: ImageData;

      p.setup = () => {
        W=el.offsetWidth; H=el.offsetHeight;
        const cnv = p.createCanvas(W,H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen=document.createElement("canvas");
        offscreen.width=W_T; offscreen.height=H_T;
        offCtx=offscreen.getContext("2d") as CanvasRenderingContext2D;
        imgData=offCtx.createImageData(W_T,H_T);
      };

      p.windowResized=()=>{ W=el.offsetWidth; H=el.offsetHeight; p.resizeCanvas(W,H); };

      p.draw=()=>{
        const sp=Math.max(0,Math.min(1, window.scrollY/Math.max(1,scrollEl.scrollHeight-window.innerHeight)));
        const chF=sp*4, chIdx=Math.min(3,Math.floor(chF)), chT=chF-chIdx;
        const next=Math.min(3,chIdx+1), blend=ss(0.75,1.0,chT);

        const pal0=PALETTES[chIdx], pal1=PALETTES[next];
        const bgR=Math.round(lerp(pal0[0],pal1[0],blend));
        const bgG=Math.round(lerp(pal0[1],pal1[1],blend));
        const bgB=Math.round(lerp(pal0[2],pal1[2],blend));
        const trR=Math.round(lerp(pal0[3],pal1[3],blend));
        const trG=Math.round(lerp(pal0[4],pal1[4],blend));
        const trB=Math.round(lerp(pal0[5],pal1[5],blend));

        const decay = lerp(0.025, 0.070, ss(0.60,0.92,sp));
        const steps = Math.round(lerp(3,6,sp));
        for (let s=0; s<steps; s++) stepSim(decay);

        // Render
        const d=imgData.data;
        for (let idx=0;idx<N_T;idx++) {
          const t=Math.min(1, Math.sqrt(trail[idx]/75));
          const t2=t*t;
          const pi=idx*4;
          d[pi  ]=Math.round(lerp(bgR,trR,t2));
          d[pi+1]=Math.round(lerp(bgG,trG,t2));
          d[pi+2]=Math.round(lerp(bgB,trB,t2));
          d[pi+3]=255;
        }
        offCtx.putImageData(imgData,0,0);
        const dc=p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled=true; dc.imageSmoothingQuality="high";
        dc.drawImage(offscreen,0,0,W,H);

        const hudA=ss(0.04,0.16,sp);
        if (hudA>0.01) {
          p.noStroke();
          p.fill(trR,trG,trB,Math.round(hudA*55));
          p.textSize(7);
          p.textAlign(p.LEFT,p.TOP);
          p.text(`AGENTS ${N_AGENTS}`,W*0.018,H*0.018);
          p.textAlign(p.RIGHT,p.TOP);
          p.text(`sp ${sp.toFixed(4)}`,W*0.982,H*0.018);
          p.textAlign(p.LEFT,p.BOTTOM);
          p.text(`CH${chIdx+1} · PHYSARUM`,W*0.018,H*0.982);
          p.textAlign(p.RIGHT,p.BOTTOM);
          p.text(`decay ${decay.toFixed(3)}`,W*0.982,H*0.982);
        }

        for (let i=0;i<12;i++) {
          const [,,i0,i1,o0,o1]=SECTIONS[i];
          const alpha=secAlpha(sp,i0,i1,o0,o1);
          const secEl=sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity=alpha.toFixed(3);
          secEl.style.pointerEvents=alpha>0.05?"auto":"none";
        }
      };
    };

    return new P5(sketch,el) as unknown as p5Type;
  });
}

export function SlimeLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement|null>>(Array(12).fill(null));

  useEffect(()=>{
    const container=containerRef.current, scroll=scrollRef.current;
    if (!container||!scroll) return;
    let inst: p5Type|null=null, alive=true;
    buildSketch(container,scroll,sectionEls.current).then(p5inst=>{
      if (!alive){ p5inst.remove(); return; }
      inst=p5inst;
    });
    return ()=>{ alive=false; inst?.remove(); };
  },[]);

  const positions: React.CSSProperties[] = [
    {top:"12%",   left: "6%"},
    {bottom:"14%",right:"7%",textAlign:"right"},
    {top:"50%",   left: "6%",transform:"translateY(-50%)"},
    {top:"12%",   right:"7%",textAlign:"right"},
    {bottom:"14%",left: "6%"},
    {top:"50%",   right:"7%",textAlign:"right",transform:"translateY(-50%)"},
    {top:"12%",   left: "6%"},
    {bottom:"14%",right:"7%",textAlign:"right"},
    {top:"50%",   left: "6%",transform:"translateY(-50%)"},
    {top:"12%",   right:"7%",textAlign:"right"},
    {bottom:"14%",left: "6%"},
    {top:"50%",   left:"50%",textAlign:"center",transform:"translate(-50%,-50%)"},
  ];

  const chips=["#4a7a5a","#8a6a38","#7a5878","#8a8880"];
  const texts=["#b9d7c8","#e1af78","#c8b9d7","#eee8de"];

  const base: React.CSSProperties={
    position:"fixed",opacity:0,pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10,maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh",background:"#08060a"}}>
      <div ref={containerRef} style={{position:"fixed",inset:0,zIndex:1}}/>
      {SECTIONS.map((sec,i)=>{
        const chIdx=(sec[0] as number)-1;
        const [headline,sub]=HEADINGS[i];
        return (
          <div key={i} ref={el=>{sectionEls.current[i]=el;}} style={{...base,...positions[i]}}>
            <span style={{
              display:"block",fontSize:"0.55rem",letterSpacing:"0.38em",
              color:chips[chIdx],textTransform:"uppercase",marginBottom:10,
            }}>{`CH${chIdx+1} · ${CH_NAMES[chIdx]}`}</span>
            <h2 style={{
              margin:0,fontSize:"clamp(1.7rem,3.8vw,3.2rem)",fontWeight:700,
              lineHeight:1.05,letterSpacing:"-0.01em",
              textTransform:"uppercase",color:texts[chIdx],
            }}>
              {headline}<br/>
              <span style={{
                fontWeight:300,fontSize:"clamp(1.0rem,2.3vw,1.9rem)",
                letterSpacing:"0.09em",color:chips[chIdx],textTransform:"lowercase",
              }}>{sub}</span>
            </h2>
          </div>
        );
      })}
    </div>
  );
}
