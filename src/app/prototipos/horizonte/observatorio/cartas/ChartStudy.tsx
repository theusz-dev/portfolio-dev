"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { LocalClock } from "@/components/prototypes/LocalClock";
import { profile } from "@/content/portfolio";
import { POINTS, RINGS, type Point, type Ring } from "../carta/points";
import { variants, type Variant } from "./variants";
import s from "./studies.module.css";

const rings: Ring[] = ["agora", "ferramentas", "base"];

function pointsFor(ring: Ring) {
  return POINTS.filter(point => point.ring === ring);
}

function Actions() {
  return (
    <div className={s.actions}>
      <a href={profile.resume} download>{profile.ctaResume} <span aria-hidden="true">↓</span></a>
      <a href={`mailto:${profile.email}`}>{profile.ctaContact} <span aria-hidden="true">↗</span></a>
    </div>
  );
}

function Intro() {
  return (
    <header className={s.intro}>
      <p className={s.label}>Sobre</p>
      <h2 id="about-title">{profile.statement} <em>{profile.statementAccent}</em></h2>
      <p className={s.bio}>{profile.summary}</p>
      <Actions />
    </header>
  );
}

function Note({ point, title = true }: { point: Point; title?: boolean }) {
  return (
    <div className={s.note}>
      {title && <h3>{point.title}</h3>}
      <p>{point.text}</p>
      {point.clock && <small>Hora em Goiânia · <LocalClock /></small>}
    </div>
  );
}

function Orbit() {
  const [active, select] = useState(POINTS[0]);
  const points = pointsFor(active.ring);
  return (
    <div className={s.orbitLayout}>
      <Intro />
      <div className={s.explorer}>
        <div className={s.switcher} role="group" aria-label="Escolher órbita">
          {rings.map(ring =>
            <button type="button" key={ring} aria-pressed={active.ring === ring}
              onClick={() => select(pointsFor(ring)[0])}>{RINGS[ring].label}</button>
          )}
        </div>
        <div className={s.orbitMap} role="group" aria-label={RINGS[active.ring].label}>
          <div className={s.track} aria-hidden="true" />
          <div className={s.hub} aria-hidden="true">✦</div>
          {points.map((point, i) => {
            const angle = points.length === 2 ? (i * 180 - 32) : (i * 72 - 90);
            const theta = angle * Math.PI / 180;
            const position = {
              left: (50 + 32 * Math.cos(theta)) + "%",
              top: (50 + 34 * Math.sin(theta)) + "%",
            } satisfies CSSProperties;
            return <button key={point.id} type="button" className={s.satellite} style={position}
              aria-pressed={point.id === active.id} onClick={() => select(point)}>{point.title}</button>;
          })}
        </div>
        <div className={s.orbitNote} aria-live="polite"><Note point={active} /></div>
      </div>
    </div>
  );
}

function Columns() {
  return (
    <>
      <Intro />
      <div className={s.columns}>
        {rings.map(ring =>
          <section key={ring} className={s.column} aria-label={RINGS[ring].label}>
            <h3><span aria-hidden="true" />{RINGS[ring].label}</h3>
            {pointsFor(ring).map(point =>
              <details key={point.id} name={`column-${ring}`} open={point.id === "umobi"}>
                <summary>{point.title}<span aria-hidden="true" /></summary>
                <Note point={point} title={false} />
              </details>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function InWords() {
  const [active, select] = useState(POINTS[0]);
  function link(id: string) {
    const point = POINTS.find(item => item.id === id)!;
    return <button type="button" aria-pressed={point.id === active.id}
      onClick={() => select(point)}>{point.title}</button>;
  }
  const sentences: Record<Ring, ReactNode> = {
    agora: <>Estudo Engenharia de Computação na {link("ufg")} e trabalhei como full stack na {link("umobi")}.</>,
    ferramentas: <>No meu dia a dia uso {link("ts")}, {link("react")}, {link("flutter")}, {link("django")} e {link("laravel")}.</>,
    base: <>Minha base é {link("goiania")}. Estou disponível para trabalho {link("remoto")}.</>,
  };
  return (
    <>
      <header className={s.wordsHeading}>
        <p className={s.label}>Sobre</p>
        <h2 id="about-title">Um pouco sobre mim.</h2>
      </header>
      <div className={s.letter}>
        {rings.map(ring =>
          <section key={ring} className={s.paragraph} aria-label={RINGS[ring].label}>
            <h3 className={s.label}>{RINGS[ring].label}</h3>
            <p className={s.sentence}>{sentences[ring]}</p>
            {ring === active.ring && <aside className={s.annotation} aria-label="Nota do termo selecionado" aria-live="polite">
              <Note point={active}/>
            </aside>}
          </section>
        )}
      </div>
      <Actions />
    </>
  );
}

export function ChartStudy({ variant }: { variant: Variant }) {
  const studies = { orbita: Orbit, colunas: Columns, palavras: InWords };
  const Study = studies[variant];
  return (
    <section id="sobre" className={s.study} data-variant={variant} aria-labelledby="about-title">
      <Study />
      <nav className={s.compare} aria-label="Comparar variações da Carta celeste">
        <span>Comparar</span>
        {(Object.keys(variants) as Variant[]).map(key =>
          <a key={key} href={`/prototipos/horizonte/observatorio/cartas/${key}#sobre`}
            aria-current={key === variant ? "page" : undefined}>{variants[key]}</a>
        )}
      </nav>
    </section>
  );
}
