export type Principle = {
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  icon: string;
};

export const principles: Principle[] = [
  {
    title: "Product Thinking",
    titlePt: "Pensamento de Produto",
    description:
      "Focus on solving real product, user, or business problems — not just implementing features. Every decision traces back to why it matters.",
    descriptionPt:
      "Foco em resolver problemas reais de produto, usuário ou negócio — não apenas implementar funcionalidades. Cada decisão tem uma razão de existir.",
    icon: "◈",
  },
  {
    title: "Interface Quality",
    titlePt: "Qualidade de Interface",
    description:
      "Attention to layout, motion, responsiveness, and visual hierarchy. GSAP and Lenis are part of the toolkit, not decoration.",
    descriptionPt:
      "Atenção ao layout, movimento, responsividade e hierarquia visual. GSAP e Lenis fazem parte do toolkit, não são decoração.",
    icon: "◉",
  },
  {
    title: "Full-Stack Execution",
    titlePt: "Execução Full-Stack",
    description:
      "Ability to work across frontend, APIs, databases, and deployment — from Supabase RLS to Docker to AWS S3 — without switching contexts or teams.",
    descriptionPt:
      "Capacidade de trabalhar em frontend, APIs, bancos de dados e deploy — do Supabase RLS ao Docker e AWS S3 — sem depender de outras equipes.",
    icon: "◎",
  },
  {
    title: "Creative Craft",
    titlePt: "Artesanato Criativo",
    description:
      "Generative art, 3D, audio synthesis, and interactive experiences are part of the work. Code and aesthetics are not separate concerns.",
    descriptionPt:
      "Arte generativa, 3D, síntese de áudio e experiências interativas fazem parte do trabalho. Código e estética não são preocupações separadas.",
    icon: "◌",
  },
  {
    title: "Maintainability",
    titlePt: "Manutenibilidade",
    description:
      "Preference for reusable components, clear data structures, and code that can evolve. Including bilingual architecture and centralized config.",
    descriptionPt:
      "Preferência por componentes reutilizáveis, estruturas de dados claras e código que pode evoluir — incluindo arquitetura bilíngue e configuração centralizada.",
    icon: "◍",
  },
];
