import { evaluate } from "@mdx-js/mdx";
import type { MDXContent } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import type { Root } from "hast";
import type { PluggableList } from "unified";

/**
 * The site's MDX pipeline (next.config.ts), with the same plugins, versions and
 * options. Keep the two in step: if next.config.ts changes, change this too.
 */
export const remarkPlugins: PluggableList = [remarkFrontmatter, remarkGfm];
export const rehypePlugins: PluggableList = [
  rehypeSlug,
  [
    rehypePrettyCode,
    {
      theme: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      keepBackground: false,
    },
  ],
];

/**
 * Editor only: marks each top-level element with the source line it starts on
 * (`data-src-line`), so the editor and the preview can scroll together. Runs
 * first, while every node still has its position; the attribute doesn't
 * change how anything looks.
 */
function rehypeSourceLines() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === "element" && node.position) {
        node.properties = { ...node.properties, dataSrcLine: node.position.start.line };
      }
    }
  };
}

export type CompileError = { message: string; line?: number; column?: number };

export async function compileMdx(source: string): Promise<{ Content: MDXContent } | { error: CompileError }> {
  try {
    const mod = await evaluate(source, {
      ...runtime,
      remarkPlugins,
      rehypePlugins: [rehypeSourceLines, ...rehypePlugins],
      development: false,
    });
    return { Content: mod.default };
  } catch (error) {
    return { error: toCompileError(error) };
  }
}

function toCompileError(error: unknown): CompileError {
  if (error && typeof error === "object") {
    const e = error as { reason?: string; message?: string; line?: number; column?: number; place?: { line?: number; column?: number; start?: { line?: number; column?: number } } };
    const place = e.place && "start" in e.place ? e.place.start : e.place;
    return {
      message: e.reason ?? e.message ?? String(error),
      line: e.line ?? place?.line ?? undefined,
      column: e.column ?? place?.column ?? undefined,
    };
  }
  return { message: String(error) };
}
