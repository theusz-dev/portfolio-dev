"use client";

import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, htmlLang, locales, type Locale } from "./config";

type Props = {
  lang: Locale;
  label: string;
  names: Record<Locale, string>;
  className?: string;
};

/**
 * PT / EN. Keeps the page (and the section in the hash) and remembers the
 * choice in a cookie, so `/` opens in that language next time.
 */
export function LanguageSwitch({ lang, label, names, className }: Props) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <nav className={className} aria-label={label}>
      {locales.map((locale) => (
        <a
          key={locale}
          href={`/${locale}${rest}`}
          hrefLang={htmlLang[locale]}
          lang={htmlLang[locale]}
          title={names[locale]}
          aria-current={locale === lang ? "true" : undefined}
          onClick={(event) => {
            document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
            if (window.location.hash) event.currentTarget.href += window.location.hash;
          }}
        >
          {locale.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
