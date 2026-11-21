import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile } from "@/content/portfolio";
import { visibleProjects } from "@/content/projects";
import { fontVariables } from "../../prototipos/horizonte/_components/fonts";
import theme from "../../prototipos/horizonte/_components/theme.module.css";
import meridiano from "../../prototipos/horizonte/observatorio/leituras/meridiano.module.css";
import { ProjectDetail } from "../../prototipos/horizonte/observatorio/leituras/projects/ProjectDetail";
import { newsreader } from "../../prototipos/horizonte/observatorio/leituras/textFont";

export const dynamicParams = false;

export function generateStaticParams() {
  return visibleProjects.map((project) => ({ id: project.id }));
}

type Props = { params: Promise<{ id: string }> };

async function findProject({ params }: Props) {
  const { id } = await params;
  const index = visibleProjects.findIndex((project) => project.id === id);
  if (index < 0) notFound();
  return index;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const project = visibleProjects[await findProject(props)];
  return {
    title: `${project.title} — ${profile.shortName}`,
    description: project.summary,
  };
}

export default async function ProjectPage(props: Props) {
  const index = await findProject(props);
  return (
    <main className={`${theme.theme} ${fontVariables} ${newsreader.variable} ${meridiano.meridiano}`}>
      <ProjectDetail
        project={visibleProjects[index]}
        number={index + 1}
        previous={visibleProjects[index - 1] ?? null}
        next={visibleProjects[index + 1] ?? null}
      />
    </main>
  );
}
