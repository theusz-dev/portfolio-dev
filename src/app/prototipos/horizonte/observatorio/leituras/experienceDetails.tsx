import { htmlLang, type Locale, type Localized } from "@/i18n/config";

/** Short label and summary for each job in `experience.json`, per language. */
const details: Record<string, { label: string; summary: Localized }> = {
  "umobi-fullstack": {
    label: "Umobi · Full stack",
    summary: {
      pt: "Fiquei responsável pela evolução do Orca, um app de orçamentos para Android e iOS. Além de cuidar do mobile em Flutter, construí interfaces web em Angular e painéis internos com Laravel e Filament.",
      en: "I took care of Orca, a quoting app for Android and iOS. Alongside the Flutter mobile work, I built Angular web interfaces and internal admin panels using Laravel and Filament.",
    },
  },
  "umobi-mobile-freelance": {
    label: "Umobi · Mobile",
    summary: {
      pt: "No Revela Fácil, da Fujioka, tirei as telas novas do Figma e integrei com as APIs de autenticação e catálogo. Nesse mesmo período, construí do zero o aplicativo de uma startup de construção civil, com mais de 30 telas e 60 rotas consumidas.",
      en: "For Fujioka's Revela Fácil app, I turned Figma designs into new Flutter screens wired up to their auth and catalogue APIs. Around the same time, I built a construction startup's app from scratch — over 30 screens talking to more than 60 API endpoints.",
    },
  },
  "cett-ufg-web": {
    label: "CETT/UFG · Web",
    summary: {
      pt: "Melhorei consultas em Django e PostgreSQL em páginas que antes demoravam de 20 a 60 segundos para abrir. Também criei um app em Flutter para controle da frota interna, com registro por foto e assinatura na tela.",
      en: "I sped up Django and PostgreSQL queries on pages that used to take 20 to 60 seconds to load. I also built an internal Flutter app for logging fleet usage, complete with photo capture and on-screen signatures.",
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
