import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { feedPath } from "@/lib/blog/metadata";
import { COLLECTION, strings } from "../_strings";
import styles from "../blog.module.css";
import { RssIcon, StarMark } from "./icons";
import { ThemeButton } from "./ThemeButton";

type Props = {
  lang: Locale;
  /** Languages this page exists in; the PT / EN switch only shows when there is more than one. */
  languages?: Locale[];
};

export function BlogHeader({ lang, languages = ["pt", "en"] }: Props) {
  const t = strings[lang];
  const dict = getDictionary(lang);
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href={href(lang, `/${COLLECTION}`)} className={styles.brand}>
          <StarMark className={styles.brandMark} />
          <span className={styles.brandAuthor}>{t.author}</span>
          <span className={styles.brandSlash} aria-hidden="true">
            /
          </span>
          <span>{t.name}</span>
        </Link>
        <nav className={styles.tools}>
          <Link href={href(lang)} className={styles.navLink}>
            {t.portfolio}
          </Link>
          <a href={feedPath(COLLECTION, lang)} className={styles.iconButton} aria-label={t.feedTitle} title={t.feedTitle}>
            <RssIcon />
          </a>
          <span className={styles.divider} aria-hidden="true" />
          {languages.length > 1 && (
            <LanguageSwitch className={styles.languages} lang={lang} label={dict.language.label} names={dict.language.names} />
          )}
          <ThemeButton labels={t.theme} />
        </nav>
      </div>
    </header>
  );
}
