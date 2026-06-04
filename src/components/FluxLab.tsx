"use client";
import { useEffect, useRef } from "react";
import type p5Type from "p5";
import type React from "react";

const ss   = (a: number, b: number, t: number) => { const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;
const secAlpha = (sp: number, i0: number, i1: number, o0: number, o1: number) =>
  ss(i0,i1,sp)*(1-ss(o0,o1,sp));

// ── Field grid (normalized working space) ────────────────────────────────────
const W_FL = 300, H_FL = 200;

// 6 dipoles always; unused ones have s=0
// Each dipole: {x, y, mx, my, s} in W_FL×H_FL grid coords
type Dipole = {x:number;y:number;mx:number;my:number;s:number};

// 4 chapter configurations (always 6 dipoles)
const CONFIGS: Dipole[][] = [
  // ch1: single vertical dipole at centre
  [
    {x:150,y:100,mx:0,my:1,s:1},{x:150,y:100,mx:0,my:1,s:0},
    {x:150,y:100,mx:0,my:1,s:0},{x:150,y:100,mx:0,my:1,s:0},
    {x:150,y:100,mx:0,my:1,s:0},{x:150,y:100,mx:0,my:1,s:0},
  ],
  // ch2: opposing horizontal pair
  [
    {x: 90,y:100,mx: 1,my:0,s:1},{x:210,y:100,mx:-1,my:0,s:1},
    {x:150,y:100,mx:0,my:1,s:0},{x:150,y:100,mx:0,my:1,s:0},
    {x:150,y:100,mx:0,my:1,s:0},{x:150,y:100,mx:0,my:1,s:0},
  ],
  // ch3: quadrupole
  [
    {x:100,y: 72,mx:0,my: 1,s:1},{x:200,y: 72,mx:0,my:-1,s:1},
    {x:100,y:128,mx:0,my:-1,s:1},{x:200,y:128,mx:0,my: 1,s:1},
    {x:150,y:100,mx:0,my: 1,s:0},{x:150,y:100,mx:0,my: 1,s:0},
  ],
  // ch4: 6-dipole irregular arrangement
  [
    {x: 85,y: 68,mx: 0.707,my: 0.707,s:1},
    {x:215,y: 68,mx:-0.707,my: 0.707,s:1},
    {x:150,y: 58,mx: 0,    my:-1,    s:1},
    {x: 80,y:132,mx: 0.707,my:-0.707,s:1},
    {x:220,y:132,mx:-0.707,my:-0.707,s:1},
    {x:150,y:146,mx: 0,    my: 1,    s:1},
  ],
];

const N_SEEDS_X=10, N_SEEDS_Y=8;
const N_SEEDS=N_SEEDS_X*N_SEEDS_Y;
const MAX_HALF=55;
const STEP_SIZE=3.0;
const EPS=6;

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

const CH_NAMES=["MONOPOLE","DIPOLE","QUADRUPOLE","COMPLEX"];

const HEADINGS: [string,string][] = [
  ["THE FORCE",    "was never touching anything"],
  ["READING",       "the shape tells you everything about the source"],
  ["STRUCTURE",     "invisible before it is crossed"],
  ["SADDLE POINT", "where two fields agree to disagree"],
  ["NO CROSSING",   "field lines of the same type never intersect"],
  ["FLUX",         "the total quantity crossing any surface"],
  ["RECONNECTION", "when field lines break and join elsewhere"],
  ["LEGIBLE",       "the unseen, read from what it does"],
  ["PORTRAIT",      "every field line is a question about the source"],
  ["CURRENT",      "the lines were here before anything moved"],
  ["INFINITY",     "at every source, the field shouts"],
  ["SILENCE",      "at the boundaries, it whispers"],
];

// line accent colors per chapter [r,g,b,a]
const LINE_COLORS:[number,number,number,number][]=[
  [ 82,188,245,0.42],   // electric blue
  [240,175, 80,0.38],   // amber gold
  [188,120,215,0.36],   // violet
  [232,230,222,0.34],   // cold white
];

function fieldAt(px:number,py:number,dipoles:Dipole[]):[number,number] {
  let bx=0,by=0;
  for (let d=0;d<dipoles.length;d++) {
    const di=dipoles[d];
    if (di.s<0.005) continue;
    const rx=px-di.x, ry=py-di.y;
    const r2=rx*rx+ry*ry+EPS;
    const r=Math.sqrt(r2), r3=r2*r;
    const mDotR=(di.mx*rx+di.my*ry)/r;
    bx+=di.s*(3*mDotR*rx/r-di.mx)/r3;
    by+=di.s*(3*mDotR*ry/r-di.my)/r3;
  }
  return [bx,by];
}

function traceLine(
  x0:number,y0:number,
  dipoles:Dipole[],
  dir:1|-1,
  pts:Float32Array,
  offset:number,
):number {
  let x=x0,y=y0,count=0;
  pts[offset+count*2]=x; pts[offset+count*2+1]=y; count++;
  for (let n=0;n<MAX_HALF;n++) {
    const [bx,by]=fieldAt(x,y,dipoles);
    const mag=Math.sqrt(bx*bx+by*by);
    if (mag<1e-7) break;
    x+=dir*STEP_SIZE*bx/mag;
    y+=dir*STEP_SIZE*by/mag;
    if (x<0||x>W_FL||y<0||y>H_FL) break;
    pts[offset+count*2]=x; pts[offset+count*2+1]=y; count++;
  }
  return count;
}

// pts layout: [fwd_pts | bwd_pts] per seed
// Each seed: (MAX_HALF+1)*2 floats fwd + (MAX_HALF+1)*2 floats bwd
const FLOATS_PER_HALF=(MAX_HALF+1)*2;
const FLOATS_PER_SEED=FLOATS_PER_HALF*2;

function buildSketch(
  el:HTMLElement,
  scrollEl:HTMLElement,
  sectionEls:Array<HTMLDivElement|null>,
):Promise<p5Type> {
  return import("p5").then(({default:P5})=>{
    const ptsF=new Float32Array(N_SEEDS*FLOATS_PER_SEED);
    const lenF=new Int32Array(N_SEEDS);
    const lenB=new Int32Array(N_SEEDS);

    function computeLines(dipoles:Dipole[]) {
      for (let si=0;si<N_SEEDS;si++) {
        const gx=(si%N_SEEDS_X+0.5)/N_SEEDS_X*W_FL;
        const gy=(Math.floor(si/N_SEEDS_X)+0.5)/N_SEEDS_Y*H_FL;
        const fwdOff=si*FLOATS_PER_SEED;
        const bwdOff=fwdOff+FLOATS_PER_HALF;
        lenF[si]=traceLine(gx,gy,dipoles, 1,ptsF,fwdOff);
        lenB[si]=traceLine(gx,gy,dipoles,-1,ptsF,bwdOff);
      }
    }

    let cachedDipoles: Dipole[]=[...CONFIGS[0]];
    let computeFrame=0;

    const sketch=(p:p5Type)=>{
      let W=0,H=0;

      p.setup=()=>{
        W=el.offsetWidth; H=el.offsetHeight;
        const cnv=p.createCanvas(W,H);
        (cnv as unknown as {style:(k:string,v:string)=>void}).style("display","block");
        p.pixelDensity(1);
        computeLines(cachedDipoles);
      };

      p.windowResized=()=>{ W=el.offsetWidth; H=el.offsetHeight; p.resizeCanvas(W,H); };

      p.draw=()=>{
        const sp=Math.max(0,Math.min(1, window.scrollY/Math.max(1,scrollEl.scrollHeight-window.innerHeight)));
        const chF=sp*4, chIdx=Math.min(3,Math.floor(chF)), chT=chF-chIdx;
        const next=Math.min(3,chIdx+1), bt=ss(0.65,0.95,chT);

        // Interpolate dipole config
        const activeDipoles:Dipole[]=[];
        for (let d=0;d<6;d++) {
          const a=CONFIGS[chIdx][d], b=CONFIGS[next][d];
          activeDipoles.push({
            x:lerp(a.x,b.x,bt), y:lerp(a.y,b.y,bt),
            mx:lerp(a.mx,b.mx,bt), my:lerp(a.my,b.my,bt),
            s:lerp(a.s,b.s,bt),
          });
        }

        // Recompute field lines every 4 frames
        if (computeFrame%4===0) computeLines(activeDipoles);
        computeFrame++;

        // Background
        const bgDark=chIdx<2?`rgb(6,5,12)`:`rgb(5,5,7)`;
        const dc=p.drawingContext as CanvasRenderingContext2D;
        dc.fillStyle=bgDark;
        dc.fillRect(0,0,W,H);

        // Draw all field lines
        const lc=LINE_COLORS[chIdx];
        const la=lerp(lc[3], LINE_COLORS[next][3], bt);
        const lr=Math.round(lerp(lc[0], LINE_COLORS[next][0], bt));
        const lg=Math.round(lerp(lc[1], LINE_COLORS[next][1], bt));
        const lb=Math.round(lerp(lc[2], LINE_COLORS[next][2], bt));

        dc.strokeStyle=`rgba(${lr},${lg},${lb},${la.toFixed(3)})`;
        dc.lineWidth=0.7;
        dc.lineCap="round";
        dc.lineJoin="round";

        const scaleX=W/W_FL, scaleY=H/H_FL;

        dc.beginPath();
        for (let si=0;si<N_SEEDS;si++) {
          const fwdOff=si*FLOATS_PER_SEED;
          const bwdOff=fwdOff+FLOATS_PER_HALF;
          const nf=lenF[si], nb=lenB[si];
          if (nf+nb<2) continue;

          // Draw backward segment reversed then forward
          if (nb>0) {
            dc.moveTo(ptsF[bwdOff+(nb-1)*2]*scaleX, ptsF[bwdOff+(nb-1)*2+1]*scaleY);
            for (let k=nb-2;k>=0;k--) {
              dc.lineTo(ptsF[bwdOff+k*2]*scaleX, ptsF[bwdOff+k*2+1]*scaleY);
            }
            for (let k=1;k<nf;k++) {
              dc.lineTo(ptsF[fwdOff+k*2]*scaleX, ptsF[fwdOff+k*2+1]*scaleY);
            }
          } else if (nf>1) {
            dc.moveTo(ptsF[fwdOff]*scaleX, ptsF[fwdOff+1]*scaleY);
            for (let k=1;k<nf;k++) {
              dc.lineTo(ptsF[fwdOff+k*2]*scaleX, ptsF[fwdOff+k*2+1]*scaleY);
            }
          }
        }
        dc.stroke();

        // Mark dipole positions
        const dipA=ss(0.04,0.18,sp);
        if (dipA>0.01) {
          p.noStroke();
          for (const d of activeDipoles) {
            if (d.s<0.05) continue;
            p.fill(lr,lg,lb,Math.round(dipA*100));
            p.ellipse(d.x*scaleX, d.y*scaleY, 5, 5);
            // moment arrow
            const dc2=p.drawingContext as CanvasRenderingContext2D;
            dc2.strokeStyle=`rgba(${lr},${lg},${lb},${(dipA*0.8).toFixed(2)})`;
            dc2.lineWidth=0.9;
            dc2.beginPath();
            dc2.moveTo(d.x*scaleX, d.y*scaleY);
            dc2.lineTo((d.x+d.mx*12)*scaleX, (d.y+d.my*12)*scaleY);
            dc2.stroke();
          }
        }

        // HUD
        const hudA=ss(0.04,0.16,sp);
        if (hudA>0.01) {
          p.noStroke();
          p.fill(lr,lg,lb,Math.round(hudA*55));
          p.textSize(7);
          p.textAlign(p.LEFT,p.TOP);
          p.text(`FIELD LINES ${N_SEEDS}`,W*0.018,H*0.018);
          p.textAlign(p.RIGHT,p.TOP);
          p.text(`sp ${sp.toFixed(4)}`,W*0.982,H*0.018);
          p.textAlign(p.LEFT,p.BOTTOM);
          p.text(`CH${chIdx+1} · ${CH_NAMES[chIdx]}`,W*0.018,H*0.982);
          const activeN=activeDipoles.filter(d=>d.s>0.1).length;
          p.textAlign(p.RIGHT,p.BOTTOM);
          p.text(`${activeN} DIPOLES`,W*0.982,H*0.982);
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

export function FluxLab() {
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

  const positions: React.CSSProperties[]=[
    {top:"12%",   right:"7%",textAlign:"right"},
    {bottom:"14%",left:"6%"},
    {top:"50%",   right:"7%",textAlign:"right",transform:"translateY(-50%)"},
    {bottom:"14%",right:"7%",textAlign:"right"},
    {top:"12%",   left:"6%"},
    {top:"50%",   left:"6%",transform:"translateY(-50%)"},
    {top:"12%",   right:"7%",textAlign:"right"},
    {bottom:"14%",left:"6%"},
    {top:"50%",   right:"7%",textAlign:"right",transform:"translateY(-50%)"},
    {top:"12%",   left:"6%"},
    {bottom:"14%",right:"7%",textAlign:"right"},
    {top:"50%",   left:"50%",textAlign:"center",transform:"translate(-50%,-50%)"},
  ];

  const chips=["#3a78a8","#9a7030","#7848a0","#888880"];
  const texts=["#52bcf5","#f0af50","#bc78d7","#e8e6de"];

  const base: React.CSSProperties={
    position:"fixed",opacity:0,pointerEvents:"none",
    fontFamily:"'Arial','Helvetica Neue',sans-serif",
    zIndex:10,maxWidth:"28rem",
  };

  return (
    <div ref={scrollRef} style={{height:"1200vh",background:"#06050c"}}>
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
