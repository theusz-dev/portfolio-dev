"use client";

import { useEffect, useRef } from "react";

export type FrameInfo = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Seconds since the loop started (frozen when reduced motion is on). */
  time: number;
  /** Pointer position normalised to -1..1, eased. */
  pointer: { x: number; y: number };
  isSmall: boolean;
};

type Setup = (info: { width: number; height: number; isSmall: boolean }) => void;
type Draw = (frame: FrameInfo) => void;

/**
 * Sizes a canvas to its parent, runs `draw` on every animation frame while the
 * canvas is visible, and renders a single static frame when the visitor
 * prefers reduced motion.
 */
export function useCanvasLoop(setup: Setup, draw: Draw) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setupRef = useRef(setup);
  const drawRef = useRef(draw);

  useEffect(() => {
    setupRef.current = setup;
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let isSmall = false;
    let raf = 0;
    let visible = true;
    let start = performance.now();
    let frozenAt = 0;
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };

    const renderFrame = (now: number) => {
      const time = reduceMotion.matches ? frozenAt : (now - start) / 1000;
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = canvas.width / Math.max(width, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current({ ctx, width, height, time, pointer, isSmall });
    };

    const loop = (now: number) => {
      renderFrame(now);
      if (visible && !reduceMotion.matches && !document.hidden) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      isSmall = width < 720;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      setupRef.current({ width, height, isSmall });
      renderFrame(performance.now());
      kick();
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const onMotionChange = () => {
      frozenAt = (performance.now() - start) / 1000;
      if (!reduceMotion.matches) {
        start = performance.now() - frozenAt * 1000;
        kick();
      } else {
        renderFrame(performance.now());
      }
    };

    const onVisibility = () => {
      if (!document.hidden) kick();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    intersection.observe(canvas);

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return canvasRef;
}
