# Homepage Content Map
> Mapeamento do conteúdo atual da homepage — `src/components/PortfolioExperience.tsx`
> Gerado em: 2026-05-26

---

## Arquitetura

- Componente principal: `PortfolioExperience` (client component)
- Rota: `src/app/[locale]/page.tsx`
- Background: dark solid (`#07090e`)
- Scroll: Lenis (smooth scroll via `window.__lenis`)
- Navegação lateral: 5 pontos verticais (dots) — lado direito, visível em md+
- Progress bar: topo da página, largura animada via `window.scrollY`
- Bilíngue: PT/EN via `dict` prop (`src/lib/i18n/en.json` / `pt.json`)

---

## SECTION 0 — Hero

**Referência:** `sectionsRef[0]` | `min-h-screen`

### Conteúdo
| Campo | Valor |
|---|---|
| Label | `home.hero.greeting` (mono, uppercase, tracking-widest) |
| Heading | `home.hero.name` — "Clayton" + "Borges" (split, segundo nome com opacity 0.72) |
| Subtitle | `home.hero.title` (opacity 0.58) |
| Tagline | `home.hero.subtitle` (mono, opacity 0.32) |
| CTA primário | `home.hero.cta_projects` → `/{locale}/projects` |
| CTA secundário | `home.hero.cta_contact` → `/{locale}/contact` |
| Scroll hint | `↓` (bounce animation, opacity 0.2) |

### Estilo
- H1: `clamp(3.5rem, 10vw, 7rem)`, bold, leading-0.95
- Background: escuro, sem canvas/WebGL no momento
- Sem animação de entrada — elementos estão estáticos no load

---

## SECTION 1 — Featured Projects

**Referência:** `sectionsRef[1]` | `min-h-screen`

### Conteúdo
| Campo | Valor |
|---|---|
| Label | `home.featured_projects.label` |
| Heading | `home.featured_projects.heading` |
| CTA | `home.featured_projects.cta` → `/{locale}/projects` |

**Projeto principal** (`featuredProjects[0]`):
- Nome, tipo, cliente, ano, descrição, highlights (lista com `●`), tech tags (máx 7 + overflow), links para case study e live URL

**Grid de 3 projetos** (`featuredProjects[1..3]`):
- Cards com nome, tipo, desc (line-clamp-3), 3 tech tags, links para case study/live
- Hover: `border-white/22`, `-translate-y-0.5`

### Estilo
- Cards: `border rgba(255,255,255,0.1)`, `bg rgba(0,0,0,0.35)`, `backdrop-blur(8px)`
- Sem animação de scroll reveal — transições apenas em hover

---

## SECTION 2 — About + Stack

**Referência:** `sectionsRef[2]` | `min-h-screen`

### Conteúdo — Coluna Esquerda (About)
| Campo | Valor |
|---|---|
| Label | `home.about_preview.label` |
| Heading | `home.about_preview.heading` |
| Body | `home.about_preview.body` |
| CTA | `home.about_preview.cta` → `/{locale}/about` |

### Conteúdo — Coluna Direita (Stack)
| Campo | Valor |
|---|---|
| Label | `home.skills.label` |
| Heading | `home.skills.heading` |
| Items | `stack` da `src/lib/data/stack.ts` — agrupado por categoria |

Stack renderiza categorias → tags com `title={item.note}` para tooltip

### Layout
- Grid 2 colunas em md+, gap 12/20
- Sem animação de scroll reveal

---

## SECTION 3 — How I Work (Principles)

**Referência:** `sectionsRef[3]` | `min-h-screen`

### Conteúdo
| Campo | Valor |
|---|---|
| Label | `"Approach"` (hardcoded) |
| Heading | `home.principles.heading` |
| Subheading | `home.principles.subheading` |
| Cards | `principles` de `src/lib/data/principles.ts` — 5 princípios |

Cada card: ícone (emoji), número (01–05), título PT/EN, descrição PT/EN

### Layout
- Grid: `sm:grid-cols-2 lg:grid-cols-3`, gap-4
- Cards com hover border, backdrop-blur
- Sem animação de entrada

---

## SECTION 4 — Lab + Hardware + Contact

**Referência:** `sectionsRef[4]` | `min-h-screen`

### Bloco Lab
| Campo | Valor |
|---|---|
| Label | `"Creative Lab"` (hardcoded) |
| Heading | `home.lab.heading` |
| Subheading | `home.lab.subheading` |
| CTA | `home.lab.explore_all` → `/lab` |
| Grid | `featuredExperiments` de `src/lib/data/experiments.ts` — gradient cards |

Cada experiment card: gradient background, phase label, focus tag, título, descrição (line-clamp-1), 2 tech tags, "Enter →" on hover

### Bloco Hardware Callout
| Campo | Valor |
|---|---|
| Label/Heading | `home.hardware_callout.heading` |
| Subheading | `home.hardware_callout.subheading` |
| Tags | Nomes dos `hardwareProjects` (PT/EN) |
| CTA | `home.hardware_callout.cta` → `/{locale}/hardware` |

### Bloco Contact CTA
| Campo | Valor |
|---|---|
| Label | `"Contact"` (hardcoded) |
| Heading | `home.contact_cta.heading` |
| Body | `home.contact_cta.body` |
| Email | `contactInfo.email` direto |
| CTA | `home.contact_cta.cta` → `/{locale}/contact` |
| Social | GitHub, LinkedIn, "Brasília, BR" |

---

## Estado Atual — O Que Está Faltando

### Animações
- **NENHUMA animação de scroll reveal** — elementos surgem estáticos
- Sem GSAP scroll triggers
- Sem Framer Motion
- Sem canvas/WebGL na homepage (apenas fundo sólido `#07090e`)
- `PortfolioExperience.tsx` é importado mas sem canvas de fundo ativo

### Estrutura Narrativa
- Sem sequência narrativa de entrada
- Sem "construção progressiva" da interface
- Sem intro/loader animado
- Sem micro-interações além de hover simples

### Outros
- `"Approach"` e `"Creative Lab"` e `"Contact"` ainda hardcoded (não no i18n)
- Sem transição visual entre seções
- Background plano sem profundidade visual

---

## Dados de Conteúdo

### Projetos em Destaque
- **Moveo Filmes** (case study completo disponível)
- **MzPrime 3D Showroom** (case study completo disponível)
- Outros listados em `src/lib/data/projects.ts`

### Experimentos em Destaque
- 27 fases em `/lab-phase-*` (fora do locale tree)
- Grid de featured no `/lab`

### Documentação Disponível
- `case-studies/moveo-filmes.md` — case study detalhado
- `case-studies/mzprime.md` — case study detalhado
- `PORTFOLIO_SKELETON.md` — requisitos originais do projeto
- `LAB.md` — documentação das 27 fases do lab
- `ideia.md` — script narrativo base (recém-criado)
