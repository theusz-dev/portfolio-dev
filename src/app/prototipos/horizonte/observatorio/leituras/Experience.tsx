import experience from "@/content/experience.json";
import s from "./experience.module.css";
import { ExperienceRidge } from "./ExperienceRidge";

import { Month, notes } from "./experienceDetails";

function monthIndex(value: string) {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
}

export function PeriodChart() {
  const firstYear = Math.min(...experience.map(({ period }) => Number(period.start.slice(0, 4))));
  const lastYear = Math.max(...experience.map(({ period }) => Number(period.end.slice(0, 4))));
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const columns = { gridTemplateColumns: `repeat(${years.length}, 1fr)` };
  const totalMonths = years.length * 12;

  return (
    <div className={s.chart} aria-hidden="true">
      <div className={s.years} style={columns}>{years.map(year => <span key={year}>{year}</span>)}</div>
      {experience.map(({ id, company, period }) => {
        const start = monthIndex(period.start);
        const end = monthIndex(period.end);
        return (
          <div key={id} className={s.chartRow}>
            <span>{notes[id]?.label ?? company}</span>
            <div className={s.track} style={columns}>
              {years.map(year => <i key={year} />)}
              <b style={{
                left: `${100 * (start - firstYear * 12) / totalMonths}%`,
                width: `${100 * (end - start + 1) / totalMonths}%`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Experience() {
  return (
    <section className={s.section} id="experiencia" aria-labelledby="experience-title">
      <div className={s.layout}>
        <header className={s.intro}>
          <h2 id="experience-title">Experiência</h2>
          <p>Enquanto desenvolvia sistemas web no CETT/UFG, comecei a criar aplicativos como freelancer na Umobi. Depois, passei a trabalhar lá como desenvolvedor full stack.</p>
          <PeriodChart />
        </header>
        <ExperienceRidge />
        <ol className={s.timeline} aria-label="Experiências da mais recente à mais antiga">
          {experience.map(({ id, role, company, period, stack, highlights }) => (
            <li className={s.entry} key={id}>
              <div className={s.entryMeta}>
                <p className={s.company}>{company}</p>
                <p className={s.period}><Month value={period.start} /> — <Month value={period.end} /></p>
              </div>
              <h3>{role.pt}</h3>
              <p className={s.description}>{notes[id]?.summary ?? highlights.pt[0]}</p>
              <p className={s.stack}>{stack.join(" · ")}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
