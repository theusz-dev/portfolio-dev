"use client";

import { useEffect, useRef } from "react";
import s from "./experience.module.css";

export function ExperienceRidge() {
  const ridgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ridge = ridgeRef.current;
    if (!ridge) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function update() {
      frame = 0;
      if (!ridge || motion.matches) return;
      const { top, height } = ridge.getBoundingClientRect();
      // Sticky positioning handles the main scroll movement. Only the small
      // drift inside the viewport needs interpolation between wheel events.
      const progress = Math.max(0, Math.min(1, (innerHeight * .32 - top) / Math.max(1, height - innerHeight * .26)));
      const crest = .23 + .22 * Math.exp(-((progress - .70) ** 2) / .034);
      ridge.style.setProperty("--progress", String(progress));
      ridge.style.setProperty("--crest", String(crest));
    }

    function schedule() {
      if (!frame && !motion.matches) frame = requestAnimationFrame(update);
    }

    const observer = new ResizeObserver(schedule);
    observer.observe(ridge);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div ref={ridgeRef} className={s.ridge} aria-hidden="true">
      <div className={s.starTrack}><span className={s.star} /></div>
    </div>
  );
}
