# Plano v2 — Site Metalinguístico (p5.js + GSAP ScrollTrigger)
> PM: Claude | Creative Director: Clayton Borges | Devs: Codex agents (paralelos)
> Criado em: 2026-05-26 | Premissa: o site DEMONSTRA o craft em vez de descrevê-lo

## Conceito Central
O site se constrói diante do visitante. Cada seção tem um momento onde o **meio é a mensagem** — uma demonstração procedural feita com os próprios building blocks (código, grids, partículas, sinais). p5.js + GSAP ScrollTrigger são os instrumentos.

## Princípios Inegociáveis
- **Aumentar, não substituir**: animações ficam ATRÁS/AO LADO do conteúdo atual. Texto permanece legível.
- **Mobile coerente**: cada momento p5 tem fallback SVG/CSS estático para <768px
- **reduced-motion**: TODOS os canvases desligados
- **Performance**: max 2 sketches ativos por vez. IntersectionObserver pausa fora do viewport.
- **Único shared canvas** para o Hero Constellation (fixed, full viewport)
- **Não duplicar instâncias**: tudo importa de `@/lib/gsap` (lição da v1)

## 5 Momentos Meta-narrativos

### M1 — Hero Constellation (centerpiece)
600-800 partículas p5 em noise field. Scroll 0→20% converge as partículas para os pontos da grid de layout do site. Permanece fixed atrás de toda a página, mudando de modo (`STRUCTURE / FLOW / DECAY / FIELD`) por seção via ScrollTrigger.

### M2 — Code → Component (Projects)
Primeiro project card renderiza inicialmente como bloco de código JSX (source real). ScrollTrigger `scrub: 0.5` fade-out das linhas de código → fade-in do card renderizado.

### M3 — Stack Orbiting Field (About)
p5 sketch na coluna stack: cada tech orbita um centro com física simples. Hover destaca. Pausa fora do viewport.

### M4 — Principles Geometric Build (How I Work)
Cada principle card emerge de um padrão geométrico procedural (sacred geometry) que completa quando o texto assenta.

### M5 — Contact Waveform (Contact)
Oscilloscope-style waveform p5. Cada link de contato é um pico. Hover amplifica.

## Arquitetura

```
src/lib/
  gsap.ts                          (já existe — single source)
  p5-react.tsx                     (NEW — instance mode wrapper)
  hooks/
    useScrollProgress.ts           (NEW — ScrollTrigger-based progress hook)

src/components/sketches/
  HeroConstellation.tsx            (M1 - foundation)
  StackOrbitField.tsx              (M3)
  PrincipleGeometry.tsx            (M4)
  ContactWaveform.tsx              (M5)

src/components/effects/
  CodeToComponent.tsx              (M2 - HTML/CSS only, no p5)

src/components/PortfolioExperience.tsx   (integrar todos os sketches)
```

## Orquestração

| Wave | Agent | Tarefa | Bloqueia |
|---|---|---|---|
| 1 | Foundation | p5-react.tsx + useScrollProgress + HeroConstellation + integração + fallback | Todos os outros |
| 2 (paralelo) | Agent A | Code→Component em Projects section | Integration |
| 2 (paralelo) | Agent B | Stack Orbiting Field | Integration |
| 2 (paralelo) | Agent C | Principles Geometric Build | Integration |
| 2 (paralelo) | Agent D | Contact Waveform | Integration |
| 3 | Integration | Wire-up final, perf audit, mobile QA, build | — |

## Status

| Wave | Status | Notas |
|---|---|---|
| 1 — Foundation + HeroConstellation | ✅ Done | p5-react.tsx, useScrollProgress.ts, HeroConstellation.tsx (154L), integrado |
| 2 — Agents A-D paralelos | ✅ Done | CodeToComponent (142L), StackOrbitField (300L), PrincipleGeometry (321L), ContactWaveform (198L) |
| 3 — Integration | ✅ Done | Tudo wired em PortfolioExperience.tsx, TypeScript clean, 8 canvases ativos |

## Validação final
- ✅ `npx tsc --noEmit` clean
- ✅ Server 200 em localhost:3000
- ✅ Console sem erros
- ✅ 8 canvases p5 mounted com 2D context
- ✅ Bilingue PT/EN preservado (zero hardcoded strings adicionadas)
- ✅ HeroConstellation respeita prefers-reduced-motion + mobile

## Pendências (não bloqueantes)
- Cross-browser test (Safari, Firefox)
- Performance audit real em DevTools (60fps target)
- Mobile QA em device real
- `npm run build` para produção
