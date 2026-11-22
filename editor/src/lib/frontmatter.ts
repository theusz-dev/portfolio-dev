import { parse, stringify } from "yaml";

/**
 * Frontmatter, read and written the way the site expects it
 * (src/lib/blog/posts.ts). Validation mirrors that file, so a post that is
 * valid here is valid in `next build`.
 */

export type Meta = {
  title: string;
  description: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** `YYYY-MM-DD` or empty */
  updated: string;
  tags: string[];
  draft: boolean;
  /** Keys the editor doesn't know about; kept as they are. */
  extra: Record<string, unknown>;
};

export type ParsedPost = {
  meta: Meta;
  body: string;
  /** Problem reading the frontmatter itself (missing block, broken YAML). */
  problem: string | null;
};

// Same expression as posts.ts.
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const KNOWN = ["title", "description", "date", "updated", "tags", "draft"];

export const emptyMeta = (): Meta => ({
  title: "",
  description: "",
  date: today(),
  updated: "",
  tags: [],
  draft: true,
  extra: {},
});

export function today() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function dateValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (value == null) return "";
  return String(value);
}

export function parsePost(source: string): ParsedPost {
  const match = source.match(FRONTMATTER);
  if (!match) return { meta: { ...emptyMeta(), date: "", draft: false }, body: source, problem: "Sem frontmatter (--- … ---) no início do arquivo." };

  let data: Record<string, unknown> = {};
  let problem: string | null = null;
  try {
    const parsed = parse(match[1]);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) data = parsed as Record<string, unknown>;
    else if (parsed != null) problem = "O frontmatter precisa ser um mapa de chaves (title: …).";
  } catch (error) {
    problem = `YAML inválido no frontmatter: ${error instanceof Error ? error.message : String(error)}`;
  }

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) if (!KNOWN.includes(key)) extra[key] = value;

  const tags = data.tags;
  return {
    meta: {
      title: data.title == null ? "" : String(data.title),
      description: data.description == null ? "" : String(data.description),
      date: dateValue(data.date),
      updated: dateValue(data.updated),
      tags: Array.isArray(tags) ? tags.map(String) : typeof tags === "string" && tags ? [tags] : [],
      draft: data.draft === true,
      extra,
    },
    body: source.slice(match[0].length),
    problem,
  };
}

/** A tag that can be written bare inside `[a, b]`; anything else is quoted. */
const PLAIN_TAG = /^[\p{L}\p{N}][\p{L}\p{N}._+-]*$/u;
const RESERVED = /^(true|false|yes|no|on|off|null|~|[-+]?(\d[\d_]*)?\.?\d+(e[-+]?\d+)?)$/i;

const quote = (text: string) => JSON.stringify(text);
const tagText = (tag: string) => (PLAIN_TAG.test(tag) && !RESERVED.test(tag) ? tag : quote(tag));
const dateText = (date: string) => (/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : quote(date));

/** The frontmatter block, in the same shape as the hand-written posts. */
export function frontmatterBlock(meta: Meta): string {
  const lines = [`title: ${quote(meta.title)}`, `description: ${quote(meta.description)}`, `date: ${dateText(meta.date)}`];
  if (meta.updated) lines.push(`updated: ${dateText(meta.updated)}`);
  if (meta.tags.length) lines.push(`tags: [${meta.tags.map(tagText).join(", ")}]`);
  if (meta.draft) lines.push("draft: true");
  if (Object.keys(meta.extra).length) lines.push(stringify(meta.extra).trimEnd());
  return `---\n${lines.join("\n")}\n---\n`;
}

export function serializePost(meta: Meta, body: string): string {
  return frontmatterBlock(meta) + body;
}

/** Lines taken by the frontmatter: body line 1 is file line `offset + 1`. */
export function lineOffset(meta: Meta): number {
  return frontmatterBlock(meta).split("\n").length - 1;
}

export type FieldErrors = Partial<Record<"title" | "description" | "date" | "updated" | "slug" | "frontmatter", string>>;

function badDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
  return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Same rules as posts.ts (plus a well-formed slug). Empty object = valid. */
export function validate(meta: Meta, slug: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!meta.title.trim()) errors.title = "Obrigatório.";
  if (!meta.description.trim()) errors.description = "Obrigatória (aparece na lista, no Google e no RSS).";
  if (!meta.date) errors.date = "Obrigatória.";
  else if (badDate(meta.date)) errors.date = "Use AAAA-MM-DD.";
  if (meta.updated && badDate(meta.updated)) errors.updated = "Use AAAA-MM-DD.";
  if (!slug) errors.slug = "Obrigatório.";
  else if (!SLUG.test(slug)) errors.slug = "Só minúsculas, números e hífens.";
  return errors;
}

/** "Título do Artigo!" → "titulo-do-artigo" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** Same count as the site: words of the raw body, 220 per minute, at least 1. */
export function readingStats(body: string) {
  const words = body.split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 220)) };
}
