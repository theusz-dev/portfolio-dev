import { FEATURED_COUNT, getProjects } from "@/content/projects";
import { format, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Rich } from "@/i18n/Rich";
import { ProjectGrid } from "./ProjectGrid";
import s from "./projects.module.css";

/** "Projetos": a card for every project; each opens its own page. Data: src/content/projects.ts. */
export function Projects({ id = "projetos", lang = "pt" }: { id?: string; lang?: Locale }) {
  const t = getDictionary(lang);
  const projects = getProjects(lang);
  return (
    <section id={id} className={s.section} aria-labelledby="projects-title">
      <header className={s.head}>
        <h2 id="projects-title">{t.sections.projects}</h2>
        <p className={s.statement}>
          <Rich text={t.projects.statement} />
        </p>
        <p className={s.count}>{format(t.projects.count, { count: String(projects.length).padStart(2, "0") })}</p>
      </header>

      <ProjectGrid projects={projects} featured={FEATURED_COUNT} lang={lang} t={t.projects} />
    </section>
  );
}
