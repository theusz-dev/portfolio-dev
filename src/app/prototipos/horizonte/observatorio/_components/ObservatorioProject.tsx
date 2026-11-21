import Image from "next/image";
import { ScrollScene } from "@/components/prototypes/ScrollScene";
import { project } from "@/content/portfolio";
import { SmallCaps } from "../../_components/HorizonteHero";
import { Hotspots, type Hotspot } from "./Hotspots";
import s from "./project.module.css";

// Positions are percentages of the Orbit screenshot (1920 × 1080).
const points: Hotspot[] = [
  {
    x: 49.8,
    y: 27.5,
    title: "Busca unificada",
    text: "Filtra os atalhos visíveis ou pesquisa na web com Enter; Tab troca o provedor.",
  },
  {
    x: 30.5,
    y: 40,
    title: "Espaços de trabalho",
    text: "Categorias como Dev, Trabalho, Estudo e Projetos separam os atalhos por contexto.",
  },
  {
    x: 52.5,
    y: 57,
    title: "Atalhos arrastáveis",
    text: project.highlights[2],
  },
  {
    x: 97.4,
    y: 3.6,
    title: "Temas e layouts",
    text: project.highlights[1],
    align: "left",
  },
];

const sheet = [
  { label: "Problema", text: project.problem },
  { label: "Solução", text: project.solution },
  { label: "Papel", text: project.role },
  { label: "Resultado", text: project.result },
];

/**
 * The approved featured-project presentation: the screenshot opens through a
 * circular aperture as the visitor scrolls, then gains clickable hotspots.
 */
export function ObservatorioProject({ id = "projeto" }: { id?: string }) {
  return (
    <>
      <ScrollScene id={id} mode="pin" steps={5} className={s.observation} aria-labelledby="observatorio-project">
        <div className={s.sticky}>
          <header className={s.obsHead}>
            <p className={s.label}>
              <span className={s.bright}>{project.index}</span> — Objeto observado
            </p>
            <h2 id="observatorio-project" className={s.projectTitle}>
              <SmallCaps word={project.title} />
            </h2>
            <p className={`${s.label} ${s.aperture}`}>
              Abertura <span className={s.apertureBar} />
            </p>
          </header>

          <div className={s.viewport}>
            <div className={s.apertureGlow}>
              <figure className={s.screen}>
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  width={project.image.width}
                  height={project.image.height}
                  sizes="(max-width: 720px) 100vw, 1200px"
                />
              </figure>
            </div>
            <span className={s.badge}>{project.highlights[0]}</span>
            <Hotspots points={points} />
          </div>

          <p className={s.summaryLine}>{project.summary}</p>
        </div>
      </ScrollScene>

      <section className={s.findings} aria-label="Notas e ficha do projeto">
        <ol className={s.notes}>
          {points.map((point, i) => (
            <li key={point.title}>
              <span className={s.noteNum}>{i + 1}</span>
              <div>
                <p className={s.noteTitle}>{point.title}</p>
                <p>{point.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className={s.sheet}>
          {sheet.map((row, i) => (
            <div key={row.label}>
              <dt>
                <span>0{i + 1}</span> {row.label}
              </dt>
              <dd>{row.text}</dd>
            </div>
          ))}
        </dl>

        <div className={s.sheetFoot}>
          <ul className={s.chips}>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <div className={s.links}>
            <a className={s.pill} href={project.links.demo} target="_blank" rel="noreferrer">
              Ver demo <span aria-hidden="true">↗</span>
            </a>
            <a className={s.pillGhost} href={project.links.github} target="_blank" rel="noreferrer">
              Código <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
