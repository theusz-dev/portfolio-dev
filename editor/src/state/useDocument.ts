import { useCallback, useMemo, useRef, useState } from "react";
import { api, errorMessage } from "../lib/api";
import { parsePost, serializePost, type Meta } from "../lib/frontmatter";
import { postPath, type Collection, type Lang } from "../lib/types";

export type Doc = {
  path: string;
  collection: Collection;
  lang: Lang;
  slug: string;
  archived: boolean;
  meta: Meta;
  body: string;
  /**
   * The frontmatter couldn't be read (broken YAML, no block). The editor then
   * shows the whole file as text and saves it as is, so nothing gets lost.
   */
  raw: boolean;
  problem: string | null;
};

export type SaveState = "saved" | "dirty" | "saving" | "error";

const PATH = /^src\/content\/(_archive\/)?(engineering|reflections)\/(pt|en)\/([^/]+)\.mdx$/;

export function describePath(path: string) {
  const match = path.match(PATH);
  if (!match) throw new Error(`Caminho inesperado: ${path}`);
  return { archived: !!match[1], collection: match[2] as Collection, lang: match[3] as Lang, slug: match[4] };
}

export function docFromSource(path: string, source: string): Doc {
  const { meta, body, problem } = parsePost(source);
  return { path, ...describePath(path), meta, body: problem ? source : body, raw: !!problem, problem };
}

export const sourceOf = (doc: Doc) => (doc.raw ? doc.body : serializePost(doc.meta, doc.body));

const AUTOSAVE_MS = 700;

type Options = {
  onSaved: (path: string, source: string) => void;
  onError: (message: string) => void;
};

/** The open post: loading, editing, autosave (debounced) and renaming. */
export function useDocument({ onSaved, onError }: Options) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  /** Bumped whenever a different text is loaded into the editor. */
  const [docKey, setDocKey] = useState(0);

  const docRef = useRef<Doc | null>(null);
  docRef.current = doc;
  const savedSource = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const callbacks = useRef({ onSaved, onError });
  callbacks.current = { onSaved, onError };

  /** Writes the open post if it changed. Saves run one after another. */
  const save = useCallback(() => {
    clearTimeout(timer.current);
    queue.current = queue.current.then(async () => {
      const current = docRef.current;
      if (!current) return;
      const source = sourceOf(current);
      if (source === savedSource.current) {
        setSaveState("saved");
        return;
      }
      setSaveState("saving");
      try {
        await api.writePost(current.path, source);
        savedSource.current = source;
        const now = docRef.current;
        setSaveState(now && now.path === current.path && sourceOf(now) !== source ? "dirty" : "saved");
        callbacks.current.onSaved(current.path, source);
      } catch (error) {
        setSaveState("error");
        callbacks.current.onError(`Não foi possível salvar: ${errorMessage(error)}`);
      }
    });
    return queue.current;
  }, []);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(save, AUTOSAVE_MS);
  }, [save]);

  const update = useCallback(
    (change: (doc: Doc) => Doc) => {
      setDoc((prev) => {
        if (!prev) return prev;
        const next = change(prev);
        docRef.current = next;
        return next;
      });
      setSaveState("dirty");
      schedule();
    },
    [schedule],
  );

  const setMeta = useCallback((patch: Partial<Meta>) => update((d) => ({ ...d, meta: { ...d.meta, ...patch } })), [update]);
  const setBody = useCallback((body: string) => update((d) => (d.body === body ? d : { ...d, body })), [update]);

  /** Changes the frontmatter and writes it right away (publishing, back to draft). */
  const setMetaNow = useCallback(
    async (patch: Partial<Meta>) => {
      const current = docRef.current;
      if (!current) return;
      const next = { ...current, meta: { ...current.meta, ...patch } };
      docRef.current = next;
      setDoc(next);
      await save();
    },
    [save],
  );

  /** Saves the current post, then opens `path`. */
  const open = useCallback(
    async (path: string) => {
      await save();
      const source = await api.readPost(path);
      const next = docFromSource(path, source);
      savedSource.current = source;
      docRef.current = next;
      setDoc(next);
      setSaveState("saved");
      setDocKey((k) => k + 1);
      return next;
    },
    [save],
  );

  const close = useCallback(async () => {
    await save();
    docRef.current = null;
    setDoc(null);
  }, [save]);

  /** The file changed on disk (another editor, git). Reload it unless there are unsaved edits. */
  const reloadIfUntouched = useCallback((path: string, source: string) => {
    const current = docRef.current;
    if (!current || current.path !== path) return false;
    if (source === savedSource.current || sourceOf(current) !== savedSource.current) return false;
    const next = docFromSource(path, source);
    savedSource.current = source;
    docRef.current = next;
    setDoc(next);
    setDocKey((k) => k + 1);
    return true;
  }, []);

  /**
   * Renames the post (and its translation, so the two stay linked). The
   * caller refreshes the library.
   */
  const rename = useCallback(
    async (slug: string, translationPath: string | null) => {
      const current = docRef.current;
      if (!current || slug === current.slug) return;
      await save();
      const to = postPath(current.collection, current.lang, slug, current.archived);
      await api.movePost(current.path, to);
      if (translationPath) {
        const other = describePath(translationPath);
        try {
          await api.movePost(translationPath, postPath(other.collection, other.lang, slug, other.archived));
        } catch (error) {
          callbacks.current.onError(`O post foi renomeado, mas a tradução não: ${errorMessage(error)}`);
        }
      }
      const next = { ...current, path: to, slug };
      docRef.current = next;
      setDoc(next);
    },
    [save],
  );

  // Stable across renders, so it can sit in effect dependencies.
  const actions = useMemo(
    () => ({ open, close, save, setMeta, setMetaNow, setBody, rename, reloadIfUntouched }),
    [open, close, save, setMeta, setMetaNow, setBody, rename, reloadIfUntouched],
  );
  return { doc, docKey, saveState, actions };
}
