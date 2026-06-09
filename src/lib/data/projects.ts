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
      "Construir uma ferramenta de página única que: (1) autentique via Google OAuth2 com escopo de upload do YouTube; (2) codifique um vídeo 1080p a partir de WAV + PNG inteiramente no navegador sem processamento de vídeo no servidor; (3) faça staging no GCS e upload ao YouTube com metadados fornecidos pelo usuário; (4) permita prévisualizar o vídeo antes do passo final de upload.",
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
      "Two-phase AI project: a deployed mystical chatbot (Python + Streamlit + local Ollama) where users consult EKO — a sarcastic, timeless oracular entity — with full 78-card Tarot reading support; and Ekonsulta, a satirical narrative game that profiles players' environmental behavior across 50 dilemmas into 6 behavioral archetypes, using hidden scoring to prevent gaming the result.",
    descriptionPt:
      "Projeto de IA em duas fases: um chatbot místico implantado (Python + Streamlit + Ollama local) onde usuários consultam EKO — uma entidade oracular sarcástica e atemporal — com suporte completo a leitura de Tarô com 78 cartas; e Ekonsulta, um jogo narrativo satírico que classifica o comportamento ambiental dos jogadores em 6 arquétipos a partir de 50 dilemas, com pontuação oculta para evitar manipulação do resultado.",
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
      "EKO is a two-phase AI project built by Clayton Borges and Raphael Palmer. Phase 1 is a production chatbot: users interact with EKO — a mystical, sarcastic oracular character — via a Streamlit web UI styled with a full-bleed mystical aesthetic. EKO answers questions, detects topic categories to shift tone, and draws from a full 78-card Tarot deck when requested. The LLM is a local Ollama instance (llama3.1:8b), with no external API keys. Phase 2 is Ekonsulta, a satirical narrative game about environmental behavior: players make binary choices across 50 dilemmas spanning food, fashion, transportation, water, and technology. Hidden scoring maps each choice to one of 6 behavioral archetypes — EKO delivers the final verdict with sarcastic precision.",
    overviewPt:
      "EKO é um projeto de IA em duas fases construído por Clayton Borges e Raphael Palmer. A Fase 1 é um chatbot em produção: usuários interagem com EKO — um personagem oracular místico e sarcástico — via uma UI web Streamlit com estética mística total. EKO responde perguntas, detecta categorias de tópico para mudar o tom e sorteia de um baralho completo de 78 cartas de Tarô quando solicitado. O LLM é uma instância Ollama local (llama3.1:8b), sem chaves de API externas. A Fase 2 é o Ekonsulta, um jogo narrativo satírico sobre comportamento ambiental: jogadores fazem escolhas binárias em 50 dilemas abrangendo alimentação, moda, transporte, água e tecnologia. Uma pontuação oculta mapeia cada escolha para um de 6 arquétipos comportamentais — EKO entrega o veredicto final com precisão sarcástica.",
    problem:
      "Environmental awareness campaigns typically address users didactically — presenting facts and expecting behavioral change. This approach fails to reach people who already know what they should do but don't act on it. Ekonsulta targets a specific audience: people who engage in 'green performance' — virtue signaling about sustainability while their actual choices contradict their stated values. Sarcasm and uncomfortable self-recognition are more effective tools than information for this audience.",
    problemPt:
      "Campanhas de conscientização ambiental tipicamente abordam usuários de forma didática — apresentando fatos e esperando mudança de comportamento. Essa abordagem falha em atingir pessoas que já sabem o que deveriam fazer, mas não agem. O Ekonsulta mira em um público específico: pessoas que praticam 'performance verde' — sinalizando virtude sobre sustentabilidade enquanto suas escolhas reais contradizem seus valores declarados. Sarcasmo e autorreconhecimento desconfortável são ferramentas mais eficazes do que informação para esse público.",
    goal:
      "Phase 1: deploy a production-quality AI chatbot with a strong character persona, full Tarot support, and reliable connectivity to a self-hosted LLM despite VPN routing challenges. Phase 2: design and prototype a narrative game with 50 deep-researched dilemmas, 6 behavioral archetypes, and a hidden scoring system that prevents players from optimizing toward a desired outcome.",
    goalPt:
      "Fase 1: implantar um chatbot de IA com persona de personagem forte, suporte completo a Tarô e conectividade confiável a um LLM auto-hospedado apesar de desafios de roteamento VPN. Fase 2: projetar e prototiprar um jogo narrativo com 50 dilemas pesquisados em profundidade, 6 arquétipos comportamentais e um sistema de pontuação oculto que impede jogadores de otimizar para o resultado desejado.",
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
    githubUrl: "https://github.com/drama-ai/chatbot",
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
      "Browser-based agroforestry simulation RPG set in Rio de Janeiro, built on sintropic agriculture principles. Players restore degraded land through planting, soil management, and seasonal adaptation. A real-time tick engine drives plant lifecycles, climate events, and soil health scoring. EKO — a local Ollama LLM — acts as an AI guide, and players can manage their farm via WhatsApp commands.",
    descriptionPt:
      "RPG de simulação de agrofloresta baseado em navegador ambientado no Rio de Janeiro, construído sobre princípios da agricultura sintrópioa. Jogadores restauram terras degradadas através de plantio, gestão do solo e adaptação sazonal. Um motor de ticks em tempo real impulsiona ciclos de vida de plantas, eventos climáticos e pontuação de saúde do solo. EKO — um LLM Ollama local — atua como guia IA, e jogadores podem gerenciar sua fazenda por comandos via WhatsApp.",
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
      "Novo Rio is a browser-based agroforestry simulation RPG built around the principles of sintropic agriculture — the Brazilian regenerative farming philosophy associated with Ernst Götsch. Players manage degraded terrain in a Rio de Janeiro setting, restoring it by planting real Brazilian species (Feijão Guandu, Banana, Cajuzinho, Ipê-roxo, Milho, Abacaxi), managing soil health parameters, and adapting to a realistic climate system with drought, heavy rain, heat waves, and seasonal multipliers. The backend runs a real-time tick engine (APScheduler, 6-hour cycle) that drives plant growth, applies climate events, and evaluates soil health. EKO, powered by a local Ollama LLM with Redis-backed conversation history, acts as the player's AI farming advisor.",
    overviewPt:
      "Novo Rio é um RPG de simulação de agrofloresta baseado em navegador construído em torno dos princípios da agricultura sintrópioa — a filosofia de agricultura regenerativa brasileira associada a Ernst Götsch. Jogadores gerenciam terrenos degradados em um cenário do Rio de Janeiro, restaurando-os plantando espécies brasileiras reais (Feijão Guandu, Banana, Cajuzinho, Ipê-roxo, Milho, Abacaxi), gerenciando parâmetros de saúde do solo e adaptando-se a um sistema climático realista com seca, chuva forte, ondas de calor e multiplicadores sazonais. O backend executa um motor de ticks em tempo real (APScheduler, ciclo de 6 horas) que impulsiona o crescimento das plantas, aplica eventos climáticos e avalia a saúde do solo. EKO, alimentado por um LLM Ollama local com histórico de conversa no Redis, atua como conselheiro agrícola IA do jogador.",
    problem:
      "Sintropic agroforestry is a proven regenerative land-restoration technique with limited public awareness and no gamified entry point. Most environmental games either abstract away the technical complexity of real agriculture or focus on punishment mechanics. Novo Rio aims to teach real planting logic — actual species tolerances, soil parameter interdependencies, seasonal growth multipliers — through gameplay, making the learning curve invisible.",
    problemPt:
      "A agrofloresta sintrópioa é uma técnica comprovada de restauração de terras com consciência pública limitada e nenhum ponto de entrada gamificado. A maioria dos jogos ambientais abstrai a complexidade técnica da agricultura real ou foca em mecânicas de punição. O Novo Rio visa ensinar lógica de plantio real — tolerâncias reais de espécies, interdependências de parâmetros do solo, multiplicadores sazonais de crescimento — através da gameplay, tornando a curva de aprendizado invisível.",
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
    featured: false,
    year: 2025,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
