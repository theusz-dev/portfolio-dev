import { profile } from "@/content/portfolio";
import { HorizonStrip, MoonPlate } from "./Sky";
import type { Variant } from "./variants";
import s from "./reading.module.css";

function Actions() {
  return (
    <footer className={s.actions}>
      <a href={profile.resume} download>{profile.ctaResume} <span aria-hidden="true">↓</span></a>
      <a href={`mailto:${profile.email}`}>{profile.ctaContact} <span aria-hidden="true">↗</span></a>
    </footer>
  );
}

function Relevo() {
  return (
    <>
      <div className={s.panorama}>
        <header>
          <p className={s.label}>Sobre</p>
          <h2 id="about-title">Da interface <em>à entrega.</em></h2>
          <p className={s.lead}>Sou desenvolvedor full stack e estudante de Engenharia de Computação na UFG.</p>
        </header>
        <HorizonStrip />
      </div>
      <div className={s.fieldNotes}>
        <div><h3>Experiência</h3><p>Na Umobi, desenvolvi aplicativos em Flutter para Android e iOS, interfaces em Angular e painéis administrativos com Laravel.</p></div>
        <div><h3>Ferramentas</h3><p>{profile.topStack.join(" · ")}</p></div>
        <div><h3>Base</h3><p>Goiânia, Goiás.<br />{profile.availability}.</p></div>
      </div>
    </>
  );
}

function Luar() {
  return (
    <div className={s.luar}>
      <div className={s.letter}>
        <p className={s.label}>Sobre</p>
        <h2 id="about-title">De Goiânia,<br /><em>para a web e o mobile.</em></h2>
        <p>Na <strong>Umobi</strong>, desenvolvi e mantive aplicativos para Android e iOS. Hoje curso Engenharia de Computação na <strong>UFG</strong>.</p>
        <p>Uso <strong>Flutter</strong> nos aplicativos e <strong>TypeScript</strong> com <strong>React / Next.js</strong> na web. Nos sistemas de back-end, trabalho com <strong>Python / Django</strong> e <strong>Laravel</strong>.</p>
        <p className={s.availability}>{profile.availability}.</p>
      </div>
      <figure className={s.lunarFigure}>
        <MoonPlate />
        <figcaption><span>{profile.location}</span><span>{profile.coordinates}</span></figcaption>
      </figure>
    </div>
  );
}

function Meridiano() {
  return (
    <>
      <header className={s.meridianHead}>
        <p className={s.label}>Sobre</p>
        <h2 id="about-title">Meu trabalho, <em>hoje.</em></h2>
      </header>
      <div className={s.meridian}>
        <div className={s.ribbon} aria-hidden="true" />
        <section className={s.passage}>
          <h3>Agora</h3>
          <p>Curso Engenharia de Computação na <strong>UFG</strong>. Minha experiência mais recente foi na <strong>Umobi</strong>, onde desenvolvi aplicativos em Flutter e interfaces web em Angular.</p>
        </section>
        <section className={s.passage}>
          <h3>Ferramentas</h3>
          <p>Do <strong>Flutter</strong> nos apps ao <strong>TypeScript</strong> e <strong>React / Next.js</strong> na web. Nos serviços que sustentam essas interfaces, uso <strong>Python / Django</strong> e <strong>Laravel</strong>.</p>
        </section>
        <section className={s.passage}>
          <h3>Base</h3>
          <p>Minha base é <strong>Goiânia</strong>, no fuso {profile.timezone}. Estou disponível para trabalho <strong>100% remoto</strong>.</p>
        </section>
      </div>
    </>
  );
}

const readings = { relevo: Relevo, luar: Luar, meridiano: Meridiano };

export function Reading({ variant }: { variant: Variant }) {
  const Content = readings[variant];
  return (
    <section id="sobre" className={s.reading} data-reading={variant} aria-labelledby="about-title">
      <Content />
      <Actions />
    </section>
  );
}
