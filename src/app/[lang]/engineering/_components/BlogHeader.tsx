import Link from "next/link";
import { ThemeToggle } from "@/components/blog/theme";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { feedPath } from "@/lib/blog/metadata";
import { COLLECTION, strings } from "../_strings";
import styles from "../blog.module.css";

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
      <Link href={href(lang, `/${COLLECTION}`)} className={styles.brand}>
        {t.name}
      </Link>
      <nav className={styles.tools}>
        <Link href={href(lang)}>{t.portfolio}</Link>
        <a href={feedPath(COLLECTION, lang)}>{t.feed}</a>
        {languages.length > 1 && (
          <LanguageSwitch className={styles.languages} lang={lang} label={dict.language.label} names={dict.language.names} />
        )}
        <ThemeToggle className={styles.toggle} labels={t.theme} />
      </nav>
    </header>
  );
}
