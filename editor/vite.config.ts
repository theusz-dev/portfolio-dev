import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { devBridge } from "./dev-bridge";

const here = path.dirname(fileURLToPath(import.meta.url));
/** The portfolio repository (the editor lives in `<repo>/editor`). */
const repoRoot = path.resolve(here, "..");
/** Where the browser dev bridge reads and writes posts. Overridable to try git flows on a throwaway clone. */
const contentRepo = process.env.CADERNO_REPO ? path.resolve(process.env.CADERNO_REPO) : repoRoot;

// The preview renders posts with the blog's own components and CSS modules,
// imported straight from `src/app/[lang]/<blog>/`. Those files use the site's
// `@/` alias and `next/link`; here `@/` points at the site's `src/` and
// `next/link` at a plain-<a> shim. React must be the editor's own copy, never
// the site's, so hooks in imported components share one React.
const { version } = JSON.parse(fs.readFileSync(path.join(here, "package.json"), "utf8")) as { version: string };

export default defineConfig(({ command }) => ({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [react(), command === "serve" ? devBridge(contentRepo) : null],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.join(repoRoot, "src")}/` },
      { find: /^next\/link$/, replacement: path.join(here, "src/preview/shims/next-link.tsx") },
    ],
    dedupe: ["react", "react-dom"],
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    fs: { allow: [repoRoot, contentRepo] },
    watch: { ignored: ["**/src-tauri/**"] },
  },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: {
    target: ["es2022", "safari16"],
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      input: {
        main: path.join(here, "index.html"),
        preview: path.join(here, "preview.html"),
      },
    },
  },
}));
