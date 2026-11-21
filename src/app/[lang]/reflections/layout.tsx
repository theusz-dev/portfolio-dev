import type { Viewport } from "next";
import { ThemeScript } from "@/components/blog/theme";
import styles from "./blog.module.css";

// The portfolio forces a dark viewport; this blog has light and dark themes.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function ReflectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <ThemeScript />
      {children}
    </div>
  );
}
