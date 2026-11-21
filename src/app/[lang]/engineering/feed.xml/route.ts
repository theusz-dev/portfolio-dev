import { getProfile } from "@/content/portfolio";
import { hasLocale, locales } from "@/i18n/config";
import { rssFeed } from "@/lib/blog/metadata";
import { getPosts } from "@/lib/blog/posts";
import { COLLECTION, strings } from "../_strings";

// Built once per language at build time: /pt/engineering/feed.xml, /en/engineering/feed.xml
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return new Response("Not found", { status: 404 });
  const t = strings[lang];
  const xml = rssFeed({
    collection: COLLECTION,
    lang,
    title: `${t.name} — ${getProfile(lang).shortName}`,
    description: t.description,
    posts: getPosts(COLLECTION, lang),
  });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
