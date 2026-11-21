import type { Localized } from "@/i18n/config";

/** Interface text of the reflections blog. Lives here (not in the portfolio dictionary) so this blog can change it freely. */
export const strings = {
  pt: {
    name: "Reflexões",
    description: "Reflexões de Matheus Fernandes sobre aprender, construir e o que fica entre uma coisa e outra.",
    portfolio: "Portfólio",
    feed: "RSS",
    empty: "Nenhum texto publicado ainda.",
    readingTime: "{minutes} min de leitura",
    updated: "Atualizado em {date}",
    draft: "Rascunho (não aparece em produção)",
    onlyIn: "Este texto existe só em português.",
    newer: "Mais recente",
    older: "Mais antigo",
    allPosts: "Todos os textos",
    theme: { toLight: "Tema claro", toDark: "Tema escuro" },
  },
  en: {
    name: "Reflections",
    description: "Reflections by Matheus Fernandes on learning, building and what lies in between.",
    portfolio: "Portfolio",
    feed: "RSS",
    empty: "Nothing published yet.",
    readingTime: "{minutes} min read",
    updated: "Updated {date}",
    draft: "Draft (hidden in production)",
    onlyIn: "This piece is only available in English.",
    newer: "Newer",
    older: "Older",
    allPosts: "All pieces",
    theme: { toLight: "Light theme", toDark: "Dark theme" },
  },
} satisfies Localized<Record<string, unknown>>;

export const COLLECTION = "reflections" as const;
