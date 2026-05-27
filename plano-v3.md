# Plano v3 — Refinamentos Pós-Review do Clayton
> PM: Claude | Creative Director: Clayton Borges | Devs: Agentes Claude
> Criado em: 2026-05-27

---

## Feedback Recebido (base deste plano)

| Componente | Feedback | Status |
|---|---|---|
| Constellation modos | Funciona. Não necessariamente gostei, mas OK por enquanto | ✅ Keep |
| Code→Component | Muito rápido, narrativa não fica clara para o usuário | 🔧 Fix |
| Stack Orbit Field | Amou | ✅ Keep |
| About+Stack layout | Espaço vazio no lado esquerdo (About Me curto vs Stack longo) | 🔧 Fix layout |
| Principles (Approach) | Ama os símbolos/osciloscópio, mas grid de cards não engaja leitura | 🔄 Redesign |
| Contact Waveform | OK por enquanto | ✅ Keep |
| Case Studies | Precisam ser integrados corretamente (texto + imagens) | 🆕 Task |
| Lab Phases | Precisam de revisão Clayton-driven | 🆕 Task |

---

## Tarefas de Desenvolvimento

### TASK D1 — Principles Section: Full-Screen Scroll-Driven por Card
**Prioridade: Alta | Complexidade: L**

Redesign completo da seção Approach/Principles.

**Antes:** Grid de 5 cards com geometria p5 pequena (64×64) em cima
**Depois:** Cada princípio ocupa ~100vh. Scroll drive revela título, descrição e geometria. Usuário é forçado a engajar com cada card individualmente.

**Layout de cada card:**
```
[Viewport 100vh]
  - Geometria p5: grande (300-400px), posicionada em destaque (centro ou canto)
  - Índice: "01 / 05" — pequeno, canto
  - Título: tipo grande, entra de baixo via scrub
  - Descrição: entra após título, leitura confortável
  - Linha decorativa conectando geometria ao texto
```

**Geometria temática por princípio (rever icons, tornar mais específicos):**
- `Product Thinking` → Diagrama de decisão / árvore de nós com ramificações
- `Interface Quality` → Skeleton de layout que se constrói (grid + espaçamentos)
- `Full-Stack Execution` → Camadas horizontais empilhando (banco → API → UI)
- `Creative Craft` → Burst generativo / brush de partículas irradiando do centro
- `Maintainability` → Componentes modulares se encaixando (blocos reutilizáveis)

**Comportamento ScrollTrigger:**
- `scrub: 1.5` — smooth, não instantâneo
- Pin de cada card durante sua revelação completa
- Geometria: aparece primeiro (escala de 0.8→1.0 + opacity 0→1)
- Título: slides from y:40→0, opacity 0→1, delay relativo ao progresso
- Descrição: mesmo mas com atraso maior

**Arquivo a criar:** `src/components/sections/home/PrinciplesFullscreen.tsx`
**Arquivo a remover/deprecar:** uso atual do `PrincipleGeometry.tsx` na grade

---

### TASK D2 — About + Stack: Refactoring de Layout
**Prioridade: Alta | Complexidade: M**

**Antes:** Duas colunas lado a lado — About Me (esquerda, conteúdo curto) | Tech Stack list (direita, conteúdo longo). StackOrbitField fica abaixo da stack list na mesma coluna direita. Cria espaço vazio visível na esquerda.

**Depois (desktop lg+):**
```
[Row 1]
  Coluna esquerda: "WHAT I WORK WITH" + tag categories (vertical)
  Coluna direita: StackOrbitField (orbiting field, large)

[Row 2 — abaixo]
  About Me text (full width ou coluna menor)
```

**Depois (mobile):**
```
About Me
"What I Work With"
Tag categories
StackOrbitField (stack orbit)
```

O About Me pode ser uma secção mais discreta — texto + link "Learn More →" para `/about`. O destaque visual da seção é o orbit field.

**Arquivo a modificar:** `src/components/PortfolioExperience.tsx` (seção 2)
**Animações existentes:** ajustar o split-reveal (`cols[0]`, `cols[1]`) para o novo layout

---

### TASK D3 — CodeToComponent: Fix de Tempo + Narrativa
**Prioridade: Média | Complexidade: S**

**Problema 1 — velocidade:** Transição muito rápida. Usuário scrolla normalmente e não vê.
- Fix: mudar `start: "top 80%", end: "top 30%"` → `start: "top 90%", end: "center 20%"` (distância de scroll 2-3× maior)

**Problema 2 — narrativa:** Usuário não entende o que está vendo.
- Fix A: adicionar uma "label" acima do code block: `</ JSX Source >` em font-mono pequeno, branco/40
- Fix B: iniciar com o code block com opacidade maior/mais visível (código mais legível)
- Fix C: adicionar um hint sutil "← source" / "rendered →" que apareça no início da transição

**Relação com Blueprint card do Hero:**
O Blueprint card no hero (canto direito) mostra o "outcome" — um card Moveo Filmes já resolvido.
O CodeToComponent na seção Projects mostra "como aquele outcome foi produzido" — o código que gera o card.
São narrativamente conectados mas visualmente desconectados. Fix D3 não precisa resolver essa conexão agora — apenas tornar a transição mais perceptível.

**Arquivo a modificar:** `src/components/effects/CodeToComponent.tsx`

---

### TASK D4 — Case Studies: Integração de Conteúdo (Texto)
**Prioridade: Alta | Complexidade: M | PARCIALMENTE BLOQUEADA — aguarda imagens de Clayton**

Case studies existem em `case-studies/moveo-filmes.md` e `case-studies/mzprime.md`.
A rota `src/app/[locale]/projects/[slug]/page.tsx` já existe.

**Subtarefas:**
- D4a: Ler o conteúdo completo dos dois `.md` e estruturar como data objects em `src/lib/data/case-studies.ts`
- D4b: Criar layout visual de case study que renderize corretamente o conteúdo estruturado (headline, overview, tech stack, desafios, resultado, métricas)
- D4c: Adicionar image slots com placeholder state (blur hash ou skeleton) — imagens virão depois
- D4d: Garantir bilíngue PT/EN (os `.md` têm conteúdo em EN; precisa de versões PT)
- D4e: Quando imagens chegarem do Clayton → integrar

**Bloqueio:** D4e aguarda entregáveis do Clayton (veja seção "Tarefas de Clayton")

---

### TASK D5 — Lab Phases: Review + Cleanup
**Prioridade: Média | Bloqueada — aguarda revisão do Clayton**

27 lab phases geradas (`/lab-phase-3` até `/lab-phase-25-c`).
Clayton revisa e classifica cada uma.

**Protocolo de review:**
- Clayton envia lista de ratings: ✅ Keep | 🔧 Polish | ❌ Remove
- Agente executa cleanup + polish conforme lista

---

## Ordem de Execução dos Agentes

```
PARALELO (sem dependências):
  Agente 1 → TASK D1 (Principles Fullscreen)
  Agente 2 → TASK D2 (About+Stack Layout)
  Agente 3 → TASK D3 (CodeToComponent fix)
  Agente 4 → TASK D4a-D4c (Case Studies texto + layout + placeholders)

SEQUENCIAL depois:
  Integration check → tsc + build
  TASK D4d → i18n das case studies (PT)
  TASK D4e → imagens (aguarda Clayton)
  TASK D5 → lab cleanup (aguarda Clayton)
```

---

## Tarefas do Clayton (Entregáveis Necessários)

### [CLAYTON-1] Imagens para Case Studies
**Para quando:** Antes de D4e
**Especificações:**
- Formato: WebP (preferido) ou JPG/PNG
- Hero image (main): ~1440×810px (16:9)
- Detail images: ~1200×900px ou ~1200×675px
- Naming: `moveo-[descricao].webp`, `mzprime-[descricao].webp`
- Quantas: 3-5 por case study (1 hero + 2-4 detalhes)
- Onde entregar: `/public/images/case-studies/`

### [CLAYTON-2] Revisão das Lab Phases
**Para quando:** Qualquer momento
**Formato:** Para cada lab phase, uma de três opções:
- ✅ Keep as-is
- 🔧 Keep + polish (descreva o que precisa)
- ❌ Remove

**Lista das lab phases existentes no build:**
`/lab-phase-3`, `/lab-phase-5`, `/lab-phase-13` até `/lab-phase-25-c` (27 total)
Para review, acesse cada uma em `localhost:3000/lab-phase-X` e me dê o feedback.

---

## Critérios de Aceite Global

- [ ] `npx tsc --noEmit` limpo em todos os agentes
- [ ] `npm run build` passa sem erros
- [ ] Zero console errors no browser
- [ ] Bilíngue PT/EN funcionando
- [ ] Mobile (<768px): fallbacks sem canvas
- [ ] prefers-reduced-motion: zero animações
- [ ] Sections 3-4 opacity triggers funcionando após layout change
- [ ] Case study pages renderizam corretamente com dados reais
- [ ] Principles section: cada card pina corretamente + scroll suave

---

## Arquivos de Contexto Críticos para Agentes

```
src/lib/gsap.ts                          — SEMPRE importar GSAP aqui
src/lib/p5-react.tsx                     — wrapper p5 (IntersectionObserver já incluso)
src/lib/hooks/useScrollProgress.ts       — hook ScrollTrigger progress
src/lib/data/principles.ts               — 5 princípios com title/titlePt/description/icon
src/lib/data/stack.ts                    — stack data
src/lib/data/projects.ts                 — featuredProjects
src/components/PortfolioExperience.tsx   — componente principal (ler antes de modificar)
src/components/sketches/                 — sketches p5 existentes
src/components/effects/CodeToComponent.tsx
case-studies/moveo-filmes.md
case-studies/mzprime.md
```

**Constraint crítica (lição de bug anterior):**
NUNCA importar de `"gsap"` diretamente — sempre `@/lib/gsap`.
Turbopack cria instâncias duplicadas e quebra o ScrollTrigger.
