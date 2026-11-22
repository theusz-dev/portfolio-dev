import type { Meta } from "../lib/frontmatter";
import type { Collection, Lang } from "../lib/types";
import type { CompileError } from "./compile";

/**
 * How the editor talks to the preview frame. Both pages share an origin, so
 * the editor calls `frame.contentWindow.previewApi` directly.
 */

export type PreviewPayload = {
  collection: Collection;
  lang: Lang;
  slug: string;
  meta: Meta;
  /** The whole file (frontmatter + body), exactly as it is saved. */
  source: string;
  languages: Lang[];
  neighbours: { newer: { slug: string; title: string } | null; older: { slug: string; title: string } | null };
  readingMinutes: number;
  /** `/blog/x.webp` → a URL the webview can load. */
  resolveAsset: (sitePath: string) => string;
  /** Opens an external link outside the app. */
  openLink: (url: string) => void;
  /** The blog header's theme button was clicked. */
  toggleTheme: () => void;
};

export type PreviewStatus = { state: "compiling" } | { state: "ok" } | { state: "error"; error: CompileError };

export type PreviewApi = {
  render(payload: PreviewPayload): void;
  setTheme(theme: "light" | "dark"): void;
  /** Pauses / resumes animations (requestAnimationFrame) in the preview. */
  setAnimating(on: boolean): void;
  /** Scrolls so `line` (a file line, may be fractional) sits at the top of the article. */
  scrollToLine(line: number): void;
  /** Scrolls to a fraction of the page (0 top, 1 bottom). */
  scrollToFraction(fraction: number): void;
  /** File line at the top of the view, or null when above the article. */
  topLine(): number | null;
  /** 0..1, or -1 when the page doesn't scroll. */
  scrollFraction(): number;
  onStatus(listener: (status: PreviewStatus) => void): void;
  onScroll(listener: () => void): void;
};

declare global {
  interface Window {
    previewApi?: PreviewApi;
  }
}

export const READY_MESSAGE = "caderno:preview-ready";
