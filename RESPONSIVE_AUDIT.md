# Auditoria Responsiva — Portfolio Clayton Borges

> Objetivo: **tudo que é utilizável no desktop precisa ser utilizável no mobile**, e o site
> precisa renderizar corretamente em qualquer browser padrão da indústria (Chrome, Safari,
> Opera, Firefox — engines Blink, WebKit e Gecko).
>
> Metodologia: inspeção em Chrome real via extensão (dev server `localhost:3000`).
> Mobile testado a 606px (mínimo de janela do Chrome no macOS; abaixo do breakpoint de 768px,
> então todos os ramos mobile renderizam) + leitura das fórmulas `clamp()` para extrapolar 390px.
> Desktop a 1200px e tela grande a 1680px.

---

## Resumo do diagnóstico

O homepage no **desktop está excelente**. No **mobile, a estrutura geral funciona** (hero,
About, Princípios, Lab-flow, Contato e as páginas internas `/projects`, `/about`, `/contact`
estão limpos), **com uma exceção grave**: o componente **"PROJETOS SELECIONADOS"
(`WorkHorizontal`) está quebrado funcionalmente no mobile**. Há ainda um conjunto de ajustes
de **compatibilidade cross-browser** (Safari/iOS) e de **polimento de toque/tipografia**.

Referência de padrão correto já existente no próprio código: **`HorizontalLabFlow`** já carrega
**dois layouts dinamicamente** (`isMobile` → stack vertical no mobile, scroll horizontal pinado
no desktop). É exatamente esse padrão que vamos replicar para o `WorkHorizontal`.

---

## Problemas encontrados (por severidade)

### P0 — Funcionalidade quebrada no mobile

- [x] **P0.1 — `WorkHorizontal` ("Projetos Selecionados") é web-first e inutilizável no mobile.** ✅ RESOLVIDO — novo `WorkMobile.tsx` (stack vertical de 8 cards: thumb + nome 28px + ano + descrição completa + chips de tech + CTA "Ver Projeto"), carregado via `isMobile` (<768px); desktop intacto. Verificado no Chrome.
  Arquivo: `src/components/sections/home/WorkHorizontal.tsx`.
  - A seleção do projeto é dirigida por **`onMouseEnter` (hover)** — que **não existe no toque**.
  - O painel de detalhe (imagem, descrição, tech, CTA "Ver Projeto") fica em **grid lado-a-lado
    no desktop**, mas no mobile (`grid-cols-1`) **empilha ~900px abaixo** das miniaturas
    (seção tem 1388px de altura a 606px). Ao tocar numa miniatura, o `active` **muda**, mas o
    feedback acontece **fora da tela** → a sensação é de que "nada é clicável".
  - Rótulos das miniaturas em **7px** (`clamp(7px,0.65vw,10px)`) — ilegíveis.
  - Título "SELECTED PROJECTS" com `whiteSpace:nowrap` + `overflow:hidden` → **cortado no meio**
    da palavra no mobile.
  - CTA "Ver Projeto →" em **8px**, alvo de toque de 26px.
  - **Resolução: reestruturação completa** — criar um layout mobile dedicado, carregado
    dinamicamente, mantendo o layout desktop **intacto**. (ver Plano → A)

### P1 — Correção cross-browser (Safari / iOS)

- [x] **P1.1 — `minHeight: 100vh` / `min-h-screen` cortam conteúdo no Safari iOS** ✅ RESOLVIDO (→ `100svh` em PortfolioExperience 402/625/706/722 e HeroSection 126). (barra de
  endereço dinâmica). Trocar por `100svh`/`dvh` (o codebase já usa `100svh` em
  `IndexSection.tsx:29`, então há precedente).
  Locais: `PortfolioExperience.tsx:402` (hero), `:625`, `:706`, `:722` (`min-h-screen`),
  `HeroSection.tsx:126`.
- [x] **P1.2 — Inputs do formulário de contato em 14px → zoom automático do iOS Safari ao focar.** ✅ RESOLVIDO (→ `text-base`/16px nas 4 fields).
  Subir para **≥16px**. Arquivo: `src/components/sections/contact/ContactSection.tsx`
  (linhas 62, 73, 84, 95 — classe `text-sm`).
- [x] **P1.3 — `backdropFilter` inline sem prefixo `-webkit-`** ✅ RESOLVIDO (1 ocorrência faltante corrigida em `ConvergenceLab.tsx:1082`; as demais já tinham o prefixo). (Safari < 18 não aplica o blur.)
  Tailwind `backdrop-blur-*` já gera o prefixo; o problema é só nos estilos **inline**:
  `LabChrome.tsx:285,316`, `LabPartChrome.tsx:80,169`, `ConvergenceLab.tsx:1082`,
  `LabLanding.tsx:407`. (Páginas do Lab — prioridade menor, mas faz parte do "qualquer browser".)

### P2 — Polimento de toque / tipografia no mobile

- [x] **P2.1 — Texto interativo abaixo de 11px e alvos de toque pequenos.** ✅ Em grande parte
  resolvido: CTA "Ver Projeto" agora em ≥11px com alvo ≥44px (no `WorkMobile`); CTAs do hero
  "View Work"/"Get In Touch" subidos de 9px → 11px. **Pendência menor:** links de footer/contato
  (GitHub/LinkedIn ~9px) ainda pequenos — não-bloqueante, opcional num próximo passe.

### P3 — Telas grandes / ultra-wide (revisão, não quebra)

- [ ] **P3.1 — Seções full-bleed (`WorkHorizontal`, `HorizontalLabFlow`) em telas > 1920px.**
  Não estão quebradas; revisar proporção miniatura/detalhe e considerar um teto de largura.
  Baixa prioridade. (As seções About/Lab já usam `max-w-5xl mx-auto`.)

---

## Plano de ação (partições sem colisão de arquivos)

> Cada frente toca arquivos **disjuntos** para permitir execução **paralela** segura.
> Regra para todos: **não** subir dev server (porta 3000 já em uso — verificação central minha);
> seguir convenções de estilo inline do projeto; respeitar `AGENTS.md` (este Next.js tem
> breaking changes — consultar `node_modules/next/dist/docs/` antes de padrões novos);
> **não alterar o layout desktop**.

### Frente A — Rebuild mobile do `WorkHorizontal` (P0.1, + CTAs internos do P2.1)
Arquivos: `WorkHorizontal.tsx` (só adicionar o switch) + **novo** `WorkMobile.tsx`.
- Extrair/criar `WorkMobile.tsx`: **stack vertical de cards de projeto**, um por projeto —
  thumbnail + nome + ano + descrição + chips de tech + CTA "Ver Projeto" (quando houver
  `liveUrl`). Cada card autossuficiente, tudo tocável, fontes ≥11px, alvos ≥44px.
- Em `WorkHorizontal.tsx`: adicionar `useIsMobile()` (`window.innerWidth < 768`, padrão do
  `HorizontalLabFlow`), renderizar `<WorkMobile/>` no mobile e o layout atual **sem mudanças**
  no desktop. Cuidar de hidratação (estado inicial `false` + `useEffect`).

### Frente B — Unidades de viewport + CTAs do hero (P1.1, parte do P2.1)
Arquivos: `PortfolioExperience.tsx`, `HeroSection.tsx`, `globals.css` (utilitário se preciso).
- `100vh`/`min-h-screen` → `100svh`/`dvh` nos locais listados.
- Subir os CTAs do hero ("View Work"/"Get In Touch") para ≥11px.

### Frente C — Formulário de contato (P1.2)
Arquivo: `src/components/sections/contact/ContactSection.tsx`.
- Inputs/textarea para **≥16px** (`text-base` ou `fontSize:16`) mantendo o visual.

### Frente D — Prefixo `-webkit-` em `backdropFilter` (P1.3)
Arquivos: `LabChrome.tsx`, `LabPartChrome.tsx`, `ConvergenceLab.tsx`, `LabLanding.tsx`.
- Adicionar `WebkitBackdropFilter` junto de cada `backdropFilter` inline.

### Verificação central (eu, após as frentes)
- Reload no Chrome (mobile 606 + desktop 1200), screenshots de antes/depois do Work,
  teste de toque nos cards, checagem de overflow e de console, e revisão cross-browser.

---

## Status
- Auditoria: **concluída**.
- Execução: **P0.1, P1.1, P1.2, P1.3, P2.1 concluídos** por 4 agentes em paralelo + verificação
  central no Chrome (mobile 606px + desktop 1200px). Typecheck limpo (`tsc --noEmit` exit 0),
  console sem erros/avisos de hidratação, sem overflow horizontal.
- **Diferido (baixa prioridade, não-bloqueante):** P3.1 (teto de largura em telas ultra-wide
  >1920px — não quebra, só refinamento) e a pendência menor de P2.1 (links de footer ~9px).
