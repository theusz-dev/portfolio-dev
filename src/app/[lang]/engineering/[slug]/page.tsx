import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/content/portfolio";
import { format, hasLocale, href } from "@/i18n/config";
import { formatDate, postMetadata } from "@/lib/blog/metadata";
import { adjacentPosts, getPost, loadPostContent, postParams } from "@/lib/blog/posts";
import { BlogHeader } from "../_components/BlogHeader";
import { mdxComponents } from "../_components/mdx";
import { COLLECTION, strings } from "../_strings";
import styles from "../blog.module.css";

// Only posts that exist as files; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lang: string } }) {
  return hasLocale(params.lang) ? postParams(COLLECTION, params.lang) : [];
}

type Props = { params: Promise<{ lang: string; slug: string }> };

async function findPost({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const post = getPost(COLLECTION, lang, slug);
  if (!post) notFound();
  return post;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const post = await findPost(props);
  return postMetadata(post, getProfile(post.lang).shortName);
}

export default async function EngineeringPost(props: Props) {
  const post = await findPost(props);
  const { lang } = post;
  const t = strings[lang];
  const Content = await loadPostContent(COLLECTION, lang, post.slug);
  const { newer, older } = adjacentPosts(COLLECTION, lang, post.slug);

  return (
    <>
      <BlogHeader lang={lang} languages={post.languages} />
      <main className={styles.main}>
        <article>
          <header className={styles.articleHeader}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.lead}>{post.description}</p>
            <p className={styles.meta}>
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time> ·{" "}
              {format(t.readingTime, { minutes: post.readingMinutes })}
              {post.updated && (
                <>
                  {" · "}
                  {format(t.updated, { date: formatDate(post.updated, lang) })}
                </>
              )}
            </p>
            {post.draft && <p className={styles.draft}>{t.draft}</p>}
            {post.languages.length === 1 && <p className={styles.note}>{t.onlyIn}</p>}
          </header>

          <div className={styles.prose}>
            <Content components={mdxComponents} />
          </div>
        </article>

        <nav className={styles.pager}>
          {newer ? (
            <Link href={href(lang, `/${COLLECTION}/${newer.slug}`)} rel="next">
              <span>{t.newer}</span>
              {newer.title}
            </Link>
          ) : (
            <span />
          )}
          {older ? (
            <Link href={href(lang, `/${COLLECTION}/${older.slug}`)} rel="prev">
              <span>{t.older}</span>
              {older.title}
            </Link>
          ) : (
            <span />
          )}
        </nav>
        <p>
          <Link href={href(lang, `/${COLLECTION}`)}>← {t.allPosts}</Link>
        </p>
      </main>
    </>
  );
}
