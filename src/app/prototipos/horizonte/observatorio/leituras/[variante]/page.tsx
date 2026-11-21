import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HorizonteHero } from "../../../_components/HorizonteHero";
import { fontVariables } from "../../../_components/fonts";
import theme from "../../../_components/theme.module.css";
import { ObservatorioProject } from "../../_components/ObservatorioProject";
import { Ai } from "../Ai";
import { Experience } from "../Experience";
import { Reading } from "../Reading";
import { Skills } from "../Skills";
import { variants, type Variant } from "../variants";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(variants).map((variante) => ({ variante }));
}

type Props = { params: Promise<{ variante: string }> };

async function variantFrom({ params }: Props) {
  const { variante } = await params;
  if (!Object.hasOwn(variants, variante)) notFound();
  return variante as Variant;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: variants[await variantFrom(props)] + " · Carta celeste — Horizonte" };
}

export default async function ReadingPage(props: Props) {
  const variant = await variantFrom(props);
  const isMeridiano = variant === "meridiano";
  return (
    <main className={theme.theme + " " + fontVariables}>
      <HorizonteHero sectionLinks={isMeridiano ? { Experiência: "#experiencia", Habilidades: "#habilidades", IA: "#ia" } : undefined} />
      <Reading variant={variant} />
      {isMeridiano && (
        <>
          <Experience />
          <Skills />
        </>
      )}
      <ObservatorioProject />
      {isMeridiano && <Ai />}
    </main>
  );
}
