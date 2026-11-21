import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, hasLocale, locales } from "./i18n/config";

/**
 * Every page lives under /pt or /en. A URL without the language (`/`,
 * `/projects/orbit`, old `/projetos/orbit` links) redirects to the visitor's
 * last choice (cookie set by the PT / EN switch) or to the default language.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const lang = saved && hasLocale(saved) ? saved : defaultLocale;
  const path = pathname.replace(/^\/projetos(?=\/|$)/, "/projects");

  const url = request.nextUrl.clone();
  url.pathname = path === "/" ? `/${lang}` : `/${lang}${path}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the Portuguese-only prototypes and files (anything with a dot).
  matcher: ["/((?!_next|api|prototipos|.*\\..*).*)"],
};
