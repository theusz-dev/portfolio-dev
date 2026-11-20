import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Reveal } from "@/components/prototypes/Reveal";
import { ScrollScene } from "@/components/prototypes/ScrollScene";
import { profile, project } from "@/content/portfolio";
import { fontVariables } from "../_components/fonts";
import { HorizonteHero, SmallCaps } from "../_components/HorizonteHero";
import theme from "../_components/theme.module.css";
import s from "./travessia.module.css";

export const metadata: Metadata = {
  title: "A2 · Travessia — Protótipo do portfólio",
};

const scenes = [
  { label: "Problema", text: project.problem, frame: s.frame0 },
  { label: "Solução", text: project.solution, frame: s.frame1 },
  { label: "Papel", text: project.role, frame: s.frame2 },
  { label: "Resultado", text: project.result, frame: s.frame3 },
];

const notes = [
  { label: "Disponibilidade", text: profile.availability },
  { label: "Experiência", text: `${profile.yearsExperience} em produção` },
  { label: "Base", text: profile.location },
  { label: "Stack", text: profile.topStack.join(" · ") },
];

const host = project.links.demo.replace("https://", "").replace(/\/$/, "");
const repo = project.links.github.replace("https://github.com/", "");

export default function TravessiaPage() {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <section id="sobre" className={s.chapter} aria-labelledby="travessia-about">
        <Reveal className={s.chapterMark}>
          <span className={s.label}>Capítulo I</span>
          <span className={s.rule} />
        </Reveal>

        <Reveal as="header" className={s.statement} threshold={0.4}>
          <h2 id="travessia-about">
            <span className={s.line}>
              <span>
                Código com <em>propósito</em>.
              </span>
            </span>
            <span className={s.line}>
              <span>
                Produtos com <em>identidade</em>.
              </span>
            </span>
          </h2>
        </Reveal>

        <div className={s.page}>
          <Reveal as="p" className={s.body}>
            {profile.summary}
          </Reveal>
          <Reveal as="dl" className={s.margin}>
            {notes.map((note, i) => (
              <div key={note.label} style={{ "--d": i } as CSSProperties}>
                <dt>{note.label}</dt>
                <dd>{note.text}</dd>
              </div>
            ))}
            <a className={s.ghost} href={profile.resume} download style={{ "--d": notes.length } as CSSProperties}>
              {profile.ctaResume}
            </a>
          </Reveal>
        </div>
      </section>

      <ScrollScene
        id="projeto"
        mode="pin"
        steps={scenes.length}
        className={s.sequence}
        aria-labelledby="travessia-project"
      >
        <div className={s.sticky}>
          <header className={s.seqHead}>
            <p className={s.label}>
              <span className={s.bright}>{project.index}</span> — Projeto em destaque
            </p>
            <h2 id="travessia-project" className={s.projectTitle}>
              <SmallCaps word={project.title} />
            </h2>
            <p className={`${s.label} ${s.timecode}`}>
              {scenes.map((scene, i) => (
                <span key={scene.label} data-scene={i}>
                  Cena 0{i + 1}
                </span>
              ))}
              <span> / 04</span>
            </p>
          </header>

          <div className={s.stage}>
            <figure className={s.screen}>
              <div className={s.lens}>
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  width={project.image.width}
                  height={project.image.height}
                  sizes="(max-width: 720px) 100vw, 1200px"
                  priority={false}
                />
              </div>
              <div className={s.letterbox} aria-hidden="true" />
            </figure>

            <div className={s.captions}>
              {scenes.map((scene, i) => (
                <div key={scene.label} className={s.caption} data-scene={i}>
                  <p className={s.label}>
                    0{i + 1} · {scene.label}
                  </p>
                  <p className={s.captionText}>{scene.text}</p>
                  {i === scenes.length - 1 && (
                    <div className={s.links}>
                      <a className={s.pill} href={project.links.demo} target="_blank" rel="noreferrer">
                        Ver demo <span aria-hidden="true">↗</span>
                      </a>
                      <a className={s.pillGhost} href={project.links.github} target="_blank" rel="noreferrer">
                        Código <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ol className={s.filmstrip} aria-label="Cenas do projeto">
            {scenes.map((scene, i) => (
              <li key={scene.label} data-scene={i}>
                <span className={`${s.thumb} ${scene.frame}`} aria-hidden="true" />
                <span className={s.thumbLabel}>{scene.label}</span>
              </li>
            ))}
            <span className={s.playhead} aria-hidden="true" />
          </ol>
        </div>
      </ScrollScene>

      <section className={s.credits} aria-label="Créditos do projeto">
        <Reveal as="dl" className={s.creditList} threshold={0.15}>
          <div style={{ "--d": 0 } as CSSProperties}>
            <dt>Projeto</dt>
            <dd>
              {project.title} · {project.summary}
            </dd>
          </div>
          <div style={{ "--d": 1 } as CSSProperties}>
            <dt>Destaques</dt>
            <dd>
              {project.highlights.map((item) => (
                <span key={item} className={s.creditLine}>
                  {item}
                </span>
              ))}
            </dd>
          </div>
          <div style={{ "--d": 2 } as CSSProperties}>
            <dt>Stack</dt>
            <dd className={s.mono}>{project.stack.join(" · ")}</dd>
          </div>
          <div style={{ "--d": 3 } as CSSProperties}>
            <dt>Em cartaz</dt>
            <dd>
              <a href={project.links.demo} target="_blank" rel="noreferrer">
                {host} ↗
              </a>
            </dd>
          </div>
          <div style={{ "--d": 4 } as CSSProperties}>
            <dt>Código</dt>
            <dd>
              <a href={project.links.github} target="_blank" rel="noreferrer">
                github.com/{repo} ↗
              </a>
            </dd>
          </div>
          <div style={{ "--d": 5 } as CSSProperties}>
            <dt>Ano</dt>
            <dd>
              {project.year} · {project.status}
            </dd>
          </div>
        </Reveal>
        <p className={s.next}>
          <span className={s.label}>A seguir</span>
          <span>Experiência</span>
        </p>
      </section>
    </main>
  );
}
