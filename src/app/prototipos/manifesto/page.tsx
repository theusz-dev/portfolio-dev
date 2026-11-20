import type { Metadata } from "next";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { profile, project } from "@/content/portfolio";
import s from "./manifesto.module.css";

const sans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "C · Manifesto — Protótipo do portfólio",
};

export default function ManifestoPage() {
  return (
    <main className={`${s.page} ${sans.variable}`}>
      <div className={s.light} aria-hidden="true" />

      <header className={s.navWrap}>
        <nav className={s.nav} aria-label="Principal">
          <a href="#" className={s.logo}>
            {profile.firstName.toLowerCase()}
            <span>.</span>
          </a>
          <ul className={s.links}>
            {profile.sections.map((section) => (
              <li key={section}>
                <a href={section === "Projetos" ? "#trabalho" : "#"}>{section}</a>
              </li>
            ))}
          </ul>
          <a className={s.navCta} href={profile.resume} download>
            {profile.ctaResume}
          </a>
        </nav>
      </header>

      <section className={s.hero} aria-labelledby="manifesto-title">
        <p className={s.tag}>
          <span className={s.pulse} aria-hidden="true" />
          {profile.city}, Brasil · Disponível para remoto
        </p>

        <h1 id="manifesto-title" className={s.headline}>
          <span>{profile.statement}</span>
          <span className={s.fade}>{profile.statementAccent}</span>
        </h1>

        <div className={s.lede}>
          <p className={s.summary}>
            <strong>Sou {profile.shortName}.</strong>{" "}
            {profile.summary}
          </p>
          <div className={s.actions}>
            <a className={s.primary} href="#trabalho">
              {profile.ctaPrimary}
            </a>
            <a className={s.secondary} href={`mailto:${profile.email}`}>
              {profile.ctaContact}
            </a>
          </div>
        </div>

        <ul className={s.proof}>
          <li>{profile.yearsExperience} em produção</li>
          <li>{profile.roleScope}</li>
          <li>{profile.topStack.join(" · ")}</li>
        </ul>
        <p className={s.scroll} aria-hidden="true">
          Rolar
        </p>
      </section>

      <section id="trabalho" className={s.work} aria-labelledby="manifesto-project">
        <div className={s.workHead}>
          <p className={s.eyebrow}>Trabalho selecionado</p>
          <p className={s.eyebrow}>
            {project.index} — {project.year}
          </p>
        </div>

        <div className={s.titleRow}>
          <h2 id="manifesto-project" className={s.projectTitle}>
            {project.title}
          </h2>
          <div className={s.titleAside}>
            <p className={s.status}>
              <span className={s.pulse} aria-hidden="true" />
              {project.status}
            </p>
            <p className={s.projectSummary}>{project.summary}</p>
            <div className={s.actions}>
              <a className={s.primary} href={project.links.demo} target="_blank" rel="noreferrer">
                Abrir demo <span aria-hidden="true">↗</span>
              </a>
              <a className={s.secondary} href={project.links.github} target="_blank" rel="noreferrer">
                Ver código
              </a>
            </div>
          </div>
        </div>

        <figure className={s.shot}>
          <div className={s.chrome} aria-hidden="true">
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
            <span className={s.url}>{project.links.demo.replace("https://", "").replace(/\/$/, "")}</span>
          </div>
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            sizes="(max-width: 720px) 100vw, 1360px"
          />
        </figure>

        <div className={s.caseGrid}>
          <div className={s.narrative}>
            <p className={s.eyebrow}>O problema</p>
            <p className={s.big}>{project.problem}</p>
            <p className={s.eyebrow}>A resposta</p>
            <p className={`${s.big} ${s.dim}`}>{project.solution}</p>
          </div>

          <dl className={s.facts}>
            <div>
              <dt>Papel</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Destaques</dt>
              <dd>
                <ol className={s.highlights}>
                  {project.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>
                <ul className={s.chips}>
                  {project.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Resultado</dt>
              <dd>{project.result}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
