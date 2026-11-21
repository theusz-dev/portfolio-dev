import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, htmlLang, locales } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";
import "../globals.css";

// Only /pt and /en exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: siteUrl,
  // Still the redesign branch: keep it out of search engines until launch.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    // suppressHydrationWarning: the blogs set `data-theme` here before hydration (src/components/blog/theme.tsx).
    <html lang={htmlLang[lang]} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
