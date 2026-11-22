import { parsePost, type Meta } from "./frontmatter";
import { otherLang, type Collection, type Lang, type RawPost } from "./types";

export type PostState = "draft" | "published" | "archived";

export type PostEntry = {
  /** Repository-relative path; also the entry's id. */
  path: string;
  collection: Collection;
  lang: Lang;
  slug: string;
  archived: boolean;
  state: PostState;
  meta: Meta;
  problem: string | null;
  modified: number;
  /** Path of the same post in the other language, if it exists (and is in the same place: live or archived). */
  translation: string | null;
};

export function buildLibrary(raw: RawPost[]): PostEntry[] {
  const byKey = new Map(raw.map((post) => [key(post.collection, post.lang, post.slug, post.archived), post]));
  return raw
    .map((post) => {
      const { meta, problem } = parsePost(post.source);
      const other = byKey.get(key(post.collection, otherLang(post.lang), post.slug, post.archived));
      const state: PostState = post.archived ? "archived" : meta.draft ? "draft" : "published";
      return {
        path: post.path,
        collection: post.collection,
        lang: post.lang,
        slug: post.slug,
        archived: post.archived,
        state,
        meta,
        problem,
        modified: post.modified,
        translation: other ? other.path : null,
      };
    })
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug) || a.lang.localeCompare(b.lang));
}

const key = (collection: string, lang: string, slug: string, archived: boolean) => `${archived ? "a" : "l"}:${collection}:${lang}:${slug}`;

/** Newer / older neighbours in the site's list (same blog and language, not archived; drafts count, as in `next dev`). */
export function neighbours(entries: PostEntry[], current: { collection: Collection; lang: Lang; slug: string; date: string }) {
  const list = entries
    .filter((e) => !e.archived && e.collection === current.collection && e.lang === current.lang && e.slug !== current.slug)
    .map((e) => ({ slug: e.slug, title: e.meta.title, date: e.meta.date }))
    .concat({ slug: current.slug, title: "", date: current.date })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const index = list.findIndex((e) => e.slug === current.slug);
  const pick = (e?: { slug: string; title: string }) => (e ? { slug: e.slug, title: e.title } : null);
  return { newer: pick(list[index - 1]), older: pick(list[index + 1]) };
}

export function matches(entry: PostEntry, query: string) {
  if (!query) return true;
  const q = fold(query);
  return [entry.meta.title, entry.slug, entry.meta.description, ...entry.meta.tags].some((text) => fold(text).includes(q));
}

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** One article: the same slug in one or both languages (versions are linked by the slug). */
export type Article = {
  key: string;
  collection: Collection;
  slug: string;
  archived: boolean;
  /** Archived; else published when any version is live; else draft. */
  state: PostState;
  versions: Partial<Record<Lang, PostEntry>>;
  title: string;
  date: string;
};

export function groupArticles(entries: PostEntry[]): Article[] {
  const map = new Map<string, Article>();
  for (const entry of entries) {
    const key = `${entry.archived ? "a" : "l"}:${entry.collection}:${entry.slug}`;
    let article = map.get(key);
    if (!article) {
      article = { key, collection: entry.collection, slug: entry.slug, archived: entry.archived, state: "draft", versions: {}, title: "", date: "" };
      map.set(key, article);
    }
    article.versions[entry.lang] = entry;
  }
  for (const article of map.values()) {
    const versions = Object.values(article.versions) as PostEntry[];
    const main = article.versions.pt ?? versions[0];
    article.title = main.meta.title;
    article.date = versions.map((v) => v.meta.date).sort().at(-1) ?? "";
    article.state = article.archived ? "archived" : versions.some((v) => !v.meta.draft) ? "published" : "draft";
  }
  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export const articleKeyOf = (entry: { archived: boolean; collection: string; slug: string }) =>
  `${entry.archived ? "a" : "l"}:${entry.collection}:${entry.slug}`;
