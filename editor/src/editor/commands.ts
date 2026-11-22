import { EditorSelection, type ChangeSpec, type SelectionRange } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

/** Formatting commands for the toolbar and shortcuts. All return true (handled). */

/** Wraps each selection in `before`/`after`, or unwraps it if it already is. */
export function wrap(view: EditorView, before: string, after = before, placeholder = "texto") {
  const { state } = view;
  const tr = state.changeByRange((range) => {
    const text = state.sliceDoc(range.from, range.to);
    const outerBefore = state.sliceDoc(range.from - before.length, range.from);
    const outerAfter = state.sliceDoc(range.to, range.to + after.length);
    if (!range.empty && outerBefore === before && outerAfter === after) {
      return {
        changes: [
          { from: range.from - before.length, to: range.from },
          { from: range.to, to: range.to + after.length },
        ],
        range: EditorSelection.range(range.from - before.length, range.to - before.length),
      };
    }
    if (!range.empty && text.startsWith(before) && text.endsWith(after) && text.length >= before.length + after.length) {
      const inner = text.slice(before.length, text.length - after.length);
      return { changes: { from: range.from, to: range.to, insert: inner }, range: EditorSelection.range(range.from, range.from + inner.length) };
    }
    const inner = range.empty ? placeholder : text;
    return {
      changes: { from: range.from, to: range.to, insert: before + inner + after },
      range: EditorSelection.range(range.from + before.length, range.from + before.length + inner.length),
    };
  });
  view.dispatch(state.update(tr, { scrollIntoView: true, userEvent: "input.format" }));
  view.focus();
  return true;
}

function selectedLines(view: EditorView) {
  const { state } = view;
  const lines = new Map<number, { from: number; text: string; number: number }>();
  for (const range of state.selection.ranges) {
    const first = state.doc.lineAt(range.from).number;
    const last = state.doc.lineAt(range.to).number;
    for (let n = first; n <= last; n++) {
      const line = state.doc.line(n);
      lines.set(n, { from: line.from, text: line.text, number: n });
    }
  }
  return [...lines.values()].sort((a, b) => a.number - b.number);
}

const LIST_OR_QUOTE = /^(\s*)(?:[-*+]\s+|\d+[.)]\s+|>\s?)/;

/** Toggles a line prefix (list, quote) on every selected line. */
export function toggleLinePrefix(view: EditorView, kind: "bullet" | "ordered" | "quote") {
  const lines = selectedLines(view);
  const test = kind === "bullet" ? /^\s*[-*+]\s+/ : kind === "ordered" ? /^\s*\d+[.)]\s+/ : /^\s*>\s?/;
  const nonEmpty = lines.filter((line) => line.text.trim() !== "");
  const allHave = nonEmpty.length > 0 && nonEmpty.every((line) => test.test(line.text));
  const changes: ChangeSpec[] = [];
  let index = 0;
  for (const line of lines) {
    if (line.text.trim() === "" && lines.length > 1) continue;
    const current = line.text.match(LIST_OR_QUOTE);
    if (allHave) {
      const match = line.text.match(test)!;
      changes.push({ from: line.from, to: line.from + match[0].length, insert: "" });
      continue;
    }
    const prefix = kind === "bullet" ? "- " : kind === "ordered" ? `${++index}. ` : "> ";
    const indent = current ? current[1] : "";
    changes.push({ from: line.from, to: line.from + (current ? current[0].length : 0), insert: indent + prefix });
  }
  view.dispatch({ changes, scrollIntoView: true, userEvent: "input.format" });
  view.focus();
  return true;
}

/** Sets the selected lines to a heading level (or clears it if they already are). */
export function setHeading(view: EditorView, level: 2 | 3 | 4) {
  const lines = selectedLines(view);
  const mark = "#".repeat(level) + " ";
  const allAt = lines.every((line) => line.text.startsWith(mark));
  const changes: ChangeSpec[] = lines.map((line) => {
    const existing = line.text.match(/^#{1,6}\s+/);
    const end = line.from + (existing ? existing[0].length : 0);
    return { from: line.from, to: end, insert: allAt ? "" : mark };
  });
  view.dispatch({ changes, scrollIntoView: true, userEvent: "input.format" });
  view.focus();
  return true;
}

/** Cycles the current line: paragraph → H2 → H3 → H4 → paragraph. */
export function cycleHeading(view: EditorView) {
  const line = view.state.doc.lineAt(view.state.selection.main.head);
  const level = line.text.match(/^(#{1,6})\s/)?.[1].length ?? 0;
  if (level === 0 || level === 1) return setHeading(view, 2);
  if (level === 2) return setHeading(view, 3);
  if (level === 3) return setHeading(view, 4);
  return setHeading(view, 4); // toggles off
}

export function insertLink(view: EditorView) {
  const { state } = view;
  const tr = state.changeByRange((range: SelectionRange) => {
    const text = state.sliceDoc(range.from, range.to);
    if (/^https?:\/\/\S+$/.test(text)) {
      const insert = `[](${text})`;
      return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.cursor(range.from + 1) };
    }
    const label = text || "texto";
    const insert = `[${label}](https://)`;
    const urlStart = range.from + label.length + 3;
    return {
      changes: { from: range.from, to: range.to, insert },
      range: text ? EditorSelection.range(urlStart, urlStart + 8) : EditorSelection.range(range.from + 1, range.from + 1 + label.length),
    };
  });
  view.dispatch(state.update(tr, { scrollIntoView: true, userEvent: "input.format" }));
  view.focus();
  return true;
}

/**
 * Inserts `text` as a block of its own at `pos` (default: the cursor), with a
 * blank line before and after. `select` is a [from, to] range inside `text` to
 * select afterwards.
 */
export function insertBlock(view: EditorView, text: string, pos?: number, select?: [number, number]) {
  const { state } = view;
  const { doc } = state;
  const line = doc.lineAt(pos ?? state.selection.main.head);
  const blank = (n: number) => n < 1 || n > doc.lines || doc.line(n).text.trim() === "";
  const nextIsText = line.number < doc.lines && !blank(line.number + 1);

  let from: number, to: number, lead: string, trail: string;
  if (line.text.trim() === "") {
    // On an empty line: the block takes its place.
    from = line.from;
    to = line.to;
    lead = blank(line.number - 1) ? "" : "\n";
    trail = nextIsText ? "\n" : "";
  } else {
    // After a line of text.
    from = to = line.to;
    lead = "\n\n";
    trail = nextIsText ? "\n" : "";
  }
  const start = from + lead.length;
  const selection = select ? EditorSelection.range(start + select[0], start + select[1]) : EditorSelection.cursor(start + text.length);
  view.dispatch({ changes: { from, to, insert: lead + text + trail }, selection, scrollIntoView: true, userEvent: "input" });
  view.focus();
  return true;
}

export function insertTable(view: EditorView) {
  const table = "| Coluna | Coluna |\n| --- | --- |\n| Valor | Valor |";
  return insertBlock(view, table, undefined, [2, 8]);
}

/** Fenced code block in `lang`, around the selected lines or empty with the cursor inside. */
export function insertCodeBlock(view: EditorView, lang: string) {
  const { state } = view;
  const range = state.selection.main;
  if (!range.empty) {
    const from = state.doc.lineAt(range.from);
    const to = state.doc.lineAt(range.to);
    const inner = state.sliceDoc(from.from, to.to);
    const insert = "```" + lang + "\n" + inner + "\n```";
    view.dispatch({
      changes: { from: from.from, to: to.to, insert },
      selection: EditorSelection.cursor(from.from + insert.length),
      scrollIntoView: true,
      userEvent: "input.format",
    });
    view.focus();
    return true;
  }
  const fence = "```" + lang + "\n\n```";
  const cursor = 3 + lang.length + 1;
  return insertBlock(view, fence, undefined, [cursor, cursor]);
}
