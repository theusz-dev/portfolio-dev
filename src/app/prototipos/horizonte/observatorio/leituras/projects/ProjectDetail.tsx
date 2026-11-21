import Link from "next/link";
import { getProfile } from "@/content/portfolio";
import type { Project } from "@/content/projects";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { Rich } from "@/i18n/Rich";
import { Carousel } from "./Carousel";
import { ProjectLinks, projectHref, toList } from "./ProjectLinks";
import p from "./project-page.module.css";
import s from "./projects.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  lang: Locale;
  project: Project;
  number: number;
  previous: Project | null;
  next: Project | null;
};

/** A project's own page: written to be read calmly, top to bottom. */
export function ProjectDetail({ lang, project, number, previous, next }: Props) {
  const profile = getProfile(lang);
  const dict = getDictionary(lang);
  const t = dict.project;
  const allProjects = href(lang, "/#projetos");
  const story = [
    { label: t.story.problem, text: project.problem },
    { label: t.story.solution, text: project.solution },
    { label: t.story.role, text: project.role },
    { label: t.story.result, text: project.result },
  ];
  const gallery = project.gallery.length ? project.gallery : toList(project.cover);

  return (
    <div className={p.shell}>
      <nav className={p.topbar} aria-label={t.navLabel}>
        <Link href={allProjects} className={p.back}>
          <span aria-hidden="true">←</span> {t.all}
        </Link>
        <div className={p.topbarEnd}>
          <LanguageSwitch className={p.language} lang={lang} label={dict.language.label} names={dict.language.names} />
          <Link href={href(lang)} className={p.brand}>
            {profile.shortName}
          </Link>
        </div>
      </nav>

      <header className={p.header}>
        <p className={s.meta}>
          <span>{pad(number)}</span> {project.year} · {project.status}
        </p>
        <h1 className={p.title}>{project.title}</h1>
        <p className={p.lead}>{project.summary}</p>
        <div className={p.headerFoot}>
          <ProjectLinks project={project} variant="pills" t={dict.projects} />
        </div>
      </header>

      <Carousel media={gallery} title={project.title} t={dict.carousel} />

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

        <aside className={p.aside} aria-label={t.factsLabel}>
          <dl className={p.card}>
            <div>
              <dt>{t.year}</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>{t.status}</dt>
              <dd>{project.status}</dd>
            </div>
          </dl>

          <h2 className={s.sideLabel}>{t.highlights}</h2>
          <ul className={s.highlights}>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className={s.sideLabel}>{t.stack}</h2>
          <ul className={s.chips}>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </aside>
      </div>

      <nav className={p.pager} aria-label={t.pagerLabel}>
        {previous ? (
          <Link href={projectHref(lang, previous.id)} className={p.pagerLink}>
            <span className={p.pagerLabel}>
              <span aria-hidden="true">←</span> {t.previous}
            </span>
            <span className={p.pagerTitle}>{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={projectHref(lang, next.id)} className={`${p.pagerLink} ${p.pagerNext}`}>
            <span className={p.pagerLabel}>
              {t.next} <span aria-hidden="true">→</span>
            </span>
            <span className={p.pagerTitle}>{next.title}</span>
          </Link>
        )}
      </nav>

      <footer className={p.closing}>
        <p>
          <Rich text={t.closing} />
        </p>
        <div className={p.closingActions}>
          <a className={s.pill} href={`mailto:${profile.email}`}>
            {profile.ctaContact} <span aria-hidden="true">↗</span>
          </a>
          <Link className={s.pillGhost} href={allProjects}>
            {t.seeAll}
          </Link>
        </div>
      </footer>
    </div>
  );
}
