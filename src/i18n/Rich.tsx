import { Fragment } from "react";

/**
 * Light emphasis inside translated strings, so dictionaries stay plain text:
 * `**bold**` → <strong>, `_italic_` → <em>, `\n` → <br>.
 */
export function Rich({ text }: { text: string }) {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*|_[^_]+_)/).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) return <em key={j}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </Fragment>
  ));
}
