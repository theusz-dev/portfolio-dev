import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { Locale } from "@/i18n/config";
import { strings } from "../_strings";
import styles from "../article.module.css";
import { CopyButton } from "./CopyButton";

/**
 * How markdown renders in this blog. Add custom elements here (callouts,
 * figures…) and use them in a post as `<Callout>…</Callout>`.
 */
export function mdxComponents(lang: Locale): MDXComponents {
  const t = strings[lang];

  // Headings get a "#" link in the margin (ids come from rehype-slug).
  const heading = (Tag: "h2" | "h3" | "h4") =>
    function Heading({ id, children, ...props }: ComponentProps<"h2">) {
      return (
        <Tag id={id} {...props}>
          {id && (
            <a href={`#${id}`} className={styles.anchor} aria-label={t.sectionLink} data-anchor>
              #
            </a>
          )}
          {children}
        </Tag>
      );
    };

  return {
    h2: heading("h2"),
    h3: heading("h3"),
    h4: heading("h4"),
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
      <div className={styles.tableWrap}>
        <table {...props} />
      </div>
    ),
    // Code blocks (already highlighted by rehype-pretty-code): a bar with the language and a copy button.
    pre: (props: ComponentProps<"pre"> & { "data-language"?: string }) => (
      <div className={styles.code} data-code>
        <div className={styles.codeBar}>
          <span>{props["data-language"] && props["data-language"] !== "plaintext" ? props["data-language"] : ""}</span>
          <CopyButton labels={{ copy: t.copy, copied: t.copied, copyLabel: t.copyLabel }} />
        </div>
        <pre {...props} />
      </div>
    ),
  };
}
