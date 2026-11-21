import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Post } from "@/lib/blog/posts";

export type WritingProps = {
  lang: Locale;
  posts: Post[];
  t: Dictionary["writing"];
};

/** Where a post lives: `/pt/engineering/<slug>`. */
export const postPath = (post: Post) => `/${post.collection}/${post.slug}`;
