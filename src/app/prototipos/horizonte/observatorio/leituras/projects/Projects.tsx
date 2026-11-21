import { FEATURED_COUNT, visibleProjects } from "@/content/projects";
import { ProjectGrid } from "./ProjectGrid";
import s from "./projects.module.css";

/** "Projetos": cards for every project, details in a dialog. Data: src/content/projects.ts. */
export function Projects({ id = "projetos" }: { id?: string }) {
  return (
    <section id={id} className={s.section} aria-labelledby="projects-title">
      <header className={s.head}>
        <h2 id="projects-title">Projetos</h2>
        <p className={s.statement}>
          Produtos que <em>criei do zero</em> e funcionalidades que <em>entreguei em produção</em>.
        </p>
        <p className={s.count}>
          {String(visibleProjects.length).padStart(2, "0")} projetos
        </p>
      </header>

      <ProjectGrid projects={visibleProjects} featured={FEATURED_COUNT} />
    </section>
  );
}
