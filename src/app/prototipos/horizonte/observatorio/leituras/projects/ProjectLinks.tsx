import type { Project, ProjectMedia } from "@/content/projects";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import s from "./projects.module.css";

/** Where a project's own page lives. */
export const projectHref = (lang: Locale, id: string) => href(lang, `/projects/${id}`);

export function toList(media: ProjectMedia | ProjectMedia[]) {
  return Array.isArray(media) ? media : [media];
}

/** Site and GitHub links; says so when the code is private. */
export function ProjectLinks({
  project,
  variant,
  t,
}: {
  project: Project;
  variant: "text" | "pills";
  t: Pick<Dictionary["projects"], "site" | "github" | "private">;
}) {
  const { site, github } = project.links;
  const linkClass = variant === "pills" ? s.pill : s.textLink;
  if (!site && !github) return <p className={s.private}>{t.private}</p>;
  return (
    <div className={variant === "pills" ? s.pills : s.cardLinks}>
      {site && (
        <a className={linkClass} href={site} target="_blank" rel="noreferrer">
          {t.site} <span aria-hidden="true">↗</span>
        </a>
      )}
      {github && (
        <a className={variant === "pills" ? s.pillGhost : s.textLink} href={github} target="_blank" rel="noreferrer">
          {t.github} <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}
