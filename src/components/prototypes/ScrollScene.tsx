"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
  /**
   * "pin": 0 when the scene's top reaches the top of the viewport, 1 when its
   * bottom reaches the bottom (for sticky sequences).
   * "pass": 0 when the scene enters from below, 1 when it leaves at the top.
   */
  mode?: "pin" | "pass";
  /** When set, `data-step` holds the active step (0..steps-1). */
  steps?: number;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Writes the scroll progress of its element to the `--p` CSS variable (and
 * optionally `data-step`) without re-rendering React, so CSS drives the motion.
 */
export function ScrollScene({ children, className, id, as = "section", mode = "pass", steps, style, ...aria }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let lastStep = -1;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw =
        mode === "pin"
          ? -rect.top / Math.max(1, rect.height - vh)
          : (vh - rect.top) / Math.max(1, rect.height + vh);
      const p = Math.min(1, Math.max(0, raw));
      el.style.setProperty("--p", p.toFixed(4));
      if (steps) {
        const step = Math.min(steps - 1, Math.floor(p * steps));
        if (step !== lastStep) {
          lastStep = step;
          el.dataset.step = String(step);
        }
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mode, steps]);

  const Tag = as;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLDivElement>}
      id={id}
      className={className}
      data-step={steps ? 0 : undefined}
      style={{ "--p": 0, ...style } as CSSProperties}
      {...aria}
    >
      {children}
    </Tag>
  );
}
