"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { InlineScript } from "./InlineScript";

/**
 * Light / dark theme of the blogs (the portfolio is always dark).
 *
 * With no saved choice, the blog follows the system (`prefers-color-scheme`).
 * A choice is saved in localStorage and applied as `<html data-theme="light|dark">`.
 * Blog CSS reads it like this:
 *
 *   light tokens                                         ← default
 *   @media (prefers-color-scheme: dark) { html:not([data-theme="light"]) … dark tokens }
 *   html[data-theme="dark"] … dark tokens
 */
export type Theme = "light" | "dark";

const STORAGE_KEY = "blog-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const applyStored = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

/**
 * Put once at the top of a blog layout. On a full load the inline script sets
 * the theme before the first paint; on a client-side navigation (e.g. coming
 * from the portfolio) the layout effect does it before the browser paints.
 */
export function ThemeScript() {
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
    } catch {}
  }, []);
  return <InlineScript html={applyStored} />;
}

function subscribe(onChange: () => void) {
  const media = matchMedia(DARK_QUERY);
  const observer = new MutationObserver(onChange);
  media.addEventListener("change", onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    media.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** The theme in effect (`null` during server render and hydration) and a setter that remembers the choice. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);
  const setTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };
  return { theme, setTheme };
}

type ToggleProps = {
  className?: string;
  labels: { toLight: string; toDark: string };
};

/** A plain button that switches between light and dark. Style it, or build your own with `useTheme`. */
export function ThemeToggle({ className, labels }: ToggleProps) {
  const { theme, setTheme } = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className={className} onClick={() => setTheme(next)} aria-pressed={theme === "dark"}>
      {theme === "dark" ? labels.toLight : labels.toDark}
    </button>
  );
}
