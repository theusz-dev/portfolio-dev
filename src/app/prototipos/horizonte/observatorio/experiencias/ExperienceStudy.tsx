import experience from "@/content/experience.json";
import { DawnLandscape } from "../leituras/DawnLandscape";
import { PeriodChart } from "../leituras/Experience";
import { Month, notes } from "../leituras/experienceDetails";
import s from "./studies.module.css";

export const studies = { alvorada: "Alvorada", diptico: "Díptico", fases: "Fases" };
export type Study = keyof typeof studies;
type Job = (typeof experience)[number];

function Period({ period }: { period: Job["period"] }) {
  return <span className={s.period}><Month value={period.start} /> — <Month value={period.end} /></span>;
}

function Details({ job }: { job: Job }) {
  return (
    <>
      <p className={s.body}>{notes[job.id]?.summary ?? job.highlights.pt[0]}</p>
      <p className={s.stack}>{job.stack.join(" · ")}</p>
    </>
  );
}

function Alvorada() {
  const chronological = experience.toSorted((a, b) => a.period.start.localeCompare(b.period.start));
  return (
    <>
      <header className={s.intro}>
        <p className={s.label}>Experiência</p>
        <h2 id="experience-title">Da web<br /><em>ao mobile.</em></h2>
        <DawnLandscape />
        <p className={s.lead}>Comecei desenvolvendo sistemas internos no CETT/UFG. O trabalho com Flutter me levou aos aplicativos da Umobi e, depois, a uma função full stack.</p>
      </header>
      <ol className={s.path} aria-label="Cargos em ordem cronológica">
        {chronological.map(job => (
          <li key={job.id}>
            <span className={s.year} aria-hidden="true">{job.period.start.slice(0,4)}</span>
            <div className={s.stop}>
              <Period period={job.period} />
              <h3>{job.role.pt}</h3>
              <p className={s.company}>{job.company}</p>
              <Details job={job} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function Diptico() {
  const companies = [...new Set(experience.map(job => job.company))];
  return (
    <>
      <header className={s.intro}>
        <h2 id="experience-title">Experiência</h2>
        <p className={s.lead}>Em parte de 2024 e 2025, conciliei os sistemas do CETT/UFG com projetos freelance na Umobi. Em 2026, passei a atuar na Umobi como desenvolvedor full stack.</p>
        <PeriodChart />
      </header>
      <div className={s.groups}>
        {companies.map(company => (
          <section className={s.employer} key={company}>
            <h3>{company}</h3>
            <ol>
              {experience.filter(job => job.company === company).map(job => (
                <li key={job.id}>
                  <Period period={job.period} />
                  <h4>{job.role.pt}</h4>
                  <Details job={job} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}

const headlines: Record<string, string> = {
  "umobi-fullstack": "Orca e painéis de gestão",
  "umobi-mobile-freelance": "Revela Fácil e construção civil",
  "cett-ufg-web": "Sistemas de uso interno",
};

function Fases() {
  return (
    <>
      <header className={s.intro}>
        <p className={s.label}>Experiência</p>
        <h2 id="experience-title">O que<br /><em>entreguei.</em></h2>
        <p className={s.lead}>De um app para registrar o uso de veículos a outro para fazer orçamentos, trabalhei tanto nas telas quanto nos sistemas por trás delas.</p>
        <div className={s.lunar} aria-hidden="true"><i /></div>
      </header>
      <ol className={s.deliveries} aria-label="Entregas por experiência, da mais recente à mais antiga">
        {experience.map(job => (
          <li key={job.id}>
            <Period period={job.period} />
            <h3>{headlines[job.id] ?? job.role.pt}</h3>
            <p className={s.byline}>{job.company} <span>·</span> {job.role.pt}</p>
            <Details job={job} />
          </li>
        ))}
      </ol>
    </>
  );
}

const views = { alvorada: Alvorada, diptico: Diptico, fases: Fases };

export function ExperienceStudy({ study }: { study: Study }) {
  const View = views[study];
  return (
    <section id="experiencia" className={s.section + " " + s[study]} aria-labelledby="experience-title">
      <View />
    </section>
  );
}
