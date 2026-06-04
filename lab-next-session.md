# LAB — Handoff para próxima sessão

> **Para o agente:** leia este documento na íntegra antes de executar qualquer coisa.  
> Ele contém o roteiro, a arquitetura, os objetos-herói por parte, e o plano de orquestração de agentes.  
> Último commit estável: `55e3f95`. Build e TypeScript passando.

---

## A visão — o que DEVE ser feito

### O que NÃO é

As lab-phases existentes (`/lab-phase-17`, `/lab-phase-18-b`, etc.) são **repertório de conceitos**, não componentes a serem encadeados. Não basta juntar KikaiLab + HamonLab + CausticLab numa única página. Isso seria um mosaico de sketches sem coesão narrativa.

### O que É

Cada uma das três partes é **uma única página scroll-driven** com **um único objeto-herói** que é transformado pelos conceitos acumulados de todas as fases daquele ato.

O objeto cria um **referencial**: o visitante acompanha UMA coisa sendo transformada ao longo do scroll, e a cada transformação entende intuitivamente o conceito porque o referencial não mudou — só a regra aplicada a ele mudou.

**Regra de ouro:** se você tirar o objeto-herói e perguntar "o que eu estava vendo?", a resposta deve ser "um círculo que virou campo magnético" — não "um monte de sketches diferentes."

---

## Roteiro — três atos, três objetos

### PARTE I — FORM
**Objeto-herói:** Um círculo  
**Por que:** É a forma mais primária. Carrega proporção, razão, centro. Pode ser engrenagem, membrana, onda, corpo celeste.  
**Tagline:** *"before force, there is geometry"*  
**Duração estimada:** 1600vh de scroll

| Capítulo | Conceito (da fase) | O que acontece com o círculo |
|----------|--------------------|------------------------------|
| 1 — SEKKEI | Nexus/Kikai — geometria pura | O círculo é desenhado matematicamente. Proporção emerge. Uma hipo-trocoide traça o interior: a forma segue a função |
| 2 — KAITEN | Kikai — mecanismo | Engrenagens internas se revelam. O círculo gira. A caneta que nenhuma mão poderia segurar |
| 3 — HAMON | Hamon — reação-difusão | A superfície do círculo começa a reagir. Padrões de Gray-Scott emergem na membrana. Química sem instrução |
| 4 — MYCELIA | Slime — rede biológica | O círculo começa a enviar filamentos. Uma rede emerge sem centro. O círculo vira nó de uma malha orgânica |
| 5 — FIELD | Flux/Prisma — campo | O círculo é fonte de campo magnético. Linhas de força emanam. O círculo já não é forma — é fonte de influência invisível |
| 6 — ORBIT | Orbit — gravidade | O círculo é massa. Corpos menores orbitam. O vazio ao redor tem geometria |
| **FIM** | — | O círculo está imóvel. Mas ao redor dele: traços de tudo que foi. Texto: *"the circle was always all of these"* |

---

### PARTE II — FORCE
**Objeto-herói:** Uma grade de grãos/pontos  
**Por que:** Discreto, contável, simples. Pode virar pilha, atrator, plano complexo, autômato, modelo de spins.  
**Tagline:** *"the cascade from order to complexity"*  
**Duração estimada:** 1600vh de scroll

| Capítulo | Conceito (da fase) | O que acontece com a grade |
|----------|--------------------|---------------------------|
| 1 — GRAIN | Sand — criticalidade | Um grão. Mais chegam. A pilha atinge o limiar. Avalanche. A grade revela onde o caos começa |
| 2 — BUTTERFLY | Lorenz — caos determinístico | Os pontos da grade começam a se mover por equações de Lorenz. Trajetórias divergem. O atrator emerge da grade como densidade |
| 3 — BASIN | Newton — fronteira fractal | A grade vira plano complexo. Cada ponto é colorido pelo método de Newton: qual raiz ele alcança. A fronteira entre basins é fractal |
| 4 — RULE | Automaton/Langton — computação | A grade é autômato celular. Regra 30 → ruído. Regra 110 → estrutura. Uma formiga percorre. A rodovia emerge |
| 5 — SPIN | Ising — transição de fase | Cada ponto da grade tem spin +1 ou -1. Temperatura cai. Domínios se formam. A grade se magnetiza coletivamente |
| 6 — WAVE | Wave Optics — interferência | A grade vira fendas. Ondas propagam. Padrões de interferência aparecem. A grade é ao mesmo tempo partícula e onda |
| **FIM** | — | A grade está parada. Mas o padrão formado é irredutível a qualquer das regras individualmente. Texto: *"the same grid. different rules. different worlds."* |

---

### PARTE III — MIND
**Objeto-herói:** Um ponto — `z = 0` no plano complexo  
**Por que:** Pode ser o ponto de partida de um fractal, uma molécula, um sinal elétrico, uma curva. É o menor referencial possível.  
**Tagline:** *"you were watching yourself think"*  
**Duração estimada:** 1400vh de scroll

| Capítulo | Conceito (da fase) | O que acontece com o ponto |
|----------|--------------------|---------------------------|
| 1 — SEED | Mandelbrot — complexidade infinita | O ponto é `c` no plano de Mandelbrot. Zoom out: ele está na borda do conjunto. Cada nível de zoom revela nova estrutura |
| 2 — GRAMMAR | L-System/Percolation | O ponto começa a bifurcar: gramática L-system. Galhos. Depois percolação: o ponto pergunta se está conectado |
| 3 — HEAT | Gas — termodinâmica | O ponto vira molécula. Mais chegam. Sólido → líquido → gás. O ponto esquece onde começou |
| 4 — SIGNAL | WireWorld — computação | O ponto vira sinal elétrico. Percorre circuitos. Lógica emerge de fio e elétrons |
| 5 — CURVE | Spiro — matemática pura | O ponto traça curvas paramétricas. Lissajous. Rosa. A regra mais simples, a forma mais bela |
| 6 — QUESTION | MetaLab — o que é simulação? | O ponto para. A tela para. Texto: *"this dot was running a rule this whole time. so were you."* |

---

## Arquitetura técnica

### Rotas

```
/lab                → landing (LabLanding.tsx, já existe)
/lab-part-1         → Parte I — o círculo
/lab-part-2         → Parte II — a grade
/lab-part-3         → Parte III — o ponto
```

Cada `/lab-part-N` é um **arquivo de rota novo** em `src/app/lab-part-{1,2,3}/page.tsx`.

### Estrutura de cada parte (padrão p5.js existente no projeto)

```tsx
// src/app/lab-part-1/page.tsx
import { LabPart1 } from "@/components/LabPart1";
export const metadata = { title: "Form — Part I · The Lab" };
export default function Page() { return <LabPart1 />; }
```

```tsx
// src/components/LabPart1.tsx  (a criar — padrão já existe em LorenzLab.tsx)
"use client";

// 1. scroll container: height: "1600vh"
// 2. canvas fixo: position: "fixed", inset: 0
// 3. scroll progress sp = scrollY / (scrollHeight - innerHeight)
// 4. Capítulos com secAlpha() para fade-in/out dos textos
// 5. O sketch recebe sp e transforma o objeto-herói

const CHAPTERS = [
  { ch: 1, heading: "SEKKEI", sub: "blueprint", sp0: 0.000, sp1: 0.083, out0: 0.065, out1: 0.083 },
  { ch: 2, heading: "KAITEN", sub: "the machine", sp0: 0.083, sp1: 0.166, out0: 0.149, out1: 0.166 },
  // ...6 capítulos para Part I
];
```

### Referência obrigatória antes de escrever qualquer componente

Ler `src/components/LorenzLab.tsx` — é o padrão de referência mais limpo do projeto. Contém:
- O pattern de `scrollRef` + `containerRef` + `sectionEls`
- A função `secAlpha(sp, i0, i1, o0, o1)` para fade
- O `buildSketch(el, scrollEl, sectionEls)` que instancia p5 com `import("p5")`
- O `useEffect` com cleanup

**IMPORTANTE:** O scroll progress é calculado assim no p5 draw loop:
```js
const sp = Math.max(0, Math.min(1,
  window.scrollY / Math.max(1, scrollEl.scrollHeight - window.innerHeight),
));
```

### Chrome nas partes novas

As partes não usam `LabChrome` (que é para as lab-phases individuais). Cada parte tem seu próprio "mini chrome":
- `← LAB` fixo top-left (idêntico ao LabChrome, mesmo estilo)
- Nenhum bottom strip (não há "1/8" — é uma experiência linear contínua)
- Nenhum NEXT → (o scroll leva naturalmente ao fim; ao final, uma tela de transição para a próxima parte)

Criar um componente separado: `src/components/LabPartChrome.tsx`

```tsx
// LabPartChrome recebe: partNumber, nextPartRoute?
// Renderiza: ← LAB + (ao final do scroll: "PART II →" centralizado)
```

### Atualização na landing

Em `src/components/LabLanding.tsx`, os botões `ENTER →` atualmente apontam para as lab-phases individuais (`part.phases[0]`). Devem ser alterados para apontar para as novas rotas:
- Part I → `/lab-part-1`
- Part II → `/lab-part-2`  
- Part III → `/lab-part-3`

As lab-phases individuais (`/lab-phase-17` etc.) continuam existindo como sandboxes de referência — só não são mais o "produto" das partes.

---

## Plano de orquestração de agentes

> Cada parte é independente. Os 3 agentes de implementação rodam em paralelo desde o início.

```
FASE 0 (main context, antes de lançar agentes):
  1. npm run build — confirmar que está passando (deve estar)
  2. git log --oneline -3 — último commit deve ser 55e3f95 ou posterior
  3. Ler LorenzLab.tsx para ter o padrão na memória

FASE 1 (3 agentes em paralelo):
  Agente A → src/components/LabPart1.tsx + src/app/lab-part-1/page.tsx
  Agente B → src/components/LabPart2.tsx + src/app/lab-part-2/page.tsx
  Agente C → src/components/LabPart3.tsx + src/app/lab-part-3/page.tsx

FASE 2 (após todos completarem):
  Agente D (ou main context):
    - Criar src/components/LabPartChrome.tsx
    - Atualizar LabLanding.tsx: ENTER → links para /lab-part-{1,2,3}
    - TypeScript check: npx tsc --noEmit
    - Build: npm run build
    - Deploy: vercel --prod
```

---

## Briefings prontos para copiar-colar

### Briefing — Agente A (LabPart1 — o círculo)

```
Estou trabalhando no portfólio de Clayton Borges.
Diretório: /Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final

LEIA PRIMEIRO (obrigatório):
- src/components/LorenzLab.tsx (padrão arquitetural a seguir)
- src/lib/data/lab-narrative.ts (dados das partes)

CRIAR:
1. src/components/LabPart1.tsx
2. src/app/lab-part-1/page.tsx

OBJETO-HERÓI: Um círculo.

ROTEIRO (6 capítulos, scroll 0→1, altura total 1600vh):

CH1 (sp 0.00-0.17) — SEKKEI/FORM: O círculo é desenhado matematicamente.
  Visual: um único círculo aparece sendo traçado. Depois uma hipo-trocoide 
  (rRatio=0.33, dRatio=0.65) é desenhada dentro dele em linha fina.
  Paleta: quase-preto fundo, branco marfim linha, acento #C84030.

CH2 (sp 0.17-0.34) — KAITEN/MACHINE: Engrenagens giram dentro do círculo.
  Visual: o círculo externo fixo. Dentro, 3 engrenagens interligadas giram.
  Mostrar os dentes, a relação de transmissão. Traço acumulado.
  Paleta: Bauhaus — vermelho #C84030, azul #1A4A98, amarelo #E1AA1E.

CH3 (sp 0.34-0.51) — HAMON/CHEMISTRY: A superfície reage.
  Visual: o círculo vira uma "petri dish" vista de cima. Pixels dentro dele
  simulam Gray-Scott (ou padrão convincente). Padrão de labirinto emerge.
  Paleta: tons terra, verde musgo escuro.

CH4 (sp 0.51-0.67) — MYCELIA/NETWORK: Filamentos saem do círculo.
  Visual: o círculo no centro. Agentes saem dele e constroem uma rede
  Physarum-like que se espalha pelo canvas. A rede é o objeto agora.
  Paleta: verde-escuro, branco em baixa opacidade.

CH5 (sp 0.67-0.84) — FIELD/FORCE: O círculo é fonte de campo.
  Visual: linhas de campo magnético emanando do círculo como dipolo.
  Partículas seguem as linhas. O círculo pulsa suavemente.
  Paleta: azul #3060D0, linhas em baixa opacidade.

CH6 (sp 0.84-1.00) — ORBIT/GRAVITY: Corpos orbitam o círculo.
  Visual: o círculo é massa central. 4-6 corpos menores em órbitas elípticas.
  Traço acumulado das órbitas. Dissolução final.
  Texto final (fade-in lento): "the circle was always all of these"

ARQUITETURA:
- Seguir exatamente o padrão de LorenzLab.tsx:
  - buildSketch(el, scrollEl, sectionEls) retorna Promise<p5Type>
  - draw loop usa sp = window.scrollY / (scrollEl.scrollHeight - window.innerHeight)
  - 6 sectionEls para os textos, com secAlpha() para fade
  - pixelDensity(min(devicePixelRatio,2))
  - p5 import dinâmico via import("p5")
- NÃO use nenhum componente externo nem biblioteca adicional
- NÃO modifique outros arquivos do projeto
```

---

### Briefing — Agente B (LabPart2 — a grade)

```
Estou trabalhando no portfólio de Clayton Borges.
Diretório: /Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final

LEIA PRIMEIRO (obrigatório):
- src/components/LorenzLab.tsx (padrão arquitetural a seguir)
- src/lib/data/lab-narrative.ts

CRIAR:
1. src/components/LabPart2.tsx
2. src/app/lab-part-2/page.tsx

OBJETO-HERÓI: Uma grade de pontos/células (N×N, ~80×50 células).

ROTEIRO (6 capítulos, scroll 0→1, altura total 1600vh):

CH1 (sp 0.00-0.17) — GRAIN/CRITICALITY: Grãos caem.
  Visual: grade vazia. Grãos caem aleatoriamente no centro.
  Quando célula atinge limiar=4, topple: distribui para vizinhos.
  A grade mostra alturas via gradiente de cor (escuro=0, brilhante=3).
  Avalanche em cascata visível. Self-organized criticality.
  Paleta: quase-preto, gradiente âmbar para branco.

CH2 (sp 0.17-0.34) — BUTTERFLY/CHAOS: Os pontos se movem por Lorenz.
  Visual: cada ponto da grade mapeia para uma partícula no atrator de
  Lorenz (projeção xz). Partículas deixam traço. O atrator de borboleta
  emerge como densidade acumulada na grade.
  Paleta: #150300 quente para frio #00051A.

CH3 (sp 0.34-0.51) — BASIN/FRACTAL: Newton colore a grade.
  Visual: cada célula da grade é um ponto no plano complexo.
  Aplicar iteração de Newton para z³=1. Colorir por qual raiz convergiu.
  3 cores distintas. A fronteira entre as regiões é fractal.
  Paleta: 3 tons saturados distintos, preto nas fronteiras.

CH4 (sp 0.51-0.67) — RULE/AUTOMATON: A grade é autômato.
  Visual: grade binária. Começar com Rule 30 (caos).
  Cada nova linha de scroll = uma geração.
  Transição suave para Rule 110 (complexidade).
  Depois: uma formiga de Langton percorre a grade.
  Paleta: preto e branco puros.

CH5 (sp 0.67-0.84) — SPIN/ISING: A grade magnética.
  Visual: cada célula = spin (+1 branco / -1 escuro).
  Temperatura alta → ruído aleatório.
  Temperature baixa → domínios se formam. Transição de fase visível.
  Paleta: branco puro, preto puro. Bordas de domínio em #3060D0.

CH6 (sp 0.84-1.00) — WAVE/DIFFRACTION: A grade como fendas.
  Visual: grade vira barreira com N fendas.
  Padrão de interferência se forma no lado oposto.
  Dissolução: a grade desaparece, só o padrão de ondas permanece.
  Texto final: "the same grid. different rules. different worlds."

ARQUITETURA: Exatamente igual ao Agente A — seguir LorenzLab.tsx.
Acento de cor: #3060D0.
NÃO modifique outros arquivos.
```

---

### Briefing — Agente C (LabPart3 — o ponto)

```
Estou trabalhando no portfólio de Clayton Borges.
Diretório: /Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final

LEIA PRIMEIRO (obrigatório):
- src/components/LorenzLab.tsx (padrão arquitetural)
- src/components/MetaLab.tsx (epilogue — referência de tom para o último capítulo)
- src/lib/data/lab-narrative.ts

CRIAR:
1. src/components/LabPart3.tsx
2. src/app/lab-part-3/page.tsx

OBJETO-HERÓI: Um único ponto no centro do canvas.

ROTEIRO (6 capítulos, scroll 0→1, altura total 1400vh):

CH1 (sp 0.00-0.17) — SEED/MANDELBROT: O ponto no plano complexo.
  Visual: um ponto branco no centro. Câmera (zoom) vai recuando.
  O ponto está na borda do conjunto de Mandelbrot.
  À medida que o zoom recua, a borda fractal se revela ao redor.
  Renderizar o conjunto em tempo real com iter limitado (~80 iter).
  Centro inicial: c = -0.7269 + 0.1889i. Zoom de 0.0001 → 2.0.
  Paleta: preto, borda em gradiente HSV baseado em iteration count.

CH2 (sp 0.17-0.34) — GRAMMAR/L-SYSTEM: O ponto bifurca.
  Visual: o ponto começa a crescer em galhos (L-system tipo planta ou
  árvore Koch). A cada scroll, uma nova geração se adiciona.
  Depois: os galhos formam uma rede de percolação (células conectadas
  aleatoriamente até o threshold crítico p≈0.59).
  Paleta: verde #407858 (tênue).

CH3 (sp 0.34-0.51) — HEAT/GAS: O ponto vira molécula.
  Visual: o ponto solitário. Mais pontos aparecem (até ~200).
  Eles se movem como gás ideal (colisões elásticas).
  Temperatura visível na velocidade. Fase: sólido (lento) → gás (rápido).
  Paleta: azul frio para vermelho quente por velocidade.

CH4 (sp 0.51-0.67) — SIGNAL/WIREWORLD: O ponto vira elétron.
  Visual: o canvas mostra um circuito simples (alguns loops e gates).
  O ponto (agora dourado) percorre o circuito como electron-head.
  Outros sinais se propagam. Lógica emerge.
  Paleta: laranja #E06010 (electron), azul #3040A0 (wire), preto.

CH5 (sp 0.67-0.84) — CURVE/SPIRO: O ponto traça curvas.
  Visual: o ponto retorna ao centro. Começa a traçar uma curva de
  Lissajous (a=1,b=1,δ=π/2 → a=3,b=4,δ=π/6).
  A transição entre configurações interpolada suavemente.
  Traço acumula. A forma geométrica pura.
  Paleta: branco 220 em baixa opacidade, trace head brilhante.

CH6 (sp 0.84-1.00) — QUESTION/META: O ponto para.
  Visual: tudo desaparece exceto o ponto. Ele pulsa suavemente.
  Texto aparece em blocos, lentamente:
    "THIS DOT WAS RUNNING A RULE THIS WHOLE TIME."
    "so were you."
  Ao final: o ponto desaparece. Só o texto permanece.
  Referência de tom: MetaLab.tsx (CH4 QUESTION).

ARQUITETURA: Exatamente igual aos Agentes A e B — seguir LorenzLab.tsx.
Acento de cor: #8040C0.
NÃO modifique outros arquivos.
```

---

### Briefing — Agente D (chrome + landing + wiring)

```
Estou trabalhando no portfólio de Clayton Borges.
Diretório: /Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final

EXECUTAR DEPOIS que os Agentes A, B, C terminarem.

LEIA PRIMEIRO:
- src/components/LabChrome.tsx (referência de estilo para o chrome)
- src/components/LabLanding.tsx (arquivo a ser modificado)
- src/lib/data/lab-narrative.ts

TAREFAS:

1. Criar src/components/LabPartChrome.tsx
   Um componente client simples que recebe: partNumber: 1|2|3, nextRoute?: string
   Renderiza:
   - "← LAB" fixo top-left (mesmos estilos do LabChrome existente)
   - Ao detectar que o usuário chegou perto do fim do scroll (>88%):
     - Se nextRoute existir: mostrar "PART [X] →" bottom-center em accent color
     - Se não existir (Parte III): mostrar "← LAB" bottom-center
   - NÃO tem bottom strip com contador (as partes não têm "1/8")

2. Atualizar LabPart1.tsx, LabPart2.tsx, LabPart3.tsx
   Importar LabPartChrome e adicionar ao return:
   - LabPart1: <LabPartChrome partNumber={1} nextRoute="/lab-part-2" />
   - LabPart2: <LabPartChrome partNumber={2} nextRoute="/lab-part-3" />
   - LabPart3: <LabPartChrome partNumber={3} />

3. Atualizar src/components/LabLanding.tsx
   Os botões ENTER → atualmente apontam para part.phases[0] (lab-phase-17 etc.)
   Substituir por:
   - Part 1: href="/lab-part-1"
   - Part 2: href="/lab-part-2"
   - Part 3: href="/lab-part-3"
   Também: o CTA principal "BEGIN FROM THE START →" deve apontar para "/lab-part-1"

4. TypeScript check: npx tsc --noEmit
5. Build: npm run build
6. Se build passar: vercel --prod
```

---

## Checklist pré-execução

```bash
# Confirmar estado antes de lançar agentes:
cd /Users/claytonborges/WORK/ClaytonBorgesDevPortfolio/ClaytonBorgesDev-portfolio-final
npm run build              # deve passar sem erros
git log --oneline -3       # confirmar commits recentes
cat src/components/LorenzLab.tsx | head -100  # ler o padrão
```

---

## Convenções do projeto (para todos os agentes)

| Regra | Detalhe |
|-------|---------|
| Padrão p5 | Seguir LorenzLab.tsx exatamente: buildSketch, scrollRef, containerRef, sectionEls, secAlpha |
| Import p5 | `import("p5").then(({ default: P5 }) => ...)` — sempre dinâmico |
| pixelDensity | `Math.min(window.devicePixelRatio || 1, 2)` |
| Cores | Inline styles, não Tailwind, nos componentes de lab |
| Server/Client | page.tsx = server component (export metadata). LabPart*.tsx = "use client" |
| z-index | canvas = 1, textos overlay = 10, LabPartChrome = 200 |
| Não tocar | PortfolioExperience.tsx, labs existentes (/lab-phase-*), middleware, i18n |
| Deploy | vercel --prod (não git push) |

---

## Nota sobre as lab-phases existentes

As páginas `/lab-phase-17` até `/lab-phase-26` continuam existindo e funcionando com o chrome atual (LabChrome). Elas são o "laboratório de conceitos" — não são removidas, apenas não são mais o produto principal das três partes. Os visitantes que chegam pela landing page vão para `/lab-part-1/2/3`. As lab-phases individuais podem ser acessadas por quem quiser explorar isoladamente (futuramente via um link "explore all experiments" na landing).
