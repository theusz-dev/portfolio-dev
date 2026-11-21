/**
 * Languages of the site (portfolio now, tech blog and reflections blog later).
 *
 * URLs always carry the language: `/pt`, `/en/projects/orbit`,
 * later `/pt/tech/<slug>` and `/en/reflections/<slug>`. The path after the
 * prefix is the same in both languages, so switching language only swaps the
 * prefix. `/` (and any path without a prefix) redirects to the visitor's
 * last choice (cookie) or to `defaultLocale` — see `src/proxy.ts`.
 *
 * To change the default language, change `defaultLocale`; no URL changes.
 */
export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

/** Set by the language switch; read by the proxy when a URL has no prefix. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** BCP 47 tags for `<html lang>`, `hreflang` and `Intl` formatters. */
export const htmlLang: Record<Locale, string> = { pt: "pt-BR", en: "en" };

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** A value written once per language, e.g. `{ pt: "Projetos", en: "Projects" }`. */
export type Localized<T = string> = Record<Locale, T>;

/** Internal link in a language: `href("en", "/projects/orbit")` → `/en/projects/orbit`. */
export function href(lang: Locale, path = "/") {
  if (path === "/") return `/${lang}`;
  if (path.startsWith("/#")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

/** Fills `{name}` placeholders: `format("{count} projetos", { count: 8 })`. */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
