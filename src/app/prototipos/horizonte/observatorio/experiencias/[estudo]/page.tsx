import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HorizonteHero } from "../../../_components/HorizonteHero";
import { fontVariables } from "../../../_components/fonts";
import theme from "../../../_components/theme.module.css";
import { ObservatorioProject } from "../../_components/ObservatorioProject";
import { Reading } from "../../leituras/Reading";
import { ExperienceStudy, studies, type Study } from "../ExperienceStudy";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(studies).map((estudo) => ({ estudo }));
}

type Props = { params: Promise<{ estudo: string }> };

async function studyFrom({ params }: Props) {
  const { estudo } = await params;
  if (!Object.hasOwn(studies, estudo)) notFound();
  return estudo as Study;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: studies[await studyFrom(props)] + " · Experiência — Horizonte" };
}

export default async function ExperiencePage(props: Props) {
  const study = await studyFrom(props);
  return (
    <main className={theme.theme + " " + fontVariables}>
      <HorizonteHero experienceId="experiencia" />
      <Reading variant="meridiano" />
      <ExperienceStudy study={study} />
      <ObservatorioProject />
    </main>
  );
}
