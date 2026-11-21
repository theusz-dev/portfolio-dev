/**
 * Projects shown in the "Projetos" section.
 *
 * How to edit:
 * - Order: the order of this array is the order on the page. The first
 *   `FEATURED_COUNT` projects are always visible; the rest appear under
 *   "Ver mais projetos".
 * - Add: copy an entry, give it a unique `id` (its page is `/projetos/<id>`),
 *   and put its media in `public/projects/<id>/`.
 * - Remove: delete the entry, or set `hidden: true` to keep it here but off
 *   the page.
 * - Media: `cover` is the card image or video (an array of portrait screens
 *   shows them side by side, good for mobile apps). `gallery` feeds the
 *   carousel on the project's page; images and videos can be mixed, in any
 *   number (Orbit and Orbitarium show how).
 * - Links: leave `site` or `github` out when they don't exist or the
 *   repository is private; the card only shows what's there.
 */

export type ProjectMedia =
  | { type: "image"; src: string; alt: string; width: number; height: number }
  | { type: "video"; src: string; poster?: string; alt: string; width: number; height: number };

export type Project = {
  id: string;
  title: string;
  year: string;
  status: string;
  /** One or two sentences for the card. */
  summary: string;
  problem: string;
  solution: string;
  role: string;
  result: string;
  highlights: string[];
  stack: string[];
  links: { site?: string; github?: string };
  cover: ProjectMedia | ProjectMedia[];
  gallery: ProjectMedia[];
  hidden?: boolean;
};

export const FEATURED_COUNT = 6;

const memoraScreen = (name: string, alt: string): ProjectMedia => ({
  type: "image",
  src: `/projects/memora/${name}.png`,
  alt,
  width: 390,
  height: 844,
});

const orbitPreview: ProjectMedia = {
  type: "image",
  src: "/projects/orbit/preview.png",
  alt: "Tela inicial do Orbit com relógio, busca, filtros por categoria e atalhos",
  width: 1920,
  height: 1080,
};

const shot = (src: string, alt: string, width: number, height: number): ProjectMedia => ({
  type: "image",
  src,
  alt,
  width,
  height,
});

const orbitGallery = [
  shot("/projects/orbit/home.jpg", "Orbit: relógio, busca unificada, categorias e atalhos", 1568, 769),
  shot("/projects/orbit/themes.jpg", "Orbit: configurações com 11 temas e 12 estilos de cards", 1568, 769),
  shot("/projects/orbit/onboarding.png", "Orbit: boas-vindas com as dicas de uso, atalhos e paleta de comandos", 1440, 900),
  shot("/projects/orbit/mobile.png", "Orbit no celular", 390, 844),
];

const orbitariumGallery = [
  shot("/projects/orbitarium/home.png", "Orbitarium: página inicial com as trilhas de estudo", 1440, 1000),
  shot("/projects/orbitarium/lesson.jpg", "Orbitarium: abertura de uma aula, com objetivos e pré-requisitos", 1512, 787),
  shot("/projects/orbitarium/diagram.jpg", "Orbitarium: diagrama animado dentro de uma seção da aula", 1512, 787),
  shot("/projects/orbitarium/category.jpg", "Orbitarium: categoria de Inteligência Artificial com a trilha recomendada", 1568, 769),
];

const orbitariumHome: ProjectMedia = {
  type: "image",
  src: "/projects/orbitarium/home.png",
  alt: "Página inicial do Orbitarium com a lista de aulas interativas",
  width: 1440,
  height: 1000,
};

const portfolioHome: ProjectMedia = {
  type: "image",
  src: "/projects/portfolio-blog/home.png",
  alt: "Página inicial do portfólio anterior com apresentação e projetos",
  width: 1440,
  height: 1000,
};

const placeholder = (folder: string, alt: string): ProjectMedia => ({
  type: "image",
  src: `/projects/${folder}/cover.svg`,
  alt,
  width: 1200,
  height: 675,
});

const memoraScreens = [
  memoraScreen("onboarding", "Memora: tela de boas-vindas"),
  memoraScreen("study", "Memora: sessão de estudo com repetição espaçada"),
  memoraScreen("generate", "Memora: geração de cards a partir de texto ou PDF"),
  memoraScreen("chat", "Memora: chat com o tutor de IA do deck"),
  memoraScreen("decks", "Memora: lista de decks"),
];

export const projects: Project[] = [
  {
    id: "orbit",
    title: "Orbit",
    year: "2026",
    status: "Publicado",
    summary: "Startpage open source, local-first e instalável para organizar a rotina no navegador.",
    problem: "Páginas iniciais genéricas não acompanham os diferentes contextos de trabalho, estudo e uso pessoal.",
    solution:
      "Uma PWA sem contas nem backend, com espaços de trabalho, busca, clima, notas, Pomodoro, temas e preferências locais.",
    role: "Produto, design e desenvolvimento full stack da experiência client-side.",
    result: "Publicado com demo ao vivo, código aberto e contribuições externas.",
    highlights: [
      "PWA offline e sem rastreamento de dados pessoais",
      "Sete temas e sete layouts configuráveis",
      "Drag-and-drop, importação e exportação de preferências",
    ],
    stack: ["React", "Vite", "Tailwind CSS", "Zustand", "dnd-kit", "PWA"],
    links: { site: "https://orbit-portal.netlify.app/", github: "https://github.com/matheusz-nied/orbit" },
    cover: orbitPreview,
    gallery: orbitGallery,
  },
  {
    id: "memora",
    title: "Memora",
    year: "2026",
    status: "MVP publicado",
    summary: "Flashcards offline-first com repetição espaçada e um tutor de IA configurável por deck.",
    problem:
      "Estudar a partir de textos e PDFs exige transformar conteúdo em revisões curtas sem perder privacidade nem acesso offline.",
    solution:
      "App Flutter multiplataforma que gera cards, oferece estudo offline, TTS, insights e chat com um tutor especializado por deck.",
    role: "Concepção do produto, arquitetura local-first, design system e desenvolvimento mobile.",
    result: "APK distribuído pelo GitHub Releases, site público e código aberto com testes de arquitetura.",
    highlights: [
      "Banco local como fonte da verdade, sem conta nem servidor",
      "Geração de cards a partir de texto e PDF",
      "Backup em JSON e IA usando a chave do próprio usuário",
    ],
    stack: ["Flutter", "Dart", "Riverpod", "Drift", "DeepSeek", "TTS"],
    links: { site: "https://matheusz-nied.github.io/Memora/", github: "https://github.com/matheusz-nied/Memora" },
    cover: [memoraScreens[1], memoraScreens[0], memoraScreens[3]],
    gallery: memoraScreens,
  },
  {
    id: "orbitarium",
    title: "Orbitarium",
    year: "2026",
    status: "Publicado",
    summary: "Plataforma educacional que transforma temas complexos em aulas visuais e interativas.",
    problem:
      "Conteúdo estático é limitado para ensinar fenômenos, modelos e relações que dependem de movimento e exploração.",
    solution:
      "Aulas guiadas com simuladores, diagramas animados, quizzes e progressão semântica, separando o conteúdo tipado da camada visual.",
    role: "Arquitetura front-end, sistema de conteúdo, experiência visual e implementação.",
    result: "Demo pública com arquitetura extensível para adicionar disciplinas sem alterar o layout.",
    highlights: [
      "Schema pedagógico fortemente tipado",
      "Componentes interativos injetados por identificador",
      "Validação automática das aulas antes do build",
    ],
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Motion", "React Router"],
    links: { site: "https://orbitarium-edu.netlify.app/", github: "https://github.com/matheusz-nied/Orbitarium" },
    cover: orbitariumHome,
    gallery: orbitariumGallery,
  },
  {
    id: "portfolio",
    title: "Portfólio + blogs",
    year: "2026",
    status: "Publicado",
    summary: "Plataforma bilíngue para projetos, currículo e escrita técnica e reflexiva.",
    problem:
      "Portfólio, currículo e blogs separados aumentavam a manutenção e fragmentavam a presença profissional.",
    solution: "Uma aplicação Next.js com conteúdo estruturado, internacionalização, blogs em MDX e SEO por rota.",
    role: "Arquitetura, identidade visual, desenvolvimento e estratégia de conteúdo.",
    result: "Uma base única para a apresentação profissional e a produção de conteúdo.",
    highlights: [
      "Conteúdo em português e inglês",
      "Portfólio e dois blogs na mesma base",
      "Metadados, sitemap e dados estruturados",
    ],
    stack: ["Next.js", "TypeScript", "next-intl", "Tailwind CSS", "Velite", "MDX"],
    links: {
      site: "https://portfolio-dev-lake-pi.vercel.app/",
      github: "https://github.com/matheusz-nied/portfolio-dev",
    },
    cover: portfolioHome,
    gallery: [portfolioHome],
  },
  {
    id: "lumen",
    title: "Lumen",
    year: "2026",
    status: "MVP privado",
    summary: "SaaS multi-tenant que reúne Kanban, financeiro, metas e divisão de lucros por projeto.",
    problem:
      "Pequenos times digitais espalham tarefas, custos e acordos de lucro por ferramentas sem contexto compartilhado.",
    solution:
      "Workspace multiusuário com projetos, Kanban, receitas, despesas, metas, permissões e distribuição mensal de lucro.",
    role: "Produto, arquitetura full stack, regras financeiras e implementação do MVP.",
    result: "MVP funcional com autenticação, colaboração e gestão financeira implementadas.",
    highlights: [
      "Server Actions e módulos separados por domínio",
      "Permissões centralizadas por projeto",
      "Regras financeiras puras com testes automatizados",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Auth.js", "Zod"],
    links: {},
    cover: placeholder("em-construcao", "Ilustração do Lumen, ainda sem capturas públicas"),
    gallery: [placeholder("em-construcao", "Ilustração do Lumen, ainda sem capturas públicas")],
  },
  {
    id: "construcao-civil",
    title: "App para construção civil",
    year: "2024 — 2025",
    status: "Projeto de cliente",
    summary: "Aplicativo Flutter completo, integrado à operação de uma startup de construção civil.",
    problem: "A startup precisava transformar uma API extensa em uma experiência mobile completa e consistente.",
    solution: "Mais de 30 telas conectadas a mais de 60 rotas da API do cliente.",
    role: "Implementação das telas, integração de dados e entregas incrementais em trabalho remoto.",
    result: "Aplicativo entregue; a parceria contribuiu para minha contratação efetiva pela Umobi.",
    highlights: ["Mais de 30 telas em Flutter", "Mais de 60 endpoints integrados", "Entregas incrementais e remotas"],
    stack: ["Flutter", "Dart", "REST APIs"],
    links: {},
    cover: placeholder("construcao-civil", "Ilustração do aplicativo para construção civil"),
    gallery: [placeholder("construcao-civil", "Ilustração do aplicativo para construção civil")],
  },
  {
    id: "revela-facil",
    title: "Revela Fácil — Fujioka",
    year: "2024 — 2025",
    status: "Projeto de cliente",
    summary: "Novas funcionalidades Flutter para o aplicativo da Fujioka em produção.",
    problem: "O aplicativo precisava evoluir sem romper a experiência aprovada nem os serviços existentes.",
    solution: "Implementação fiel ao Figma e integração das jornadas com as APIs de autenticação e produtos.",
    role: "Desenvolvimento mobile em Flutter e integração com APIs REST.",
    result: "Funcionalidades entregues e incorporadas ao ciclo de evolução do produto.",
    highlights: ["Funcionalidades novas num app em produção", "Autenticação integrada", "Catálogo consumido por API"],
    stack: ["Flutter", "Dart", "REST APIs", "Figma"],
    links: {},
    cover: placeholder("revela-facil", "Ilustração do aplicativo Revela Fácil"),
    gallery: [placeholder("revela-facil", "Ilustração do aplicativo Revela Fácil")],
  },
  {
    id: "cett-ufg",
    title: "Sistemas internos — CETT/UFG",
    year: "2024 — 2025",
    status: "Experiência profissional",
    summary: "Evolução de sistemas web e automação de processos internos da Fundação RTVE — CETT/UFG.",
    problem: "Áreas internas dependiam de sistemas legados e de trabalho manual em processos recorrentes.",
    solution:
      "Manutenção de sistemas Django, otimização de consultas PostgreSQL, APIs REST e aplicativos Flutter de automação.",
    role: "Desenvolvimento web e mobile, documentação e levantamento de requisitos com as áreas usuárias.",
    result: "Sistemas modernizados e menos trabalho manual para as equipes.",
    highlights: ["Funcionalidades e correções em Django", "Consultas PostgreSQL otimizadas", "Automação interna com Flutter"],
    stack: ["Python", "Django", "PostgreSQL", "Flutter", "REST APIs"],
    links: {},
    cover: placeholder("cett-ufg", "Ilustração dos sistemas internos do CETT/UFG"),
    gallery: [placeholder("cett-ufg", "Ilustração dos sistemas internos do CETT/UFG")],
  },
];

export const visibleProjects = projects.filter((project) => !project.hidden);
