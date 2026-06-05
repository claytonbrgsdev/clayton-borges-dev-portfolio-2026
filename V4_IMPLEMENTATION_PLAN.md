# Design System V4 — Plano de Implementação

> **Handoff para o próximo agente.**
> Este arquivo contém todo o contexto necessário para implementar o design system V4
> no portfólio Next.js existente, sem precisar de nenhuma sessão anterior.
>
> **Regra absoluta:** conteúdo não muda. Projetos, copy, bio, i18n PT/EN, Lab — intocáveis.
> Apenas a camada visual é atualizada.

---

## Contexto do Projeto

- **Path:** `/Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final`
- **Stack:** Next.js 16.2.1, App Router, Tailwind v4, GSAP 3.14.2 (ScrollTrigger + SplitText registrados), Lenis 1.3.21
- **Rota principal:** `src/app/[locale]/page.tsx` → renderiza `src/components/PortfolioExperience.tsx`
- **Design tokens:** já implementados em `src/app/globals.css` (paleta preto+laranja+azul)
- **Fontes:** já implementadas em `src/app/layout.tsx` (Syne + IBM Plex Mono via `--font-geist-sans` / `--font-geist-mono`)
- **Referência visual:** `prototype-redesign-v4.html` na raiz do projeto — abrir em `http://localhost:8080/prototype-redesign-v4.html` com `npx serve -l 8080 .`
- **Lenis config:** `src/components/providers/LenisProvider.tsx` — usa GSAP ticker + ScrollTrigger.update

## Tokens de Cor (já em globals.css)

```css
--bg:            #0A0909;
--bg-elevated:   #111010;
--text:          #EDEBE6;
--text-muted:    #524E4A;
--rule:          #1C1A18;
--accent-orange: #D86020;
--accent-blue:   #1E44F0;
--accent-light:  #F2F0EC;
```

## O que já foi implementado (NÃO refazer)

- Design tokens + tipografia em `globals.css` e `layout.tsx`
- SplitText registrado em `src/lib/gsap.ts`
- `CursorCanvas.tsx` existe (canvas trail — será substituído na Fase 1)
- `FeaturedProjectCard.tsx` tem clip-path reveal + perspective tilt
- `PortfolioExperience.tsx` tem SplitText nos h2s, hero dramático, tilt nos grid cards
- `HeroConstellation.tsx` tem `velocityRef` com scroll velocity tracking

---

## O que o V4 introduz como design system

| Padrão | V4 | Status |
|--------|-----|--------|
| **Cursor** | Quadrado 7×7px laranja, ring no hover, azul quando velocidade > 15 | Substituir CursorCanvas |
| **Clip-path name reveal** | `inset(0 100% 0 0)` → `inset(0 0%)` 1.1s cubic-bezier | Substituir ScrambleText |
| **Scroll velocity → cor** | Orange → Blue em cursor + scroll bar | Só no sketch atualmente |
| **Scroll progress bar** | 1px topo, laranja → azul por velocidade | Branca atualmente |
| **Section labels** | `NN — LABEL` + linha `::after` em `--rule` | Variados |
| **Work horizontal scroll** | `position:sticky` + `translateX`, progress counter | Grid vertical atual |
| **Stats strip** | 3 contadores animados (entram via IntersectionObserver) | Não existe |
| **About: line-by-line reveal** | `translateY(110%) → 0` linha a linha | Slide lateral |
| **Contact: word-split reveal** | Cada palavra em `w-wrap > w-inner`, stagger 90ms | Fade simples |

---

## Fases de Implementação

### FASE 1 — Cursor quadrado (substitui CursorCanvas.tsx)
**Arquivo:** `src/components/CursorCanvas.tsx` (reescrever)

Substituir o canvas trail atual pelo cursor quadrado do V4:

```tsx
"use client";
import { useEffect, useRef } from "react";

export function CursorCanvas() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = cursorRef.current;
    if (!el) return;

    document.body.style.cursor = "none";

    let cx = -100, cy = -100, tx = -100, ty = -100;
    let rafId: number;

    // Scroll velocity (shared with scroll bar)
    let scrollVel = 0;
    let rawVel = 0;
    let prevScrollY = window.scrollY;

    const onScroll = () => {
      rawVel = Math.abs(window.scrollY - prevScrollY);
      scrollVel = rawVel;
      prevScrollY = window.scrollY;
      (window as any).__scrollVel = scrollVel;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Velocity decay loop
    const decayVel = () => {
      scrollVel = scrollVel * 0.88 + rawVel * 0.12;
      rawVel *= 0.82;
      (window as any).__scrollVel = scrollVel;
      rafId = requestAnimationFrame(decayVel);
    };
    decayVel();

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    document.addEventListener("mousemove", onMove);

    const animCursor = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.left = cx + "px";
      el.style.top  = cy + "px";
      const isBlue = scrollVel > 15;
      el.dataset.blue  = isBlue ? "true" : "false";
      rafId = requestAnimationFrame(animCursor);
    };
    rafId = requestAnimationFrame(animCursor);

    // Ring on interactive elements
    const addRing = () => el.dataset.ring = "true";
    const rmRing  = () => el.dataset.ring = "false";
    document.querySelectorAll("a, button, [role='button']").forEach(i => {
      i.addEventListener("mouseenter", addRing);
      i.addEventListener("mouseleave", rmRing);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        width: 7, height: 7,
        background: "var(--accent-orange)",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        transition: "width 200ms, height 200ms, background 300ms, border 200ms",
      }}
      // CSS data-attr driven styles handled via globals.css or inline
    />
  );
}
```

**Adicionar em `globals.css`:**
```css
/* Cursor states driven by data attributes */
[data-ring="true"] {
  width: 22px !important;
  height: 22px !important;
  background: transparent !important;
  border: 1px solid var(--accent-orange);
}
[data-blue="true"] {
  background: var(--accent-blue) !important;
}
[data-ring="true"][data-blue="true"] {
  background: transparent !important;
  border-color: var(--accent-blue) !important;
}
```

---

### FASE 2 — Hero: clip-path name reveal
**Arquivo:** `src/components/PortfolioExperience.tsx`

Substituir a animação atual do hero (ScrambleText + fade) pelo padrão V4.

**Localizar no JSX (seção `SECTION 0 — Hero`):**

```tsx
// REMOVER:
import { ScrambleText } from "@/components/sketches/ScrambleText";

// No h1, SUBSTITUIR os ScrambleText por:
<h1
  className="font-bold leading-[0.9] tracking-tight mb-6"
  style={{ textShadow: "0 2px 60px rgba(0,0,0,0.6)" }}
>
  <span
    className="block hero-name-line"
    style={{
      fontSize: "clamp(4.2rem,11vw,9rem)",
      letterSpacing: "-0.03em",
      clipPath: "inset(0 100% 0 0)",
      animation: "revealName 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s forwards",
    }}
  >
    {home.hero.name.split(" ")[0]}
  </span>
  <span
    className="block hero-name-line"
    style={{
      fontSize: "clamp(2.8rem,7.5vw,6rem)",
      letterSpacing: "-0.02em",
      opacity: 0.35,
      clipPath: "inset(0 100% 0 0)",
      animation: "revealName 1.1s cubic-bezier(0.16,1,0.3,1) 0.22s forwards",
    }}
  >
    {home.hero.name.split(" ").slice(1).join(" ")}
  </span>
</h1>
```

**Adicionar em `globals.css`:**
```css
@keyframes revealName {
  to { clip-path: inset(0 0% 0 0); }
}
```

**Tagline** (o `<span>` de greeting e os parágrafos) → adicionar `opacity:0` + `animation: fadeIn 0.6s ease-out 0.9s forwards`:
```css
@keyframes fadeIn { to { opacity: 1; } }
```

**Manter:** `HeroConstellation` como fundo (Lorenz — mais rico que orbital).
**Remover:** o useEffect de entrada do `heroContentRef` (substituído pela animação CSS).

---

### FASE 3 — Stats strip
**Arquivo novo:** `src/components/StatsStrip.tsx`

```tsx
"use client";
import { useEffect, useRef } from "react";

const STATS = [
  { target: 6,  label: "Projects shipped" },
  { target: 27, label: "Lab experiments"  },
  { target: 3,  label: "Years in production" },
];

function animCounter(el: HTMLElement, target: number, duration: number) {
  const start = performance.now();
  const pad   = String(target).length;
  const step  = (now: number) => {
    const prog  = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.floor(eased * target).toString().padStart(pad, "0");
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = String(target).padStart(pad, "0");
  };
  requestAnimationFrame(step);
}

export function StatsStrip() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.querySelectorAll<HTMLElement>("[data-target]").forEach((counter, i) => {
        setTimeout(() => {
          animCounter(counter, parseInt(counter.dataset.target!), 1200);
        }, i * 180);
      });
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={stripRef}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "var(--rule)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {STATS.map(({ target, label }) => (
        <div key={label} style={{ background: "var(--bg)", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(40px,6vw,80px)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            <span data-target={target}>{String(target).padStart(String(target).length, "0")}</span>
          </div>
          <div style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 9, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--text-muted)"
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Montar em `PortfolioExperience.tsx`** logo após o `</section>` do hero (antes da seção de projects).

---

### FASE 4 — Work section: horizontal scroll
**Arquivo novo:** `src/components/sections/home/WorkHorizontal.tsx`

Substituir o layout vertical atual (FeaturedProjectCard + grid) pelo scroll horizontal do V4.
**Mesmo conteúdo:** usa `featuredProjects` de `src/lib/data/projects.ts`.

**Estrutura:**
```tsx
"use client";
import { useEffect, useRef } from "react";
import { featuredProjects } from "@/lib/data/projects";
import Link from "next/link";

export function WorkHorizontal({ locale }: { locale: string }) {
  const outerRef  = useRef<HTMLDivElement>(null);
  const trackRef  = useRef<HTMLDivElement>(null);
  const fillRef   = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;

    // Set outer height to provide scroll distance
    const setHeight = () => {
      const range = track.scrollWidth - window.innerWidth + 80;
      outer.style.height = `calc(100vh + ${range}px)`;
    };
    setHeight();
    window.addEventListener("resize", setHeight);

    // Update on scroll
    const onScroll = () => {
      const outerTop   = outer.offsetTop;
      const scrollIn   = window.scrollY - outerTop;
      const scrollRange = outer.offsetHeight - window.innerHeight;
      let progress = 0;
      if (scrollIn > 0 && scrollIn < scrollRange) {
        progress = scrollIn / scrollRange;
      } else if (scrollIn >= scrollRange) {
        progress = 1;
      }
      const trackRange = track.scrollWidth - window.innerWidth;
      track.style.transform = `translateX(${-trackRange * progress}px)`;
      if (fillRef.current)   fillRef.current.style.width = (progress * 100) + "%";
      if (counterRef.current) {
        const idx = Math.round(progress * (featuredProjects.length - 1)) + 1;
        counterRef.current.textContent =
          String(idx).padStart(2, "0") + " / " + String(featuredProjects.length).padStart(2, "0");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={outerRef} style={{ position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          position: "absolute", top: 32, left: 32, right: 32, zIndex: 10,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-geist-mono)", fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: 16,
              marginBottom: 12,
            }}>
              02 — Work
              <span style={{ flex: 1, height: 1, background: "var(--rule)", display: "block", minWidth: 60 }} />
            </div>
            <h2 style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "clamp(28px,4vw,54px)", fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 0.95,
            }}>
              Selected<br />Projects
            </h2>
          </div>

          {/* Progress */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Progress
            </div>
            <div style={{ width: 120, height: 1, background: "var(--rule)", position: "relative", marginLeft: "auto" }}>
              <div ref={fillRef} style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "0%", background: "var(--accent-orange)", transition: "width 80ms linear" }} />
            </div>
            <div ref={counterRef} style={{ fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--accent-orange)", letterSpacing: "0.08em", marginTop: 8 }}>
              01 / {String(featuredProjects.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 40,
            padding: "0 32px",
            paddingTop: "calc(48px + 32px + 54px * 1.2 + 60px)",
            paddingBottom: 32,
            height: "100%",
            willChange: "transform",
          }}
        >
          {featuredProjects.map((project, i) => {
            const name = locale === "pt" ? project.namePt : project.nameEn;
            const desc = locale === "pt" ? project.descriptionPt : project.descriptionEn;
            const CardWrap = project.liveUrl ? "a" : "div";
            return (
              <CardWrap
                key={project.id}
                {...(project.liveUrl ? { href: project.liveUrl, target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{
                  flexShrink: 0,
                  width: "clamp(440px,68vw,860px)",
                  height: "100%",
                  display: "grid",
                  gridTemplateColumns: "45% 55%",
                  border: "1px solid var(--rule)",
                  textDecoration: "none",
                  color: "inherit",
                  overflow: "hidden",
                  transition: "border-color 300ms",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-orange)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--rule)"}
              >
                {/* Left */}
                <div style={{
                  padding: 32, display: "flex", flexDirection: "column",
                  justifyContent: "space-between",
                  borderRight: "1px solid var(--rule)",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: 8 }}>
                      {String(i + 1).padStart(3, "0")} / {String(featuredProjects.length).padStart(3, "0")}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "clamp(22px,3vw,36px)", fontWeight: 800,
                      letterSpacing: "-0.02em", lineHeight: 1.05,
                      marginBottom: 16,
                      transition: "color 200ms",
                    }}>
                      {name}
                    </div>
                    <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
                      {desc}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {project.year && (
                      <span style={{
                        fontFamily: "var(--font-geist-mono)", fontSize: 8,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "var(--accent-orange)", padding: "3px 7px",
                        border: "1px solid color-mix(in srgb, var(--accent-orange) 30%, transparent)",
                      }}>{project.year}</span>
                    )}
                    {project.tech.slice(0, 3).map(t => (
                      <span key={t} style={{
                        fontFamily: "var(--font-geist-mono)", fontSize: 8,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "var(--text-muted)", padding: "3px 7px",
                        border: "1px solid var(--rule)",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div style={{
                  background: "var(--bg-elevated)",
                  position: "relative", overflow: "hidden",
                  display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                  padding: 16,
                }}>
                  {project.image && (
                    <img
                      src={project.image} alt={name}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
                    />
                  )}
                  <span style={{
                    fontFamily: "var(--font-geist-mono)", fontSize: 8,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--rule)", writingMode: "vertical-rl",
                    position: "relative", zIndex: 1,
                  }}>
                    {project.id.toUpperCase()}.SYS
                  </span>
                </div>
              </CardWrap>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Em `PortfolioExperience.tsx`:** substituir `<FeaturedProjectCard />` + grid de 3 cards pela `<WorkHorizontal locale={locale} />`.

---

### FASE 5 — About: line-by-line reveal
**Arquivo:** `PortfolioExperience.tsx` — seção About

Substituir as animações atuais (slide lateral de tagsCol/orbitCol) pelo padrão V4.

**Padrão de cada linha:**
```tsx
// Wrapper para cada linha de texto
function LineReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        (el.firstChild as HTMLElement).style.transform = "translateY(0)";
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <div style={{
        transform: "translateY(110%)",
        transition: `transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        display: "block",
      }}>
        {children}
      </div>
    </div>
  );
}
```

**Aplicar:**
- Heading "Building at / the edge of / code." — 3 `LineReveal` com delay 0/80/160ms
- Cada linha da bio em `LineReveal` com delay staggerado
- Datasheet cells: `opacity:0 + translateY(12px)` → revealed com stagger 80ms

---

### FASE 6 — Contact: word-split reveal
**Arquivo:** `PortfolioExperience.tsx` — seção Contact

O `home.contact_cta.heading` é uma string. Quebrar por palavras para o reveal:

```tsx
function WordSplitReveal({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll<HTMLElement>(".w-inner").forEach((inner, i) => {
          setTimeout(() => { inner.style.transform = "translateY(0)"; }, i * 90);
        });
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");
  return (
    <div ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.18em" }}>
          <span
            className="w-inner"
            style={{
              display: "inline-block",
              transform: "translateY(105%)",
              transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </div>
  );
}
```

**Substituir** o `<h2>` atual do contact por:
```tsx
<WordSplitReveal
  text={home.contact_cta.heading}
  style={{
    fontFamily: "var(--font-geist-sans)",
    fontSize: "clamp(42px,7.5vw,116px)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    marginBottom: 80,
  }}
/>
```

---

### FASE 7 — Scroll system unificado
**Arquivo:** `PortfolioExperience.tsx` + `globals.css`

#### 7a. Scroll progress bar: laranja → azul
Localizar `progressBarRef` no JSX e atualizar cor dinamicamente:
```ts
// No onScroll handler existente, adicionar:
const vel = (window as any).__scrollVel ?? 0;
if (progressBarRef.current) {
  progressBarRef.current.style.background = vel > 15 ? "var(--accent-blue)" : "var(--accent-orange)";
}
```

#### 7b. Section labels com padrão `NN — LABEL`
Substituir os labels existentes pelo padrão V4:
```tsx
// Padrão visual para cada section label:
<span style={{
  fontFamily: "var(--font-geist-mono)",
  fontSize: 9, letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--accent-orange)",
  display: "flex", alignItems: "center", gap: 16,
  marginBottom: 32,
}}>
  02 — Work
  <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
</span>
```

---

## Ordem de Orquestração (próxima sessão)

### Batch 1 — paralelo (sem dependências entre si)
- **Agente A:** FASE 1 (cursor) + FASE 7 (scroll system)
- **Agente B:** FASE 2 (hero clip-path) + FASE 3 (stats strip)
- **Agente C:** FASE 4 (work horizontal) — independente, arquivo novo

### Batch 2 — após Batch 1 (dependem de ver o estado)
- **Agente D:** FASE 5 (about reveals) + FASE 6 (contact word-split)

---

## Instrução para o agente da próxima sessão

```
Leia /V4_IMPLEMENTATION_PLAN.md e execute as fases na ordem de orquestração descrita.
Lance os agentes do Batch 1 em paralelo (3 agentes simultâneos).
Após confirmação de conclusão do Batch 1, lance o Batch 2.
Não altere conteúdo: projetos, copy, bio, i18n, Lab parts.
A referência visual está em prototype-redesign-v4.html (rodar com npx serve -l 8080 .).
```

---

## Arquivos-chave para referência

| Arquivo | Papel |
|---------|-------|
| `src/components/PortfolioExperience.tsx` | Homepage principal — a maioria das mudanças vai aqui |
| `src/components/CursorCanvas.tsx` | Cursor — reescrever (Fase 1) |
| `src/app/globals.css` | Tokens de cor + keyframes a adicionar |
| `src/lib/gsap.ts` | GSAP config — ScrollTrigger + SplitText já registrados |
| `src/lib/data/projects.ts` | Dados dos projetos (NÃO alterar) |
| `src/components/providers/LenisProvider.tsx` | Smooth scroll (NÃO alterar) |
| `prototype-redesign-v4.html` | Referência visual completa |

---

*Gerado em: 2026-06-05 | Sessão de implementação do design system V4*
