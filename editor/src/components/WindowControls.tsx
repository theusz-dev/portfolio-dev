import { useEffect, useState } from "react";
import { inTauri } from "../lib/api";

/** macOS keeps its native traffic lights (overlay title bar); elsewhere the app draws its own. */
export const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || navigator.userAgent);
export const customChrome = inTauri && !isMac;

const win = () => import("@tauri-apps/api/window").then((m) => m.getCurrentWindow());

/** Minimise / maximise / close for the undecorated window (Linux, Windows). */
export function WindowControls() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!customChrome) return;
    let unlisten: (() => void) | undefined;
    let alive = true;
    void win().then(async (w) => {
      const sync = async () => alive && setMaximized(await w.isMaximized());
      await sync();
      const off = await w.onResized(() => void sync());
      if (alive) unlisten = off;
      else off();
    });
    return () => {
      alive = false;
      unlisten?.();
    };
  }, []);

  if (!customChrome) return null;
  return (
    <div className="window-controls">
      <button type="button" onClick={() => void win().then((w) => w.minimize())} title="Minimizar" aria-label="Minimizar">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7" />
        </svg>
      </button>
      <button type="button" onClick={() => void win().then((w) => w.toggleMaximize())} title={maximized ? "Restaurar" : "Maximizar"} aria-label={maximized ? "Restaurar" : "Maximizar"}>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          {maximized ? (
            <>
              <rect x="2.5" y="4" width="5.5" height="5.5" rx="1" />
              <path d="M4.5 4V3.5a1 1 0 0 1 1-1H8.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H8" />
            </>
          ) : (
            <rect x="2.5" y="2.5" width="7" height="7" rx="1.2" />
          )}
        </svg>
      </button>
      <button type="button" className="close" onClick={() => void win().then((w) => w.close())} title="Fechar" aria-label="Fechar">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" />
        </svg>
      </button>
    </div>
  );
}
