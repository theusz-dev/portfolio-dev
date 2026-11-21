import type { ReactNode } from "react";
import { profile } from "@/content/portfolio";
import { fontVariables } from "../../_components/fonts";
import { HorizonteHero } from "../../_components/HorizonteHero";
import theme from "../../_components/theme.module.css";
import { ObservatorioProject } from "../_components/ObservatorioProject";
import { CartaCeleste } from "./CartaCeleste";
import s from "./carta.module.css";

export default function CartaLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`${theme.theme} ${fontVariables}`}>
      <HorizonteHero />

      <section id="sobre" className={s.about} aria-labelledby="carta-title">
        <div className={s.text}>
          <p className={s.label}>Carta celeste</p>
          <h2 id="carta-title" className={s.statement}>
            {profile.statement} <em>{profile.statementAccent}</em>
          </h2>
          <p className={s.summary}>{profile.summary}</p>
          <div className={s.actions}>
            <a className={s.ghost} href={profile.resume} download>
              {profile.ctaResume}
            </a>
            <a className={s.link} href={`mailto:${profile.email}`}>
              {profile.ctaContact} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <CartaCeleste />
      </section>

      <ObservatorioProject />
      {children}
    </main>
  );
}
