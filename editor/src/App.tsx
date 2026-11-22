import { Columns2, ExternalLink, Focus, Moon, PanelLeft, PanelRight, PenLine, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageDialog, NewPostDialog, type NewPostInput } from "./components/Dialogs";
import { DocHeader } from "./components/DocHeader";
import { Library } from "./components/Library";
import { ArchiveDialog, DeleteDialog, PublishDialog, SendDraftDialog, type LifecycleContext, type LifecycleKind } from "./components/Lifecycle";
import { PreviewPane, type PreviewHandle, type PreviewWidth } from "./components/PreviewPane";
import { Setup } from "./components/Setup";
import { StatusBar } from "./components/StatusBar";
import { Toasts, useToasts } from "./components/Toasts";
import { Toolbar } from "./components/Toolbar";
import { isMac, WindowControls } from "./components/WindowControls";
import { MarkdownEditor, type EditorHandle } from "./editor/MarkdownEditor";
import { api, errorMessage, inTauri, openExternal, publicAssetResolver, type AppConfig } from "./lib/api";
import { lineOffset, parsePost, readingStats, serializePost, SLUG, today, validate } from "./lib/frontmatter";
import { altFromName, prepareImage } from "./lib/images";
import { changedImages, postGit } from "./lib/git";
import { buildLibrary, neighbours, type PostState } from "./lib/library";
import { otherLang, postPath, type RawPost } from "./lib/types";
import type { PreviewPayload, PreviewStatus } from "./preview/protocol";
import { sourceOf, useDocument, type Doc } from "./state/useDocument";
import { usePersisted, useTheme } from "./state/prefs";
import { useGit } from "./state/useGit";

type View = "split" | "editor" | "preview";
type Dialog = { kind: "new" } | { kind: "image"; file: File; resolve: (alt: string | null) => void } | { kind: LifecycleKind; doc: Doc } | null;

export function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [raw, setRaw] = useState<RawPost[]>([]);
  const entries = useMemo(() => buildLibrary(raw), [raw]);
  const { toasts, push, dismiss } = useToasts();

  const git = useGit(!!config?.repo);
  const { refreshSoon: gitRefreshSoon, refresh: gitRefresh } = git;
  const { doc, docKey, saveState, actions: document_ } = useDocument({
    onSaved: (path, source) => {
      setRaw((list) => list.map((p) => (p.path === path ? { ...p, source, modified: Date.now() } : p)));
      gitRefreshSoon();
    },
    onError: (message) => push("error", message),
  });

  const [view, setView] = usePersisted<View>("caderno:view", "split");
  const [sidebar, setSidebar] = usePersisted("caderno:sidebar", true);
  const [focus, setFocus] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = usePersisted("caderno:frontmatter-collapsed", false);
  const [theme, toggleTheme] = useTheme();
  const [previewThemeChoice, setPreviewThemeChoice] = usePersisted<"light" | "dark" | null>("caderno:preview-theme", null);
  const previewTheme = previewThemeChoice ?? theme;
  const [previewWidth, setPreviewWidth] = usePersisted<PreviewWidth>("caderno:preview-width", "fluid");
  const [lastPath, setLastPath] = usePersisted<string | null>("caderno:last", null);
  const [status, setStatus] = useState<PreviewStatus>({ state: "ok" });
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [windowFocused, setWindowFocused] = useState(() => document.hasFocus());
  useEffect(() => {
    const on = () => setWindowFocused(true);
    // Focus moving into the preview frame also blurs this window; only a real switch away counts.
    const off = () => setTimeout(() => setWindowFocused(document.hasFocus()), 0);
    window.addEventListener("focus", on);
    window.addEventListener("blur", off);
    return () => {
      window.removeEventListener("focus", on);
      window.removeEventListener("blur", off);
    };
  }, []);
  const [resolveAsset, setResolveAsset] = useState<((p: string) => string) | null>(null);

  const editor = useRef<EditorHandle>(null);
  const preview = useRef<PreviewHandle>(null);
  const search = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  /* ---------- Library ---------- */

  const refresh = useCallback(async () => {
    try {
      const list = await api.listPosts();
      setRaw(list);
      gitRefreshSoon();
      return list;
    } catch (error) {
      push("error", `Não foi possível ler os posts: ${errorMessage(error)}`);
      return null;
    }
  }, [push, gitRefreshSoon]);

  const open = useCallback(
    async (path: string) => {
      try {
        const next = await document_.open(path);
        setLastPath(path);
        setStatus({ state: "ok" });
        return next;
      } catch (error) {
        push("error", `Não foi possível abrir ${path}: ${errorMessage(error)}`);
        return null;
      }
    },
    [document_, push, setLastPath],
  );

  // Start: configuration, posts, last open post.
  useEffect(() => {
    api
      .config()
      .then(setConfig)
      .catch((error) => push("error", errorMessage(error)));
  }, [push]);

  useEffect(() => {
    if (!config?.repo) return;
    publicAssetResolver(config.repo).then((fn) => setResolveAsset(() => fn));
    refresh().then((list) => {
      if (!list) return;
      const live = list.filter((p) => !p.archived);
      const start = list.find((p) => p.path === lastPath) ?? live[0];
      if (start) open(start.path);
    });
    // Only when the repository changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.repo]);

  // Back to the window: files may have changed (another editor, git pull).
  useEffect(() => {
    if (!config?.repo) return;
    const onFocus = async () => {
      const list = await refresh();
      if (!list || !doc) return;
      const onDisk = list.find((p) => p.path === doc.path);
      if (!onDisk) push("info", "O arquivo aberto não existe mais no disco. Ele será recriado ao salvar.");
      else if (document_.reloadIfUntouched(onDisk.path, onDisk.source)) push("info", "O post mudou no disco e foi recarregado.");
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [config?.repo, doc, document_, push, refresh]);

  /* ---------- Derived ---------- */

  const entry = doc ? entries.find((e) => e.path === doc.path) : undefined;
  const translation = entry?.translation ?? null;
  const docGit = doc && git.repo ? postGit(git.repo, [doc.path, ...changedImages(git.repo, doc.collection, doc.slug, [doc.body])]) : null;
  const liveState: PostState = doc ? (doc.archived ? "archived" : doc.meta.draft ? "draft" : "published") : "draft";
  const errors = doc && !doc.raw ? validate(doc.meta, doc.slug) : {};
  const offset = doc && !doc.raw ? lineOffset(doc.meta) : 0;
  const body = doc ? (doc.raw ? parsePost(doc.body).body : doc.body) : "";
  const stats = readingStats(body);

  // The preview follows the text a beat behind, so typing stays smooth.
  const [previewDoc, setPreviewDoc] = useState(doc);
  useEffect(() => {
    const timer = setTimeout(() => setPreviewDoc(doc), doc && previewDoc && doc.path === previewDoc.path ? 220 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const payload = useMemo<PreviewPayload | null>(() => {
    if (!previewDoc || !resolveAsset) return null;
    const meta = previewDoc.raw ? parsePost(previewDoc.body).meta : previewDoc.meta;
    const languages = [previewDoc.lang, ...(translation ? [otherLang(previewDoc.lang)] : [])];
    return {
      collection: previewDoc.collection,
      lang: previewDoc.lang,
      slug: previewDoc.slug,
      meta,
      source: sourceOf(previewDoc),
      languages,
      neighbours: neighbours(entries, { collection: previewDoc.collection, lang: previewDoc.lang, slug: previewDoc.slug, date: meta.date }),
      readingMinutes: readingStats(previewDoc.raw ? parsePost(previewDoc.body).body : previewDoc.body).minutes,
      resolveAsset,
      openLink: (url) => void openExternal(url),
      toggleTheme: () => setPreviewThemeChoice(previewTheme === "dark" ? "light" : "dark"),
    };
  }, [previewDoc, resolveAsset, translation, entries, previewTheme, setPreviewThemeChoice]);

  // Compile errors: file line → editor line.
  const errorLine = status.state === "error" && status.error.line != null && status.error.line - offset >= 1 ? status.error.line - offset : null;
  useEffect(() => {
    editor.current?.setError(status.state === "error" && errorLine != null ? { line: errorLine, column: status.error.column, message: status.error.message } : null);
  }, [status, errorLine]);

  const windowTitle = doc ? `${doc.meta.title || doc.slug} — Caderno` : "Caderno";
  useEffect(() => {
    document.title = windowTitle;
    if (inTauri) import("@tauri-apps/api/window").then(({ getCurrentWindow }) => getCurrentWindow().setTitle(windowTitle)).catch(() => {});
  }, [windowTitle]);

  /* ---------- Scroll sync ---------- */

  const lock = useRef<{ from: "editor" | "preview"; until: number } | null>(null);
  const syncFromEditor = useCallback(() => {
    if (view !== "split") return;
    const held = lock.current;
    if (held && held.from === "preview" && performance.now() < held.until) return;
    const p = preview.current?.api();
    const e = editor.current;
    if (!p || !e) return;
    lock.current = { from: "editor", until: performance.now() + 150 };
    if (e.scrollFraction() <= 0) p.scrollToFraction(0);
    else p.scrollToLine(e.topLine() + offset);
  }, [view, offset]);

  const syncFromPreview = useCallback(() => {
    if (view !== "split") return;
    const held = lock.current;
    if (held && held.from === "editor" && performance.now() < held.until) return;
    const p = preview.current?.api();
    const e = editor.current;
    if (!p || !e) return;
    lock.current = { from: "preview", until: performance.now() + 150 };
    const line = p.topLine();
    if (line == null) e.scrollToFraction(0);
    else e.scrollToLine(line - offset);
  }, [view, offset]);

  const onStatus = useCallback(
    (next: PreviewStatus) => {
      setStatus((prev) => (next.state === "compiling" && prev.state === "error" ? prev : next));
      // After a re-render the page height changed: line it up with the editor again.
      if (next.state === "ok") requestAnimationFrame(() => requestAnimationFrame(syncFromEditor));
    },
    [syncFromEditor],
  );

  /* ---------- Actions ---------- */

  const createPost = async (input: NewPostInput) => {
    setDialog(null);
    const path = postPath(input.collection, input.lang, input.slug);
    const source = serializePost(
      { title: input.title, description: input.description, date: today(), updated: "", tags: [], draft: true, extra: {} },
      "\n",
    );
    try {
      await api.createPost(path, source);
      await refresh();
      await open(path);
      setTimeout(() => editor.current?.focus(), 50);
    } catch (error) {
      push("error", `Não foi possível criar o post: ${errorMessage(error)}`);
    }
  };

  const openOrCreateTranslation = async () => {
    if (!doc) return;
    if (translation) {
      await open(translation);
      return;
    }
    if (doc.archived) {
      push("info", "Desarquive o post antes de criar a tradução.");
      return;
    }
    const other = otherLang(doc.lang);
    const target = postPath(doc.collection, other, doc.slug);
    try {
      await document_.save();
      await api.createPost(target, serializePost({ ...doc.meta, draft: true }, "\n"));
      await refresh();
      await open(target);
      push("success", `Versão ${other.toUpperCase()} criada como rascunho, com o frontmatter copiado. Traduza o título e a descrição.`);
    } catch (error) {
      push("error", `Não foi possível criar a tradução: ${errorMessage(error)}`);
    }
  };

  const renameSlug = async (slug: string) => {
    if (!doc) return;
    if (!SLUG.test(slug)) {
      push("error", "Slug inválido: só minúsculas, números e hífens (ex.: meu-post).");
      return;
    }
    const clash = entries.find((e) => e.collection === doc.collection && e.slug === slug && e.archived === doc.archived);
    if (clash) {
      push("error", `Já existe um post com o slug “${slug}” (${clash.lang.toUpperCase()}).`);
      return;
    }
    try {
      await document_.rename(slug, translation);
      setLastPath(postPath(doc.collection, doc.lang, slug, doc.archived));
      await refresh();
      push("success", translation ? "Post e tradução renomeados." : "Post renomeado.");
    } catch (error) {
      push("error", `Não foi possível renomear: ${errorMessage(error)}`);
    }
  };

  const askImage = (file: File) => new Promise<string | null>((resolve) => setDialog({ kind: "image", file, resolve }));

  const insertImages = async (files: File[], pos?: number) => {
    if (!doc) return;
    if (!SLUG.test(doc.slug)) {
      push("error", "Defina um slug válido antes de inserir imagens (o nome do arquivo vem dele).");
      return;
    }
    let at = pos;
    for (const file of files) {
      const alt = await askImage(file);
      setDialog(null);
      if (alt == null) continue;
      try {
        const { bytes, ext } = await prepareImage(file);
        const sitePath = await api.saveImage(doc.collection, doc.slug, ext, bytes);
        editor.current?.insertBlock(`![${alt.replace(/[[\]]/g, "")}](${sitePath})`, at);
        at = undefined;
        push("success", `Imagem salva em public${sitePath}`);
      } catch (error) {
        push("error", `Não foi possível salvar a imagem: ${errorMessage(error)}`);
      }
    }
  };

  const openOnSite = async () => {
    if (!doc) return;
    if (doc.archived) {
      push("info", "Posts arquivados não aparecem no site.");
      return;
    }
    const url = `http://localhost:3000/${doc.lang}/${doc.collection}/${doc.slug}`;
    const running = await api.devServerRunning().catch(() => false);
    if (!running) {
      push("info", "O site não está rodando em localhost:3000. Rode “npm run dev” na raiz do repositório e tente de novo.");
      return;
    }
    await openExternal(url);
  };

  const reloadAll = useCallback(async () => {
    const [list] = await Promise.all([refresh(), gitRefresh()]);
    return buildLibrary(list ?? []);
  }, [refresh, gitRefresh]);

  // The dialog keeps the post it was opened for: deleting closes the post midway.
  const lifecycleDoc = dialog && "doc" in dialog ? dialog.doc : null;
  const lifecycleOther = lifecycleDoc ? (entries.find((e) => e.path === entries.find((x) => x.path === lifecycleDoc.path)?.translation) ?? null) : null;
  const lifecycle: LifecycleContext | null = lifecycleDoc
    ? {
        doc: lifecycleDoc,
        other: lifecycleOther,
        repo: git.repo,
        gitError: git.error,
        actions: { save: document_.save, setMetaNow: document_.setMetaNow, close: document_.close },
        reload: reloadAll,
        openPath: open,
        notify: push,
        onClose: () => setDialog(null),
      }
    : null;

  const backToDraft = async () => {
    await document_.setMetaNow({ draft: true });
    push("info", "Voltou a rascunho no disco. No site ele só sai depois de “Enviar rascunho” (no menu ⋯).");
  };

  const cycleView = useCallback(() => setView((v) => (v === "split" ? "editor" : v === "editor" ? "preview" : "split")), [setView]);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (dialog) return;
      const key = event.key.toLowerCase();
      if (mod && !event.shiftKey && key === "n") {
        event.preventDefault();
        setDialog({ kind: "new" });
      } else if (mod && !event.shiftKey && key === "p") {
        event.preventDefault();
        setFocus(false);
        setSidebar(true);
        setTimeout(() => search.current?.focus(), 0);
      } else if (mod && key === "\\") {
        event.preventDefault();
        cycleView();
      } else if (mod && event.shiftKey && key === "f") {
        event.preventDefault();
        setFocus((f) => !f);
      } else if (mod && key === "s") {
        event.preventDefault();
        document_.save();
      } else if (key === "escape" && focus) {
        setFocus(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, focus, cycleView, document_, setSidebar]);

  // Save before the window goes away.
  useEffect(() => {
    const onHide = () => void document_.save();
    window.addEventListener("beforeunload", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("beforeunload", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [document_]);

  /* ---------- Render ---------- */

  if (!config) return <div className="boot" />;
  if (!config.repo) return <Setup suggested={config.suggested} onDone={(repo) => setConfig({ ...config, repo })} />;

  const taken = new Set(entries.map((e) => `${e.collection}/${e.lang}/${e.slug}`));
  const showSidebar = sidebar && !focus;

  return (
    <div className="app" data-focus={focus || undefined} data-sidebar={showSidebar || undefined}>
      {showSidebar && <Library ref={search} entries={entries} git={git.repo} active={doc} preferredLang={doc?.lang ?? "pt"} onOpen={open} onNew={() => setDialog({ kind: "new" })} />}

      <main className="main">
        <div className="topbar" data-tauri-drag-region data-mac={(inTauri && isMac && !showSidebar) || undefined}>
          <button type="button" className="icon-button" onClick={() => (focus ? setFocus(false) : setSidebar(!sidebar))} title="Biblioteca" aria-label="Mostrar ou esconder a biblioteca">
            <PanelLeft size={16} />
          </button>
          <div className="topbar-spacer" data-tauri-drag-region>
            {doc && (
              <span className="topbar-title" data-tauri-drag-region>
                {doc.meta.title || doc.slug}
              </span>
            )}
          </div>
          <div className="mini-seg" role="radiogroup" aria-label="Visualização">
            <button type="button" role="radio" aria-checked={view === "editor"} onClick={() => setView("editor")} title="Só o editor (Ctrl+\)">
              <PenLine size={14} />
            </button>
            <button type="button" role="radio" aria-checked={view === "split"} onClick={() => setView("split")} title="Editor e preview (Ctrl+\)">
              <Columns2 size={14} />
            </button>
            <button type="button" role="radio" aria-checked={view === "preview"} onClick={() => setView("preview")} title="Só o preview (Ctrl+\)">
              <PanelRight size={14} />
            </button>
          </div>
          <button type="button" className="icon-button" data-on={focus || undefined} onClick={() => setFocus(!focus)} title="Modo foco (Ctrl+Shift+F)" aria-label="Modo foco">
            <Focus size={16} />
          </button>
          <button type="button" className="icon-button" onClick={openOnSite} disabled={!doc} title="Abrir no site (localhost:3000)" aria-label="Abrir no site">
            <ExternalLink size={16} />
          </button>
          <button type="button" className="icon-button" onClick={toggleTheme} title={theme === "dark" ? "Tema claro" : "Tema escuro"} aria-label="Alternar tema">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <WindowControls />
        </div>

        {doc ? (
          <div className="workspace" data-view={view}>
            <section className="editor-pane">
              {!focus && (
                <DocHeader
                  doc={doc}
                  state={liveState}
                  errors={errors}
                  translation={translation}
                  collapsed={headerCollapsed}
                  onCollapse={setHeaderCollapsed}
                  onMeta={document_.setMeta}
                  onSlug={renameSlug}
                  onTranslation={openOrCreateTranslation}
                  git={docGit}
                  onPublish={() => doc && setDialog({ kind: "publish", doc })}
                  onArchive={() => doc && setDialog({ kind: "archive", doc })}
                  onDelete={() => doc && setDialog({ kind: "delete", doc })}
                  onDraft={() => void backToDraft()}
                  onSendDraft={() => doc && setDialog({ kind: "sendDraft", doc })}
                />
              )}
              <Toolbar
                onFormat={(command) => editor.current?.format(command)}
                onCodeBlock={(lang) => editor.current?.codeBlock(lang)}
                onImage={() => imageInput.current?.click()}
              />
              <MarkdownEditor
                ref={editor}
                docKey={`${docKey}`}
                value={doc.body}
                onChange={document_.setBody}
                onScroll={syncFromEditor}
                onCursor={setCursor}
                onFiles={(files, pos) => void insertImages(files, pos)}
                onSave={() => void document_.save()}
              />
            </section>
            <PreviewPane
              ref={preview}
              payload={payload}
              theme={previewTheme}
              animate={!dialog && windowFocused && view !== "editor"}
              onTheme={setPreviewThemeChoice}
              width={previewWidth}
              onWidth={setPreviewWidth}
              status={status}
              onStatus={onStatus}
              onScroll={syncFromPreview}
              errorLine={errorLine}
              onGotoError={() => errorLine != null && editor.current?.gotoLine(errorLine)}
            />
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-title">Nenhum artigo aberto</p>
            <p className="hint">
              Escolha um na biblioteca ou crie um novo com <kbd>Ctrl N</kbd>.
            </p>
          </div>
        )}

        <StatusBar
          doc={doc}
          saveState={saveState}
          words={stats.words}
          minutes={stats.minutes}
          cursor={cursor}
          status={status}
          errorLine={errorLine}
          invalid={Object.keys(errors).length > 0}
          repo={config.repo}
          git={git.repo}
          gitError={git.error}
          fetching={git.fetching}
          onFetch={() => void git.fetchNow()}
        />
      </main>

      <input
        ref={imageInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
        multiple
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) void insertImages(files);
        }}
      />

      {dialog?.kind === "new" && (
        <NewPostDialog
          initial={{ collection: doc?.collection ?? "engineering", lang: doc?.lang ?? "pt" }}
          taken={taken}
          onCreate={createPost}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "image" && doc && (
        <ImageDialog
          file={dialog.file}
          suggestion={altFromName(dialog.file.name)}
          target={`public/blog/${doc.collection}/${doc.slug}-N.${dialog.file.type === "image/png" || dialog.file.type === "image/jpeg" ? "webp" : (dialog.file.name.split(".").pop() ?? "")}`}
          onConfirm={(alt) => dialog.resolve(alt)}
          onClose={() => dialog.resolve(null)}
        />
      )}
      {dialog?.kind === "publish" && lifecycle && <PublishDialog {...lifecycle} />}
      {dialog?.kind === "sendDraft" && lifecycle && <SendDraftDialog {...lifecycle} />}
      {dialog?.kind === "archive" && lifecycle && <ArchiveDialog {...lifecycle} />}
      {dialog?.kind === "delete" && lifecycle && <DeleteDialog {...lifecycle} />}
      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
