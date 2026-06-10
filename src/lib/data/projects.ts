export type ProjectCategory =
  | "3d-visualization"
  | "web-app"
  | "platform"
  | "ai-ml"
  | "audio"
  | "data-engineering"
  | "embedded"
  | "dashboard";

export interface Project {
  id: string;
  name: string;
  nameEn: string;
  namePt: string;
  descriptionEn: string;
  descriptionPt: string;
  type?: string;
  tech: string[];
  categories: ProjectCategory[];
  highlights?: string[];
  overview?: string;
  overviewPt?: string;
  problem?: string;
  problemPt?: string;
  goal?: string;
  goalPt?: string;
  role?: string[];
  rolePt?: string[];
  technicalDecisions?: string[];
  technicalDecisionsPt?: string[];
  learnings?: string[];
  learningsPt?: string[];
  status?: string;
  statusPt?: string;
  image?: string;
  gallery?: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  year: number;
  client?: string;
  grant?: string;
  grantPt?: string;
}

export const projects: Project[] = [
  // --- CLIENT WORK ---
  {
    id: "moveo-filmes",
    nameEn: "Moveo Filmes",
    namePt: "Moveo Filmes",
    name: "Moveo Filmes",
    type: "Full-Stack Client Platform / CMS",
    image: "/projects/MOVEO/moveo-hero.png",
    descriptionEn:
      "Bilingual full-stack platform and CMS for an independent film production company in Brasília. Features a dynamic film catalog organized by production stage, automatically generated film pages, an admin dashboard for full content control, and a cinematic interface built around horizontal grids and monochromatic structure.",
    descriptionPt:
      "Plataforma full-stack bilíngue e CMS para uma produtora de cinema independente em Brasília. Catálogo dinâmico de filmes organizado por fase de produção, páginas de filmes geradas automaticamente, dashboard admin para controle total do conteúdo e interface cinematográfica com grids horizontais e estrutura monocromática.",
    tech: ["Next.js 16", "React 19", "TypeScript", "Supabase", "PostgreSQL", "GSAP", "Lenis", "TipTap", "dnd-kit", "Tailwind CSS"],
    categories: ["platform", "web-app"],
    highlights: [
      "Bilingual full-stack platform built for an independent film production company in Brasília.",
      "Admin dashboard for adding, editing, reordering, and managing films dynamically.",
      "Database-driven film catalog with automatically generated pages for each new film.",
      "Cinematic interface using horizontal grids, monochromatic structure, and film-first visual hierarchy.",
      "Visual identity connected to Brasília through typography and layout decisions.",
    ],
    overview:
      "Moveo Filmes is a bilingual full-stack platform for an independent film production company based in Brasília. The film catalog is organized by production stage — production, post-production, distribution — and each new film added through the admin dashboard automatically generates its own public page with no code changes required. The interface is cinematic: horizontal grids, monochromatic structure, and film-first visual hierarchy.",
    overviewPt:
      "Moveo Filmes é uma plataforma full-stack bilíngue para uma produtora de cinema independente em Brasília. O catálogo de filmes é organizado por fase de produção — produção, pós-produção, distribuição — e cada novo filme adicionado pelo dashboard admin gera automaticamente sua própria página pública sem necessidade de alterações no código. A interface é cinematográfica: grids horizontais, estrutura monocromática e hierarquia visual centrada nos filmes.",
    problem:
      "A static institutional site was not enough. As a film production company, Moveo Filmes needed to present films at different stages of the production lifecycle — not just finished projects — requiring a flexible portfolio structure rather than a simple gallery. The client also needed full content autonomy: adding films and news without touching the codebase. A workflow connecting Instagram-driven news updates to the website's editorial structure was also required.",
    problemPt:
      "Um site institucional estático não era suficiente. Como produtora de cinema, a Moveo Filmes precisava apresentar filmes em diferentes fases do ciclo de produção — não apenas projetos finalizados — exigindo uma estrutura de portfólio flexível em vez de uma galeria simples. O cliente também precisava de autonomia total sobre o conteúdo: adicionar filmes e notícias sem tocar no código. Era necessário ainda um fluxo conectando atualizações de notícias do Instagram à estrutura editorial do site.",
    goal:
      "Build a bilingual full-stack platform with a dynamic film catalog organized by production stage, where each new film automatically generates its own public page. Give the client an admin dashboard for full content autonomy. Create a cinematic visual language connected to Brasília through typography and layout, while supporting news workflows tied to the company's social media presence.",
    goalPt:
      "Construir uma plataforma full-stack bilíngue com catálogo dinâmico de filmes organizado por fase de produção, onde cada novo filme gera automaticamente sua própria página pública. Dar ao cliente um dashboard admin para autonomia total sobre o conteúdo. Criar uma linguagem visual cinematográfica conectada a Brasília por meio de tipografia e layout, além de suportar fluxos de notícias vinculados à presença da empresa nas redes sociais.",
    role: ["Full-stack developer (solo contract)"],
    rolePt: ["Desenvolvedor full-stack (contrato solo)"],
    technicalDecisions: [
      "Data-driven film catalog architecture — admin writes to database, public site renders pages dynamically. Each new film submitted through the admin form automatically generates its own public page with no code changes required.",
      "Next.js 16 App Router for SSR — critical for film discovery SEO in a market where Google is the primary traffic source.",
      "Supabase RLS for row-level access control — editors can update their own content; only admins can publish or delete. Policies defined at schema level so security never leaks through app bugs.",
      "TipTap chosen over other rich text editors for its headless React architecture — fully controlled styling with no iframe isolation issues.",
      "dnd-kit for drag-and-drop ordering with optimistic state updates — server reconciliation on error so the UI never gets stuck in a wrong order.",
      "GSAP ScrollTrigger + Lenis for cinematic scroll feel — matching the aesthetic of a film production company without sacrificing performance.",
    ],
    technicalDecisionsPt: [
      "Arquitetura de catálogo de filmes orientada a dados — admin escreve no banco de dados, o site público renderiza as páginas dinamicamente. Cada novo filme enviado pelo formulário admin gera automaticamente sua própria página pública sem necessidade de alterações no código.",
      "Next.js 16 App Router com SSR — crítico para SEO de descoberta de filmes em um mercado onde o Google é a principal fonte de tráfego.",
      "Supabase RLS para controle de acesso por linha — editores podem atualizar seu próprio conteúdo; apenas admins podem publicar ou excluir. Políticas definidas no nível do schema para que a segurança nunca vaze por bugs do app.",
      "TipTap escolhido sobre outros editores de texto rico por sua arquitetura React headless — estilização totalmente controlada sem problemas de isolamento de iframe.",
      "dnd-kit para ordenação drag-and-drop com atualizações de estado otimistas — reconciliação no servidor em caso de erro para que a UI nunca fique presa em uma ordem errada.",
      "GSAP ScrollTrigger + Lenis para sensação cinematográfica de scroll — combinando com a estética de uma produtora de cinema sem sacrificar performance.",
    ],
    learnings: [
      "Supabase RLS policies require up-front schema design. Retrofitting permissions onto an existing schema is painful and error-prone — define the access model before writing any data layer code.",
      "dnd-kit optimistic state needs explicit reconciliation on server errors. A failed reorder that silently reverts to server state is far better than a UI that displays a wrong order indefinitely.",
      "Designing for client content autonomy requires thinking about the admin UX as carefully as the public site — a CMS that the client doesn't understand is as useless as one that doesn't exist.",
    ],
    learningsPt: [
      "As políticas de RLS do Supabase exigem design de schema antecipado. Reajustar permissões em um schema existente é trabalhoso e sujeito a erros — defina o modelo de acesso antes de escrever qualquer código da camada de dados.",
      "O estado otimista do dnd-kit precisa de reconciliação explícita em erros do servidor. Um reordenamento que falha silenciosamente e volta ao estado do servidor é muito melhor que uma UI que exibe uma ordem errada indefinidamente.",
      "Projetar para a autonomia de conteúdo do cliente exige pensar no UX do admin com o mesmo cuidado que o site público — um CMS que o cliente não entende é tão inútil quanto um que não existe.",
    ],
    status: "Delivered and live",
    statusPt: "Entregue e no ar",
    featured: true,
    year: 2025,
    client: "Moveo Filmes",
  },
  {
    id: "mzprime-3d-showcase",
    nameEn: "Vitrine 3D – Car Cover Showroom",
    namePt: "Vitrine 3D – Showroom de Capas",
    name: "Vitrine 3D – Car Cover Showroom",
    type: "3D Interactive Showroom",
    image: "/projects/Vitrine_3D/vitrine3d-hero.png",
    descriptionEn:
      "Real-time 3D configurator for customizable luxury vehicle covers. Users change cover color, stitching color, vehicle category, and apply uploaded PNG logos to predefined placement spots on the model — all without reloading full model variations. Browser-optimized for a lightweight interactive showroom experience.",
    descriptionPt:
      "Configurador 3D em tempo real para capas de veículos de luxo personalizáveis. Os usuários alteram cor da capa, cor da costura, categoria do veículo e aplicam logotipos PNG enviados em áreas predefinidas do modelo — sem recarregar variações completas do modelo. Otimizado para uma experiência leve e interativa no navegador.",
    tech: ["Next.js 16", "React 19", "Three.js", "React Three Fiber", "Tailwind CSS"],
    categories: ["3d-visualization", "web-app"],
    highlights: [
      "Real-time 3D configurator for customizable luxury vehicle covers.",
      "Instant updates for cover color, stitching color, vehicle type, and logo placement.",
      "PNG logo upload system applied directly to predefined spots on the 3D model.",
      "Three.js material, shader, and texture updates without reloading full model variations.",
      "Optimized browser performance for a lightweight interactive showroom experience.",
    ],
    overview:
      "Vitrine 3D is an interactive 3D showroom for luxury custom vehicle covers. Users customize cover color, stitching color, vehicle category, and logo placement in real time — without reloading models for every configuration change. Predefined logo placement spots let customers upload a PNG and see it applied directly on the 3D cover, keeping the experience lightweight and immediately responsive in the browser.",
    overviewPt:
      "Vitrine 3D é um showroom 3D interativo para capas de veículos de luxo personalizadas. Os usuários personalizam cor da capa, cor da costura, categoria do veículo e posicionamento de logo em tempo real — sem recarregar modelos a cada mudança de configuração. Áreas predefinidas para logos permitem que os clientes façam upload de um PNG e vejam ele aplicado diretamente na capa 3D, mantendo a experiência leve e imediatamente responsiva no navegador.",
    problem:
      "Loading separate pre-rendered models for every customization variation — each cover color, stitching color, or vehicle type — creates loading interruptions that break the experience. For a luxury configurator where customers test many combinations quickly, any delay or loading screen destroys the sense of immediacy the product demands.",
    problemPt:
      "Carregar modelos pré-renderizados separados para cada variação de personalização — cada cor de capa, cor de costura ou tipo de veículo — gera interrupções de carregamento que quebram a experiência. Para um configurador de luxo onde os clientes testam muitas combinações rapidamente, qualquer atraso ou tela de carregamento destrói a sensação de imediatismo que o produto exige.",
    goal:
      "Build a browser-based 3D showroom where all customization — cover color, stitching color, vehicle category, and logo placement — happens through real-time material and shader mutations with no model reloads. Support multiple vehicle categories with predefined UV-mapped logo placement spots, so customers can upload a PNG and apply it directly to the 3D cover.",
    goalPt:
      "Construir um showroom 3D no navegador onde toda a personalização — cor da capa, cor da costura, categoria do veículo e posicionamento de logo — aconteça por meio de mutações em tempo real de materiais e shaders, sem recarregar modelos. Suportar múltiplas categorias de veículos com áreas predefinidas mapeadas em UV para logos, para que os clientes possam fazer upload de um PNG e aplicá-lo diretamente na capa 3D.",
    role: ["Frontend and 3D developer (Evolut Digital client)"],
    rolePt: ["Desenvolvedor frontend e 3D (cliente Evolut Digital)"],
    technicalDecisions: [
      "Predefined logo placement spots defined at model level — each vehicle category specifies UV-mapped regions where logos can appear. The user selects a spot, uploads a PNG, and the system composites it as a CanvasTexture into that exact UV region.",
      "One rigged GLB per vehicle category — rigging at the model level means one material swap changes the entire cover appearance, not dozens of texture variants.",
      "Three.js MeshStandardMaterial for real-time color changes — physically-based rendering makes fabric colours look accurate under the scene lighting without baking.",
      "Dynamic CanvasTexture for logo upload — the customer's image is drawn onto an HTML canvas that Three.js uses as a live texture, no server roundtrip needed.",
      "React Three Fiber for component architecture — wrapping Three.js objects as React components makes the configurator state (color selection, logo upload) easy to wire to the UI.",
    ],
    technicalDecisionsPt: [
      "Áreas predefinidas para logo definidas no nível do modelo — cada categoria de veículo especifica regiões mapeadas em UV onde os logos podem aparecer. O usuário seleciona uma área, faz upload de um PNG e o sistema o compõe como CanvasTexture exatamente nessa região UV.",
      "Um GLB rigado por categoria de veículo — o rigging no nível do modelo significa que uma troca de material muda toda a aparência da capa, não dezenas de variantes de textura.",
      "Three.js MeshStandardMaterial para mudanças de cor em tempo real — a renderização baseada em física faz as cores do tecido parecerem precisas sob a iluminação da cena sem baking.",
      "CanvasTexture dinâmica para upload de logotipo — a imagem do cliente é desenhada em um canvas HTML que o Three.js usa como textura ao vivo, sem necessidade de roundtrip ao servidor.",
      "React Three Fiber para arquitetura de componentes — envolver objetos Three.js como componentes React torna fácil conectar o estado do configurador (seleção de cor, upload de logo) à UI.",
    ],
    learnings: [
      "Logo texture projection requires precise UV island positioning during 3D modelling — this is a design constraint that cannot be fixed in code after the fact. Define UV requirements before the models are made.",
      "GLB file size is the primary performance constraint, not render cost. Geometry optimisation and texture compression matter far more than draw call count for a single-model configurator.",
      "The 'no reload' constraint requires deciding upfront that all customization states must be achievable through material and shader mutations alone — this is an architectural decision that cannot be easily retrofitted once models are rigged.",
    ],
    learningsPt: [
      "A projeção de textura de logotipo requer posicionamento preciso das ilhas UV durante a modelagem 3D — isso é uma restrição de design que não pode ser corrigida no código depois. Defina os requisitos de UV antes de criar os modelos.",
      "O tamanho do arquivo GLB é a principal restrição de performance, não o custo de renderização. Otimização de geometria e compressão de textura importam muito mais do que a contagem de draw calls para um configurador de modelo único.",
      "A restrição de 'sem reload' exige decidir desde o início que todos os estados de personalização devem ser alcançáveis apenas por meio de mutações de materiais e shaders — esta é uma decisão arquitetural que não pode ser facilmente reajustada depois que os modelos estão rigados.",
    ],
    status: "Delivered and live",
    statusPt: "Entregue e no ar",
    liveUrl: "https://claytonbrgsdev.github.io/mz-prime/",
    featured: true,
    year: 2025,
    client: "Evolut Digital",
  },
  {
    id: "metanova-labs",
    nameEn: "Metanova Labs – Bittensor Dashboard",
    namePt: "Metanova Labs – Dashboard Bittensor",
    name: "Metanova Labs",
    type: "Data Dashboard / Product",
    descriptionEn:
      "Dashboard for Bittensor subnet 68 — an on-chain AI drug-discovery network. Implemented the Algorithms tab frontend/backend integration. Tracks molecular competitions, miner leaderboards, and protein data across epochs.",
    descriptionPt:
      "Dashboard para a subnet 68 do Bittensor — uma rede de descoberta de medicamentos por IA on-chain. Implementou a aba Algorithms com integração frontend/backend. Rastreia competições moleculares, rankings de mineradores e dados de proteínas por época.",
    tech: ["Next.js 15", "TypeScript", "Bittensor", "Radix UI"],
    categories: ["dashboard", "web-app"],
    highlights: [
      "Algorithms tab with full frontend/backend integration",
      "Molecular competition tracking per epoch on Bittensor subnet 68",
      "Miner leaderboard and protein data visualisation",
      "Strict TypeScript typing for Bittensor chain data shapes",
      "Radix UI primitives for accessible, unstyled base components",
    ],
    overview:
      "Metanova Labs is a dashboard for Bittensor subnet 68 — an on-chain AI drug-discovery network where miners compete to produce the best molecular candidates for protein binding. My contribution was the Algorithms tab, which gives researchers a human-readable view of competition results, miner rankings, and protein data across epochs.",
    overviewPt:
      "Metanova Labs é um dashboard para a subnet 68 do Bittensor — uma rede de descoberta de medicamentos por IA on-chain onde os mineradores competem para produzir os melhores candidatos moleculares para ligação de proteínas. Minha contribuição foi a aba Algorithms, que fornece aos pesquisadores uma visão legível dos resultados de competições, rankings de mineradores e dados de proteínas por época.",
    problem:
      "Subnet 68 had no dedicated UI. All data lived on-chain and in raw API endpoints — accessible only to developers who could read JSON responses and understand Bittensor's epoch-indexed data model. Researchers had no way to track competition progress or compare miner performance without writing code.",
    problemPt:
      "A subnet 68 não tinha UI dedicada. Todos os dados ficavam on-chain e em endpoints de API brutos — acessíveis apenas a desenvolvedores que pudessem ler respostas JSON e entender o modelo de dados indexado por época do Bittensor. Pesquisadores não tinham como acompanhar o progresso das competições ou comparar o desempenho dos mineradores sem escrever código.",
    goal:
      "Implement the Algorithms tab with full frontend/backend integration — molecular competition tracking, miner leaderboards, and protein data display per epoch — in a way that works reliably against live Bittensor chain data.",
    goalPt:
      "Implementar a aba Algorithms com integração completa frontend/backend — rastreamento de competições moleculares, rankings de mineradores e exibição de dados de proteínas por época — de forma que funcione de maneira confiável com dados ao vivo da chain Bittensor.",
    role: ["Frontend developer, API integration (client work)"],
    rolePt: ["Desenvolvedor frontend, integração de API (trabalho para cliente)"],
    technicalDecisions: [
      "Next.js 15 with SSR for the Algorithms tab — epoch data is relatively stable within a window, so server-rendering reduces client bundle size and improves first-load performance for researcher workflows.",
      "Strict TypeScript typing for all Bittensor API response shapes — the chain data is complex and partially undocumented; defensive types with runtime validation caught several shape changes during development.",
      "Radix UI primitives for accessible base components — the dashboard needed to be screen-reader accessible for researchers who use assistive tools; Radix handles keyboard navigation and ARIA out of the box.",
      "Epoch-keyed request deduplication — multiple tab renders requesting the same epoch do one fetch; subsequent renders serve from cache until the epoch advances.",
    ],
    technicalDecisionsPt: [
      "Next.js 15 com SSR para a aba Algorithms — os dados de época são relativamente estáveis dentro de uma janela, então a renderização no servidor reduz o tamanho do bundle do cliente e melhora a performance de primeiro carregamento para fluxos de pesquisadores.",
      "Tipagem TypeScript estrita para todos os formatos de resposta da API Bittensor — os dados da chain são complexos e parcialmente não documentados; tipos defensivos com validação em tempo de execução detectaram várias mudanças de formato durante o desenvolvimento.",
      "Primitivos Radix UI para componentes base acessíveis — o dashboard precisava ser acessível por leitores de tela para pesquisadores que usam ferramentas assistivas; o Radix lida com navegação por teclado e ARIA nativamente.",
      "Deduplicação de requisições por chave de época — múltiplas renderizações de aba solicitando a mesma época fazem um único fetch; renderizações subsequentes servem do cache até que a época avance.",
    ],
    learnings: [
      "Blockchain data is append-only and epoch-indexed — standard REST pagination patterns (page/offset) don't apply. Epoch-keyed caching is the right mental model, not cursor-based pagination.",
      "Data shapes in active Bittensor subnets change between versions without notice. Defensive parsing with explicit fallback values is not paranoia — it's the baseline.",
    ],
    learningsPt: [
      "Dados de blockchain são append-only e indexados por época — padrões de paginação REST padrão (page/offset) não se aplicam. Cache por chave de época é o modelo mental correto, não paginação baseada em cursor.",
      "Formatos de dados em subnets Bittensor ativas mudam entre versões sem aviso. Parsing defensivo com valores de fallback explícitos não é paranoia — é a linha de base.",
    ],
    status: "Delivered — live in production",
    statusPt: "Entregue — no ar em produção",
    liveUrl: "https://metanovalabs.ai/dashboard",
    featured: true,
    year: 2025,
    client: "Metanova Labs",
  },
  {
    id: "dsrptv-records",
    nameEn: "DSRPTV Records – Music Platform",
    namePt: "DSRPTV Records – Plataforma de Música",
    name: "DSRPTV Records",
    type: "Creative Commerce Platform",
    descriptionEn:
      "Music e-commerce and streaming platform. Stripe + Mercado Pago dual checkout, Spotify API, AWS S3 asset storage, Three.js visuals. Built with Raphael Palmer (DISCLAYMER).",
    descriptionPt:
      "Plataforma de e-commerce e streaming musical. Checkout duplo Stripe + Mercado Pago, Spotify API, armazenamento AWS S3, visuais Three.js. Construído com Raphael Palmer (DISCLAYMER).",
    tech: ["React", "TypeScript", "Vite", "Three.js", "Firebase", "AWS S3", "Stripe", "Mercado Pago"],
    categories: ["platform", "web-app"],
    highlights: [
      "Dual-market checkout: Stripe (international) + Mercado Pago (Brazil)",
      "Spotify API integration for streaming and catalogue sync",
      "AWS S3 asset storage with signed URL delivery",
      "Three.js visuals for product pages and visual identity",
      "Built with Raphael Palmer at DISCLAYMER studio",
    ],
    overview:
      "DSRPTV Records is a music e-commerce and streaming platform for an independent Brazilian record label. It lets fans buy and stream music through a single experience — handling both Brazilian and international payment flows, audio asset delivery, and a distinctive Three.js visual identity that reflects the label's aesthetic.",
    overviewPt:
      "DSRPTV Records é uma plataforma de e-commerce e streaming musical para uma gravadora independente brasileira. Permite que os fãs comprem e ouçam música em uma única experiência — gerenciando fluxos de pagamento brasileiro e internacional, entrega de assets de áudio e uma identidade visual Three.js distintiva que reflete a estética da gravadora.",
    problem:
      "The label needed to monetise their catalogue directly — without splitting revenue with distributors — while reaching both Brazilian and international audiences. No existing off-the-shelf platform supported dual-currency checkout with Spotify integration and a custom visual identity.",
    problemPt:
      "A gravadora precisava monetizar seu catálogo diretamente — sem dividir receita com distribuidoras — enquanto alcançava públicos brasileiros e internacionais. Nenhuma plataforma pronta existente suportava checkout de dupla moeda com integração Spotify e identidade visual personalizada.",
    goal:
      "Build a complete music commerce platform with streaming, digital purchases, dual-payment checkout, and a visual identity strong enough to function as a standalone brand experience.",
    goalPt:
      "Construir uma plataforma completa de comércio musical com streaming, compras digitais, checkout de pagamento duplo e uma identidade visual forte o suficiente para funcionar como experiência de marca independente.",
    role: [
      "Co-developer with Raphael Palmer (DISCLAYMER studio)",
      "Frontend, Three.js visuals, payment integration",
    ],
    rolePt: [
      "Co-desenvolvedor com Raphael Palmer (estúdio DISCLAYMER)",
      "Frontend, visuais Three.js, integração de pagamento",
    ],
    technicalDecisions: [
      "Stripe for international payments, Mercado Pago for Brazil — both with webhook-verified purchase fulfillment. A shared purchase event model normalises both providers into a single fulfilment flow, so downstream audio delivery doesn't care which gateway fired.",
      "Spotify API for catalogue sync and embedded playback — keeping the in-platform listening experience consistent with what fans already know, rather than building a custom audio player from scratch.",
      "AWS S3 with signed URL delivery for purchased audio files — time-limited URLs mean purchased files cannot be shared or hotlinked after the window expires.",
      "Three.js for visual identity — the label's aesthetic is central to the product, not an afterthought. WebGL allowed motion and depth that static CSS could not achieve.",
    ],
    technicalDecisionsPt: [
      "Stripe para pagamentos internacionais, Mercado Pago para o Brasil — ambos com confirmação de compra por webhook. Um modelo de evento de compra compartilhado normaliza os dois provedores em um único fluxo de fulfillment, para que a entrega de áudio downstream não dependa de qual gateway disparou.",
      "Spotify API para sincronização de catálogo e reprodução incorporada — mantendo a experiência de escuta dentro da plataforma consistente com o que os fãs já conhecem, em vez de construir um player de áudio personalizado do zero.",
      "AWS S3 com entrega por URL assinada para arquivos de áudio comprados — URLs com tempo limitado significam que os arquivos comprados não podem ser compartilhados ou hotlinkados após o vencimento.",
      "Three.js para identidade visual — a estética da gravadora é central para o produto, não um detalhe. WebGL permitiu movimento e profundidade que o CSS estático não poderia alcançar.",
    ],
    learnings: [
      "Dual payment providers means dual webhook handlers. The critical insight is to normalise both into a provider-agnostic purchase event as early as possible — downstream fulfillment (audio delivery, DB write) should never contain if-Stripe / if-MercadoPago branches.",
      "Spotify embed tokens expire silently. Without a proactive refresh mechanism, playback breaks mid-session. Silent background token refresh triggered before expiry is table stakes for Spotify-integrated apps.",
    ],
    learningsPt: [
      "Dois provedores de pagamento significam dois handlers de webhook. O insight crítico é normalizar os dois em um evento de compra agnóstico de provedor o mais cedo possível — o fulfillment downstream (entrega de áudio, escrita no DB) nunca deve conter ramificações if-Stripe / if-MercadoPago.",
      "Os tokens de embed do Spotify expiram silenciosamente. Sem um mecanismo de atualização proativo, a reprodução quebra no meio da sessão. A atualização silenciosa de token em segundo plano, acionada antes da expiração, é o mínimo necessário para apps integrados ao Spotify.",
    ],
    status: "Live",
    statusPt: "No ar",
    liveUrl: "http://dsrptvrec.com",
    featured: true,
    year: 2023,
    client: "DSRPTV Records",
  },
  // --- PERSONAL / OPEN SOURCE PROJECTS ---
  {
    id: "gio-study-scheduler",
    nameEn: "Gio – Intelligent ENEM Study Scheduler",
    namePt: "Gio – Agendador de Estudos Inteligente para o ENEM",
    name: "Gio",
    type: "Full-Stack Web Application / AI-Powered Study Tool",
    descriptionEn:
      "Adaptive study scheduler with spaced repetition (D+1, D+4, D+11, D+25), dynamic priority calculation, and intelligent task redistribution powered by OpenAI. Built for a real ENEM student.",
    descriptionPt:
      "Agendador de estudos adaptativo com repetição espaçada (D+1, D+4, D+11, D+25), cálculo dinâmico de prioridades e redistribuição inteligente de tarefas com OpenAI. Construído para uma aluna real do ENEM.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Node.js", "Express 5", "Supabase", "PostgreSQL", "OpenAI API", "Tailwind CSS 4", "Headless UI"],
    categories: ["ai-ml", "web-app"],
    highlights: [
      "Multi-factor priority score: difficulty × ENEM frequency × (5 − confidence) × days-since-studied",
      "AI schedule reorganization: GPT-4o-mini rebuilds the next 7 days each night at 23:30 via node-cron",
      "Spaced repetition intervals shorten when confidence is low (D+1, D+2, D+5, D+12) vs. high (D+1, D+4, D+11, D+25)",
      "Focus of the Day — single highest-priority topic surfaced as a daily decision aid",
      "Five task types: Study, Exercise, Review, Simulation — each with different default durations and frequency rules",
    ],
    overview:
      "Gio is an AI-powered study scheduler built for a real student preparing for the ENEM (Brazil's national college entrance exam). Rather than a linear checklist, it uses a multi-factor priority algorithm to decide what to study each day across 45+ topics, automatically reorganizes the schedule every night using GPT-4o-mini, and enforces spaced repetition based on self-reported confidence. The student sets a target exam date and available study hours; Gio distributes all topics to the deadline and adapts daily.",
    overviewPt:
      "Gio é um agendador de estudos com IA criado para uma aluna real se preparando para o ENEM. Em vez de uma lista linear, ele usa um algoritmo de prioridade multi-fator para decidir o que estudar a cada dia entre 45+ tópicos, reorganiza o cronograma automaticamente toda noite via GPT-4o-mini, e aplica repetição espaçada baseada na autoavaliação de confiança. A aluna define a data do exame e as horas disponíveis; o Gio distribui todos os tópicos até o prazo e se adapta diariamente.",
    problem:
      "ENEM preparation spans months and dozens of subjects with wildly different difficulty levels and historical exam frequencies. Most students either follow a rigid linear plan (which ignores what they've already mastered) or study reactively (whatever feels hardest today). Neither approach optimizes the time-to-score ratio. A custom solution was needed that could reason about difficulty, frequency, confidence, and recency simultaneously — and recover gracefully when the student skips a day.",
    problemPt:
      "A preparação para o ENEM abrange meses e dezenas de disciplinas com dificuldades e frequências históricas muito diferentes. A maioria dos alunos segue um plano linear rígido (que ignora o que já dominam) ou estuda reativamente. Nenhuma abordagem otimiza a relação tempo-nota. Era necessária uma solução que raciocine sobre dificuldade, frequência, confiança e recência ao mesmo tempo — e se recupere quando a aluna pula um dia.",
    goal:
      "Build a two-service application (Next.js frontend + Express backend) that: (1) computes a daily priority-ranked study list; (2) surfaces a single 'Focus of the Day' topic; (3) tracks confidence per topic after each session; (4) rebuilds the upcoming week's schedule automatically every night with GPT-4o-mini; (5) visualizes progress via weekly planner and calendar heatmap.",
    goalPt:
      "Construir uma aplicação de dois serviços (frontend Next.js + backend Express) que: (1) calcule uma lista diária priorizada de estudos; (2) apresente um único tópico 'Foco do Dia'; (3) rastreie confiança por tópico após cada sessão; (4) reconstrua automaticamente o cronograma da semana toda noite com GPT-4o-mini; (5) visualize o progresso via planejador semanal e heatmap de calendário.",
    role: ["Solo developer — architecture, frontend, backend, database, AI integration"],
    rolePt: ["Desenvolvedor solo — arquitetura, frontend, backend, banco de dados, integração IA"],
    technicalDecisions: [
      "Multi-factor priority score — score = difficulty_weight + enem_frequency_weight + (5 − avg_confidence) × 0.6 + days_since_studied × 0.1. Four independent signals blended into one number: prevents starvation of medium-difficulty but high-frequency topics that a pure difficulty ranking would deprioritize.",
      "GPT-4o-mini for nightly reorganization — implementing a custom constraint-satisfaction algorithm (3 tasks/day, ≤195 min total, balanced disciplines) is hard to maintain. GPT-4o-mini reasons about all constraints in natural language, outputs a structured JSON schedule, and explains its reasoning. Temperature 0.2 keeps output consistent; JSON-mode forces parseable responses.",
      "node-cron at 23:30 for automatic reorganization — students don't check the app at end of day. A server-side cron rebuilds the next 7 days each night so the student wakes up to a realistic schedule that already accounts for what was and wasn't completed.",
      "Supabase (São Paulo region) as the database — no DevOps required, RLS available, real-time subscriptions ready for future features. Regional choice minimizes latency for Brazilian users.",
      "Separate frontend/backend repos — Next.js App Router on Vercel, Express on a separate host. Enables independent scaling and avoids cold-start latency on the Node backend from serverless constraints.",
      "Confidence (0–5) as the central state metric — most study apps track completion (binary). Confidence captures nuance: a student can 'complete' a session but feel 2/5 confident. Spaced repetition intervals shorten when confidence is low, ensuring weak topics revisited more aggressively.",
      "Focus of the Day as a decision-relief feature — when overwhelmed, students need one clear answer. The API calculates the single highest-priority topic and surfaces it prominently, reducing decision paralysis and increasing adherence.",
    ],
    technicalDecisionsPt: [
      "Score de prioridade multi-fator — score = difficulty_weight + enem_frequency_weight + (5 − avg_confidence) × 0.6 + days_since_studied × 0.1. Quatro sinais independentes combinados em um número: evita que tópicos de dificuldade média mas alta frequência no ENEM sejam despriorizados por um ranking puramente por dificuldade.",
      "GPT-4o-mini para reorganização noturna — implementar um algoritmo de satisfação de restrições (3 tarefas/dia, ≤195 min total, disciplinas balanceadas) é difícil de manter. O GPT-4o-mini raciocina sobre todas as restrições em linguagem natural, produz um cronograma JSON estruturado e explica o raciocínio. Temperature 0.2 mantém saída consistente; JSON-mode força respostas parseáveis.",
      "node-cron às 23:30 para reorganização automática — alunos não verificam o app no fim do dia. Um cron server-side reconstrói os próximos 7 dias toda noite para que a aluna acorde com um cronograma realista que já considera o que foi e não foi feito.",
      "Supabase (região São Paulo) como banco de dados — sem necessidade de DevOps, RLS disponível, subscriptions em tempo real prontas para features futuras. A escolha regional minimiza latência para usuários brasileiros.",
      "Frontend/backend separados — Next.js App Router na Vercel, Express em host separado. Permite escalar independentemente e evita latência de cold-start no backend Node com restrições serverless.",
      "Confiança (0–5) como métrica central — a maioria dos apps rastreia conclusão (binário). Confiança captura nuances: uma aluna pode 'completar' uma sessão mas sentir confiança 2/5. Os intervalos de repetição espaçada diminuem quando a confiança é baixa, garantindo revisitas mais frequentes em tópicos fracos.",
      "Foco do Dia como alívio de decisão — quando sobrecarregada, a aluna precisa de uma resposta clara. A API calcula o tópico de maior prioridade e o apresenta de forma proeminente, reduzindo a paralisia decisória e aumentando a adesão.",
    ],
    learnings: [
      "AI reorganization must be designed for failure modes: GPT-4o-mini occasionally omits topics or produces malformed JSON. A local fallback algorithm (pure priority score, no AI) runs when the API fails or returns invalid output — the student always gets a schedule.",
      "Confidence as state is more honest than completion: the two-week beta showed students marking tasks complete at confidence 2/5 frequently. Adding a mandatory confidence rating after each session changed behavior — students started revisiting topics they thought they'd 'finished'.",
      "node-cron in a long-running Express process is simpler than serverless scheduled functions for this use case: one less deployment target, no cold-start delay on the nightly job, and the reorganization context (previous days' tasks) is already in memory.",
      "Supabase RLS should be designed upfront: disabling it for development and retrofitting it later caused a schema refactor. The lesson is to model row-level access alongside the data model, not after it.",
    ],
    learningsPt: [
      "A reorganização com IA deve ser desenhada para modos de falha: o GPT-4o-mini ocasionalmente omite tópicos ou produz JSON malformado. Um algoritmo de fallback local (score de prioridade puro, sem IA) roda quando a API falha ou retorna saída inválida — a aluna sempre recebe um cronograma.",
      "Confiança como estado é mais honesto que conclusão: o beta de duas semanas mostrou alunos marcando tarefas como concluídas com confiança 2/5 frequentemente. Adicionar uma avaliação de confiança obrigatória após cada sessão mudou o comportamento — eles passaram a revisar tópicos que achavam que já 'terminaram'.",
      "node-cron em um processo Express de longa duração é mais simples que funções serverless agendadas para este caso: um destino de deploy a menos, sem cold-start no job noturno, e o contexto de reorganização já está em memória.",
      "O RLS do Supabase deve ser projetado desde o início: desativá-lo no desenvolvimento e retroativamente aplicá-lo causou um refactor de schema. A lição é modelar o acesso por linha junto com o modelo de dados, não depois.",
    ],
    status: "Functional — used by a real student for active ENEM preparation",
    statusPt: "Funcional — usado por uma aluna real em preparação ativa para o ENEM",
    featured: false,
    year: 2025,
  },
  {
    id: "asa-player",
    nameEn: "ASA Player – ASCII Music Visualizer",
    namePt: "ASA Player – Visualizador de Música ASCII",
    name: "ASA Player",
    type: "Creative Web Application / Audio Visualization",
    descriptionEn:
      "Retro music player with a real-time 140×16 ASCII spectrum analyzer, adaptive quality system, VU meters, oscilloscope, and glitch visual effects — all built with Web Audio API and Next.js.",
    descriptionPt:
      "Player de música retrô com analisador de espectro ASCII 140×16 em tempo real, sistema de qualidade adaptativo, medidores VU, osciloscópio e efeitos visuais glitch — tudo construído com Web Audio API e Next.js.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Web Audio API", "Tailwind CSS", "Radix UI"],
    categories: ["audio", "web-app"],
    highlights: [
      "Logarithmic frequency mapping to 140 ASCII columns respects human hearing perception (20Hz–22kHz)",
      "Adaptive quality system monitors FPS/CPU/memory in real time and auto-degrades FFT size from 512 to 64 bins",
      "5 visualization modes sharing one AudioContext: ASCII analyzer, VU/PPM meters, oscilloscope, circular visualizer, terminal file browser",
      "Glitch aesthetic layer (scanlines, RGB shift, static noise) runs on a separate decoupled render loop",
      "Audio streams from cloud-hosted AZULBIC label catalog with crossOrigin anonymous for CORS-safe Web Audio analysis",
    ],
    overview:
      "ASA Player is a retro-styled music player that renders real-time audio analysis as an ASCII spectrum on a 140×16 character grid, inspired by vintage hardware analyzers. It streams tracks from a record label catalog, analyzes frequency data with the Web Audio API, and maps FFT bins to ASCII characters logarithmically — matching how human hearing actually perceives pitch. Five distinct visualization modes share one AudioContext, with a glitch aesthetic overlay that runs independently from the audio loop.",
    overviewPt:
      "ASA Player é um player de música com estética retrô que renderiza análise de áudio em tempo real como um espectro ASCII em uma grade de 140×16 caracteres, inspirado em analisadores de hardware vintage. Transmite faixas de um catálogo de label musical, analisa dados de frequência com a Web Audio API, e mapeia bins FFT para caracteres ASCII de forma logarítmica — correspondendo à forma como o ouvido humano realmente percebe altura. Cinco modos de visualização distintos compartilham um AudioContext, com uma camada de efeitos glitch independente do loop de áudio.",
    problem:
      "Existing web music players display either no visualizer or generic canvas-based bar charts that all look the same. The goal was to build a player with a strong, distinctive aesthetic — retro ASCII art combined with real-time audio analysis — without sacrificing technical correctness. Frequency visualization on the web typically uses linear frequency mapping, which wastes column space on inaudible high frequencies and compresses the musically important bass range. The project needed a solution that matched human hearing perception.",
    problemPt:
      "Players de música web existentes mostram ou nenhum visualizador ou gráficos genéricos de barras em canvas que parecem todos iguais. O objetivo era construir um player com uma estética forte e distinta — arte ASCII retrô combinada com análise de áudio em tempo real — sem sacrificar a correção técnica. A visualização de frequências na web geralmente usa mapeamento linear, que desperdiça colunas em frequências inaudíveis e comprime a faixa de graves musicalmente importante. O projeto precisava de uma solução que correspondesse à percepção auditiva humana.",
    goal:
      "Build a production-quality web music player that: (1) renders a live ASCII spectrum analyzer with logarithmic frequency mapping; (2) supports multiple visualization modes from a single audio graph; (3) degrades gracefully on lower-end devices via an adaptive quality system; (4) maintains a cohesive retro glitch aesthetic without sacrificing readability or performance.",
    goalPt:
      "Construir um player de música web de qualidade de produção que: (1) renderize um analisador de espectro ASCII ao vivo com mapeamento logarítmico de frequências; (2) suporte múltiplos modos de visualização a partir de um único grafo de áudio; (3) degrade graciosamente em dispositivos mais lentos via sistema de qualidade adaptativo; (4) mantenha uma estética glitch retrô coesa sem sacrificar legibilidade ou performance.",
    role: ["Solo developer — audio engineering, visualization design, frontend, deployment"],
    rolePt: ["Desenvolvedor solo — engenharia de áudio, design de visualização, frontend, deploy"],
    technicalDecisions: [
      "Logarithmic frequency mapping — 140 ASCII columns are mapped to 20Hz–22kHz using log10 scaling. Each column's FFT bin index is computed as pow(10, logMin + (logRange × i) / (cols − 1)). This matches the musical scale (each octave gets equal visual space) and is how analog hardware analyzers work. A linear mapping would dedicate 75% of columns to frequencies above 5kHz that carry little musical information.",
      "Adaptive quality system — 4 quality levels (ultra/high/medium/low) change the FFT size (512 → 64 bins) and visualization frame rate (20fps → 4fps). FPS is monitored with a rolling 10-sample history; auto-downgrade triggers at <30fps. This keeps the app usable on mid-range devices without a single hardcoded quality setting.",
      "Separate glitch layer with AdditiveBlending — the scanlines, RGB shift, and static noise effects run in a dedicated component (glitch-noise-overlay.tsx) completely decoupled from the audio render loop. Using CSS mix-blend-difference for the RGB shift means the glitch layer composites correctly over any background color without per-pixel JavaScript calculations.",
      "Dynamic import with loading skeletons — each of the 5 visualization components is code-split via Next.js dynamic(). Initial JS bundle is minimal; the heavy Three.js circular visualizer only loads if the user switches to that mode. Each component shows a themed ASCII loading skeleton during import.",
      "Uint8Array throughout — Web Audio API's getByteFrequencyData() returns Uint8Array natively. The entire frequency data pipeline keeps this type (zero-copy from browser to visualization), avoiding GC pressure from array allocations on every animation frame.",
      "crossOrigin='anonymous' on the audio element — required for Web Audio API's createMediaElementSource() to access audio data from a cross-origin URL. Without this attribute, the AnalyserNode can connect but getByteFrequencyData() returns zeros due to CORS security restrictions.",
    ],
    technicalDecisionsPt: [
      "Mapeamento logarítmico de frequências — 140 colunas ASCII são mapeadas para 20Hz–22kHz usando escala log10. O índice do bin FFT de cada coluna é calculado como pow(10, logMin + (logRange × i) / (cols − 1)). Isso corresponde à escala musical (cada oitava recebe o mesmo espaço visual) e é como analisadores de hardware analógico funcionam. Um mapeamento linear dedicaria 75% das colunas a frequências acima de 5kHz que carregam poucas informações musicais.",
      "Sistema de qualidade adaptativo — 4 níveis de qualidade (ultra/alto/médio/baixo) alteram o tamanho FFT (512 → 64 bins) e a taxa de frames de visualização (20fps → 4fps). O FPS é monitorado com um histórico de 10 amostras; o downgrade automático dispara abaixo de 30fps. Isso mantém o app utilizável em dispositivos de médio desempenho sem uma configuração de qualidade fixa.",
      "Camada glitch separada com AdditiveBlending — os efeitos de scanlines, RGB shift e ruído estático rodam em um componente dedicado (glitch-noise-overlay.tsx) completamente desacoplado do loop de renderização de áudio. Usando CSS mix-blend-difference para o RGB shift, a camada glitch composita corretamente sobre qualquer cor de fundo sem cálculos JavaScript pixel a pixel.",
      "Import dinâmico com skeletons de carregamento — cada um dos 5 componentes de visualização é code-split via dynamic() do Next.js. O bundle JS inicial é mínimo; o visualizador circular pesado com Three.js só carrega se o usuário mudar para esse modo. Cada componente mostra um skeleton de carregamento temático ASCII durante o import.",
      "Uint8Array em todo o pipeline — getByteFrequencyData() da Web Audio API retorna Uint8Array nativamente. Todo o pipeline de dados de frequência mantém esse tipo (zero-copy do browser para a visualização), evitando pressão no GC por alocações de array a cada frame de animação.",
      "crossOrigin='anonymous' no elemento de áudio — necessário para que createMediaElementSource() da Web Audio API acesse dados de áudio de uma URL cross-origin. Sem esse atributo, o AnalyserNode conecta mas getByteFrequencyData() retorna zeros por restrições de segurança CORS.",
    ],
    learnings: [
      "Logarithmic frequency mapping is non-negotiable for musical visualizations — a linear mapping made bass frequencies invisible and high frequencies dominant. Switching to log scaling transformed the analyzer from a technically correct but musically useless display into something that actually feels like music.",
      "Adaptive quality systems need real usage data to calibrate thresholds — the initial FPS thresholds were too aggressive, causing users on decent hardware to see unnecessary quality warnings. A 10-sample rolling average and a 5-second warning cooldown reduced false positives significantly.",
      "Decoupling visual effects from audio processing prevents subtle timing bugs — early versions had the glitch overlay on the same render loop as the ASCII analyzer, causing glitch frames to drop when the FFT computation was expensive. Separating them eliminated the coupling.",
      "Dynamic imports change the perceived load time significantly — adding loading skeletons for each visualization mode made the app feel instant even when Three.js was still downloading.",
    ],
    learningsPt: [
      "O mapeamento logarítmico de frequências é inegociável para visualizações musicais — um mapeamento linear tornava as frequências de graves invisíveis e as agudas dominantes. Mudar para escala log transformou o analisador de um display tecnicamente correto mas musicalmente inútil em algo que realmente parece música.",
      "Sistemas de qualidade adaptativa precisam de dados reais de uso para calibrar os limiares — os limiares iniciais de FPS eram muito agressivos, fazendo usuários em hardware decente verem avisos desnecessários. Uma média móvel de 10 amostras e um cooldown de 5 segundos para avisos reduziu significativamente os falsos positivos.",
      "Desacoplar efeitos visuais do processamento de áudio evita bugs sutis de timing — versões iniciais tinham o overlay glitch no mesmo loop de renderização do analisador ASCII, causando drops de frames de glitch quando a computação FFT era custosa. Separar os dois eliminou o acoplamento.",
      "Imports dinâmicos mudam significativamente o tempo de carga percebido — adicionar skeletons de carregamento para cada modo de visualização fez o app parecer instantâneo mesmo quando o Three.js ainda estava carregando.",
    ],
    status: "Live — deployed to GitHub Pages",
    statusPt: "Ativo — publicado no GitHub Pages",
    githubUrl: "https://github.com/claytonbrgsdev/aacs-player",
    liveUrl: "https://claytonbrgsdev.github.io/aacs-player/",
    featured: true,
    year: 2025,
  },
  {
    id: "deep-ocean-explorer",
    nameEn: "Deep Ocean Explorer",
    namePt: "Deep Ocean Explorer",
    name: "Deep Ocean Explorer",
    type: "Interactive 3D Experience / Real-Time WebGL",
    descriptionEn:
      "Browser-based real-time underwater world with hand-written GLSL shaders for volumetric light shafts, caustics, and jellyfish bioluminescence. Depth-driven lighting system, 10 NPC jellyfish with 8 migration patterns, and a player-controlled jellyfish with 6-DOF movement.",
    descriptionPt:
      "Mundo submarino em tempo real no navegador com shaders GLSL escritos à mão para feixes de luz volumétricos, cáusticas e bioluminescência de medusas. Sistema de iluminação guiado por profundidade, 10 águas-vivas NPC com 8 padrões de migração e uma água-viva controlada pelo jogador com movimento 6-DOF.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Three.js", "React Three Fiber", "GLSL", "Tailwind CSS"],
    categories: ["3d-visualization"],
    highlights: [
      "All atmospheric effects are hand-written GLSL ShaderMaterials inlined in TypeScript — no post-processing library",
      "Volumetric light shafts use multi-octave 3D fractal noise (4 octaves) + Mie-phase-function approximation for realistic scattering",
      "Caustics simulated via dFdx/dFdy GPU derivatives of a procedural water surface — physically motivated, no texture lookups",
      "Depth-based lighting state machine with 5 named zones (surface → abyss), each with target color/intensity lerped per frame",
      "10 NPC jellyfish with independent 8-pattern behavior FSMs (vertical drift, circular float, seasonal migration, thermal layers…)",
    ],
    overview:
      "Deep Ocean Explorer is an ambient interactive 3D underwater world running entirely in the browser. The player navigates as a jellyfish through a procedurally lit ocean populated by NPC jellyfish swarms, fish schools, coral, seaweed, and layered atmospheric effects. Every visual effect — volumetric light shafts, caustics, bioluminescence, depth-based fog — is a hand-written GLSL ShaderMaterial with no post-processing library dependencies. The project was built as a demonstration of real-time WebGL depth: how many independent shader systems can be composed coherently in a browser.",
    overviewPt:
      "Deep Ocean Explorer é um mundo 3D submarino interativo e ambiente rodando inteiramente no navegador. O jogador navega como uma água-viva por um oceano iluminado de forma procedural, populado por enxames de NPCs, cardumes, corais, algas e camadas de efeitos atmosféricos. Cada efeito visual — feixes de luz volumétricos, cáusticas, bioluminescência, névoa baseada em profundidade — é um ShaderMaterial GLSL escrito à mão sem dependências de biblioteca de pós-processamento. O projeto foi construído como uma demonstração de profundidade WebGL em tempo real.",
    problem:
      "Most browser-based 3D experiences rely on HDR environment maps and pre-baked lighting to look good. This approach looks photorealistic but is passive — lighting doesn't respond to the player's position or depth. The challenge was to build an underwater world where every atmospheric system (light scattering, caustics, fog, bioluminescence) is fully dynamic and depth-driven, while keeping the frame rate above 60fps on a mid-range laptop.",
    problemPt:
      "A maioria das experiências 3D no navegador usa mapas de ambiente HDR e iluminação pré-assada para parecer boa. Essa abordagem parece fotorrealista, mas é passiva — a iluminação não responde à posição ou profundidade do jogador. O desafio era construir um mundo submarino onde cada sistema atmosférico (espalhamento de luz, cáusticas, névoa, bioluminescência) fosse totalmente dinâmico e guiado pela profundidade, mantendo a taxa de frames acima de 60fps em um laptop de nível médio.",
    goal:
      "Build a real-time 3D underwater experience that demonstrates: (1) custom GLSL shader authorship without a post-processing pipeline; (2) a depth-driven dynamic lighting system with smooth zone transitions; (3) NPC entity behavior with a state machine; (4) player movement and interaction; (5) performance-aware rendering with documented tradeoffs.",
    goalPt:
      "Construir uma experiência 3D submarina em tempo real que demonstre: (1) autoria de shaders GLSL personalizados sem pipeline de pós-processamento; (2) sistema de iluminação dinâmica guiado por profundidade com transições suaves entre zonas; (3) comportamento de entidades NPC com máquina de estados; (4) movimento e interação do jogador; (5) renderização consciente de performance com tradeoffs documentados.",
    role: ["Solo developer — shader authorship, scene architecture, NPC behavior, deployment"],
    rolePt: ["Desenvolvedor solo — autoria de shaders, arquitetura de cena, comportamento NPC, deploy"],
    technicalDecisions: [
      "All shaders inlined as TypeScript template literals — no .glsl files, no shader loading pipeline, no compilation failures from missing assets on GitHub Pages. Every THREE.ShaderMaterial is defined inside useMemo() hooks, ensuring shaders are compiled once and cached by the GPU.",
      "dFdx/dFdy derivatives for caustics — instead of a second noise sample to compute the water surface gradient, GPU screen-space derivatives give the exact gradient of the noise field for free. This is the approach used in production ocean renderers: 1/( 1 + dot(gradient, gradient) × 20) produces bright caustic lines at surface curvature peaks.",
      "Depth-based lighting as a data structure — five named zones (surface, shallow, medium, deep, abyss) each define a target light color and intensity. Every frame, the system lerps current values toward the active zone target. Adding a new zone requires one object entry, not new conditional logic.",
      "AdditiveBlending + depthWrite:false on all effect layers — volumetric shafts, caustics, god rays, and particles all use additive blending and skip depth writing. This allows unlimited layering of transparent effects without Z-fighting or overdraw artifacts, which is the correct approach for atmospheric effects that should accumulate light.",
      "Player position as the single source of truth — the JellyfishCharacter component propagates its Three.js world position to Scene.tsx via onPositionChange callback, which distributes it to all 11 downstream components as props. This avoids global state while ensuring every depth-sensitive system receives the same ground truth.",
      "HDR environment replaced with hand-rolled lighting — the @react-three/drei Environment component (which fetches HDR from a remote CDN) caused 429 rate-limit errors on GitHub Pages. Removing it and building DepthBasedLighting from scratch eliminated the external dependency and gave full control over the lighting grammar.",
    ],
    technicalDecisionsPt: [
      "Todos os shaders inline como template literals TypeScript — sem arquivos .glsl, sem pipeline de carregamento de shaders, sem falhas de compilação por assets faltando no GitHub Pages. Cada THREE.ShaderMaterial é definido dentro de hooks useMemo(), garantindo que os shaders sejam compilados uma vez e cacheados pela GPU.",
      "Derivadas dFdx/dFdy para cáusticas — em vez de uma segunda amostra de ruído para calcular o gradiente da superfície da água, as derivadas screen-space da GPU fornecem o gradiente exato do campo de ruído de graça. 1/(1 + dot(gradiente, gradiente) × 20) produz linhas de cáustica brilhantes nos picos de curvatura da superfície.",
      "Iluminação por profundidade como estrutura de dados — cinco zonas nomeadas (superfície, rasa, média, profunda, abismo) definem cor e intensidade de luz alvo. A cada frame, o sistema faz lerp dos valores atuais em direção ao alvo da zona ativa. Adicionar uma nova zona requer uma entrada de objeto, não nova lógica condicional.",
      "AdditiveBlending + depthWrite:false em todas as camadas de efeito — feixes volumétricos, cáusticas, raios divinos e partículas usam blending aditivo e pular a escrita de profundidade. Isso permite camadas ilimitadas de efeitos transparentes sem Z-fighting ou artefatos de overdraw.",
      "Posição do jogador como única fonte de verdade — o componente JellyfishCharacter propaga sua posição Three.js para Scene.tsx via callback onPositionChange, que a distribui para todos os 11 componentes downstream como props. Isso evita estado global enquanto garante que cada sistema sensível à profundidade receba a mesma fonte de verdade.",
      "Ambiente HDR substituído por iluminação customizada — o componente Environment do @react-three/drei (que busca HDR de um CDN remoto) causava erros 429 de rate-limit no GitHub Pages. Removê-lo e construir o DepthBasedLighting do zero eliminou a dependência externa e deu controle total sobre a gramática de iluminação.",
    ],
    learnings: [
      "Remote CDN dependencies in static deployments are a reliability risk — the HDR fetch failure was a production bug that only appeared on GitHub Pages, not in local development. Replacing it with procedural lighting was both a fix and a feature: the lighting became richer and more controllable.",
      "Screen-space derivatives (dFdx/dFdy) are underused in creative WebGL work — they provide mathematically precise gradients with no performance cost, enabling caustic simulation that would otherwise require a full ray-march.",
      "NPC behavior state machines need randomization to feel alive — deterministic jellyfish patterns looked robotic. Adding ±20% random variation to timer durations and 15% probability of pattern mutation made the swarm feel organic.",
      "Depth-driven systems need smooth transitions, not hard thresholds — early versions had abrupt lighting changes at zone boundaries. Switching to per-frame lerp eliminated the visual pop and made depth feel like a continuous variable rather than a step function.",
    ],
    learningsPt: [
      "Dependências de CDN remoto em deploys estáticos são um risco de confiabilidade — a falha no fetch do HDR era um bug de produção que só aparecia no GitHub Pages, não no desenvolvimento local. Substituí-lo por iluminação procedural foi tanto uma correção quanto uma feature: a iluminação ficou mais rica e controlável.",
      "As derivadas screen-space (dFdx/dFdy) são subutilizadas em trabalhos WebGL criativos — fornecem gradientes matematicamente precisos sem custo de performance, permitindo simulação de cáusticas que de outra forma exigiria um ray-march completo.",
      "Máquinas de estado de comportamento NPC precisam de aleatoriedade para parecer vivas — padrões determinísticos de água-viva pareciam robóticos. Adicionar ±20% de variação aleatória nas durações dos timers e 15% de probabilidade de mutação de padrão fez o enxame parecer orgânico.",
      "Sistemas guiados por profundidade precisam de transições suaves, não limiares rígidos — versões iniciais tinham mudanças abruptas de iluminação nas fronteiras de zona. Mudar para lerp por frame eliminou o pop visual e fez a profundidade parecer uma variável contínua em vez de uma função degrau.",
    ],
    status: "Live — deployed to GitHub Pages",
    statusPt: "Ativo — publicado no GitHub Pages",
    githubUrl: "https://github.com/claytonbrgsdev/deep-ocean-explorer",
    liveUrl: "https://claytonbrgsdev.github.io/deep-ocean-explorer/",
    featured: true,
    year: 2025,
  },
  {
    id: "product-showcase-3d",
    nameEn: "3D Product Showcase",
    namePt: "Showcase de Produto 3D",
    name: "3D Product Showcase",
    type: "Interactive 3D Configurator / WebGL Product Visualization",
    descriptionEn:
      "Professional-grade 3D product configurator for vehicle covers. Swappable showroom scenarios, per-region logo application via UV-mapped canvas compositing, cinematic camera automation with 'takes', and full lighting preset serialization — all in vanilla Three.js with no build step.",
    descriptionPt:
      "Configurador 3D de nível profissional para capas veiculares. Cenários de showroom intercambiáveis, aplicação de logo por região via composição UV em canvas, automação de câmera cinemática com 'takes' e serialização completa de presets de iluminação — tudo em Three.js puro sem etapa de build.",
    tech: ["Three.js r160", "JavaScript", "WebGL", "DRACO", "Meshopt", "GLB/glTF", "EffectComposer", "BokehPass"],
    categories: ["3d-visualization"],
    highlights: [
      "Per-region logo application: uploads PNG logo, composites it onto UV-mapped product surfaces via Canvas API with smart background estimation",
      "Cinematic camera system with 'takes' — automated orbital sequences with configurable dwell time, azimuth drift, radius sway, and smooth user-override blend-back",
      "4 swappable showroom environments (sci-fi, modern, VR, art gallery), each with independent lighting setup and floor-snap Y-offsets",
      "Preset serialization to localStorage: saves full lighting + camera state per scenario as importable/exportable JSON",
      "CDN-based Three.js via import maps — zero build tooling, instant reload during development, DRACO + Meshopt decoders loaded lazily",
    ],
    overview:
      "The 3D Product Showcase is a browser-based product configurator built for Evolut Digital to visualize vehicle covers (Kosha4 product line) in photorealistic 3D environments. Sales teams can swap showroom scenarios, apply client logos to specific product regions, configure directional lighting and depth-of-field blur, and save/load lighting presets — then capture the result for presentations. The entire stack is vanilla Three.js with no build process, delivered as static files and served from a simple HTTP server.",
    overviewPt:
      "O 3D Product Showcase é um configurador de produto baseado em navegador criado para a Evolut Digital para visualizar capas veiculares (linha Kosha4) em ambientes 3D fotorrealistas. Equipes de vendas podem trocar cenários de showroom, aplicar logos de clientes em regiões específicas do produto, configurar iluminação direcional e desfoque de profundidade de campo, e salvar/carregar presets de iluminação — capturando o resultado para apresentações.",
    problem:
      "Product photography for custom vehicle covers requires physical samples and studio shoots for each client configuration — expensive and slow. A 3D configurator that lets the sales team show any logo placement, color, and environment in real time eliminates the need for physical mockups. The main technical challenge was per-region logo application: the product has distinct front, back, and lateral panels that must accept independent logo uploads without the materials interfering with each other.",
    problemPt:
      "A fotografia de produto para capas veiculares personalizadas exige amostras físicas e sessões de estúdio para cada configuração de cliente — caro e lento. Um configurador 3D que permite à equipe de vendas mostrar qualquer posicionamento de logo, cor e ambiente em tempo real elimina a necessidade de mockups físicos. O principal desafio técnico era a aplicação de logo por região: o produto tem painéis frontal, traseiro e lateral distintos que devem aceitar uploads de logo independentes sem que os materiais interfiram entre si.",
    goal:
      "Build a professional 3D product configurator that: (1) loads GLB models with DRACO/Meshopt compression; (2) applies logos to specific UV-mapped product regions via canvas compositing; (3) supports 4 swappable photorealistic environments; (4) provides cinematic camera automation for product reveals; (5) serializes the full scene state as presets.",
    goalPt:
      "Construir um configurador 3D profissional que: (1) carregue modelos GLB com compressão DRACO/Meshopt; (2) aplique logos em regiões específicas do produto via composição canvas; (3) suporte 4 ambientes fotorrealistas intercambiáveis; (4) forneça automação de câmera cinemática para apresentações do produto; (5) serialize o estado completo da cena como presets.",
    role: ["Solo developer — Three.js architecture, material system, camera system, deployment"],
    rolePt: ["Desenvolvedor solo — arquitetura Three.js, sistema de materiais, sistema de câmera, deploy"],
    technicalDecisions: [
      "Per-region logo application via material cloning — the product's named mesh regions (CUBE, CUBE002, CUBE003, CUBE004) each get a cloned instance of Material 003 flagged with userData._cloned markers to prevent re-cloning. An uploaded PNG is composited onto a Canvas with background color estimation, then applied as a texture update to the specific mesh's material without affecting other regions.",
      "Canvas API UV compositing for logo placement — instead of a custom shader, the logo is rendered onto an HTML Canvas matching the texture UV space, then converted to a Three.js CanvasTexture. This approach works without GPU access and correctly respects the model's UV transforms and texture coordinate offsets.",
      "CDN import maps with no build step — Three.js r160 is loaded from unpkg via ES module import maps. DRACOLoader and MeshoptDecoder are loaded from the same CDN lazily. Zero webpack/vite configuration; development workflow is edit-save-reload, not edit-save-bundle-reload.",
      "Cinematic camera 'takes' system — each take defines an orbital path with configurable dwell time, azimuth drift speed, radius sway amplitude, and sway frequency. When the user interacts with OrbitControls, the take system smoothly blends back to automated motion after 5 seconds of inactivity using lerp on spherical coordinates.",
      "Per-scenario light setups — rather than a global directional key light, each showroom environment defines its own RectAreaLights and DirectionalLights. Swapping scenarios disposes the previous lights and instantiates the new set, preventing light accumulation and ensuring each environment has its intended photographic look.",
      "Preset JSON serialization to localStorage — a full preset captures all editable light positions/colors/intensities and camera position/target/FOV as a JSON object. Presets are keyed per scenario, enabling separate saved states for each environment. Export as .json files allows sharing between team members.",
    ],
    technicalDecisionsPt: [
      "Aplicação de logo por região via clonagem de material — as regiões de mesh nomeadas do produto (CUBE, CUBE002, CUBE003, CUBE004) recebem cada uma uma instância clonada do Material 003 marcada com userData._cloned para evitar re-clonagem. Um PNG enviado é composto em um Canvas com estimativa de cor de fundo, depois aplicado como atualização de textura ao material do mesh específico sem afetar outras regiões.",
      "Composição UV via Canvas API para posicionamento de logo — em vez de um shader customizado, o logo é renderizado em um Canvas HTML correspondendo ao espaço UV da textura, depois convertido para um CanvasTexture do Three.js. Essa abordagem funciona sem acesso à GPU e respeita corretamente os transforms UV e deslocamentos de coordenadas de textura do modelo.",
      "Import maps CDN sem etapa de build — Three.js r160 carregado do unpkg via ES module import maps. DRACOLoader e MeshoptDecoder carregados do mesmo CDN de forma lazy. Zero configuração webpack/vite; fluxo de desenvolvimento é editar-salvar-recarregar, não editar-salvar-bundle-recarregar.",
      "Sistema de 'takes' cinemáticos — cada take define um caminho orbital com tempo de permanência, velocidade de drift azimutal, amplitude de sway de raio e frequência de sway configuráveis. Quando o usuário interage com OrbitControls, o sistema de take volta suavemente ao movimento automatizado após 5 segundos de inatividade usando lerp em coordenadas esféricas.",
      "Configurações de luz por cenário — em vez de uma luz key direcional global, cada ambiente de showroom define seus próprios RectAreaLights e DirectionalLights. Trocar cenários descarta as luzes anteriores e instancia o novo conjunto, evitando acumulação de luz e garantindo que cada ambiente tenha seu visual fotográfico pretendido.",
      "Serialização JSON de presets para localStorage — um preset completo captura todas as posições/cores/intensidades de luzes editáveis e posição/alvo/FOV da câmera como objeto JSON. Presets são chaveados por cenário, permitindo estados salvos separados para cada ambiente. Exportar como arquivos .json permite compartilhamento entre membros da equipe.",
    ],
    learnings: [
      "Material cloning must be carefully tracked — early versions re-cloned materials on every logo upload, creating an unbounded number of material instances. The _cloned flag pattern (userData._clonedLogo = true) prevents re-cloning without requiring a separate material registry.",
      "CDN-based Three.js is viable for client deliverables — the absence of a build step meant the client's team could modify the showroom configuration file and see changes immediately without any toolchain knowledge. The tradeoff is longer initial load time vs. npm-bundled builds.",
      "Cinematic camera automation significantly improves demo quality — static camera presets required the user to memorize positions. The takes system made product demos feel like directed video without requiring the presenter to operate the camera.",
      "Per-scenario light setups prevent an 'overlit' accumulation bug — sharing a global directional light across scenarios caused it to compound with scenario-specific lights when switching environments. Disposing and recreating lights on scenario change was the correct isolation model.",
    ],
    learningsPt: [
      "A clonagem de material deve ser rastreada cuidadosamente — versões iniciais re-clonavam materiais a cada upload de logo, criando um número ilimitado de instâncias. O padrão de flag _cloned (userData._clonedLogo = true) evita re-clonagem sem exigir um registro separado de materiais.",
      "Three.js via CDN é viável para entregas a clientes — a ausência de etapa de build significava que a equipe do cliente podia modificar o arquivo de configuração do showroom e ver as mudanças imediatamente sem nenhum conhecimento de toolchain. O tradeoff é maior tempo de carregamento inicial vs. builds com npm.",
      "A automação de câmera cinemática melhora significativamente a qualidade das demos — presets de câmera estáticos exigiam que o usuário memorizasse posições. O sistema de takes fez as demos de produto parecerem vídeos dirigidos sem exigir que o apresentador operasse a câmera.",
      "Configurações de luz por cenário evitam um bug de acumulação 'superiluminada' — compartilhar uma luz direcional global entre cenários a fazia se acumular com luzes específicas do cenário ao trocar ambientes. Descartar e recriar luzes na troca de cenário foi o modelo de isolamento correto.",
    ],
    status: "Delivered to client — Evolut Digital",
    statusPt: "Entregue ao cliente — Evolut Digital",
    githubUrl: "https://github.com/claytonbrgsdev/product-showcase-v2",
    liveUrl: "https://claytonbrgsdev.github.io/product-showcase-v2/",
    featured: false,
    year: 2025,
    client: "Evolut Digital",
  },
  {
    id: "reacto",
    nameEn: "REACTO – Web Audio-Visual Experiments",
    image: "/projects/reacto/project-reacto.png",
    namePt: "REACTO – Experimentos Audio-Visuais Web",
    name: "REACTO",
    type: "Creative Web Application / Audio-Visual Suite",
    descriptionEn:
      "Suite of 10 distinct real-time audio-reactive 3D visualizations — from traditional spectrum bars to physics-inspired cymatics. Each experiment maps FFT frequency data to Three.js geometry in real time with 12 color schemes and tweakable parameters.",
    descriptionPt:
      "Suíte de 10 visualizações 3D audio-reativas em tempo real distintas — de barras de espectro tradicionais à cimática inspirada em física. Cada experimento mapeia dados FFT de frequência para geometria Three.js em tempo real com 12 esquemas de cores e parâmetros ajustáveis.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Three.js", "React Three Fiber", "Web Audio API", "Tailwind CSS"],
    categories: ["audio", "3d-visualization"],
    highlights: [
      "Cymatics visualization implements standing-wave modal equations (Chladni patterns) with spectral peak detection mapping to resonant modes m, n, k, l",
      "10 visualization types: Frequency bars, Waveform, Terrain, Rings, Orbit (4 variants), Orbit-Terrain, Cymatics — each sharing one AnalyserNode",
      "12 color palettes with three generation strategies: spectrum (HSL), gradient (hue range blend), and static (primary/accent interpolation)",
      "Adaptive rendering: DPR capped at 2×, geometry uses BufferAttribute direct mutation (needsUpdate) instead of cloning for GC efficiency",
      "Fullscreen mode with cinematic camera adjustment (FOV 60→75°) and a persistent controls overlay",
    ],
    overview:
      "REACTO is a web-based audio visualization suite that transforms uploaded audio or microphone input into 10 distinct real-time 3D experiments. Each visualization maps Web Audio API FFT data to Three.js geometry differently — from a circular spectrum analyzer to a physics-inspired cymatics simulation that implements actual Chladni standing-wave equations. The project was built as both a creative tool and a technical demonstration of audio-reactive real-time graphics in the browser.",
    overviewPt:
      "REACTO é uma suíte de visualização de áudio baseada em web que transforma áudio enviado ou entrada do microfone em 10 experimentos 3D distintos em tempo real. Cada visualização mapeia dados FFT da Web Audio API para geometria Three.js de forma diferente — de um analisador de espectro circular a uma simulação de cimática inspirada em física que implementa equações reais de ondas estacionárias de Chladni. O projeto foi criado como ferramenta criativa e demonstração técnica de gráficos em tempo real audio-reativos no navegador.",
    problem:
      "Audio visualization on the web rarely goes beyond bar charts. The goal was to explore how far real-time audio analysis could drive 3D geometry — not just height of bars, but topology of terrain, orbits of particles, and resonant modes of vibrating surfaces. Each experiment answers a different question: what does this sound look like when expressed through this particular physical or mathematical metaphor?",
    problemPt:
      "A visualização de áudio na web raramente vai além de gráficos de barras. O objetivo era explorar até onde a análise de áudio em tempo real poderia conduzir geometria 3D — não apenas a altura de barras, mas a topologia de terreno, as órbitas de partículas e os modos ressonantes de superfícies vibrantes. Cada experimento responde a uma pergunta diferente: como esse som parece quando expresso através dessa metáfora física ou matemática particular?",
    goal:
      "Build a multi-visualization audio suite that: (1) shares one AnalyserNode across all experiments; (2) implements fundamentally different mapping strategies per visualization; (3) includes a physically-grounded simulation (cymatics); (4) supports 12 color schemes applicable to any visualization; (5) runs smoothly in fullscreen on mid-range hardware.",
    goalPt:
      "Construir uma suíte de visualização de áudio multi-experimento que: (1) compartilhe um AnalyserNode entre todos os experimentos; (2) implemente estratégias de mapeamento fundamentalmente diferentes por visualização; (3) inclua uma simulação fisicamente fundamentada (cimática); (4) suporte 12 esquemas de cores aplicáveis a qualquer visualização; (5) rode suavemente em fullscreen em hardware de nível médio.",
    role: ["Solo developer — audio engineering, shader authorship, visualization design, frontend"],
    rolePt: ["Desenvolvedor solo — engenharia de áudio, autoria de shaders, design de visualização, frontend"],
    technicalDecisions: [
      "Cymatics via spectral peak detection and modal equations — the Cymatics visualization detects the top 3 frequency peaks in the FFT and maps them to integer modal indices (m, n, k, l). It then computes sin(m×π×x) × sin(n×π×y) for rectangular modes and sin(k×π×r) × cos(l×θ) for polar modes, blending both. This produces mathematically correct Chladni patterns that actually change with the music's dominant frequencies.",
      "BufferAttribute direct mutation for geometry updates — all visualizations update Three.js geometry by calling setX()/setY()/setZ() on existing BufferAttributes and setting needsUpdate=true, never creating new geometry. This eliminates GC pressure from per-frame geometry allocation, which would cause frame drops in longer sessions.",
      "Single AnalyserNode shared via React context — all 10 visualizations read from the same AnalyserNode via a useAudio() hook. Audio setup (createMediaElementSource, connect) happens once in AudioProvider, preventing the Web Audio API graph from growing when switching visualizations.",
      "Audio band splitting for semantic reactivity — frequency data is divided into bass (bins 0–24), mid (24–96), and high (96–192) ranges. Different visualization layers respond to different bands: terrain elevation responds to bass, particle orbit radius to mid, trail brightness to high. This creates musically coherent animations where visual layers respond to their corresponding sonic registers.",
      "THREE.MathUtils.lerp for smooth transitions — raw FFT data is noisy and produces jittery visuals. Every value driving geometry (bar height, orbit radius, terrain elevation) is lerped toward the new FFT value with delta-scaled smoothing. This produces fluid motion without introducing perceptible lag.",
      "Fullscreen-specific camera and lighting adjustments — entering fullscreen increases FOV from 60° to 75° and moves the camera back (Z: 18 → 25). Point light intensity increases by 40% to maintain visual balance at the larger viewport. These are computed deltas, not hardcoded values, so they work at any initial state.",
    ],
    technicalDecisionsPt: [
      "Cimática via detecção de pico espectral e equações modais — a visualização Cymatics detecta os 3 maiores picos de frequência no FFT e os mapeia para índices modais inteiros (m, n, k, l). Então calcula sin(m×π×x) × sin(n×π×y) para modos retangulares e sin(k×π×r) × cos(l×θ) para modos polares, mesclando ambos. Isso produz padrões de Chladni matematicamente corretos que realmente mudam com as frequências dominantes da música.",
      "Mutação direta de BufferAttribute para atualizações de geometria — todas as visualizações atualizam a geometria Three.js chamando setX()/setY()/setZ() em BufferAttributes existentes e definindo needsUpdate=true, nunca criando nova geometria. Isso elimina a pressão no GC por alocação de geometria por frame, que causaria quedas de frames em sessões mais longas.",
      "Único AnalyserNode compartilhado via contexto React — todas as 10 visualizações leem do mesmo AnalyserNode via hook useAudio(). A configuração de áudio (createMediaElementSource, connect) acontece uma vez no AudioProvider, evitando que o grafo da Web Audio API cresça ao trocar visualizações.",
      "Divisão de bandas de áudio para reatividade semântica — os dados de frequência são divididos em graves (bins 0–24), médios (24–96) e agudos (96–192). Diferentes camadas de visualização respondem a diferentes bandas: a elevação do terreno responde ao grave, o raio da órbita de partículas ao médio, o brilho do rastro ao agudo.",
      "THREE.MathUtils.lerp para transições suaves — os dados FFT brutos são ruidosos e produzem visuais tremidos. Cada valor que conduz geometria (altura de barra, raio de órbita, elevação de terreno) é interpolado em direção ao novo valor FFT com suavização escalonada por delta.",
      "Ajustes de câmera e iluminação específicos para fullscreen — entrar em fullscreen aumenta o FOV de 60° para 75° e afasta a câmera (Z: 18 → 25). A intensidade da luz pontual aumenta 40% para manter o equilíbrio visual no viewport maior.",
    ],
    learnings: [
      "Cymatics is the most compelling visualization not because it looks best but because it's grounded in physics — users who know about Chladni patterns recognize the connection and engage differently. Mathematical legitimacy adds a layer of meaning that purely aesthetic choices don't.",
      "BufferAttribute mutation requires careful dirty-flagging — forgetting needsUpdate=true causes the GPU to render stale geometry while JavaScript thinks it updated. The bug manifests as frozen geometry that ignores audio input, which looks like an audio connection failure.",
      "Band splitting makes reactivity feel musical rather than mechanical — responding to total average frequency produces generic pulsing. Separating bass/mid/high and routing each to different geometric properties creates animations that feel compositionally aware.",
      "Shared audio context across visualization switches is non-trivial — naively creating a new MediaElementSource on each switch causes the Web Audio API to throw 'already connected' errors. The AudioProvider pattern (create once, keep alive) solved this but required careful cleanup on component unmount.",
    ],
    learningsPt: [
      "A cimática é a visualização mais convincente não porque parece melhor, mas porque é fundamentada em física — usuários que conhecem padrões de Chladni reconhecem a conexão e se engajam diferente. A legitimidade matemática adiciona uma camada de significado que escolhas puramente estéticas não têm.",
      "A mutação de BufferAttribute requer marcação cuidadosa de dirty — esquecer needsUpdate=true faz a GPU renderizar geometria desatualizada enquanto o JavaScript pensa que atualizou. O bug se manifesta como geometria congelada que ignora entrada de áudio, parecendo uma falha de conexão de áudio.",
      "A divisão de bandas faz a reatividade parecer musical em vez de mecânica — responder à frequência média total produz pulsação genérica. Separar grave/médio/agudo e rotear cada um para diferentes propriedades geométricas cria animações que parecem composicionalmente conscientes.",
      "Contexto de áudio compartilhado entre trocas de visualização é não trivial — criar um novo MediaElementSource a cada troca faz a Web Audio API lançar erros 'already connected'. O padrão AudioProvider (criar uma vez, manter ativo) resolveu isso, mas exigiu limpeza cuidadosa no unmount do componente.",
    ],
    status: "Live — deployed to GitHub Pages",
    statusPt: "Ativo — publicado no GitHub Pages",
    githubUrl: "https://github.com/claytonbrgsdev/reacto",
    liveUrl: "https://claytonbrgsdev.github.io/reacto/",
    featured: true,
    year: 2025,
  },
  {
    id: "medication-cycles-tracker",
    nameEn: "Medication Cycles Tracker",
    namePt: "Rastreador de Ciclos de Medicação",
    name: "Medication Cycles Tracker",
    type: "Interactive 3D Web App / Personal Health Tool",
    descriptionEn:
      "Browser-based pharmacokinetic tracker for Venvanse (ADHD medication). A 3D parametric helix spiral visualizes the 15-hour medication cycle across 5 phases, with dual concentration models (linear and exponential half-life), system notifications at phase transitions, and task recommendations based on energy level.",
    descriptionPt:
      "Rastreador farmacocinético para Venvanse (medicação para TDAH). Uma espiral helicoidal 3D paramétrica visualiza o ciclo de 15 horas em 5 fases, com dois modelos de concentração (linear e meia-vida exponencial), notificações do sistema nas transições de fase e recomendações de tarefas baseadas no nível de energia.",
    tech: ["Three.js r158", "Vanilla JavaScript", "Web Audio API", "Canvas API", "Notification API", "localStorage"],
    categories: ["3d-visualization", "web-app"],
    highlights: [
      "Custom THREE.Curve subclass generates a parametric helix with subtle radius oscillation (0.9 + 0.1 × sin) for a 'breathing' organic feel",
      "Dual pharmacokinetic models: linear model for intuitive prediction, exponential half-life model matching Venvanse XR extended-release behavior",
      "Caustic-style pulsing heartbeat animation: double-peaked sinusoid every 1.8s mimics biological rhythm on active segment emissive intensity",
      "Canvas sprites for all 3D labels — text rendered to HTML Canvas, converted to THREE.Sprite at runtime; countdown timers update without geometry recreation",
      "Zero dependencies except Three.js from CDN — no build step, no framework; runs from a Python HTTP server",
    ],
    overview:
      "Medication Cycles Tracker is a 3D pharmacokinetic visualizer that makes the invisible visible: it maps the 15-hour effect cycle of Venvanse (a stimulant ADHD medication) onto an interactive 3D helix, with the user's current position shown in real time as a glowing marker on the spiral. The five phases (onset, peak cycle 1–3, decay) are color-coded segments on the helix. Users start a cycle when they take their medication; the app calculates concentration percentage, suggests appropriate task types per phase, and sends system notifications at phase transitions.",
    overviewPt:
      "O Medication Cycles Tracker é um visualizador farmacocinético 3D que torna o invisível visível: mapeia o ciclo de efeito de 15 horas do Venvanse (medicação estimulante para TDAH) em uma hélice 3D interativa, com a posição atual do usuário mostrada em tempo real como um marcador brilhante na espiral. As cinco fases (início, pico ciclo 1–3, declínio) são segmentos codificados por cor na hélice. Os usuários iniciam um ciclo ao tomar a medicação; o app calcula a porcentagem de concentração, sugere tipos de tarefas apropriados por fase e envia notificações do sistema nas transições.",
    problem:
      "ADHD medication users often struggle to align demanding cognitive tasks with peak medication efficacy — they either start important work too early (medication not yet active) or too late (already in decay). Existing medication tracking apps show only timers and reminders; none visualize the pharmacokinetic curve or provide phase-aware task guidance. The challenge was to make pharmacokinetic data intuitive and actionable through spatial 3D metaphor.",
    problemPt:
      "Usuários de medicação para TDAH frequentemente têm dificuldade em alinhar tarefas cognitivas exigentes com o pico de eficácia da medicação — ou começam trabalho importante cedo demais (medicação ainda não ativa) ou tarde demais (já em declínio). Apps existentes de rastreamento de medicação mostram apenas timers e lembretes; nenhum visualiza a curva farmacocinética ou fornece orientação de tarefas por fase.",
    goal:
      "Build a browser-based pharmacokinetic visualizer that: (1) represents the 15-hour medication cycle as a navigable 3D helix; (2) shows the user's real-time position on the spiral; (3) computes concentration using two mathematical models; (4) sends system notifications at phase transitions; (5) runs as a zero-dependency vanilla JS app.",
    goalPt:
      "Construir um visualizador farmacocinético que: (1) represente o ciclo de 15 horas como uma hélice 3D navegável; (2) mostre a posição em tempo real do usuário na espiral; (3) calcule concentração usando dois modelos matemáticos; (4) envie notificações do sistema nas transições de fase; (5) rode como app JS puro sem dependências.",
    role: ["Solo developer — 3D visualization, pharmacokinetic modeling, UI, notifications"],
    rolePt: ["Desenvolvedor solo — visualização 3D, modelagem farmacocinética, UI, notificações"],
    technicalDecisions: [
      "Parametric helix over a 2D progress ring — a 3D spiral allows the user to zoom in on their current phase, zoom out to see the full 15-hour arc, and orbit the visualization for spatial context. The helix metaphor maps to time naturally (the spiral 'unwraps' into a timeline). A progress ring would show position but not the pharmacokinetic shape of each phase.",
      "Custom THREE.Curve subclass for helix geometry — extending THREE.Curve allows TubeGeometry to sample the curve at arbitrary resolution. The getPoint(t) method adds subtle radius oscillation (r = radius × (0.9 + 0.1 × sin(t × 2π))) that makes the spiral feel organic rather than mechanical. Crucially, the curve can be sampled at any t for the progress marker position without re-computing the full geometry.",
      "Canvas sprites for dynamic text — all labels (phase name, countdown, 'you are here' pill) are rendered to HTML Canvas elements, converted to THREE.CanvasTexture, and displayed as THREE.Sprites. This avoids loading a font loader or text geometry library; text updates only require canvas redraw + texture.needsUpdate=true, not geometry recreation.",
      "Dual concentration models (linear vs. exponential half-life) — the linear model (concPct = elapsed/duration × 100) is intuitive for quick estimation. The exponential model (logistic sigmoid for onset, exponential decay with configurable half-life for decline) matches the pharmacological reality of Venvanse XR's extended-release mechanism. Users can toggle between them and configure the half-life parameter.",
      "CSS variable for panel/canvas layout — the collapsible side panel uses a single --panel-left CSS custom property to animate both the panel position and the canvas offset. Toggling the panel updates one variable; both elements transition together. After the panel animation completes, a resize event forces WebGL to update the renderer dimensions.",
      "Heartbeat pulsation using a double-peaked sinusoid — the active segment's emissive intensity follows: base + exp(-((r-0.12)/0.06)²) + 0.6×exp(-((r-0.34)/0.07)²), where r = (time mod 1.8s) / 1.8. The two Gaussian peaks create a physiologically accurate double-beat pattern that makes the active phase feel alive without being distracting.",
    ],
    technicalDecisionsPt: [
      "Hélice paramétrica em vez de anel de progresso 2D — uma espiral 3D permite ao usuário dar zoom na fase atual, zoom out para ver o arco de 15 horas e orbitar a visualização para contexto espacial. A metáfora da hélice mapeia naturalmente para o tempo. Um anel de progresso mostraria posição, mas não a forma farmacocinética de cada fase.",
      "Subclasse THREE.Curve personalizada para geometria helicoidal — estender THREE.Curve permite que o TubeGeometry amostre a curva em resolução arbitrária. O método getPoint(t) adiciona oscilação sutil de raio (r = raio × (0,9 + 0,1 × sin(t × 2π))) que faz a espiral parecer orgânica. A curva pode ser amostrada em qualquer t para a posição do marcador de progresso sem recomputar toda a geometria.",
      "Canvas sprites para texto dinâmico — todos os labels são renderizados em elementos Canvas HTML, convertidos para THREE.CanvasTexture e exibidos como THREE.Sprites. Atualizações de texto requerem apenas redesenho do canvas + texture.needsUpdate=true, não recriação de geometria.",
      "Modelos de concentração duais (linear vs. meia-vida exponencial) — o modelo linear é intuitivo para estimativa rápida. O modelo exponencial (sigmóide logístico para início, decaimento exponencial com meia-vida configurável para declínio) corresponde à realidade farmacológica do mecanismo de liberação estendida do Venvanse XR.",
      "Variável CSS para layout painel/canvas — o painel lateral retrátil usa uma única propriedade customizada CSS --panel-left para animar tanto a posição do painel quanto o deslocamento do canvas. Alternar o painel atualiza uma variável; ambos os elementos transitam juntos.",
      "Pulsação de batimento cardíaco usando sinusóide de duplo pico — a intensidade emissiva do segmento ativo segue: base + exp(-((r-0,12)/0,06)²) + 0,6×exp(-((r-0,34)/0,07)²), onde r = (tempo mod 1,8s) / 1,8. Os dois picos gaussianos criam um padrão de duplo batimento fisiologicamente preciso.",
    ],
    learnings: [
      "3D metaphor adds meaning when the geometry encodes the data — the helix is not decorative. Its spatial structure (longer segments = longer phases, marker position = elapsed time) means users can read pharmacokinetic state spatially without reading numbers. The metaphor earns its complexity.",
      "Parametric curves enable marker-on-curve positioning without extra data structures — given a t value (elapsed/total), the curve's getPoint(t) returns the exact 3D world position for the marker. No lookup table or interpolation needed; the math is the data structure.",
      "Zero-dependency vanilla JS is a valid production target for single-purpose tools — the app has no npm, no bundler, no framework. This made iterating on 3D geometry and pharmacokinetic math extremely fast: save, reload, see. For a personal health tool used by one person, the simplicity tradeoff is clearly correct.",
      "System notifications require careful deduplication — early versions sent duplicate notifications when the user reloaded the page near a phase boundary. Comparing g.at - now > 0 before scheduling each notification (rather than scheduling all on page load) eliminated duplicates without requiring persistent notification state.",
    ],
    learningsPt: [
      "A metáfora 3D adiciona significado quando a geometria codifica os dados — a hélice não é decorativa. Sua estrutura espacial (segmentos mais longos = fases mais longas, posição do marcador = tempo decorrido) significa que os usuários podem ler o estado farmacocinético espacialmente sem ler números.",
      "Curvas paramétricas permitem posicionamento marcador-na-curva sem estruturas de dados extras — dado um valor t (decorrido/total), getPoint(t) da curva retorna a posição 3D exata para o marcador. Sem tabela de lookup ou interpolação necessária; a matemática é a estrutura de dados.",
      "JS puro sem dependências é um alvo de produção válido para ferramentas de propósito único — sem npm, sem bundler, sem framework. Isso tornou a iteração em geometria 3D e matemática farmacocinética extremamente rápida.",
      "Notificações do sistema requerem deduplicação cuidadosa — versões iniciais enviavam notificações duplicadas quando o usuário recarregava a página próximo a um limite de fase. Comparar g.at - now > 0 antes de agendar cada notificação eliminou duplicatas sem exigir estado persistente de notificação.",
    ],
    status: "Live — deployed to GitHub Pages",
    statusPt: "Ativo — publicado no GitHub Pages",
    githubUrl: "https://github.com/claytonbrgsdev/medication-cycles-tracker",
    liveUrl: "https://claytonbrgsdev.github.io/medication-cycles-tracker/",
    featured: false,
    year: 2025,
  },
  {
    id: "estock",
    nameEn: "eStock – Inventory Control System",
    namePt: "eStock – Sistema de Controle de Estoque",
    name: "eStock",
    type: "Full-Stack Web Application / Business Tool",
    descriptionEn:
      "Real-time inventory management system built for small businesses. Firebase-backed product catalog with brand/model/name taxonomy, quantity tracking, bulk operations, CSV import, and a formatted list export feature — all behind Firebase Auth with Redux-persisted session state.",
    descriptionPt:
      "Sistema de gestão de estoque em tempo real desenvolvido para pequenas empresas. Catálogo de produtos com taxonomia marca/modelo/nome no Firebase, controle de quantidades, operações em lote, importação CSV e exportação de lista formatada — tudo protegido por Firebase Auth com estado de sessão persistido via Redux.",
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Redux Toolkit",
      "Redux Persist",
      "Firebase",
      "Firestore",
      "Ant Design",
      "Material UI",
      "PapaParse",
      "Formik",
      "Yup",
      "Framer Motion",
      "React Router DOM",
    ],
    categories: ["web-app"],
    highlights: [
      "Optimistic UI updates with automatic Firestore rollback on error",
      "CSV bulk import via PapaParse with ref-forwarded file input pattern",
      "Formatted list export: filter by brand/model/name, toggle quantity, copy to clipboard",
      "Duplicate detection before product creation (marca + modelo + nome composite check)",
      "Firebase Auth with browser-local persistence, AuthObserver, and session timeout hook",
    ],
    overview:
      "eStock is a browser-based inventory management system designed for small businesses that need a reliable alternative to spreadsheets and WhatsApp lists. It stores products in Firestore with a three-level taxonomy (brand → model → name), tracks quantities in real time across sessions, and lets teams export formatted inventory lists with a single click. The entire app is protected by Firebase Auth with session persistence, meaning a page refresh doesn't require re-login.",
    overviewPt:
      "eStock é um sistema de controle de estoque baseado em navegador, criado para pequenas empresas que precisam de uma alternativa confiável a planilhas e listas no WhatsApp. Os produtos são armazenados no Firestore com uma taxonomia de três níveis (marca → modelo → nome), com quantidades rastreadas em tempo real entre sessões, e equipes podem exportar listas de estoque formatadas com um único clique. Todo o app é protegido por Firebase Auth com persistência de sessão — um refresh na página não exige novo login.",
    problem:
      "Small retail and distribution businesses in Brazil often track inventory through shared spreadsheets or informal WhatsApp group messages. These systems break down quickly: concurrent edits cause data loss, there's no history of quantity changes, and generating a formatted product list for a supplier or client requires manual copy-paste work. eStock was built to replace that workflow with a structured, real-time web app.",
    problemPt:
      "Pequenas empresas de varejo e distribuição no Brasil frequentemente controlam estoque por planilhas compartilhadas ou mensagens informais no WhatsApp. Esses sistemas quebram rapidamente: edições simultâneas causam perda de dados, não existe histórico de alterações de quantidade, e gerar uma lista formatada de produtos para fornecedor ou cliente exige trabalho manual de copiar e colar. O eStock foi criado para substituir esse fluxo por um app web estruturado e em tempo real.",
    goal:
      "Build a multi-user inventory system that: (1) organizes products by brand, model, and name for fast filtering; (2) supports quantity increments and decrements with validation (no negative stock); (3) allows bulk CSV import for initial data migration; (4) generates formatted text lists ready to paste into messages or emails; (5) requires no backend infrastructure beyond Firebase.",
    goalPt:
      "Construir um sistema de estoque multiusuário que: (1) organize produtos por marca, modelo e nome para filtragem rápida; (2) suporte incrementos e decrementos de quantidade com validação (sem estoque negativo); (3) permita importação em lote via CSV para migração inicial de dados; (4) gere listas de texto formatadas prontas para colar em mensagens ou emails; (5) não exija infraestrutura de backend além do Firebase.",
    role: ["Solo developer — architecture, frontend, data modeling, Firebase integration"],
    rolePt: ["Desenvolvedor solo — arquitetura, frontend, modelagem de dados, integração Firebase"],
    technicalDecisions: [
      "Firebase Firestore as the primary database — Firestore's real-time subscription model means any quantity update is reflected instantly across all open sessions without manual polling. Its document-collection structure maps cleanly to the brand/model/name taxonomy, and Firebase Auth + Firestore security rules enforce row-level access without a dedicated backend.",
      "Redux Toolkit + Redux Persist for global state — rather than using Context API or local state for the product list, Redux Toolkit provides predictable, serializable state updates with async thunks for Firestore operations. Redux Persist serializes the store to localStorage so the product list survives page refreshes — important for slow connections where a Firestore fetch on every load would degrade UX.",
      "Optimistic UI for quantity updates — the updateProductQuantity thunk dispatches the new quantity to Redux immediately, then writes to Firestore. If the write fails, a compensating dispatch reverts the local state to the previous value. This makes quantity increments feel instant even on slow connections.",
      "Dual UI libraries: Ant Design + Material UI — Ant Design's Table component was chosen for StockManagement because of its built-in multi-column sort, filter, and pagination. Material UI was used for other layout and form components where its design system aligned better. Mixing libraries adds bundle weight, but the productivity gains justified it for a business tool.",
      "Formik + Yup for form validation — the AddProduct form has non-trivial validation: quantity must be a positive number on first creation, brand and model can be either selected from existing values or typed as new ones. Yup schemas express these rules declaratively and integrate cleanly with Formik's field-level error display.",
      "PapaParse CSV import with ref-forwarded file input — CSV bulk import uses PapaParse to parse browser-selected files into product objects, then writes each to Firestore. The file input element is hidden and triggered programmatically via forwardRef, keeping the UI clean — a visible button in the toolbar triggers the hidden input without exposing raw file input styling.",
      "Three-level product taxonomy (brand → model → name) — instead of a single product name field, products are organized by brand (marca), model (modelo), and specific name (nome). This structure enables the list export feature to filter and group at any level, and prevents ambiguous duplicates — the uniqueness check queries all three fields together before allowing a new product.",
      "Formatted list export for real-world shareability — the ListExport page converts filtered products into a plain-text string (optionally including quantities) and copies it to the clipboard. Business owners needed to paste inventory lists into WhatsApp messages, supplier emails, and order forms. The toggle for including or excluding quantities handles both use cases.",
      "AuthObserver + session timeout hook — an AuthObserver component subscribes to Firebase's onAuthStateChanged at the app root, syncing auth state to Redux without prop drilling. A separate useSessionTimeout hook automatically signs out the user after a configurable period of inactivity, which is important for shared devices in a warehouse or retail environment.",
    ],
    technicalDecisionsPt: [
      "Firebase Firestore como banco de dados principal — o modelo de subscription em tempo real do Firestore faz com que qualquer atualização de quantidade seja refletida imediatamente em todas as sessões abertas, sem polling manual. Sua estrutura de documentos e coleções mapeia naturalmente para a taxonomia marca/modelo/nome, e as regras de segurança do Firebase Auth + Firestore aplicam acesso por linha sem necessidade de um backend dedicado.",
      "Redux Toolkit + Redux Persist para estado global — em vez de usar Context API ou estado local para a lista de produtos, o Redux Toolkit fornece atualizações de estado previsíveis e serializáveis com async thunks para operações no Firestore. O Redux Persist serializa o store no localStorage para que a lista sobreviva a refreshes — importante para conexões lentas onde um fetch a cada carregamento degradaria a UX.",
      "UI otimista para atualizações de quantidade — o thunk updateProductQuantity despacha a nova quantidade para o Redux imediatamente e depois escreve no Firestore. Se a escrita falhar, um dispatch compensatório reverte o estado local ao valor anterior. Isso faz os incrementos de quantidade parecerem instantâneos mesmo em conexões lentas.",
      "Bibliotecas de UI duplas: Ant Design + Material UI — o componente Table do Ant Design foi escolhido para o StockManagement por ter ordenação multi-coluna, filtros e paginação embutidos. O Material UI foi usado para outros componentes de layout e formulário onde seu design system se adequava melhor. Misturar bibliotecas aumenta o bundle, mas os ganhos de produtividade justificaram para uma ferramenta de negócios.",
      "Formik + Yup para validação de formulários — o formulário AddProduct tem validação não trivial: a quantidade deve ser positiva na primeira criação, marca e modelo podem ser selecionados de valores existentes ou digitados como novos. Os schemas Yup expressam essas regras de forma declarativa e se integram bem ao sistema de exibição de erros por campo do Formik.",
      "Importação CSV com PapaParse e file input por ref — a importação CSV em lote usa o PapaParse para transformar arquivos selecionados no navegador em objetos de produto escritos no Firestore. O elemento de input de arquivo fica oculto e é acionado programaticamente via forwardRef, mantendo a UI limpa — um botão visível na toolbar aciona o input oculto sem expor o estilo nativo do file input.",
      "Taxonomia de três níveis (marca → modelo → nome) — em vez de um único campo de nome de produto, os produtos são organizados por marca, modelo e nome específico. Essa estrutura permite que o recurso de exportação de lista filtre e agrupe em qualquer nível, além de prevenir duplicatas ambíguas — a verificação de unicidade consulta os três campos juntos antes de permitir a criação de um novo produto.",
      "Exportação de lista formatada para compartilhamento no mundo real — a página ListExport converte os produtos filtrados em uma string de texto simples (opcionalmente incluindo quantidades) e copia para a área de transferência. Os donos de negócio precisavam colar listas de estoque em mensagens de WhatsApp, e-mails para fornecedores e formulários de pedido. O toggle para incluir ou não as quantidades atende a ambos os casos de uso.",
      "AuthObserver + hook de timeout de sessão — um componente AuthObserver se inscreve no onAuthStateChanged do Firebase na raiz do app, sincronizando o estado de autenticação com o Redux sem prop drilling. Um hook useSessionTimeout separado desloga automaticamente o usuário após um período configurável de inatividade — importante para dispositivos compartilhados em armazéns ou ambientes de varejo.",
    ],
    learnings: [
      "Optimistic updates significantly improve perceived performance for high-frequency actions like stock adjustments — but require careful rollback logic to keep UI and database in sync when writes fail.",
      "Firebase Firestore security rules are a first-class architecture concern: defining them upfront alongside the data model prevented having to refactor access control mid-project.",
      "Mixing Ant Design and MUI in the same project is manageable but requires intentional scoping — both libraries inject global CSS resets and their theming systems don't compose natively.",
      "PapaParse's configuration surface is wide enough to handle messy real-world CSVs (inconsistent headers, extra whitespace), but validating and mapping parsed rows to your data model still requires explicit transformation logic.",
      "Redux Persist solves the page-refresh UX problem elegantly, but serializing large product lists to localStorage can cause hydration latency on initial load — worth profiling before enabling persistReducer on large datasets.",
    ],
    learningsPt: [
      "Atualizações otimistas melhoram significativamente a performance percebida para ações de alta frequência como ajustes de estoque — mas exigem lógica de rollback cuidadosa para manter UI e banco sincronizados quando escritas falham.",
      "As regras de segurança do Firestore são uma preocupação de arquitetura de primeira classe: defini-las antecipadamente junto com o modelo de dados evitou ter que refatorar o controle de acesso no meio do projeto.",
      "Misturar Ant Design e MUI no mesmo projeto é gerenciável, mas requer escopo intencional — ambas as bibliotecas injetam resets CSS globais e seus sistemas de theming não se compõem nativamente.",
      "A superfície de configuração do PapaParse é ampla o suficiente para lidar com CSVs do mundo real bagunçados (cabeçalhos inconsistentes, espaços extras), mas validar e mapear as linhas para o modelo de dados ainda exige lógica de transformação explícita.",
      "O Redux Persist resolve o problema de UX do refresh de página de forma elegante, mas serializar grandes listas de produtos no localStorage pode causar latência de hidratação no carregamento inicial — vale medir antes de habilitar o persistReducer em datasets grandes.",
    ],
    status: "Functional — deployed and used in production by a small business client",
    statusPt: "Funcional — implantado e utilizado em produção por um cliente de pequena empresa",
    githubUrl: "https://github.com/estock-dev/estock-control",
    featured: false,
    year: 2025,
  },
  {
    id: "slack-translator",
    nameEn: "SlackTranslator – Real-Time Translation Bot",
    namePt: "SlackTranslator – Bot de Tradução em Tempo Real",
    name: "SlackTranslator",
    type: "Real-Time Communication Tool / AI Integration",
    descriptionEn:
      "Privacy-first real-time Slack translator built in pure Ruby. Incoming messages are translated English→Portuguese by a local LLM (Ollama) and pushed to a two-column web UI via SSE. Replies are translated back before posting, with a confirmation step to catch LLM errors. No cloud API keys — all inference runs on-device.",
    descriptionPt:
      "Tradutor Slack em tempo real focado em privacidade, construído em Ruby puro. Mensagens recebidas são traduzidas EN→PT por um LLM local (Ollama) e empurradas para uma UI web de duas colunas via SSE. Respostas são traduzidas de volta antes do envio, com etapa de confirmação para capturar erros do LLM. Sem chaves de API externas — toda inferência roda on-device.",
    tech: ["Ruby", "WEBrick", "WebSocket", "Slack Socket Mode API", "Ollama", "Deepseek R1", "SSE", "Sequel ORM", "PostgreSQL", "SQLite", "Docker"],
    categories: ["ai-ml", "web-app"],
    highlights: [
      "Privacy-first: all LLM inference runs locally via Ollama — no data sent to external APIs.",
      "Bidirectional translation flow: EN→PT on incoming Slack messages, PT→EN with confirmation before posting.",
      "Real-time SSE push with per-client UUID queue — no polling, no cross-client message bleed.",
      "WebSocket reconnection with exponential backoff (±20% jitter) + watchdog thread monitoring connection health.",
      "Built in pure Ruby with WEBrick — no Rails, no Sinatra — as a deliberate low-level demonstration.",
    ],
    overview:
      "SlackTranslator is a real-time multilingual communication tool for Slack that lets non-native English speakers read and reply in their own language without leaving the workflow. Incoming English messages are captured via Slack's Socket Mode WebSocket API, translated to Portuguese by a local Ollama model, and pushed to a two-column web interface in real time using Server-Sent Events. When the user composes a reply in Portuguese, it is translated back to English and shown for confirmation before being posted to Slack — catching any LLM mistranslation before it reaches colleagues.",
    overviewPt:
      "SlackTranslator é uma ferramenta de comunicação multilíngue em tempo real para o Slack que permite que falantes não nativos de inglês leiam e respondam no próprio idioma sem sair do fluxo de trabalho. Mensagens em inglês são capturadas via Socket Mode API do Slack (WebSocket), traduzidas para o português por um modelo Ollama local e empurradas para uma interface web de duas colunas em tempo real via SSE. Ao redigir uma resposta em português, ela é traduzida de volta para o inglês e exibida para confirmação antes de ser postada no Slack — evitando que erros do LLM cheguem aos colegas.",
    problem:
      "International teams using Slack face a constant friction tax: non-native English speakers must translate every message mentally, draft a reply in English, and hope the wording sounds natural. This cognitive load compounds during fast-moving conversations. Cloud translation APIs (Google Translate, DeepL) solve the translation problem but introduce a privacy risk — every message in the channel gets sent to a third-party server. For professional environments handling confidential project discussions, that trade-off is unacceptable.",
    problemPt:
      "Times internacionais que usam Slack enfrentam um custo constante de atrito: falantes não nativos de inglês precisam traduzir mentalmente cada mensagem, redigir uma resposta em inglês e torcer para que a formulação soe natural. Essa carga cognitiva se acumula em conversas rápidas. APIs de tradução em nuvem (Google Translate, DeepL) resolvem o problema de tradução, mas introduzem um risco de privacidade — cada mensagem do canal é enviada a um servidor de terceiros. Para ambientes profissionais que lidam com discussões confidenciais, essa troca é inaceitável.",
    goal:
      "Build a real-time Slack translation layer that: (1) runs entirely on-device using a local LLM so no messages leave the machine; (2) streams translations to the UI as messages arrive, with zero polling; (3) lets the user compose replies in their native language and review the English translation before posting; (4) stays robust across WebSocket disconnects and multiple concurrent browser sessions.",
    goalPt:
      "Construir uma camada de tradução Slack em tempo real que: (1) rode inteiramente on-device usando um LLM local, para que nenhuma mensagem saia da máquina; (2) transmita traduções para a UI conforme as mensagens chegam, sem polling; (3) permita ao usuário redigir respostas no próprio idioma e revisar a tradução em inglês antes de enviar; (4) mantenha estabilidade em desconexões WebSocket e múltiplas sessões simultâneas no browser.",
    role: ["Solo developer — architecture, backend, frontend, DevOps"],
    rolePt: ["Desenvolvedor solo — arquitetura, backend, frontend, DevOps"],
    technicalDecisions: [
      "Pure Ruby with WEBrick (no Rails/Sinatra) — a deliberate architectural choice for the job interview context: demonstrating the ability to build HTTP routing, SSE streaming, and WebSocket integration from primitives rather than relying on framework abstractions.",
      "Slack Socket Mode API over the deprecated RTM API — Socket Mode uses WebSocket rather than a persistent HTTP connection, eliminating the need for a public-facing webhook URL and making local development straightforward.",
      "Per-client UUID SSE queue — each browser tab registers a UUID (stored in a cookie) and gets its own in-memory queue. The SSE thread reads from that queue and writes to a pipe the WEBrick response body consumes. This prevents cross-client message bleed and survives multiple concurrent sessions without shared mutable state issues.",
      "EVENT_QUEUE for async Slack event processing — Slack events are pushed to an unbounded Queue and processed by a dedicated thread, preventing the WEBrick handler from blocking during Ollama translation (which can take 2–15s depending on message length and model).",
      "Exponential backoff with ±20% jitter on WebSocket reconnect — prevents thundering herd when Slack disconnects multiple clients simultaneously. Backoff doubles each attempt, capped at 30s. A separate watchdog thread triggers a forced reconnect if no events arrive for >30s.",
      "Ollama with Deepseek R1:14B — chosen over smaller models (Llama 3.1 8B was used in v1) for significantly better translation quality, especially for idiomatic Brazilian Portuguese. The `keep_alive: '5m'` parameter keeps the model warm between messages, reducing the first-token latency from ~8s to ~1.5s on subsequent requests.",
      "Translation confirmation step before posting — the UI shows the EN translation of the user's PT reply before sending to Slack. This catches the main failure mode of local LLMs: occasional mistranslations that would be embarrassing in a professional context.",
      "SQLite in development / PostgreSQL in production via Sequel ORM — Sequel's dataset API allows switching the adapter without changing query code. Migrations live in db/migrations so the schema is versioned.",
      "Docker Compose with host.docker.internal for Ollama — the translator runs in a container while Ollama runs on the host (GPU access). Docker's host gateway feature exposes the host's port 11434 inside the container without network gymnastics.",
    ],
    technicalDecisionsPt: [
      "Ruby puro com WEBrick (sem Rails/Sinatra) — escolha arquitetural deliberada para o contexto da entrevista técnica: demonstrar capacidade de construir roteamento HTTP, streaming SSE e integração WebSocket a partir de primitivas, em vez de depender de abstrações de framework.",
      "Slack Socket Mode API em vez da RTM API (descontinuada) — o Socket Mode usa WebSocket em vez de uma conexão HTTP persistente, eliminando a necessidade de uma URL de webhook pública e tornando o desenvolvimento local direto.",
      "Fila SSE com UUID por cliente — cada aba do browser registra um UUID (armazenado em cookie) e recebe sua própria fila em memória. A thread SSE lê dessa fila e escreve em um pipe consumido pelo corpo de resposta WEBrick. Isso evita vazamento de mensagens entre clientes e sobrevive a múltiplas sessões simultâneas sem problemas de estado mutável compartilhado.",
      "EVENT_QUEUE para processamento assíncrono de eventos Slack — eventos do Slack são empurrados para uma Queue sem limite e processados por uma thread dedicada, evitando que o handler WEBrick bloqueie durante a tradução Ollama (que pode levar de 2 a 15s dependendo do tamanho da mensagem e do modelo).",
      "Backoff exponencial com jitter ±20% no reconect WebSocket — evita thundering herd quando o Slack desconecta múltiplos clientes simultaneamente. O backoff dobra a cada tentativa, com teto de 30s. Uma thread watchdog separada força o reconnect se nenhum evento chegar em >30s.",
      "Ollama com Deepseek R1:14B — escolhido sobre modelos menores (Llama 3.1 8B foi usado na v1) pela qualidade de tradução significativamente melhor, especialmente para português brasileiro idiomático. O parâmetro `keep_alive: '5m'` mantém o modelo quente entre mensagens, reduzindo a latência do primeiro token de ~8s para ~1,5s nas requisições subsequentes.",
      "Etapa de confirmação de tradução antes do envio — a UI exibe a tradução EN da resposta PT do usuário antes de enviar ao Slack. Isso captura o principal modo de falha de LLMs locais: mistranslations ocasionais que seriam constrangedoras em um contexto profissional.",
      "SQLite em desenvolvimento / PostgreSQL em produção via Sequel ORM — a API de dataset do Sequel permite trocar o adaptador sem alterar o código de queries. Migrations ficam em db/migrations para que o schema seja versionado.",
      "Docker Compose com host.docker.internal para Ollama — o tradutor roda em container enquanto o Ollama roda no host (acesso à GPU). O recurso de gateway do Docker expõe a porta 11434 do host dentro do container sem configurações de rede complexas.",
    ],
    learnings: [
      "SSE state isolation requires explicit per-client identity from the start. The first version used a shared global array of client IDs — any new message was broadcast to all connected tabs, causing duplicated and out-of-order messages. Switching to UUID-keyed queues (cookie-synced between the SSE connection and the message endpoint) eliminated the problem entirely.",
      "Local LLM latency must be designed around, not ignored. The first architecture called Ollama synchronously inside the WEBrick request handler — a 10s translation blocked every other HTTP request. Moving to an EVENT_QUEUE processed by a dedicated thread decoupled request handling from inference time completely.",
      "WebSocket keepalive is non-negotiable with Slack Socket Mode. Slack closes idle WebSocket connections silently after ~30s with no ping. Without the 10-second ping timer and the watchdog thread, the app would appear to work in testing but silently stop receiving messages in production.",
      "No-framework Ruby is a valid production pattern, not just a toy exercise. WEBrick handles concurrency (via thread pool), SSE streaming (via IO pipes), and static file serving without any additional dependencies. The constraint of not using a framework forced a deeper understanding of how HTTP servers, SSE, and WebSocket clients compose at the socket level.",
      "Translation confirmation UX is a product decision, not just a safety net. Users discovered they preferred reviewing the translation even when it was correct — it gave them confidence in what they were sending. The confirmation step turned from a bug-catcher into a core feature of the workflow.",
    ],
    learningsPt: [
      "O isolamento de estado SSE exige identidade explícita por cliente desde o início. A primeira versão usava um array global compartilhado de IDs de clientes — qualquer nova mensagem era transmitida para todas as abas conectadas, causando mensagens duplicadas e fora de ordem. A troca para filas com chave UUID (sincronizadas por cookie entre a conexão SSE e o endpoint de mensagem) eliminou o problema completamente.",
      "A latência de LLM local deve ser considerada no design, não ignorada. A primeira arquitetura chamava o Ollama de forma síncrona dentro do handler de requisição WEBrick — uma tradução de 10s bloqueava todas as outras requisições HTTP. Mover para uma EVENT_QUEUE processada por uma thread dedicada desacoplou completamente o tratamento de requisições do tempo de inferência.",
      "Keepalive WebSocket é obrigatório com o Socket Mode do Slack. O Slack fecha conexões WebSocket ociosas silenciosamente após ~30s sem ping. Sem o timer de ping de 10 segundos e a thread watchdog, o app pareceria funcionar nos testes, mas pararia silenciosamente de receber mensagens em produção.",
      "Ruby sem framework é um padrão de produção válido, não apenas um exercício. O WEBrick gerencia concorrência (via thread pool), streaming SSE (via pipes IO) e servir arquivos estáticos sem dependências adicionais. A restrição de não usar um framework forçou uma compreensão mais profunda de como servidores HTTP, SSE e clientes WebSocket se compõem no nível do socket.",
      "A UX de confirmação de tradução é uma decisão de produto, não apenas uma rede de segurança. Os usuários descobriram que preferiam revisar a tradução mesmo quando estava correta — isso lhes dava confiança no que estavam enviando. A etapa de confirmação passou de capturadora de bugs para funcionalidade central do fluxo de trabalho.",
    ],
    status: "Functional prototype — built as a job interview technical test",
    statusPt: "Protótipo funcional — construído como teste técnico para entrevista de emprego",
    githubUrl: "https://github.com/claytonbrgsdev/slack-translator",
    featured: true,
    year: 2025,
  },
  {
    id: "audio-transcription-app",
    nameEn: "Audio Transcription App",
    namePt: "App de Transcrição de Áudio",
    name: "Audio Transcription App",
    type: "AI-Powered Desktop Tool / Audio ML Pipeline",
    descriptionEn:
      "Local-first audio transcription and speaker diarization pipeline. Whisper (6 model tiers) converts speech to text; pyannote.audio 3.1 identifies speakers. Supports files up to 1GB via FFmpeg auto-segmentation with timestamp offset tracking, and exports to PDF/DOCX. Bilingual UI (EN/PT-BR).",
    descriptionPt:
      "Pipeline de transcrição de áudio e diarização de falantes local-first. Whisper (6 tiers de modelo) converte fala em texto; pyannote.audio 3.1 identifica falantes. Suporta arquivos até 1GB via segmentação automática FFmpeg com rastreamento de offset de timestamp, e exporta para PDF/DOCX. UI bilíngue (EN/PT-BR).",
    tech: ["Python 3.10+", "Streamlit 1.43", "OpenAI Whisper", "pyannote.audio 3.3", "PyTorch 2.6", "FFmpeg", "ReportLab", "python-docx"],
    categories: ["ai-ml", "audio"],
    highlights: [
      "Proportional audio segmentation: total_duration / num_segments keeps each FFmpeg chunk balanced; chunk_start offsets track global timeline for diarization alignment",
      "dFdx-style midpoint matching for speaker assignment: each Whisper segment's midpoint is checked against diarization timeline to assign speaker — handles speaker changes mid-segment",
      "Hardware-adaptive device detection: tries MPS (Apple Silicon), falls back to CPU silently; fp16=False for full precision over speed",
      "6 Whisper model tiers (tiny → large-v3): ~1GB RAM to 10GB VRAM; users trade accuracy for speed based on available hardware",
      "Bilingual UI: full EN/PT-BR localization via LANG_DICT; all labels, buttons, and help text switch language without page reload",
    ],
    overview:
      "Audio Transcription App is a local-first speech-to-text pipeline built with Streamlit that combines two state-of-the-art models: OpenAI Whisper for transcription and pyannote.audio for speaker diarization. Users upload audio (up to 1GB, any FFmpeg-supported format), select a Whisper model tier, and get a speaker-labeled transcript exported as PDF or DOCX. All inference runs locally — no audio leaves the machine. The app handles large files via proportional FFmpeg segmentation with timestamp offsets so the diarization timeline stays aligned across segments.",
    overviewPt:
      "O Audio Transcription App é um pipeline de fala-para-texto local-first construído com Streamlit que combina dois modelos state-of-the-art: OpenAI Whisper para transcrição e pyannote.audio para diarização de falantes. Usuários fazem upload de áudio (até 1GB, qualquer formato suportado pelo FFmpeg), selecionam um tier de modelo Whisper, e recebem uma transcrição com labels de falantes exportada como PDF ou DOCX. Toda a inferência roda localmente — nenhum áudio sai da máquina.",
    problem:
      "Transcription services like Otter.ai and Rev send audio to cloud servers — unacceptable for confidential interviews, medical consultations, or legal recordings. Local Whisper deployments handle transcription but not speaker identification. pyannote.audio handles diarization but requires aligning its output with Whisper's timestamps. The challenge was integrating both models into a pipeline where large files don't exhaust memory and speaker labels stay aligned after segmented transcription.",
    problemPt:
      "Serviços de transcrição como Otter.ai e Rev enviam áudio para servidores na nuvem — inaceitável para entrevistas confidenciais, consultas médicas ou gravações jurídicas. Implantações locais do Whisper lidam com transcrição, mas não com identificação de falantes. O pyannote.audio lida com diarização, mas requer alinhar sua saída com os timestamps do Whisper. O desafio era integrar ambos os modelos em um pipeline onde arquivos grandes não esgotam a memória e os labels de falante permanecem alinhados após transcrição segmentada.",
    goal:
      "Build a local-first transcription pipeline that: (1) runs entirely on-device with no cloud API calls; (2) handles audio files up to 1GB via segmentation; (3) assigns speaker labels to each Whisper segment using pyannote diarization; (4) exports labeled transcripts as PDF and DOCX; (5) provides a user-friendly Streamlit UI with bilingual support.",
    goalPt:
      "Construir um pipeline de transcrição local-first que: (1) rode inteiramente on-device sem chamadas a APIs na nuvem; (2) lide com arquivos de áudio até 1GB via segmentação; (3) atribua labels de falante a cada segmento Whisper usando diarização pyannote; (4) exporte transcrições com labels como PDF e DOCX; (5) forneça UI Streamlit amigável com suporte bilíngue.",
    role: ["Solo developer — ML pipeline architecture, audio processing, UI, export formats"],
    rolePt: ["Desenvolvedor solo — arquitetura do pipeline ML, processamento de áudio, UI, formatos de exportação"],
    technicalDecisions: [
      "Proportional FFmpeg segmentation for large files — instead of fixed-duration chunks (which can cut mid-sentence), total_duration is divided by the number of required segments to produce balanced chunks. Each chunk is resampled to 16kHz mono WAV (Whisper's expected input) and its start offset tracked. After transcription, segment timestamps are shifted by chunk_start to restore global timeline position.",
      "Midpoint matching for speaker assignment — for each Whisper segment, the speaker is determined by finding which diarization interval contains the segment's midpoint: (segment_start + segment_end) / 2. This handles the common case where a speaker changes mid-segment — the segment is assigned to whoever was speaking at the center, not the start.",
      "fp16=False for transcription quality — Whisper supports half-precision (fp16) inference which is faster but reduces accuracy, especially for non-English speech and noisy audio. Deliberately using full 32-bit float precision prioritizes transcription quality over speed. Users who need speed select a smaller model tier instead.",
      "pyannote/speaker-diarization-3.1 as gated model — pyannote's model requires Hugging Face account approval before download. This is intentional: it filters for serious use cases and reduces abuse. The app handles the HF token via environment variable; the gated access adds one setup step but ensures a production-grade diarization model.",
      "Streamlit session_state for speaker renaming — diarization returns generic labels (SPEAKER_00, SPEAKER_01). Streamlit's session_state persists the user's custom name mappings (e.g., 'Interviewer', 'Candidate') across interactions without re-running the pipeline. The transcript re-renders with updated names immediately when the mapping changes.",
      "Queue-based audio delivery for robustness — audio chunks are pushed to a Python queue between FFmpeg extraction and Whisper transcription. This decouples the extraction pace from the inference pace, allowing the pipeline to handle variable-length chunks without backpressure blocking FFmpeg.",
    ],
    technicalDecisionsPt: [
      "Segmentação FFmpeg proporcional para arquivos grandes — em vez de chunks de duração fixa (que podem cortar no meio de uma frase), total_duration é dividido pelo número de segmentos necessários para produzir chunks balanceados. Cada chunk é resampleado para 16kHz mono WAV e seu offset de início rastreado. Após a transcrição, os timestamps são deslocados por chunk_start para restaurar a posição global.",
      "Correspondência por ponto médio para atribuição de falante — para cada segmento Whisper, o falante é determinado encontrando qual intervalo de diarização contém o ponto médio do segmento: (início + fim) / 2. Isso lida com o caso comum onde um falante muda no meio do segmento.",
      "fp16=False para qualidade de transcrição — Whisper suporta inferência em meia-precisão (fp16) que é mais rápida, mas reduz a acurácia, especialmente para fala em línguas não-inglesas e áudio com ruído. Usar propositalmente precisão 32-bit prioriza qualidade de transcrição sobre velocidade.",
      "pyannote/speaker-diarization-3.1 como modelo restrito — o modelo do pyannote requer aprovação de conta no Hugging Face antes do download. O app lida com o token HF via variável de ambiente; o acesso restrito adiciona uma etapa de configuração, mas garante um modelo de diarização de nível de produção.",
      "session_state do Streamlit para renomear falantes — a diarização retorna labels genéricos (SPEAKER_00, SPEAKER_01). O session_state do Streamlit persiste os mapeamentos de nomes customizados do usuário (ex: 'Entrevistador', 'Candidato') entre interações sem re-executar o pipeline.",
      "Entrega de áudio via fila para robustez — chunks de áudio são empurrados para uma fila Python entre a extração FFmpeg e a transcrição Whisper. Isso desacopla o ritmo de extração do ritmo de inferência, permitindo que o pipeline lide com chunks de duração variável sem backpressure bloqueando o FFmpeg.",
    ],
    learnings: [
      "Midpoint matching is more robust than start-time matching for speaker assignment — early versions assigned speaker by checking which diarization interval contained segment_start. This failed when a speaker change happened 0.1s into a segment. Using the midpoint reduced misattributions significantly.",
      "Proportional segmentation requires tracking segment offsets explicitly — the first version concatenated Whisper outputs without offset correction. Diarization ran on the full file but transcription timestamps were relative to each chunk, causing speaker labels to be applied to the wrong sentences. Adding chunk_start offset to every segment timestamp fixed the alignment.",
      "Local LLM inference hardware matters enormously — the large-v3 model that produces best-quality transcripts runs in real time on a GPU but takes 3× wall-clock time on CPU for a 30-minute file. Exposing model selection to users with clear performance guidelines (tiny for quick drafts, large-v3 for final output on GPU) was more practical than picking one tier.",
      "Streamlit session_state is the right tool for multi-step ML workflows — the pipeline has 4 stages (upload, transcribe, diarize, label). Each stage is expensive. session_state caches each stage's output so editing speaker names doesn't re-run transcription. This pattern (stage → cache → next stage) is the correct Streamlit architecture for ML pipelines.",
    ],
    learningsPt: [
      "A correspondência por ponto médio é mais robusta que a correspondência por tempo de início para atribuição de falante — versões iniciais atribuíam falante verificando qual intervalo de diarização continha segment_start. Isso falhava quando uma mudança de falante ocorria 0,1s dentro do segmento.",
      "A segmentação proporcional requer rastreamento explícito de offsets — a primeira versão concatenava saídas do Whisper sem correção de offset. A diarização rodava no arquivo completo, mas os timestamps de transcrição eram relativos a cada chunk, causando labels de falante aplicados às frases erradas.",
      "O hardware para inferência ML local importa enormemente — o modelo large-v3 roda em tempo real em GPU, mas leva 3× o tempo real em CPU para um arquivo de 30 minutos. Expor a seleção de modelo para usuários com diretrizes claras de desempenho foi mais prático que escolher um tier.",
      "O session_state do Streamlit é a ferramenta certa para workflows ML em múltiplas etapas — o pipeline tem 4 estágios (upload, transcrição, diarização, label). O session_state cacheia a saída de cada estágio para que editar nomes de falantes não re-execute a transcrição.",
    ],
    status: "Functional — local desktop tool for private transcription workflows",
    statusPt: "Funcional — ferramenta desktop local para workflows de transcrição privados",
    featured: false,
    year: 2025,
  },
  {
    id: "spectations",
    nameEn: "SPECtations – Audio Visualizer",
    namePt: "SPECtations – Visualizador de Áudio",
    name: "SPECtations",
    type: "Native macOS Desktop App / Real-Time Audio Analysis",
    descriptionEn:
      "macOS desktop app for real-time system audio visualization via BlackHole loopback. Dual FFT pipeline: np.fft.rfft at 15fps for live waveform; scipy.signal.spectrogram at n_fft=2048 for a scrolling 5-second time-frequency heatmap. OpenGL-accelerated via PyQtGraph. Distributable as a .app bundle via PyInstaller.",
    descriptionPt:
      "App desktop macOS para visualização de áudio do sistema em tempo real via loopback BlackHole. Pipeline FFT duplo: np.fft.rfft a 15fps para forma de onda ao vivo; scipy.signal.spectrogram com n_fft=2048 para heatmap tempo-frequência deslizante de 5 segundos. Acelerado por OpenGL via PyQtGraph. Distribuível como bundle .app via PyInstaller.",
    tech: ["Python 3.10+", "PySide6 6.5", "PyQtGraph 0.13", "sounddevice", "NumPy", "SciPy", "BlackHole", "PyInstaller"],
    categories: ["audio"],
    image: "/projects/SPECtations/project-spectogram.jpeg",
    highlights: [
      "BlackHole 2ch loopback: only way to capture macOS system audio output as input — routes all output back as a virtual input device without muting speakers",
      "Dual FFT resolution: 1024-point rfft for real-time waveform (low latency); 2048-point STFT with 75% overlap for spectrogram (higher frequency resolution)",
      "Drop-oldest queue policy: PortAudio callback pushes 1024-frame blocks to a maxsize=10 Queue; full queue discards oldest chunk over blocking — prevents memory growth on processing lag",
      "Split timers: 15fps QTimer for audio+visualization updates; 60fps QTimer for particle overlay animation — decouples audio processing from visual effects",
      "PyInstaller .spec file for standalone .app distribution — no Python environment required on target machine",
    ],
    overview:
      "SPECtations is a macOS desktop application for real-time visualization of system audio output. It captures all audio playing through the Mac (music, video, any app) using BlackHole, a virtual audio loopback driver, processes it with two independent FFT pipelines, and renders synchronized waveform and spectrogram views. The app was built for continuous background use during music production and media work — designed to sit on a second monitor, always on, with a rich preset system (colormap, sensitivity, persistence effects) and an output window for presentation display.",
    overviewPt:
      "SPECtations é um aplicativo desktop macOS para visualização em tempo real do áudio de saída do sistema. Captura todo o áudio sendo reproduzido no Mac (música, vídeo, qualquer app) usando o BlackHole, um driver de loopback de áudio virtual, processa com dois pipelines FFT independentes e renderiza visualizações sincronizadas de forma de onda e espectrograma. O app foi criado para uso contínuo em segundo plano durante produção musical e trabalho com mídia.",
    problem:
      "macOS does not expose system audio output as a capturable input device (unlike Windows WASAPI loopback). Existing audio visualizers either require routing audio through a DAW or only visualize microphone input. The engineering challenge was both at the OS level (BlackHole workaround) and the signal processing level: a single FFT size produces a tradeoff between time resolution (good for real-time waveform) and frequency resolution (good for spectrogram). Two sizes were needed simultaneously.",
    problemPt:
      "O macOS não expõe a saída de áudio do sistema como um dispositivo de entrada capturável (ao contrário do loopback WASAPI do Windows). Os visualizadores de áudio existentes exigem roteamento pelo DAW ou só visualizam entrada do microfone. O desafio de engenharia era tanto no nível do SO (workaround BlackHole) quanto no nível de processamento de sinal: um único tamanho FFT produz um tradeoff entre resolução temporal (boa para forma de onda) e resolução de frequência (boa para espectrograma).",
    goal:
      "Build a macOS native audio visualizer that: (1) captures system audio output via BlackHole without muting speakers; (2) runs two FFT pipelines with different resolutions simultaneously; (3) renders a scrolling spectrogram heatmap and real-time waveform; (4) supports rich preset configuration (35 colormaps, sensitivity, persistence); (5) distributes as a standalone .app without requiring Python installation.",
    goalPt:
      "Construir um visualizador de áudio nativo para macOS que: (1) capture a saída de áudio do sistema via BlackHole sem silenciar os alto-falantes; (2) execute dois pipelines FFT com resoluções diferentes simultaneamente; (3) renderize um heatmap de espectrograma deslizante e forma de onda em tempo real; (4) suporte configuração rica de presets (35 colormaps, sensibilidade, persistência); (5) distribua como .app standalone sem exigir instalação do Python.",
    role: ["Solo developer — audio pipeline, signal processing, Qt UI, macOS packaging"],
    rolePt: ["Desenvolvedor solo — pipeline de áudio, processamento de sinal, UI Qt, empacotamento macOS"],
    technicalDecisions: [
      "BlackHole 2ch as the only viable macOS loopback solution — macOS's privacy model prevents direct capture of audio output. BlackHole acts as a virtual output device that simultaneously exposes itself as an input. A Multi-Output Device in Audio MIDI Setup routes audio to both real speakers and BlackHole simultaneously, so the user hears audio normally while SPECtations captures it.",
      "Dual FFT sizes: 1024 for waveform, 2048 for spectrogram — the waveform needs low latency (1024 samples ≈ 23ms per chunk at 44.1kHz) with acceptable frequency resolution. The spectrogram needs higher frequency resolution (2048-point FFT gives 21.5Hz per bin) but can be computed at a lower rate. Using scipy.signal.spectrogram with 75% overlap for the historical view vs. np.fft.rfft for the real-time view gives each visualization its optimal parameters.",
      "Drop-oldest queue policy for the producer/consumer boundary — PortAudio calls the audio callback on a real-time thread; Qt runs on the main thread. The Queue(maxsize=10) decouples them. When processing lags (e.g., slow spectrogram computation), the queue fills up. Dropping the oldest chunk (rather than blocking the audio thread or growing unbounded) accepts occasional visual glitches over memory exhaustion or audio thread stalls.",
      "15fps update rate for readability — an initial 30fps update rate made waveforms move too fast to read in real time. Reducing to 15fps (≈3 audio chunks per GUI frame at 44.1kHz/1024) makes movements readable. The 60fps particle animation timer runs independently so visual overlay effects remain fluid.",
      "PySide6 6.5.0 pinned exactly — PyQtGraph had version-specific integration issues with Qt 6.4–6.6. The exact 6.5.0 pin resolved a rendering bug in PyQtGraph's ImageItem update path that caused spectrogram frames to occasionally drop. Version range (>=6.5) was insufficient; exact pinning was required.",
      "PyInstaller for .app distribution — the app was intended for use without a Python environment. PyInstaller bundles Python interpreter, all dependencies (PyTorch included), and the app entry point into a self-contained macOS .app. The .spec file handles Apple Silicon ARM64-specific binary inclusions and excludes test files to reduce bundle size.",
    ],
    technicalDecisionsPt: [
      "BlackHole 2ch como única solução de loopback macOS viável — o modelo de privacidade do macOS impede a captura direta da saída de áudio. O BlackHole age como um dispositivo de saída virtual que simultaneamente se expõe como entrada. Um Multi-Output Device no Audio MIDI Setup roteia o áudio tanto para os alto-falantes reais quanto para o BlackHole.",
      "Tamanhos FFT duais: 1024 para forma de onda, 2048 para espectrograma — a forma de onda precisa de baixa latência (1024 amostras ≈ 23ms). O espectrograma precisa de maior resolução de frequência (FFT de 2048 pontos dá 21,5Hz por bin). scipy.signal.spectrogram com 75% de sobreposição para a visão histórica vs. np.fft.rfft para a visão em tempo real dá a cada visualização seus parâmetros ótimos.",
      "Política drop-oldest na fronteira produtor/consumidor — o PortAudio chama o callback de áudio em uma thread em tempo real; o Qt roda na thread principal. A Queue(maxsize=10) os desacopla. Quando o processamento fica para trás, a fila enche. Descartar o chunk mais antigo aceita glitches visuais ocasionais sobre esgotamento de memória ou travamento da thread de áudio.",
      "Taxa de atualização de 15fps para legibilidade — uma taxa inicial de 30fps fazia as formas de onda se moverem rápido demais para leitura em tempo real. Reduzir para 15fps torna os movimentos legíveis. O timer de animação de partículas de 60fps roda independentemente.",
      "PySide6 6.5.0 fixado exatamente — o PyQtGraph tinha problemas de integração específicos de versão com Qt 6.4–6.6. O fix exato de 6.5.0 resolveu um bug de renderização no caminho de atualização do ImageItem do PyQtGraph.",
      "PyInstaller para distribuição .app — bundlea o interpretador Python, todas as dependências (incluindo PyTorch) e o ponto de entrada do app em um .app macOS autocontido.",
    ],
    learnings: [
      "BlackHole routing requires a Multi-Output Device setup that is non-obvious — the user must create a combined device in Audio MIDI Setup that sends audio to both real speakers and BlackHole. Without this, audio is routed exclusively to BlackHole and the speakers are silent. This is now documented prominently in the README.",
      "Dual FFT resolution is worth the code complexity — early versions used a single 1024-point FFT for both views. The waveform was fine, but the spectrogram looked smeared with poor frequency distinction between close pitches. Adding a second scipy.signal.spectrogram computation at 2048 points dramatically improved spectrogram quality at minimal performance cost.",
      "ARM64-native Python matters for PortAudio on Apple Silicon — Rosetta-translated x86_64 Python worked for computation but caused PortAudio to misidentify audio devices and occasionally crash on M1/M2 machines. Requiring ARM64 Homebrew Python eliminated these issues.",
      "PyQtGraph is significantly faster than matplotlib for real-time visualization — an early matplotlib prototype with blitting ran at 8fps before dropping frames. Switching to PyQtGraph (OpenGL-backed) achieved stable 15fps with the same data volume and better color accuracy.",
    ],
    learningsPt: [
      "O roteamento BlackHole exige uma configuração Multi-Output Device não óbvia — o usuário deve criar um dispositivo combinado no Audio MIDI Setup que envie áudio tanto para alto-falantes reais quanto para o BlackHole. Sem isso, o áudio é roteado exclusivamente para o BlackHole e os alto-falantes ficam silenciosos.",
      "Resolução FFT dupla vale a complexidade de código — versões iniciais usavam um único FFT de 1024 pontos para ambas as visões. O espectrograma parecia borrado com baixa distinção de frequência. Adicionar um segundo cálculo scipy.signal.spectrogram em 2048 pontos melhorou dramaticamente a qualidade.",
      "Python nativo ARM64 importa para o PortAudio no Apple Silicon — o Python x86_64 traduzido por Rosetta funcionava para computação, mas causava o PortAudio a identificar incorretamente dispositivos de áudio e ocasionalmente travar em máquinas M1/M2.",
      "PyQtGraph é significativamente mais rápido que matplotlib para visualização em tempo real — um protótipo matplotlib rodava a 8fps antes de perder frames. Mudar para PyQtGraph (com backend OpenGL) alcançou 15fps estável.",
    ],
    status: "Functional — personal desktop tool, distributable as macOS .app",
    statusPt: "Funcional — ferramenta desktop pessoal, distribuível como .app macOS",
    githubUrl: "https://github.com/claytonbrgsdev/SPECtations",
    featured: false,
    year: 2025,
  },
  {
    id: "data-engineering-pipelines",
    nameEn: "Data Engineering Pipelines",
    namePt: "Pipelines de Engenharia de Dados",
    name: "Data Engineering Pipelines",
    type: "Data Engineering / Closed-Loop Attribution Pipeline",
    descriptionEn:
      "Google Ads closed-loop attribution ETL: hourly dbt VIEW transforms raw PostgreSQL conversion events into the Google Ads API schema; daily Airflow DAG uploads click conversions via OAuth2. Built on Astronomer Runtime with Docker, dbt-postgres, and pytest DAG validation.",
    descriptionPt:
      "ETL de atribuição fechada para Google Ads: VIEW dbt horária transforma eventos de conversão brutos do PostgreSQL para o schema da API do Google Ads; DAG Airflow diário faz upload de conversões de clique via OAuth2. Construído no Astronomer Runtime com Docker, dbt-postgres e validação de DAGs com pytest.",
    tech: ["Apache Airflow 2.x", "dbt 1.7", "PostgreSQL 13", "Docker", "Google Ads API v1", "Python", "Astronomer Runtime 10.6"],
    categories: ["data-engineering"],
    highlights: [
      "Closed-loop attribution: purchase events from PostgreSQL are uploaded back to Google Ads as click conversions via GCLID, enabling bid optimization based on real conversion data",
      "Separate scheduling: dbt runs hourly (keeps VIEW fresh), Airflow DAG runs daily (respects Google Ads API quota batching)",
      "dbt model as VIEW (not materialized table) — lightweight transformation layer; changes in source data reflected immediately without manual refresh",
      "pytest DAG validation suite: enforces no import errors, tags present, retries ≥ 2 per Astronomer best practices",
      "Astronomer Runtime base image — pre-configured Airflow with dbt-core, providers, and Astro CLI for one-command local dev stack",
    ],
    overview:
      "This data engineering project implements a closed-loop Google Ads attribution pipeline: web conversion events (purchases with GCLIDs) stored in PostgreSQL are transformed by a dbt model and uploaded back to Google Ads via the Conversion Upload API, enabling the ad platform to see which clicks led to real purchases. Two Airflow DAGs run on separate schedules — dbt refreshes hourly, the upload job runs daily. The entire stack is containerized with Docker using Astronomer's production-ready Airflow runtime.",
    overviewPt:
      "Este projeto de engenharia de dados implementa um pipeline de atribuição fechada para Google Ads: eventos de conversão web (compras com GCLIDs) armazenados no PostgreSQL são transformados por um modelo dbt e enviados de volta ao Google Ads via API de Upload de Conversões, permitindo que a plataforma de anúncios veja quais cliques geraram compras reais. Dois DAGs do Airflow rodam em cronogramas separados — o dbt atualiza de hora em hora, o job de upload roda diariamente.",
    problem:
      "Google Ads campaigns optimize for clicks by default. Without conversion data sent back to the platform, bid algorithms have no signal about which clicks actually produce revenue. The engineering challenge was building a reliable pipeline that: (1) correctly maps internal event data to Google Ads' conversion schema; (2) handles OAuth2 authentication in a containerized environment; (3) separates transformation from upload so each can fail and retry independently.",
    problemPt:
      "As campanhas do Google Ads otimizam para cliques por padrão. Sem dados de conversão enviados de volta à plataforma, os algoritmos de lance não têm sinal sobre quais cliques realmente geram receita. O desafio de engenharia era construir um pipeline confiável que: (1) mapeie corretamente dados de eventos internos para o schema de conversão do Google Ads; (2) lide com autenticação OAuth2 em ambiente containerizado; (3) separe transformação de upload para que cada um possa falhar e tentar novamente independentemente.",
    goal:
      "Build a production-ready ETL pipeline that: (1) extracts purchase events from PostgreSQL; (2) transforms them into Google Ads conversion format using dbt; (3) uploads to Google Ads Conversion API daily; (4) orchestrates with Airflow on separate schedules for transformation vs. upload; (5) runs reproducibly in Docker with pytest-validated DAGs.",
    goalPt:
      "Construir um pipeline ETL pronto para produção que: (1) extraia eventos de compra do PostgreSQL; (2) transforme-os no formato de conversão do Google Ads usando dbt; (3) faça upload para a API de Conversão do Google Ads diariamente; (4) orquestre com Airflow em cronogramas separados para transformação vs. upload; (5) rode de forma reproduzível no Docker com DAGs validados por pytest.",
    role: ["Solo data engineer — pipeline architecture, dbt modeling, Airflow DAG authorship, Docker deployment"],
    rolePt: ["Engenheiro de dados solo — arquitetura do pipeline, modelagem dbt, criação de DAGs Airflow, deploy Docker"],
    technicalDecisions: [
      "Separate DAG schedules for dbt (hourly) and upload (daily) — transformation and upload have different optimal frequencies. dbt runs hourly to keep the VIEW fresh as new conversion events arrive. The Google Ads upload runs daily to batch conversions efficiently and stay within API quota limits. Separating them means a dbt failure doesn't block the upload, and vice versa.",
      "dbt model materialized as VIEW not TABLE — the purchase_clicks model is a SELECT with a WHERE event_name = 'purchase' filter. Materializing as a VIEW means no storage overhead and the source data is always reflected without running dbt refresh explicitly. The upload DAG queries the view directly; if source data changes, the view is automatically up-to-date.",
      "BashOperator for dbt invocation instead of DbtOperator — gives full control over dbt flags and allows sourcing the virtual environment explicitly. The command structure (source venv + dbt run --project-dir) is more portable than a custom operator and easier to debug when dbt errors need to be read from Airflow logs.",
      "OAuth2 InstalledAppFlow for Google Ads auth in a container — credentials (client_secret JSON + service account JSON) are copied into the container at build time and their paths set as environment variables. This avoids interactive OAuth flows at runtime while keeping credentials out of the DAG code.",
      "Astronomer Runtime 10.6.0 as the base image — Astronomer's pre-built runtime includes Airflow providers, dbt-core, and common dependencies. Using it as the base (FROM quay.io/astronomer/astro-runtime:10.6.0) reduces the Dockerfile to ~10 lines and ensures the local dev environment matches production exactly.",
      "pytest DAG validation as CI gate — three invariants enforced: no import errors (the DAG file must be parseable), tags present (required for Airflow UI filtering in production), retries ≥ 2 (any production DAG that calls an external API must have retry logic). This runs in CI before any DAG is deployed.",
    ],
    technicalDecisionsPt: [
      "Cronogramas separados para dbt (horário) e upload (diário) — transformação e upload têm frequências ótimas diferentes. O dbt roda de hora em hora para manter a VIEW atualizada. O upload do Google Ads roda diariamente para fazer lotes eficientes e respeitar os limites de cota da API. Separar os dois significa que uma falha do dbt não bloqueia o upload.",
      "Modelo dbt materializado como VIEW em vez de TABLE — o modelo purchase_clicks é um SELECT com filtro WHERE event_name = 'purchase'. Materializar como VIEW não tem overhead de armazenamento e a VIEW reflete automaticamente mudanças nos dados de origem sem executar refresh explicitamente.",
      "BashOperator para invocação dbt em vez de DbtOperator — dá controle total sobre os flags do dbt e permite fazer source do ambiente virtual explicitamente. A estrutura do comando é mais portável que um operador customizado e mais fácil de depurar.",
      "InstalledAppFlow OAuth2 para auth do Google Ads em container — credenciais copiadas para o container em tempo de build e seus caminhos definidos como variáveis de ambiente. Evita fluxos OAuth interativos em runtime mantendo credenciais fora do código do DAG.",
      "Astronomer Runtime 10.6.0 como imagem base — o runtime pré-construído do Astronomer inclui providers do Airflow, dbt-core e dependências comuns. Usá-lo como base reduz o Dockerfile a ~10 linhas e garante que o ambiente de dev local corresponda exatamente ao de produção.",
      "Validação de DAG com pytest como gate de CI — três invariantes aplicados: sem erros de import, tags presentes, retries ≥ 2. Roda no CI antes de qualquer DAG ser implantado.",
    ],
    learnings: [
      "Separation of concerns between transformation and loading DAGs is essential for reliability — a monolithic DAG that runs dbt then uploads failed atomically when either step had a transient error. Separate DAGs with independent retry policies mean a Google Ads API 429 doesn't re-run the dbt transformation.",
      "GCLID-based attribution requires careful data freshness management — GCLIDs expire after 90 days. Uploading conversions older than 90 days silently fails in the Google Ads API without an error response. Adding a WHERE conversion_datetime >= NOW() - INTERVAL '90 days' guard to the dbt model prevents silent attribution loss.",
      "Astronomer's Astro CLI significantly reduces local Airflow setup complexity — astro dev start spins up 4 containers (webserver, scheduler, triggerer, Postgres) with one command. Without it, a vanilla docker-compose setup for Airflow requires 20+ environment variable configurations. The CLI is the right abstraction for iterating on DAGs.",
      "pytest DAG validation catches import errors that would otherwise surface only in production — one DAG had a typo in an import path that only appeared when Airflow tried to parse the file at runtime. The pytest import-level test catches this in the local dev cycle before the DAG is deployed.",
    ],
    learningsPt: [
      "A separação de responsabilidades entre DAGs de transformação e carregamento é essencial para confiabilidade — um DAG monolítico que roda dbt depois faz upload falha atomicamente quando qualquer etapa tem um erro transitório. DAGs separados com políticas de retry independentes significam que um 429 da API do Google Ads não re-executa a transformação dbt.",
      "A atribuição baseada em GCLID requer gerenciamento cuidadoso de frescor dos dados — GCLIDs expiram após 90 dias. Fazer upload de conversões mais antigas que 90 dias falha silenciosamente na API do Google Ads sem resposta de erro.",
      "O Astro CLI do Astronomer reduz significativamente a complexidade de configuração local do Airflow — astro dev start inicializa 4 containers com um único comando. Sem ele, uma configuração docker-compose vanilla para Airflow requer 20+ configurações de variáveis de ambiente.",
      "A validação de DAG com pytest captura erros de import que de outra forma só apareceriam em produção — um DAG tinha um erro de digitação em um caminho de import que só aparecia quando o Airflow tentava analisar o arquivo em runtime.",
    ],
    status: "Functional — ETL pipeline for Google Ads conversion attribution",
    statusPt: "Funcional — pipeline ETL para atribuição de conversões no Google Ads",
    featured: false,
    year: 2024,
  },
  {
    id: "esp32-synthesizer",
    nameEn: "ESP32 Digital Synthesizer",
    namePt: "Sintetizador Digital ESP32",
    name: "ESP32 Synthesizer",
    type: "Embedded Hardware / Digital Audio Synthesizer",
    descriptionEn:
      "Polyphonic step sequencer synthesizer on ESP32. Subtractive synthesis pipeline: SAW2048 wavetable → resonant lowpass filter → ADSR envelope → soft clipping → DAC. Tick-based 8-step sequencer with swing, randomization, and dual CD4051 multiplexers for 8 analog pots + 5 buttons. Modular C++ firmware with AudioEngine, Sequencer, Controls, and UI layers.",
    descriptionPt:
      "Sintetizador sequenciador de passos polifônico no ESP32. Pipeline de síntese subtrativa: tabela de onda SAW2048 → filtro passa-baixas ressonante → envelope ADSR → soft clipping → DAC. Sequenciador de 8 passos baseado em tick com swing, randomização e dois multiplexadores CD4051 para 8 pots analógicos + 5 botões. Firmware C++ modular com camadas AudioEngine, Sequencer, Controls e UI.",
    tech: ["C++", "ESP32", "Arduino", "Mozzi", "CD4051 MUX", "TM1638", "OLED I2C"],
    categories: ["audio", "embedded"],
    highlights: [
      "Tick-based sequencer: baseTicksPerStep = (CONTROL_RATE × 60) / BPM — deterministic jitter-free timing with no millis() drift",
      "IIR smoothing on all analog reads: new = old + (raw − old) >> 3 — single-instruction low-pass, no ring buffers or divisions",
      "Soft clipping: if (x > 30000) x = 30000 + (x − 30000) / 4 — prevents digital saturation artifacts without hard truncation",
      "Round-robin MUX scanning: 1 analog channel per control tick — eliminates ADC contention across 8 simultaneous pots",
      "Modular architecture: AudioEngine, Sequencer, Controls, Events, UI headers — enables unit testing sequencer timing independently of Mozzi",
    ],
    overview:
      "The ESP32 Synthesizer is a hardware digital audio synthesizer built on an ESP32 microcontroller. It implements a complete subtractive synthesis signal chain — wavetable oscillator, resonant lowpass filter, ADSR envelope, and soft clipping — driven by an 8-step tick-based sequencer with swing timing and per-step randomization. The instrument is controlled by 8 analog potentiometers (cutoff, resonance, ADSR, swing) read via CD4051 multiplexers, displayed on both an OLED screen and a TM1638 LED/7-segment module. The firmware is refactored into modular C++ headers for AudioEngine, Sequencer, Controls, and UI layers.",
    overviewPt:
      "O ESP32 Synthesizer é um sintetizador de áudio digital em hardware construído em um microcontrolador ESP32. Implementa uma cadeia completa de síntese subtrativa — oscilador de tabela de ondas, filtro passa-baixas ressonante, envelope ADSR e soft clipping — conduzida por um sequenciador de 8 passos baseado em ticks com timing de swing e randomização por passo. O instrumento é controlado por 8 potenciômetros analógicos lidos via multiplexadores CD4051, exibidos tanto em uma tela OLED quanto em um módulo LED/7-segmentos TM1638.",
    problem:
      "Commercial synthesizers in the accessible price range offer limited programmability and no hardware customization. Building a synthesizer from microcontroller primitives requires solving three simultaneous constraints: deterministic audio timing (Mozzi's 16.384kHz audio rate cannot be disrupted by control logic), noise-free analog input (8 pots on a shared ADC bus with settling time issues), and real-time display updates that don't steal CPU from audio rendering.",
    problemPt:
      "Sintetizadores comerciais na faixa de preço acessível oferecem programabilidade limitada e nenhuma personalização de hardware. Construir um sintetizador a partir de primitivas de microcontrolador requer resolver três restrições simultâneas: timing de áudio determinístico, entrada analógica sem ruído (8 pots em um barramento ADC compartilhado), e atualizações de display em tempo real que não roubem CPU do rendering de áudio.",
    goal:
      "Build a playable hardware synthesizer that: (1) implements subtractive synthesis with real-time filter and envelope control; (2) runs a swing-capable 8-step sequencer with deterministic timing; (3) reads 8 analog pots + 5 buttons via multiplexers without ADC contention; (4) displays real-time parameter state on dual displays; (5) uses modular firmware architecture for maintainability.",
    goalPt:
      "Construir um sintetizador de hardware tocável que: (1) implemente síntese subtrativa com controle de filtro e envelope em tempo real; (2) execute um sequenciador de 8 passos capaz de swing com timing determinístico; (3) leia 8 pots analógicos + 5 botões via multiplexadores sem contenda no ADC; (4) exiba estado de parâmetros em tempo real em displays duplos; (5) use arquitetura de firmware modular para manutenibilidade.",
    role: ["Solo embedded developer — hardware design, firmware architecture, synthesis algorithm, UI"],
    rolePt: ["Desenvolvedor embedded solo — design de hardware, arquitetura de firmware, algoritmo de síntese, UI"],
    technicalDecisions: [
      "Mozzi library with SAW2048 wavetable — Mozzi provides a pre-computed 2048-sample 8-bit sawtooth wavetable that the oscillator plays back at any frequency via table interpolation. This avoids real-time waveform computation (which would require trigonometric functions at 16.384kHz — unachievable on ESP32). Mozzi's control-rate/audio-rate split (128Hz/16384Hz) enforces a clean architecture: all parameter updates happen at control rate, audio synthesis at audio rate.",
      "Tick-based sequencer timing — instead of millis()-based step transitions (which drift under load), the sequencer counts Mozzi control ticks: ticksPerStep = (CONTROL_RATE × 60) / BPM. Each tick is exactly 1/128s. Swing is applied by adjusting odd step counts: even steps get baseTicksPerStep + swingOffsetTicks, odd steps get baseTicksPerStep − swingOffsetTicks. This is mathematically equivalent to traditional hardware sequencer swing with no timing jitter.",
      "Round-robin CD4051 multiplexer scanning — a single CD4051 8-channel analog multiplexer connects 8 potentiometers to one ESP32 ADC pin. The control loop reads one channel per tick (round-robin), cycling through all 8 pots over 8 ticks. This eliminates ADC settling time problems that occur when switching channels rapidly, and ensures no two pots share an ADC read in the same tick.",
      "IIR smoothing on all analog inputs — raw ADC reads are noisy (±5-15 LSB). Rather than a ring-buffer moving average, each pot uses a single-instruction IIR: new = old + (raw − old) >> 3. This is equivalent to a 1-pole IIR lowpass at fc ≈ 128Hz/16 = 8Hz — sufficient to eliminate audio-rate noise from pot readings without introducing noticeable lag.",
      "Soft clipping to prevent digital saturation — the final output stage applies asymmetric soft clipping: if (x > 30000) x = 30000 + (x − 30000) / 4; if (x < -30000) x = -30000 + (x + 30000) / 4. This gently rolls off peaks above ±30000 (out of ±32767 int16 range) rather than hard-truncating, which would introduce harsh aliasing artifacts audible as digital distortion.",
      "Modular C++ firmware headers — the original firmware was a monolithic .ino file. Refactoring into AudioEngine.h, Sequencer.h, Controls.h, Events.h, UI.h, and Types.h enables testing the sequencer's tick logic independently of Mozzi, isolates the MUX scanning code from synthesis, and makes future features (MIDI, multiple oscillators, scale quantization) addable without touching unrelated code.",
    ],
    technicalDecisionsPt: [
      "Biblioteca Mozzi com tabela de ondas SAW2048 — o Mozzi fornece uma tabela de onda sawtooth de 2048 amostras 8-bit que o oscilador reproduz em qualquer frequência via interpolação de tabela. Isso evita computação de forma de onda em tempo real (que exigiria funções trigonométricas a 16.384kHz — inatingível no ESP32). A divisão control-rate/audio-rate do Mozzi (128Hz/16384Hz) aplica uma arquitetura limpa.",
      "Timing do sequenciador baseado em ticks — em vez de transições de passos baseadas em millis() (que derivam sob carga), o sequenciador conta ticks de controle Mozzi: ticksPerStep = (CONTROL_RATE × 60) / BPM. Cada tick é exatamente 1/128s. O swing é aplicado ajustando contagens de passos ímpares.",
      "Varredura round-robin do multiplexador CD4051 — um único multiplexador analógico de 8 canais CD4051 conecta 8 potenciômetros a um pino ADC do ESP32. O loop de controle lê um canal por tick (round-robin), ciclando por todos os 8 pots em 8 ticks. Isso elimina problemas de tempo de assentamento do ADC.",
      "Suavização IIR em todas as entradas analógicas — em vez de uma média móvel em buffer circular, cada pot usa um IIR de instrução única: novo = antigo + (bruto − antigo) >> 3. Equivalente a um IIR passa-baixas de 1 polo em fc ≈ 8Hz — suficiente para eliminar ruído sem introduzir lag perceptível.",
      "Soft clipping para evitar saturação digital — a etapa de saída final aplica soft clipping assimétrico: se (x > 30000) x = 30000 + (x − 30000) / 4. Isso suavemente reduz picos acima de ±30000 em vez de truncar bruscamente.",
      "Headers C++ modulares — o firmware original era um arquivo .ino monolítico. Refatorar em AudioEngine.h, Sequencer.h, Controls.h, Events.h, UI.h e Types.h permite testar a lógica de tick do sequenciador independentemente do Mozzi.",
    ],
    learnings: [
      "Tick-based timing is the correct architecture for embedded sequencers — an early millis()-based version had timing drift that accumulated over minutes, making the sequencer gradually go out of sync with external audio. Switching to Mozzi control ticks (which are hardware-interrupt driven) eliminated drift completely.",
      "ADC multiplexer settling time is a real problem — the first hardware revision read all 8 pots in rapid succession in a single control tick. The ADC couldn't settle between channel switches, producing cross-talk where rotating pot 3 affected pot 4's reading. Round-robin (one pot per tick) gave the ADC 8 full ticks (~62ms) to settle between readings of the same channel.",
      "IIR smoothing is the right tool for analog noise, not moving averages — a 4-sample moving average added 4 ticks of lag (~31ms) to every pot movement, making the cutoff feel sluggish during live playing. The IIR approach eliminates the lag feeling while still filtering tick-to-tick noise.",
      "Modular firmware unlocks testability — the original monolithic .ino couldn't be unit tested because Mozzi's audio interrupt would run during test execution. Extracting the Sequencer into a pure C++ header with no Mozzi dependencies allowed running sequencer timing tests on a host machine without hardware.",
    ],
    learningsPt: [
      "O timing baseado em ticks é a arquitetura correta para sequenciadores embedded — uma versão inicial baseada em millis() tinha deriva de timing que se acumulava ao longo de minutos. Mudar para ticks de controle Mozzi (que são acionados por interrupção de hardware) eliminou a deriva completamente.",
      "O tempo de assentamento do multiplexador ADC é um problema real — a primeira revisão de hardware lia todos os 8 pots em rápida sucessão em um único tick de controle. O ADC não conseguia se estabilizar entre trocas de canal, produzindo crosstalk. Round-robin (um pot por tick) deu ao ADC 8 ticks completos (~62ms) para estabilizar.",
      "A suavização IIR é a ferramenta certa para ruído analógico — uma média móvel de 4 amostras adicionava 4 ticks de lag (~31ms) a cada movimento de pot, fazendo o cutoff parecer lento durante a performance ao vivo. A abordagem IIR elimina a sensação de lag enquanto ainda filtra o ruído.",
      "O firmware modular desbloqueia a testabilidade — o .ino monolítico original não podia ser testado unitariamente porque a interrupção de áudio do Mozzi rodaria durante a execução do teste. Extrair o Sequencer para um header C++ puro sem dependências Mozzi permitiu testes de timing em uma máquina host sem hardware.",
    ],
    status: "Built — playable hardware instrument",
    statusPt: "Construído — instrumento de hardware tocável",
    featured: false,
    year: 2024,
  },
  {
    id: "habitos",
    nameEn: "Hábitos – Habit & Therapy Tracker",
    namePt: "Hábitos – Rastreador de Hábitos e Terapia",
    name: "Hábitos",
    type: "Full-Stack Web Application / Personal Tool",
    descriptionEn:
      "Shared habit and therapy progress tracker for a patient and their therapist. Full-stack Next.js 16 app with role-based interfaces, a weekly habit calendar, goal tracking with clinical observations, and a job application tracker with a behavioral accountability gate — under custom JWT auth with Prisma/PostgreSQL.",
    descriptionPt:
      "Rastreador compartilhado de hábitos e progresso terapêutico para paciente e terapeuta. App full-stack Next.js 16 com interfaces baseadas em perfil, calendário semanal de hábitos, rastreamento de metas com observações clínicas e tracker de candidaturas com gate de responsabilidade comportamental — tudo com auth JWT customizado, Prisma e PostgreSQL.",
    tech: [
      "Next.js",
      "React 19",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "JWT",
      "bcryptjs",
      "Tailwind CSS v4",
      "shadcn/ui",
      "dnd-kit",
      "date-fns",
      "Vercel",
    ],
    categories: ["web-app"],
    highlights: [
      "Dual-role system: patient and therapist share one database, each with a tailored interface and navigation set",
      "Job application tracker with minimum-3-per-session gate — task cannot be marked done until daily quota is met",
      "After-midnight time sorting: 02:00 sorts after 23:59, not before 06:00 — correct for night-owl schedules",
      "Bulk week-level wake/sleep setter via a single PATCH that uses prisma.task.updateMany across all 7 days",
      "GoalProgress upsert: therapist clinical observations and patient weekly notes co-author the same per-week record",
    ],
    overview:
      "Hábitos is a full-stack habit and therapy tracking app built for a specific real-world scenario: a therapy patient managing daily medications, sleep schedule, self-care routines, and an active job search — with their therapist needing structured visibility into weekly progress without requiring a separate communication channel. The patient interface is a weekly calendar with fixed daily habits (medications, wake-up time, bedtime) and custom tasks; the therapist interface adds a Planejador view that shows each goal's patient notes alongside a space for clinical observations and planned adjustments for the following week.",
    overviewPt:
      "Hábitos é um app full-stack de rastreamento de hábitos e terapia criado para um cenário real específico: um paciente em terapia gerenciando medicações diárias, rotina de sono, autocuidado e uma busca ativa de emprego — com seu terapeuta precisando de visibilidade estruturada sobre o progresso semanal sem exigir um canal de comunicação separado. A interface do paciente é um calendário semanal com hábitos fixos diários (medicações, horário de acordar, dormir) e tarefas personalizadas; a interface do terapeuta adiciona uma view Planejador que exibe as notas do paciente em cada meta junto a um espaço para observações clínicas e ajustes planejados para a semana seguinte.",
    problem:
      "Therapy patients typically track progress through verbal check-ins or ad-hoc shared documents with no structure for daily habits, goal history, or week-over-week comparisons. A patient managing medications, sleep patterns, and a job search simultaneously has too many moving parts for informal tracking. The therapist has no passive visibility into the patient's week — they see only what the patient remembers to report in a session.",
    problemPt:
      "Pacientes em terapia geralmente rastreiam o progresso por check-ins verbais ou documentos compartilhados informais sem estrutura para hábitos diários, histórico de metas ou comparações semana a semana. Um paciente gerenciando medicações, padrões de sono e uma busca de emprego simultaneamente tem variáveis demais para um rastreamento informal. O terapeuta não tem visibilidade passiva sobre a semana do paciente — só vê o que o paciente lembra de relatar na sessão.",
    goal:
      "Build a two-user shared app that: (1) gives the patient a structured weekly calendar with habit accountability; (2) gives the therapist a read-only view of goal progress with space for clinical observations; (3) enforces behavioral accountability through the job application gate; (4) persists session state across page refreshes without a third-party auth library; (5) deploys with zero-downtime schema migrations on Vercel.",
    goalPt:
      "Construir um app compartilhado de dois usuários que: (1) dê ao paciente um calendário semanal estruturado com responsabilidade por hábitos; (2) dê ao terapeuta uma view somente-leitura do progresso de metas com espaço para observações clínicas; (3) aplique responsabilidade comportamental pelo gate de candidaturas; (4) persista estado de sessão após refresh sem biblioteca de auth de terceiros; (5) faça deploy com migrações de schema sem downtime no Vercel.",
    role: ["Solo developer — architecture, full-stack, UX, data modeling, deployment"],
    rolePt: ["Desenvolvedor solo — arquitetura, full-stack, UX, modelagem de dados, deployment"],
    technicalDecisions: [
      "Next.js App Router Server Components as the data-fetching layer — pages query Prisma directly and pass data as props to Client Components. This eliminates client-side loading states for initial renders and keeps auth verification server-side, so an unauthenticated request is redirected at the server before any HTML is sent.",
      "Custom JWT auth with jose (no NextAuth) — sessions are HS256 JWTs in an httpOnly, SameSite=Lax cookie with a 24h TTL. The decision to build auth from scratch was deliberate: the app has exactly two users and a third-party auth library would add unnecessary abstraction and configuration surface.",
      "Prisma migrate deploy runs automatically on every Vercel build — the build script is prisma generate && prisma migrate deploy && next build, ensuring the production schema is always in sync with code without a manual migration step.",
      "GoalProgress upsert pattern — rather than separate patient and therapist records per goal per week, a single GoalProgress row holds both patientNotes and therapistNotes. The /api/progresso endpoint does a findOrCreate by (goalId + weekStart), so both users write to the same record without coordination.",
      "After-midnight time sorting — times 00:00–05:59 get a sort key of h + 24, so a 02:00 bedtime entry correctly appears after 23:59 in the schedule view. Without this, night-owl sleep habits would be grouped in the early-morning block.",
      "Bulk week-level wake/sleep setter — a single PATCH /api/semanas/[scheduleId] uses prisma.task.updateMany to propagate a time to all 7 days at once, avoiding 7 separate API calls from the client.",
      "Job application gate enforced at the data level — the job task cannot be marked complete until 3 applications have been logged for that day. The completion button renders disabled with a counter ('X vagas restantes'). Behavioral accountability is baked into the data model, not just the UI.",
      "dnd-kit installed and Task.sortOrder scaffolded but not yet wired — drag-and-drop libraries are in package.json and the Task model has a sortOrder integer with full PATCH support, deliberately scaffolded for a future task reordering feature without adding complexity to the current release.",
      "iOS Safari font-size fix applied globally — all text inputs have style={{ fontSize: '16px' }} set inline, the only reliable way to prevent iOS Safari's auto-zoom on focus from breaking the mobile calendar layout.",
    ],
    technicalDecisionsPt: [
      "Server Components do App Router como camada de busca de dados — as páginas consultam o Prisma diretamente e passam dados como props para Client Components. Isso elimina estados de loading no client para renders iniciais e mantém a verificação de auth no servidor, de modo que uma requisição não autenticada é redirecionada antes de qualquer HTML ser enviado.",
      "Auth JWT customizado com jose (sem NextAuth) — sessões são JWTs HS256 em cookie httpOnly, SameSite=Lax com TTL de 24h. A decisão de construir o auth do zero foi deliberada: o app tem exatamente dois usuários e uma biblioteca de terceiros adicionaria abstração e configuração desnecessárias.",
      "Prisma migrate deploy executa automaticamente em cada build do Vercel — o script de build é prisma generate && prisma migrate deploy && next build, garantindo que o schema de produção esteja sempre sincronizado com o código sem etapa manual de migração.",
      "Padrão upsert do GoalProgress — em vez de registros separados de paciente e terapeuta por meta por semana, uma única linha GoalProgress armazena tanto patientNotes quanto therapistNotes. O endpoint /api/progresso faz findOrCreate por (goalId + weekStart), permitindo que os dois usuários escrevam no mesmo registro sem coordenação.",
      "Ordenação de horários após meia-noite — horários 00:00–05:59 recebem chave de ordenação h + 24, então um horário de dormir às 02:00 aparece corretamente após 23:59. Sem isso, hábitos de sono de notívagos seriam agrupados no bloco de madrugada.",
      "Setter de horário semanal em lote — um único PATCH /api/semanas/[scheduleId] usa prisma.task.updateMany para propagar um horário para todos os 7 dias de uma vez, evitando 7 chamadas de API separadas do client.",
      "Gate de candidaturas aplicado no nível dos dados — a tarefa de candidatura não pode ser marcada como concluída até que 3 candidaturas tenham sido registradas no dia. O botão fica desabilitado com contador ('X vagas restantes'). Responsabilidade comportamental embutida no modelo de dados, não apenas na UI.",
      "dnd-kit instalado e Task.sortOrder scaffolded mas não conectado — a biblioteca de drag-and-drop está no package.json e o modelo Task tem um integer sortOrder com suporte completo a PATCH, deliberadamente scaffolded para um recurso futuro de reordenação sem adicionar complexidade ao release atual.",
      "Fix de font-size para iOS Safari aplicado globalmente — todos os inputs têm style={{ fontSize: '16px' }} inline, a única forma confiável de evitar o auto-zoom do iOS Safari ao focar que quebraria o layout do calendário mobile.",
    ],
    learnings: [
      "Building JWT auth from scratch with jose is not significantly harder than wiring NextAuth for a small, closed-user app — and it produces a much simpler mental model of how sessions actually work, making debugging auth issues straightforward.",
      "The GoalProgress upsert pattern (find-or-create by composite key) is clean for co-authoring records across roles, but requires the API to be truly idempotent — calling it twice for the same (goalId, weekStart) must not overwrite the other role's field, which means using update with only the field that changed, not a full object replace.",
      "Running Prisma migrate deploy in the Vercel build command is reliable for zero-downtime schema evolution, but requires all migrations to be backwards-compatible — a destructive migration (e.g. dropping a column) that passes locally will block the production deploy with no automatic rollback.",
      "Designing for a specific real user — not a persona — produces much more intentional UX. The after-midnight sort, the bulk week setter, and the job application gate all came directly from observing the actual patient's workflow rather than from abstract product thinking.",
      "Server Components work best when the data shape matches the render tree closely. Any mismatch — needing to filter or transform data on the client — is better solved by returning more data from the server and filtering in the Client Component, not by adding extra API routes.",
    ],
    learningsPt: [
      "Construir auth JWT do zero com jose não é significativamente mais difícil do que configurar o NextAuth para um app de base de usuários pequena — e produz um modelo mental muito mais simples de como as sessões funcionam, tornando o debugging de issues de auth direto.",
      "O padrão upsert do GoalProgress (find-or-create por chave composta) é limpo para co-autoria de registros entre perfis, mas exige que a API seja verdadeiramente idempotente — chamá-la duas vezes para o mesmo (goalId, weekStart) não deve sobrescrever o campo do outro perfil, o que exige usar update com apenas o campo que mudou, não um replace completo.",
      "Executar prisma migrate deploy no build do Vercel é confiável para evolução de schema sem downtime, mas exige que todas as migrations sejam retrocompatíveis — uma migration destrutiva que passa localmente bloqueará o deploy de produção sem rollback automático.",
      "Projetar para um usuário real específico — não uma persona — produz decisões de UX muito mais intencionais. A ordenação pós-meia-noite, o setter semanal em lote e o gate de candidaturas vieram diretamente de observar o fluxo real do paciente, não de produto abstrato.",
      "Server Components funcionam melhor quando a forma dos dados corresponde à árvore de renderização. Qualquer incompatibilidade — filtrar ou transformar dados no client — é melhor resolvida retornando mais dados do servidor e filtrando no Client Component, não adicionando rotas de API extras.",
    ],
    status: "Active — in daily use by the patient and therapist it was built for",
    statusPt: "Ativo — em uso diário pelo paciente e terapeuta para quem foi construído",
    githubUrl: "https://github.com/claytonbrgsdev/habitos-public",
    featured: false,
    year: 2026,
  },
  {
    id: "f4l",
    nameEn: "F4L – Automated YouTube Music Distribution",
    namePt: "F4L – Distribuição Automatizada de Música no YouTube",
    name: "F4L",
    type: "Automation Tool / Creative Tech",
    descriptionEn:
      "End-to-end YouTube distribution tool for indie music labels. Upload a WAV and a cover PNG, fill in title and description — F4L encodes a 1080p video entirely in the browser with FFmpeg WASM, stages it on Google Cloud Storage, and uploads it directly to YouTube via the Data API v3. Zero server-side video processing.",
    descriptionPt:
      "Ferramenta de distribuição YouTube ponta a ponta para selos independentes. Faça upload de um WAV e um PNG de capa, preencha título e descrição — o F4L codifica um vídeo 1080p inteiramente no navegador com FFmpeg WASM, faz staging no Google Cloud Storage e sobe diretamente ao YouTube via Data API v3. Zero processamento de vídeo no servidor.",
    tech: [
      "React 18",
      "TypeScript",
      "Vite",
      "FFmpeg WASM",
      "Node.js",
      "Express",
      "YouTube Data API v3",
      "Google Cloud Storage",
      "Firebase",
      "Firestore",
      "Google OAuth2",
    ],
    categories: ["web-app"],
    highlights: [
      "Full 1080p video encoding in the browser via FFmpeg compiled to WebAssembly — zero server GPU/CPU cost",
      "Complete pipeline: WAV + PNG in → video encoded in-browser → GCS staging → YouTube Data API v3 upload",
      "Duration extraction from FFmpeg log output via regex — unofficial but reliable WASM media metadata pattern",
      "UUID-namespaced GCS files prevent collision across concurrent sessions",
      "Manual OAuth2 authorization code flow with server-side token exchange, after iterating through 3 auth libraries",
    ],
    overview:
      "F4L (Friend4Label) is a full-stack automation tool built for Tropical Twista Records — an independent music label with a repetitive YouTube distribution workflow. For every release, the team had to manually open a video editor, loop the cover art for the track's duration, export a 1080p MP4, open YouTube Studio, upload the file, and fill in metadata. F4L eliminates every manual step after file selection: provide a WAV and a cover image, fill in title and description, and the tool handles video encoding, cloud staging, and YouTube upload entirely.",
    overviewPt:
      "F4L (Friend4Label) é uma ferramenta de automação full-stack criada para a Tropical Twista Records — um selo musical independente com um fluxo de distribuição no YouTube repetitivo. Para cada lançamento, a equipe precisava abrir manualmente um editor de vídeo, fazer loop da capa pelo tempo da faixa, exportar um MP4 1080p, abrir o YouTube Studio, fazer upload e preencher os metadados. O F4L elimina cada etapa manual após a seleção de arquivos: forneça um WAV e uma imagem de capa, preencha título e descrição, e a ferramenta cuida da codificação, staging e upload para o YouTube.",
    problem:
      "Independent music labels release music frequently but lack the technical staff or time for the manual video creation that YouTube distribution requires. Producing a 'static video' (looped artwork + audio) for each track takes 20–30 minutes of entirely repetitive, fully automatable work. The process scales poorly: a 10-track album means 10 separate manual passes through the same workflow.",
    problemPt:
      "Selos musicais independentes lançam músicas com frequência mas não têm equipe técnica ou tempo para a criação manual de vídeo que a distribuição no YouTube exige. Produzir um 'vídeo estático' (arte em loop + áudio) para cada faixa leva de 20 a 30 minutos de trabalho completamente repetitivo e totalmente automatizável. O processo escala mal: um álbum de 10 faixas significa 10 passes manuais separados pelo mesmo fluxo.",
    goal:
      "Build a single-page tool that: (1) authenticates with Google OAuth2 scoped to YouTube upload; (2) encodes a 1080p video from WAV + PNG entirely in the browser with no server-side video processing; (3) stages the output on GCS and uploads it to YouTube with user-provided metadata; (4) lets the user preview the video before the final YouTube upload step.",
    goalPt:
      "Construir uma ferramenta de página única que: (1) autentique via Google OAuth2 com escopo de upload do YouTube; (2) codifique um vídeo 1080p a partir de WAV + PNG inteiramente no navegador sem processamento de vídeo no servidor; (3) faça staging no GCS e upload ao YouTube com metadados fornecidos pelo usuário; (4) permita pré-visualizar o vídeo antes do passo final de upload.",
    role: ["Solo developer — architecture, frontend, backend, OAuth2 integration, YouTube API"],
    rolePt: ["Desenvolvedor solo — arquitetura, frontend, backend, integração OAuth2, API do YouTube"],
    technicalDecisions: [
      "FFmpeg compiled to WebAssembly for in-browser video encoding — the most consequential architectural decision. Using @ffmpeg/ffmpeg with the multi-threaded WASM core (core-mt), video encoding runs entirely in the browser: WAV → AAC transcode, PNG → 1080p looped video, then mux. No GPU or CPU cost on the server. Tradeoff: requires SharedArrayBuffer, which requires COOP/COEP headers and the vite-plugin-cross-origin-isolation Vite plugin to satisfy browser security requirements.",
      "GCS as a temporary staging layer — rather than piping video directly from browser to YouTube API, the architecture uses Google Cloud Storage as an intermediary: browser uploads MP4 to Express, which streams to GCS; metadata JSON is uploaded separately; a final submit call tells the backend to pull both from GCS and push to YouTube. This decouples encoding from upload timing and lets the user review the video and fill metadata asynchronously.",
      "UUID-namespaced GCS files — each browser session generates a UUID on mount. All GCS objects (video-<uuid>.mp4, metadata-<uuid>.json) use this UUID as a namespace, preventing collision across concurrent users or multiple open tabs with zero backend coordination.",
      "Duration extraction via FFmpeg log parsing — to determine video length for the -loop 1 image-to-video command, the code runs ffmpeg -i inputAd.wav intentionally to trigger info output, captures the log event stream, and parses 'Duration: HH:MM:SS.xx' with a regex. An unofficial but reliable WASM media metadata pattern.",
      "Manual OAuth2 authorization code flow after iterating through 3 auth approaches — the codebase contains traces of passport-google-oauth20, @react-oauth/google, and Google Identity Services HTML buttons. The final solution uses a raw server-side authorization code exchange, giving full control over token storage, session management, and scope configuration.",
      "Exponential backoff on user data fetch — the login() function implements a manual retry loop (up to 5 retries, starting at 1s, doubling each attempt) to handle the race condition between Firestore write completion and the immediate GET /getuser call from the frontend.",
      "In-memory user cache on the backend — the backend writes user profiles to Firestore (persistent) and also caches them as a module-level variable in memory. GET /getuser reads from memory, not Firestore, avoiding a database round-trip on every session hydration at the cost of losing the cache on server restart.",
    ],
    technicalDecisionsPt: [
      "FFmpeg compilado para WebAssembly para codificação in-browser — a decisão arquitetural mais significativa. Usando @ffmpeg/ffmpeg com o core WASM multi-threaded (core-mt), a codificação roda inteiramente no navegador: transcode WAV → AAC, PNG → vídeo 1080p em loop, depois mux. Zero custo de GPU ou CPU no servidor. O tradeoff: exige SharedArrayBuffer, que requer headers COOP/COEP e o plugin Vite vite-plugin-cross-origin-isolation.",
      "GCS como camada de staging temporária — em vez de enviar o vídeo diretamente do navegador para a API do YouTube, a arquitetura usa o Google Cloud Storage como intermediário: o navegador faz upload do MP4 para o Express, que transmite ao GCS; o JSON de metadados é enviado separadamente; uma chamada submit final instrui o backend a buscar ambos no GCS e enviar ao YouTube. Isso desacopla a codificação do timing do upload.",
      "Arquivos no GCS com namespace UUID — cada sessão gera um UUID no mount. Todos os objetos GCS (video-<uuid>.mp4, metadata-<uuid>.json) usam esse UUID como namespace, evitando colisões entre usuários simultâneos ou múltiplas abas sem coordenação de backend.",
      "Extração de duração via parsing do log do FFmpeg — para determinar a duração do vídeo para o comando -loop 1, o código executa ffmpeg -i inputAd.wav intencionalmente para acionar o output de informações, captura o stream de log e analisa 'Duration: HH:MM:SS.xx' com regex. Um padrão não oficial, mas confiável, para metadados de mídia no WASM.",
      "Fluxo OAuth2 de código de autorização manual após iterar por 3 abordagens de auth — o codebase contém rastros de passport-google-oauth20, @react-oauth/google e botões HTML do Google Identity Services. A solução final usa uma troca de código de autorização no lado do servidor, dando controle total sobre armazenamento de tokens e configuração de escopo.",
      "Backoff exponencial na busca de dados do usuário — a função login() implementa um loop de retry manual (até 5 tentativas, começando em 1s, dobrando a cada tentativa) para lidar com a race condition entre a escrita no Firestore e a chamada imediata de GET /getuser.",
      "Cache de usuário em memória no backend — o backend escreve no Firestore (persistente) e armazena os dados do usuário como variável em nível de módulo na memória. GET /getuser lê da memória, evitando round-trip ao banco a cada hidratação de sessão, ao custo de perder o cache ao reiniciar o servidor.",
    ],
    learnings: [
      "FFmpeg WASM is production-viable for light-to-medium video encoding in the browser, but COOP/COEP header requirements for SharedArrayBuffer need careful coordination between the Vite dev server config and the Express production server — a misconfiguration silently falls back to single-threaded mode with no warning.",
      "The GCS staging layer adds one network hop but provides a meaningful UX win: encoding and metadata input are fully decoupled, so the user can review the video and fill in the description while the file is still uploading — the flow feels more forgiving than a single atomic submit.",
      "Iterating through multiple auth libraries before landing on a manual OAuth2 flow was time-consuming but produced a much deeper understanding of the token exchange, scope negotiation, and session lifecycle — which made debugging the final production auth more tractable.",
      "UUID-scoped file storage is a simple but robust isolation strategy for multi-user tools: it requires no session synchronization on the backend and is trivially testable — just check that two concurrent sessions produce different GCS object paths.",
      "Parsing media metadata from FFmpeg log output is fragile but pragmatic for WAV inputs where the duration is always present in a predictable format. For a production-grade tool handling multiple container formats, a dedicated metadata extraction pass (e.g. ffprobe) would be more robust.",
    ],
    learningsPt: [
      "FFmpeg WASM é viável para produção em codificação de vídeo leve a média no navegador, mas os requisitos de headers COOP/COEP para SharedArrayBuffer exigem coordenação cuidadosa entre a config do dev server Vite e o servidor Express de produção — uma má configuração cai silenciosamente para modo single-threaded sem aviso.",
      "A camada de staging no GCS adiciona um hop de rede, mas oferece uma vitória de UX: codificação e entrada de metadados são totalmente desacopladas, permitindo que o usuário revise o vídeo e preencha a descrição enquanto o arquivo ainda está fazendo upload.",
      "Iterar por múltiplas bibliotecas de auth antes de chegar a um fluxo OAuth2 manual foi demorado, mas produziu um entendimento muito mais profundo da troca de tokens, negociação de escopo e ciclo de vida de sessão — tornando o debugging do auth de produção mais tratável.",
      "Armazenamento de arquivos com escopo UUID é uma estratégia de isolamento simples e robusta: não requer sincronização de sessão no backend e é trivialmente testável — basta verificar que duas sessões simultâneas produzem caminhos de objetos GCS diferentes.",
      "Fazer parsing de metadados de mídia a partir do output de log do FFmpeg é frágil mas pragmático para inputs WAV onde a duração está sempre presente em formato previsível. Para uma ferramenta de produção que lida com múltiplos formatos de container, uma etapa de extração dedicada (ex: ffprobe) seria mais robusta.",
    ],
    status: "Feature-complete — built for Tropical Twista Records",
    statusPt: "Com features completas — construído para a Tropical Twista Records",
    featured: false,
    year: 2024,
  },
  {
    id: "eko",
    nameEn: "EKO – Mystical AI Chatbot & Environmental Narrative Game",
    namePt: "EKO – Chatbot IA Místico & Jogo Narrativo Ambiental",
    name: "EKO",
    type: "AI Application / Narrative Game",
    descriptionEn:
      "Two-phase AI project developed within EKO – Residência Artística, funded by FAC – Fundo de Apoio à Cultura do Distrito Federal (GDF). A deployed mystical chatbot (Python + Streamlit + local Ollama) where users consult EKO — a sarcastic, timeless oracular entity — with full 78-card Tarot reading support; and Ekonsulta, a satirical narrative game that profiles players' environmental behavior across 50 dilemmas into 6 behavioral archetypes, using hidden scoring to prevent gaming the result.",
    descriptionPt:
      "Projeto de IA em duas fases desenvolvido dentro da EKO – Residência Artística, financiado pelo FAC – Fundo de Apoio à Cultura do Distrito Federal (GDF). Um chatbot místico implantado (Python + Streamlit + Ollama local) onde usuários consultam EKO — uma entidade oracular sarcástica e atemporal — com suporte completo a leitura de Tarô com 78 cartas; e Ekonsulta, um jogo narrativo satírico que classifica o comportamento ambiental dos jogadores em 6 arquétipos a partir de 50 dilemas, com pontuação oculta para evitar manipulação do resultado.",
    tech: [
      "Python",
      "Streamlit",
      "Ollama",
      "llama3.1:8b",
      "TinyDB",
      "Docker",
      "ngrok",
      "Cloudflare Tunnel",
      "React 19",
      "TypeScript",
      "Vite",
    ],
    categories: ["ai-ml", "web-app"],
    highlights: [
      "Full 78-card Tarot deck with keyword detection routing messages to a dedicated reading prompt path",
      "EKO persona defined in context.py with tone detection: cosmic tone for astrology topics, welcome tone for greetings",
      "Response post-processing pipeline: strips <think> tags, EKO self-references, leaked card names, parenthetical asides",
      "Ekonsulta: 50 environmental dilemmas across 5 themes map secretly to 6 behavioral archetypes via weighted scoring",
      "Multi-strategy Ollama connectivity: DNS monkey-patching + ngrok + Cloudflare Tunnel to bypass VPN routing failures",
    ],
    overview:
      "EKO is a two-phase AI project built by Clayton Borges and Raphael Palmer as part of EKO – Residência Artística, a cultural residency funded by FAC – Fundo de Apoio à Cultura do Distrito Federal, Secretaria de Cultura e Economia Criativa / GDF. The residency brought together artists, technologists, and environmental institutions — including ICMBio/Parque Nacional de Brasília, SesiLab, Ateliê Ecoarte, and Centro Tradicional de Invenção Cultural — to explore the intersection of AI, ecology, and culture in Brasília. Phase 1 is a production chatbot: users interact with EKO — a mystical, sarcastic oracular character — via a Streamlit web UI styled with a full-bleed mystical aesthetic. EKO answers questions, detects topic categories to shift tone, and draws from a full 78-card Tarot deck when requested. The LLM is a local Ollama instance (llama3.1:8b), with no external API keys. Phase 2 is Ekonsulta, a satirical narrative game about environmental behavior: players make binary choices across 50 dilemmas spanning food, fashion, transportation, water, and technology. Hidden scoring maps each choice to one of 6 behavioral archetypes — EKO delivers the final verdict with sarcastic precision.",
    overviewPt:
      "EKO é um projeto de IA em duas fases construído por Clayton Borges e Raphael Palmer como parte da EKO – Residência Artística, uma residência cultural financiada pelo FAC – Fundo de Apoio à Cultura do Distrito Federal, Secretaria de Cultura e Economia Criativa / GDF. A residência reuniu artistas, tecnólogos e instituições ambientais — incluindo ICMBio/Parque Nacional de Brasília, SesiLab, Ateliê Ecoarte e Centro Tradicional de Invenção Cultural — para explorar a interseção entre IA, ecologia e cultura em Brasília. A Fase 1 é um chatbot em produção: usuários interagem com EKO — um personagem oracular místico e sarcástico — via uma UI web Streamlit com estética mística total. EKO responde perguntas, detecta categorias de tópico para mudar o tom e sorteia de um baralho completo de 78 cartas de Tarô quando solicitado. O LLM é uma instância Ollama local (llama3.1:8b), sem chaves de API externas. A Fase 2 é o Ekonsulta, um jogo narrativo satírico sobre comportamento ambiental: jogadores fazem escolhas binárias em 50 dilemas abrangendo alimentação, moda, transporte, água e tecnologia. Uma pontuação oculta mapeia cada escolha para um de 6 arquétipos comportamentais — EKO entrega o veredicto final com precisão sarcástica.",
    problem:
      "Environmental awareness campaigns typically address users didactically — presenting facts and expecting behavioral change. This approach fails to reach people who already know what they should do but don't act on it. Ekonsulta targets a specific audience: people who engage in 'green performance' — virtue signaling about sustainability while their actual choices contradict their stated values. Sarcasm and uncomfortable self-recognition are more effective tools than information for this audience.",
    problemPt:
      "Campanhas de conscientização ambiental tipicamente abordam usuários de forma didática — apresentando fatos e esperando mudança de comportamento. Essa abordagem falha em atingir pessoas que já sabem o que deveriam fazer, mas não agem. O Ekonsulta mira em um público específico: pessoas que praticam 'performance verde' — sinalizando virtude sobre sustentabilidade enquanto suas escolhas reais contradizem seus valores declarados. Sarcasmo e autorreconhecimento desconfortável são ferramentas mais eficazes do que informação para esse público.",
    goal:
      "Phase 1: deploy a production-quality AI chatbot with a strong character persona, full Tarot support, and reliable connectivity to a self-hosted LLM despite VPN routing challenges. Phase 2: design and prototype a narrative game with 50 deep-researched dilemmas, 6 behavioral archetypes, and a hidden scoring system that prevents players from optimizing toward a desired outcome.",
    goalPt:
      "Fase 1: implantar um chatbot de IA com persona de personagem forte, suporte completo a Tarô e conectividade confiável a um LLM auto-hospedado apesar de desafios de roteamento VPN. Fase 2: projetar e prototipar um jogo narrativo com 50 dilemas pesquisados em profundidade, 6 arquétipos comportamentais e um sistema de pontuação oculto que impede jogadores de otimizar para o resultado desejado.",
    role: [
      "Clayton Borges — UI, mobile optimization, context/persona tuning, project ownership",
      "Raphael Palmer — VPN bypass engineering, Ollama server integration, core backend logic",
    ],
    rolePt: [
      "Clayton Borges — UI, otimização mobile, ajuste de contexto/persona, ownership do projeto",
      "Raphael Palmer — engenharia do bypass de VPN, integração do servidor Ollama, lógica central do backend",
    ],
    technicalDecisions: [
      "No cloud LLM dependency — the entire system runs on a self-hosted Ollama instance (llama3.1:8b). No OpenAI/Anthropic API keys, no per-token costs, no user data leaving the infrastructure. Chosen for cost control and privacy; the tradeoff is that inference speed depends on local hardware.",
      "DNS monkey-patching in production code — socket.getaddrinfo is replaced at module load time to force 'localhost' → '127.0.0.1'. This is a production workaround for VPN DNS interception that prevented the app from resolving localhost to the loopback interface in the deployment environment.",
      "Dual tunnel strategy — the Docker image bundles ngrok for container deployments (starts ngrok inside the container to create a public tunnel to host.docker.internal:11434). The local dev script uses Cloudflare Tunnel as an alternative public endpoint. Multiple topologies were tested to find reliable connectivity through VPN.",
      "Two separate prompt paths — tarot requests use a short, focused prompt for card interpretation. Conversation requests use the full EKO persona context + conversation history window + tone instruction injected based on topic category detection (astrology keywords → cosmic tone; greetings → welcome tone).",
      "Response post-processing pipeline — the LLM (especially llama3.1:8b) tends to include <think> tags, EKO self-references, internal monologue, and leaked card names outside of tarot mode. The separate_thinking_and_response() function strips all of this with targeted regex patterns.",
      "Session isolation via UUID in TinyDB — each browser session gets a UUID stored in st.session_state; all DB queries are scoped to that UUID, enabling concurrent multi-user usage on a single TinyDB JSON file without cross-session contamination.",
      "Hidden scoring system in Ekonsulta — the game deliberately hides all point accumulation from the player. Each of the 50 dilemma choices secretly increments weights for one or more of 6 behavioral archetypes. The design philosophy: players should not be able to 'optimize' toward a desired archetype — the verdict should feel revelatory.",
      "50 deep-researched dilemmas across 5 themes — each theme (food, fashion, cars, water, technology) has a dedicated research document backing the scenario writing. Scenarios were designed to avoid obvious 'right answers,' forcing players to confront genuine tensions between convenience, cost, and environmental impact.",
    ],
    technicalDecisionsPt: [
      "Sem dependência de LLM em nuvem — o sistema inteiro roda em uma instância Ollama auto-hospedada (llama3.1:8b). Sem chaves de API externas, sem custos por token, sem dados do usuário saindo da infraestrutura. Escolhido por controle de custo e privacidade; o tradeoff é que a velocidade de inferência depende do hardware local.",
      "Monkey-patching de DNS no código de produção — socket.getaddrinfo é substituído no carregamento do módulo para forçar 'localhost' → '127.0.0.1'. Um workaround de produção para interceptação de DNS por VPN que impedia o app de resolver localhost para a interface de loopback no ambiente de deployment.",
      "Estratégia dual de tunnel — a imagem Docker inclui ngrok para deployments em container (inicia ngrok dentro do container para criar um tunnel público para host.docker.internal:11434). O script de dev local usa Cloudflare Tunnel como endpoint público alternativo. Múltiplas topologias foram testadas para encontrar conectividade confiável através de VPN.",
      "Dois caminhos de prompt separados — requisições de Tarô usam um prompt curto e focado para interpretação de cartas. Requisições de conversa usam o contexto completo da persona EKO + janela de histórico de conversa + instrução de tom injetada com base na detecção de categoria do tópico.",
      "Pipeline de pós-processamento de resposta — o LLM (especialmente o llama3.1:8b) tende a incluir tags <think>, autoreferências do EKO, monólogo interno e nomes de cartas vazando fora do modo de Tarô. A função separate_thinking_and_response() limpa tudo isso com padrões regex direcionados.",
      "Isolamento de sessão via UUID no TinyDB — cada sessão do navegador recebe um UUID armazenado em st.session_state; todas as queries ao banco são escopadas por esse UUID, habilitando uso multiusuário simultâneo em um único arquivo JSON do TinyDB sem contaminação entre sessões.",
      "Sistema de pontuação oculto no Ekonsulta — o jogo deliberadamente esconde toda acumulação de pontos do jogador. Cada escolha nos 50 dilemas secretamente incrementa pesos para um ou mais dos 6 arquétipos comportamentais. Filosofia: jogadores não devem conseguir 'otimizar' para o arquétipo desejado — o veredicto deve parecer revelador.",
      "50 dilemas com pesquisa profunda em 5 temas — cada tema tem um documento de pesquisa dedicado embasando a escrita dos cenários. Os cenários foram projetados para evitar 'respostas certas' óbvias, forçando jogadores a confrontar tensões genuínas entre conveniência, custo e impacto ambiental.",
    ],
    learnings: [
      "Persona engineering for a local LLM requires significantly more iteration than for cloud models — llama3.1:8b at temperature 0.9 is creative but inconsistent, requiring an explicit response post-processing layer to enforce character consistency that a larger model would maintain on its own.",
      "The VPN connectivity problem produced the most creative engineering in the project: DNS monkey-patching, dual tunnel strategies, and prefer-127.0.0.1-over-localhost are each unusual solutions that worked precisely because we diagnosed the root cause (DNS interception) rather than treating symptoms.",
      "Hidden scoring is a game design decision, not just a technical one — making scores visible during the Ekonsulta flow would let players reverse-engineer the archetypes and pick answers strategically, completely defeating the game's purpose. The reveal-at-the-end structure is essential to the satirical effect.",
      "TinyDB (JSON file database) is adequate for a Streamlit prototype with low concurrent usage but would not scale to multi-user production deployment — the single-file structure creates write contention under any meaningful concurrency.",
      "Building a chatbot persona requires both system prompt engineering and output post-processing — the prompt defines how the model should respond, but a post-processing layer is needed to catch the cases where the model breaks character, especially for smaller models with less instruction-following reliability.",
    ],
    learningsPt: [
      "Engenharia de persona para um LLM local exige muito mais iteração do que para modelos em nuvem — o llama3.1:8b na temperatura 0.9 é criativo mas inconsistente, exigindo uma camada explícita de pós-processamento de resposta para manter consistência do personagem que um modelo maior manteria por conta própria.",
      "O problema de conectividade VPN produziu a engenharia mais criativa do projeto: monkey-patching de DNS, estratégias duais de tunnel e preferência por 127.0.0.1 são cada um soluções incomuns que funcionaram precisamente porque diagnosticamos a causa raiz (interceptação de DNS) em vez de tratar sintomas.",
      "Pontuação oculta é uma decisão de design de jogo, não apenas técnica — tornar as pontuações visíveis durante o Ekonsulta permitiria que jogadores engenharia reversa os arquétipos e escolhessem respostas estrategicamente, derrotando completamente o propósito do jogo. A estrutura de revelação no final é essencial para o efeito satírico.",
      "TinyDB é adequado para um protótipo Streamlit com baixo uso simultâneo, mas não escalaria para deployment de produção multiusuário — a estrutura de arquivo único cria contenção de escrita sob qualquer concorrência significativa.",
      "Construir uma persona de chatbot requer tanto engenharia de system prompt quanto pós-processamento de output — o prompt define como o modelo deve responder, mas uma camada de pós-processamento é necessária para capturar os casos em que o modelo quebra o personagem, especialmente para modelos menores.",
    ],
    status: "Phase 1 deployed — Phase 2 (Ekonsulta) prototype complete, full game in design",
    statusPt: "Fase 1 implantada — Fase 2 (Ekonsulta) protótipo completo, jogo completo em design",
    image: "/projects/EKO/eko-residencia-poster.jpeg",
    gallery: [
      "/projects/EKO/eko-residencia-poster.jpeg",
      "/projects/EKO/eko-residencia-apoiadores.jpeg",
    ],
    githubUrl: "https://github.com/drama-ai/chatbot",
    liveUrl: "https://eko-ai.streamlit.app",
    grant: "EKO – Residência Artística · FAC – Fundo de Apoio à Cultura do Distrito Federal / GDF",
    grantPt: "EKO – Residência Artística · FAC – Fundo de Apoio à Cultura do Distrito Federal / GDF",
    featured: false,
    year: 2025,
  },
  {
    id: "novo-rio",
    nameEn: "Novo Rio – Agroforestry Simulation RPG",
    namePt: "Novo Rio – RPG de Simulação de Agrofloresta",
    name: "Novo Rio",
    type: "Web Game / Simulation / AI-Assisted",
    descriptionEn:
      "Browser-based agroforestry simulation RPG developed within EKO – Residência Artística, funded by FAC / GDF. Set in Rio de Janeiro and built on sintropic agriculture principles. Players restore degraded land through planting, soil management, and seasonal adaptation. A real-time tick engine drives plant lifecycles, climate events, and soil health scoring. EKO — a local Ollama LLM — acts as an AI guide, and players can manage their farm via WhatsApp commands.",
    descriptionPt:
      "RPG de simulação de agrofloresta baseado em navegador desenvolvido dentro da EKO – Residência Artística, financiado pelo FAC / GDF. Ambientado no Rio de Janeiro e construído sobre princípios da agricultura sintrópica. Jogadores restauram terras degradadas através de plantio, gestão do solo e adaptação sazonal. Um motor de ticks em tempo real impulsiona ciclos de vida de plantas, eventos climáticos e pontuação de saúde do solo. EKO — um LLM Ollama local — atua como guia IA, e jogadores podem gerenciar sua fazenda por comandos via WhatsApp.",
    tech: [
      "FastAPI",
      "Python",
      "SQLAlchemy",
      "PostgreSQL",
      "Redis",
      "APScheduler",
      "Ollama",
      "Next.js 15",
      "React 19",
      "TypeScript",
      "TailwindCSS",
      "Radix UI",
      "TanStack Query",
      "Docker",
    ],
    categories: ["web-app", "ai-ml"],
    highlights: [
      "6-hour real-time tick engine with TIME_SCALE_FACTOR env var to compress game time for testing",
      "Plant lifecycle state machine: SEMENTE → MUDINHA → MADURA → COLHIVEL → COLHIDA/MORTA",
      "Soil health index: 6-parameter weighted scoring (moisture, fertility, pH, organic matter, biodiversity, compaction)",
      "15% neighbor quadrant propagation: watering or fertilizing one quadrant spills effects to adjacent cells",
      "WhatsApp integration: players can plant, water, and harvest by texting commands",
    ],
    overview:
      "Novo Rio is a browser-based agroforestry simulation RPG developed as part of EKO – Residência Artística, a cultural residency funded by FAC – Fundo de Apoio à Cultura do Distrito Federal, Secretaria de Cultura e Economia Criativa / GDF. The game is built around the principles of sintropic agriculture — the Brazilian regenerative farming philosophy associated with Ernst Götsch. Players manage degraded terrain in a Rio de Janeiro setting, restoring it by planting real Brazilian species (Feijão Guandu, Banana, Cajuzinho, Ipê-roxo, Milho, Abacaxi), managing soil health parameters, and adapting to a realistic climate system with drought, heavy rain, heat waves, and seasonal multipliers. The backend runs a real-time tick engine (APScheduler, 6-hour cycle) that drives plant growth, applies climate events, and evaluates soil health. EKO, powered by a local Ollama LLM with Redis-backed conversation history, acts as the player's AI farming advisor.",
    overviewPt:
      "Novo Rio é um RPG de simulação de agrofloresta baseado em navegador desenvolvido como parte da EKO – Residência Artística, uma residência cultural financiada pelo FAC – Fundo de Apoio à Cultura do Distrito Federal, Secretaria de Cultura e Economia Criativa / GDF. O jogo é construído em torno dos princípios da agricultura sintrópica — a filosofia de agricultura regenerativa brasileira associada a Ernst Götsch. Jogadores gerenciam terrenos degradados em um cenário do Rio de Janeiro, restaurando-os plantando espécies brasileiras reais (Feijão Guandu, Banana, Cajuzinho, Ipê-roxo, Milho, Abacaxi), gerenciando parâmetros de saúde do solo e adaptando-se a um sistema climático realista com seca, chuva forte, ondas de calor e multiplicadores sazonais. O backend executa um motor de ticks em tempo real (APScheduler, ciclo de 6 horas) que impulsiona o crescimento das plantas, aplica eventos climáticos e avalia a saúde do solo. EKO, alimentado por um LLM Ollama local com histórico de conversa no Redis, atua como conselheiro agrícola IA do jogador.",
    problem:
      "Sintropic agroforestry is a proven regenerative land-restoration technique with limited public awareness and no gamified entry point. Most environmental games either abstract away the technical complexity of real agriculture or focus on punishment mechanics. Novo Rio aims to teach real planting logic — actual species tolerances, soil parameter interdependencies, seasonal growth multipliers — through gameplay, making the learning curve invisible.",
    problemPt:
      "A agrofloresta sintrópica é uma técnica comprovada de restauração de terras com consciência pública limitada e nenhum ponto de entrada gamificado. A maioria dos jogos ambientais abstrai a complexidade técnica da agricultura real ou foca em mecânicas de punição. O Novo Rio visa ensinar lógica de plantio real — tolerâncias reais de espécies, interdependências de parâmetros do solo, multiplicadores sazonais de crescimento — através da gameplay, tornando a curva de aprendizado invisível.",
    goal:
      "Build a simulation game that: (1) models real Brazilian agroforestry species and soil dynamics accurately; (2) runs a real-time tick engine with configurable time compression for testing; (3) integrates a local LLM as an in-game guide with game-state awareness; (4) supports WhatsApp as a first-class input channel so players can interact without opening a browser.",
    goalPt:
      "Construir um jogo de simulação que: (1) modele espécies reais de agrofloresta brasileira e dinâmicas do solo com precisão; (2) execute um motor de ticks em tempo real com compressão de tempo configurável para testes; (3) integre um LLM local como guia no jogo com consciência do estado do jogo; (4) suporte WhatsApp como canal de entrada de primeira classe para que jogadores possam interagir sem abrir um navegador.",
    role: ["Solo developer — game design, backend, frontend, data modeling, AI integration"],
    rolePt: ["Desenvolvedor solo — design do jogo, backend, frontend, modelagem de dados, integração IA"],
    technicalDecisions: [
      "APScheduler tick engine with TIME_SCALE_FACTOR — a 6-hour real-time scheduler drives all game state changes. The TIME_SCALE_FACTOR environment variable compresses game time (e.g., TIME_SCALE_FACTOR=24 makes 1 real hour = 1 game day), making the full plant lifecycle testable in hours rather than months.",
      "YAML-driven species configuration with hot-reload — species.yml defines all plant parameters (germination days, maturity days, drought tolerance, harvest yield). The tick_day() function re-reads the YAML on every cycle so game designers can tweak species balance without restarting the server.",
      "Weighted soil health index — a custom scoring algorithm computes a 0–100 soil health score across 6 parameters with per-parameter ideal ranges and severity thresholds. This produces meaningful quality categories (Excelente / Muito Bom / Regular / Crítico) that give players actionable feedback rather than raw numbers.",
      "15% neighbor quadrant propagation — applying water, fertilizer, or compost to one quadrant propagates 15% of the effect to the 4 adjacent quadrants (N/S/E/W), modeling real soil moisture diffusion and making spatial planting decisions consequential.",
      "Plant lifecycle state machine — 5 states (SEMENTE / MUDINHA / MADURA / COLHIVEL / COLHIDA / MORTA) with time-driven transitions controlled by species parameters. Drought tolerance determines how many tick cycles a plant survives without water before dying.",
      "WhatsApp as a primary input channel — a /whatsapp/message endpoint parses natural-language text commands ('plantar 3 regador') and maps them to game actions, rate-limited by the same 6-hour cycle system as the web UI. The game was designed so a player could fully manage their farm from WhatsApp.",
      "Dual sync/async API architecture — both src/api/ (sync with run_in_threadpool) and src/api_async/ (native async) coexist, reflecting a migration in progress toward full async FastAPI. The coexistence allowed incremental migration without breaking existing endpoints.",
      "EKO/Ollama with Redis conversation context — the /eko endpoint proxies messages to a local Ollama instance with per-session conversation history stored in Redis, enabling EKO to give contextual planting advice that references prior exchanges.",
      "Secret tool abilities scaffolded in tools.yml — each tool has a secret_special_ability field defining a discovery mechanic ('if used for ACTION in CLIMATE with SPECIES → unlock bonus'). Not yet implemented in the game engine but fully specified in the data layer, designed to add a hidden discovery layer for experienced players.",
    ],
    technicalDecisionsPt: [
      "Motor de ticks APScheduler com TIME_SCALE_FACTOR — um scheduler de 6 horas em tempo real impulsiona todas as mudanças de estado do jogo. A variável de ambiente TIME_SCALE_FACTOR comprime o tempo do jogo (ex: TIME_SCALE_FACTOR=24 faz 1 hora real = 1 dia do jogo), tornando o ciclo completo de vida das plantas testável em horas em vez de meses.",
      "Configuração de espécies via YAML com hot-reload — o species.yml define todos os parâmetros das plantas (dias de germinação, dias de maturidade, tolerância à seca, rendimento de colheita). A função tick_day() relê o YAML a cada ciclo para que designers de jogo possam ajustar o balanceamento sem reiniciar o servidor.",
      "Índice de saúde do solo com pesos — um algoritmo de pontuação customizado calcula uma pontuação de saúde do solo de 0 a 100 em 6 parâmetros com faixas ideais e limiares de severidade por parâmetro. Isso produz categorias de qualidade significativas (Excelente / Muito Bom / Regular / Crítico) que dão ao jogador feedback acionável em vez de números brutos.",
      "Propagação de 15% para quadrantes vizinhos — aplicar água, fertilizante ou composto em um quadrante propaga 15% do efeito para os 4 quadrantes adjacentes (N/S/L/O), modelando a difusão real de umidade do solo e tornando as decisões espaciais de plantio consequentes.",
      "Máquina de estados do ciclo de vida das plantas — 5 estados (SEMENTE / MUDINHA / MADURA / COLHIVEL / COLHIDA / MORTA) com transições controladas por tempo pelos parâmetros da espécie. A tolerância à seca determina quantos ciclos de tick uma planta sobrevive sem água antes de morrer.",
      "WhatsApp como canal de entrada principal — um endpoint /whatsapp/message analisa comandos de texto em linguagem natural ('plantar 3 regador') e os mapeia para ações do jogo, limitados pela mesma taxa de ações por ciclo de 6 horas que a UI web. O jogo foi projetado para que um jogador possa gerenciar sua fazenda completamente pelo WhatsApp.",
      "Arquitetura dual sync/async — src/api/ (sync com run_in_threadpool) e src/api_async/ (async nativo) coexistem, refletindo uma migração em andamento para FastAPI totalmente async. A coexistência permitiu migração incremental sem quebrar endpoints existentes.",
      "EKO/Ollama com contexto de conversa no Redis — o endpoint /eko encaminha mensagens para uma instância Ollama local com histórico de conversa por sessão armazenado no Redis, permitindo que EKO dê conselhos contextuais de plantio referenciando trocas anteriores.",
      "Habilidades secretas de ferramentas scaffolded em tools.yml — cada ferramenta tem um campo secret_special_ability definindo uma mecânica de descoberta ('se usado para AÇÃO em CLIMA com ESPÉCIE → desbloquear bônus'). Ainda não implementado no motor do jogo, mas totalmente especificado na camada de dados, projetado para adicionar uma camada de descoberta oculta para jogadores experientes.",
    ],
    learnings: [
      "APScheduler combined with TIME_SCALE_FACTOR is a powerful testing pattern for time-driven games — being able to run a full crop cycle in minutes rather than months makes iterating on game balance tractable without requiring a separate test harness.",
      "YAML for game data configuration (species, tools, inputs) separates content authoring from code changes in a meaningful way — a non-programmer game designer can tune species balance without touching Python files, which matters as the game expands.",
      "Modeling real ecological systems (soil pH, organic matter interdependencies, drought tolerance) produces more engaging simulation mechanics than invented parameters, because the real relationships are already interesting and non-obvious to most players.",
      "WhatsApp as a game input channel is architecturally straightforward (a webhook endpoint + NLP command parsing) but produces a fundamentally different game experience — asynchronous, low-friction interactions that fit naturally into daily routines rather than requiring dedicated play sessions.",
      "Dual sync/async API coexistence in FastAPI is manageable but creates maintenance overhead — having two parallel implementations of the same endpoints means any bug fix must be applied twice. A cleaner migration path would be to add an async wrapper layer rather than maintaining two code trees.",
    ],
    learningsPt: [
      "APScheduler combinado com TIME_SCALE_FACTOR é um padrão de teste poderoso para jogos baseados em tempo — poder executar um ciclo completo de cultivo em minutos em vez de meses torna o balanceamento do jogo tratável sem exigir um harness de teste separado.",
      "YAML para configuração de dados do jogo (espécies, ferramentas, insumos) separa a autoria de conteúdo das mudanças de código de forma significativa — um designer de jogo não programador pode ajustar o balanceamento de espécies sem tocar em arquivos Python.",
      "Modelar sistemas ecológicos reais (pH do solo, interdependências de matéria orgânica, tolerância à seca) produz mecânicas de simulação mais envolventes do que parâmetros inventados, porque as relações reais já são interessantes e não óbvias para a maioria dos jogadores.",
      "WhatsApp como canal de entrada do jogo é arquiteturalmente direto (endpoint de webhook + parsing de comandos NLP), mas produz uma experiência de jogo fundamentalmente diferente — interações assíncronas e de baixo atrito que se encaixam naturalmente nas rotinas diárias em vez de exigir sessões de jogo dedicadas.",
      "Coexistência de API dual sync/async no FastAPI é gerenciável, mas cria overhead de manutenção — ter duas implementações paralelas dos mesmos endpoints significa que qualquer correção de bug deve ser aplicada duas vezes. Um caminho de migração mais limpo seria adicionar uma camada de wrapper async em vez de manter duas árvores de código.",
    ],
    status: "Functional prototype — active development paused, resuming planned",
    statusPt: "Protótipo funcional — desenvolvimento ativo pausado, retomada planejada",
    gallery: [
      "/projects/EKO/eko-residencia-poster.jpeg",
      "/projects/EKO/eko-residencia-apoiadores.jpeg",
    ],
    grant: "EKO – Residência Artística · FAC – Fundo de Apoio à Cultura do Distrito Federal / GDF",
    grantPt: "EKO – Residência Artística · FAC – Fundo de Apoio à Cultura do Distrito Federal / GDF",
    featured: false,
    year: 2025,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
