"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { P5Canvas, type P5Sketch } from "@/lib/p5-react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

interface Props {
  links: ContactLink[];
  className?: string;
}

export function ContactWaveform({ links, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    setEnabled(!reduced && !mobile);
  }, []);

  const progressRef = useScrollProgress(containerRef, {
    start: "top 80%",
    end: "top 40%",
  });

  const linksRef = useRef<ContactLink[]>(links);
  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  const sketch = useCallback<P5Sketch>(
    (p) => {
      let w = 0;
      let h = 0;
      let amp = 0;
      const hoverAmp: number[] = [];

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      const resize = () => {
        const host = (p as unknown as { _userNode?: HTMLElement })._userNode;
        const rect = host?.getBoundingClientRect();
        w = rect?.width ?? p.windowWidth;
        h = rect?.height ?? 200;
      };

      p.setup = () => {
        resize();
        const c = p.createCanvas(w, h);
        c.elt.style.display = "block";
        p.pixelDensity(1);
        p.textFont("ui-monospace, SFMono-Regular, Menlo, monospace");
        p.textSize(11);
      };

      p.windowResized = () => {
        resize();
        p.resizeCanvas(w, h);
      };

      const peakX = (i: number, count: number) => {
        const margin = w * 0.08;
        if (count <= 1) return w * 0.5;
        return margin + ((w - margin * 2) * i) / (count - 1);
      };

      const peakBump = (x: number, cx: number, width: number) => {
        const dx = (x - cx) / width;
        return Math.exp(-dx * dx * 4);
      };

      const isOverLink = (mx: number, my: number, idx: number, count: number) => {
        const cx = peakX(idx, count);
        const labelY = h * 0.78;
        const halfW = 80;
        const halfH = 22;
        return mx > cx - halfW && mx < cx + halfW && my > labelY - halfH && my < labelY + halfH;
      };

      p.draw = () => {
        p.clear();
        const list = linksRef.current;
        const count = list.length;
        if (count === 0) return;

        while (hoverAmp.length < count) hoverAmp.push(0);

        const targetAmp = p.constrain(progressRef.current, 0, 1);
        amp = lerp(amp, targetAmp, 0.08);

        const t = p.frameCount * 0.01;
        const midY = h * 0.5;
        const baseAmp = h * 0.04;
        const peakAmp = h * 0.3;
        const peakWidth = Math.max(40, w / (count * 2));

        let hoveredIdx = -1;
        const mx = p.mouseX;
        const my = p.mouseY;
        for (let i = 0; i < count; i++) {
          if (isOverLink(mx, my, i, count)) {
            hoveredIdx = i;
            break;
          }
        }

        for (let i = 0; i < count; i++) {
          const target = hoveredIdx === i ? 1 : 0;
          hoverAmp[i] = lerp(hoverAmp[i], target, 0.12);
        }

        const host = (p as unknown as { _userNode?: HTMLElement })._userNode;
        const canvasEl = host?.querySelector("canvas") as HTMLCanvasElement | null;
        if (canvasEl) {
          canvasEl.style.cursor = hoveredIdx >= 0 ? "pointer" : "default";
        }

        p.noFill();
        p.stroke(255, 102);
        p.strokeWeight(1);

        const step = 2;
        p.beginShape();
        for (let x = 0; x <= w; x += step) {
          const noiseY = (p.noise(x * 0.01, t) - 0.5) * baseAmp * 2;
          const sineY = Math.sin(x * 0.02 + t * 2) * baseAmp;

          let bumpY = 0;
          for (let i = 0; i < count; i++) {
            const cx = peakX(i, count);
            const bump = peakBump(x, cx, peakWidth);
            const amplify = 1 + hoverAmp[i] * 0.5;
            const phase = Math.sin(x * 0.08 - t * 3 + i) * 0.5 + 0.5;
            bumpY -= bump * peakAmp * amp * amplify * (0.6 + phase * 0.4);
          }

          const y = midY + (noiseY + sineY) * amp + bumpY;
          p.vertex(x, y);
        }
        p.endShape();

        p.noStroke();
        for (let i = 0; i < count; i++) {
          const cx = peakX(i, count);
          const link = list[i];
          const alpha = 178 + hoverAmp[i] * 77;

          p.fill(255, alpha);
          p.textAlign(p.CENTER, p.TOP);
          p.textStyle(p.BOLD);
          p.text(link.label, cx, h * 0.78 - 14);
          p.textStyle(p.NORMAL);
          p.fill(255, alpha * 0.8);
          p.text(link.value, cx, h * 0.78 + 2);

          if (hoverAmp[i] > 0.5) {
            p.stroke(255, 178 * hoverAmp[i]);
            p.strokeWeight(1);
            const tw = p.textWidth(link.label);
            p.line(cx - tw / 2, h * 0.78 - 1, cx + tw / 2, h * 0.78 - 1);
            p.noStroke();
          }
        }
      };

      p.mousePressed = () => {
        const list = linksRef.current;
        const count = list.length;
        for (let i = 0; i < count; i++) {
          if (isOverLink(p.mouseX, p.mouseY, i, count)) {
            window.open(list[i].href, "_blank", "noopener,noreferrer");
            return;
          }
        }
      };
    },
    [progressRef],
  );

  if (!mounted) {
    return <div ref={containerRef} className={className} />;
  }

  if (!enabled) {
    return (
      <div ref={containerRef} className={className}>
        <ul className="flex flex-col gap-3 font-mono text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <span className="font-bold">{link.label}</span>
                <span className="mx-2 opacity-40">/</span>
                <span>{link.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-48 md:h-56 ${className ?? ""}`}>
      <P5Canvas sketch={sketch} className="absolute inset-0" />
    </div>
  );
}
