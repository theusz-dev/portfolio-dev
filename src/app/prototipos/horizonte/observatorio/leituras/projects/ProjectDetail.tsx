import Link from "next/link";
import { profile } from "@/content/portfolio";
import type { Project } from "@/content/projects";
import { Carousel } from "./Carousel";
import { ProjectLinks, projectHref, toList } from "./ProjectLinks";
import p from "./project-page.module.css";
import s from "./projects.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  project: Project;
  number: number;
  previous: Project | null;
  next: Project | null;
};

/** A project's own page: written to be read calmly, top to bottom. */
export function ProjectDetail({ project, number, previous, next }: Props) {
  const story = [
    { label: "O problema", text: project.problem },
    { label: "A solução", text: project.solution },
    { label: "Meu papel", text: project.role },
    { label: "O resultado", text: project.result },
  ];
  const gallery = project.gallery.length ? project.gallery : toList(project.cover);

  return (
    <div className={p.shell}>
      <nav className={p.topbar} aria-label="Navegação">
        <Link href="/#projetos" className={p.back}>
          <span aria-hidden="true">←</span> Todos os projetos
        </Link>
        <Link href="/" className={p.brand}>
          {profile.shortName}
        </Link>
      </nav>

      <header className={p.header}>
        <p className={s.meta}>
          <span>{pad(number)}</span> {project.year} · {project.status}
        </p>
        <h1 className={p.title}>{project.title}</h1>
        <p className={p.lead}>{project.summary}</p>
        <div className={p.headerFoot}>
          <ProjectLinks project={project} variant="pills" />
        </div>
      </header>

      <Carousel media={gallery} title={project.title} />

      <div className={p.body}>
        <div className={p.story}>
          {story.map((part, i) => (
            <section key={part.label} className={p.part}>
              <h2>
                <span>{pad(i + 1)}</span> {part.label}
              </h2>
              <p>{part.text}</p>
            </section>
          ))}
        </div>

        <aside className={p.aside} aria-label="Ficha do projeto">
          <dl className={p.card}>
            <div>
              <dt>Ano</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
          </dl>

          <h2 className={s.sideLabel}>Destaques</h2>
          <ul className={s.highlights}>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className={s.sideLabel}>Tecnologias</h2>
          <ul className={s.chips}>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </aside>
      </div>

      <nav className={p.pager} aria-label="Outros projetos">
        {previous ? (
          <Link href={projectHref(previous.id)} className={p.pagerLink}>
            <span className={p.pagerLabel}>
              <span aria-hidden="true">←</span> Projeto anterior
            </span>
            <span className={p.pagerTitle}>{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={projectHref(next.id)} className={`${p.pagerLink} ${p.pagerNext}`}>
            <span className={p.pagerLabel}>
              Próximo projeto <span aria-hidden="true">→</span>
            </span>
            <span className={p.pagerTitle}>{next.title}</span>
          </Link>
        )}
      </nav>

      <footer className={p.closing}>
        <p>
          Quer conversar sobre este projeto ou sobre uma vaga? <em>Respondo rápido.</em>
        </p>
        <div className={p.closingActions}>
          <a className={s.pill} href={`mailto:${profile.email}`}>
            {profile.ctaContact} <span aria-hidden="true">↗</span>
          </a>
          <Link className={s.pillGhost} href="/#projetos">
            Ver todos os projetos
          </Link>
        </div>
      </footer>
    </div>
  );
}
