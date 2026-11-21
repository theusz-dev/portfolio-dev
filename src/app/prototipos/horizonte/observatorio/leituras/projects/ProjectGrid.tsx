"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/content/projects";
import { Media } from "./Media";
import { ProjectLinks, projectHref, toList } from "./ProjectLinks";
import s from "./projects.module.css";

const STACK_ON_CARD = 4;
const EXPANDED_KEY = "projetos:expandido";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The project cards. The first `featured` are always shown; "Ver mais"
 * reveals the rest (remembered for the session, so coming back from a
 * project page keeps the list as it was). Each card opens its own page.
 */
export function ProjectGrid({ projects, featured }: { projects: Project[]; featured: number }) {
  const [expanded, setExpanded] = useState(false);
  const extra = projects.length - featured;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(EXPANDED_KEY) === "1") setExpanded(true);
    } catch {}
  }, []);

  const toggle = (value: boolean) => {
    setExpanded(value);
    try {
      sessionStorage.setItem(EXPANDED_KEY, value ? "1" : "0");
    } catch {}
    if (value) {
      requestAnimationFrame(() => {
        const first = projects[featured];
        if (first) document.querySelector<HTMLAnchorElement>(`[data-project-card="${first.id}"]`)?.focus();
      });
    }
  };

  return (
    <>
      <ul className={s.grid}>
        {projects.map((project, i) => (
          <li key={project.id} hidden={!expanded && i >= featured} className={s.item}>
            <Card project={project} number={i + 1} />
          </li>
        ))}
      </ul>

      {extra > 0 && (
        <div className={s.more}>
          {expanded ? (
            <button type="button" className={s.moreButton} onClick={() => toggle(false)}>
              Mostrar menos
            </button>
          ) : (
            <button type="button" className={s.moreButton} onClick={() => toggle(true)}>
              Ver mais projetos <span>+{pad(extra)}</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

function Card({ project, number }: { project: Project; number: number }) {
  const covers = toList(project.cover);
  const shownStack = project.stack.slice(0, STACK_ON_CARD);
  const hiddenStack = project.stack.length - shownStack.length;

  return (
    <article className={s.card}>
      <div className={`${s.cover} ${covers.length > 1 ? s.coverScreens : ""}`}>
        {covers.map((media) => (
          <div key={media.src} className={s.coverItem}>
            <Media
              media={media}
              ambient
              className={s.coverMedia}
              sizes={covers.length > 1 ? "(max-width: 720px) 34vw, 160px" : "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 420px"}
            />
          </div>
        ))}
      </div>

      <div className={s.cardBody}>
        <p className={s.meta}>
          <span>{pad(number)}</span> {project.year} · {project.status}
        </p>
        <h3 className={s.cardTitle}>
          <Link href={projectHref(project.id)} className={s.cardOpen} data-project-card={project.id}>
            {project.title}
          </Link>
        </h3>
        <p className={s.summary}>{project.summary}</p>

        <ul className={s.chips} aria-label="Tecnologias">
          {shownStack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
          {hiddenStack > 0 && <li className={s.chipMore}>+{hiddenStack}</li>}
        </ul>

        <div className={s.cardFoot}>
          <ProjectLinks project={project} variant="text" />
          <span className={s.details} aria-hidden="true">
            Ver projeto →
          </span>
        </div>
      </div>
    </article>
  );
}
