# LAB — Handoff para próxima sessão

> **Para o agente:** leia este documento na íntegra antes de executar qualquer código. Ele descreve o estado atual, o que precisa ser feito, e como orquestrar um time de agentes para fazer tudo em paralelo sem estourar o contexto.

---

## Estado atual do projeto (2026-06-03, commit `7080e19`)

O portfólio de Clayton Borges está em https://claytonborges-portfolio.vercel.app  
Stack: Next.js 16 App Router · TypeScript · p5.js · Tailwind · Lenis · GSAP

### O que já existe no LAB

O lab é um livro de três atos. 23 experimentos sequencialmente conectados.

**Arquivos-chave criados/modificados nesta série de sessões:**

| Arquivo | O que faz |
|---------|-----------|
| `src/lib/data/lab-narrative.ts` | Dados da história: 3 partes, sequência flat com prev/next, `getLabNav(route)` |
| `src/components/LabChrome.tsx` | Overlay fixo em todas as fase-pages: barra de progresso global (topo), `← LAB`, strip inferior (parte/contador/NEXT), interstitial cinematográfico entre atos, keyboard nav (`→`/`Escape`), atmosphere overlay por ato |
| `src/components/LabLanding.tsx` | Landing page client component: campo de partículas, roadmap com 3 partes, timeline com SVG motifs, contagem de visitas por parte (localStorage) |
| `src/app/lab/page.tsx` | Server component com metadata, renderiza `<LabLanding />` |
| `src/app/lab-phase-{17..26}/page.tsx` | 23 pages — cada uma renderiza `<LabChrome route="..." />` + `<XxxLab />` |

**O que o chrome já entrega:**
- Barra de progresso global (2px, cor do ato, brilho, largura proporcional à posição nos 23 experimentos)
- `● PART I · FORM | 1 / 8 | NEXT →` no rodapé
- Interstitial full-screen ao atravessar de um ato para outro (PART II / FORCE / "the cascade...")
- Atmosphere overlay: glow de canto por ato (vermelho/azul/roxo, ~7% opacidade)
- Keyboard: `→` avança fase ou skip do interstitial, `Escape` volta ao `/lab`
- localStorage: registra fases visitadas; landing mostra "3 / 8" por parte

---

## O que ainda precisa ser feito

### TIER 1 — Alto impacto, tecnicamente direto

#### T1-A: Linha SVG animada "literalmente desenhada" no roadmap
**Arquivo:** `src/components/LabLanding.tsx`  
**Problema atual:** A linha que conecta os 3 nós do roadmap é um `div` com `opacity` que faz fade. O usuário pediu explicitamente "uma linha sendo **literalmente traçada**".  
**Solução:** SVG absoluto sobre os cards, `stroke-dasharray` + `stroke-dashoffset` animados via RAF.

**Como implementar:**
1. Adicionar refs aos três nós de timeline (`useRef` nos dots de cada `PartCard`)
2. No `LabLanding`, passar os refs para cima via `useImperativeHandle` ou usar `data-testid` + `querySelectorAll`
3. Após mount (`useLayoutEffect`), medir as posições absolutas dos 3 dots
4. Renderizar um `<svg>` com `position: absolute, overflow: visible` sobre todo o roadmap
5. Desenhar um `<path>` que conecta os 3 pontos (curva bezier suave)
6. Animar com `stroke-dasharray={totalLength} stroke-dashoffset={totalLength}` → `0` via `requestAnimationFrame` (1.8s ease-out, delay 300ms)
7. Remover os `div` de linha atuais (dentro de `PartCard`)

**Observação:** O path deve ser uma curva orgânica, não retas. Sugestão de curva: `M x1 y1 C x1 y1+40 x2 y2-40 x2 y2 C x2 y2+40 x3 y3-40 x3 y3`.

---

#### T1-B: Tipografia adaptativa por ato via CSS custom properties
**Arquivos:** `src/components/LabChrome.tsx` + os componentes de lab que têm texto visível  
**Objetivo:** Fazer a tipografia dos heading das lab-phases mudar sutilmente conforme o ato.  
**Solução não-invasiva (recomendada):** Injetar variáveis CSS no `<html>` via LabChrome e cada Lab component as lê.

**Como implementar no LabChrome.tsx:**
```tsx
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty("--lab-accent", nav.partAccent);
  root.style.setProperty("--lab-part", String(nav.partNumber));
  return () => {
    root.style.removeProperty("--lab-accent");
    root.style.removeProperty("--lab-part");
  };
}, [nav?.partAccent, nav?.partNumber]);
```

**Depois, para cada lab component que tem headings visíveis** (KikaiLab, HamonLab, LorenzLab, etc.):
- Localizar onde o texto do HUD é renderizado (geralmente no `p.draw()` ou no JSX de texto fixo)
- Para os que usam **elementos DOM** (textos JSX fixos): substituir cor hardcoded por `var(--lab-accent)`
- Para os que usam **p5.js canvas text**: já recebem cor via lógica interna — não alterar
- Prioridade: KikaiLab (Part I, tem textos com cores Bauhaus bem distintas), LorenzLab (Part II), MetaLab (Part III já tem a lógica certa)

**Lista de labs com textos DOM** (verificar cada um): KikaiLab, HamonLab, CausticLab, SlimeLab, FluxLab, PrismaLab, SpiralLab, OrbitLab, SandLab, LorenzLab, NewtonLab, CellularAutomatonLab, LangtonLab, IsingLab, WaveOpticsLab, IFSLab, MandelbrotLab, PercolationLab, LSystemLab, GasLab, WireWorldLab, SpiroLab, MetaLab.

---

### TIER 2 — Médio impacto

#### T2-A: Página de "entrada de ato" — `/lab/part/[n]`
Quando o usuário clica "ENTER →" na landing para a Parte 2 ou 3, antes de ir direto para a primeira fase, mostrar uma "capa de ato" dedicada:
- Rota: `/lab/part/1`, `/lab/part/2`, `/lab/part/3`
- Duração: ~4s ou clique para pular
- Visual: full-screen com o motivo SVG animado (a hipo-trocoide, as asas de Lorenz, o triângulo de Sierpinski), número do ato, título, tagline
- Automaticamente navega para a primeira fase do ato depois de `4s`

**Arquivos a criar:**
- `src/app/lab/part/[n]/page.tsx` — renderiza `<LabPartEntry n={n} />`
- `src/components/LabPartEntry.tsx` — o componente de entrada

**Notar:** Atualizar o `ENTER →` em `LabLanding.tsx` para apontar para `/lab/part/1` etc., em vez de direto para a primeira fase.

---

#### T2-B: Contagem de visitas animada na landing
**Arquivo:** `src/components/LabLanding.tsx`  
Quando o usuário volta ao `/lab` depois de ter visitado fases, a contagem `"3 / 8"` aparece com um counter animado (0 → 3 em ~600ms).  
Implementar via `useEffect` + RAF num `<CountUp>` inline ou hook simples.

---

#### T2-C: "Continue de onde parou" na landing
Adicionar abaixo do primary CTA "BEGIN FROM THE START →":  
Se `localStorage.lab_visited` não está vazio, mostrar um segundo CTA:
```
CONTINUE → Lorenz (2/8 em FORCE)
```
Apontando para a fase mais recente não visitada dentro da parte mais avançada.

**Lógica:** Iterar `LAB_SEQUENCE` em ordem reversa, encontrar a última fase visitada, navegar para a próxima.

---

### TIER 3 — Polimento

#### T3-A: Transição fade-to-black entre fases
Quando o usuário clica NEXT → (sem ser interstitial de ato), um fade de ~400ms para #030304 antes de navegar.  
Implementar via `View Transitions API` (`document.startViewTransition`) ou CSS `view-transition-name`.

#### T3-B: Botão "← FASE ANTERIOR" no chrome
Adicionar à esquerda do strip inferior, simetricamente ao NEXT →. Aparece com opacity baixa, fica mais visível no hover.

---

## Como orquestrar agentes para esta sessão

> **Instrução central:** Lance os agentes em paralelo quando as tarefas forem independentes. Não faça trabalho sequencial que pode ser paralelo — isso é o erro mais caro neste projeto.

### Plano de orquestração recomendado

```
FASE 1 (paralela — 4 agentes simultâneos):

  Agente A: T1-A — SVG line animation no LabLanding
    - Trabalha em: src/components/LabLanding.tsx
    - NÃO toca outros arquivos
    - Output: PR-ready diff

  Agente B: T1-B passo 1 — Injetar CSS vars no LabChrome
    - Trabalha em: src/components/LabChrome.tsx
    - Adicionar useEffect que seta --lab-accent e --lab-part no html
    - NÃO toca componentes de lab

  Agente C: T2-A — LabPartEntry pages
    - Cria: src/app/lab/part/[n]/page.tsx
    - Cria: src/components/LabPartEntry.tsx
    - Atualiza: ENTER → links em LabLanding.tsx
    - Output: novos arquivos

  Agente D: T2-C — "Continue de onde parou" na landing
    - Trabalha em: src/components/LabLanding.tsx
    - Adiciona CTA secundário baseado em localStorage
    - NÃO toca outros arquivos

FASE 2 (após Agente B completar):
  Agente E: T1-B passo 2 — Aplicar var(--lab-accent) nos labs com texto DOM
    - Precisa ler B's output primeiro (confirmar que --lab-accent está disponível)
    - Atualiza: apenas os labs que têm textos em elementos DOM (não canvas text)
    - Ler cada componente, identificar onde está a cor hardcoded nos textos, substituir

FASE 3 (após todas):
  Agente principal: TypeScript check + build + deploy
```

### Sequência de comandos para lançar

```
// No main context, enviar DOIS Tool calls paralelos:

Agent(T1-A): "Implement SVG drawn line animation in LabLanding..."
Agent(T2-A): "Create LabPartEntry component and routes..."

// Aguardar ambos completarem
// Depois lançar outros 2:

Agent(T1-B): "Inject --lab-accent CSS vars in LabChrome..."
Agent(T2-C): "Add 'continue where you left off' CTA in LabLanding..."
```

### O que cada agente precisa saber (briefing pronto)

**Briefing para Agente T1-A (SVG line):**
> "Estou trabalhando no portfólio de Clayton Borges em `/Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final`. Leia `src/components/LabLanding.tsx`. O roadmap da landing tem três PartCards com dots de timeline. Atualmente a linha que conecta os dots é um `div` simples que faz opacity fade. Preciso substituir por uma linha SVG que se 'desenha' usando `stroke-dashoffset`. Passos: (1) Adicionar `data-timeline-dot` attributes nos dots de cada PartCard. (2) No componente LabLanding, após mount via `useLayoutEffect`, medir posições dos dots com `querySelectorAll('[data-timeline-dot]')`. (3) Renderizar um `<svg>` com `position: absolute` sobre os cards, com um `<path>` curvo conectando os 3 dots. (4) Animar `stroke-dashoffset` de `totalLength` → 0 via RAF (1.8s, delay 300ms, ease-out-cubic). (5) Remover os divs de linha existentes dentro de PartCard. NÃO modificar nenhum outro arquivo."

**Briefing para Agente T1-B (CSS vars):**
> "Estou trabalhando no portfólio de Clayton Borges em `/Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final`. Leia `src/components/LabChrome.tsx` e `src/lib/data/lab-narrative.ts`. Preciso adicionar um `useEffect` em LabChrome que seta CSS custom properties `--lab-accent` e `--lab-part` no `document.documentElement` baseado no `nav.partAccent` e `nav.partNumber` atuais, com cleanup na desmontagem. Também adicionar `--lab-part-title` com o valor de `nav.partTitle`. NÃO modificar nada mais."

**Briefing para Agente T2-A (LabPartEntry):**
> "Estou trabalhando no portfólio de Clayton Borges em `/Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final`. Leia `src/lib/data/lab-narrative.ts`, `src/components/LabLanding.tsx`, e `src/components/MetaLab.tsx` (para entender o padrão de animação p5.js). Preciso: (1) Criar `src/components/LabPartEntry.tsx` — componente client que recebe `partNumber: 1|2|3`, mostra full-screen animado (motivo SVG animado do ato + número + título + tagline + 'CLICK TO BEGIN →'), auto-avança para `part.phases[0]` depois de 4s ou no clique. (2) Criar `src/app/lab/part/[n]/page.tsx` — server component com metadata, renderiza `<LabPartEntry partNumber={Number(params.n)} />`. (3) Em `src/components/LabLanding.tsx`, alterar o `href` dos botões `ENTER →` de `part.phases[0]` para `/lab/part/${part.number}`. NÃO modificar LabChrome ou labs."

**Briefing para Agente T2-C (Continue CTA):**
> "Estou trabalhando no portfólio de Clayton Borges em `/Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final`. Leia `src/components/LabLanding.tsx` e `src/lib/data/lab-narrative.ts`. Preciso adicionar um hook `useNextUnvisited()` que: (1) Lê `localStorage.lab_visited` (array de routes). (2) Itera `LAB_SEQUENCE` em ordem, encontra a primeira fase que NÃO está visitada. (3) Retorna `{ route, partTitle, phaseIndex, totalInPart } | null`. Depois, em `LabLanding`, abaixo do CTA 'BEGIN FROM THE START →', se `useNextUnvisited()` não for null, mostrar um segundo CTA mais sutil: `CONTINUE → [LORENZ · PART II · 2/8]` com a cor accent do ato correspondente. NÃO modificar nenhum outro arquivo."

---

## Checklist antes de começar

- [ ] Ler `lab-implementation-progress.md` para histórico completo
- [ ] Confirmar que o build atual passa: `npm run build` (deve passar sem erros)
- [ ] Confirmar commits recentes: `git log --oneline -5`
- [ ] Último commit deve ser `7080e19` ou posterior

## Arquitetura resumida

```
/lab                    ← LabLanding (client) com roadmap
/lab/part/[1-3]         ← LabPartEntry (a criar) — capa cinematográfica do ato
/lab-phase-17..26       ← Labs individuais com LabChrome overlay

src/lib/data/
  lab-narrative.ts      ← LAB_PARTS, LAB_SEQUENCE, getLabNav()

src/components/
  LabChrome.tsx         ← barra progresso + chrome + interstitial + keyboard
  LabLanding.tsx        ← landing page com roadmap
  LabPartEntry.tsx      ← (a criar) capa de ato
  MetaLab.tsx           ← fase 26, epilogue (padrão p5.js de referência)
```

## Convenções do projeto

- **Sem modificar Labs existentes** sem necessidade — são ~20 componentes p5.js
- **CSS vars como ponte**: LabChrome injeta `--lab-accent`, labs lêem opcionalmente
- **z-index hierarchy**: canvas lab = 1-10 · chrome = 200 · progress bar = 300 · interstitial = 500
- **Inline styles** em componentes de lab (não Tailwind) — manter consistência
- **Server components** para page.tsx (com metadata), client components para UI interativa
- **Sem modificar outros arquivos do portfólio** (PortfolioExperience, etc.) — LAB é isolado
