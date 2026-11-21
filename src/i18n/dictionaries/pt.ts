/**
 * Interface text in Portuguese. `en.ts` must have exactly the same keys
 * (TypeScript checks it). Content that belongs to a project, a job or the
 * profile lives next to that data in `src/content/`, also in both languages.
 *
 * Emphasis: `**bold**`, `_italic_`, and `\n` for a line break (see `Rich`).
 * Placeholders: `{count}`, `{title}`… (see `format`).
 */
export const pt = {
  meta: {
    title: "{name} — {role}",
    description:
      "Portfólio de Matheus Fernandes, desenvolvedor full stack (web e mobile): projetos, experiência e contato.",
  },
  language: {
    label: "Idioma",
    names: { pt: "Português", en: "English" },
  },
  sections: {
    about: "Sobre",
    experience: "Experiência",
    skills: "Habilidades",
    projects: "Projetos",
    ai: "IA",
    writing: "Escrita",
    contact: "Contato",
  },
  hero: {
    navLabel: "Seções",
    scrollCue: "Rolar para a apresentação",
    remote: "Remoto",
  },
  about: {
    title: "Meu trabalho, _hoje._",
    passages: [
      {
        title: "Agora",
        text: "Curso Engenharia de Computação na **UFG**. Minha experiência mais recente foi na **Umobi**, onde desenvolvi aplicativos em Flutter e interfaces web em Angular.",
      },
      {
        title: "Ferramentas",
        text: "Do **Flutter** nos apps ao **TypeScript** e **React / Next.js** na web. Nos serviços que sustentam essas interfaces, uso **Python / Django** e **Laravel**.",
      },
      {
        title: "Base",
        text: "Minha base é **Goiânia**, no fuso {timezone}. Estou disponível para trabalho **100% remoto**.",
      },
    ],
  },
  experience: {
    intro:
      "Enquanto desenvolvia sistemas web no CETT/UFG, comecei a criar aplicativos como freelancer na Umobi. Depois, passei a trabalhar lá como desenvolvedor full stack.",
    timelineLabel: "Experiências da mais recente à mais antiga",
  },
  skills: {
    aiGroup: "IA no desenvolvimento",
  },
  projects: {
    statement: "Produtos que _criei do zero_ e funcionalidades que _entreguei em produção_.",
    count: "{count} projetos",
    showLess: "Mostrar menos",
    showMore: "Ver mais projetos",
    open: "Ver projeto",
    stack: "Tecnologias",
    site: "Site",
    github: "GitHub",
    private: "Código e site privados",
  },
  project: {
    navLabel: "Navegação",
    all: "Todos os projetos",
    story: { problem: "O problema", solution: "A solução", role: "Meu papel", result: "O resultado" },
    factsLabel: "Ficha do projeto",
    year: "Ano",
    status: "Status",
    highlights: "Destaques",
    stack: "Tecnologias",
    pagerLabel: "Outros projetos",
    previous: "Projeto anterior",
    next: "Próximo projeto",
    closing: "Quer conversar sobre este projeto ou sobre uma vaga? _Respondo rápido._",
    seeAll: "Ver todos os projetos",
  },
  carousel: {
    role: "carrossel",
    slide: "slide",
    label: "Imagens de {title}",
    position: "{index} de {count}",
    previous: "Imagem anterior",
    next: "Próxima imagem",
    show: "Mostrar imagem {index}: {alt}",
  },
  ai: {
    title: "Inteligência\nArtificial",
    statement: "Uso IA para _construir software_ e construo software _que usa IA_.",
    work: "Trabalho",
    tools: "Ferramentas",
    stack: "Tecnologias",
    pipeline: "Etapas do sistema",
    demo: "Ver demo",
    code: "Código",
  },
  writing: {
    title: "Escrita",
    statement: "Escrevo sobre o que construo e o que _penso_ enquanto construo.",
    blogs: { engineering: "Engenharia", reflections: "Reflexões" },
    readingTime: "{minutes} min de leitura",
    all: "Tudo em {blog}",
    plate: "Placa",
  },
  contact: {
    title: ["Vamos", "conversar"],
    navLabel: "Seções do portfólio",
    backToTop: "Voltar ao topo",
    sendEmail: "Enviar e-mail",
    copyEmail: "Copiar e-mail",
    emailCopied: "E-mail copiado",
    copyNumber: "Copiar número",
    numberCopied: "Número copiado",
  },
  notFound: {
    title: "Página não encontrada",
    text: "Este endereço não existe ou mudou de lugar.",
    back: "Voltar ao início",
  },
};

export type Dictionary = typeof pt;
