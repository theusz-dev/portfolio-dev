import type { Dictionary } from "./pt";

/** Interface text in English. Same keys as `pt.ts`. */
export const en: Dictionary = {
  meta: {
    title: "{name} — {role}",
    description:
      "Portfolio of Matheus Fernandes, full-stack developer (web and mobile): projects, experience and contact.",
  },
  language: {
    label: "Language",
    names: { pt: "Português", en: "English" },
  },
  sections: {
    about: "About",
    experience: "Experience",
    skills: "Skills",
    projects: "Projects",
    ai: "AI",
    writing: "Writing",
    contact: "Contact",
  },
  hero: {
    navLabel: "Sections",
    scrollCue: "Scroll to the introduction",
    remote: "Remote",
  },
  about: {
    title: "A bit about _me._",
    passages: [
      {
        title: "Right now",
        text: "I'm finishing Computer Engineering at **UFG**. Most recently I was at **Umobi**, building Flutter mobile apps and Angular web interfaces.",
      },
      {
        title: "Day to day",
        text: "On mobile I reach for **Flutter**; on the web, **TypeScript** with **React and Next.js**. For the back end, I usually work with **Python / Django** and **Laravel**.",
      },
      {
        title: "Where I'm based",
        text: "I live in **Goiânia**, Brazil ({timezone}), and I'm looking for a **fully remote** role.",
      },
    ],
  },
  experience: {
    intro:
      "I started out maintaining web systems at CETT/UFG while taking on freelance mobile projects for Umobi on the side — until I joined their team full-time as a full-stack developer.",
    timelineLabel: "Experience, most recent first",
  },
  skills: {
    aiGroup: "AI in my workflow",
  },
  projects: {
    statement: "Things I _built from scratch_ and work I _shipped to production_.",
    count: "{count} projects",
    showLess: "Show less",
    showMore: "More projects",
    open: "See details",
    stack: "Technologies",
    site: "Live site",
    github: "GitHub",
    private: "Private code and access",
  },
  project: {
    navLabel: "Navigation",
    all: "All projects",
    story: { problem: "The context", solution: "What we built", role: "My role", result: "How it turned out" },
    factsLabel: "Project facts",
    year: "Year",
    status: "Status",
    highlights: "Worth noting",
    stack: "Technologies",
    pagerLabel: "Other projects",
    previous: "Previous project",
    next: "Next project",
    closing: "Want to chat about this project or an open role? _Drop me a line._",
    seeAll: "See all projects",
  },
  carousel: {
    role: "carousel",
    slide: "slide",
    label: "Images of {title}",
    position: "{index} of {count}",
    previous: "Previous image",
    next: "Next image",
    show: "Show image {index}: {alt}",
  },
  ai: {
    title: "Artificial\nIntelligence",
    statement: "I use AI to _write better software_, and I also build software _with AI inside_.",
    work: "Day to day",
    tools: "Tools",
    stack: "Technologies",
    pipeline: "How it works",
    demo: "Live site",
    code: "Code",
  },
  writing: {
    title: "Writing",
    statement: "Technical notes on what I build, alongside _personal essays_ on life, experiences, and everything else.",
    blogs: { engineering: "Engineering", reflections: "Reflections" },
    readingTime: "{minutes} min read",
    all: "Read all in {blog}",
    plate: "Plate",
  },
  contact: {
    title: ["Let's", "talk"],
    navLabel: "Portfolio sections",
    backToTop: "Back to top",
    sendEmail: "Send e-mail",
    copyEmail: "Copy e-mail",
    emailCopied: "E-mail copied",
    copyNumber: "Copy number",
    numberCopied: "Number copied",
  },
  notFound: {
    title: "Page not found",
    text: "This address doesn't exist or has moved.",
    back: "Back to the homepage",
  },
};
