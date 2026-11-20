import type { Metadata } from "next";
import { LocalClock } from "@/components/prototypes/LocalClock";
import { profile } from "@/content/portfolio";
import { fontVariables } from "../../_components/fonts";
import { HorizonteHero } from "../../_components/HorizonteHero";
import theme from "../../_components/theme.module.css";
import { ObservatorioProject } from "../_components/ObservatorioProject";
import s from "./eclipse.module.css";

export const metadata: Metadata = {
  title: "A3.2 · Eclipse — Protótipo do portfólio",
};

const [firstSentence, ...rest] = profile.summary.split(". ");
const restSentences = rest.join(". ");
// Index of the milestone that represents "now" (Umobi, 2026).
const NOW = 2;

export default function EclipsePage() {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <section id="sobre" className={s.about} aria-labelledby="eclipse-title">
        <div className={s.top}>
          <div className={s.text}>
            <p className={s.label}>Sobre</p>
            <h2 id="eclipse-title" className={s.statement}>
              <span>{profile.statement}</span>
              <em>{profile.statementAccent}</em>
            </h2>
            <p className={s.summary}>
              <strong>{firstSentence}.</strong> {restSentences}
            </p>
            <div className={s.actions}>
              <p className={s.status}>
                <span className={s.pulse} aria-hidden="true" />
                {profile.availability}
              </p>
              <a className={s.ghost} href={profile.resume} download>
                {profile.ctaResume}
              </a>
            </div>
          </div>

          <figure className={s.eclipse}>
            <div className={s.sky} aria-hidden="true">
              <span className={s.corona} />
              <span className={s.coronaSoft} />
              <span className={s.disc} />
              <span className={s.bead} />
            </div>
            <figcaption>
              <span>
                {profile.city} · {profile.coordinates}
              </span>
              <span>
                GYN <LocalClock /> · {profile.timezone}
              </span>
            </figcaption>
          </figure>
        </div>

        <div className={s.horizon}>
          <p className={s.label}>Trajetória</p>
          <ol className={s.timeline}>
            {profile.milestones.map((m, i) => (
              <li
                key={m.when}
                className={s.milestone}
                data-state={i < NOW ? "past" : i === NOW ? "now" : "next"}
              >
                <span className={s.when}>{m.when}</span>
                <span className={s.mark} aria-hidden="true" />
                <span className={s.where}>
                  {m.place}
                  {i === NOW && <span className={s.nowTag}>Agora</span>}
                </span>
                <span className={s.title}>{m.title}</span>
                <span className={s.text2}>{m.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ObservatorioProject />
    </main>
  );
}
