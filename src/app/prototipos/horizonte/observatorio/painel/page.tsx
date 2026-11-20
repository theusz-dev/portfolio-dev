import type { Metadata } from "next";
import { profile } from "@/content/portfolio";
import { fontVariables } from "../../_components/fonts";
import { HorizonteHero } from "../../_components/HorizonteHero";
import theme from "../../_components/theme.module.css";
import { ObservatorioProject } from "../_components/ObservatorioProject";
import { GoianiaTime, GraduationProgress, MoonToday, SpotlightGrid } from "./Instruments";
import s from "./painel.module.css";

export const metadata: Metadata = {
  title: "A3.3 · Painel — Protótipo do portfólio",
};

export default function PainelPage() {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <section id="sobre" className={s.about} aria-labelledby="painel-title">
        <header className={s.head}>
          <p className={s.label}>Painel de instrumentos</p>
          <p className={s.label}>
            {profile.coordinates} · {profile.timezone}
          </p>
        </header>

        <SpotlightGrid className={s.grid}>
          <article className={`${s.card} ${s.intro}`} data-card>
            <p className={s.label}>Sobre</p>
            <h2 id="painel-title" className={s.statement}>
              {profile.statement} <em>{profile.statementAccent}</em>
            </h2>
            <p className={s.summary}>{profile.summary}</p>
            <div className={s.actions}>
              <a className={s.solid} href={profile.resume} download>
                {profile.ctaResume}
              </a>
              <a className={s.ghost} href={`mailto:${profile.email}`}>
                {profile.ctaContact}
              </a>
            </div>
          </article>

          <article className={`${s.card} ${s.sky}`} data-card>
            <div>
              <p className={s.label}>{profile.city}, agora</p>
              <GoianiaTime />
            </div>
            <MoonToday />
          </article>

          <article className={`${s.card} ${s.status}`} data-card>
            <p className={s.label}>Disponibilidade</p>
            <p className={s.signal}>
              <span className={s.pulse} aria-hidden="true" />
              100% remoto
            </p>
            <p className={s.cardText}>{profile.availability}.</p>
            <a className={s.mail} href={`mailto:${profile.email}`}>
              {profile.email} <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className={`${s.card} ${s.edu}`} data-card>
            <p className={s.label}>Formação</p>
            <p className={s.cardTitle}>{profile.education.short}</p>
            <p className={s.cardText}>{profile.education.degree}</p>
            <GraduationProgress start={profile.education.start} endLabel={profile.education.expectedShort} />
          </article>

          <article className={`${s.card} ${s.exp}`} data-card>
            <p className={s.label}>Em produção</p>
            <p className={s.figure}>
              2+<span>anos</span>
            </p>
            <p className={s.cardText}>
              Desde 2024: CETT/UFG e {profile.company}. Hoje, full stack na {profile.company}.
            </p>
          </article>

          <article className={`${s.card} ${s.stack}`} data-card>
            <p className={s.label}>Stack principal</p>
            <ol className={s.stackList}>
              {profile.topStack.map((tech, i) => (
                <li key={tech}>
                  <span>0{i + 1}</span>
                  {tech}
                </li>
              ))}
            </ol>
          </article>
        </SpotlightGrid>
      </section>

      <ObservatorioProject />
    </main>
  );
}
