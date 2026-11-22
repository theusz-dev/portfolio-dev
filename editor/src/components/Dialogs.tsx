import { useEffect, useMemo, useState } from "react";
import { slugify } from "../lib/frontmatter";
import { collectionNames, collections, type Collection, type Lang } from "../lib/types";
import { Modal } from "./Modal";

export type NewPostInput = { collection: Collection; lang: Lang; title: string; description: string; slug: string };

/** New post: blog, language, title and description (both required by the site). */
export function NewPostDialog({
  initial,
  taken,
  onCreate,
  onClose,
}: {
  initial: { collection: Collection; lang: Lang };
  /** Slugs already used, as `collection/lang/slug`. */
  taken: Set<string>;
  onCreate: (input: NewPostInput) => void;
  onClose: () => void;
}) {
  const [collection, setCollection] = useState(initial.collection);
  const [lang, setLang] = useState(initial.lang);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const slug = useMemo(() => {
    const base = slugify(title) || "novo-artigo";
    let candidate = base;
    for (let n = 2; taken.has(`${collection}/${lang}/${candidate}`); n++) candidate = `${base}-${n}`;
    return candidate;
  }, [title, collection, lang, taken]);

  const ready = title.trim() !== "" && description.trim() !== "";

  return (
    <Modal title="Novo artigo" onClose={onClose} width={480}>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onCreate({ collection, lang, title: title.trim(), description: description.trim(), slug });
        }}
      >
        <div className="form-row two">
          <Segmented label="Blog" value={collection} options={collections.map((c) => [c, collectionNames[c]])} onChange={setCollection} />
          <Segmented
            label="Idioma"
            value={lang}
            options={[
              ["pt", "Português"],
              ["en", "English"],
            ]}
            onChange={setLang}
          />
        </div>
        <label className="field">
          <span className="field-label">Título</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do artigo" autoFocus />
        </label>
        <label className="field">
          <span className="field-label">Descrição</span>
          <textarea
            className="input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value.replace(/\s*\n\s*/g, " "))}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            placeholder="Uma ou duas frases. Aparece na lista, no Google e no RSS."
          />
        </label>
        <p className="hint mono">
          src/content/{collection}/{lang}/<strong>{slug}</strong>.mdx · rascunho
        </p>
        <div className="modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button primary" disabled={!ready} data-primary>
            Criar rascunho
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Alt text for an image about to be inserted, with a thumbnail. */
export function ImageDialog({
  file,
  suggestion,
  target,
  onConfirm,
  onClose,
}: {
  file: File;
  suggestion: string;
  target: string;
  onConfirm: (alt: string) => void;
  onClose: () => void;
}) {
  const [alt, setAlt] = useState(suggestion);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <Modal title="Inserir imagem" onClose={onClose} width={460}>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(alt.trim());
        }}
      >
        {url && (
          <div className="thumb">
            <img src={url} alt="" />
          </div>
        )}
        <label className="field">
          <span className="field-label">Texto alternativo</span>
          <input className="input" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="O que a imagem mostra, para quem não pode vê-la" autoFocus />
        </label>
        <p className="hint mono">Será salva em {target}</p>
        <div className="modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button primary" data-primary>
            Inserir
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size,
}: {
  label?: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  size?: "small";
}) {
  return (
    <div className="field">
      {label && <span className="field-label">{label}</span>}
      <div className="segmented" data-size={size} role="radiogroup" aria-label={label}>
        {options.map(([key, text]) => (
          <button key={key} type="button" role="radio" aria-checked={value === key} onClick={() => onChange(key)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
