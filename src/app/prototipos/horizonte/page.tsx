import type { Metadata } from "next";
import Image from "next/image";
import { fontVariables } from "./_components/fonts";
import { HorizonteHero, SmallCaps } from "./_components/HorizonteHero";
import theme from "./_components/theme.module.css";
import { profile, project } from "@/content/portfolio";
import s from "./horizonte.module.css";

export const metadata: Metadata = {
  title: "A · Horizonte — Protótipo do portfólio",
};

const story = [
  { label: "Problema", text: project.problem },
  { label: "Solução", text: project.solution },
  { label: "Papel", text: project.role },
  { label: "Resultado", text: project.result },
];

export default function HorizontePage() {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <section id="sobre" className={s.about} aria-label="Apresentação">
        <p className={s.statement}>
          {profile.statement} <em>{profile.statementAccent}</em>
        </p>
        <p className={s.summary}>{profile.summary}</p>
        <dl className={s.facts}>
          <div>
            <dt>Disponibilidade</dt>
            <dd>{profile.availability}</dd>
          </div>
          <div>
            <dt>Experiência</dt>
            <dd>{profile.yearsExperience} em produção</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{profile.topStack.join(" · ")}</dd>
          </div>
        </dl>
        <a className={s.ghost} href={profile.resume} download>
          {profile.ctaResume}
        </a>
      </section>

      <section id="projeto" className={s.project} aria-labelledby="horizonte-project">
        <header className={s.projectHead}>
          <p>
            <span>{project.index}</span> — Projeto em destaque
          </p>
          <p>
            {project.year} · {project.status}
          </p>
        </header>

        <figure className={s.screen}>
          <div className={s.screenMedia}>
            <Image
              src={project.image.src}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              sizes="(max-width: 720px) 100vw, 1200px"
            />
          </div>
          <figcaption className={s.screenCaption}>
            <h2 id="horizonte-project" className={s.projectTitle}>
              <SmallCaps word={project.title} />
            </h2>
            <p>{project.summary}</p>
            <div className={s.links}>
              <a className={s.pill} href={project.links.demo} target="_blank" rel="noreferrer">
                Ver demo <span aria-hidden="true">↗</span>
              </a>
              <a className={s.ghost} href={project.links.github} target="_blank" rel="noreferrer">
                Código <span aria-hidden="true">↗</span>
              </a>
            </div>
          </figcaption>
        </figure>

        <ol className={s.reel}>
          {story.map((item, i) => (
            <li key={item.label}>
              <span className={s.reelLabel}>
                0{i + 1} · {item.label}
              </span>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>

        <div className={s.details}>
          <div>
            <h3>Destaques</h3>
            <ul className={s.highlights}>
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Stack</h3>
            <p className={s.stack}>{project.stack.join("  ·  ")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
