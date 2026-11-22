import { Bold, Code, Heading, ImagePlus, Italic, Link2, List, ListOrdered, SquareCode, Table, TextQuote } from "lucide-react";
import { bundledLanguagesInfo } from "shiki/langs";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormatCommand } from "../editor/MarkdownEditor";

const mod = navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl+";

const BUTTONS: { command: FormatCommand; icon: typeof Bold; label: string; keys?: string }[] = [
  { command: "heading", icon: Heading, label: "Título (H2 → H3 → H4)", keys: `${mod}Alt+2/3/4` },
  { command: "bold", icon: Bold, label: "Negrito", keys: `${mod}B` },
  { command: "italic", icon: Italic, label: "Itálico", keys: `${mod}I` },
  { command: "code", icon: Code, label: "Código inline", keys: `${mod}E` },
  { command: "link", icon: Link2, label: "Link", keys: `${mod}K` },
  { command: "bullet", icon: List, label: "Lista", keys: `${mod}Shift+8` },
  { command: "ordered", icon: ListOrdered, label: "Lista numerada", keys: `${mod}Shift+7` },
  { command: "quote", icon: TextQuote, label: "Citação", keys: `${mod}Shift+9` },
  { command: "table", icon: Table, label: "Tabela" },
];

// The ones used most come first; then every language Shiki knows.
const COMMON = ["ts", "tsx", "js", "jsx", "bash", "json", "css", "html", "python", "rust", "go", "sql", "yaml", "diff", "md", "text"];

type Language = { id: string; name: string; aliases: string[] };

const LANGUAGES: Language[] = [
  ...COMMON.map((id) => {
    if (id === "text") return { id: "text", name: "Texto puro", aliases: ["plaintext", "txt"] };
    const info = bundledLanguagesInfo.find((l) => l.id === id || l.aliases?.includes(id))!;
    return { id, name: info.name, aliases: info.aliases ?? [] };
  }),
  ...bundledLanguagesInfo
    .filter((l) => !COMMON.includes(l.id) && !l.aliases?.some((a) => COMMON.includes(a)))
    .map((l) => ({ id: l.id, name: l.name, aliases: l.aliases ?? [] }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

type Props = {
  onFormat: (command: FormatCommand) => void;
  onCodeBlock: (lang: string) => void;
  onImage: () => void;
};

export function Toolbar({ onFormat, onCodeBlock, onImage }: Props) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="toolbar" role="toolbar" aria-label="Formatação">
      {BUTTONS.map(({ command, icon: Icon, label, keys }) => (
        <button
          key={command}
          type="button"
          className="tool"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormat(command)}
          title={keys ? `${label} · ${keys}` : label}
          aria-label={label}
        >
          <Icon size={15} strokeWidth={1.6} />
        </button>
      ))}
      <span className="tool-sep" />
      <div className="tool-wrap">
        <button
          type="button"
          className="tool"
          data-on={picking || undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPicking((p) => !p)}
          title="Bloco de código"
          aria-label="Bloco de código"
          aria-expanded={picking}
        >
          <SquareCode size={15} strokeWidth={1.6} />
        </button>
        {picking && (
          <LanguagePicker
            onPick={(lang) => {
              setPicking(false);
              onCodeBlock(lang);
            }}
            onClose={() => setPicking(false)}
          />
        )}
      </div>
      <button type="button" className="tool" onMouseDown={(e) => e.preventDefault()} onClick={onImage} title="Imagem (ou cole / arraste no texto)" aria-label="Imagem">
        <ImagePlus size={15} strokeWidth={1.6} />
      </button>
    </div>
  );
}

function LanguagePicker({ onPick, onClose }: { onPick: (lang: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) => l.id.includes(q) || l.name.toLowerCase().includes(q) || l.aliases.some((a) => a.includes(q)));
  }, [query]);

  useEffect(() => setIndex(0), [query]);
  useEffect(() => {
    list.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);
  useEffect(() => {
    const away = (event: MouseEvent) => !box.current?.contains(event.target as Node) && onClose();
    window.addEventListener("mousedown", away);
    return () => window.removeEventListener("mousedown", away);
  }, [onClose]);

  return (
    <div className="popover lang-picker" ref={box}>
      <input
        autoFocus
        className="input mono"
        placeholder="Linguagem…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") (e.preventDefault(), setIndex((i) => Math.min(i + 1, results.length - 1)));
          if (e.key === "ArrowUp") (e.preventDefault(), setIndex((i) => Math.max(i - 1, 0)));
          if (e.key === "Enter") {
            e.preventDefault();
            const pick = results[index]?.id ?? query.trim();
            if (pick) onPick(pick);
          }
          if (e.key === "Escape") onClose();
        }}
      />
      <ul ref={list}>
        {results.map((lang, i) => (
          <li key={lang.id}>
            <button type="button" data-index={i} data-on={i === index || undefined} onMouseEnter={() => setIndex(i)} onClick={() => onPick(lang.id)}>
              <span>{lang.name}</span>
              <span className="mono">{lang.id}</span>
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="empty">Usar “{query}” mesmo assim: Enter</li>}
      </ul>
    </div>
  );
}
