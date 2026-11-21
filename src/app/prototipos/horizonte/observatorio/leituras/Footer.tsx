import { Fragment } from "react";
import { LocalClock } from "@/components/prototypes/LocalClock";
import { ParticleNightfall } from "@/components/prototypes/ParticleNightfall";
import { getProfile } from "@/content/portfolio";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SmallCaps } from "../../_components/HorizonteHero";
import { ContactActions } from "./ContactActions";
import s from "./footer.module.css";

/** Closing frame: the hero's dunes, seen at nightfall, with the contact essentials. */
export function Footer({ lang = "pt", projectId = "projetos" }: { lang?: Locale; projectId?: string }) {
  const profile = getProfile(lang);
  const t = getDictionary(lang);
  const sections = [
    { label: t.sections.about, href: "#sobre" },
    { label: t.sections.experience, href: "#experiencia" },
    { label: t.sections.skills, href: "#habilidades" },
    { label: t.sections.projects, href: `#${projectId}` },
    { label: t.sections.ai, href: "#ia" },
    { label: t.sections.writing, href: "#artigos" },
  ];
  return (
    <footer id="contato" className={s.footer} aria-labelledby="contato-title">
      <div className={s.frame}>
        <ParticleNightfall className={s.canvas} />
        <div className={s.vignette} aria-hidden="true" />

        <div className={s.center}>
          <p className={s.status}>
            <i aria-hidden="true" /> {profile.availability}
          </p>
          <h2 id="contato-title" className={s.title}>
            {t.contact.title.map((word, i) => (
              <Fragment key={word}>
                {i > 0 && " "}
                <SmallCaps word={word} />
              </Fragment>
            ))}
          </h2>
          <a className={s.email} href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <ContactActions profile={profile} t={t.contact} />
        </div>

        <div className={s.bottom}>
          <div className={s.bar}>
            <nav className={s.links} aria-label={t.contact.navLabel}>
              {sections.map(({ label, href }) => (
                <a key={href} href={href}>
                  {label}
                </a>
              ))}
            </nav>
            <a href="#" className={s.top} aria-label={t.contact.backToTop}>
              <span />
            </a>
            <ul className={s.links}>
              {profile.social.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className={s.legal}>
            <p>© 2026 {profile.shortName}</p>
            <p>
              {profile.city} · <LocalClock /> {profile.timezone}
            </p>
            <p className={s.coords}>{profile.coordinates}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
