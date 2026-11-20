import type { Metadata } from "next";
import Image from "next/image";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import { ParticleTerrain } from "@/components/prototypes/ParticleTerrain";
import { profile, project } from "@/content/portfolio";
import s from "./horizonte.module.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "A · Horizonte — Protótipo do portfólio",
};

function SmallCaps({ word }: { word: string }) {
  return (
    <span className={s.word}>
      {word[0]}
      <span className={s.smallCap}>{word.slice(1)}</span>
    </span>
  );
}

const story = [
  { label: "Problema", text: project.problem },
  { label: "Solução", text: project.solution },
  { label: "Papel", text: project.role },
  { label: "Resultado", text: project.result },
];

export default function HorizontePage() {
  return (
    <main className={`${s.page} ${serif.variable} ${mono.variable}`}>
      <section className={s.hero} aria-labelledby="horizonte-title">
        <div className={s.frame}>
          <ParticleTerrain className={s.canvas} />
          <div className={s.moon} aria-hidden="true" />
          <div className={s.vignette} aria-hidden="true" />

          <header className={s.topbar}>
            <a href="#" className={s.mark}>
              {profile.shortName}
            </a>
            <nav className={s.nav} aria-label="Seções">
              {profile.sections.map((section) => (
                <a key={section} href={section === "Projetos" ? "#projeto" : "#"}>
                  {section}
                </a>
              ))}
            </nav>
            <a className={s.pill} href={`mailto:${profile.email}`}>
              {profile.ctaContact}
            </a>
          </header>

          <div className={s.center}>
            <p className={s.intro}>{profile.intro}</p>
            <h1 id="horizonte-title" className={s.name}>
              <SmallCaps word={profile.firstName} />{" "}
              <SmallCaps word={profile.lastName} />
            </h1>
            <p className={s.role}>
              <span className={s.bar} aria-hidden="true">|</span>
              <span>{profile.role}</span>
              <span className={s.sep} aria-hidden="true">·</span>
              <span>{profile.roleScope}</span>
              <span className={s.bar} aria-hidden="true">|</span>
            </p>
            <a className={s.ghost} href="#projeto">
              {profile.ctaPrimary}
            </a>
          </div>

          <footer className={s.bottombar}>
            <ul className={s.social}>
              {profile.social.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href="#sobre" className={s.scrollCue} aria-label="Rolar para a apresentação">
              <span />
            </a>
            <p className={s.where}>
              {profile.city} · Remoto
            </p>
          </footer>
        </div>
      </section>

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
