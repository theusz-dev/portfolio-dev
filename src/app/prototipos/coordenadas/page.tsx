import type { Metadata } from "next";
import Image from "next/image";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import { LocalClock } from "@/components/prototypes/LocalClock";
import { ParticleSphere } from "@/components/prototypes/ParticleSphere";
import { profile, project } from "@/content/portfolio";
import s from "./coordenadas.module.css";

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "B · Coordenadas — Protótipo do portfólio",
};

const github = profile.social.find((item) => item.label === "GitHub")!;

const spec = [
  { key: "Problema", value: project.problem },
  { key: "Solução", value: project.solution },
  { key: "Papel", value: project.role },
  { key: "Resultado", value: project.result },
];

export default function CoordenadasPage() {
  return (
    <main className={`${s.page} ${sans.variable} ${mono.variable}`}>
      <section className={s.hud} aria-labelledby="coordenadas-title">
        <div className={s.bezel}>
          <div className={s.grid} aria-hidden="true" />

          <header className={s.topbar}>
            <div className={s.cells}>
              <a href="#" className={`${s.cell} ${s.logo}`}>
                <span className={s.accent}>{profile.firstName}</span>
                {profile.lastName}
              </a>
              <a href="#ficha" className={`${s.cell} ${s.square}`} aria-label="Ir para o projeto">
                {profile.initials[0]}
              </a>
            </div>
            <nav className={s.nav} aria-label="Seções">
              {profile.sections.map((section, i) => (
                <a key={section} href={section === "Projetos" ? "#ficha" : "#"}>
                  <span>0{i + 1}</span>
                  {section}
                </a>
              ))}
            </nav>
            <div className={s.cells}>
              <span className={`${s.cell} ${s.square}`}>PT</span>
              <span className={`${s.cell} ${s.clock}`}>
                GYN <LocalClock />
              </span>
            </div>
          </header>

          <div className={s.stage}>
            <p className={`${s.meta} ${s.m1}`}>
              <span className={s.num}>01.</span> {profile.role}
            </p>
            <p className={`${s.meta} ${s.m2}`}>
              <span className={s.num}>02.</span> {profile.city}, Brasil
            </p>

            <h1 id="coordenadas-title" className={s.statement}>
              <span className={s.left}>
                Código com
                <br />
                propósito
              </span>
              <span className={s.sr}>. </span>
              <span className={s.right}>
                Produtos com
                <br />
                identidade
              </span>
            </h1>

            <div className={s.object}>
              <ParticleSphere className={s.canvas} color="214, 222, 255" />
              <span className={`${s.tag} ${s.tagTop}`}>stack: {profile.topStack.slice(0, 3).join(" · ").toLowerCase()}</span>
              <span className={`${s.tag} ${s.tagRight}`}>exp: {profile.yearsExperience} em produção</span>
              <span className={`${s.tag} ${s.tagLeft}`}>coord: {profile.coordinates}</span>
              <span className={`${s.tag} ${s.tagBottom}`}>status: disponível</span>
              <i className={s.cornerTL} />
              <i className={s.cornerBR} />
            </div>

            <p className={`${s.meta} ${s.m3}`}>
              <span className={s.line}>
                <span className={s.num}>03.</span> E:{" "}
                <a className={s.raw} href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </span>
              <span className={`${s.line} ${s.indent}`}>
                GH:{" "}
                <a className={s.raw} href={github.href} target="_blank" rel="noreferrer">
                  {github.href.replace("https://github.com/", "")}
                </a>
              </span>
            </p>
            <p className={`${s.meta} ${s.m4}`}>
              <span className={s.num}>04.</span> Disponível para trabalho remoto
            </p>
          </div>

          <a className={s.ruler} href="#perfil" aria-label="Rolar para o perfil">
            <span className={s.rulerMark} />
          </a>
        </div>
      </section>

      <section id="perfil" className={s.profile} aria-label="Perfil">
        <p className={s.label}>[00] Perfil</p>
        <div className={s.profileBody}>
          <p className={s.intro}>
            {profile.intro} <strong>{profile.shortName}</strong>. {profile.summary}
          </p>
          <div className={s.actions}>
            <a className={s.button} href="#ficha">
              {profile.ctaPrimary} <span aria-hidden="true">→</span>
            </a>
            <a className={s.button} href={profile.resume} download>
              {profile.ctaResume} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <dl className={s.readout}>
          <div>
            <dt>Experiência</dt>
            <dd>{profile.yearsExperience}</dd>
          </div>
          <div>
            <dt>Escopo</dt>
            <dd>{profile.roleScope}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{profile.topStack.join(", ")}</dd>
          </div>
        </dl>
      </section>

      <section id="ficha" className={s.sheet} aria-labelledby="coordenadas-project">
        <div className={s.sheetHead}>
          <p className={s.label}>[{project.index}] Projeto</p>
          <h2 id="coordenadas-project" className={s.projectTitle}>
            {project.title}
          </h2>
          <p className={s.headCell}>{project.year}</p>
          <p className={s.headCell}>
            <span className={s.dot} aria-hidden="true" /> {project.status}
          </p>
        </div>

        <div className={s.sheetBody}>
          <div className={s.specs}>
            <p className={s.projectSummary}>{project.summary}</p>
            <dl className={s.specList}>
              {spec.map((row) => (
                <div key={row.key}>
                  <dt>{row.key}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className={s.figure}>
            <div className={s.figureFrame}>
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                sizes="(max-width: 900px) 100vw, 60vw"
              />
              <i className={s.cornerTL} />
              <i className={s.cornerBR} />
            </div>
            <figcaption>
              <span>fig. {project.index}</span>
              <span>{project.links.demo.replace("https://", "").replace(/\/$/, "")}</span>
              <span>
                {project.image.width}×{project.image.height}
              </span>
            </figcaption>
          </figure>
        </div>

        <ol className={s.highlights}>
          {project.highlights.map((item, i) => (
            <li key={item}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>

        <div className={s.sheetFoot}>
          <ul className={s.stack} aria-label="Stack">
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <div className={s.links}>
            <a href={project.links.demo} target="_blank" rel="noreferrer">
              Demo <span aria-hidden="true">↗</span>
            </a>
            <a href={project.links.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
