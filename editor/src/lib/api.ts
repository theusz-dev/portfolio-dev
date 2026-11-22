import type { Collection, RawPost } from "./types";

/**
 * Everything that touches the disk goes through here.
 *
 * In the desktop app these are Tauri commands (src-tauri/src/lib.rs). When the
 * UI runs in a plain browser (`npm run dev` without Tauri), the same commands
 * are answered by the Vite dev bridge (dev-bridge.ts), so the interface can be
 * worked on without compiling Rust.
 */

export const inTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function call<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  if (inTauri) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>(command, args);
  }
  const response = await fetch(`/__bridge/${command}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || response.statusText);
  return (text ? JSON.parse(text) : null) as T;
}

/** Turns whatever a command threw into a readable message. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export type AppConfig = {
  /** Absolute path of the portfolio repository, once chosen. */
  repo: string | null;
  /** A likely repository (the folder above `editor/` when it exists). */
  suggested: string | null;
};

export const api = {
  config: () => call<AppConfig>("get_config"),
  /** Validates the folder (must look like the portfolio) and remembers it. */
  setRepo: (path: string) => call<string>("set_repo", { path }),
  listPosts: () => call<RawPost[]>("list_posts"),
  readPost: (path: string) => call<string>("read_post", { path }),
  /** Overwrites a post file (atomically). */
  writePost: (path: string, source: string) => call<void>("write_post", { path, source }),
  /** Creates a post file; fails if it already exists. */
  createPost: (path: string, source: string) => call<void>("create_post", { path, source }),
  /** Renames a post file; fails if the destination exists. */
  movePost: (from: string, to: string) => call<void>("move_post", { from, to }),
  /** Saves image bytes as `public/blog/<collection>/<slug>-<n>.<ext>`; returns the site path (`/blog/...`). */
  saveImage: async (collection: Collection, slug: string, ext: string, bytes: Uint8Array) => {
    if (inTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<string>("save_image", bytes, { headers: { "x-collection": collection, "x-slug": slug, "x-ext": ext } });
    }
    const response = await fetch("/__bridge/save_image", {
      method: "POST",
      headers: { "x-collection": collection, "x-slug": slug, "x-ext": ext },
      body: bytes as BodyInit,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return JSON.parse(text) as string;
  },
  /** One git command in the repository; the backend refuses anything outside the publishing flows. */
  git: (args: string[]) => call<{ code: number; stdout: string; stderr: string }>("git", { args }),
  /** Moves posts / post images to the system trash. */
  trashFiles: (paths: string[]) => call<void>("trash_files", { paths }),
  /** Whether something answers on localhost:3000 (the site's dev server). */
  devServerRunning: () => call<boolean>("dev_server_running"),
};

/** URL the webview can load for a file under the repository's `public/` (e.g. `/blog/engineering/x.webp`). */
export async function publicAssetResolver(repo: string): Promise<(sitePath: string) => string> {
  if (inTauri) {
    const { convertFileSrc } = await import("@tauri-apps/api/core");
    const base = repo.replace(/[\\/]+$/, "");
    return (sitePath) => convertFileSrc(`${base}/public${sitePath}`);
  }
  return (sitePath) => `/__bridge/public${sitePath}`;
}

export async function openExternal(url: string) {
  if (inTauri) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank", "noopener");
  }
}

/** Asks for a folder. Returns `null` when cancelled (or unsupported in the browser). */
export async function pickFolder(defaultPath?: string): Promise<string | null> {
  if (!inTauri) return null;
  const { open } = await import("@tauri-apps/plugin-dialog");
  const result = await open({ directory: true, multiple: false, defaultPath });
  return typeof result === "string" ? result : null;
}
