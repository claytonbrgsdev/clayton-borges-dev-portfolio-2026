# Plano de Ação — Portfolio Narrativo Animado
> PM: Claude | Creative Director: Clayton Borges | Dev: Codex
> Criado em: 2026-05-26 | Atualizado: 2026-05-26 (pós-review Codex)

## Decisões Aprovadas pelo Creative Director
- ✅ **Blueprint to Outcome**: hero inicia com wireframe → resolve para projeto real + métrica no primeiro scroll
- ✅ **Lançar implementação imediatamente**
- ✅ Motion Grammar: `power3.out`, max 0.6s reveals, stagger 0.06-0.10s

## Ajustes pós-review Codex (Criativo + Técnico)
- Task 01 SIMPLIFICADA: reconciliação Lenis+GSAP já estava no LenisProvider.tsx — apenas criar gsap.ts utility
- NOVA constraint: todos ScrollTriggers retornam `ctx.revert()` no cleanup do useEffect
- Progress bar: `style.width` → `scaleX` + `transform-origin: left` (evita layout/repaint no scroll)
- Hero Task: AMPLIADA de M → L (Blueprint to Outcome é mais complexo)
- Motion grammar único: mesmo easing family em todas as animações, max 1-2 beats "especiais"
- Trust final: terminar na seção de contato com evidência concreta (projeto + métricas), não apenas estética

## Status de Implementação

---

| Task | Status | Notas |
|---|---|---|
| 01 gsap.ts utility | ✅ Done | src/lib/gsap.ts criado |
| 02 Initial States | ✅ Done | Sections 1-4 opacity:0 |
| 03 Hero + Blueprint | ✅ Done | Agent C — hero timeline + Blueprint to Outcome |
| 04 Background Grid | ✅ Done | globals.css + wrapper class |
| 05-09 ScrollTriggers | ✅ Done | Agent D — 4 ScrollTriggers com ctx.revert() |
| 10 Progress Bar scaleX | ✅ Done | Agent E — compositor thread, sem layout/repaint |
| 11 Nav Dots | ✅ Done | CSS transitions suficientes — GSAP desnecessário |
| 12 Mobile Adaptation | ✅ Done | Agent E — sections reveladas imediatamente em <768px |
| 13 Final Build Validation | ✅ Done | Build limpo, 53 páginas, TypeScript OK, server 200 |

---

## 1. Creative Brief Refinado

### Conceito Central
> "O sistema se constrói diante do usuário — mas já estava perfeitamente planejado."

A narrativa do `ideia.md` é excelente como direção, mas precisa de uma adaptação importante: em vez de uma intro que toca automaticamente no tempo (0s, 5s, 10s...), a **narrativa é conduzida pelo scroll**. O visitante controla o ritmo — mas a sequência é inevitável. Isso é mais fiel à filosofia "feel before read" e respeita a autonomia do usuário.

### Arco Emocional (preservado do script)
- **Curiosidade** → Hero: algo está sendo montado
- **Admiração** → Projects + Skills: a profundidade se revela
- **Confiança** → Featured Project + Contact: domínio técnico evidente

### O que permanece
- Estrutura de 5 seções existente (Hero, Projects, About+Stack, HowIWork, Lab+Contact)
- Bilíngue PT/EN intacto — zero hardcoded strings novas
- Background `#07090e`
- Lenis smooth scroll + navegação dots + progress bar
- Todos os dados existentes (projects, stack, principles, experiments)

### O que muda
1. **Hero Section**: animação de entrada GSAP — nome se "monta" palavra por palavra, subtitle fades up, CTAs sliding in. Duração < 1.5s.
2. **Background Architecture**: grid visual sutil via CSS (thin lines, opacity baixíssima) que aparece com fade lento no load. Metáfora de "estrutura revelada" sem peso de canvas.
3. **Section ScrollTriggers**: cada uma das 5 seções tem um reveal distinto — não fade genérico, mas uma animação que conta algo sobre aquela seção.
4. **Featured Project**: momento cinematográfico — o main project card tem entrada com escala + stagger dos highlights. Ponto "40s" do script.
5. **Progress Bar Narrativa**: a barra fina no topo também exibe o label da seção atual. Micro-detalhe que reforça a sensação de progressão.

### O que NÃO faremos
- Loader de intro longo (0s no script = apenas a hero animation, não um loader separado)
- Fade-in em cada elemento individual (violação do design system — só reveals a nível de seção)
- p5.js separado (o projeto já tem renderers próprios; usaremos GSAP + CSS para o efeito)
- Framer Motion (não instalar — GSAP já está presente)
- Rewrite da estrutura de componentes — trabalhamos em cima do PortfolioExperience.tsx existente

### Reconciliação Lenis + GSAP ScrollTrigger
Lenis e GSAP ScrollTrigger precisam de reconciliação explícita. O padrão correto para Next.js:
```ts
// No LenisProvider ou no useEffect do PortfolioExperience:
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```
Referência: padrão oficial Lenis v2 + GSAP ScrollTrigger.

---

## 2. Fases de Execução

### Fase 1 — Fundação GSAP [~1h | Complexidade: S]
Registrar ScrollTrigger plugin, reconciliar com Lenis, criar `src/lib/gsap.ts` utility, estabelecer initial states via CSS classes.

**Entregável**: GSAP + ScrollTrigger funcionando com Lenis sem conflito. Nenhuma animação ainda, apenas a fundação.

---

### Fase 2 — Hero Assembly Animation [~2h | Complexidade: M]
GSAP timeline disparada no mount. Sequência: nome (por palavra, stagger 0.08s), subtitle (fade-up, delay 0.3s), CTAs (slide-in, delay 0.5s). Easing: `power3.out` para tudo.

**Entregável**: Hero carrega animado, < 1.5s total, suave, 60fps. `prefers-reduced-motion` respeitado (sem animação se ativado).

---

### Fase 3 — Background Grid Presence [~1h | Complexidade: S]
CSS-only: `::before` no wrapper da PortfolioExperience com `background-image: linear-gradient(...)` criando um grid de linhas finas (1px, opacity ~0.04). Aparece via `animation: fadeIn 2s ease forwards` no load. Sem canvas, sem JS.

**Entregável**: Grid sutil visível em desktop (md+), ausente em mobile, sem impacto de performance.

---

### Fase 4 — Section ScrollTriggers [~3h | Complexidade: M]
ScrollTrigger para cada seção, com reveals distintos:

- **Section 1 (Projects)**: cards entram por coluna, stagger 0.12s da esquerda para direita
- **Section 2 (About+Stack)**: coluna left slide-in de -40px, coluna right slide-in de +40px
- **Section 3 (Principles)**: cards populam sequencialmente, como preencher uma grelha (stagger row por row)
- **Section 4 (Lab)**: experiment cards cascateiam em diagonal (stagger com delay crescente por index)

**Entregável**: 4 ScrollTriggers funcionando com `once: true` (não repetem). 60fps em DevTools.

---

### Fase 5 — Featured Project Cinematic Moment [~2h | Complexidade: M]
O `mainProject` card (primeiro item em featured) tem tratamento especial:
- Entra com `scale: 0.96 → 1.0` + `y: 20 → 0`
- Highlights (`<li>` items) em stagger 0.06s após a entrada do card
- Tech tags populam como "typewriter de tags" (aparecem uma a uma, 0.03s stagger)

**Entregável**: O momento do projeto destaque é visivelmente mais importante que os outros cards.

---

### Fase 6 — Progress Bar Narrativa + Nav Dots Polish [~1h | Complexidade: S]
- Progress bar: adicionar um `<span>` com o label da seção atual (ex: "02 / PROJECTS"). Aparece com fade quando a seção muda.
- Nav dots: transitions via GSAP (substituir CSS inline por GSAP para consistency).

**Entregável**: Barra e dots narram a posição do usuário na experiência.

---

### Fase 7 — Mobile Adaptation + Final Polish [~2h | Complexidade: M]
- Em mobile (<768px): desabilitar ScrollTriggers, manter apenas a hero animation simplificada
- `prefers-reduced-motion`: all animations desabilitadas
- TypeScript check: `npm run build` passa sem erros
- Scroll run-through completo: nenhum flash, nenhum layout shift

**Entregável**: Build limpo, experiência coherente em 375px.

---

## 3. TODO List Completa

| # | Tarefa | Arquivo(s) Principal | Entregável | Validação | Tamanho |
|---|---|---|---|---|---|
| 01 | GSAP ScrollTrigger Setup | `src/lib/gsap.ts`, `LenisProvider.tsx` | ST registrado, reconciliado com Lenis | Sem erros, scroll funciona | S |
| 02 | Initial States CSS | `globals.css` ou `PortfolioExperience.tsx` | Seções start invisíveis antes do trigger | Nada visível antes do enter | S |
| 03 | Hero Intro Timeline | `PortfolioExperience.tsx` seção 0 | Animação entrada < 1.5s, easing power3 | 60fps, smooth, reduced-motion OK | M |
| 04 | Background Grid CSS | `globals.css` ou wrapper div | Grid sutil com fade-in 2s | Desktop only, sem perf impact | S |
| 05 | Projects Cards ScrollTrigger | `PortfolioExperience.tsx` seção 1 | Stagger L→R, once:true | Cards entram 1x apenas | M |
| 06 | Featured Project Cinematic | `PortfolioExperience.tsx` mainProject card | Scale+Y entrada, highlights stagger | Visualmente destacado | M |
| 07 | About+Stack Split Reveal | `PortfolioExperience.tsx` seção 2 | Colunas vêm de lados opostos | Limpo, sem layout shift | S |
| 08 | Principles Grid Populate | `PortfolioExperience.tsx` seção 3 | Stagger sequencial, parece preencher grid | Ritmo certo, nem lento nem rápido | S |
| 09 | Lab Cards Cascade | `PortfolioExperience.tsx` seção 4 | Diagonal cascade, perf OK | 60fps com 6 cards | S |
| 10 | Progress Bar Narrativa | `PortfolioExperience.tsx` progress bar | Label seção atual com fade | Atualiza corretamente | S |
| 11 | Nav Dots GSAP Polish | `PortfolioExperience.tsx` navDots | Transitions via GSAP | Consistente com resto das anim | S |
| 12 | Mobile Adaptation | `PortfolioExperience.tsx` | Animações off em <768px | Funciona em 375px sem jank | M |
| 13 | Final Build Validation | Todos | Build limpo, scroll run-through | `npm run build` passa, 0 erros | M |

---

## 4. Dependências de Execução

```
[01] GSAP Setup
 └── [02] Initial States
      ├── [03] Hero Timeline     ← independente de 04-12
      ├── [04] Background Grid   ← independente de 03, 05-12
      ├── [05] Projects ST
      │    └── [06] Featured Project Cinematic
      ├── [07] About+Stack ST
      ├── [08] Principles ST
      └── [09] Lab ST
           └── [10] Progress Bar
                └── [11] Nav Dots Polish
[12] Mobile Adaptation          ← após 03-11
[13] Final Validation           ← último
```

**Paralelizável após [01]+[02]:**
- Grupo A: [03] Hero + [04] Background Grid (sem dependências entre si)
- Grupo B: [05][07][08][09] (todos ScrollTriggers, paralelos entre si)
- Grupo C: [06][10][11] (dependem do Grupo B, paralelos entre si)
- Sequencial final: [12] → [13]

---

## 5. Critérios de Aceite Global

- [ ] Nenhuma animação de scroll repete ao re-scrollar para cima (todas `once: true`)
- [ ] Hero animation completa em < 1.5s
- [ ] 60fps mantidos durante scroll em Chrome DevTools (mid-range simulation)
- [ ] `prefers-reduced-motion: reduce` desabilita todas as animações
- [ ] Mobile (375px): experiência funcional sem jank
- [ ] Bilíngue: PT e EN ambos funcionam
- [ ] `npm run build` passa sem erros TypeScript
- [ ] Nenhum `console.error` ou warning no browser
- [ ] Lenis smooth scroll preservado em todas as seções
