import aiProjects from "@/content/ai-projects.json";
import s from "./ai.module.css";

const work = aiProjects[0];

// TCC (Projeto Final de Curso, EMC/UFG), from the defense slides of 30/11/2026.
const thesis = {
  context: "Pesquisa · TCC",
  place: "EMC/UFG · 2026",
  title: "Sistema Inteligente de Análise de Inversores Fotovoltaicos",
  subtitle: "Detecção de anomalias e interpretação por LLM",
  text: "Construí um sistema que lê a telemetria real de 15 inversores da UFG, compara métodos de detecção de anomalias e gera pré-laudos técnicos com um modelo de linguagem local, ancorados em manuais e normas.",
  principle: "O código calcula e decide os alertas; o modelo de linguagem só interpreta.",
  pipeline: [
    { name: "Telemetria", note: "15 inversores, só leitura" },
    { name: "Detectores", note: "regras, pares, Isolation Forest" },
    { name: "Busca híbrida", note: "BM25 + bge-m3" },
    { name: "LLM local", note: "Qwen3.5-4B em CPU" },
    { name: "Validador", note: "números e citações" },
    { name: "Revisão humana", note: "veredito e critérios" },
  ],
  facts: [
    "Protocolo de avaliação fixado antes do teste",
    "Cada frase do pré-laudo cita a evidência ou o trecho que a sustenta",
    "Sem nuvem: o modelo roda localmente",
  ],
  status: "Defesa em 30/11/2026",
};

// Memora, repeated from the projects: AI is part of the product.
const memora = {
  context: "Projeto pessoal",
  place: "Memora · 2026",
  title: "Flashcards com tutor de IA",
  text: "App Flutter offline-first que gera cards a partir de texto e PDF e oferece um tutor especializado por deck, usando a chave de API do próprio usuário.",
  tools: ["DeepSeek", "Flutter", "Riverpod", "Drift"],
  links: {
    demo: "https://matheusz-nied.github.io/Memora/",
    github: "https://github.com/matheusz-nied/Memora",
  },
};

export function Ai() {
  return (
    <section id="ia" className={s.section} aria-labelledby="ai-title">
      <header className={s.head}>
        <h2 id="ai-title">Inteligência<br />Artificial</h2>
        <div className={s.lead}>
          <p className={s.statement}>
            Uso IA para <em>construir software</em> e construo software <em>que usa IA</em>.
          </p>
        </div>
      </header>

      <ol className={s.log}>
        <li className={s.entry}>
          <p className={s.meta}>
            <span>01</span> Trabalho <em>Umobi</em>
          </p>
          <div className={s.body}>
            <h3>{work.title.pt}</h3>
            <p className={s.text}>{work.description.pt}</p>
          </div>
          <ul className={s.tools} aria-label="Ferramentas">
            {work.tools.map(tool => <li key={tool}>{tool}</li>)}
          </ul>
        </li>

        <li className={`${s.entry} ${s.featured}`}>
          <p className={s.meta}>
            <span>02</span> {thesis.context} <em>{thesis.place}</em>
          </p>
          <div className={s.body}>
            <h3>
              {thesis.title}
              <small>{thesis.subtitle}</small>
            </h3>
            <p className={s.text}>{thesis.text}</p>
            <blockquote className={s.principle}>“{thesis.principle}”</blockquote>
            <ol className={s.pipeline} aria-label="Etapas do sistema">
              {thesis.pipeline.map(({ name, note }) => (
                <li key={name}>
                  <b>{name}</b>
                  <span>{note}</span>
                </li>
              ))}
            </ol>
            <ul className={s.facts}>
              {thesis.facts.map(fact => <li key={fact}>{fact}</li>)}
            </ul>
          </div>
          <p className={s.status}>
            <i aria-hidden="true" /> {thesis.status}
          </p>
        </li>

        <li className={s.entry}>
          <p className={s.meta}>
            <span>03</span> {memora.context} <em>{memora.place}</em>
          </p>
          <div className={s.body}>
            <h3>{memora.title}</h3>
            <p className={s.text}>{memora.text}</p>
            <p className={s.links}>
              <a href={memora.links.demo} target="_blank" rel="noreferrer">Ver demo <span aria-hidden="true">↗</span></a>
              <a href={memora.links.github} target="_blank" rel="noreferrer">Código <span aria-hidden="true">↗</span></a>
            </p>
          </div>
          <ul className={s.tools} aria-label="Tecnologias">
            {memora.tools.map(tool => <li key={tool}>{tool}</li>)}
          </ul>
        </li>
      </ol>
    </section>
  );
}
