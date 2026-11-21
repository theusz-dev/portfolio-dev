import { ParticleTerrain } from "@/components/prototypes/ParticleTerrain";
import { profile } from "@/content/portfolio";
import s from "./hero.module.css";

export function SmallCaps({ word, className }: { word: string; className?: string }) {
  return (
    <span className={`${s.word} ${className ?? ""}`}>
      {word[0]}
      <span className={s.smallCap}>{word.slice(1)}</span>
    </span>
  );
}

/** The approved Horizonte opening, shared by every variation. */
export function HorizonteHero({
  aboutId = "sobre",
  projectId = "projeto",
  sectionLinks,
}: {
  aboutId?: string;
  projectId?: string;
  sectionLinks?: Partial<Record<(typeof profile.sections)[number], string>>;
}) {
  const destinations = { Projetos: `#${projectId}`, ...sectionLinks };
  return (
    <section className={s.hero} aria-labelledby="horizonte-title">
      <div className={s.frame}>
        <ParticleTerrain className={s.canvas} />
        <div className={s.moon} aria-hidden="true" />
        <div className={s.vignette} aria-hidden="true" />

        <header className={s.topbar}>
          <a href="#" className={s.mark}>
            {profile.shortName}
          </a>
          <nav className={s.nav} aria-label="Seções">
            {profile.sections.map((section) => (
              <a key={section} href={destinations[section] ?? "#"}>
                {section}
              </a>
            ))}
          </nav>
          <a className={s.pill} href={`mailto:${profile.email}`}>
            {profile.ctaContact}
          </a>
        </header>

        <div className={s.center}>
          <p className={s.intro}>{profile.intro}</p>
          <h1 id="horizonte-title" className={s.name}>
            <SmallCaps word={profile.firstName} /> <SmallCaps word={profile.lastName} />
          </h1>
          <p className={s.role}>
            <span className={s.bar} aria-hidden="true">
              |
            </span>
            <span>{profile.role}</span>
            <span className={s.sep} aria-hidden="true">
              ·
            </span>
            <span>{profile.roleScope}</span>
            <span className={s.bar} aria-hidden="true">
              |
            </span>
          </p>
          <a className={s.ghost} href={`#${projectId}`}>
            {profile.ctaPrimary}
          </a>
        </div>

        <footer className={s.bottombar}>
          <ul className={s.social}>
            {profile.social.map((item) => (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={`#${aboutId}`} className={s.scrollCue} aria-label="Rolar para a apresentação">
            <span />
          </a>
          <p className={s.where}>{profile.city} · Remoto</p>
        </footer>
      </div>
    </section>
  );
}
