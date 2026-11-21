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
    title: "My work, _today._",
    passages: [
      {
        title: "Now",
        text: "I study Computer Engineering at **UFG** (Federal University of Goiás). My most recent role was at **Umobi**, where I built Flutter apps and Angular web interfaces.",
      },
      {
        title: "Tools",
        text: "From **Flutter** on mobile to **TypeScript** and **React / Next.js** on the web. For the services behind those interfaces, I use **Python / Django** and **Laravel**.",
      },
      {
        title: "Base",
        text: "I'm based in **Goiânia**, Brazil ({timezone}), and available for **fully remote** work.",
      },
    ],
  },
  experience: {
    intro:
      "While building web systems at CETT/UFG, I started making apps as a freelancer for Umobi. Later, I joined them as a full-stack developer.",
    timelineLabel: "Experience, most recent first",
  },
  skills: {
    aiGroup: "AI in development",
  },
  projects: {
    statement: "Products I _built from scratch_ and features I _shipped to production_.",
    count: "{count} projects",
    showLess: "Show less",
    showMore: "More projects",
    open: "View project",
    stack: "Technologies",
    site: "Website",
    github: "GitHub",
    private: "Private code and website",
  },
  project: {
    navLabel: "Navigation",
    all: "All projects",
    story: { problem: "The problem", solution: "The solution", role: "My role", result: "The result" },
    factsLabel: "Project facts",
    year: "Year",
    status: "Status",
    highlights: "Highlights",
    stack: "Technologies",
    pagerLabel: "Other projects",
    previous: "Previous project",
    next: "Next project",
    closing: "Want to talk about this project or a role? _I reply quickly._",
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
    statement: "I use AI to _build software_, and I build software _that uses AI_.",
    work: "Work",
    tools: "Tools",
    stack: "Technologies",
    pipeline: "System stages",
    demo: "View demo",
    code: "Code",
  },
  writing: {
    title: "Writing",
    statement: "I write about what I build and what I _think_ while building it.",
    blogs: { engineering: "Engineering", reflections: "Reflections" },
    readingTime: "{minutes} min read",
    all: "All in {blog}",
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
