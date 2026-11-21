import type { Metadata } from "next";
import experience from "@/content/experience.json";
import skills from "@/content/skills.json";
import s from "./percurso.module.css";

export const metadata: Metadata = {
  title: "Percurso · Experiência e habilidades — Horizonte",
};

const monthFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function periodLabel(month: string) {
  return monthFormat.format(new Date(month + "-01T00:00:00Z"));
}

export default function PercursoPage() {
  return (
    <>
      <section id="experiencia" className={s.section} aria-labelledby="experience-title">
        <header className={s.heading}>
          <h2 id="experience-title">Experiência</h2>
          <a href="#habilidades">Habilidades <span aria-hidden="true">↓</span></a>
        </header>
        <ol className={s.records}>
          {experience.map((job) => (
            <li key={job.id}>
              <details className={s.record} open={job.period.end === null}>
                <summary>
                  <span className={s.period}>
                    <time dateTime={job.period.start}>{periodLabel(job.period.start)}</time>
                    {" — "}
                    {job.period.end ? <time dateTime={job.period.end}>{periodLabel(job.period.end)}</time> : "atual"}
                  </span>
                  <span className={s.job}>
                    <span className={s.company}>{job.company}</span>
                    <span className={s.role}>{job.role.pt}</span>
                  </span>
                  <span className={s.toggle} aria-hidden="true" />
                </summary>
                <div className={s.detail}>
                  <ul className={s.highlights}>
                    {job.highlights.pt.map((text) => <li key={text}>{text}</li>)}
                  </ul>
                  <p className={s.stack}>{job.stack.join(" · ")}</p>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
      <section id="habilidades" className={s.section} aria-labelledby="skills-title">
        <header className={s.heading}>
          <h2 id="skills-title">Habilidades</h2>
          <a href="#experiencia">Experiência <span aria-hidden="true">↑</span></a>
        </header>
        <dl className={s.skills}>
          {skills.map((group) => (
            <div key={group.id}>
              <dt>{group.category.pt}</dt>
              <dd>
                <ul aria-label={group.category.pt}>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
