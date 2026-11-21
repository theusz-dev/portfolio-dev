import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * How markdown renders in this blog. Add custom elements here (callouts,
 * figures…) and use them in a post as `<Callout>…</Callout>`.
 */
export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...props }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    ),
  // Plain <img>: post images come in any size, and writing stays simple (no width/height needed).
  img: ({ alt = "", ...props }) => <img alt={alt} loading="lazy" decoding="async" {...props} />,
  table: (props) => (
    <div style={{ overflowX: "auto" }}>
      <table {...props} />
    </div>
  ),
};
