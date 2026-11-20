"use client";

import { useState } from "react";
import s from "./project.module.css";

export type Hotspot = {
  x: number;
  y: number;
  title: string;
  text: string;
  align?: "left" | "right";
};

/**
 * Numbered markers placed over the screenshot. Hover, focus or tap opens the
 * note; the same notes are listed below the image for small screens.
 */
export function Hotspots({ points }: { points: Hotspot[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className={s.hotspots}>
      {points.map((point, i) => {
        const open = active === i;
        return (
          <div
            key={point.title}
            className={s.spot}
            data-open={open || undefined}
            data-align={point.align ?? "right"}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <button
              type="button"
              className={s.marker}
              aria-expanded={open}
              aria-label={`${i + 1}. ${point.title}`}
              onClick={() => setActive(open ? null : i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {i + 1}
            </button>
            <div className={s.note} role="note" aria-hidden={!open}>
              <p className={s.noteTitle}>{point.title}</p>
              <p>{point.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
