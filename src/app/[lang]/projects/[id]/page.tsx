import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfile } from "@/content/portfolio";
import { getProjects, projectIds } from "@/content/projects";
import { hasLocale, locales } from "@/i18n/config";
import { alternates } from "@/i18n/metadata";
import { fontVariables } from "../../../prototipos/horizonte/_components/fonts";
import theme from "../../../prototipos/horizonte/_components/theme.module.css";
import meridiano from "../../../prototipos/horizonte/observatorio/leituras/meridiano.module.css";
import { ProjectDetail } from "../../../prototipos/horizonte/observatorio/leituras/projects/ProjectDetail";
import { newsreader } from "../../../prototipos/horizonte/observatorio/leituras/textFont";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => projectIds.map((id) => ({ lang, id })));
}

type Props = { params: Promise<{ lang: string; id: string }> };

async function findProject({ params }: Props) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const projects = getProjects(lang);
  const index = projects.findIndex((project) => project.id === id);
  if (index < 0) notFound();
  return { lang, projects, index };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, projects, index } = await findProject(props);
  const project = projects[index];
  return {
    title: `${project.title} — ${getProfile(lang).shortName}`,
    description: project.summary,
    alternates: alternates(lang, `/projects/${project.id}`),
  };
}

export default async function ProjectPage(props: Props) {
  const { lang, projects, index } = await findProject(props);
  return (
    <main className={`${theme.theme} ${fontVariables} ${newsreader.variable} ${meridiano.meridiano}`}>
      <ProjectDetail
        lang={lang}
        project={projects[index]}
        number={index + 1}
        previous={projects[index - 1] ?? null}
        next={projects[index + 1] ?? null}
      />
    </main>
  );
}
