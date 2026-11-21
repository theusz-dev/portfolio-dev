import type { MDXComponents } from "mdx/types";

// Required by @next/mdx. Kept empty on purpose: each blog passes its own
// components when rendering a post (`<Content components={...} />`), so the
// engineering and reflections blogs can style markdown differently.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
