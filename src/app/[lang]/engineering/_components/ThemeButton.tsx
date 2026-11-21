"use client";

import { useTheme } from "@/components/blog/theme";
import { MoonIcon, SunIcon } from "./icons";
import styles from "../blog.module.css";

/** Icon button for light / dark. Both icons are in the HTML and CSS shows the right one, so nothing jumps on load. */
export function ThemeButton({ labels }: { labels: { toLight: string; toDark: string } }) {
  const { theme, setTheme } = useTheme();
  const label = theme === "dark" ? labels.toLight : labels.toDark;
  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme ? label : labels.toDark}
      title={theme ? label : undefined}
    >
      <SunIcon className={styles.sun} />
      <MoonIcon className={styles.moon} />
    </button>
  );
}
