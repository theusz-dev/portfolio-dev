import { getProfile, profile } from "@/content/portfolio";
import { format, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Rich } from "@/i18n/Rich";
import { HorizonStrip, MoonPlate } from "./Sky";
import type { Variant } from "./variants";
import s from "./reading.module.css";

function Actions({ lang }: { lang: Locale }) {
  const me = getProfile(lang);
  return (
    <footer className={s.actions}>
      <a href={me.resume} download>{me.ctaResume} <span aria-hidden="true">↓</span></a>
      <a href={`mailto:${me.email}`}>{me.ctaContact} <span aria-hidden="true">↗</span></a>
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

function Meridiano({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <>
      <header className={s.meridianHead}>
        <p className={s.label}>{t.sections.about}</p>
        <h2 id="about-title"><Rich text={t.about.title} /></h2>
      </header>
      <div className={s.meridian}>
        <div className={s.ribbon} aria-hidden="true" data-dust-trail />
        {t.about.passages.map((passage) => (
          <section key={passage.title} className={s.passage}>
            <h3>{passage.title}</h3>
            <p><Rich text={format(passage.text, { timezone: profile.timezone })} /></p>
          </section>
        ))}
      </div>
    </>
  );
}

// Relevo and Luar are earlier prototypes and stay in Portuguese.
const readings: Record<Variant, (props: { lang: Locale }) => React.ReactNode> = { relevo: Relevo, luar: Luar, meridiano: Meridiano };

export function Reading({ variant, lang = "pt" }: { variant: Variant; lang?: Locale }) {
  const Content = readings[variant];
  return (
    <section id="sobre" className={s.reading} data-reading={variant} aria-labelledby="about-title">
      <Content lang={lang} />
      <Actions lang={lang} />
    </section>
  );
}
