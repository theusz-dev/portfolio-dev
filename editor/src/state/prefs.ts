import { useCallback, useEffect, useState, type SetStateAction } from "react";

/** A small preference kept in localStorage (per machine; nothing important lives here). */
export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored == null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  const set = useCallback((next: SetStateAction<T>) => setValue(next), []);
  return [value, set] as const;
}

type Theme = "light" | "dark";
const KEY = "caderno:theme";
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

/** The app's theme: the saved choice, else the system's. Applied as <html data-theme>. */
export function useTheme() {
  const [choice, setChoice] = useState<Theme | null>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch {
      return null;
    }
  });
  const [system, setSystem] = useState<Theme>(() => (media().matches ? "dark" : "light"));
  useEffect(() => {
    const query = media();
    const onChange = () => setSystem(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const theme = choice ?? system;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setChoice(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }, [theme]);

  return [theme, toggle] as const;
}
