import { htmlLang, type Locale, type Localized } from "@/i18n/config";

/** Short label and summary for each job in `experience.json`, per language. */
const details: Record<string, { label: string; summary: Localized }> = {
  "umobi-fullstack": {
    label: "Umobi · Full stack",
    summary: {
      pt: "Cuidei do Orca, aplicativo de orçamentos para Android e iOS. Além das telas em Flutter, desenvolvi interfaces em Angular e painéis administrativos com Laravel e Filament.",
      en: "I looked after Orca, a quoting app for Android and iOS. Besides the Flutter screens, I built Angular interfaces and admin panels with Laravel and Filament.",
    },
  },
  "umobi-mobile-freelance": {
    label: "Umobi · Mobile",
    summary: {
      pt: "No Revela Fácil, da Fujioka, transformei os layouts do Figma em telas Flutter e integrei as APIs de autenticação e produtos. Para uma startup de construção civil, entreguei um app com mais de 30 telas e mais de 60 rotas de API.",
      en: "For Fujioka's Revela Fácil, I turned Figma layouts into Flutter screens and integrated the authentication and product APIs. For a construction startup, I delivered an app with more than 30 screens and over 60 API routes.",
    },
  },
  "cett-ufg-web": {
    label: "CETT/UFG · Web",
    summary: {
      pt: "Otimizei consultas em Django e PostgreSQL em páginas que levavam de 20 a 60 segundos para carregar. Também desenvolvi um app para registrar o uso de veículos, com fotos e assinatura eletrônica.",
      en: "I optimised Django and PostgreSQL queries on pages that took 20 to 60 seconds to load. I also built an app to log vehicle use, with photos and an electronic signature.",
    },
  },
};

export function getNotes(lang: Locale): Record<string, { label: string; summary: string }> {
  return Object.fromEntries(
    Object.entries(details).map(([id, { label, summary }]) => [id, { label, summary: summary[lang] }]),
  );
}

/** Portuguese notes, for the prototypes. */
export const notes = getNotes("pt");

const formats = new Map<Locale, Intl.DateTimeFormat>();

export function Month({ value, lang = "pt" }: { value: string; lang?: Locale }) {
  let format = formats.get(lang);
  if (!format) {
    format = new Intl.DateTimeFormat(htmlLang[lang], { month: "short", year: "numeric", timeZone: "UTC" });
    formats.set(lang, format);
  }
  return <time dateTime={value}>{format.format(new Date(value + "-01T00:00:00Z"))}</time>;
}
