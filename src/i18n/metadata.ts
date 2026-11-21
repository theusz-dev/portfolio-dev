import type { Metadata } from "next";
import { defaultLocale, href, htmlLang, locales, type Locale } from "./config";

const fallbackSiteUrl = "https://portfolio-dev-lake-pi.vercel.app";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl);

/** Canonical URL and `hreflang` links for a page that exists in every language. */
export function alternates(lang: Locale, path = "/"): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[htmlLang[locale]] = href(locale, path);
  languages["x-default"] = href(defaultLocale, path);
  return { canonical: href(lang, path), languages };
}
