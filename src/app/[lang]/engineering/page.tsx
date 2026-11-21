import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfile } from "@/content/portfolio";
import { format, hasLocale } from "@/i18n/config";
import { blogAlternates } from "@/lib/blog/metadata";
import { getPosts } from "@/lib/blog/posts";
import { BlogFooter } from "./_components/BlogFooter";
import { BlogHeader } from "./_components/BlogHeader";
import { Firmament } from "./_components/Firmament";
import { PostCard } from "./_components/PostCard";
import { PostGrid } from "./_components/PostGrid";
import { COLLECTION, strings } from "./_strings";
import shared from "./blog.module.css";
import styles from "./index.module.css";

type Props = { params: Promise<{ lang: string }> };

async function langFrom({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return lang;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const lang = await langFrom(props);
  const t = strings[lang];
  return {
    title: `${t.name} — ${getProfile(lang).shortName}`,
    description: t.description,
    alternates: blogAlternates(COLLECTION, lang, t.name),
  };
}

/** Topics by how many posts use them (then alphabetically); at most 8 in the filter. */
function topics(tagLists: string[][]) {
  const count = new Map<string, number>();
  for (const tag of tagLists.flat()) count.set(tag, (count.get(tag) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([tag]) => tag);
}

export default async function EngineeringIndex(props: Props) {
  const lang = await langFrom(props);
  const t = strings[lang];
  const posts = getPosts(COLLECTION, lang);
  const count = format(posts.length === 1 ? t.count.one : t.count.other, { n: String(posts.length).padStart(2, "0") });

  return (
    <>
      <BlogHeader lang={lang} />
      <main className={styles.main}>
        <section className={`${shared.container} ${styles.hero}`}>
          <p className={`${shared.mono} ${shared.rise}`} style={{ "--i": 0 } as React.CSSProperties}>
            {t.kicker} <span aria-hidden="true">·</span> {count}
          </p>
          <h1 className={`${styles.title} ${shared.rise}`} style={{ "--i": 1 } as React.CSSProperties}>
            {t.name}
          </h1>
          <p className={`${styles.lead} ${shared.rise}`} style={{ "--i": 2 } as React.CSSProperties}>
            {t.description}
          </p>
        </section>

        <section className={shared.container}>
          {posts.length === 0 ? (
            <p className={styles.empty}>{t.empty}</p>
          ) : (
            <PostGrid
              tags={topics(posts.map((post) => post.tags))}
              labels={{ all: t.all, filterLabel: t.filterLabel, emptyTag: t.emptyTag }}
              items={posts.map((post) => ({
                slug: post.slug,
                tags: post.tags,
                card: <PostCard post={post} lang={lang} />,
              }))}
            />
          )}
        </section>
      </main>
      <BlogFooter lang={lang} />
      <Firmament />
    </>
  );
}
