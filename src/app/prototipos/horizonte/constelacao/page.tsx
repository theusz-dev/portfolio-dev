import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Reveal } from "@/components/prototypes/Reveal";
import { ScrollScene } from "@/components/prototypes/ScrollScene";
import { profile, project } from "@/content/portfolio";
import { fontVariables } from "../_components/fonts";
import { HorizonteHero, SmallCaps } from "../_components/HorizonteHero";
import theme from "../_components/theme.module.css";
import s from "./constelacao.module.css";

export const metadata: Metadata = {
  title: "A1 · Constelação — Protótipo do portfólio",
};

const statementWords = `${profile.statement} ${profile.statementAccent}`.split(" ");
const summaryWords = profile.summary.split(" ");
const totalWords = statementWords.length + summaryWords.length;

// Star positions for the stack constellation (viewBox 600 × 360).
const stars = [
  { x: 70, y: 250, label: profile.topStack[0] },
  { x: 190, y: 110, label: profile.topStack[1] },
  { x: 330, y: 190, label: profile.topStack[2] },
  { x: 440, y: 70, label: profile.topStack[3] },
  { x: 540, y: 260, label: profile.topStack[4] },
];

const phases = [
  { label: "Problema", text: project.problem, phase: s.crescent },
  { label: "Solução", text: project.solution, phase: s.quarter },
  { label: "Papel", text: project.role, phase: s.gibbous },
  { label: "Resultado", text: project.result, phase: s.full },
];

const roman = ["I", "II", "III"];

function Words({ words, offset }: { words: string[]; offset: number }) {
  return words.map((word, i) => (
    <span key={`${word}-${i}`} className={s.w} style={{ "--i": offset + i } as CSSProperties}>
      {word}{" "}
    </span>
  ));
}

export default function ConstelacaoPage() {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <ScrollScene
        id="sobre"
        mode="pin"
        className={s.about}
        aria-label="Apresentação"
        style={{ "--n": totalWords } as CSSProperties}
      >
        <div className={s.aboutSticky}>
          <div className={s.risingMoon} aria-hidden="true" />
          <p className={s.label}>Sobre · I</p>
          <p className={s.statement}>
            <Words words={statementWords} offset={0} />
          </p>
          <p className={s.summary}>
            <Words words={summaryWords} offset={statementWords.length} />
          </p>
        </div>
      </ScrollScene>

      <section className={s.sky} aria-label="Em números e ferramentas">
        <Reveal as="dl" className={s.coords}>
          <div style={{ "--d": 0 } as CSSProperties}>
            <dt>Em produção</dt>
            <dd>
              <span className={s.figure}>2+</span> anos
            </dd>
          </div>
          <div style={{ "--d": 1 } as CSSProperties}>
            <dt>Disponibilidade</dt>
            <dd>
              <span className={s.figure}>100%</span> remoto
            </dd>
          </div>
          <div style={{ "--d": 2 } as CSSProperties}>
            <dt>Base</dt>
            <dd>
              <span className={s.figure}>16°40′S</span> {profile.city}
            </dd>
          </div>
        </Reveal>

        <Reveal className={s.constellation} threshold={0.35}>
          <p className={s.label}>Constelação de ferramentas</p>
          <svg viewBox="0 0 600 360" role="img" aria-label={`Stack principal: ${profile.topStack.join(", ")}`}>
            <polyline
              className={s.path}
              points={stars.map((star) => `${star.x},${star.y}`).join(" ")}
              pathLength={1}
            />
            {stars.map((star, i) => (
              <g key={star.label} className={s.star} style={{ "--d": i } as CSSProperties}>
                <circle cx={star.x} cy={star.y} r="18" className={s.halo} />
                <circle cx={star.x} cy={star.y} r="3.2" className={s.core} />
                <text x={star.x} y={star.y + (star.y > 180 ? 38 : -26)} textAnchor="middle">
                  {star.label}
                </text>
              </g>
            ))}
          </svg>
          <a className={s.ghost} href={profile.resume} download>
            {profile.ctaResume}
          </a>
        </Reveal>
      </section>

      <section id="projeto" className={s.project} aria-labelledby="constelacao-project">
        <header className={s.projectHead}>
          <p>
            <span>{project.index}</span> — Projeto em destaque
          </p>
          <p>
            {project.year} · {project.status}
          </p>
        </header>

        <ScrollScene as="div" className={s.orbitScene}>
          <h2 id="constelacao-project" className={s.projectTitle}>
            <SmallCaps word={project.title} />
          </h2>

          <div className={s.orbitStage}>
            <svg className={s.ringBack} viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="500" cy="150" rx="490" ry="140" />
              <circle r="5" className={s.satellite}>
                <animateMotion
                  dur="14s"
                  repeatCount="indefinite"
                  path="M 10 150 A 490 140 0 1 0 990 150 A 490 140 0 1 0 10 150"
                />
              </circle>
              <circle r="3" className={s.satellite}>
                <animateMotion
                  dur="14s"
                  begin="-7s"
                  repeatCount="indefinite"
                  path="M 10 150 A 490 140 0 1 0 990 150 A 490 140 0 1 0 10 150"
                />
              </circle>
            </svg>

            <figure className={s.screen}>
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                sizes="(max-width: 720px) 100vw, 1100px"
              />
            </figure>

            <svg className={s.ringFront} viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 10 150 A 490 140 0 0 0 990 150" />
            </svg>
          </div>

          <div className={s.projectIntro}>
            <p>{project.summary}</p>
            <div className={s.links}>
              <a className={s.pill} href={project.links.demo} target="_blank" rel="noreferrer">
                Ver demo <span aria-hidden="true">↗</span>
              </a>
              <a className={s.pillGhost} href={project.links.github} target="_blank" rel="noreferrer">
                Código <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </ScrollScene>

        <Reveal as="ol" className={s.phases} threshold={0.2}>
          {phases.map((item, i) => (
            <li key={item.label} style={{ "--d": i } as CSSProperties}>
              <span className={`${s.moon} ${item.phase}`} aria-hidden="true" />
              <span className={s.label}>
                0{i + 1} · {item.label}
              </span>
              <p>{item.text}</p>
            </li>
          ))}
        </Reveal>

        <div className={s.closing}>
          <Reveal as="ol" className={s.highlights}>
            {project.highlights.map((item, i) => (
              <li key={item} style={{ "--d": i } as CSSProperties}>
                <span className={s.roman}>{roman[i]}</span>
                <span>{item}</span>
              </li>
            ))}
          </Reveal>
          <div className={s.stackBlock}>
            <p className={s.label}>Stack</p>
            <ul className={s.chips}>
              {project.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
