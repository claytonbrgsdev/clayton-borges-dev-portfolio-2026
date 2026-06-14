export type CaseStudySection = {
  heading: string;
  content: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  titlePt: string;
  tagline: string;
  taglinePt: string;
  projectType: string;
  projectTypePt: string;
  client: string;
  year: string;
  techStack: string[];
  heroImage: string | null;
  galleryImages: string[];
  demoVideo?: string | null;
  sections: CaseStudySection[];
  sectionsPt: CaseStudySection[];
  outcomes: string[];
  outcomesPt: string[];
  liveUrl?: string;
  githubUrl?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "moveo-filmes",
    title: "Moveo Filmes",
    titlePt: "Moveo Filmes",
    tagline:
      "Bilingual full-stack platform and CMS for an independent film production company in Brasília.",
    taglinePt:
      "Plataforma full-stack bilíngue e CMS para uma produtora de cinema independente em Brasília.",
    projectType: "Full-Stack · CMS Platform",
    projectTypePt: "Full-Stack · Plataforma CMS",
    client: "Moveo Filmes",
    year: "2024",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "GSAP",
      "Lenis",
      "TipTap",
      "dnd-kit",
      "Tailwind CSS",
    ],
    heroImage: "/projects/MOVEO/moveo-hero.png",
    galleryImages: [
      "/projects/MOVEO/moveo-about.png",
      "/projects/MOVEO/moveo-catalog-1.png",
      "/projects/MOVEO/moveo-catalog-2.png",
      "/projects/MOVEO/moveo-film-natureza.png",
      "/projects/MOVEO/moveo-film-misterio.png",
      "/projects/MOVEO/moveo-film-credits.png",
    ],
    demoVideo: "https://widxfmqb2xaemqo0.public.blob.vercel-storage.com/projects/moveo/moveo.mp4",
    sections: [
      {
        heading: "Overview",
        content:
          "Moveo Filmes needed a web platform that could work as a strong digital presence for the production company while also functioning as a structured portfolio for its films. The website had to present the company, showcase its film catalog, organize projects by production stage, and allow the client to manage content without depending on a developer for every update.\n\nThe platform was designed as a bilingual experience, serving both Portuguese and English audiences. Beyond the public-facing website, the project included an admin module where the client could add, edit, reorder, and manage films. Each film added through the admin system is automatically stored in the database and rendered as an individual page on the public website.\n\nThe result is a production-ready full-stack platform that combines editorial control, visual identity, content automation, and a cinematic interface.",
      },
      {
        heading: "Problem",
        content:
          "The client needed more than a static institutional website. As a film production company, Moveo Filmes needed a platform that could present its identity and its body of work in a way that felt aligned with cinema, authorship, and the company's Brasília-based context.\n\nThe website also needed to support films at different stages, such as production, post-production, distribution, or other phases of the film lifecycle. This created the need for a flexible portfolio structure rather than a simple gallery of finished projects.\n\nAnother important requirement was content autonomy. The client needed to manage films and news without manually editing the codebase. This required an admin system connected to a database, allowing new films to be added and existing content to be updated dynamically.\n\nThere was also a requirement for Instagram-related news management. Since part of the client's communication around films happens through Instagram, the platform needed to account for a workflow where news and updates related to films could be managed in connection with that social media presence.",
      },
      {
        heading: "Goal",
        content:
          "Build a bilingual full-stack platform that could present Moveo Filmes as a production company, showcase films as a structured portfolio, organize films by production stage, generate individual pages for each film automatically, give the client an admin dashboard to manage content, support news and content workflows related to the company's communication channels, and create a visual language connected to cinema, Brasília, and the company's identity.",
      },
      {
        heading: "My Role",
        content:
          "Full-stack developer (solo contract), responsible for frontend development, backend and data integration, admin dashboard implementation, CMS structure, database-driven film catalog, dynamic film pages, UI implementation, animation and interaction layer, responsive layout, content architecture, and technical decisions around data rendering and maintainability.",
      },
      {
        heading: "Design & UX",
        content:
          "The visual direction was built around the idea of making the films themselves the center of attention. The interface uses a mostly monochromatic structure so that the colors from each film's photography can stand out. Instead of competing visually with the films, the website gives them space to become the strongest visual element.\n\nThe layout explores strong grid lines and horizontal composition. This horizontal emphasis was intentional: it references the cinematic frame and creates a visual counterpoint to the current dominance of vertical media formats. Since Moveo Filmes works with cinema, the website needed to feel closer to film language than to a generic content feed.\n\nTypography was also an important part of the visual concept. The use of Helvetica Neue connects the identity of the interface to Brasília, where the production company is based. The typeface relates to the visual language found in the city's signage and graphic environment, bringing a subtle but meaningful local reference into the project.",
      },
      {
        heading: "Technical Decisions",
        content:
          "The platform was designed around a data-driven architecture. Film content is not hardcoded into the interface. Instead, the admin dashboard writes film data to the database, and the public website renders that data dynamically. This approach makes the site easier to maintain and gives the client autonomy over the content.\n\nRequirements included: structured database content for films, admin-side forms for creating and editing content, dynamic rendering of film pages, reusable components for film cards, pages, and content sections, a bilingual content structure, and animation and scroll behavior aligned with the visual identity.",
      },
      {
        heading: "What I Learned",
        content:
          "Improved the process of designing client-editable platforms with dynamic content. Deepened the relationship between visual identity, local context, and technical implementation. Built a more flexible approach to CMS-driven project pages and structured content.",
      },
    ],
    sectionsPt: [
      {
        heading: "Visão Geral",
        content:
          "A Moveo Filmes precisava de uma plataforma web que funcionasse como uma forte presença digital para a produtora, ao mesmo tempo em que atuava como portfólio estruturado de seus filmes. O site precisava apresentar a empresa, exibir seu catálogo de filmes, organizar projetos por fase de produção e permitir que o cliente gerenciasse o conteúdo sem depender de um desenvolvedor para cada atualização.\n\nA plataforma foi projetada como uma experiência bilíngue, atendendo públicos em português e inglês. Além do site público, o projeto incluiu um módulo admin onde o cliente poderia adicionar, editar, reordenar e gerenciar filmes. Cada filme adicionado pelo sistema admin é automaticamente armazenado no banco de dados e renderizado como uma página individual no site público.\n\nO resultado é uma plataforma full-stack pronta para produção que combina controle editorial, identidade visual, automação de conteúdo e uma interface cinematográfica.",
      },
      {
        heading: "Problema",
        content:
          "O cliente precisava de mais do que um site institucional estático. Como produtora de cinema, a Moveo Filmes precisava de uma plataforma que pudesse apresentar sua identidade e seu corpo de trabalho de uma forma alinhada ao cinema, à autoria e ao contexto brasiliense da empresa.\n\nO site também precisava suportar filmes em diferentes fases, como produção, pós-produção, distribuição ou outras etapas do ciclo de vida do filme. Isso criou a necessidade de uma estrutura de portfólio flexível, em vez de uma simples galeria de projetos finalizados.\n\nOutro requisito importante era a autonomia de conteúdo. O cliente precisava gerenciar filmes e notícias sem editar manualmente o código. Isso exigiu um sistema admin conectado a um banco de dados, permitindo que novos filmes fossem adicionados e o conteúdo existente fosse atualizado dinamicamente.\n\nHavia também um requisito de gerenciamento de notícias relacionadas ao Instagram. Como parte da comunicação do cliente sobre os filmes acontece pelo Instagram, a plataforma precisava contemplar um fluxo de trabalho onde notícias e atualizações relacionadas a filmes pudessem ser gerenciadas em conexão com essa presença nas redes sociais.",
      },
      {
        heading: "Objetivo",
        content:
          "Construir uma plataforma full-stack bilíngue capaz de apresentar a Moveo Filmes como produtora, exibir filmes como portfólio estruturado, organizar filmes por fase de produção, gerar páginas individuais para cada filme automaticamente, fornecer ao cliente um dashboard admin para gerenciar conteúdo, suportar fluxos de notícias e conteúdo relacionados aos canais de comunicação da empresa e criar uma linguagem visual conectada ao cinema, a Brasília e à identidade da empresa.",
      },
      {
        heading: "Meu Papel",
        content:
          "Desenvolvedor full-stack (contrato solo), responsável por desenvolvimento frontend, integração backend e de dados, implementação do dashboard admin, estrutura do CMS, catálogo de filmes baseado em banco de dados, páginas dinâmicas de filmes, implementação de UI, camada de animação e interação, layout responsivo, arquitetura de conteúdo e decisões técnicas sobre renderização de dados e manutenibilidade.",
      },
      {
        heading: "Design & UX",
        content:
          "A direção visual foi construída em torno da ideia de tornar os próprios filmes o centro das atenções. A interface usa uma estrutura predominantemente monocromática para que as cores da fotografia de cada filme se destaquem. Em vez de competir visualmente com os filmes, o site dá espaço para que eles se tornem o elemento visual mais forte.\n\nO layout explora linhas de grade fortes e composição horizontal. Essa ênfase horizontal foi intencional: faz referência ao quadro cinematográfico e cria um contraponto visual à dominância atual dos formatos de mídia verticais. Como a Moveo Filmes trabalha com cinema, o site precisava se sentir mais próximo da linguagem do filme do que de um feed de conteúdo genérico.\n\nA tipografia também foi uma parte importante do conceito visual. O uso de Helvetica Neue conecta a identidade da interface a Brasília, onde a produtora está sediada. A fonte se relaciona com a linguagem visual encontrada na sinalização e no ambiente gráfico da cidade, trazendo uma referência local sutil, mas significativa, para o projeto.",
      },
      {
        heading: "Decisões Técnicas",
        content:
          "A plataforma foi projetada em torno de uma arquitetura orientada a dados. O conteúdo dos filmes não está embutido no código da interface. Em vez disso, o dashboard admin escreve os dados dos filmes no banco de dados, e o site público renderiza esses dados dinamicamente. Essa abordagem torna o site mais fácil de manter e dá ao cliente autonomia sobre o conteúdo.\n\nOs requisitos incluíam: conteúdo de banco de dados estruturado para filmes, formulários no lado admin para criar e editar conteúdo, renderização dinâmica de páginas de filmes, componentes reutilizáveis para cards de filmes, páginas e seções de conteúdo, uma estrutura de conteúdo bilíngue e comportamento de animação e scroll alinhado com a identidade visual.",
      },
      {
        heading: "O Que Aprendi",
        content:
          "Aprimorei o processo de design de plataformas editáveis por clientes com conteúdo dinâmico. Aprofundei a relação entre identidade visual, contexto local e implementação técnica. Desenvolvi uma abordagem mais flexível para páginas de projetos orientadas a CMS e conteúdo estruturado.",
      },
    ],
    outcomes: [
      "Bilingual full-stack platform built for an independent film production company in Brasília.",
      "Admin dashboard for adding, editing, reordering, and managing films dynamically.",
      "Database-driven film catalog with automatically generated pages for each new film.",
      "Cinematic interface based on horizontal grids, monochromatic structure, and film-first visual hierarchy.",
      "Visual identity connected to Brasília through typography and layout decisions.",
    ],
    outcomesPt: [
      "Plataforma full-stack bilíngue construída para uma produtora de cinema independente em Brasília.",
      "Dashboard admin para adicionar, editar, reordenar e gerenciar filmes dinamicamente.",
      "Catálogo de filmes baseado em banco de dados com páginas geradas automaticamente para cada novo filme.",
      "Interface cinematográfica baseada em grids horizontais, estrutura monocromática e hierarquia visual centrada nos filmes.",
      "Identidade visual conectada a Brasília por meio de decisões tipográficas e de layout.",
    ],
  },
  {
    slug: "mzprime-3d-showcase",
    title: "Vitrine 3D – Car Cover Showroom",
    titlePt: "Vitrine 3D – Showroom de Capas",
    tagline:
      "Interactive 3D showroom for a luxury custom vehicle cover brand with real-time color, stitching, and logo customization.",
    taglinePt:
      "Showroom 3D interativo para uma marca de capas de veículos de luxo com personalização em tempo real de cor, costura e logo.",
    projectType: "Creative · Interactive 3D Showroom",
    projectTypePt: "Criativo · Showroom 3D Interativo",
    client: "Evolut Digital",
    year: "2025",
    techStack: [
      "Next.js 16",
      "React 19",
      "Three.js",
      "React Three Fiber",
      "Tailwind CSS",
    ],
    heroImage: "/projects/Vitrine_3D/vitrine3d-hero.png",
    galleryImages: [
      "/projects/Vitrine_3D/vitrine3d-suv.png",
      "/projects/Vitrine_3D/vitrine3d-vintage.png",
      "/projects/Vitrine_3D/vitrine3d-moto.png",
    ],
    demoVideo: "https://widxfmqb2xaemqo0.public.blob.vercel-storage.com/projects/vitrine/vitrine.mp4",
    sections: [
      {
        heading: "Overview",
        content:
          "MzPrime required an interactive virtual showroom for custom luxury vehicle covers. The goal was to let users visualize different vehicle cover configurations directly in the browser, without reloading pre-rendered models for every variation.\n\nThe showroom needed to support multiple vehicle categories, including motorcycles, bikes, quadricycles, SUVs, pickup trucks, sports cars, sedans, hatchbacks, and vintage vehicles. Users needed to be able to switch between models, change the color of the cover, change the stitching color, and upload custom PNG logos to be applied onto predefined areas of the 3D cover.\n\nThe main technical challenge was creating a real-time customization experience that remained lightweight and responsive in the browser. Instead of loading a separate model or image for every possible variation, the solution used Three.js to modify the 3D model properties directly.",
      },
      {
        heading: "Problem",
        content:
          "The client wanted to create a premium virtual showcase for a product that is inherently customizable. A normal e-commerce product page would not be enough, because the customer needed to see how different customization options would look before purchasing.\n\nThe initial reference workflow involved loading different completed models for each variation. For example, if the user selected a blue cover, the system would load a new version of the model. This approach created loading screens, interrupted the user experience, and was not suitable for a product where customers are expected to test many combinations quickly.\n\nThe desired behavior was immediate: the user clicks, and the model updates instantly. This required a different approach — instead of swapping full assets, the system needed to update the material, shader, texture, and logo placement properties of the 3D model in real time.",
      },
      {
        heading: "Goal",
        content:
          "Build a browser-based 3D showroom where users could select different vehicle categories, change the vehicle cover color in real time, change the stitching color in real time, upload PNG logos and apply them to predefined spots on the cover, and preview the customization directly on the 3D model — all without constant reloads or loading screens, delivered in a premium and lightweight interface.",
      },
      {
        heading: "My Role",
        content:
          "Frontend and 3D developer (client work at Evolut Digital), responsible for Three.js implementation, 3D model integration, real-time material and shader updates, texture and logo upload handling, logo placement on predefined areas, browser performance optimization, collaboration with a 3D modeler, visual tuning of the cover material, and optimization of assets and rendering behavior.",
      },
      {
        heading: "Design & UX",
        content:
          "The main UX requirement was immediacy. The user needed to feel that customization was happening directly in front of them, not through a slow loading cycle. The experience was designed around direct manipulation: select a vehicle, change the cover color, change the stitching color, upload a logo, pick where the logo should appear, and see the result immediately.\n\nThe interface had to support complex customization while remaining simple enough for a customer to understand quickly. The real-time behavior also made the experience feel more premium. For a luxury custom product, the configurator needed to feel polished and responsive rather than technical or heavy.",
      },
      {
        heading: "Technical Challenge",
        content:
          "The biggest technical challenge was making a complex customization system run smoothly in the browser. A simpler approach would have been to load a different finished model for each customization state. However, that would create a slow and fragmented experience, especially because the product has many possible combinations of cover colors, stitching colors, vehicle types, and logo placements.\n\nThe solution required real-time manipulation of the 3D model. Using Three.js, the interface updates materials, shader values, textures, and logo placements directly on the loaded model. This makes the experience feel immediate and interactive while keeping the browser workload under control.\n\nAnother important challenge was visual accuracy. The digital cover material needed to feel close to the real luxury vehicle covers sold by the client. To achieve this, the 3D implementation was developed in collaboration with a modeler, iterating on the texture and material until the result matched the intended product feel.",
      },
      {
        heading: "Technical Decisions",
        content:
          "The project moved away from a pre-rendered asset-swapping approach and instead used a real-time 3D customization architecture. Key decisions included: using Three.js to control the 3D scene directly, avoiding loading separate full models for every customization state, updating material, shader, and texture parameters in real time, mapping uploaded PNG logos to predefined placement spots on the model, optimizing file usage to keep the browser experience lightweight and responsive, and collaborating with a 3D modeler to create a cover material that matched the real product.",
      },
      {
        heading: "What I Learned",
        content:
          "Deepened experience with browser-based 3D optimization. Improved handling of real-time material and texture updates in Three.js. Learned how to balance visual fidelity, customization complexity, and browser performance. Improved collaboration workflow between frontend and 3D implementation and 3D modeling.",
      },
    ],
    sectionsPt: [
      {
        heading: "Visão Geral",
        content:
          "O MzPrime precisava de um showroom virtual interativo para capas de veículos de luxo personalizadas. O objetivo era permitir que os usuários visualizassem diferentes configurações de capas diretamente no navegador, sem recarregar modelos pré-renderizados para cada variação.\n\nO showroom precisava suportar múltiplas categorias de veículos, incluindo motocicletas, bikes, quadriciclos, SUVs, caminhonetes, esportivos, sedans, hatchbacks e veículos vintage. Os usuários precisavam poder alternar entre modelos, alterar a cor da capa, mudar a cor da costura e fazer upload de logos PNG personalizados para serem aplicados em áreas predefinidas da capa 3D.\n\nO principal desafio técnico era criar uma experiência de personalização em tempo real que permanecesse leve e responsiva no navegador. Em vez de carregar um modelo ou imagem separado para cada variação possível, a solução usou Three.js para modificar as propriedades do modelo 3D diretamente.",
      },
      {
        heading: "Problema",
        content:
          "O cliente queria criar uma vitrine virtual premium para um produto que é inerentemente personalizável. Uma página de produto de e-commerce normal não seria suficiente, pois o cliente precisava ver como as diferentes opções de personalização ficariam antes de comprar.\n\nO fluxo de referência inicial envolvia carregar modelos completos diferentes para cada variação. Por exemplo, se o usuário selecionasse uma capa azul, o sistema carregaria uma nova versão do modelo. Essa abordagem criava telas de carregamento, interrompia a experiência do usuário e não era adequada para um produto onde os clientes esperam testar muitas combinações rapidamente.\n\nO comportamento desejado era imediato: o usuário clica e o modelo atualiza instantaneamente. Isso exigiu uma abordagem diferente — em vez de trocar assets completos, o sistema precisava atualizar as propriedades de material, shader, textura e posicionamento de logo do modelo 3D em tempo real.",
      },
      {
        heading: "Objetivo",
        content:
          "Construir um showroom 3D no navegador onde os usuários pudessem selecionar diferentes categorias de veículos, alterar a cor da capa em tempo real, mudar a cor da costura em tempo real, fazer upload de logos PNG e aplicá-los em pontos predefinidos da capa, e visualizar a personalização diretamente no modelo 3D — tudo sem recarregamentos constantes ou telas de carregamento, entregue em uma interface premium e leve.",
      },
      {
        heading: "Meu Papel",
        content:
          "Desenvolvedor frontend e 3D (trabalho para cliente na Evolut Digital), responsável pela implementação Three.js, integração de modelos 3D, atualizações em tempo real de materiais e shaders, tratamento de upload de texturas e logos, posicionamento de logos em áreas predefinidas, otimização de performance no navegador, colaboração com um modelador 3D, ajuste visual do material da capa e otimização de assets e comportamento de renderização.",
      },
      {
        heading: "Design & UX",
        content:
          "O principal requisito de UX era a imediatismo. O usuário precisava sentir que a personalização estava acontecendo diretamente à sua frente, não por meio de um ciclo de carregamento lento. A experiência foi projetada em torno da manipulação direta: selecionar um veículo, mudar a cor da capa, mudar a cor da costura, fazer upload de um logo, escolher onde o logo deve aparecer e ver o resultado imediatamente.\n\nA interface precisava suportar personalização complexa enquanto permanecia simples o suficiente para um cliente entender rapidamente. O comportamento em tempo real também tornava a experiência mais premium. Para um produto de luxo personalizado, o configurador precisava parecer refinado e responsivo, e não técnico ou pesado.",
      },
      {
        heading: "Desafio Técnico",
        content:
          "O maior desafio técnico foi fazer um sistema de personalização complexo funcionar de forma fluida no navegador. Uma abordagem mais simples teria sido carregar um modelo finalizado diferente para cada estado de personalização. No entanto, isso criaria uma experiência lenta e fragmentada, especialmente porque o produto tem muitas combinações possíveis de cores de capa, cores de costura, tipos de veículo e posicionamentos de logo.\n\nA solução exigiu manipulação em tempo real do modelo 3D. Usando Three.js, a interface atualiza materiais, valores de shader, texturas e posicionamentos de logo diretamente no modelo carregado. Isso faz a experiência parecer imediata e interativa enquanto mantém a carga do navegador sob controle.\n\nOutro desafio importante foi a precisão visual. O material digital da capa precisava parecer próximo às capas de veículos de luxo reais vendidas pelo cliente. Para isso, a implementação 3D foi desenvolvida em colaboração com um modelador, iterando na textura e no material até que o resultado correspondesse à sensação do produto pretendido.",
      },
      {
        heading: "Decisões Técnicas",
        content:
          "O projeto se afastou de uma abordagem de troca de assets pré-renderizados e, em vez disso, usou uma arquitetura de personalização 3D em tempo real. As principais decisões incluíram: usar Three.js para controlar a cena 3D diretamente, evitar carregar modelos completos separados para cada estado de personalização, atualizar parâmetros de material, shader e textura em tempo real, mapear logos PNG enviados para pontos predefinidos no modelo, otimizar o uso de arquivos para manter a experiência do navegador leve e responsiva, e colaborar com um modelador 3D para criar um material de capa que correspondesse ao produto real.",
      },
      {
        heading: "O Que Aprendi",
        content:
          "Aprofundei a experiência com otimização 3D no navegador. Melhorei o tratamento de atualizações em tempo real de materiais e texturas no Three.js. Aprendi a equilibrar fidelidade visual, complexidade de personalização e performance no navegador. Melhorei o fluxo de colaboração entre implementação frontend e 3D e modelagem 3D.",
      },
    ],
    outcomes: [
      "Real-time 3D showroom for customizable luxury vehicle covers.",
      "Instant cover color, stitching color, vehicle category, and logo placement customization.",
      "PNG logo upload system mapped to predefined placement areas on the 3D model.",
      "Three.js-based material, shader, and texture updates without reloading full models.",
      "Browser performance optimization for a lightweight interactive 3D experience.",
    ],
    outcomesPt: [
      "Showroom 3D em tempo real para capas de veículos de luxo personalizáveis.",
      "Personalização instantânea de cor da capa, cor da costura, categoria do veículo e posicionamento de logo.",
      "Sistema de upload de logo PNG mapeado para áreas predefinidas no modelo 3D.",
      "Atualizações de material, shader e textura via Three.js sem recarregar modelos completos.",
      "Otimização de performance no navegador para uma experiência 3D interativa e leve.",
    ],
    liveUrl: "https://claytonbrgsdev.github.io/mz-prime/",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
