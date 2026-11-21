import { LocalClock } from "@/components/prototypes/LocalClock";
import { ParticleNightfall } from "@/components/prototypes/ParticleNightfall";
import { profile } from "@/content/portfolio";
import { SmallCaps } from "../../_components/HorizonteHero";
import { ContactActions } from "./ContactActions";
import s from "./footer.module.css";

const sections = [
  { label: "Sobre", href: "#sobre" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Habilidades", href: "#habilidades" },
  { label: "Projetos", href: "#projeto" },
  { label: "IA", href: "#ia" },
];

/** Closing frame: the hero's dunes, seen at nightfall, with the contact essentials. */
export function Footer() {
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
            <SmallCaps word="Vamos" /> <SmallCaps word="conversar" />
          </h2>
          <a className={s.email} href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <ContactActions />
        </div>

        <div className={s.bottom}>
          <div className={s.bar}>
            <nav className={s.links} aria-label="Seções do portfólio">
              {sections.map(({ label, href }) => (
                <a key={href} href={href}>
                  {label}
                </a>
              ))}
            </nav>
            <a href="#" className={s.top} aria-label="Voltar ao topo">
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
