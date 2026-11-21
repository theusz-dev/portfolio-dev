import type { Metadata } from "next";
import { defaultLocale, href, htmlLang, type Locale } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";
import type { Collection, Post } from "./posts";

/** "21 de novembro de 2026" / "November 21, 2026". UTC, so server and browser agree. */
export function formatDate(iso: string, lang: Locale) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(htmlLang[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** `/en/engineering/feed.xml` */
export const feedPath = (collection: Collection, lang: Locale) => href(lang, `/${collection}/feed.xml`);

/** Canonical + hreflang for a blog's post list (exists in every language), plus its RSS feed. */
export function blogAlternates(collection: Collection, lang: Locale, title: string): Metadata["alternates"] {
  const path = `/${collection}`;
  return {
    canonical: href(lang, path),
    languages: {
      "pt-BR": href("pt", path),
      en: href("en", path),
      "x-default": href(defaultLocale, path),
    },
    types: { "application/rss+xml": [{ url: feedPath(collection, lang), title }] },
  };
}

/** Canonical + hreflang for a post: only the languages it was written in. */
export function postAlternates(post: Post): Metadata["alternates"] {
  const path = `/${post.collection}/${post.slug}`;
  const languages: Record<string, string> = {};
  for (const lang of post.languages) languages[htmlLang[lang]] = href(lang, path);
  languages["x-default"] = href(post.languages.includes(defaultLocale) ? defaultLocale : post.languages[0], path);
  return { canonical: href(post.lang, path), languages };
}

/** Full metadata for a post page. */
export function postMetadata(post: Post, siteName: string): Metadata {
  return {
    title: `${post.title} — ${siteName}`,
    description: post.description,
    alternates: postAlternates(post),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      locale: htmlLang[post.lang].replace("-", "_"),
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: post.tags,
      url: href(post.lang, `/${post.collection}/${post.slug}`),
    },
  };
}

const escapeXml = (text: string) =>
  text.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);

/** RSS 2.0 feed of a blog in one language. */
export function rssFeed(options: { collection: Collection; lang: Locale; title: string; description: string; posts: Post[] }) {
  const { collection, lang, title, description, posts } = options;
  const absolute = (path: string) => new URL(path, siteUrl).toString();
  const items = posts
    .map((post) => {
      const link = absolute(href(lang, `/${collection}/${post.slug}`));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${absolute(href(lang, `/${collection}`))}</link>
    <atom:link href="${absolute(feedPath(collection, lang))}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>${htmlLang[lang]}</language>
${items}
  </channel>
</rss>
`;
}
