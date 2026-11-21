import Link from "next/link";
import { format, href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Rich } from "@/i18n/Rich";
import { collections, getPosts } from "@/lib/blog/posts";
import { Plates } from "./Plates";
import type { WritingProps } from "./types";
import s from "./writing.module.css";

/** How many of the latest posts (both blogs together) the portfolio shows. */
const LATEST = 3;

type Props = { lang?: Locale };

/**
 * Latest posts from the engineering and reflections blogs, shown as
 * photographic plates (see Plates.tsx). Hidden while nothing is published.
 */
export function Writing({ lang = "pt" }: Props) {
  const t = getDictionary(lang).writing;
  const posts = collections
    .flatMap((collection) => getPosts(collection, lang))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, LATEST);
  if (posts.length === 0) return null;

  const props: WritingProps = { lang, posts, t };

  return (
    <section id="artigos" className={s.section} aria-labelledby="writing-title">
      <header className={s.head}>
        <h2 id="writing-title">{t.title}</h2>
        <p className={s.statement}>
          <Rich text={t.statement} />
        </p>
      </header>

      <Plates {...props} />

      <p className={s.more}>
        {collections.map((collection) => (
          <Link key={collection} href={href(lang, `/${collection}`)}>
            {format(t.all, { blog: t.blogs[collection] })} <span aria-hidden="true">→</span>
          </Link>
        ))}
      </p>
    </section>
  );
}
