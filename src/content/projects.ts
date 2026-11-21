/**
 * Projects shown in the "Projetos" section.
 *
 * How to edit:
 * - Order: the order of this array is the order on the page. The first
 *   `FEATURED_COUNT` projects are always visible; the rest appear under
 *   "Ver mais projetos".
 * - Add: copy an entry, give it a unique `id` (its page is
 *   `/<lang>/projects/<id>`), and put its media in `public/projects/<id>/`.
 * - Remove: delete the entry, or set `hidden: true` to keep it here but off
 *   the page.
 * - Languages: every text is written as `{ pt: "…", en: "…" }`, including the
 *   media descriptions (`alt`). `getProjects(lang)` returns one language.
 * - Media: `cover` is the card image or video (an array of portrait screens
 *   shows them side by side, good for mobile apps). `gallery` feeds the
 *   carousel on the project's page; images and videos can be mixed, in any
 *   number (Orbit and Orbitarium show how).
 * - Links: leave `site` or `github` out when they don't exist or the
 *   repository is private; the card only shows what's there.
 */

import type { Locale, Localized } from "@/i18n/config";

type Media<Text> =
  | { type: "image"; src: string; alt: Text; width: number; height: number }
  | { type: "video"; src: string; poster?: string; alt: Text; width: number; height: number };

type ProjectData<Text, List> = {
  id: string;
  title: Text;
  year: string;
  status: Text;
  /** One or two sentences for the card. */
  summary: Text;
  problem: Text;
  solution: Text;
  role: Text;
  result: Text;
  highlights: List;
  stack: string[];
  links: { site?: string; github?: string };
  cover: Media<Text> | Media<Text>[];
  gallery: Media<Text>[];
  hidden?: boolean;
};

/** A project as written here, with every text in both languages. */
type ProjectEntry = ProjectData<Localized, Localized<string[]>>;

/** A project in one language, as the components receive it. */
export type Project = ProjectData<string, string[]>;
export type ProjectMedia = Media<string>;

export const FEATURED_COUNT = 6;

const shot = (src: string, alt: Localized, width: number, height: number): Media<Localized> => ({
  type: "image",
  src,
  alt,
  width,
  height,
});

const memoraScreen = (name: string, alt: Localized) => shot(`/projects/memora/${name}.png`, alt, 390, 844);

const placeholder = (folder: string, alt: Localized) => shot(`/projects/${folder}/cover.svg`, alt, 1200, 675);

const orbitPreview = shot(
  "/projects/orbit/preview.png",
  {
    pt: "Tela inicial do Orbit com relógio, busca, filtros por categoria e atalhos",
    en: "Orbit's home screen with clock, search, category filters and shortcuts",
  },
  1920,
  1080,
);

const orbitGallery = [
  shot(
    "/projects/orbit/home.jpg",
    { pt: "Orbit: relógio, busca unificada, categorias e atalhos", en: "Orbit: clock, unified search, categories and shortcuts" },
    1568,
    769,
  ),
  shot(
    "/projects/orbit/themes.jpg",
    { pt: "Orbit: configurações com 11 temas e 12 estilos de cards", en: "Orbit: settings with 11 themes and 12 card styles" },
    1568,
    769,
  ),
  shot(
    "/projects/orbit/onboarding.png",
    {
      pt: "Orbit: boas-vindas com as dicas de uso, atalhos e paleta de comandos",
      en: "Orbit: welcome screen with usage tips, shortcuts and the command palette",
    },
    1440,
    900,
  ),
  shot("/projects/orbit/mobile.png", { pt: "Orbit no celular", en: "Orbit on a phone" }, 390, 844),
];

const orbitariumHome = shot(
  "/projects/orbitarium/home.png",
  {
    pt: "Página inicial do Orbitarium com a lista de aulas interativas",
    en: "Orbitarium's home page with the list of interactive lessons",
  },
  1440,
  1000,
);

const orbitariumGallery = [
  shot(
    "/projects/orbitarium/home.png",
    { pt: "Orbitarium: página inicial com as trilhas de estudo", en: "Orbitarium: home page with the study paths" },
    1440,
    1000,
  ),
  shot(
    "/projects/orbitarium/lesson.jpg",
    {
      pt: "Orbitarium: abertura de uma aula, com objetivos e pré-requisitos",
      en: "Orbitarium: the opening of a lesson, with goals and prerequisites",
    },
    1512,
    787,
  ),
  shot(
    "/projects/orbitarium/diagram.jpg",
    {
      pt: "Orbitarium: diagrama animado dentro de uma seção da aula",
      en: "Orbitarium: an animated diagram inside a lesson section",
    },
    1512,
    787,
  ),
  shot(
    "/projects/orbitarium/category.jpg",
    {
      pt: "Orbitarium: categoria de Inteligência Artificial com a trilha recomendada",
      en: "Orbitarium: the Artificial Intelligence category with its recommended path",
    },
    1568,
    769,
  ),
];

const portfolioHome = shot(
  "/projects/portfolio-blog/home.png",
  {
    pt: "Página inicial do portfólio anterior com apresentação e projetos",
    en: "Home page of the previous portfolio, with introduction and projects",
  },
  1440,
  1000,
);

const memoraScreens = [
  memoraScreen("onboarding", { pt: "Memora: tela de boas-vindas", en: "Memora: welcome screen" }),
  memoraScreen("study", {
    pt: "Memora: sessão de estudo com repetição espaçada",
    en: "Memora: a study session with spaced repetition",
  }),
  memoraScreen("generate", {
    pt: "Memora: geração de cards a partir de texto ou PDF",
    en: "Memora: generating cards from text or a PDF",
  }),
  memoraScreen("chat", { pt: "Memora: chat com o tutor de IA do deck", en: "Memora: chat with the deck's AI tutor" }),
  memoraScreen("decks", { pt: "Memora: lista de decks", en: "Memora: list of decks" }),
];

const lumenCover = placeholder("em-construcao", {
  pt: "Ilustração do Lumen, ainda sem capturas públicas",
  en: "Illustration of Lumen, which has no public screenshots yet",
});
const constructionCover = placeholder("construcao-civil", {
  pt: "Ilustração do aplicativo para construção civil",
  en: "Illustration of the construction app",
});
const revelaCover = placeholder("revela-facil", {
  pt: "Ilustração do aplicativo Revela Fácil",
  en: "Illustration of the Revela Fácil app",
});
const cettCover = placeholder("cett-ufg", {
  pt: "Ilustração dos sistemas internos do CETT/UFG",
  en: "Illustration of CETT/UFG's internal systems",
});

const published: Localized = { pt: "Publicado", en: "Published" };
const clientProject: Localized = { pt: "Projeto de cliente", en: "Client project" };

const projects: ProjectEntry[] = [
  {
    id: "orbit",
    title: { pt: "Orbit", en: "Orbit" },
    year: "2026",
    status: published,
    summary: {
      pt: "Startpage open source, local-first e instalável para organizar a rotina no navegador.",
      en: "An open-source, local-first, installable start page for organising your day in the browser.",
    },
    problem: {
      pt: "Páginas iniciais genéricas não acompanham os diferentes contextos de trabalho, estudo e uso pessoal.",
      en: "Generic start pages don't adapt to the different contexts of work, study and personal use.",
    },
    solution: {
      pt: "Uma PWA sem contas nem backend, com espaços de trabalho, busca, clima, notas, Pomodoro, temas e preferências locais.",
      en: "A PWA with no accounts and no backend: workspaces, search, weather, notes, Pomodoro, themes and local preferences.",
    },
    role: {
      pt: "Produto, design e desenvolvimento full stack da experiência client-side.",
      en: "Product, design and full-stack development of the client-side experience.",
    },
    result: {
      pt: "Publicado com demo ao vivo, código aberto e contribuições externas.",
      en: "Released with a live demo, open source code and outside contributions.",
    },
    highlights: {
      pt: [
        "PWA offline e sem rastreamento de dados pessoais",
        "Sete temas e sete layouts configuráveis",
        "Drag-and-drop, importação e exportação de preferências",
      ],
      en: [
        "Offline PWA with no tracking of personal data",
        "Seven themes and seven configurable layouts",
        "Drag and drop, plus importing and exporting preferences",
      ],
    },
    stack: ["React", "Vite", "Tailwind CSS", "Zustand", "dnd-kit", "PWA"],
    links: { site: "https://orbit-portal.netlify.app/", github: "https://github.com/matheusz-nied/orbit" },
    cover: orbitPreview,
    gallery: orbitGallery,
  },
  {
    id: "memora",
    title: { pt: "Memora", en: "Memora" },
    year: "2026",
    status: { pt: "MVP publicado", en: "MVP released" },
    summary: {
      pt: "Flashcards offline-first com repetição espaçada e um tutor de IA configurável por deck.",
      en: "Offline-first flashcards with spaced repetition and an AI tutor configured per deck.",
    },
    problem: {
      pt: "Estudar a partir de textos e PDFs exige transformar conteúdo em revisões curtas sem perder privacidade nem acesso offline.",
      en: "Studying from texts and PDFs means turning them into short reviews without giving up privacy or offline access.",
    },
    solution: {
      pt: "App Flutter multiplataforma que gera cards, oferece estudo offline, TTS, insights e chat com um tutor especializado por deck.",
      en: "A cross-platform Flutter app that generates cards and offers offline study, text-to-speech, insights and chat with a tutor specialised in each deck.",
    },
    role: {
      pt: "Concepção do produto, arquitetura local-first, design system e desenvolvimento mobile.",
      en: "Product concept, local-first architecture, design system and mobile development.",
    },
    result: {
      pt: "APK distribuído pelo GitHub Releases, site público e código aberto com testes de arquitetura.",
      en: "APK distributed through GitHub Releases, a public website and open source code with architecture tests.",
    },
    highlights: {
      pt: [
        "Banco local como fonte da verdade, sem conta nem servidor",
        "Geração de cards a partir de texto e PDF",
        "Backup em JSON e IA usando a chave do próprio usuário",
      ],
      en: [
        "The local database is the source of truth, with no account or server",
        "Cards generated from text and PDFs",
        "JSON backups, and AI that runs on the user's own API key",
      ],
    },
    stack: ["Flutter", "Dart", "Riverpod", "Drift", "DeepSeek", "TTS"],
    links: { site: "https://matheusz-nied.github.io/Memora/", github: "https://github.com/matheusz-nied/Memora" },
    cover: [memoraScreens[1], memoraScreens[0], memoraScreens[3]],
    gallery: memoraScreens,
  },
  {
    id: "orbitarium",
    title: { pt: "Orbitarium", en: "Orbitarium" },
    year: "2026",
    status: published,
    summary: {
      pt: "Plataforma educacional que transforma temas complexos em aulas visuais e interativas.",
      en: "An educational platform that turns complex topics into visual, interactive lessons.",
    },
    problem: {
      pt: "Conteúdo estático é limitado para ensinar fenômenos, modelos e relações que dependem de movimento e exploração.",
      en: "Static content falls short when teaching phenomena, models and relationships that depend on motion and exploration.",
    },
    solution: {
      pt: "Aulas guiadas com simuladores, diagramas animados, quizzes e progressão semântica, separando o conteúdo tipado da camada visual.",
      en: "Guided lessons with simulators, animated diagrams, quizzes and semantic progression, keeping typed content apart from the visual layer.",
    },
    role: {
      pt: "Arquitetura front-end, sistema de conteúdo, experiência visual e implementação.",
      en: "Front-end architecture, content system, visual experience and implementation.",
    },
    result: {
      pt: "Demo pública com arquitetura extensível para adicionar disciplinas sem alterar o layout.",
      en: "A public demo with an architecture that takes new subjects without changing the layout.",
    },
    highlights: {
      pt: [
        "Schema pedagógico fortemente tipado",
        "Componentes interativos injetados por identificador",
        "Validação automática das aulas antes do build",
      ],
      en: [
        "Strongly typed teaching schema",
        "Interactive components injected by identifier",
        "Lessons validated automatically before the build",
      ],
    },
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Motion", "React Router"],
    links: { site: "https://orbitarium-edu.netlify.app/", github: "https://github.com/matheusz-nied/Orbitarium" },
    cover: orbitariumHome,
    gallery: orbitariumGallery,
  },
  {
    id: "portfolio",
    title: { pt: "Portfólio + blogs", en: "Portfolio + blogs" },
    year: "2026",
    status: published,
    summary: {
      pt: "Plataforma bilíngue para projetos, currículo e escrita técnica e reflexiva.",
      en: "A bilingual platform for projects, my CV, and technical and reflective writing.",
    },
    problem: {
      pt: "Portfólio, currículo e blogs separados aumentavam a manutenção e fragmentavam a presença profissional.",
      en: "Keeping the portfolio, CV and blogs apart meant more upkeep and a scattered professional presence.",
    },
    solution: {
      pt: "Uma aplicação Next.js com conteúdo estruturado, internacionalização, blogs em MDX e SEO por rota.",
      en: "A Next.js application with structured content, internationalisation, MDX blogs and per-route SEO.",
    },
    role: {
      pt: "Arquitetura, identidade visual, desenvolvimento e estratégia de conteúdo.",
      en: "Architecture, visual identity, development and content strategy.",
    },
    result: {
      pt: "Uma base única para a apresentação profissional e a produção de conteúdo.",
      en: "One codebase for my professional presence and my writing.",
    },
    highlights: {
      pt: ["Conteúdo em português e inglês", "Portfólio e dois blogs na mesma base", "Metadados, sitemap e dados estruturados"],
      en: ["Content in Portuguese and English", "Portfolio and two blogs in one codebase", "Metadata, sitemap and structured data"],
    },
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
    title: { pt: "Lumen", en: "Lumen" },
    year: "2026",
    status: { pt: "MVP privado", en: "Private MVP" },
    summary: {
      pt: "SaaS multi-tenant que reúne Kanban, financeiro, metas e divisão de lucros por projeto.",
      en: "A multi-tenant SaaS that brings together Kanban, finances, goals and profit sharing per project.",
    },
    problem: {
      pt: "Pequenos times digitais espalham tarefas, custos e acordos de lucro por ferramentas sem contexto compartilhado.",
      en: "Small digital teams scatter tasks, costs and profit agreements across tools with no shared context.",
    },
    solution: {
      pt: "Workspace multiusuário com projetos, Kanban, receitas, despesas, metas, permissões e distribuição mensal de lucro.",
      en: "A multi-user workspace with projects, Kanban, income, expenses, goals, permissions and monthly profit distribution.",
    },
    role: {
      pt: "Produto, arquitetura full stack, regras financeiras e implementação do MVP.",
      en: "Product, full-stack architecture, financial rules and the MVP's implementation.",
    },
    result: {
      pt: "MVP funcional com autenticação, colaboração e gestão financeira implementadas.",
      en: "A working MVP with authentication, collaboration and financial management in place.",
    },
    highlights: {
      pt: [
        "Server Actions e módulos separados por domínio",
        "Permissões centralizadas por projeto",
        "Regras financeiras puras com testes automatizados",
      ],
      en: [
        "Server Actions and modules split by domain",
        "Permissions centralised per project",
        "Pure financial rules covered by automated tests",
      ],
    },
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Auth.js", "Zod"],
    links: {},
    cover: lumenCover,
    gallery: [lumenCover],
  },
  {
    id: "construcao-civil",
    title: { pt: "App para construção civil", en: "Construction app" },
    year: "2024 — 2025",
    status: clientProject,
    summary: {
      pt: "Aplicativo Flutter completo, integrado à operação de uma startup de construção civil.",
      en: "A complete Flutter app, built into the operations of a construction startup.",
    },
    problem: {
      pt: "A startup precisava transformar uma API extensa em uma experiência mobile completa e consistente.",
      en: "The startup needed to turn a large API into a complete, consistent mobile experience.",
    },
    solution: {
      pt: "Mais de 30 telas conectadas a mais de 60 rotas da API do cliente.",
      en: "More than 30 screens connected to over 60 of the client's API routes.",
    },
    role: {
      pt: "Implementação das telas, integração de dados e entregas incrementais em trabalho remoto.",
      en: "Building the screens, integrating the data and shipping incrementally while working remotely.",
    },
    result: {
      pt: "Aplicativo entregue; a parceria contribuiu para minha contratação efetiva pela Umobi.",
      en: "App delivered; the partnership helped lead to my full-time role at Umobi.",
    },
    highlights: {
      pt: ["Mais de 30 telas em Flutter", "Mais de 60 endpoints integrados", "Entregas incrementais e remotas"],
      en: ["More than 30 Flutter screens", "Over 60 endpoints integrated", "Incremental, remote delivery"],
    },
    stack: ["Flutter", "Dart", "REST APIs"],
    links: {},
    cover: constructionCover,
    gallery: [constructionCover],
  },
  {
    id: "revela-facil",
    title: { pt: "Revela Fácil — Fujioka", en: "Revela Fácil — Fujioka" },
    year: "2024 — 2025",
    status: clientProject,
    summary: {
      pt: "Novas funcionalidades Flutter para o aplicativo da Fujioka em produção.",
      en: "New Flutter features for Fujioka's app in production.",
    },
    problem: {
      pt: "O aplicativo precisava evoluir sem romper a experiência aprovada nem os serviços existentes.",
      en: "The app had to grow without breaking the approved experience or the existing services.",
    },
    solution: {
      pt: "Implementação fiel ao Figma e integração das jornadas com as APIs de autenticação e produtos.",
      en: "Screens built faithfully from Figma, with the user journeys wired to the authentication and product APIs.",
    },
    role: {
      pt: "Desenvolvimento mobile em Flutter e integração com APIs REST.",
      en: "Mobile development in Flutter and REST API integration.",
    },
    result: {
      pt: "Funcionalidades entregues e incorporadas ao ciclo de evolução do produto.",
      en: "Features delivered and absorbed into the product's release cycle.",
    },
    highlights: {
      pt: ["Funcionalidades novas num app em produção", "Autenticação integrada", "Catálogo consumido por API"],
      en: ["New features in a production app", "Integrated authentication", "Product catalogue loaded from an API"],
    },
    stack: ["Flutter", "Dart", "REST APIs", "Figma"],
    links: {},
    cover: revelaCover,
    gallery: [revelaCover],
  },
  {
    id: "cett-ufg",
    title: { pt: "Sistemas internos — CETT/UFG", en: "Internal systems — CETT/UFG" },
    year: "2024 — 2025",
    status: { pt: "Experiência profissional", en: "Professional experience" },
    summary: {
      pt: "Evolução de sistemas web e automação de processos internos da Fundação RTVE — CETT/UFG.",
      en: "Evolving web systems and automating internal processes at Fundação RTVE — CETT/UFG.",
    },
    problem: {
      pt: "Áreas internas dependiam de sistemas legados e de trabalho manual em processos recorrentes.",
      en: "Internal teams relied on legacy systems and manual work for recurring processes.",
    },
    solution: {
      pt: "Manutenção de sistemas Django, otimização de consultas PostgreSQL, APIs REST e aplicativos Flutter de automação.",
      en: "Maintaining Django systems, optimising PostgreSQL queries, building REST APIs and Flutter automation apps.",
    },
    role: {
      pt: "Desenvolvimento web e mobile, documentação e levantamento de requisitos com as áreas usuárias.",
      en: "Web and mobile development, documentation and gathering requirements with the teams who used the systems.",
    },
    result: {
      pt: "Sistemas modernizados e menos trabalho manual para as equipes.",
      en: "Modernised systems and less manual work for the teams.",
    },
    highlights: {
      pt: ["Funcionalidades e correções em Django", "Consultas PostgreSQL otimizadas", "Automação interna com Flutter"],
      en: ["Features and fixes in Django", "Optimised PostgreSQL queries", "Internal automation with Flutter"],
    },
    stack: ["Python", "Django", "PostgreSQL", "Flutter", "REST APIs"],
    links: {},
    cover: cettCover,
    gallery: [cettCover],
  },
];

function localizeMedia(media: Media<Localized>, lang: Locale): ProjectMedia {
  return { ...media, alt: media.alt[lang] };
}

function localizeProject(project: ProjectEntry, lang: Locale): Project {
  const { cover, gallery } = project;
  return {
    ...project,
    title: project.title[lang],
    status: project.status[lang],
    summary: project.summary[lang],
    problem: project.problem[lang],
    solution: project.solution[lang],
    role: project.role[lang],
    result: project.result[lang],
    highlights: project.highlights[lang],
    cover: Array.isArray(cover) ? cover.map((m) => localizeMedia(m, lang)) : localizeMedia(cover, lang),
    gallery: gallery.map((m) => localizeMedia(m, lang)),
  };
}

/** Ids of the projects that have a page (the same in every language). */
export const projectIds = projects.filter((project) => !project.hidden).map((project) => project.id);

/** The visible projects, in page order, in one language. */
export function getProjects(lang: Locale): Project[] {
  return projects.filter((project) => !project.hidden).map((project) => localizeProject(project, lang));
}
