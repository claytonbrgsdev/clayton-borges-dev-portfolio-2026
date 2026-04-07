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
  tech: string[];
  categories: ProjectCategory[];
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
    descriptionEn:
      "Bilingual (PT/EN) web platform for an independent film production company. Full CMS with admin dashboard, CRUD for films, crew, and news. Features TipTap rich text editor, drag-and-drop management, role-based auth via Supabase RLS, advanced GSAP animations, and Lenis smooth scroll.",
    descriptionPt:
      "Plataforma bilíngue (PT/EN) para produtora de cinema independente. CMS completo com dashboard admin, CRUD para filmes, equipe e notícias. Inclui editor de texto rico TipTap, gerenciamento drag-and-drop, autenticação por funções via Supabase RLS, animações GSAP avançadas e scroll suave com Lenis.",
    tech: ["Next.js 16", "React 19", "TypeScript", "Supabase", "PostgreSQL", "GSAP", "Lenis", "TipTap", "dnd-kit", "Tailwind CSS"],
    categories: ["platform", "web-app"],
    featured: true,
    year: 2024,
    client: "Moveo Filmes",
  },
  {
    id: "mzprime-3d-showcase",
    nameEn: "MzPrime – 3D Vehicle Showcase",
    namePt: "MzPrime – Showcase 3D de Veículos",
    name: "MzPrime – 3D Vehicle Showcase",
    descriptionEn:
      "Interactive 3D vehicle showroom with 12+ car models, real-time color and material editing, HDR environments, multi-region logo placement, and cinematic camera controls built for Evolut Digital.",
    descriptionPt:
      "Showroom 3D interativo de veículos com mais de 12 modelos de carros, edição de cor e material em tempo real, ambientes HDR, posicionamento de logotipo em múltiplas regiões e controles de câmera cinematográficos, desenvolvido para a Evolut Digital.",
    tech: ["Next.js 16", "React 19", "Three.js", "React Three Fiber", "Radix UI", "Tailwind CSS"],
    categories: ["3d-visualization", "web-app"],
    featured: true,
    year: 2025,
    client: "Evolut Digital",
  },
  {
    id: "pilot-pen-brazil",
    nameEn: "Pilot Pen Brazil – Sustainability Site",
    namePt: "Pilot Pen Brasil – Site de Sustentabilidade",
    name: "Pilot Pen Brazil",
    descriptionEn:
      "Scroll-triggered sustainability website with GSAP scroll animations, parallax effects, and responsive mobile-first design for Pilot Pen Brazil.",
    descriptionPt:
      "Site de sustentabilidade com animações de scroll GSAP, efeitos de paralaxe e design responsivo mobile-first para a Pilot Pen Brasil.",
    tech: ["HTML5", "CSS3/SCSS", "JavaScript", "GSAP", "Lenis", "jQuery"],
    categories: ["web-app"],
    featured: true,
    year: 2025,
    client: "Pilot Pen Brazil",
  },
  {
    id: "dsrptv-records",
    nameEn: "DSRPTV Records – Music Platform",
    namePt: "DSRPTV Records – Plataforma de Música",
    name: "DSRPTV Records",
    descriptionEn:
      "E-commerce and music streaming platform with vinyl purchases, music playback, and artist profiles. Integrated Stripe and Mercado Pago payments, Spotify API for previews, AWS S3 for storage, and 3D graphics via Three.js.",
    descriptionPt:
      "Plataforma de e-commerce e streaming musical com compra de vinis, reprodução de música e perfis de artistas. Integração com Stripe e Mercado Pago, Spotify API para prévias, AWS S3 para armazenamento e gráficos 3D com Three.js.",
    tech: ["React", "TypeScript", "Vite", "Three.js", "Firebase", "AWS S3", "Stripe", "Mercado Pago", "Redux", "Ant Design"],
    categories: ["platform", "web-app"],
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
    featured: true,
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
    descriptionEn:
      "Privacy-focused multilingual Slack bot using a local LLM (Ollama) for real-time English-Portuguese translation via WebSocket.",
    descriptionPt:
      "Bot multilíngue do Slack focado em privacidade usando LLM local (Ollama) para tradução em tempo real Inglês-Português via WebSocket.",
    tech: ["Ruby", "Rack", "WebSocket", "Ollama", "Slack API"],
    categories: ["ai-ml"],
    featured: false,
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
