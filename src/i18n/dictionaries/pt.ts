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
    title: "Um pouco sobre _mim._",
    passages: [
      {
        title: "Agora",
        text: "Faço Engenharia de Computação na **UFG**. Meu último trabalho foi na **Umobi**, criando aplicativos em Flutter e interfaces web em Angular.",
      },
      {
        title: "No dia a dia",
        text: "No mobile eu vou de **Flutter**; na web, **TypeScript** com **React e Next.js**. Quando a tarefa é no back-end, trabalho com **Python / Django** e **Laravel**.",
      },
      {
        title: "De onde trabalho",
        text: "Moro em **Goiânia** ({timezone}) e hoje procuro uma oportunidade **100% remota**.",
      },
    ],
  },
  experience: {
    intro:
      "Comecei mantendo sistemas web no CETT/UFG e, em paralelo, passei a pegar projetos mobile como freelancer na Umobi — até entrar para o time de vez como desenvolvedor full stack.",
    timelineLabel: "Experiências da mais recente à mais antiga",
  },
  skills: {
    aiGroup: "IA no dia a dia",
  },
  projects: {
    statement: "Coisas que _criei do zero_ e entregas que _coloquei em produção_.",
    count: "{count} projetos",
    showLess: "Mostrar menos",
    showMore: "Ver mais projetos",
    open: "Ver detalhes",
    stack: "Tecnologias",
    site: "Ver no ar",
    github: "GitHub",
    private: "Código e acesso privados",
  },
  project: {
    navLabel: "Navegação",
    all: "Todos os projetos",
    story: { problem: "O contexto", solution: "O que foi feito", role: "Meu papel", result: "Como ficou" },
    factsLabel: "Ficha do projeto",
    year: "Ano",
    status: "Status",
    highlights: "Vale destacar",
    stack: "Tecnologias",
    pagerLabel: "Outros projetos",
    previous: "Projeto anterior",
    next: "Próximo projeto",
    closing: "Quer trocar uma ideia sobre este projeto ou sobre uma vaga? _Me chama._",
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
    statement: "Uso IA para _programar melhor_ e também construo sistemas _com IA dentro_.",
    work: "No dia a dia",
    tools: "Ferramentas",
    stack: "Tecnologias",
    pipeline: "Como o sistema funciona",
    demo: "Ver no ar",
    code: "Código",
  },
  writing: {
    title: "Escrita",
    statement: "Notas técnicas sobre o que construo e _textos pessoais_ sobre a vida, experiências e outras ideias.",
    blogs: { engineering: "Engenharia", reflections: "Reflexões" },
    readingTime: "{minutes} min de leitura",
    all: "Ler tudo em {blog}",
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
