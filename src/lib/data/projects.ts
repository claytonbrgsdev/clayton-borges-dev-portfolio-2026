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
  {
    id: "tropical-twista",
    nameEn: "Tropical Twista – Video Automation",
    namePt: "Tropical Twista – Automação de Vídeo",
    name: "Tropical Twista",
    descriptionEn:
      "Video automation system using YouTube API v3 with FFmpeg encoding, Firestore catalog storage, and Firebase Auth with OAuth 2.0 for Tropical Twista Records.",
    descriptionPt:
      "Sistema de automação de vídeo usando YouTube API v3 com codificação FFmpeg, catálogo no Firestore e Firebase Auth com OAuth 2.0 para a Tropical Twista Records.",
    tech: ["React", "TypeScript", "Node.js", "Express", "Firebase", "FFmpeg", "YouTube API"],
    categories: ["platform", "web-app"],
    featured: false,
    year: 2023,
    client: "Tropical Twista Records",
  },

  // --- PERSONAL / OPEN SOURCE PROJECTS ---
  {
    id: "habitos",
    nameEn: "Habitos – Habit & Therapy Tracker",
    namePt: "Habitos – Rastreador de Hábitos e Terapia",
    name: "Habitos",
    descriptionEn:
      "Full-stack habit and therapy tracking app for patient/therapist pairs. Built for ADHD support, then adapted and open-sourced.",
    descriptionPt:
      "App full-stack de rastreamento de hábitos e terapia para pares paciente/terapeuta. Desenvolvido para suporte a TDAH, depois adaptado e disponibilizado como open-source.",
    tech: ["Next.js 16", "Prisma", "PostgreSQL", "Tailwind CSS"],
    categories: ["web-app"],
    githubUrl: "https://github.com/claytonbrgsdev/habitos",
    featured: false,
    year: 2025,
  },
  {
    id: "novo-rio",
    nameEn: "Novo Rio – Agroforestry Gamification",
    namePt: "Novo Rio – Gamificação Agroflorestal",
    name: "Novo Rio",
    descriptionEn:
      "Full-stack gamified reforestation simulation with hierarchical map system, environmental parameters, health scoring, and multi-environment Docker deployment.",
    descriptionPt:
      "Simulação gamificada de reflorestamento full-stack com sistema de mapa hierárquico, parâmetros ambientais, pontuação de saúde e implantação Docker em múltiplos ambientes.",
    tech: ["FastAPI", "Next.js 15", "React 19", "PostgreSQL", "Redis", "Docker", "SQLAlchemy", "Alembic"],
    categories: ["web-app", "platform"],
    status: "In Progress",
    statusPt: "Em desenvolvimento",
    featured: false,
    year: 2025,
  },
  {
    id: "gio-study-scheduler",
    nameEn: "Gio – Intelligent ENEM Study Scheduler",
    namePt: "Gio – Agendador de Estudos Inteligente para o ENEM",
    name: "Gio",
    descriptionEn:
      "Adaptive study scheduler with spaced repetition (D+1, D+4, D+11, D+25), dynamic priority calculation, and intelligent task redistribution powered by OpenAI.",
    descriptionPt:
      "Agendador de estudos adaptativo com repetição espaçada (D+1, D+4, D+11, D+25), cálculo dinâmico de prioridades e redistribuição inteligente de tarefas com OpenAI.",
    tech: ["Next.js 15", "Node.js", "Express", "Supabase", "OpenAI API"],
    categories: ["ai-ml", "web-app"],
    featured: false,
    year: 2025,
  },
  {
    id: "asa-player",
    nameEn: "ASA Player – ASCII Music Visualizer",
    namePt: "ASA Player – Visualizador de Música ASCII",
    name: "ASA Player",
    descriptionEn:
      "Retro music player with real-time ASCII spectrum analyzer built with Web Audio API and Next.js.",
    descriptionPt:
      "Player de música retrô com analisador de espectro ASCII em tempo real construído com Web Audio API e Next.js.",
    tech: ["Next.js", "TypeScript", "Web Audio API"],
    categories: ["audio", "web-app"],
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
    descriptionEn:
      "Underwater shader playground with volumetric jellyfish visuals and real-time GLSL effects built with Three.js and WebGL.",
    descriptionPt:
      "Playground de shaders subaquáticos com visuais volumétricos de água-viva e efeitos GLSL em tempo real construído com Three.js e WebGL.",
    tech: ["Three.js", "GLSL", "WebGL", "JavaScript"],
    categories: ["3d-visualization"],
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
    descriptionEn:
      "Interactive 3D showroom with dynamic lighting controls and GLB asset viewer supporting custom shaders.",
    descriptionPt:
      "Showroom 3D interativo com controles dinâmicos de iluminação e visualizador de assets GLB com suporte a shaders customizados.",
    tech: ["Three.js", "JavaScript", "GLB", "Shaders"],
    categories: ["3d-visualization"],
    githubUrl: "https://github.com/claytonbrgsdev/product-showcase-v2",
    liveUrl: "https://claytonbrgsdev.github.io/product-showcase-v2/",
    featured: false,
    year: 2025,
  },
  {
    id: "reacto",
    nameEn: "REACTO – Web Audio-Visual Experiments",
    image: "/projects/reacto/project-reacto.png",
    namePt: "REACTO – Experimentos Audio-Visuais Web",
    name: "REACTO",
    descriptionEn:
      "Collection of web audio-visual experiments with tweakable real-time parameters combining React, Web Audio API, and Three.js.",
    descriptionPt:
      "Coleção de experimentos audiovisuais web com parâmetros ajustáveis em tempo real combinando React, Web Audio API e Three.js.",
    tech: ["React", "Web Audio API", "Three.js"],
    categories: ["audio", "3d-visualization"],
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
    descriptionEn:
      "3D spiral timeline visualization for tracking medication cycles, built with Three.js and Next.js.",
    descriptionPt:
      "Visualização de linha do tempo em espiral 3D para rastrear ciclos de medicação, construído com Three.js e Next.js.",
    tech: ["Three.js", "Next.js", "TypeScript"],
    categories: ["3d-visualization", "web-app"],
    githubUrl: "https://github.com/claytonbrgsdev/medication-cycles-tracker",
    liveUrl: "https://claytonbrgsdev.github.io/medication-cycles-tracker/",
    featured: false,
    year: 2025,
  },
  {
    id: "estock",
    nameEn: "eStock – Inventory Control",
    namePt: "eStock – Controle de Estoque",
    name: "eStock",
    descriptionEn:
      "Full-featured inventory management system with real-time stock tracking and reporting.",
    descriptionPt:
      "Sistema completo de gerenciamento de inventário com rastreamento de estoque em tempo real e relatórios.",
    tech: ["React", "TypeScript", "Vite"],
    categories: ["web-app"],
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
    descriptionEn:
      "Streamlit app with OpenAI Whisper transcription and pyannote.audio speaker diarization. Supports multiple formats, auto-segmentation, and PDF/DOCX export.",
    descriptionPt:
      "App Streamlit com transcrição OpenAI Whisper e diarização de falantes com pyannote.audio. Suporta múltiplos formatos, auto-segmentação e exportação PDF/DOCX.",
    tech: ["Python", "Streamlit", "OpenAI Whisper", "pyannote.audio", "FFmpeg"],
    categories: ["ai-ml", "audio"],
    featured: false,
    year: 2025,
  },
  {
    id: "spectations",
    nameEn: "SPECtations – Audio Visualizer",
    namePt: "SPECtations – Visualizador de Áudio",
    name: "SPECtations",
    descriptionEn:
      "Real-time macOS audio visualization tool with waveform display and spectrogram using system audio capture via BlackHole.",
    descriptionPt:
      "Ferramenta de visualização de áudio macOS em tempo real com exibição de forma de onda e espectrograma usando captura de áudio do sistema via BlackHole.",
    tech: ["Python", "PySide6", "PyQtGraph", "NumPy FFT", "sounddevice"],
    categories: ["audio"],
    image: "/projects/SPECtations/project-spectogram.jpeg",
    githubUrl: "https://github.com/claytonbrgsdev/SPECtations",
    featured: false,
    year: 2025,
  },
  {
    id: "data-engineering-pipelines",
    nameEn: "Data Engineering Pipelines",
    namePt: "Pipelines de Engenharia de Dados",
    name: "Data Engineering Pipelines",
    descriptionEn:
      "ETL pipelines with Apache Airflow orchestration, DBT data transformations, and PostgreSQL for Google Ads integration.",
    descriptionPt:
      "Pipelines ETL com orquestração Apache Airflow, transformações de dados DBT e PostgreSQL para integração com Google Ads.",
    tech: ["Apache Airflow", "DBT", "PostgreSQL", "Docker", "Google Ads API", "Python"],
    categories: ["data-engineering"],
    featured: false,
    year: 2024,
  },
  {
    id: "esp32-synthesizer",
    nameEn: "ESP32 Digital Synthesizer",
    namePt: "Sintetizador Digital ESP32",
    name: "ESP32 Synthesizer",
    descriptionEn:
      "Digital audio synthesizer on ESP32 microcontroller using the Mozzi library for real-time audio synthesis.",
    descriptionPt:
      "Sintetizador de áudio digital em microcontrolador ESP32 usando a biblioteca Mozzi para síntese de áudio em tempo real.",
    tech: ["C++", "ESP32", "Arduino", "Mozzi"],
    categories: ["audio", "embedded"],
    featured: false,
    year: 2024,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
