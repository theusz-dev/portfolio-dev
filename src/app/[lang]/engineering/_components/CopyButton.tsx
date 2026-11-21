"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../article.module.css";

/** Copies the code block it sits in (`[data-code]`). */
export function CopyButton({ labels }: { labels: { copy: string; copied: string; copyLabel: string } }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? labels.copied : labels.copyLabel}
      data-copied={copied || undefined}
      onClick={async (event) => {
        const code = event.currentTarget.closest("[data-code]")?.querySelector("pre")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code.replace(/\n$/, ""));
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1600);
        } catch {}
      }}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        {copied ? (
          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" stroke="currentColor" strokeWidth="1.3" />
          </>
        )}
      </svg>
      <span>{copied ? labels.copied : labels.copy}</span>
    </button>
  );
}
