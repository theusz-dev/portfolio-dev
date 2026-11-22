import type { MDXComponents, MDXContent } from "mdx/types";
import { Component, useEffect, useMemo, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { format } from "../../../src/i18n/config";
import { blogs } from "./blogs";
import type { PreviewPayload } from "./protocol";

/** Same as `formatDate` in src/lib/blog/metadata.ts. */
const htmlLang = { pt: "pt-BR", en: "en" } as const;
function formatDate(iso: string, lang: "pt" | "en") {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso || "—";
  return date.toLocaleDateString(htmlLang[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

type Props = {
  payload: PreviewPayload;
  Content: MDXContent | null;
  version: number;
  /** The compiled post threw while rendering (e.g. an undefined component). */
  onRenderError: (error: unknown) => void;
  /** The post rendered without throwing. */
  onRendered: (Content: MDXContent) => void;
};

/**
 * The reading page, built like src/app/[lang]/<blog>/[slug]/page.tsx with the
 * blog's own components and CSS modules. Header and pager are drawn with the
 * blog's classes; only the footer is left out.
 */
export function PreviewPage({ payload, Content, version, onRenderError, onRendered }: Props) {
  const { collection, lang, meta, languages, neighbours, readingMinutes, resolveAsset } = payload;
  const blog = blogs[collection];
  const { article: styles, shared, icons } = blog;
  const t = blog.strings[lang];
  const { Toc, Firmament } = blog;
  const base = `/${lang}/${collection}`;

  const components = useMemo<MDXComponents>(() => {
    const own = blog.mdxComponents(lang);
    const Img = own.img as (props: ComponentProps<"img">) => React.ReactElement;
    return {
      ...own,
      // Site paths (/blog/…) point at the repository's public/ folder.
      img: ({ src, ...props }: ComponentProps<"img">) => (
        <Img {...props} src={typeof src === "string" && src.startsWith("/") ? resolveAsset(src) : src} />
      ),
    };
  }, [blog, lang, resolveAsset]);

  const fonts = {
    [`--${blog.fontVar}-sans`]: '"IBM Plex Sans"',
    [`--${blog.fontVar}-mono`]: '"IBM Plex Mono"',
    [`--${blog.fontVar}-display`]: '"Cormorant Garamond"',
  } as CSSProperties;

  return (
    <div id="top" className={shared.shell} style={fonts}>
      <header className={shared.header}>
        <div className={`${shared.container} ${shared.headerInner}`}>
          <a href={base} className={shared.brand}>
            <icons.StarMark className={shared.brandMark} />
            <span className={shared.brandAuthor}>{t.author}</span>
            <span className={shared.brandSlash} aria-hidden="true">
              /
            </span>
            <span>{t.name}</span>
          </a>
          <nav className={shared.tools}>
            <a href={`/${lang}`} className={shared.navLink}>
              {t.portfolio}
            </a>
            <a href={`${base}/feed.xml`} className={shared.iconButton} aria-label={t.feedTitle}>
              <icons.RssIcon />
            </a>
            <span className={shared.divider} aria-hidden="true" />
            {languages.length > 1 && (
              <nav className={shared.languages}>
                {(["pt", "en"] as const).map((locale) => (
                  <a key={locale} href={`/${locale}/${collection}/${payload.slug}`} aria-current={locale === lang ? "true" : undefined}>
                    {locale.toUpperCase()}
                  </a>
                ))}
              </nav>
            )}
            <button type="button" className={shared.iconButton} aria-label={t.theme.toDark} data-preview-theme>
              <icons.SunIcon className={shared.sun} />
              <icons.MoonIcon className={shared.moon} />
            </button>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <Firmament variant="band" />
          <header className={styles.head}>
            <a href={base} className={`${shared.mono} ${styles.back}`}>
              <icons.ArrowIcon direction="left" className={styles.backArrow} />
              {t.name}
            </a>
            <p className={`${shared.mono} ${styles.meta}`}>
              <time dateTime={meta.date}>{formatDate(meta.date, lang)}</time>
              <span aria-hidden="true">·</span>
              <span>{format(t.readingTime, { minutes: readingMinutes })}</span>
              {meta.updated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{format(t.updated, { date: formatDate(meta.updated, lang) })}</span>
                </>
              )}
            </p>
            <h1 className={styles.title}>{meta.title || <Placeholder>{lang === "pt" ? "Sem título" : "Untitled"}</Placeholder>}</h1>
            <p className={styles.lead}>{meta.description || <Placeholder>{lang === "pt" ? "Sem descrição" : "No description"}</Placeholder>}</p>
            {meta.tags.length > 0 && (
              <ul className={`${shared.tags} ${styles.tags}`}>
                {meta.tags.map((tag) => (
                  <li key={tag}>
                    <a href={`${base}?tag=${encodeURIComponent(tag)}`} className={shared.tag}>
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {(meta.draft || languages.length === 1) && (
              <div className={styles.notes}>
                {meta.draft && <p className={shared.draft}>{t.draft}</p>}
                {languages.length === 1 && <p>{t.onlyIn}</p>}
              </div>
            )}
          </header>
        </div>

        <div className={styles.layout}>
          <article className={styles.prose} data-prose>
            {Content && (
              <Boundary key={version} onError={onRenderError}>
                <Content components={components} />
                <Rendered onRendered={() => onRendered(Content)} />
              </Boundary>
            )}
          </article>
          <aside className={styles.side}>
            <Toc key={version} title={t.onThisPage} />
          </aside>
        </div>

        <nav className={styles.pager} aria-label={t.allPosts}>
          {neighbours.newer ? (
            <a href={`${base}/${neighbours.newer.slug}`} className={styles.pagerLink}>
              <span className={shared.mono}>
                <icons.ArrowIcon direction="left" className={styles.pagerArrow} /> {t.newer}
              </span>
              <span className={styles.pagerTitle}>{neighbours.newer.title}</span>
            </a>
          ) : (
            <span />
          )}
          {neighbours.older ? (
            <a href={`${base}/${neighbours.older.slug}`} className={`${styles.pagerLink} ${styles.pagerOlder}`}>
              <span className={shared.mono}>
                {t.older} <icons.ArrowIcon className={styles.pagerArrow} />
              </span>
              <span className={styles.pagerTitle}>{neighbours.older.title}</span>
            </a>
          ) : (
            <span />
          )}
        </nav>
        <p className={styles.all} style={{ paddingBottom: 96 }}>
          <a href={base} className={shared.mono}>
            {t.allPosts}
          </a>
        </p>
      </main>
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span style={{ opacity: 0.35 }}>{children}</span>;
}

class Boundary extends Component<{ children: ReactNode; onError: (error: unknown) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Rendered({ onRendered }: { onRendered: () => void }) {
  useEffect(onRendered);
  return null;
}
