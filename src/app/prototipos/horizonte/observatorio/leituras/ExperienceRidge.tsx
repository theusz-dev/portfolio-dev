"use client";

import { useEffect, useRef } from "react";
import dust from "./poeira.webp";
import s from "./experience.module.css";

const TEX_W = 240;
const TEX_H = 1200;

const smoother = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Smoothed horizontal centre (0–1) of the dust band for every texture row, so
// the band can be redrawn along any path without losing its own grain.
function bandProfile(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, TEX_W, TEX_H);
  const { data } = ctx.getImageData(0, 0, TEX_W, TEX_H);
  const mass = new Float64Array(TEX_H + 1);
  const moment = new Float64Array(TEX_H + 1);
  for (let y = 0; y < TEX_H; y++) {
    let m = 0, mo = 0;
    for (let x = 0; x < TEX_W; x++) {
      const a = data[(y * TEX_W + x) * 4 + 3];
      m += a; mo += a * x;
    }
    mass[y + 1] = mass[y] + m;
    moment[y + 1] = moment[y] + mo;
  }
  const profile = new Float32Array(TEX_H);
  for (let y = 0; y < TEX_H; y++) {
    const lo = Math.max(0, y - 60), hi = Math.min(TEX_H, y + 61);
    const m = mass[hi] - mass[lo];
    profile[y] = m ? (moment[hi] - moment[lo]) / m / TEX_W : .5;
  }
  return profile;
}

const sample = (profile: Float32Array, row: number) =>
  profile[Math.max(0, Math.min(TEX_H - 1, Math.round(row)))];

export function ExperienceRidge() {
  const ridgeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ridge = ridgeRef.current;
    const canvas = canvasRef.current;
    const star = ridge?.querySelector<HTMLElement>("[data-star]");
    if (!ridge || !canvas || !star) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 820px)");
    const image = new Image();
    let profile: Float32Array | null = null;
    let frame = 0;
    let drawFrame = 0;

    // Centre of the band inside the ridge column, following the same wave the
    // about section's ribbon draws.
    const ridgeX = (y: number, height: number, width: number) =>
      ridge.clientWidth / 2 + (sample(profile!, (y / height) * (TEX_H - 1)) - .5) * width;

    function draw() {
      drawFrame = 0;
      const about = document.querySelector<HTMLElement>("[data-dust-trail]");
      if (!profile || !about || !ridge || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const r = ridge.getBoundingClientRect();
      const a = about.getBoundingClientRect();
      const mobile = compact.matches;
      const width = mobile ? 48 : 120;
      const height = r.height;
      // The ribbon texture overflows its box by 8px at each end.
      const scale = TEX_H / (a.height + 16);
      const startRow = TEX_H * (a.height + 8) / (a.height + 16);
      const yA = a.bottom - r.top;
      const x0 = a.left + a.width / 2 - r.left + (sample(profile, startRow) - .5) * a.width;
      const x1 = ridgeX(0, height, width);
      // On small screens the trail hugs the page edge, thinner and fainter,
      // so it never sits on top of the text it passes.
      const edge = -r.left + 6;
      const ramp = Math.min(110, -yA / 3);

      function path(y: number) {
        if (y >= 0) return { x: ridgeX(y, height, width), w: width, alpha: Math.min(1, (height - y) / 140) };
        if (!mobile) return { x: lerp(x0, x1, smoother((y - yA) / -yA)), w: width, alpha: 1 };
        const t = Math.min(smoother((y - yA) / ramp), smoother(-y / ramp));
        const x = y - yA < -y ? lerp(x0, edge, t) : lerp(x1, edge, t);
        return { x, w: lerp(width, 20, t), alpha: lerp(1, .32, t) };
      }

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      let left = Infinity, right = -Infinity;
      for (let y = yA; y <= height; y += 8) {
        const { x, w } = path(y);
        left = Math.min(left, x - w);
        right = Math.max(right, x + w);
      }
      left = Math.floor(left);
      const cssW = Math.ceil(right - left);
      const cssH = Math.ceil(height - yA);
      canvas.style.left = `${left}px`;
      canvas.style.top = `${yA}px`;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const step = 1 / dpr;
      const rows = Math.max(1, scale / dpr);
      for (let i = 0; i < canvas.height; i++) {
        const y = yA + i * step;
        const { x, w, alpha } = path(y);
        // Widen the band where the path leans, so it keeps its thickness.
        const slope = (path(y + 2).x - path(y - 2).x) / 4;
        const drawW = w * Math.hypot(1, slope);
        const row = (startRow + (y - yA) * scale) % TEX_H;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          image, 0, row, TEX_W, Math.min(rows, TEX_H - row),
          (x - left - sample(profile, row) * drawW) * dpr, i, drawW * dpr, 1,
        );
      }
      ctx.globalAlpha = 1;
      update();
    }

    function update() {
      frame = 0;
      if (!ridge || !star || !profile) return;
      const { top, height } = ridge.getBoundingClientRect();
      const width = compact.matches ? 48 : 120;
      if (motion.matches) {
        star.style.setProperty("--star-x", `${ridgeX(height * .3, height, width) - ridge.clientWidth / 2}px`);
        return;
      }
      // Sticky positioning handles the main scroll movement. Only the small
      // drift inside the viewport needs interpolation between wheel events.
      const progress = Math.max(0, Math.min(1, (innerHeight * .32 - top) / Math.max(1, height - innerHeight * .26)));
      const track = star.parentElement!.getBoundingClientRect();
      const y = track.top - top + progress * (track.height - star.offsetHeight) + star.offsetHeight / 2;
      ridge.style.setProperty("--progress", String(progress));
      star.style.setProperty("--star-x", `${ridgeX(y, height, width) - ridge.clientWidth / 2}px`);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function scheduleDraw() {
      if (!drawFrame) drawFrame = requestAnimationFrame(draw);
    }

    image.onload = () => {
      profile = bandProfile(image);
      draw();
    };
    image.src = dust.src;

    const observer = new ResizeObserver(scheduleDraw);
    observer.observe(ridge);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleDraw);
    motion.addEventListener("change", schedule);
    compact.addEventListener("change", scheduleDraw);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(drawFrame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleDraw);
      motion.removeEventListener("change", schedule);
      compact.removeEventListener("change", scheduleDraw);
    };
  }, []);

  return (
    <div ref={ridgeRef} className={s.ridge} aria-hidden="true">
      <canvas ref={canvasRef} className={s.trail} />
      <div className={s.starTrack}><span className={s.star} data-star /></div>
    </div>
  );
}
