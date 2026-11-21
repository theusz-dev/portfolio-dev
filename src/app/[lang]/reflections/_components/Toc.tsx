"use client";

import { useEffect, useState } from "react";
import styles from "../article.module.css";

type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * "On this page", read from the article's own headings after load (so it
 * always matches what rehype-slug produced). The current section is marked
 * while reading; nothing animates with the scroll.
 */
export function Toc({ title }: { title: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-prose] :is(h2, h3)[id]")];
    setHeadings(
      nodes.map((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("[data-anchor]").forEach((anchor) => anchor.remove());
        return { id: node.id, text: clone.textContent?.trim() ?? "", level: node.tagName === "H3" ? 3 : 2 };
      }),
    );
    if (nodes.length === 0) return;

    // The active section is the last heading above a line 30% down the window.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id;
        else break;
      }
      setActive(current);
    };
    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()));
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav className={styles.toc} aria-label={title}>
      <p className={styles.tocTitle}>{title}</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} data-level={h.level}>
            <a href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
