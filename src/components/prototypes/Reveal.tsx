"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "section" | "ul" | "ol" | "li" | "p" | "dl" | "figure" | "header";

/**
 * Marks its element with `data-armed` once JavaScript runs and `data-shown`
 * when it enters the viewport. Content stays visible without JavaScript;
 * CSS decides how armed-but-hidden elements look.
 */
export function Reveal({
  as = "div",
  className,
  children,
  style,
  threshold = 0.25,
  id,
}: {
  as?: Tag;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  threshold?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "";
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const Component = as as "div";
  return (
    <Component ref={ref as React.RefObject<HTMLDivElement>} className={className} style={style} id={id}>
      {children}
    </Component>
  );
}
