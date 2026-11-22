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
      pt: "Uma página inicial para o navegador, open source e local-first, pensada para organizar o dia sem depender de contas ou nuvem.",
      en: "An open-source, local-first browser start page built to organise your day without accounts or cloud sync.",
    },
    problem: {
      pt: "Quase toda página inicial de navegador ou é simples demais ou tenta prender você em uma conta na nuvem — e nenhuma separa bem os momentos de trabalho, estudo e descanso.",
      en: "Most browser start pages are either too bare-bones or try to lock you into a cloud account — and rarely help separate work, study and downtime.",
    },
    solution: {
      pt: "Criei uma PWA que guarda tudo no próprio navegador: você alterna entre espaços de trabalho e tem busca rápida, clima, notas, timer Pomodoro e vários temas à mão.",
      en: "I built a PWA that keeps everything right in the browser: you can switch between workspaces and have quick search, weather, notes, a Pomodoro timer and custom themes in one place.",
    },
    role: {
      pt: "Idealizei o produto, desenhei a interface e desenvolvi toda a aplicação.",
      en: "Designed the product and UI from scratch and built the entire client-side app.",
    },
    result: {
      pt: "Está no ar com código aberto e já recebeu contribuições de outros desenvolvedores no GitHub.",
      en: "Live and open source, and has already received contributions from other developers on GitHub.",
    },
    highlights: {
      pt: [
        "Funciona offline e não coleta nenhum dado pessoal",
        "Vários temas e estilos de layout para deixar com a sua cara",
        "Organização por drag-and-drop e backup fácil das configurações em arquivo",
      ],
      en: [
        "Works offline and collects zero personal data",
        "Multiple themes and layout styles you can tweak",
        "Drag-and-drop organisation with simple file import/export for backups",
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
      pt: "App de flashcards offline-first com repetição espaçada e um tutor de IA que conhece o conteúdo de cada deck.",
      en: "An offline-first flashcard app with spaced repetition and an AI tutor tailored to each deck.",
    },
    problem: {
      pt: "Montar bons flashcards a partir de textos longos ou PDFs dá trabalho, e a maioria dos apps que usam IA exige assinatura e joga seus materiais para um servidor externo.",
      en: "Turning long texts or PDFs into good flashcards takes hours, and most AI study apps force you into a subscription while storing your notes on their servers.",
    },
    solution: {
      pt: "Um app em Flutter onde seus dados ficam no aparelho: ele lê seus textos ou PDFs para sugerir cards, agenda as revisões offline e traz um chat com tutor de IA focado no tema do deck.",
      en: "A Flutter app where your data stays on your device: it turns your texts or PDFs into cards, schedules offline reviews, and lets you chat with an AI tutor focused on that specific deck.",
    },
    role: {
      pt: "Desenhei a ideia, a arquitetura local-first, o visual do app e desenvolvi tudo em Flutter.",
      en: "Created the concept, local-first architecture, UI design and built the Flutter app.",
    },
    result: {
      pt: "Versão inicial publicada com APK disponível no GitHub Releases, site de apresentação e código aberto.",
      en: "First version out with an installable APK on GitHub Releases, a landing page and open-source code.",
    },
    highlights: {
      pt: [
        "Tudo salvo localmente no aparelho, sem exigir login nem servidor próprio",
        "Criação de cards a partir de textos colados ou arquivos PDF",
        "Exportação em JSON e uso da própria chave de API do usuário para a IA",
      ],
      en: [
        "Everything stored locally on the device — no login or backend server required",
        "Generates cards directly from pasted text or PDF files",
        "JSON backups and bring-your-own API key for AI features",
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
      pt: "Plataforma de estudo que explica assuntos difíceis com aulas visuais, diagramas animados e pequenos simuladores.",
      en: "A learning platform that explains tough topics through visual lessons, animated diagrams and interactive simulators.",
    },
    problem: {
      pt: "Certos conceitos de computação e ciência são difíceis de visualizar só lendo texto parado — faz falta mexer nas variáveis e ver o que acontece na hora.",
      en: "Many computing and science concepts are hard to grasp from static text alone — you really need to tweak the variables and see how things move.",
    },
    solution: {
      pt: "Montei um formato de aulas interativas onde o texto caminha junto com diagramas animados, simuladores e perguntas rápidas, mantendo o conteúdo separado da estrutura visual.",
      en: "I built an interactive lesson format where explanations sit alongside animated diagrams, simulators and quick quizzes, cleanly separating the lesson data from the visual components.",
    },
    role: {
      pt: "Pensei na estrutura das aulas, criei os componentes visuais e desenvolvi o front-end.",
      en: "Designed the lesson structure, built the visual components and developed the front end.",
    },
    result: {
      pt: "No ar como demonstração pública, com uma base pronta para receber novas matérias sem precisar redesenhar telas.",
      en: "Live as a public demo, built so new subjects and lessons can be plugged in without reworking the UI.",
    },
    highlights: {
      pt: [
        "Estrutura de aulas tipada em TypeScript para evitar erros de conteúdo",
        "Simuladores e diagramas encaixados dinamicamente no meio da leitura",
        "Checagem automática de todas as aulas antes de publicar",
      ],
      en: [
        "TypeScript-validated lesson schema so broken content never ships",
        "Simulators and diagrams slotted seamlessly into the reading flow",
        "Automated pre-build checks across every lesson",
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
      pt: "Este próprio site: meu canto na web para reunir projetos, trajetória e dois blogs (um técnico e outro mais pessoal), em português e inglês.",
      en: "This very site: my corner of the web bringing together my projects, background and two blogs (one technical, one personal) in Portuguese and English.",
    },
    problem: {
      pt: "Manter portfólio, currículo e textos espalhados em lugares diferentes dava trabalho para atualizar e nunca contava a história completa.",
      en: "Keeping my portfolio, CV and writing scattered across different platforms made updates a chore and never told the full story in one place.",
    },
    solution: {
      pt: "Juntei tudo em uma única aplicação Next.js bilíngue, com visual próprio inspirado em cartas celestes e textos escritos diretamente em MDX.",
      en: "I brought everything under one bilingual Next.js app, with a custom visual identity inspired by star charts and posts written in MDX.",
    },
    role: {
      pt: "Desenhei cada detalhe visual, criei as ilustrações em código e desenvolvi o site e os blogs.",
      en: "Designed the visual identity, coded the procedural illustrations and built both the portfolio and the blogs.",
    },
    result: {
      pt: "Uma casa única na internet onde consigo publicar textos novos ou atualizar projetos em poucos minutos.",
      en: "A single home on the web where I can publish new writing or update projects in minutes.",
    },
    highlights: {
      pt: ["Totalmente em português e inglês", "Portfólio e dois blogs morando no mesmo código", "Cuidado com SEO, performance e acessibilidade"],
      en: ["Fully bilingual in Portuguese and English", "Portfolio and two distinct blogs in one codebase", "Built with care for SEO, performance and accessibility"],
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
      pt: "Sistema web para pequenos times organizarem projetos, tarefas, caixa financeiro e divisão de lucros no mesmo lugar.",
      en: "A web app for small teams to manage projects, tasks, cash flow and profit sharing under one roof.",
    },
    problem: {
      pt: "Times pequenos costumam usar um app para tarefas, planilhas soltas para o financeiro e outra conta para dividir o lucro de cada projeto — e nada conversa entre si.",
      en: "Small teams often juggle one tool for tasks, spreadsheets for expenses and separate math to split project profits — with zero connection between them.",
    },
    solution: {
      pt: "Construí um espaço compartilhado onde cada projeto já nasce com seu quadro Kanban, entradas e saídas, metas e o cálculo automático de quanto cabe a cada pessoa no fim do mês.",
      en: "I built a shared workspace where every project comes with its own Kanban board, income and expense tracking, goals and automated monthly profit-splitting.",
    },
    role: {
      pt: "Defini o produto, modelei as regras financeiras e desenvolvi o sistema completo (front e back-end).",
      en: "Defined the product, modelled the financial rules and built the full-stack application.",
    },
    result: {
      pt: "MVP rodando com login, múltiplos projetos, controle de permissões e fechamento financeiro testado.",
      en: "Working MVP complete with authentication, multi-project permissions and tested financial calculations.",
    },
    highlights: {
      pt: [
        "Código organizado por domínio usando Server Actions do Next.js",
        "Controle fino de quem pode ver ou editar cada projeto",
        "Cálculos financeiros isolados e cobertos por testes automatizados",
      ],
      en: [
        "Domain-driven structure built on Next.js Server Actions",
        "Fine-grained permissions per project",
        "Isolated financial logic backed by automated tests",
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
      pt: "Aplicativo Flutter construído do zero para colocar a operação de uma startup de construção civil no bolso dos usuários.",
      en: "A full Flutter app built from scratch to put a construction startup's daily operations on mobile.",
    },
    problem: {
      pt: "O cliente já tinha um back-end grande pronto, mas precisava tirar o aplicativo do papel e conectar dezenas de fluxos diferentes sem atrasar o lançamento.",
      en: "The client already had a large backend ready to go, but needed someone to bring the mobile app to life across dozens of workflows on a tight schedule.",
    },
    solution: {
      pt: "Desenvolvi o app inteiro em Flutter, estruturando mais de 30 telas e amarrando mais de 60 endpoints da API em entregas semanais.",
      en: "I built the entire Flutter app, putting together over 30 screens and wiring them up to more than 60 API routes through steady weekly deliveries.",
    },
    role: {
      pt: "Fui responsável por todo o desenvolvimento mobile, integração com a API e alinhamento das entregas à distância.",
      en: "Handled all mobile development, API integrations and remote delivery milestones.",
    },
    result: {
      pt: "App entregue e aprovado pelo cliente — e foi esse projeto que me levou a ser contratado em definitivo pela Umobi.",
      en: "App shipped to the client — and the success of this project led directly to my full-time offer at Umobi.",
    },
    highlights: {
      pt: ["Mais de 30 telas criadas em Flutter", "Mais de 60 rotas de API integradas", "Ritmo constante de entregas trabalhando 100% remoto"],
      en: ["30+ Flutter screens built from the ground up", "60+ API endpoints integrated", "Steady, reliable delivery working 100% remotely"],
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
      pt: "Desenvolvimento de novas jornadas em Flutter para o aplicativo de revelação de fotos da Fujioka.",
      en: "New Flutter user flows for Fujioka's photo-printing app in production.",
    },
    problem: {
      pt: "Por ser um aplicativo já usado por clientes da rede, qualquer tela nova precisava seguir o design à risca e conversar com os serviços existentes sem quebrar nada.",
      en: "Because the app was already in customers' hands, new screens had to match the approved designs down to the pixel and plug into existing services without regressions.",
    },
    solution: {
      pt: "Transformei os protótipos do Figma em telas Flutter responsivas e conectei toda a parte de login e listagem de produtos com a API da plataforma.",
      en: "I translated the Figma prototypes into responsive Flutter screens and hooked up the login and product catalogue flows to their backend APIs.",
    },
    role: {
      pt: "Implementação das telas em Flutter e integração com as APIs REST.",
      en: "Flutter UI implementation and REST API integration.",
    },
    result: {
      pt: "Fluxos entregues dentro do cronograma e incorporados ao aplicativo oficial.",
      en: "New flows delivered on schedule and rolled into the live app.",
    },
    highlights: {
      pt: ["Evolução de um app real já em produção", "Fluxos de login e sessão integrados", "Catálogo de produtos alimentado via API"],
      en: ["Shipped into an active production app", "Authentication and session flows wired up", "Product catalogue driven by live APIs"],
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
      pt: "Melhoria de sistemas web em Django e criação de aplicativos internos para facilitar a rotina das equipes da Fundação RTVE — CETT/UFG.",
      en: "Improving Django web systems and building internal apps to make daily operations smoother at Fundação RTVE — CETT/UFG.",
    },
    problem: {
      pt: "Vários setores sofriam com telas que demoravam quase um minuto para carregar e ainda faziam controles importantes no papel ou em planilhas.",
      en: "Several departments were dealing with pages that took nearly a minute to load, while still tracking day-to-day operations on paper or spreadsheets.",
    },
    solution: {
      pt: "Reescrevi consultas pesadas no Django/PostgreSQL para destravar os sistemas web, criei novas APIs e desenvolvi um app em Flutter para registrar a saída de veículos com foto e assinatura na tela.",
      en: "I rewrote heavy Django/PostgreSQL queries to speed up the web systems, built new REST APIs and created a Flutter app for logging fleet vehicles with photos and on-screen signatures.",
    },
    role: {
      pt: "Conversava direto com o pessoal de cada setor para entender a dor, desenvolvia a solução na web ou no mobile e documentava tudo.",
      en: "Sat down with the teams to understand their bottlenecks, built the web or mobile fix, and documented how everything worked.",
    },
    result: {
      pt: "Páginas que levavam até 60 segundos passaram a abrir rápido e o controle de veículos deixou de depender de papel.",
      en: "Pages that used to take up to 60 seconds now load quickly, and fleet tracking moved off paper.",
    },
    highlights: {
      pt: ["Otimização de queries que derrubou esperas de 20–60s", "Evolução contínua de sistemas em Django", "App Flutter para uso da frota com fotos e assinatura digital"],
      en: ["Query tuning that cut 20–60s load times", "Ongoing feature work in Django", "Flutter fleet app with photos and digital signatures"],
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
