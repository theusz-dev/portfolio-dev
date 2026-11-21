import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfile } from "@/content/portfolio";
import { format, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternates } from "@/i18n/metadata";
import { HorizonteHero } from "../prototipos/horizonte/_components/HorizonteHero";
import { fontVariables } from "../prototipos/horizonte/_components/fonts";
import theme from "../prototipos/horizonte/_components/theme.module.css";
import { Ai } from "../prototipos/horizonte/observatorio/leituras/Ai";
import { Experience } from "../prototipos/horizonte/observatorio/leituras/Experience";
import { Footer } from "../prototipos/horizonte/observatorio/leituras/Footer";
import { Projects } from "../prototipos/horizonte/observatorio/leituras/projects/Projects";
import { Reading } from "../prototipos/horizonte/observatorio/leituras/Reading";
import { Skills } from "../prototipos/horizonte/observatorio/leituras/Skills";
import meridiano from "../prototipos/horizonte/observatorio/leituras/meridiano.module.css";
import { newsreader } from "../prototipos/horizonte/observatorio/leituras/textFont";

type Props = { params: Promise<{ lang: string }> };

async function langFrom({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return lang;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const lang = await langFrom(props);
  const profile = getProfile(lang);
  const t = getDictionary(lang);
  return {
    title: format(t.meta.title, { name: profile.shortName, role: profile.role }),
    description: t.meta.description,
    alternates: alternates(lang),
  };
}

/** The chosen design (Horizonte · Observatório · Carta celeste · Meridiano). */
export default async function Home(props: Props) {
  const lang = await langFrom(props);
  return (
    <main className={`${theme.theme} ${fontVariables} ${newsreader.variable} ${meridiano.meridiano}`}>
      <HorizonteHero
        lang={lang}
        languageSwitch
        projectId="projetos"
        sectionLinks={{ experience: "#experiencia", skills: "#habilidades", ai: "#ia", contact: "#contato" }}
      />
      <Reading variant="meridiano" lang={lang} />
      <Experience lang={lang} />
      <Skills lang={lang} />
      <Projects lang={lang} />
      <Ai lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}
