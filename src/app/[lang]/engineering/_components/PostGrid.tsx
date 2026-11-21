"use client";

import { useEffect, useState, type ReactNode } from "react";
import shared from "../blog.module.css";
import styles from "../index.module.css";

type Item = { slug: string; tags: string[]; card: ReactNode };

type Props = {
  items: Item[];
  /** Topics to filter by, most used first. */
  tags: string[];
  labels: { all: string; filterLabel: string; emptyTag: string };
};

/**
 * The post grid with a topic filter (kept in `?tag=` so a filtered list can be
 * shared). Three cards per row; a lone post gets a full row.
 * Changing the filter replays the cards' entrance, nothing else moves.
 */
export function PostGrid({ items, tags, labels }: Props) {
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tag");
    if (fromUrl && items.some((item) => item.tags.includes(fromUrl))) setTag(fromUrl);
  }, [items]);

  const choose = (next: string | null) => {
    setTag(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("tag", next);
    else url.searchParams.delete("tag");
    window.history.replaceState(null, "", url);
  };

  const shown = tag ? items.filter((item) => item.tags.includes(tag)) : items;
  // A topic opened from an article may be outside the top list; show it too.
  const tabs = tag && !tags.includes(tag) ? [...tags, tag] : tags;

  return (
    <>
      {tabs.length > 1 && (
        <div className={`${styles.filters} ${shared.rise}`} style={{ "--i": 3 } as React.CSSProperties}>
          <ul className={styles.tabs} aria-label={labels.filterLabel}>
            {[null, ...tabs].map((value) => (
              <li key={value ?? "*"}>
                <button
                  type="button"
                  className={styles.tab}
                  aria-pressed={tag === value}
                  onClick={() => choose(value)}
                >
                  {value ?? labels.all}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shown.length === 0 ? (
        <p className={styles.empty}>{labels.emptyTag}</p>
      ) : (
        <ol className={styles.grid}>
          {shown.map((item, i) => (
            <li
              key={`${tag ?? "*"}:${item.slug}`}
              className={`${styles.cell} ${shared.rise}`}
              data-size={shown.length === 1 ? "solo" : "normal"}
              style={{ "--i": Math.min(i, 8) + 4 } as React.CSSProperties}
            >
              {item.card}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
