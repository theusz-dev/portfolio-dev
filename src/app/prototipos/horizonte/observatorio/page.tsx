import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { LocalClock } from "@/components/prototypes/LocalClock";
import { ParticleSphere } from "@/components/prototypes/ParticleSphere";
import { Reveal } from "@/components/prototypes/Reveal";
import { profile } from "@/content/portfolio";
import { fontVariables } from "../_components/fonts";
import { HorizonteHero } from "../_components/HorizonteHero";
import theme from "../_components/theme.module.css";
import { ObservatorioProject } from "./_components/ObservatorioProject";
import s from "./observatorio.module.css";

export const metadata: Metadata = {
  title: "A3 · Observatório — Protótipo do portfólio",
};

const [whoSentence, ...rest] = profile.summary.split(". ");
const workSentence = rest.join(". ");

const log = [
  { label: "Identificação", text: `${whoSentence}.` },
  { label: "Atividade", text: workSentence },
  { label: "Ferramentas", text: profile.topStack.join(" · ") },
  { label: "Disponibilidade", text: `${profile.availability}. ${profile.yearsExperience} em produção.` },
];

export default function ObservatorioPage() {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <section id="sobre" className={s.journal} aria-labelledby="observatorio-about">
        <div className={s.scope}>
          <div className={s.lensWrap}>
            <div className={s.lens}>
              <ParticleSphere className={s.sphere} color="236, 232, 224" wobble={0.25} />
              <div className={s.reticle} aria-hidden="true" />
            </div>
            <span className={`${s.readout} ${s.rTop}`}>Obj · {profile.shortName}</span>
            <span className={`${s.readout} ${s.rRight}`}>49°15′O</span>
            <span className={`${s.readout} ${s.rBottom}`}>
              GYN <LocalClock />
            </span>
            <span className={`${s.readout} ${s.rLeft}`}>16°40′S</span>
          </div>
        </div>

        <div className={s.entries}>
          <p className={s.label}>Diário de observação</p>
          <h2 id="observatorio-about" className={s.statement}>
            {profile.statement} <em>{profile.statementAccent}</em>
          </h2>
          <Reveal as="ol" className={s.log} threshold={0.15}>
            {log.map((entry, i) => (
              <li key={entry.label} style={{ "--d": i } as CSSProperties}>
                <span className={s.logHead}>
                  <span>Registro 0{i + 1}</span>
                  <span>{entry.label}</span>
                </span>
                <p>{entry.text}</p>
              </li>
            ))}
          </Reveal>
          <a className={s.ghost} href={profile.resume} download>
            {profile.ctaResume}
          </a>
        </div>
      </section>

      <ObservatorioProject />
    </main>
  );
}
