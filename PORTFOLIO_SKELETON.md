# Developer Portfolio — Requirements Skeleton (Updated)
> Adapted from original skeleton to match actual project data in `src/lib/data/projects.ts`,
> `src/lib/data/hardware.ts`, `src/lib/data/contact.ts`, and `src/lib/i18n/`.
> Changes annotated with `[CHANGED]`, `[ADDED]`, `[REMOVED]`.

---

## Main Objective

Build a developer portfolio for Clayton Borges — a creative full-stack developer focused on:

- JavaScript / TypeScript
- React, Next.js, Vite
- Node.js, Express, FastAPI [CHANGED — FastAPI is production-used, not secondary]
- Three.js, WebGL, GLSL — generative and interactive 3D [ADDED]
- Full-stack web applications and platforms
- Creative interfaces, generative art, audio tooling [ADDED]
- Python and Ruby — multiple shipped projects in both [CHANGED — not "brief experience"]

The portfolio must clearly communicate:

- What I build (client platforms, 3D experiences, audio tools, data products)
- Which technologies I use
- What projects I have created (client work + personal/OSS)
- How I approach development (product thinking + creative craft)
- Studio context: DISCLAYMER, co-run with Raphael Palmer [ADDED]
- How to contact me

---

## Bilingual Architecture [ADDED]

The site supports PT/EN via Next.js i18n (`[locale]` route segment).
All user-facing copy lives in `src/lib/i18n/en.json` and `src/lib/i18n/pt.json`.
All new sections must use i18n keys — no hardcoded strings in components.

---

## Site Structure

### 1. Hero Section

#### Required Content

- Developer name: **Clayton Borges**
- Professional title: **Creative / Full-Stack Developer**
- One-sentence description (from i18n `home.about_preview.body`):
  > 3 years building production web apps, interactive 3D experiences, and creative developer tools for clients in Brazil and worldwide. Based in Brasília — open to relocation and remote work.
- Primary CTA: View Projects
- Secondary CTA: Get In Touch [CHANGED — matches i18n]
- External links:
  - GitHub: `https://github.com/claytonbrgsdev/` [CHANGED — actual URL]
  - LinkedIn: `https://www.linkedin.com/in/clayton-borges-web-dev/` [CHANGED — actual URL]
  - Email: `claytonborgesdev@gmail.com` [CHANGED — actual email]
  - Instagram: `https://instagram.com/azulbic_` [ADDED]
  - DISCLAYMER studio: `https://www.disclaymer.com` [ADDED]

#### Required Functionality

- CTA scrolls or links to projects section
- Contact CTA scrolls or links to contact section
- External links open in new tab
- Hero must be responsive

#### Required Visual Elements

- Main heading
- Supporting text
- CTA group
- Interactive/generative visual element — use the existing lab animation context (p5.js or Three.js) [CHANGED — be specific]
- Animation using GSAP + Lenis already available in the project [CHANGED — these are the actual animation libs]

---

### 2. Featured Projects Section [CHANGED — entire section updated]

#### Required Content

Show **4 featured projects** drawn from `src/lib/data/projects.ts` where `featured: true`.

Recommended selection (covers all required types):

| Slot | Project | Type |
|------|---------|------|
| Main (visually prioritized) | Moveo Filmes | Full-stack CMS platform |
| 2 | MzPrime – 3D Car Cover Showroom | Creative / interactive 3D |
| 3 | Metanova Labs – Bittensor Dashboard | Data dashboard / product |
| 4 | DSRPTV Records | Creative commerce platform |

Each project card must include (sourced from `Project` type):
- Project title (`nameEn` / `namePt`)
- Short description (`descriptionEn` / `descriptionPt`)
- Project type (mapped from `categories`)
- Tech stack (`tech[]`)
- 3–5 highlights [NOTE: add `highlights` field to Project type — see Data Shape]
- Image, mockup, or visual placeholder (`image`)
- Link to case study page (`/projects/[id]`)
- Live demo link (`liveUrl`) — if available
- GitHub link (`githubUrl`) — if available
- Client label (`client`) — if applicable [ADDED]

#### Main Featured Project: Moveo Filmes [CHANGED — replaces fictional "Record Label Manager"]

```txt
Title:         Moveo Filmes
Type:          Full-Stack Client Platform / CMS
Client:        Moveo Filmes (independent film production company)
Description:
  Bilingual (PT/EN) web platform with a full CMS and admin dashboard.
  CRUD for films, crew, and news. TipTap rich text editor, drag-and-drop
  management, role-based auth via Supabase RLS, advanced GSAP animations,
  and Lenis smooth scroll.
Stack:
  Next.js 16, React 19, TypeScript, Supabase, PostgreSQL, GSAP, Lenis,
  TipTap, dnd-kit, Tailwind CSS
Highlights:
  - Full bilingual CMS with admin dashboard and RBAC
  - Rich text editor (TipTap) with drag-and-drop content management
  - Role-based access control via Supabase Row Level Security
  - Advanced GSAP scroll animations and Lenis smooth scroll
  - Production deployment for a real client in Brazil
```

#### Required Project Types (all present in actual data)

- Full-stack platform with auth and CMS → Moveo Filmes
- Creative / interactive 3D → MzPrime or Deep Ocean Explorer
- Dashboard / data product → Metanova Labs
- Creative commerce / audio → DSRPTV Records
- Smaller polished tool → ASA Player, Habitos, or eStock

#### Required Functionality

- Project cards are reusable components
- Project content comes from `src/lib/data/projects.ts`
- i18n: title and description must switch with locale
- Project links are easy to update
- Cards work on desktop and mobile
- Cards handle missing `liveUrl`, `githubUrl`, or `image` without breaking

---

### 3. Project Case Study Pages

#### Required Route

`/projects/[slug]` — use project `id` as slug (already URL-safe in data)

#### Required Content Per Project

```
- Project title (localized)
- Client (if applicable)
- Project type (mapped from categories)
- Year
- Overview
- Problem / Context
- Goal
- My Role
- Stack (flat list from tech[])
- Stack by category (categories object — see Data Shape)
- Main Features
- Technical Decisions
- UX/UI Decisions
- Visuals / screenshots (gallery[])
- Current Status
- What I Learned
- Links (live, github)
```

#### Required Case Study Template

```md
# Project Title
**Client:** …  |  **Year:** …  |  **Type:** …

## Overview
## Problem / Context
## Goal
## My Role
## Stack
### Frontend
### Backend
### Database
### Infrastructure
### Data / Analytics
## Main Features
## Technical Decisions
## UX/UI Decisions
## Visuals
## Current Status
## What I Learned
## Links
```

#### Required Functionality

- Dynamic route from project `id` field
- Metadata per project page (localized title + description)
- Back navigation to `/projects` or homepage
- Responsive layout
- Missing `gallery[]`, `liveUrl`, or `githubUrl` handled gracefully
- Project data not hardcoded inside page component

---

### 4. About Section

#### Required Content

- Short personal/professional summary
- Based in **Brasília, Brazil — open to relocation and remote work** [CHANGED]
- 3 years shipping production work [CHANGED — matches actual data]
- Main focus: JavaScript, TypeScript, React, Next.js, Node.js
- 3D and WebGL: Three.js, React Three Fiber, GLSL shaders [ADDED]
- Full-stack capability (client + server + database + deployment)
- Creative development: generative art, audio tooling, interactive experiences [ADDED]
- Python — production use: FastAPI, Streamlit, audio DSP, data pipelines [CHANGED — not "brief"]
- Ruby — production use: Slack bot with local LLM, WebSocket [CHANGED — not "brief"]
- Studio: **DISCLAYMER** — creative dev studio co-run with Raphael Palmer [ADDED]
- Languages: Portuguese (native), English (professional) [ADDED]

#### Required Structure

Use 2–4 short paragraphs matching the existing i18n `about.bio_1`, `bio_2`, `bio_3`:

> Creative / Full-Stack Developer based in Brasília, Brazil, with 3 years shipping production web applications, interactive 3D experiences, and creative developer tools.

> Work spans GLSL shaders and WebGL, full-stack platforms (Next.js, FastAPI, Supabase), audio tools (Web Audio API, Python DSP), and AI integrations. Freelance through DISCLAYMER, a studio co-run with Raphael Palmer.

> Open to remote roles, freelance contracts, and relocation worldwide.

#### Required Functionality

- Section anchor for navigation
- Responsive layout
- Optional: language badge (PT / EN), studio link, resume download button

---

### 5. Tech Stack Section [CHANGED — massively expanded]

#### Required Categories

Display technologies grouped by category, rendered from `src/data/stack.ts`.

**Frontend**
- JavaScript, TypeScript
- React, Next.js, Vite
- HTML, CSS, Tailwind CSS
- GSAP, Lenis [ADDED]
- TipTap, dnd-kit, Radix UI [ADDED]
- Framer Motion

**3D / Creative** [RENAMED from "Creative / UI" — this is a real strength]
- Three.js, React Three Fiber [ADDED]
- WebGL, GLSL shaders [ADDED]
- p5.js — generative art [ADDED]
- Web Audio API [ADDED]
- Figma, motion design, microinteractions
- Design systems, responsive interfaces, component architecture

**Backend**
- Node.js, Express
- FastAPI [ADDED — production use in Novo Rio]
- REST APIs, WebSocket [ADDED]
- Authentication (Supabase RLS, Firebase Auth, OAuth 2.0)
- PostgreSQL, SQL, Redis [ADDED]
- Prisma, SQLAlchemy, Alembic [ADDED]

**Infrastructure / Tools**
- Docker, NGINX
- AWS S3 [ADDED]
- Vercel [ADDED]
- Git, GitHub
- Metabase
- Apache Airflow, DBT [ADDED]

**Other Languages**
- Python — FastAPI, Streamlit, DSP, data pipelines [CHANGED — add context]
- Ruby — Rack, WebSocket, Ollama LLM integration [CHANGED — add context]
- C++ — ESP32 embedded audio synthesis [ADDED]

#### Required Functionality

- Rendered from a structured `StackCategory[]` data object in `src/data/stack.ts`
- Categories visually separated
- Responsive
- Easy to add/remove items

---

### 6. The Lab — Creative Experiments [CHANGED — elevated, not optional]

This is the portfolio's signature artifact. The lab consists of **27 generative canvas experiments** (p5.js, Three.js, WebGL) accessible at `/lab-phase-*` routes.

#### Required Content

A dedicated callout section linking to the lab, with:
- Section heading: "The Lab" or "Creative Experiments"
- Short description of what the lab is (generative art, computational experiments, visual research)
- 4–6 representative previews (static or animated thumbnails of lab phases)
- Link to explore the full lab (`/lab`)
- For each preview shown:
  - Phase name and number
  - Focus area
  - Technologies used

#### Suggested previews to highlight (visually strong phases)

| Phase | Name | Focus |
|-------|------|-------|
| 13 | Odyssey | Three.js generative world |
| 14 | Circuit Cathedral | p5.js monochromatic PCB |
| 19 | Slime | Reaction-diffusion simulation |
| 21-b | Lorenz | Chaos attractor |
| 24 | Mandelbrot | Complex number fractal |
| 25 | Gas | Hard-sphere molecular dynamics |

#### Required Functionality

- Section must always be shown (lab has content)
- Previews should link to their individual `/lab-phase-*` route
- Content sourced from a data structure (not hardcoded)
- Lazy load previews (canvas experiments are heavy)

---

### 7. Hardware Section [ADDED — was missing from skeleton]

#### Required Content

Compact section or page showcasing physical computing projects.
Data source: `src/lib/data/hardware.ts`.

Each item includes:
- Name (localized)
- Tagline
- Description
- Microcontroller / platform
- Tech stack
- Specs table
- Image gallery (photo, schematic, breadboard)
- Status badge (completed / in-progress / prototype)
- GitHub / video links

#### Current hardware projects

- **ESP32 Digital Synthesizer** — digital audio synth on ESP32, Mozzi library, ADSR, LFO, 4 oscillator shapes

#### Required Functionality

- Rendered from `hardwareProjects[]` in `src/lib/data/hardware.ts`
- Hidden if array is empty (graceful handling)
- Supports adding new hardware projects without code changes
- Nav item "Hardware" already present in i18n

---

### 8. How I Work Section [CHANGED — 5 principles, not 4]

#### Required Principles

**Product Thinking**
Focus on solving real product, user, or business problems — not just implementing features.

**Interface Quality**
Attention to layout, motion, responsiveness, and visual hierarchy. GSAP and Lenis are part of the toolkit, not decoration.

**Full-Stack Execution**
Ability to work across frontend, APIs, databases, and deployment — from Supabase RLS to Docker to AWS S3.

**Creative Craft** [ADDED]
Generative art, 3D, audio synthesis, and interactive experiences are part of the work. Code and aesthetics are not separate concerns.

**Maintainability**
Preference for reusable components, clear data structures, and code that can evolve — bilingual architecture included.

#### Required Functionality

- Render principles from a data structure in `src/data/principles.ts`
- Responsive card layout
- Section anchor

---

### 9. Contact Section

#### Required Content

- Short heading: "Get In Touch" (i18n `contact.heading`)
- Short description: "Open to remote roles, freelance work, and interesting projects."
- Email: `claytonborgesdev@gmail.com`
- GitHub: `https://github.com/claytonbrgsdev/`
- LinkedIn: `https://www.linkedin.com/in/clayton-borges-web-dev/`
- Instagram: `https://instagram.com/azulbic_` [ADDED]
- DISCLAYMER link: `https://www.disclaymer.com` [ADDED]
- Optional: contact form (functional — API route already at `src/app/api/contact/route.ts`)

#### Required Functionality

- Email `mailto:` link
- Optional copy-email button
- All social links open in new tab
- Responsive layout
- Form only shown if backend sends correctly (route already exists)

---

## Navigation [CHANGED]

### Required Links

- Projects
- About
- Stack
- Contact

### Additional Links (already in i18n)

- Hardware [ADDED — already in nav i18n]
- Lab / Experiments [ADDED — link to `/lab`]
- GitHub (external)
- LinkedIn (external)

Navigation must work on desktop and mobile and not break when optional sections are hidden.

---

## Homepage Section Order [CHANGED]

```
1. Hero
2. Featured Projects
3. About
4. Tech Stack
5. How I Work
6. The Lab (Creative Experiments)
7. Hardware (compact callout — if hardwareProjects.length > 0)
8. Contact
```

---

## Data Structure [CHANGED — updated to match existing + fill gaps]

### Files

```
src/lib/data/projects.ts      ← exists, needs highlights[] and expanded fields
src/lib/data/hardware.ts      ← exists
src/lib/data/contact.ts       ← exists
src/data/stack.ts             ← create
src/data/experiments.ts       ← create (lab phase metadata for previews)
src/data/principles.ts        ← create
src/data/navigation.ts        ← create
```

### Updated Project Type

```typescript
export type Project = {
  id: string;                   // used as slug
  nameEn: string;
  namePt: string;
  name: string;                 // fallback
  descriptionEn: string;
  descriptionPt: string;
  type?: string;                // human-readable type label [ADD]
  tech: string[];
  categories: ProjectCategory[];
  categoriesDetail?: {          // [ADD] for case study stack breakdown
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infrastructure?: string[];
    analytics?: string[];
  };
  highlights?: string[];        // [ADD] 3–5 bullet highlights for cards
  features?: string[];          // [ADD] for case study
  overview?: string;            // [ADD]
  problem?: string;             // [ADD]
  goal?: string;                // [ADD]
  role?: string[];              // [ADD]
  technicalDecisions?: string[];// [ADD]
  uxDecisions?: string[];       // [ADD]
  learnings?: string[];         // [ADD]
  status?: string;              // [ADD]
  image?: string;               // [ADD] path under /public/
  gallery?: string[];           // [ADD]
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  year: number;
  client?: string;
};
```

### Lab Experiment Type (new)

```typescript
// src/data/experiments.ts
export type LabExperiment = {
  phase: string;         // "14", "17-b", etc.
  route: string;         // "/lab-phase-14"
  nameEn: string;
  namePt: string;
  descriptionEn: string;
  focus: string;         // "generative art" | "simulation" | "3D" | etc.
  tech: string[];
  previewImage?: string; // static thumbnail or placeholder
  featured: boolean;     // show in homepage section
};
```

### Stack Data Shape

```typescript
// src/data/stack.ts
export type StackCategory = {
  title: string;
  items: StackItem[];
};

export type StackItem = {
  name: string;
  note?: string;         // optional context, e.g. "production use"
};

export const stack: StackCategory[] = [
  {
    title: "Frontend",
    items: [
      { name: "JavaScript" }, { name: "TypeScript" },
      { name: "React" }, { name: "Next.js" }, { name: "Vite" },
      { name: "HTML" }, { name: "CSS" }, { name: "Tailwind CSS" },
      { name: "GSAP" }, { name: "Lenis" },
      { name: "TipTap" }, { name: "dnd-kit" }, { name: "Radix UI" },
    ],
  },
  {
    title: "3D / Creative",
    items: [
      { name: "Three.js" }, { name: "React Three Fiber" },
      { name: "WebGL" }, { name: "GLSL" },
      { name: "p5.js" }, { name: "Web Audio API" },
      { name: "Figma" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js" }, { name: "Express" },
      { name: "FastAPI", note: "production" },
      { name: "REST APIs" }, { name: "WebSocket" },
      { name: "PostgreSQL" }, { name: "Redis" },
      { name: "Supabase" }, { name: "Firebase" },
      { name: "Prisma" }, { name: "SQLAlchemy" }, { name: "Alembic" },
    ],
  },
  {
    title: "Infrastructure / Tools",
    items: [
      { name: "Docker" }, { name: "NGINX" },
      { name: "AWS S3" }, { name: "Vercel" },
      { name: "Git" }, { name: "GitHub" },
      { name: "Metabase" },
      { name: "Apache Airflow" }, { name: "DBT" },
    ],
  },
  {
    title: "Other Languages",
    items: [
      { name: "Python", note: "FastAPI, Streamlit, DSP, data pipelines" },
      { name: "Ruby", note: "Rack, WebSocket, LLM integration" },
      { name: "C++", note: "ESP32 embedded audio" },
    ],
  },
];
```

---

## Component List [CHANGED — adjusted to project reality]

### Required

```
Header
MobileNavigation
Hero
SectionHeading
ProjectCard
FeaturedProjectCard (main slot — Moveo Filmes)
TechStackGrid
TechStackCategory
LabPreviewCard         [ADDED — for lab section]
HardwareCard           [ALREADY EXISTS in src/components/sections/hardware/]
PrincipleCard
ContactSection
Footer
Button
ExternalLink
Tag
LocaleSwitcher         [ADDED — PT/EN toggle, already implied by i18n]
AnimatedWrapper
```

### Optional

```
ProjectGallery
ProjectMeta
CaseStudySection
CopyEmailButton
ScrollIndicator
HardwareGallery
LabExperimentGrid
```

---

## Page Routes [CHANGED]

### Required

```
/[locale]/                    ← homepage
/[locale]/projects/           ← all projects grid
/[locale]/projects/[slug]     ← case study (slug = project id)
/[locale]/about/              ← about page (already exists)
/[locale]/contact/            ← contact page (already exists)
/[locale]/hardware/           ← hardware page (already exists)
/lab                          ← lab index (outside locale tree)
/lab-phase-[n]                ← individual lab routes (outside locale tree)
```

### Optional

```
/resume
```

---

## SEO Requirements

- Homepage title: `Clayton Borges — Creative / Full-Stack Developer`
- Homepage description: pulled from i18n `about_preview.body`
- OG metadata per page (localized)
- Project case study metadata: `[Project Name] — Clayton Borges`
- Descriptive, meaningful descriptions for each project
- Semantic HTML sections with proper heading hierarchy
- Alt text for all project images and lab previews
- Lab routes: title and description per phase

---

## Accessibility Requirements

- Semantic HTML (`<section>`, `<article>`, `<nav>`, `<main>`)
- Keyboard-accessible navigation including locale switcher
- Accessible buttons and links (labels on icon-only buttons)
- Visible focus states
- Alt text on project images, lab previews, hardware images
- Proper heading order (h1 → h2 → h3)
- Sufficient contrast in both light and dark themes [ADDED — if theming exists]
- `prefers-reduced-motion` considered in GSAP and p5 animations [ADDED]

---

## Animation Requirements

Use GSAP + Lenis (already in project) for main site. p5.js for lab routes.

Animations applied to:
- Hero section entrance
- Section reveals on scroll
- Project cards (hover, reveal)
- CTA interactions
- Lab previews (subtle idle animation or on-hover activation)
- Mobile menu transitions

Animations must not:
- Block initial content visibility
- Harm mobile usability
- Override `prefers-reduced-motion`
- Make text hard to read

---

## Final Checklist [CHANGED]

### Content

- [ ] Hero includes name, role, description, CTAs, and links (GitHub, LinkedIn, Instagram, DISCLAYMER)
- [ ] Featured projects section has 4 projects (Moveo, MzPrime, Metanova, DSRPTV)
- [ ] Moveo Filmes is visually prioritized as main project
- [ ] Record Label Manager is NOT included (it is not in the project data) [CHANGED]
- [ ] Each project card has tech, highlights, and type
- [ ] About section reflects DISCLAYMER studio and full Python/Ruby experience
- [ ] Tech stack includes Three.js, WebGL, GSAP, FastAPI, Supabase, Redis, etc.
- [ ] The Lab section is present with 4–6 phase previews
- [ ] Hardware section present (ESP32 Synthesizer)
- [ ] How I Work has 5 principles including Creative Craft
- [ ] Contact has email, GitHub, LinkedIn, Instagram, DISCLAYMER

### Development

- [ ] All text via i18n keys (no hardcoded EN/PT strings in components)
- [ ] Project data centralized in `src/lib/data/projects.ts`
- [ ] `highlights[]` and case study fields added to Project type
- [ ] Stack data in `src/data/stack.ts`
- [ ] Lab experiment metadata in `src/data/experiments.ts`
- [ ] Navigation data centralized
- [ ] Components are reusable
- [ ] Dynamic project pages work
- [ ] Hardware section handles empty array gracefully
- [ ] External links work and open in new tab

### UX/UI

- [ ] Homepage sections follow the correct order
- [ ] Moveo Filmes card is visually dominant
- [ ] Lab section is clearly distinct from regular projects
- [ ] Layout works on mobile and desktop
- [ ] GSAP animations applied appropriately
- [ ] `prefers-reduced-motion` respected

### SEO / Accessibility

- [ ] Metadata on all pages
- [ ] Localized metadata (EN/PT)
- [ ] Images have alt text
- [ ] Buttons and links are accessible
- [ ] Heading hierarchy is correct
- [ ] Keyboard navigation works

### Production

- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No broken routes
- [ ] No console errors
- [ ] All lab routes load correctly
- [ ] Both locales work (`/en/` and `/pt/`)
- [ ] Deployed version works

---

## Notes on What Was Removed from Original Skeleton

| Removed | Reason |
|---------|--------|
| "Record Label Manager" as main project | Does not exist in `projects.ts`. Replaced by Moveo Filmes. |
| "Brief experience with Python/Ruby" framing | Both have shipped, real projects. Reframed as production experience. |
| Generic stack (no Three.js, no GSAP, no FastAPI, etc.) | The real stack is significantly broader and more interesting. |
| Creative Experiments as optional/hidden | The lab (27 phases) is the portfolio's signature piece — always shown. |
| Hardware section missing entirely | `hardware.ts` exists with full data. Added as required section. |
| No bilingual architecture mentioned | The project has PT/EN i18n as a core architectural decision. |
| "Dashboard, SaaS, or admin-style" project type vague | Now mapped to Metanova Labs specifically. |
| DISCLAYMER not mentioned | Key studio context — relevant to freelance clients. |
