import Link from "next/link";
import { format, href, type Locale } from "@/i18n/config";
import { formatDate } from "@/lib/blog/metadata";
import type { Post } from "@/lib/blog/posts";
import { COLLECTION, strings } from "../_strings";
import shared from "../blog.module.css";
import styles from "../index.module.css";
import { Cover } from "./Cover";
import { ArrowIcon } from "./icons";

/** One post in the list: its drawing, then date, title, description and topics. The whole card is the link. */
export function PostCard({ post, lang }: { post: Post; lang: Locale }) {
  const t = strings[lang];
  return (
    <article className={styles.card} data-cover-host>
      <div className={styles.panel}>
        <Cover slug={post.slug} />
      </div>
      <div className={styles.body}>
        <p className={`${shared.mono} ${styles.meta}`}>
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
          <span aria-hidden="true">·</span>
          <span>{format(t.readingShort, { minutes: post.readingMinutes })}</span>
          {post.draft && <span className={shared.draft}>· {t.draftShort}</span>}
        </p>
        <h2 className={styles.cardTitle}>
          <Link href={href(lang, `/${COLLECTION}/${post.slug}`)} className={styles.cardLink}>
            {post.title}
          </Link>
        </h2>
        <p className={styles.description}>{post.description}</p>
        <div className={styles.cardFoot}>
          {post.tags.length > 0 && (
            <ul className={shared.tags}>
              {post.tags.slice(0, 4).map((tag) => (
                <li key={tag} className={shared.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <span className={styles.readMore} aria-hidden="true">
            {t.read}
            <ArrowIcon className={styles.readArrow} />
          </span>
        </div>
      </div>
    </article>
  );
}
