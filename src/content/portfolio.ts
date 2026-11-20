// Shared content for the three portfolio prototypes.
// Copied from `main` (content/portfolio/profile.json, projects.json and messages/pt.json)
// so every proposal shows exactly the same introduction and project.

export const profile = {
  name: "Matheus Fernandes da Silva",
  shortName: "Matheus Fernandes",
  firstName: "Matheus",
  lastName: "Fernandes",
  initials: "MF",
  intro: "Olá, eu sou o",
  role: "Desenvolvedor Full Stack",
  roleScope: "Web & Mobile",
  statement: "Código com propósito.",
  statementAccent: "Produtos com identidade.",
  summary:
    "Desenvolvedor full stack na Umobi e estudante de Engenharia de Computação na UFG. Construo e evoluo produtos web e mobile em produção, do levantamento de requisitos à entrega, com foco em integrações, qualidade de código e experiências úteis.",
  availability: "Disponível para trabalho 100% remoto",
  location: "Goiânia, GO · Brasil",
  city: "Goiânia",
  coordinates: "16°40′S 49°15′O",
  yearsExperience: "2+ anos",
  topStack: ["TypeScript", "React / Next.js", "Flutter", "Python / Django", "Laravel"],
  email: "matheustae@hotmail.com",
  resume: "/resume.pdf",
  ctaPrimary: "Explorar projetos",
  ctaResume: "Baixar CV",
  ctaContact: "Vamos conversar",
  social: [
    { label: "GitHub", href: "https://github.com/matheusz-nied" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/matheusz-nied/" },
    { label: "Instagram", href: "https://www.instagram.com/theusz.dev/" },
    { label: "X", href: "https://x.com/theusdev_" },
  ],
  sections: ["Projetos", "Experiência", "Habilidades", "IA", "Contato"],
} as const;

export const project = {
  id: "orbit",
  index: "01",
  title: "Orbit",
  year: "2026",
  status: "Publicado",
  summary: "Startpage open source, local-first e instalável para organizar a rotina no navegador.",
  problem:
    "Páginas iniciais genéricas não acompanham os diferentes contextos de trabalho, estudo e uso pessoal.",
  solution:
    "Uma PWA sem contas ou backend, com espaços de trabalho, busca, clima, notas, Pomodoro, temas e preferências locais.",
  role: "Produto, design e desenvolvimento full stack da experiência client-side.",
  highlights: [
    "PWA offline e sem rastreamento de dados pessoais",
    "Sete temas e sete layouts configuráveis",
    "Drag-and-drop, importação e exportação de preferências",
  ],
  stack: ["React", "Vite", "Tailwind CSS", "Zustand", "dnd-kit", "PWA"],
  result: "Projeto publicado com demo ao vivo, código aberto e contribuições externas.",
  image: {
    src: "/projects/orbit/preview.png",
    width: 1920,
    height: 1080,
    alt: "Tela inicial do Orbit com relógio, busca, filtros por categoria e atalhos para ferramentas de IA",
  },
  links: {
    demo: "https://orbit-portal.netlify.app/",
    github: "https://github.com/matheusz-nied/orbit",
  },
} as const;
