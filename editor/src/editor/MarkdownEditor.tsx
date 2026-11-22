import { autocompletion, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, bracketMatching, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { lintGutter, setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { highlightSelectionMatches, search, searchKeymap } from "@codemirror/search";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
  rectangularSelection,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cycleHeading, insertBlock, insertCodeBlock, insertLink, insertTable, setHeading, toggleLinePrefix, wrap } from "./commands";
import { mdxSyntax } from "./mdx-syntax";

export type FormatCommand = "bold" | "italic" | "code" | "link" | "quote" | "bullet" | "ordered" | "h2" | "h3" | "h4" | "heading" | "table";

export type EditorHandle = {
  focus(): void;
  format(command: FormatCommand): void;
  codeBlock(lang: string): void;
  /** Inserts a block (e.g. an image) at `pos` or at the cursor. */
  insertBlock(text: string, pos?: number): void;
  gotoLine(line: number): void;
  setError(error: { line: number; column?: number; message: string } | null): void;
  /** Body line at the top of the view (fractional). */
  topLine(): number;
  scrollToLine(line: number): void;
  /** 0..1, or -1 when it doesn't scroll. */
  scrollFraction(): number;
  scrollToFraction(fraction: number): void;
  cursor(): { line: number; column: number };
};

type Props = {
  /** Changing it loads `value` as a new document (fresh undo history). */
  docKey: string;
  value: string;
  onChange: (value: string) => void;
  onScroll: () => void;
  onCursor: (pos: { line: number; column: number }) => void;
  /** Files pasted or dropped; `pos` is where they were dropped. */
  onFiles: (files: File[], pos: number) => void;
  onSave: () => void;
};

const highlight = HighlightStyle.define([
  { tag: t.heading1, color: "var(--ink)", fontWeight: "600" },
  { tag: [t.heading2, t.heading3, t.heading4, t.heading5, t.heading6], color: "var(--ink)", fontWeight: "600" },
  { tag: t.strong, color: "var(--ink)", fontWeight: "600" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: [t.link, t.url], color: "var(--muted)", textDecoration: "underline", textDecorationColor: "var(--line-strong)" },
  { tag: t.monospace, color: "var(--ink)", backgroundColor: "var(--code-tint)", borderRadius: "3px" },
  { tag: t.quote, color: "var(--muted)", fontStyle: "italic" },
  { tag: [t.processingInstruction, t.contentSeparator, t.labelName], color: "var(--faint)" },
  { tag: t.special(t.brace), color: "var(--accent)" },
  // HTML / JSX tags
  { tag: [t.tagName, t.angleBracket], color: "var(--syntax-tag)" },
  { tag: t.attributeName, color: "var(--muted)" },
  // Code inside fenced blocks: quiet, few colours.
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword], color: "var(--syntax-keyword)" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "var(--syntax-string)" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--syntax-number)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--faint)", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--syntax-fn)" },
  { tag: [t.typeName, t.className], color: "var(--syntax-type)" },
  { tag: t.meta, color: "var(--faint)" },
]);

const theme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "transparent", color: "var(--text)" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.75", overflow: "auto" },
  ".cm-content": { padding: "28px 0 40vh", caretColor: "var(--ink)" },
  ".cm-line": { padding: "0 28px 0 6px" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "var(--faint)" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 6px 0 18px", fontSize: "11px", opacity: "0.55" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--muted)" },
  ".cm-activeLineGutter.cm-gutterElement": { opacity: "1" },
  ".cm-activeLine": { backgroundColor: "var(--active-line)" },
  "&.cm-focused": { outline: "none" },
  ".cm-cursor": { borderLeftColor: "var(--ink)", borderLeftWidth: "1.5px" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "var(--selection) !important" },
  ".cm-placeholder": { color: "var(--faint)", fontStyle: "italic" },
  ".cm-panels": { backgroundColor: "var(--panel)", color: "var(--text)", borderColor: "var(--line)" },
  ".cm-panels-bottom": { borderTop: "1px solid var(--line)" },
  ".cm-searchMatch": { backgroundColor: "var(--search-match)", outline: "1px solid var(--line-strong)" },
  ".cm-searchMatch-selected": { backgroundColor: "var(--search-match-strong)" },
  ".cm-selectionMatch": { backgroundColor: "var(--hover)" },
  ".cm-tooltip": { backgroundColor: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: "8px", color: "var(--text)" },
  ".cm-diagnostic-error": { borderLeftColor: "var(--danger)" },
  ".cm-lintRange-error": { backgroundImage: "none", textDecoration: "underline wavy var(--danger)", textUnderlineOffset: "3px" },
  ".cm-gutter-lint": { width: "10px" },
  ".cm-lint-marker": { width: "8px", height: "8px" },
});

export const MarkdownEditor = forwardRef<EditorHandle, Props>(function MarkdownEditor(props, ref) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const latest = useRef(props);
  latest.current = props;

  const extensions = (): Extension[] => [
    lineNumbers(),
    highlightActiveLineGutter(),
    lintGutter(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion({ override: [] }),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    search({ top: false }),
    EditorView.lineWrapping,
    markdown({ base: markdownLanguage, codeLanguages: languages, extensions: [mdxSyntax] }),
    syntaxHighlighting(highlight),
    theme,
    placeholder("Comece a escrever…"),
    keymap.of([
      { key: "Mod-b", run: (v) => wrap(v, "**") },
      { key: "Mod-i", run: (v) => wrap(v, "_") },
      { key: "Mod-e", run: (v) => wrap(v, "`", "`", "código") },
      { key: "Mod-k", run: insertLink },
      { key: "Mod-Alt-2", run: (v) => setHeading(v, 2) },
      { key: "Mod-Alt-3", run: (v) => setHeading(v, 3) },
      { key: "Mod-Alt-4", run: (v) => setHeading(v, 4) },
      { key: "Mod-Shift-8", run: (v) => toggleLinePrefix(v, "bullet") },
      { key: "Mod-Shift-7", run: (v) => toggleLinePrefix(v, "ordered") },
      { key: "Mod-Shift-9", run: (v) => toggleLinePrefix(v, "quote") },
      { key: "Mod-s", run: () => (latest.current.onSave(), true) },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      indentWithTab,
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) latest.current.onChange(update.state.doc.toString());
      if (update.selectionSet || update.docChanged) {
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        latest.current.onCursor({ line: line.number, column: head - line.from + 1 });
      }
    }),
    EditorView.domEventHandlers({
      scroll: () => latest.current.onScroll(),
      paste: (event) => {
        const files = [...(event.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        latest.current.onFiles(files, view.current!.state.selection.main.head);
        return true;
      },
      drop: (event, v) => {
        const files = [...(event.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const pos = v.posAtCoords({ x: event.clientX, y: event.clientY }) ?? v.state.selection.main.head;
        latest.current.onFiles(files, pos);
        return true;
      },
    }),
  ];

  // Create once.
  useEffect(() => {
    view.current = new EditorView({
      parent: host.current!,
      state: EditorState.create({ doc: props.value, extensions: extensions() }),
    });
    return () => view.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New document: new state (and undo history).
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.setState(EditorState.create({ doc: props.value, extensions: extensions() }));
    v.scrollDOM.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.docKey]);

  useImperativeHandle(ref, () => ({
    focus: () => view.current?.focus(),
    format(command) {
      const v = view.current;
      if (!v) return;
      switch (command) {
        case "bold": wrap(v, "**"); break;
        case "italic": wrap(v, "_"); break;
        case "code": wrap(v, "`", "`", "código"); break;
        case "link": insertLink(v); break;
        case "quote": toggleLinePrefix(v, "quote"); break;
        case "bullet": toggleLinePrefix(v, "bullet"); break;
        case "ordered": toggleLinePrefix(v, "ordered"); break;
        case "h2": setHeading(v, 2); break;
        case "h3": setHeading(v, 3); break;
        case "h4": setHeading(v, 4); break;
        case "heading": cycleHeading(v); break;
        case "table": insertTable(v); break;
      }
    },
    codeBlock(lang) {
      if (view.current) insertCodeBlock(view.current, lang);
    },
    insertBlock(text, pos) {
      if (view.current) insertBlock(view.current, text, pos);
    },
    gotoLine(line) {
      const v = view.current;
      if (!v) return;
      const target = v.state.doc.line(Math.min(Math.max(1, line), v.state.doc.lines));
      v.dispatch({ selection: { anchor: target.from }, effects: EditorView.scrollIntoView(target.from, { y: "center" }) });
      v.focus();
    },
    setError(error) {
      const v = view.current;
      if (!v) return;
      const diagnostics: Diagnostic[] = [];
      if (error && error.line >= 1 && error.line <= v.state.doc.lines) {
        const line = v.state.doc.line(error.line);
        const from = Math.min(line.to, line.from + Math.max(0, (error.column ?? 1) - 1));
        diagnostics.push({ from, to: Math.max(from, line.to), severity: "error", message: error.message });
      }
      v.dispatch(setDiagnostics(v.state, diagnostics));
    },
    topLine() {
      const v = view.current;
      if (!v) return 1;
      const rect = v.scrollDOM.getBoundingClientRect();
      const y = rect.top - v.documentTop;
      const block = v.lineBlockAtHeight(Math.max(0, y));
      const line = v.state.doc.lineAt(block.from).number;
      return line + Math.min(1, Math.max(0, (y - block.top) / Math.max(1, block.height)));
    },
    scrollToLine(line) {
      const v = view.current;
      if (!v) return;
      const n = Math.min(Math.max(1, Math.floor(line)), v.state.doc.lines);
      const block = v.lineBlockAt(v.state.doc.line(n).from);
      const base = v.documentTop - v.scrollDOM.getBoundingClientRect().top + v.scrollDOM.scrollTop;
      v.scrollDOM.scrollTop = base + block.top + (line - n) * block.height;
    },
    scrollFraction() {
      const el = view.current?.scrollDOM;
      if (!el) return -1;
      const max = el.scrollHeight - el.clientHeight;
      return max > 0 ? el.scrollTop / max : -1;
    },
    scrollToFraction(fraction) {
      const el = view.current?.scrollDOM;
      if (el) el.scrollTop = (el.scrollHeight - el.clientHeight) * fraction;
    },
    cursor() {
      const v = view.current;
      if (!v) return { line: 1, column: 1 };
      const head = v.state.selection.main.head;
      const line = v.state.doc.lineAt(head);
      return { line: line.number, column: head - line.from + 1 };
    },
  }));

  return <div className="md-editor" ref={host} />;
});
