import fs from "node:fs";
import path from "node:path";
import type { MDXContent } from "mdx/types";
import { parse } from "yaml";
import { locales, type Locale } from "@/i18n/config";

/**
 * Posts of both blogs, read from `src/content/<collection>/<lang>/<slug>.mdx`.
 *
 * A translation uses the same file name (slug) in the other language folder,
 * so `/pt/engineering/x` and `/en/engineering/x` are the same post. A post may
 * exist in only one language; `languages` says which ones exist.
 *
 * Frontmatter:
 *   title: string            (required)
 *   description: string      (required; list pages and <meta name="description">)
 *   date: YYYY-MM-DD         (required; publication date)
 *   updated: YYYY-MM-DD      (optional)
 *   tags: [a, b]             (optional)
 *   draft: true              (optional; shown in `next dev`, left out of builds)
 */
export const collections = ["engineering", "reflections"] as const;
export type Collection = (typeof collections)[number];

export type Post = {
  collection: Collection;
  lang: Locale;
  slug: string;
  title: string;
  description: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  /** Languages this post exists in (always includes `lang`). */
  languages: Locale[];
};

const contentRoot = path.join(process.cwd(), "src", "content");
const showDrafts = process.env.NODE_ENV !== "production";

const dirOf = (collection: Collection, lang: Locale) => path.join(contentRoot, collection, lang);

function slugsIn(collection: Collection, lang: Locale) {
  const dir = dirOf(collection, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length));
}

function isoDate(value: unknown, field: string, file: string): string {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(`${value}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime())) throw new Error(`${file}: "${field}" must be a date (YYYY-MM-DD).`);
  return date.toISOString().slice(0, 10);
}

function readPost(collection: Collection, lang: Locale, slug: string): Post {
  const file = path.join(dirOf(collection, lang), `${slug}.mdx`);
  const source = fs.readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`${file}: missing frontmatter (--- ... ---).`);

  const data = (parse(match[1]) ?? {}) as Record<string, unknown>;
  for (const field of ["title", "description"] as const) {
    if (typeof data[field] !== "string" || !data[field]) throw new Error(`${file}: "${field}" is required.`);
  }
  const tags = data.tags ?? [];
  if (!Array.isArray(tags)) throw new Error(`${file}: "tags" must be a list.`);

  const words = source.slice(match[0].length).split(/\s+/).filter(Boolean).length;

  return {
    collection,
    lang,
    slug,
    title: data.title as string,
    description: data.description as string,
    date: isoDate(data.date, "date", file),
    updated: data.updated == null ? undefined : isoDate(data.updated, "updated", file),
    tags: tags.map(String),
    draft: data.draft === true,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    languages: locales.filter((other) => fs.existsSync(path.join(dirOf(collection, other), `${slug}.mdx`))),
  };
}

/** Posts of a blog in one language, newest first. Drafts only in development. */
export function getPosts(collection: Collection, lang: Locale): Post[] {
  return slugsIn(collection, lang)
    .map((slug) => readPost(collection, lang, slug))
    .filter((post) => showDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** One post's metadata, or `undefined` if it doesn't exist (or is a draft in production). */
export function getPost(collection: Collection, lang: Locale, slug: string): Post | undefined {
  return getPosts(collection, lang).find((post) => post.slug === slug);
}

/** `generateStaticParams` for `[lang]/<collection>/[slug]`. */
export function postParams(collection: Collection, lang: Locale) {
  return getPosts(collection, lang).map(({ slug }) => ({ slug }));
}

/** Newer and older neighbours in the list (for "next / previous" links). */
export function adjacentPosts(collection: Collection, lang: Locale, slug: string) {
  const posts = getPosts(collection, lang);
  const index = posts.findIndex((post) => post.slug === slug);
  return { newer: posts[index - 1] ?? null, older: posts[index + 1] ?? null };
}

/** The compiled post body. Render it with the blog's own components: `<Content components={...} />`. */
export async function loadPostContent(collection: Collection, lang: Locale, slug: string): Promise<MDXContent> {
  const mod = await import(`@/content/${collection}/${lang}/${slug}.mdx`);
  return mod.default;
}
