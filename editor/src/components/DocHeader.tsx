import { AlertCircle, Archive, ArchiveRestore, ChevronDown, FilePen, MoreHorizontal, RefreshCw, SlidersHorizontal, Trash2, UploadCloud, CloudUpload, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { slugify, type FieldErrors, type Meta } from "../lib/frontmatter";
import type { PostGit } from "../lib/git";
import type { PostState } from "../lib/library";
import { collectionNames, otherLang } from "../lib/types";
import type { Doc } from "../state/useDocument";

const DESCRIPTION_IDEAL = 160;

const STATE_LABEL: Record<PostState, string> = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };

type Props = {
  doc: Doc;
  state: PostState;
  errors: FieldErrors;
  translation: string | null;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onMeta: (patch: Partial<Meta>) => void;
  onSlug: (slug: string) => void;
  onTranslation: () => void;
  git: PostGit | null;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDraft: () => void;
  onSendDraft: () => void;
};

/** One quiet word for where the post stands in git, most urgent first. */
function gitLabel(git: PostGit | null, state: PostState): { tone: string; text: string; title: string } | null {
  if (!git) return null;
  if (git.incoming) return { tone: "warn", text: "remoto mais novo", title: "O remoto tem commits mais novos deste post. Eles entram ao publicar (pull --rebase)." };
  if (git.untracked) return { tone: "new", text: "fora do git", title: "Nunca commitado: só existe neste computador." };
  if (git.changed) return { tone: "changed", text: "alterado", title: state === "published" ? "Alterações não publicadas: o site ainda mostra a versão anterior." : "Alterações ainda não commitadas." };
  if (git.unpushed) return { tone: "changed", text: "não enviado", title: "Commitado, mas ainda não enviado (push)." };
  return { tone: "ok", text: "em dia", title: "Igual ao que está no remoto." };
}

const shortDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "sem data" : date.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

/**
 * Above the text: one quiet line (blog, language, state, properties), then the
 * title and description, which are part of the writing. Date, slug, tags and
 * draft live in a panel that opens from the properties button.
 */
export function DocHeader({ doc, state, errors, translation, collapsed, onCollapse, onMeta, onSlug, onTranslation, git, onPublish, onArchive, onDelete, onDraft, onSendDraft }: Props) {
  const { meta } = doc;
  const other = otherLang(doc.lang);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const label = gitLabel(git, state);
  const pending = !!git && (git.changed || git.unpushed || git.untracked);
  const publishLabel = state === "draft" ? "Publicar" : state === "published" && pending ? "Publicar alterações" : null;
  const panelErrors = !!(errors.date || errors.updated || errors.slug);

  return (
    <div className="doc-header" data-collapsed={collapsed || undefined}>
      <div className="doc-bar mono">
        {!doc.raw && (
          <button type="button" className="icon-button small" onClick={() => onCollapse(!collapsed)} title={collapsed ? "Mostrar título e descrição" : "Recolher título e descrição"} aria-label={collapsed ? "Mostrar título e descrição" : "Recolher título e descrição"}>
            <ChevronDown size={14} className="chev" data-open={!collapsed || undefined} />
          </button>
        )}
        <span>{collectionNames[doc.collection]}</span>
        <div className="lang-switch" role="group" aria-label="Idioma">
          {(["pt", "en"] as const).map((lang) =>
            lang === doc.lang ? (
              <span key={lang} className="current" aria-current="true">
                {lang.toUpperCase()}
              </span>
            ) : (
              <button
                key={lang}
                type="button"
                data-missing={!translation || undefined}
                onClick={onTranslation}
                title={translation ? `Abrir a versão ${other.toUpperCase()}` : `Criar a versão ${other.toUpperCase()} (mesmo slug, frontmatter copiado)`}
              >
                {translation ? lang.toUpperCase() : `+ ${lang.toUpperCase()}`}
              </button>
            ),
          )}
        </div>
        <span className="state-badge" data-state={state}>
          {STATE_LABEL[state]}
        </span>
        {label && (
          <span className="git-chip" data-tone={label.tone} title={label.title}>
            <span className="dot" />
            {label.text}
          </span>
        )}
        {collapsed && meta.title && <span className="collapsed-title">{meta.title}</span>}
        <span className="bar-spacer" />
        {!doc.raw && (
          <div className="props-anchor">
            <button type="button" className="props-button" data-on={open || undefined} onClick={() => setOpen(!open)} aria-expanded={open} title="Data, slug, tags e rascunho">
              {panelErrors ? <AlertCircle size={13} className="props-warn" /> : <SlidersHorizontal size={13} />}
              <span>{shortDate(meta.date)}</span>
              {meta.tags.length > 0 && <span className="props-tags">· {meta.tags.join(", ")}</span>}
            </button>
            {open && (
              <PropertiesPanel doc={doc} state={state} errors={errors} hasTranslation={!!translation} onMeta={onMeta} onSlug={onSlug} onClose={() => setOpen(false)} />
            )}
          </div>
        )}
        {publishLabel && (
          <button type="button" className="publish-button" onClick={onPublish} title="Commita só este post e as imagens dele e faz push">
            <UploadCloud size={13} />
            {publishLabel}
          </button>
        )}
        <div className="props-anchor">
          <button type="button" className="icon-button small menu-button" data-on={menu || undefined} onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Mais ações" title="Mais ações">
            <MoreHorizontal size={14} />
          </button>
          {menu && (
            <Menu onClose={() => setMenu(false)}>
              {state === "draft" && pending && (
                <button type="button" onClick={onSendDraft}>
                  <CloudUpload size={14} /> Enviar rascunho
                  <small>commit + push, continua fora do site</small>
                </button>
              )}
              {state === "published" && !doc.raw && (
                <button type="button" onClick={onDraft}>
                  <FilePen size={14} /> Voltar a rascunho
                  <small>grava draft: true, sem git</small>
                </button>
              )}
              <button type="button" onClick={onArchive}>
                {doc.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />} {doc.archived ? "Desarquivar" : "Arquivar"}
                <small>{translation ? "as duas versões" : "git mv + commit"}</small>
              </button>
              <hr />
              <button type="button" className="danger" onClick={onDelete}>
                <Trash2 size={14} /> Excluir…
                <small>vai para a lixeira</small>
              </button>
            </Menu>
          )}
        </div>
      </div>

      {doc.raw ? (
        <div className="raw-note">
          <strong>Frontmatter ilegível.</strong> {doc.problem} O arquivo inteiro está no editor abaixo; corrija o bloco entre <code>---</code> e reabra o post.
        </div>
      ) : (
        !collapsed && (
          <div className="doc-fields">
            <GrowingTextarea className="title-input" value={meta.title} placeholder="Título" onChange={(title) => onMeta({ title })} invalid={!!errors.title} />
            <div className="description">
              <GrowingTextarea
                className="description-input"
                value={meta.description}
                placeholder="Descrição — uma ou duas frases. Aparece na lista, no Google e no RSS."
                onChange={(description) => onMeta({ description })}
                invalid={!!errors.description}
              />
              <span className="counter mono" data-over={meta.description.length > DESCRIPTION_IDEAL || undefined} title="Até ~160 caracteres aparecem inteiros no Google">
                {meta.description.length}/{DESCRIPTION_IDEAL}
              </span>
            </div>
            {(errors.title || errors.description) && (
              <p className="field-errors">
                {errors.title && <span>Título: {errors.title}</span>}
                {errors.description && <span>Descrição: {errors.description}</span>}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}

function Menu({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!box.current?.contains(target) && !target.closest?.(".menu-button")) onClose();
    };
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("mousedown", away);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("mousedown", away);
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);
  return (
    <div className="popover action-menu" ref={box} role="menu" onClick={(e) => (e.target as Element).closest("button") && onClose()}>
      {children}
    </div>
  );
}

function PropertiesPanel({
  doc,
  state,
  errors,
  hasTranslation,
  onMeta,
  onSlug,
  onClose,
}: {
  doc: Doc;
  state: PostState;
  errors: FieldErrors;
  hasTranslation: boolean;
  onMeta: (patch: Partial<Meta>) => void;
  onSlug: (slug: string) => void;
  onClose: () => void;
}) {
  const { meta } = doc;
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!box.current?.contains(target) && !target.closest?.(".props-button")) onClose();
    };
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("mousedown", away);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("mousedown", away);
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);

  return (
    <div className="popover props-panel" ref={box} role="dialog" aria-label="Propriedades">
      <p className="props-title mono">Propriedades</p>
      <div className="props-row">
        <Field label="Data" error={errors.date}>
          <input type="date" className="input mono" value={meta.date} onChange={(e) => onMeta({ date: e.target.value })} aria-invalid={!!errors.date} />
        </Field>
        <Field label="Atualizado" error={errors.updated}>
          <div className="with-clear">
            <input type="date" className="input mono" value={meta.updated} onChange={(e) => onMeta({ updated: e.target.value })} aria-invalid={!!errors.updated} />
            {meta.updated && (
              <button type="button" className="icon-button small" onClick={() => onMeta({ updated: "" })} aria-label="Remover data de atualização">
                <X size={12} />
              </button>
            )}
          </div>
        </Field>
      </div>
      <Field label="Tags">
        <TagsInput tags={meta.tags} onChange={(tags) => onMeta({ tags })} />
      </Field>
      <Field label="Slug" error={errors.slug}>
        <SlugInput slug={doc.slug} title={meta.title} published={state === "published"} hasTranslation={hasTranslation} onCommit={onSlug} />
      </Field>
      <label className="switch props-switch">
        <input type="checkbox" checked={meta.draft} onChange={(e) => onMeta({ draft: e.target.checked })} />
        <span className="track" />
        <span className="switch-text">Rascunho {meta.draft ? "(só aparece em npm run dev)" : ""}</span>
      </label>
    </div>
  );
}

/** One-line field that wraps and grows instead of scrolling (no line breaks: frontmatter values are single lines). */
function GrowingTextarea({ className, value, placeholder, invalid, onChange }: { className: string; value: string; placeholder: string; invalid: boolean; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      className={className}
      rows={1}
      value={value}
      placeholder={placeholder}
      aria-invalid={invalid}
      spellCheck
      onChange={(e) => onChange(e.target.value.replace(/\s*\n\s*/g, " "))}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
    />
  );
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="meta-field" data-wide={wide || undefined}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

/** Slug: edited freely, applied (file renamed) on Enter or when leaving the field. */
function SlugInput({ slug, title, published, hasTranslation, onCommit }: { slug: string; title: string; published: boolean; hasTranslation: boolean; onCommit: (slug: string) => void }) {
  const [value, setValue] = useState(slug);
  useEffect(() => setValue(slug), [slug]);
  const suggested = slugify(title);
  const commit = (next = value) => {
    if (next && next !== slug) onCommit(next);
  };
  const changed = value !== slug;
  return (
    <div className="slug-input">
      <input
        className="input mono"
        value={value}
        onChange={(e) => setValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
        onBlur={() => commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setValue(slug);
        }}
        spellCheck={false}
      />
      {suggested && suggested !== slug && (
        <button
          type="button"
          className="icon-button small"
          title={`Gerar do título: ${suggested}`}
          aria-label="Gerar slug do título"
          onClick={() => {
            setValue(suggested);
            commit(suggested);
          }}
        >
          <RefreshCw size={12} />
        </button>
      )}
      {changed && (
        <span className="slug-note">
          Enter renomeia o arquivo{hasTranslation ? " e a tradução" : ""}.{published ? " O endereço publicado muda." : ""}
        </span>
      )}
    </div>
  );
}

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const add = (text: string) => {
    const parts = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const next = [...tags];
    for (const part of parts) if (!next.includes(part)) next.push(part);
    if (next.length !== tags.length) onChange(next);
    setDraft("");
  };
  return (
    <div className="tags-input" onClick={() => input.current?.focus()}>
      {tags.map((tag) => (
        <span key={tag} className="tag-chip mono">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remover ${tag}`}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={input}
        className="mono"
        value={draft}
        placeholder={tags.length ? "" : "nextjs, ia…"}
        onChange={(e) => {
          if (e.target.value.endsWith(",")) add(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          }
          if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
        }}
        onBlur={() => draft && add(draft)}
      />
    </div>
  );
}
