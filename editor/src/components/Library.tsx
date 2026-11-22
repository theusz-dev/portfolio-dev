import { ChevronRight, Plus, Search } from "lucide-react";
import { forwardRef, useMemo, useState } from "react";
import { articleKeyOf, groupArticles, matches, type Article, type PostEntry, type PostState } from "../lib/library";
import { collectionNames, locales, type Collection, type Lang } from "../lib/types";
import { inTauri } from "../lib/api";
import type { RepoStatus } from "../lib/git";
import { Segmented } from "./Dialogs";
import { isMac } from "./WindowControls";

const GROUPS: { state: PostState; title: string }[] = [
  { state: "draft", title: "Rascunhos" },
  { state: "published", title: "Publicados" },
  { state: "archived", title: "Arquivados" },
];

type Filter = "all" | Collection;

type Props = {
  entries: PostEntry[];
  git: RepoStatus | null;
  /** The open post, to mark its article. */
  active: PostEntry | { archived: boolean; collection: string; slug: string } | null;
  /** Language to open first (the one being written in). */
  preferredLang: Lang;
  onOpen: (path: string) => void;
  onNew: () => void;
};

/** Both blogs, both languages, grouped by state. */
export const Library = forwardRef<HTMLInputElement, Props>(function Library({ entries, git, active, preferredLang, onOpen, onNew }, searchRef) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [closed, setClosed] = useState<Record<PostState, boolean>>({ draft: false, published: false, archived: true });

  const articles = useMemo(() => groupArticles(entries), [entries]);
  const visible = useMemo(
    () =>
      articles.filter(
        (a) => (filter === "all" || a.collection === filter) && (Object.values(a.versions) as PostEntry[]).some((v) => matches(v, query)),
      ),
    [articles, filter, query],
  );
  const activeKey = active ? articleKeyOf(active) : null;
  const openArticle = (article: Article) => {
    const version = article.versions[preferredLang] ?? article.versions.pt ?? article.versions.en;
    if (version) onOpen(version.path);
  };

  return (
    <aside className="library">
      <div className="library-head">
        <div className="brand" data-tauri-drag-region data-mac={(inTauri && isMac) || undefined}>
          <span className="brand-name" data-tauri-drag-region>
            Caderno
          </span>
          <button type="button" className="icon-button" onClick={onNew} title="Novo artigo (Ctrl+N)" aria-label="Novo artigo">
            <Plus size={16} />
          </button>
        </div>
        <label className="search">
          <Search size={14} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
              if (e.key === "Enter" && visible[0]) openArticle(visible[0]);
            }}
          />
          <kbd>Ctrl P</kbd>
        </label>
        <Segmented
          size="small"
          value={filter}
          options={[
            ["all", "Todos"],
            ["engineering", "Engenharia"],
            ["reflections", "Reflexões"],
          ]}
          onChange={setFilter}
        />
      </div>

      <div className="library-list">
        {GROUPS.map(({ state, title }) => {
          const items = visible.filter((e) => e.state === state);
          if (state === "archived" && items.length === 0) return null;
          const isClosed = closed[state] && !query;
          return (
            <section key={state} className="group">
              <button type="button" className="group-head" onClick={() => setClosed((c) => ({ ...c, [state]: !c[state] }))} aria-expanded={!isClosed}>
                <ChevronRight size={12} className="chev" data-open={!isClosed || undefined} />
                <span>{title}</span>
                <span className="count">{items.length}</span>
              </button>
              {!isClosed && (
                <ul>
                  {items.length === 0 && <li className="empty">{query ? "Nada encontrado." : "Nenhum."}</li>}
                  {items.map((article) => (
                    <li key={article.key}>
                      <ArticleRow article={article} git={git} active={article.key === activeKey} onOpen={() => openArticle(article)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <footer className="library-foot mono" title="Versão do Caderno">
        Caderno {__APP_VERSION__}
      </footer>
    </aside>
  );
});

function ArticleRow({ article, git, active, onOpen }: { article: Article; git: RepoStatus | null; active: boolean; onOpen: () => void }) {
  const versions = Object.values(article.versions) as PostEntry[];
  const problem = versions.find((v) => v.problem)?.problem;
  const pending = !!git && versions.some((v) => git.files.has(v.path) || git.unpushed.has(v.path));
  return (
    <button type="button" className="post-row" data-active={active || undefined} onClick={onOpen}>
      <span className="post-title">{article.title || <em>{article.slug}</em>}</span>
      <span className="post-meta">
        <span>{article.date || "sem data"}</span>
        <span className="sep">·</span>
        <span>{collectionNames[article.collection]}</span>
        <span className="langs">
          {locales.map((lang) => {
            const version = article.versions[lang];
            const status = !version ? "missing" : version.meta.draft && article.state !== "draft" ? "draft" : "ok";
            const label = !version ? `Sem versão ${lang.toUpperCase()}` : status === "draft" ? `${lang.toUpperCase()} ainda é rascunho` : `Versão ${lang.toUpperCase()}`;
            return (
              <span key={lang} className="lang-chip" data-status={status} title={label}>
                {lang.toUpperCase()}
              </span>
            );
          })}
        </span>
        {pending && <span className="git-mark" title="Alterações ainda não publicadas no git" />}
        {problem && (
          <span className="problem" title={problem}>
            !
          </span>
        )}
      </span>
    </button>
  );
}
