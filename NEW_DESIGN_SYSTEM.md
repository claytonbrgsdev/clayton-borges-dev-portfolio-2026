# Design System v3 — Plano de Implementação

> Este documento é o handoff completo para o próximo agente.
> Não reescreva componentes. Não altere lógica ou comportamento.
> Aplique apenas a camada visual: tokens de cor, tipografia e espaçamento.

---

## 1. Contexto

O portfólio passou por uma fase de exploração de design onde foram criados **3 protótipos HTML** localizados na raiz do projeto:

| Arquivo | Conceito | Destaque |
|---|---|---|
| `prototype-redesign.html` | V1 — Signal Archive | Fundo escuro quente, acento ember, flow field p5 |
| `prototype-redesign-v2.html` | V2 — Precision System | Fundo claro, acento azul, Lissajous, work index |
| `prototype-redesign-v3.html` | V3 — Non-Rigid Transmission | Fundo preto, acento vermelho, CRT static, broadcast log |

O usuário aprovou os 3 e definiu a paleta final como: **preto + laranja + azul**.

Os protótipos são referências visuais completas. Rode-os em `http://localhost:8080/prototype-redesign.html` etc. com `npx serve -l 8080 .`.

---

## 2. Design System Definitivo

### 2.1 Paleta

```css
/* cores com papel semântico fixo — nunca quebre os papéis */
--bg:             #0A0909;   /* fundo base — preto quente */
--bg-elevated:    #111010;   /* superfícies elevadas (cards, tooltips) */
--text:           #EDEBE6;   /* texto primário — off-white quente */
--text-muted:     #524E4A;   /* metadados, labels secundários */
--rule:           #1C1A18;   /* divisórias, bordas sutis */
--accent-orange:  #D86020;   /* laranja — acento primário, interação */
--accent-blue:    #1E44F0;   /* azul elétrico — acento secundário */
--accent-light:   #F2F0EC;   /* fundo de seções de contraste (IndexSection) */
```

**Regras de uso:**
- `--accent-orange` = interação principal, anos/datas, CTAs, hover states
- `--accent-blue` = interação secundária, tech labels, links externos
- Nunca use os dois accentos no mesmo elemento
- `--accent-light` é exclusivo para a IndexSection (contraste intencional no dark site)
- Máximo 4 cores visíveis por seção

### 2.2 Tipografia

**Substituição das fontes atuais (Geist → Syne + IBM Plex Mono):**

| Papel | Fonte atual | Fonte nova |
|---|---|---|
| Display / headings | Geist Sans | **Syne** (wght 700/800) |
| Mono / labels / corpo | Geist Mono | **IBM Plex Mono** (wght 300/400) |

**Método de substituição — zero mudanças nos componentes:**

Em `layout.tsx`, substituir as importações de Geist e reutilizar os mesmos nomes de variáveis CSS. Todo `var(--font-geist-sans)` e `var(--font-geist-mono)` existente passa a servir Syne e IBM Plex Mono automaticamente.

```ts
// layout.tsx — ANTES
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// layout.tsx — DEPOIS
import { Syne, IBM_Plex_Mono } from "next/font/google";
const syne = Syne({
  variable: "--font-geist-sans",   // mantém o nome existente → zero mudanças em componentes
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",   // idem
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});
```

O `className` no `<html>` continua idêntico: `${syne.variable} ${ibmPlexMono.variable}`.

**Hierarquia tipográfica:**

```
Display hero:  Syne 800, clamp(52px, 9vw, 130px), tracking -0.025em
Section title: Syne 700, clamp(36px, 5vw, 72px),  tracking -0.02em
Body:          IBM Plex Mono 300, 13–15px,          line-height 1.8
Labels/meta:   IBM Plex Mono 400, 9–10px,           tracking 0.12em, uppercase
```

### 2.3 Espaçamento

Não alterar espaçamentos existentes. Manter o sistema já em uso.

### 2.4 Motion

Não alterar GSAP animations, Lenis, ou qualquer scroll behavior.
Apenas a cor de elementos animados muda (via tokens).

---

## 3. Arquitetura Atual dos Estilos

O projeto usa **Tailwind CSS v4** com `@import "tailwindcss"` em `globals.css`.
Não existe `tailwind.config.js` — a customização é feita via `@theme inline {}` no próprio `globals.css`.

Cores estão **hardcodadas como hex literals** nos componentes React (inline `style={{}}`),
**não** via CSS variables. A implementação requer busca e substituição direta nos arquivos TSX.

---

## 4. Plano de Implementação — Passo a Passo

### FASE 1 — Design Tokens (1 arquivo)

**Arquivo:** `src/app/globals.css`

Substituir o conteúdo completo por:

```css
@import "tailwindcss";

:root {
  /* ── Cores ── */
  --bg:            #0A0909;
  --bg-elevated:   #111010;
  --text:          #EDEBE6;
  --text-muted:    #524E4A;
  --rule:          #1C1A18;
  --accent-orange: #D86020;
  --accent-blue:   #1E44F0;
  --accent-light:  #F2F0EC;

  /* retrocompatibilidade semântica */
  --background: var(--bg);
  --foreground: var(--text);
}

@theme inline {
  --color-background:    var(--bg);
  --color-foreground:    var(--text);
  --color-accent-orange: var(--accent-orange);
  --color-accent-blue:   var(--accent-blue);
  --font-sans:           var(--font-geist-sans);
  --font-mono:           var(--font-geist-mono);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-geist-mono);
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar       { width: 2px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--rule); }
```

---

### FASE 2 — Tipografia (1 arquivo)

**Arquivo:** `src/app/layout.tsx`

Substituir a importação e instanciação das fontes conforme mostrado na seção 2.2.
O resto do arquivo permanece idêntico.

---

### FASE 3 — Componentes da Homepage

Os arquivos abaixo contêm cores hardcodadas que devem ser substituídas.
Para cada arquivo, a tabela mostra o valor atual → valor novo.

#### 3.1 `src/components/PortfolioExperience.tsx`

| Valor atual | Substituir por |
|---|---|
| `"#07090e"` | `"var(--bg)"` |
| `rgba(7,9,14,...)` | `rgba(10,9,9,...)` |

#### 3.2 `src/components/ProjectsBackground.tsx`

| Valor atual | Substituir por |
|---|---|
| `ctx.fillStyle = "#07090e"` (5 ocorrências) | `ctx.fillStyle = "var(--bg)"` |

> **Nota:** Canvas 2D API não lê CSS variables diretamente.
> Usar `getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()`
> ou simplesmente usar o literal `"#0A0909"` como hardcode alinhado ao token.
> Preferir: substituir `"#07090e"` → `"#0A0909"` (sem quebrar o canvas).

#### 3.3 `src/components/AboutBackground.tsx`

| Valor atual | Substituir por | Papel |
|---|---|---|
| `"#07090e"` (fundo geral) | `"#0A0909"` | bg |
| `["#07090e","#07090e","#07090e","#07090e"]` | `["#0A0909","#0A0909","#0A0909","#0A0909"]` | DARK array |
| `"#c86a28"` | `"#D86020"` | laranja — `--accent-orange` |
| `"#1e62d2"` | `"#1E44F0"` | azul — `--accent-blue` |
| `"#3c3c5a"` | `"#1C1A18"` | rule/muted |

#### 3.4 `src/components/sections/home/IndexSection.tsx`

> Esta seção tem fundo **claro** (`#F2F0EC`) por design intencional — é o contraste da homepage.
> **Manter** o fundo claro. Apenas atualizar o acento.

| Valor atual | Substituir por |
|---|---|
| `"#FF4F00"` | `"#D86020"` (laranja alinhado ao token) |
| `"#F2F0EC"` | manter (é `--accent-light`) |
| `"#0A0A0A"` | manter (texto escuro sobre fundo claro) |

#### 3.5 `src/components/sections/home/AboutSection.tsx`

> Seção com fundo claro (`#F2F0EC`). Manter o contraste.

| Valor atual | Substituir por |
|---|---|
| `"#F2F0EC"` | manter |
| `"#0A0A0A"` | manter |
| `"#9A9A9A"` | manter |

#### 3.6 `src/components/sections/home/ContactSection.tsx`

| Valor atual | Substituir por |
|---|---|
| `"#6B35D9"` (hover) | `"#D86020"` (laranja) |
| `"#F2F0EC"` (bg) | manter ou avaliar → `"var(--bg)"` |
| `"#0A0A0A"` | manter ou avaliar |

> **Decisão pendente:** A ContactSection é atualmente uma seção clara.
> O próximo agente deve decidir: manter o contraste claro/escuro, ou uniformizar para dark.
> Recomendação: tornar dark (fundo `--bg`) para consistência com v3.

#### 3.7 `src/components/sections/home/IDEDeploySequence.tsx`

| Valor atual | Substituir por |
|---|---|
| `"#07090e"` / `"#08090e"` | `"#0A0909"` |
| `"#ff5f57"`, `"#febc2e"`, `"#28c840"` | manter (são os dots macOS — são UI literal) |
| `"#28c840"` (success color) | manter |

#### 3.8 `src/components/sections/home/HeroSection.tsx`

Inspecionar e substituir qualquer `#07090e` por `#0A0909`.

#### 3.9 Outros em `src/components/sections/home/`

Para cada arquivo que ainda não foi listado (`FeaturedProjects.tsx`, `WorkSection.tsx`, `SkillsSection.tsx`, `HowIWork.tsx`, etc.):

```bash
# Comando de inspeção para o próximo agente:
grep -n "#[0-9a-fA-F]\{3,6\}\|rgba\|background:\|color:" src/components/sections/home/*.tsx
```

Aplicar a mesma lógica:
- `#07090e` → `#0A0909`
- Laranja existente → `#D86020`
- Azul existente → `#1E44F0`
- Roxo/violeta (`#6B35D9`) → `#1E44F0` (azul, alinhar ao sistema)

---

### FASE 4 — Lab Landing

**Arquivo:** `src/components/LabLanding.tsx`

| Valor atual | Substituir por |
|---|---|
| `"#030304"` (bg) | `"#0A0909"` |
| `"#C84030"` (acento principal) | `"#D86020"` (laranja) |
| `rgba(200,64,48,...)` | `rgba(216,96,32,...)` |
| `rgba(255,255,255,...)` | manter |

---

### FASE 5 — Lab Part Chrome

**Arquivo:** `src/components/LabPartChrome.tsx`

O LabPartChrome usa um array de acento por parte narrativa:

```ts
// linha 6-8 — ANTES
1: "#C84030",
2: "#3060D0",
3: "#8040C0",

// DEPOIS — alinhado ao novo sistema
1: "#D86020",   // laranja — Part I (FORM)
2: "#1E44F0",   // azul   — Part II (FORCE)
3: "#8040C0",   // roxo   — Part III (MIND) — manter: cor única, narrativa
```

> **Importante:** As cores das Lab Parts têm significado narrativo (documentado em
> `src/lib/data/lab-narrative.ts`). Part 3 mantém roxo pois é a cor da mente/transcendência.

---

### FASE 6 — Lab Parts (LabPart1, LabPart2, LabPart3)

As paletas das partes estão definidas na memória do projeto:
- Part 1: `bg=#0a0a0c`, `fg=#f0ede8`, `accent=#C84030`
- Part 2: `bg=#00000c`, `fg=#e8eeff`, `accent=#3060D0`
- Part 3: `bg=#04000c`, `fg=#d4c8f0`, `accent=#8040C0`

**Atualizar apenas o acento de cada parte para alinhar ao sistema:**

```ts
// LabPart1.tsx — accent
"#C84030" → "#D86020"   // laranja (mais quente, alinhado)

// LabPart2.tsx — accent
"#3060D0" → "#1E44F0"   // azul (mais elétrico, alinhado)

// LabPart3.tsx — accent
"#8040C0" → "#8040C0"   // manter: roxo é intencional para MIND
```

Os fundos `#0a0a0c`, `#00000c`, `#04000c` são variações de preto muito próximas de `#0A0909`.
Podem ser mantidos como estão — a diferença é imperceptível e preserva a identidade por parte.

---

## 5. O Que NÃO Alterar

```
✗ Estrutura de componentes
✗ Lógica de scroll (GSAP, Lenis)
✗ Animações e transições existentes
✗ Sketches p5.js e canvas 2D em todos os Lab components
✗ Routing e i18n (next-intl)
✗ Data files (src/lib/data/*)
✗ Dots macOS: #ff5f57, #febc2e, #28c840 (UI literal em IDEDeploySequence)
✗ Fundos claros de IndexSection e AboutSection (contraste intencional)
✗ Roxo #8040C0 da Part III do Lab (cor narrativa)
```

---

## 6. Checklist de Implementação

Marcar cada item ao completar:

```
[ ] FASE 1 — globals.css atualizado com todos os tokens
[ ] FASE 2 — layout.tsx com Syne + IBM Plex Mono
[ ] FASE 3.1 — PortfolioExperience.tsx: bg atualizado
[ ] FASE 3.2 — ProjectsBackground.tsx: 5 fillStyle atualizados
[ ] FASE 3.3 — AboutBackground.tsx: 3 cores alinhadas
[ ] FASE 3.4 — IndexSection.tsx: FF4F00 → D86020
[ ] FASE 3.5 — AboutSection.tsx: revisado (manter claro)
[ ] FASE 3.6 — ContactSection.tsx: hover 6B35D9 → D86020
[ ] FASE 3.7 — IDEDeploySequence.tsx: bg atualizado
[ ] FASE 3.8 — HeroSection.tsx: inspecionar + atualizar
[ ] FASE 3.9 — Demais sections/home/*.tsx: varredura grep
[ ] FASE 4  — LabLanding.tsx: bg + accent
[ ] FASE 5  — LabPartChrome.tsx: array de accents
[ ] FASE 6  — LabPart1/2/3.tsx: accents alinhados
[ ] VERIFICAÇÃO — `npm run dev` sem erros de TypeScript
[ ] VERIFICAÇÃO — Rodar cada rota: /, /lab, /lab-part-1, /lab-part-2, /lab-part-3
[ ] VERIFICAÇÃO — Mobile: verificar responsive em 375px
```

---

## 7. Referências Rápidas

### Tokens de Substituição — Tabela Geral

| Valor antigo | Novo valor | Motivo |
|---|---|---|
| `#07090e` | `#0A0909` | bg principal |
| `#030304` | `#0A0909` | bg Lab Landing |
| `#08090e` | `#0A0909` | bg IDE |
| `#c86a28` | `#D86020` | laranja alinhado |
| `#FF4F00` | `#D86020` | laranja alinhado |
| `#C84030` | `#D86020` | laranja (de vermelho-laranja) |
| `#1e62d2` | `#1E44F0` | azul alinhado |
| `#3060D0` | `#1E44F0` | azul alinhado |
| `#6B35D9` | `#1E44F0` | azul (de roxo) |

### Fontes

```ts
// next/font/google
import { Syne, IBM_Plex_Mono } from "next/font/google";
```

### Protótipos de referência visual

```
prototype-redesign.html    → V1 (dark quente, flow field, Syne+IBM)
prototype-redesign-v2.html → V2 (light, Lissajous, work index list)
prototype-redesign-v3.html → V3 (preto puro, CRT static, broadcast log)
```

---

## 8. Decisões em Aberto

O próximo agente deve resolver antes de iniciar:

1. **IndexSection / AboutSection / ContactSection** — atualmente seções claras (`#F2F0EC`).
   Tornar dark (consistente com o novo sistema) ou manter o contraste claro/escuro?
   → Recomendação: manter 1 seção clara (IndexSection) como contraste intencional.
   As demais (About, Contact) devem ser avaliadas no contexto do scroll da homepage.

2. **Componentes Lab individuais** (LabPart*.tsx) — as paletas per-part têm fundos
   ligeiramente diferentes entre si (`#0a0a0c`, `#00000c`, `#04000c`).
   Uniformizar para `#0A0909` ou manter a variação sutil? → Manter variação.

3. **FeaturedProjectCard.tsx / WorkSection.tsx** — inspecionar se usam cores de acento
   que precisam ser atualizadas para o novo laranja/azul.

---

## 9. Notas Técnicas

- Tailwind v4 não usa `tailwind.config.js`. Customizações via `@theme inline {}` em `globals.css`.
- Canvas 2D API (usado em ProjectsBackground, AboutBackground) não lê CSS variables.
  Usar valores literais hardcodados que coincidam com os tokens.
- `next/font/google` gera as variáveis no HTML — os componentes só lêem via `var(--font-*)`.
- O projeto usa Next.js **16.2.1** com App Router e `next-intl` para i18n `[locale]`.
- Não há `tailwind.config.ts` — verificar se Tailwind v4 precisa de configuração adicional
  para as novas cores via `@theme inline`.

---

*Gerado em: 2026-06-04 | Agente: Claude Sonnet 4.6 | Sessão de design system*
