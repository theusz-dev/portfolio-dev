import type { Locale } from "@/i18n/config";

// Profile shown across the site, in every language (`getProfile`).
// `project` below is the single project the early prototypes showcase.

/** Profile data that reads the same in every language. */
const base = {
  name: "Matheus Fernandes da Silva",
  shortName: "theusz.dev",
  firstName: "Matheus",
  lastName: "Fernandes",
  initials: "MF",
  city: "Goiânia",
  topStack: ["TypeScript", "React / Next.js", "Flutter", "Python / Django", "Laravel"],
  email: "matheustae@hotmail.com",
  whatsapp: { number: "5562994395965", display: "+55 62 99439-5965" },
  social: [
    { label: "GitHub", href: "https://github.com/theusz-dev" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/matheusz-nied/" },
    { label: "Instagram", href: "https://www.instagram.com/theusz.dev/" },
    { label: "X", href: "https://x.com/theusdev_" },
  ],
  timezone: "UTC−3",
  company: "Umobi",
};

/** Profile text per language. Both entries must have the same keys. */
const text = {
  pt: {
    intro: "Olá, eu sou o",
    role: "Desenvolvedor Full Stack",
    roleScope: "Web & Mobile",
    statement: "Código bem pensado.",
    statementAccent: "Produtos feitos com cuidado.",
    summary:
      "Sou desenvolvedor full stack e estou concluindo Engenharia de Computação na UFG. Passei pela Umobi criando aplicativos e sistemas web que rodam em produção, e hoje busco um time para trabalhar 100% remoto.",
    availability: "Disponível para oportunidades 100% remotas",
    location: "Goiânia, GO · Brasil",
    coordinates: "16°40′S 49°15′O",
    yearsExperience: "2+ anos",
    // When there is an English CV, put it in public/ and point `en.resume` at it.
    resume: "/resume.pdf",
    ctaPrimary: "Ver projetos",
    ctaResume: "Baixar currículo",
    ctaContact: "Bora conversar",
    whatsappMessage: "Oi, Matheus! Vi seu portfólio e queria trocar uma ideia.",
  },
  en: {
    intro: "Hi, I'm",
    role: "Full-Stack Developer",
    roleScope: "Web & Mobile",
    statement: "Thoughtful code.",
    statementAccent: "Products built with care.",
    summary:
      "I'm a full-stack developer finishing my Computer Engineering degree at UFG. At Umobi, I built mobile apps and web interfaces used in production, and I'm now looking for a fully remote role.",
    availability: "Open to fully remote roles",
    location: "Goiânia, GO · Brazil",
    coordinates: "16°40′S 49°15′W",
    yearsExperience: "2+ years",
    resume: "/resume.pdf",
    ctaPrimary: "See projects",
    ctaResume: "Download CV",
    ctaContact: "Let's talk",
    whatsappMessage: "Hi Matheus! I came across your portfolio and would love to chat.",
  },
} satisfies Record<Locale, unknown>;

export function getProfile(lang: Locale) {
  return { ...base, ...text[lang] };
}

export type Profile = ReturnType<typeof getProfile>;

/**
 * Portuguese profile for the `/prototipos` pages (Portuguese only), with the
 * fields only they use. The real site calls `getProfile(lang)`.
 */
export const profile = {
  ...getProfile("pt"),
  sections: ["Projetos", "Experiência", "Habilidades", "IA", "Contato"],
  education: {
    institution: "Universidade Federal de Goiás",
    short: "UFG",
    degree: "Bacharelado em Engenharia de Computação",
    start: 2020,
    expected: "dezembro de 2026",
    expectedShort: "dez. 2026",
  },
  // From main: content/portfolio/experience.json and profile.json.
  milestones: [
    { when: "2020", title: "Engenharia de Computação", place: "UFG", text: "Início do bacharelado na Universidade Federal de Goiás." },
    { when: "2024", title: "Primeiros sistemas em produção", place: "CETT/UFG", text: "Desenvolvedor web: Django, PostgreSQL, APIs REST e apps Flutter internos." },
    { when: "2026", title: "Desenvolvedor Full Stack", place: "Umobi", text: "Flutter em produção para Android e iOS, Angular e PHP/Laravel com Filament." },
    { when: "Dez. 2026", title: "Formatura prevista", place: "UFG", text: "Conclusão prevista do bacharelado em Engenharia de Computação." },
  ],
};

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
    github: "https://github.com/theusz-dev/orbit",
  },
} as const;
