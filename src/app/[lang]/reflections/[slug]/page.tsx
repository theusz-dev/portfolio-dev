import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/content/portfolio";
import { format, hasLocale, href } from "@/i18n/config";
import { formatDate, postMetadata } from "@/lib/blog/metadata";
import { adjacentPosts, getPost, loadPostContent, postParams } from "@/lib/blog/posts";
import { BlogFooter } from "../_components/BlogFooter";
import { BlogHeader } from "../_components/BlogHeader";
import { Firmament } from "../_components/Firmament";
import { ArrowIcon } from "../_components/icons";
import { mdxComponents } from "../_components/mdx";
import { Toc } from "../_components/Toc";
import { COLLECTION, strings } from "../_strings";
import styles from "../article.module.css";
import shared from "../blog.module.css";

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

/**
 * Reading page. The sky only lives behind the title and fades out before the
 * text; from there on it's a quiet column with a side index on wide screens.
 */
export default async function ReflectionsPost(props: Props) {
  const post = await findPost(props);
  const { lang } = post;
  const t = strings[lang];
  const Content = await loadPostContent(COLLECTION, lang, post.slug);
  const { newer, older } = adjacentPosts(COLLECTION, lang, post.slug);

  return (
    <>
      <BlogHeader lang={lang} languages={post.languages} />
      <main className={styles.main}>
        <div className={styles.hero}>
          <Firmament variant="band" />
          <header className={styles.head}>
            <Link href={href(lang, `/${COLLECTION}`)} className={`${shared.mono} ${styles.back}`}>
              <ArrowIcon direction="left" className={styles.backArrow} />
              {t.name}
            </Link>
            <p className={`${shared.mono} ${styles.meta}`}>
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
              <span aria-hidden="true">·</span>
              <span>{format(t.readingTime, { minutes: post.readingMinutes })}</span>
              {post.updated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{format(t.updated, { date: formatDate(post.updated, lang) })}</span>
                </>
              )}
            </p>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.lead}>{post.description}</p>
            {post.tags.length > 0 && (
              <ul className={`${shared.tags} ${styles.tags}`}>
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`${href(lang, `/${COLLECTION}`)}?tag=${encodeURIComponent(tag)}`} className={shared.tag}>
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {(post.draft || post.languages.length === 1) && (
              <div className={styles.notes}>
                {post.draft && <p className={shared.draft}>{t.draft}</p>}
                {post.languages.length === 1 && <p>{t.onlyIn}</p>}
              </div>
            )}
          </header>
        </div>

        <div className={styles.layout}>
          <article className={styles.prose} data-prose>
            <Content components={mdxComponents(lang)} />
          </article>
          <aside className={styles.side}>
            <Toc title={t.onThisPage} />
          </aside>
        </div>

        <nav className={styles.pager} aria-label={t.allPosts}>
          {newer ? (
            <Link href={href(lang, `/${COLLECTION}/${newer.slug}`)} rel="next" className={styles.pagerLink}>
              <span className={shared.mono}>
                <ArrowIcon direction="left" className={styles.pagerArrow} /> {t.newer}
              </span>
              <span className={styles.pagerTitle}>{newer.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {older ? (
            <Link href={href(lang, `/${COLLECTION}/${older.slug}`)} rel="prev" className={`${styles.pagerLink} ${styles.pagerOlder}`}>
              <span className={shared.mono}>
                {t.older} <ArrowIcon className={styles.pagerArrow} />
              </span>
              <span className={styles.pagerTitle}>{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
        <p className={styles.all}>
          <Link href={href(lang, `/${COLLECTION}`)} className={shared.mono}>
            {t.allPosts}
          </Link>
        </p>
      </main>
      <BlogFooter lang={lang} />
    </>
  );
}
