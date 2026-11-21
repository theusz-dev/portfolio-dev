import type { Locale } from "../config";
import { en } from "./en";
import { pt, type Dictionary } from "./pt";

const dictionaries: Record<Locale, Dictionary> = { pt, en };

/** Interface text for a language. Use in Server Components; pass slices to Client Components as props. */
export const getDictionary = (lang: Locale) => dictionaries[lang];

export type { Dictionary };
