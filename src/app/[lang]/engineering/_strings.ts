import type { Localized } from "@/i18n/config";

/** Interface text of the engineering blog. Lives here (not in the portfolio dictionary) so this blog can change it freely. */
export const strings = {
  pt: {
    name: "Engenharia",
    description: "Notas de engenharia de Matheus Fernandes: o que construí, como e por quê.",
    portfolio: "Portfólio",
    feed: "RSS",
    empty: "Nenhum artigo publicado ainda.",
    readingTime: "{minutes} min de leitura",
    updated: "Atualizado em {date}",
    draft: "Rascunho (não aparece em produção)",
    onlyIn: "Este artigo existe só em português.",
    newer: "Mais recente",
    older: "Mais antigo",
    allPosts: "Todos os artigos",
    theme: { toLight: "Tema claro", toDark: "Tema escuro" },
  },
  en: {
    name: "Engineering",
    description: "Engineering notes by Matheus Fernandes: what I built, how and why.",
    portfolio: "Portfolio",
    feed: "RSS",
    empty: "No posts published yet.",
    readingTime: "{minutes} min read",
    updated: "Updated {date}",
    draft: "Draft (hidden in production)",
    onlyIn: "This post is only available in English.",
    newer: "Newer",
    older: "Older",
    allPosts: "All posts",
    theme: { toLight: "Light theme", toDark: "Dark theme" },
  },
} satisfies Localized<Record<string, unknown>>;

export const COLLECTION = "engineering" as const;
