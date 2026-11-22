export const collections = ["engineering", "reflections"] as const;
export type Collection = (typeof collections)[number];

export const locales = ["pt", "en"] as const;
export type Lang = (typeof locales)[number];

export const collectionNames: Record<Collection, string> = {
  engineering: "Engenharia",
  reflections: "Reflexões",
};

/** A post file as the backend lists it. `path` is relative to the repository. */
export type RawPost = {
  collection: Collection;
  lang: Lang;
  slug: string;
  archived: boolean;
  path: string;
  source: string;
  /** Last modification, ms since epoch. */
  modified: number;
};

/** Repository-relative path of a post file. */
export function postPath(collection: Collection, lang: Lang, slug: string, archived = false) {
  return archived ? `src/content/_archive/${collection}/${lang}/${slug}.mdx` : `src/content/${collection}/${lang}/${slug}.mdx`;
}

export const otherLang = (lang: Lang): Lang => (lang === "pt" ? "en" : "pt");
