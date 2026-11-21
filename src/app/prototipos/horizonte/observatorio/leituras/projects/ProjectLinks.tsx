import type { Project, ProjectMedia } from "@/content/projects";
import s from "./projects.module.css";

/** Where a project's own page lives. */
export const projectHref = (id: string) => `/projetos/${id}`;

export function toList(media: ProjectMedia | ProjectMedia[]) {
  return Array.isArray(media) ? media : [media];
}

/** Site and GitHub links; says so when the code is private. */
export function ProjectLinks({ project, variant }: { project: Project; variant: "text" | "pills" }) {
  const { site, github } = project.links;
  const linkClass = variant === "pills" ? s.pill : s.textLink;
  if (!site && !github) return <p className={s.private}>Código e site privados</p>;
  return (
    <div className={variant === "pills" ? s.pills : s.cardLinks}>
      {site && (
        <a className={linkClass} href={site} target="_blank" rel="noreferrer">
          Site <span aria-hidden="true">↗</span>
        </a>
      )}
      {github && (
        <a className={variant === "pills" ? s.pillGhost : s.textLink} href={github} target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}
