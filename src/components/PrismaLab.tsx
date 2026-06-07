"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";
import { useLabLocale } from "@/hooks/useLabLocale";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

const W_SIM=240, H_SIM=160, N_SIM=W_SIM*H_SIM;
const PHI=1.6180339887;
const EPS=1.5;      // singularity softening
const BAND_SCALE=28;

// 6 sources: each orbits the centre at a golden-ratio-spaced angular frequency
// r: orbital radius in sim pixels, omega: angular speed per frame, phase: initial angle
type Source={r:number;omega:number;phase:number;strength:number};
const SOURCES: Source[]=[
  {r:20, omega:0.0024,         phase:0,              strength:1.2},
  {r:30, omega:0.0024/PHI,     phase:Math.PI,        strength:1.0},
  {r:42, omega:0.0024/PHI**2,  phase:Math.PI/3,      strength:0.9},
  {r:25, omega:0.0024*PHI,     phase:2*Math.PI/3,    strength:1.1},
  {r:36, omega:0.0024*PHI**2,  phase:Math.PI*4/3,    strength:0.85},
  {r:18, omega:0.0024/PHI**3,  phase:Math.PI/2,      strength:1.0},
];

const SECTIONS=[
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

const CH_NAMES=["LANDSCAPE","DESCENT","DECISION","INEVITABILITY"];
const CH_NAMES_PT=["PAISAGEM","DESCIDA","DECISÃO","INEVITABILIDADE"];

const HEADINGS:[string,string][]=[
  ["POTENTIAL",  "everywhere before anything moves"],
  ["GRADIENT",   "the slope that decides the motion"],
  ["BASIN",      "where everything eventually falls"],
  ["ISOBAR",     "the line of equal height — the line of indifference"],
  ["RIDGE",      "the line that separates fates"],
  ["DESCENT",    "the particle moves without choosing"],
  ["TOPOLOGY",   "what cannot be deformed away"],
  ["ATTRACTOR",  "the geometry around the minimum"],
  ["CONTOUR",    "the signature of height without height"],
  ["SADDLE",     "the boundary between two inevitable fates"],
  ["THE MAP",    "and the territory are the same"],
  ["FIELD",      "geometry as destiny"],
];

const HEADINGS_PT:[string,string][]=[
  ["POTENCIAL",       "em todo lugar antes de qualquer movimento"],
  ["GRADIENTE",       "a inclinação que decide o movimento"],
  ["BACIA",           "onde tudo eventualmente cai"],
  ["ISOBARA",         "a linha de igual altura — a linha da indiferença"],
  ["CRISTA",          "a linha que separa destinos"],
  ["DESCIDA",         "a partícula se move sem escolher"],
  ["TOPOLOGIA",       "o que não pode ser deformado"],
  ["ATRATOR",         "a geometria ao redor do mínimo"],
  ["CONTORNO",        "a assinatura da altura sem altura"],
  ["SELA",            "a fronteira entre dois destinos inevitáveis"],
  ["O MAPA",          "e o território são o mesmo"],
  ["CAMPO",           "geometria como destino"],
];

// [bg_r,bg_g,bg_b, accent_r,accent_g,accent_b]
const PALETTES:[number,number,number,number,number,number][]=[
  [ 6,  5, 14,  88,188,245],   // deep indigo   → electric blue
  [ 5, 12, 10, 238,175, 80],   // dark teal     → warm amber
  [12,  5, 10, 225,120,162],   // deep red-black→ rose
  [ 5,  5,  8, 242,238,230],   // pure black    → cold white
];

function buildSketch(
  el:HTMLElement,
  scrollEl:HTMLElement,
  sectionEls:Array<HTMLDivElement|null>,
):Promise<p5Type> {
  return import("p5").then(({default:P5})=>{
    let frames=0;

    const sketch=(p:p5Type)=>{
      let W=0,H=0;
      let offscreen: HTMLCanvasElement;
      let offCtx: CanvasRenderingContext2D;
      let imgData: ImageData;

      p.setup=()=>{
        W=el.offsetWidth; H=el.offsetHeight;
        const cnv=p.createCanvas(W,H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        offscreen=document.createElement("canvas");
        offscreen.width=W_SIM; offscreen.height=H_SIM;
        offCtx=offscreen.getContext("2d") as CanvasRenderingContext2D;
        imgData=offCtx.createImageData(W_SIM,H_SIM);
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
        const acR=Math.round(lerp(pal0[3],pal1[3],blend));
        const acG=Math.round(lerp(pal0[4],pal1[4],blend));
        const acB=Math.round(lerp(pal0[5],pal1[5],blend));

        // Strength and eccentricity grow with scroll
        const strScale  = lerp(0.65, 2.1, sp);
        const ecc       = ss(0.45, 0.88, sp) * 0.55;

        const cx=W_SIM*0.5, cy=H_SIM*0.5;
        const asp=H_SIM/W_SIM;

        // Precompute source positions for this frame
        const sx=new Float32Array(6), sy=new Float32Array(6), ss2=new Float32Array(6);
        for (let k=0;k<6;k++) {
          const src=SOURCES[k];
          const theta=frames*src.omega+src.phase;
          const wobble=1+ecc*Math.cos(theta*(1+k*0.14));
          sx[k]=cx+src.r*Math.cos(theta)*wobble;
          sy[k]=cy+src.r*Math.sin(theta)*asp*wobble;
          ss2[k]=src.strength*strScale;
        }

        // Render potential field
        const d=imgData.data;
        for (let j=0;j<H_SIM;j++) {
          for (let i=0;i<W_SIM;i++) {
            // Compute potential field
            let f=0;
            for (let k=0;k<6;k++) {
              const dx=i-sx[k], dy=j-sy[k];
              f+=ss2[k]/(dx*dx+dy*dy+EPS);
            }

            // Banding
            const b=f*BAND_SCALE;
            const frac=b-Math.floor(b);
            const minDist=Math.min(frac,1-frac);

            // Thin gaussian spike at band boundary (contour line)
            const spike=Math.exp(-minDist*minDist*900);

            // Subtle fill gradient within band
            const fill=frac*0.10;

            const combined=Math.min(1, spike*0.95 + fill);

            const pi=(j*W_SIM+i)*4;
            d[pi  ]=Math.round(lerp(bgR,acR,combined));
            d[pi+1]=Math.round(lerp(bgG,acG,combined));
            d[pi+2]=Math.round(lerp(bgB,acB,combined));
            d[pi+3]=255;
          }
        }

        offCtx.putImageData(imgData,0,0);
        const dc=p.drawingContext as CanvasRenderingContext2D;
        dc.imageSmoothingEnabled=true; dc.imageSmoothingQuality="high";
        dc.drawImage(offscreen,0,0,W,H);

        // Source position dots (very faint)
        const srcA=ss(0.04,0.16,sp)*(1-ss(0.80,0.92,sp));
        if (srcA>0.01) {
          const scaleX=W/W_SIM, scaleY=H/H_SIM;
          p.noStroke();
          p.fill(acR,acG,acB,Math.round(srcA*45));
          for (let k=0;k<6;k++) {
            p.ellipse(sx[k]*scaleX, sy[k]*scaleY, 3, 3);
          }
        }

        // HUD
        const hudA=ss(0.04,0.16,sp);
        if (hudA>0.01) {
          p.noStroke();
          p.fill(acR,acG,acB,Math.round(hudA*52));
          p.textSize(7);
          p.textAlign(p.LEFT,p.TOP);
          p.text(`SOURCES 6 · BANDS ${BAND_SCALE}`,W*0.018,H*0.018);
          p.textAlign(p.RIGHT,p.TOP);
          p.text(`sp ${sp.toFixed(4)}`,W*0.982,H*0.018);
          p.textAlign(p.LEFT,p.BOTTOM);
          p.text(`CH${chIdx+1} · POTENTIAL FIELD`,W*0.018,H*0.982);
          p.textAlign(p.RIGHT,p.BOTTOM);
          p.text(`str ${strScale.toFixed(2)}`,W*0.982,H*0.982);
        }

        for (let i=0;i<12;i++) {
          const [,,i0,i1,o0,o1]=SECTIONS[i];
          const alpha=secAlpha(sp,i0,i1,o0,o1);
          const secEl=sectionEls[i];
          if (!secEl) continue;
          secEl.style.opacity=alpha.toFixed(3);
          secEl.style.pointerEvents=alpha>0.05?"auto":"none";
        }

        frames++;
      };
    };

    return new P5(sketch,el) as unknown as p5Type;
  });
}

export function PrismaLab() {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionEls   = useRef<Array<HTMLDivElement|null>>(Array(12).fill(null));
  const [locale] = useLabLocale();

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

  const positions: React.CSSProperties[]=[
    {top:"12%",   left:"6%"},
    {bottom:"14%",right:"7%",textAlign:"right"},
    {top:"50%",   left:"6%",transform:"translateY(-50%)"},
    {top:"12%",   right:"7%",textAlign:"right"},
    {bottom:"14%",left:"6%"},
    {top:"50%",   right:"7%",textAlign:"right",transform:"translateY(-50%)"},
    {top:"12%",   left:"6%"},
    {bottom:"14%",right:"7%",textAlign:"right"},
    {top:"50%",   left:"6%",transform:"translateY(-50%)"},
    {top:"12%",   right:"7%",textAlign:"right"},
    {bottom:"14%",left:"6%"},
    {top:"50%",   left:"50%",textAlign:"center",transform:"translate(-50%,-50%)"},
  ];

  const chips=["#284878","#586020","#782048","#585855"];
  const texts=["#58bcf5","#eEaf50","#e17898","#f2eee6"];

  const base: React.CSSProperties={
    position:"fixed",opacity:0,pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10,maxWidth:"28rem",
  };

  const activeChNames = locale === "pt" ? CH_NAMES_PT : CH_NAMES;
  const activeHeadings = locale === "pt" ? HEADINGS_PT : HEADINGS;

  return (
    <div ref={scrollRef} style={{height:"1200vh",background:"#06050e"}}>
      <div ref={containerRef} style={{position:"fixed",inset:0,zIndex:1}}/>
      {SECTIONS.map((sec,i)=>{
        const chIdx=(sec[0] as number)-1;
        const [headline,sub]=activeHeadings[i];
        return (
          <div key={i} ref={el=>{sectionEls.current[i]=el;}} style={{...base,...positions[i]}}>
            <span style={{
              display:"block",fontSize:"0.55rem",letterSpacing:"0.38em",
              color:chips[chIdx],textTransform:"uppercase",marginBottom:10,
            }}>{`CH${chIdx+1} · ${activeChNames[chIdx]}`}</span>
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
