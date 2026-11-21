import Link from "next/link";
import { getProfile } from "@/content/portfolio";
import { href, type Locale } from "@/i18n/config";
import { feedPath } from "@/lib/blog/metadata";
import { COLLECTION, strings } from "../_strings";
import shared from "../blog.module.css";
import styles from "../footer.module.css";
import { ParticleNightfall } from "@/components/prototypes/ParticleNightfall";
import { StarMark } from "./icons";

export function BlogFooter({ lang }: { lang: Locale }) {
  const t = strings[lang];
  const profile = getProfile(lang);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* The portfolio's closing landscape: dunes receding towards a low moon. */}
      <div className={styles.scene} aria-hidden="true">
        <ParticleNightfall className={styles.sceneCanvas} horizon={0.5} moon={0.4} />
      </div>
      <div className={`${shared.container} ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <Link href={href(lang, `/${COLLECTION}`)} className={styles.footerName}>
            <StarMark className={styles.footerMark} />
            {t.name}
          </Link>
          <p>{t.footer}</p>
        </div>
        <nav className={styles.footerCol} aria-label={t.footerBlog}>
          <p className={styles.footerHeading}>{t.footerBlog}</p>
          <ul>
            <li>
              <Link href={href(lang, `/${COLLECTION}`)}>{t.allPosts}</Link>
            </li>
            <li>
              <Link href={href(lang, "/reflections")}>{t.reflections}</Link>
            </li>
            <li>
              <a href={feedPath(COLLECTION, lang)}>{t.feed}</a>
            </li>
          </ul>
        </nav>
        <nav className={styles.footerCol} aria-label={t.footerElsewhere}>
          <p className={styles.footerHeading}>{t.footerElsewhere}</p>
          <ul>
            <li>
              <Link href={href(lang)}>{t.portfolio}</Link>
            </li>
            {profile.social.slice(0, 2).map((item) => (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.email}`}>{t.email}</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className={shared.container}>
        <div className={styles.footerBottom}>
          <p>
            © {year} {profile.shortName} · {t.builtWith}
          </p>
          <a href="#top">{t.backToTop} ↑</a>
        </div>
      </div>
    </footer>
  );
}
