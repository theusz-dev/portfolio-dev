import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/400-italic.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/500-italic.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/600-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
// The site's global reset (src/app/globals.css), as on every page of the site.
import "../../../src/app/globals.css";
import "./preview.css";
// Only to read the Firmament's class names (see lightSkyFix below).
import engFirmament from "../../../src/app/[lang]/engineering/_components/firmament.module.css";
import refFirmament from "../../../src/app/[lang]/reflections/_components/firmament.module.css";

import type { MDXContent } from "mdx/types";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { compileMdx, type CompileError } from "./compile";
import { PreviewPage } from "./PreviewPage";
import { READY_MESSAGE, type PreviewApi, type PreviewPayload, type PreviewStatus } from "./protocol";

/**
 * The Firmament draws light stars and relies on `mix-blend-mode: difference`
 * to show them dark on the light theme. WebKitGTK (the app's webview) doesn't
 * apply that blend, so on the light theme the preview drops the blend and
 * inverts the canvas instead: same dark stars, no blending needed.
 */
const lightSkyFix = document.createElement("style");
lightSkyFix.textContent = [engFirmament, refFirmament]
  .flatMap((m) => [m.band, m.page])
  .map((cls) => `html[data-theme="light"] .${cls} { mix-blend-mode: normal; filter: invert(1); }`)
  .join("\n");
document.head.appendChild(lightSkyFix);

/**
 * The Firmament redraws a full canvas every frame. Chrome does that on the
 * GPU; WebKitGTK (the Linux webview) paints it on the CPU, and with a dialog's
 * backdrop on top it can bog the whole window down. So the preview's
 * animation frames are capped at 30 per second, and stop entirely while the
 * editor says so (a dialog is open, the window isn't focused). The site's
 * components are untouched: only this frame's requestAnimationFrame changes.
 */
const FRAME_GAP = 1000 / 30;
const nativeRaf = window.requestAnimationFrame.bind(window);
const nativeCaf = window.cancelAnimationFrame.bind(window);
const pending = new Map<number, number>();
let nextId = 0;
let paused = false;
let lastFrame = -Infinity;
let resumeWaiters: (() => void)[] = [];

window.requestAnimationFrame = (callback) => {
  const id = ++nextId;
  const tick = (now: number) => {
    if (paused) {
      // Sleep instead of polling every frame; the editor wakes us up.
      pending.set(id, -1);
      resumeWaiters.push(() => pending.has(id) && pending.set(id, nativeRaf(tick)));
      return;
    }
    // Several callbacks may share one allowed frame (same `now`).
    if (now !== lastFrame && now - lastFrame < FRAME_GAP) {
      pending.set(id, nativeRaf(tick));
      return;
    }
    lastFrame = now;
    pending.delete(id);
    callback(now);
  };
  pending.set(id, nativeRaf(tick));
  return id;
};
window.cancelAnimationFrame = (id) => {
  const native = pending.get(id);
  if (native != null && native >= 0) nativeCaf(native);
  pending.delete(id);
};

function setAnimating(on: boolean) {
  paused = !on;
  if (on) {
    const waiters = resumeWaiters;
    resumeWaiters = [];
    for (const wake of waiters) wake();
  }
}

/** Distance from the top of the window to where "the top of the reading" is: under the sticky header. */
const READING_TOP = 72;

let statusListener: (status: PreviewStatus) => void = () => {};
let scrollListener: () => void = () => {};
let setPayloadExternal: (payload: PreviewPayload) => void = () => {};
let currentPayload: PreviewPayload | null = null;

function Preview() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [rendered, setRendered] = useState<{ Content: MDXContent | null; version: number }>({ Content: null, version: 0 });
  const compiling = useRef(0);
  const lastGood = useRef<MDXContent | null>(null);

  useEffect(() => {
    setPayloadExternal = setPayload;
    if (currentPayload) setPayload(currentPayload);
  }, []);

  // Compile when the source changes. A failed compile keeps the last good render on screen.
  const source = payload?.source;
  useEffect(() => {
    if (source == null) return;
    const run = ++compiling.current;
    statusListener({ state: "compiling" });
    compileMdx(source).then((result) => {
      if (run !== compiling.current) return;
      if ("error" in result) {
        statusListener({ state: "error", error: result.error });
      } else {
        setRendered((prev) => ({ Content: result.Content, version: prev.version + 1 }));
        statusListener({ state: "ok" });
      }
    });
  }, [source]);

  if (!payload) return null;
  return (
    <PreviewPage
      payload={payload}
      Content={rendered.Content}
      version={rendered.version}
      onRendered={(Content) => (lastGood.current = Content)}
      onRenderError={(error) => {
        statusListener({ state: "error", error: renderError(error, payload.source) });
        // Back to the last version that rendered.
        if (rendered.Content !== lastGood.current) setRendered((prev) => ({ Content: lastGood.current, version: prev.version + 1 }));
      }}
    />
  );
}

/** A render-time error, with the line of the culprit when it can be found (undefined components). */
function renderError(error: unknown, source: string): CompileError {
  const message = error instanceof Error ? error.message : String(error);
  const name = message.match(/Expected component `([^`]+)` to be defined/)?.[1];
  if (name) {
    const lines = source.split("\n");
    const index = lines.findIndex((line) => new RegExp(`<${name.replace(/[.$]/g, "\\$&")}[\\s/>]`).test(line));
    return {
      message: `O componente <${name}> não existe neste blog (adicione-o em _components/mdx.tsx ou remova-o).`,
      line: index >= 0 ? index + 1 : undefined,
    };
  }
  return { message };
}

/* ---------- Scroll mapping (source line ↔ page position) ---------- */

type Mark = { line: number; top: number; height: number };

function marks(): Mark[] {
  const nodes = document.querySelectorAll<HTMLElement>("[data-prose] [data-src-line]");
  const list: Mark[] = [];
  for (const node of nodes) {
    const line = Number(node.dataset.srcLine);
    if (!Number.isFinite(line)) continue;
    const rect = node.getBoundingClientRect();
    list.push({ line, top: rect.top + window.scrollY, height: rect.height });
  }
  return list;
}

const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

function positionOfLine(line: number): number {
  const list = marks();
  // Above the first block (the frontmatter): the top of the page, with the title.
  if (!list.length || line < list[0].line) return 0;
  for (let i = 0; i < list.length; i++) {
    const here = list[i];
    const next = list[i + 1];
    if (!next || line < next.line) {
      const span = next ? next.line - here.line : Math.max(1, (currentPayload?.source.split("\n").length ?? here.line + 1) - here.line);
      const reach = next ? next.top - here.top : here.height;
      return here.top + (Math.min(line - here.line, span) / span) * reach;
    }
  }
  return 0;
}

function lineAtPosition(y: number): number | null {
  const list = marks();
  if (!list.length || y < list[0].top) return null;
  for (let i = 0; i < list.length; i++) {
    const here = list[i];
    const next = list[i + 1];
    if (!next || y < next.top) {
      const reach = next ? next.top - here.top : here.height;
      const span = next ? next.line - here.line : Math.max(1, (currentPayload?.source.split("\n").length ?? here.line + 1) - here.line);
      return here.line + (reach > 0 ? Math.min(1, (y - here.top) / reach) : 0) * span;
    }
  }
  return null;
}

/* ---------- API for the editor ---------- */

const api: PreviewApi = {
  render(payload) {
    currentPayload = payload;
    setPayloadExternal(payload);
  },
  setTheme(theme) {
    document.documentElement.dataset.theme = theme;
  },
  setAnimating,
  scrollToLine(line) {
    window.scrollTo({ top: Math.max(0, positionOfLine(line) - READING_TOP), behavior: "instant" });
  },
  scrollToFraction(fraction) {
    window.scrollTo({ top: maxScroll() * fraction, behavior: "instant" });
  },
  topLine() {
    return lineAtPosition(window.scrollY + READING_TOP);
  },
  scrollFraction() {
    const max = maxScroll();
    return max > 0 ? window.scrollY / max : -1;
  },
  onStatus(listener) {
    statusListener = listener;
  },
  onScroll(listener) {
    scrollListener = listener;
  },
};

window.previewApi = api;
window.addEventListener("scroll", () => scrollListener(), { passive: true });

// Nothing navigates away from the article: in-page anchors scroll, external links open in the browser.
document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  if (target?.closest("[data-preview-theme]")) {
    event.preventDefault();
    currentPayload?.toggleTheme();
    return;
  }
  const link = target?.closest("a");
  if (!link) return;
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("#")) {
    event.preventDefault();
    const id = decodeURIComponent(href.slice(1));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  event.preventDefault();
  if (/^https?:\/\//.test(href)) currentPayload?.openLink(href);
});

createRoot(document.getElementById("root")!).render(<Preview />);
window.parent?.postMessage({ type: READY_MESSAGE }, "*");
