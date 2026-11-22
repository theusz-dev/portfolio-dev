import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRemote, status, type RepoStatus } from "../lib/git";

const FETCH_EVERY_MS = 5 * 60_000;

/**
 * The repository's git state, kept fresh: re-read after saves and when the
 * window comes back, and the remote fetched every few minutes (quietly; an
 * offline machine just keeps the last numbers).
 */
export function useGit(enabled: boolean) {
  const [repo, setRepo] = useState<RepoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const lastFetch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const refresh = useCallback(async () => {
    try {
      const next = await status();
      setRepo(next);
      setError(null);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, []);

  /** Re-read soon (several saves in a row cost one `git status`). */
  const refreshSoon = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void refresh(), 800);
  }, [refresh]);

  const fetchNow = useCallback(async () => {
    setFetching(true);
    lastFetch.current = Date.now();
    try {
      await fetchRemote();
    } finally {
      setFetching(false);
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    void refresh().then(() => fetchNow());
    const every = setInterval(() => void fetchNow(), FETCH_EVERY_MS);
    const onFocus = () => {
      if (Date.now() - lastFetch.current > 2 * 60_000) void fetchNow();
      else void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(every);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, refresh, fetchNow]);

  return { repo, error, fetching, refresh, refreshSoon, fetchNow };
}
