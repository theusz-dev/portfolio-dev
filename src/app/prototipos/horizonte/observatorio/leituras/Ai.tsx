import aiProjects from "@/content/ai-projects.json";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Rich } from "@/i18n/Rich";
import s from "./ai.module.css";

const work = aiProjects[0];

// TCC (Projeto Final de Curso, EMC/UFG), from the defense slides of 30/11/2026.
const thesisText = {
  pt: {
    context: "Pesquisa · TCC",
    title: "Sistema Inteligente de Análise de Inversores Fotovoltaicos",
    subtitle: "Detecção de anomalias e interpretação por LLM",
    text: "No meu trabalho de conclusão de curso, criei um sistema que acompanha a telemetria real de 15 inversores solares da UFG, cruza diferentes métodos de detecção de falhas e usa um modelo de linguagem rodando localmente para redigir pré-laudos técnicos baseados nos manuais e normas.",
    principle: "Quem faz a conta e dispara o alerta é o código; o modelo de linguagem entra apenas para traduzir os dados em texto técnico.",
    pipeline: [
      { name: "Telemetria", note: "15 inversores, só leitura" },
      { name: "Detectores", note: "regras, pares, Isolation Forest" },
      { name: "Busca híbrida", note: "BM25 + bge-m3" },
      { name: "LLM local", note: "Qwen3.5-4B em CPU" },
      { name: "Validador", note: "números e citações" },
      { name: "Revisão humana", note: "veredito e critérios" },
    ],
    facts: [
      "Critérios de avaliação definidos antes de rodar os experimentos",
      "Cada afirmação do pré-laudo aponta para a medição ou trecho do manual de onde veio",
      "Zero dependência de nuvem: o modelo roda 100% local em CPU",
    ],
    status: "Defesa em 30/11/2026",
  },
  en: {
    context: "Research · Final thesis",
    title: "Intelligent Analysis System for Photovoltaic Inverters",
    subtitle: "Anomaly detection and LLM interpretation",
    text: "For my undergraduate thesis, I built a system that monitors real telemetry from 15 solar inverters at UFG, compares anomaly detection methods, and uses a local language model to draft technical reports grounded in equipment manuals and standards.",
    principle: "Deterministic code does the math and triggers the alerts; the language model is only there to translate the findings into a readable draft.",
    pipeline: [
      { name: "Telemetry", note: "15 inverters, read-only" },
      { name: "Detectors", note: "rules, peers, Isolation Forest" },
      { name: "Hybrid search", note: "BM25 + bge-m3" },
      { name: "Local LLM", note: "Qwen3.5-4B on CPU" },
      { name: "Validator", note: "numbers and citations" },
      { name: "Human review", note: "verdict and criteria" },
    ],
    facts: [
      "Evaluation protocol locked in before running the tests",
      "Every claim in the draft report cites the exact reading or manual excerpt behind it",
      "No cloud APIs: the model runs entirely locally on CPU",
    ],
    status: "Defence on 30 Nov 2026",
  },
} satisfies Record<Locale, unknown>;
const thesisPlace = "EMC/UFG · 2026";

// Memora, repeated from the projects: AI is part of the product.
const memoraText = {
  pt: {
    context: "Projeto pessoal",
    title: "Flashcards com tutor de IA",
    text: "Um app de estudos em Flutter que transforma textos e PDFs em flashcards, funciona offline e traz um tutor de IA focado na matéria de cada deck — usando a chave de API do próprio usuário.",
  },
  en: {
    context: "Personal project",
    title: "Flashcards with an AI tutor",
    text: "An offline-first Flutter study app that turns texts and PDFs into flashcards and includes an AI tutor scoped to each deck's subject — running on the user's own API key.",
  },
} satisfies Record<Locale, unknown>;
const memoraInfo = {
  place: "Memora · 2026",
  tools: ["DeepSeek", "Flutter", "Riverpod", "Drift"],
  links: {
    demo: "https://theusz-dev.github.io/Memora/",
    github: "https://github.com/theusz-dev/Memora",
  },
};

export function Ai({ lang = "pt" }: { lang?: Locale }) {
  const t = getDictionary(lang).ai;
  const thesis = { ...thesisText[lang], place: thesisPlace };
  const memora = { ...memoraText[lang], ...memoraInfo };
  return (
    <section id="ia" className={s.section} aria-labelledby="ai-title">
      <header className={s.head}>
        <h2 id="ai-title"><Rich text={t.title} /></h2>
        <div className={s.lead}>
          <p className={s.statement}>
            <Rich text={t.statement} />
          </p>
        </div>
      </header>

      <ol className={s.log}>
        <li className={s.entry}>
          <p className={s.meta}>
            <span>01</span> {t.work} <em>Umobi</em>
          </p>
          <div className={s.body}>
            <h3>{work.title[lang]}</h3>
            <p className={s.text}>{work.description[lang]}</p>
          </div>
          <ul className={s.tools} aria-label={t.tools}>
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
            <ol className={s.pipeline} aria-label={t.pipeline}>
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
              <a href={memora.links.demo} target="_blank" rel="noreferrer">{t.demo} <span aria-hidden="true">↗</span></a>
              <a href={memora.links.github} target="_blank" rel="noreferrer">{t.code} <span aria-hidden="true">↗</span></a>
            </p>
          </div>
          <ul className={s.tools} aria-label={t.stack}>
            {memora.tools.map(tool => <li key={tool}>{tool}</li>)}
          </ul>
        </li>
      </ol>
    </section>
  );
}
