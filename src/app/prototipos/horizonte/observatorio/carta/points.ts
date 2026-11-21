import { profile } from "@/content/portfolio";

export type Ring = "agora" | "ferramentas" | "base";

export type Point = {
  id: string;
  ring: Ring;
  angle: number;
  title: string;
  meta: string;
  text: string;
  clock?: boolean;
};

export const RINGS: Record<Ring, { r: number; label: string }> = {
  agora: { r: 92, label: "Agora" },
  ferramentas: { r: 172, label: "Ferramentas" },
  base: { r: 250, label: "Base" },
};

// Facts come from main: profile.json, experience.json and projects.json.
export const POINTS: Point[] = [
  {
    id: "umobi",
    ring: "agora",
    angle: -52,
    title: profile.company,
    meta: "Experiência · jan. a nov. de 2026",
    text: "Atuei como desenvolvedor full stack em aplicativos Flutter para Android e iOS, interfaces Angular e serviços PHP/Laravel.",
  },
  {
    id: "ufg",
    ring: "agora",
    angle: 128,
    title: profile.education.short,
    meta: `Agora · ${profile.education.start} — ${profile.education.expectedShort}`,
    text: `${profile.education.degree} na ${profile.education.institution}, com conclusão prevista para ${profile.education.expected}.`,
  },
  {
    id: "ts",
    ring: "ferramentas",
    angle: 8,
    title: "TypeScript",
    meta: "Ferramentas · stack principal",
    text: "Base dos projetos web recentes, como o Orbitarium e o Lumen.",
  },
  {
    id: "react",
    ring: "ferramentas",
    angle: 74,
    title: "React / Next.js",
    meta: "Ferramentas · stack principal",
    text: "Interfaces do Orbit e do Orbitarium; Next.js 16 no SaaS multi-tenant Lumen.",
  },
  {
    id: "flutter",
    ring: "ferramentas",
    angle: 152,
    title: "Flutter",
    meta: "Ferramentas · stack principal",
    text: "Apps em produção na Umobi, o Revela Fácil da Fujioka e o Memora.",
  },
  {
    id: "django",
    ring: "ferramentas",
    angle: 214,
    title: "Python / Django",
    meta: "Ferramentas · stack principal",
    text: "Sistemas web com PostgreSQL e APIs REST no CETT/UFG.",
  },
  {
    id: "laravel",
    ring: "ferramentas",
    angle: 318,
    title: "Laravel",
    meta: "Ferramentas · stack principal",
    text: "Back-end e painéis administrativos com Filament na Umobi.",
  },
  {
    id: "goiania",
    ring: "base",
    angle: 232,
    title: "Goiânia, GO",
    meta: `Base · ${profile.coordinates}`,
    text: `Base no Brasil, no fuso ${profile.timezone}.`,
    clock: true,
  },
  {
    id: "remoto",
    ring: "base",
    angle: 36,
    title: "100% remoto",
    meta: "Base · disponibilidade",
    text: `${profile.availability}.`,
  },
];
