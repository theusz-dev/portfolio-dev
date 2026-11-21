import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/content/portfolio";
import { format, hasLocale, href } from "@/i18n/config";
import { blogAlternates, formatDate } from "@/lib/blog/metadata";
import { getPosts } from "@/lib/blog/posts";
import { BlogHeader } from "./_components/BlogHeader";
import { COLLECTION, strings } from "./_strings";
import styles from "./blog.module.css";

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

export default async function EngineeringIndex(props: Props) {
  const lang = await langFrom(props);
  const t = strings[lang];
  const posts = getPosts(COLLECTION, lang);

  return (
    <>
      <BlogHeader lang={lang} />
      <main className={styles.main}>
        <h1 className={styles.title}>{t.name}</h1>
        <p className={styles.lead}>{t.description}</p>

        {posts.length === 0 ? (
          <p className={styles.empty}>{t.empty}</p>
        ) : (
          <ol className={styles.list}>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={href(lang, `/${COLLECTION}/${post.slug}`)} className={styles.item}>
                  <h2>
                    {post.title}
                    {post.draft && <span className={styles.draft}> · {t.draft}</span>}
                  </h2>
                  <p>{post.description}</p>
                  <p className={styles.meta}>
                    <time dateTime={post.date}>{formatDate(post.date, lang)}</time> ·{" "}
                    {format(t.readingTime, { minutes: post.readingMinutes })}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}
