import { tags as t } from "@lezer/highlight";
import type { MarkdownConfig } from "@lezer/markdown";

/**
 * MDX on top of CodeMirror's Markdown: `import` / `export` blocks and `{…}`
 * expressions get their own nodes (and colours). JSX tags already highlight
 * as HTML.
 */
export const mdxSyntax: MarkdownConfig = {
  defineNodes: [
    { name: "MDXEsm", block: true, style: t.processingInstruction },
    { name: "MDXExpression", style: t.special(t.brace) },
  ],
  parseBlock: [
    {
      name: "MDXEsm",
      before: "FencedCode",
      parse(cx, line) {
        if (line.indent !== 0 || !/^(import|export)\s/.test(line.text)) return false;
        const start = cx.lineStart;
        let end = start + line.text.length;
        while (cx.nextLine() && line.text.trim() !== "") end = cx.lineStart + line.text.length;
        cx.addElement(cx.elt("MDXEsm", start, end));
        return true;
      },
    },
  ],
  parseInline: [
    {
      name: "MDXExpression",
      before: "Emphasis",
      parse(cx, next, pos) {
        if (next !== 123 /* { */) return -1;
        let depth = 0;
        for (let i = pos; i < cx.end; i++) {
          const ch = cx.char(i);
          if (ch === 123) depth++;
          else if (ch === 125 /* } */ && --depth === 0) return cx.addElement(cx.elt("MDXExpression", pos, i + 1));
        }
        return -1;
      },
    },
  ],
};
