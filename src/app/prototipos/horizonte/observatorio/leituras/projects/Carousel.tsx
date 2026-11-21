"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProjectMedia } from "@/content/projects";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Media } from "./Media";
import s from "./projects.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Media carousel: arrows, thumbnails, keyboard (← →) and swipe. */
export function Carousel({ media, title, t }: { media: ProjectMedia[]; title: string; t: Dictionary["carousel"] }) {
  const [index, setIndex] = useState(0);
  const count = media.length;
  const swipe = useRef<number | null>(null);
  const go = (to: number) => setIndex((to + count) % count);
  const current = media[index];
  const portrait = current.height > current.width;

  return (
    <section
      className={s.carousel}
      aria-roledescription={t.role}
      aria-label={format(t.label, { title })}
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className={`${s.stage} ${portrait ? s.stagePortrait : ""}`}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") swipe.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipe.current === null) return;
          const dx = event.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        {media.map((item, i) => (
          <div
            key={item.src}
            className={s.slide}
            data-active={i === index}
            inert={i !== index}
            role="group"
            aria-roledescription={t.slide}
            aria-label={format(t.position, { index: i + 1, count })}
          >
            <Media media={item} sizes="(max-width: 900px) 100vw, 1100px" className={s.slideMedia} active={i === index} />
          </div>
        ))}

        {count > 1 && (
          <>
            <button type="button" className={`${s.arrow} ${s.arrowPrev}`} onClick={() => go(index - 1)} aria-label={t.previous}>
              ←
            </button>
            <button type="button" className={`${s.arrow} ${s.arrowNext}`} onClick={() => go(index + 1)} aria-label={t.next}>
              →
            </button>
            <p className={s.counter} aria-live="polite">
              {pad(index + 1)} / {pad(count)}
            </p>
          </>
        )}
      </div>

      <p className={s.caption}>{current.alt}</p>

      {count > 1 && (
        <ol className={s.thumbs}>
          {media.map((item, i) => (
            <li key={item.src}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={format(t.show, { index: i + 1, alt: item.alt })}
                aria-current={i === index}
              >
                {item.type === "image" ? (
                  <Image src={item.src} alt="" fill sizes="120px" />
                ) : item.poster ? (
                  <Image src={item.poster} alt="" fill sizes="120px" />
                ) : (
                  <span className={s.thumbVideo}>▶</span>
                )}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
