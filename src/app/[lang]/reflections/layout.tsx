import type { Viewport } from "next";
import { ThemeScript } from "@/components/blog/theme";
import { fontVariables } from "./_components/fonts";
import styles from "./blog.module.css";

// The portfolio forces a dark viewport; this blog has light and dark themes.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#070708" },
  ],
};

export default function ReflectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className={`${styles.shell} ${fontVariables}`}>
      <ThemeScript />
      {children}
    </div>
  );
}
