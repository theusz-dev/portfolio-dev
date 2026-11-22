import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Stand-in for `next/link` in the preview: a plain <a>. Clicks are handled by
 * the preview frame (nothing navigates away from the article).
 */
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string };
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

export default function Link({ href, children, prefetch: _prefetch, replace: _replace, scroll: _scroll, ...props }: Props) {
  return (
    <a href={typeof href === "string" ? href : (href.pathname ?? "#")} {...props}>
      {children}
    </a>
  );
}
