"use client";

import { useRef } from "react";
import { terrainHeight } from "./ParticleTerrain";
import { cssRgb } from "./cssRgb";
import { useCanvasLoop } from "./useCanvasLoop";

type Point = { u: number; z: number; jx: number; seed: number };
type Star = { x: number; y: number; r: number; phase: number };
type Meteor = { start: number; x: number; y: number; dirX: number; dirY: number; length: number };

const Z_NEAR = 1.2;
const Z_FAR = 46;
const BUCKETS = 7;
const METEOR_EVERY = 11;
const METEOR_LIFE = 1.1;

/**
 * The closing counterpart of `ParticleTerrain`: the same dust dunes, but they
 * drift away towards a low moon that rims the crests nearest to it.
 * `moon` is the moon's height as a fraction of the canvas (0 = top).
 */
export function ParticleNightfall({ className, horizon = 0.64, moon = 0.555 }: { className?: string; horizon?: number; moon?: number }) {
  const points = useRef<Point[]>([]);
  const stars = useRef<Star[]>([]);
  const lit = useRef<number[][]>([]);
  const plain = useRef<number[][]>([]);
  const meteor = useRef<Meteor | null>(null);

  const canvasRef = useCanvasLoop(
    ({ width, height, isSmall }) => {
      const cols = isSmall ? 90 : 170;
      const rows = isSmall ? 60 : 90;
      const next: Point[] = [];
      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        const z = Z_NEAR + (Z_FAR - Z_NEAR) * Math.pow(t, 1.35);
        for (let c = 0; c < cols; c++) {
          next.push({
            u: (c + Math.random()) / cols - 0.5,
            z: z + (Math.random() - 0.5) * 0.35,
            jx: (Math.random() - 0.5) * 0.02,
            seed: Math.random(),
          });
        }
      }
      points.current = next;

      const starCount = Math.round((width * height) / (isSmall ? 5600 : 8400));
      stars.current = Array.from({ length: starCount }, () => ({
        x: Math.random(),
        y: Math.random() * horizon * 0.9,
        r: Math.random() < 0.08 ? 1.3 : 0.7,
        phase: Math.random() * Math.PI * 2,
      }));
      lit.current = Array.from({ length: BUCKETS }, () => []);
      plain.current = Array.from({ length: BUCKETS }, () => []);
    },
    ({ ctx, width, height, time, pointer, isSmall }) => {
      const dot = cssRgb(ctx.canvas, "--particle-rgb", "236, 232, 224");
      const star = cssRgb(ctx.canvas, "--particle-star-rgb", "232, 228, 220");
      const lightRgb = cssRgb(ctx.canvas, "--light-rgb", "255, 250, 240");
      const horizonY = height * horizon;
      const focal = Math.min(width, height * 1.6) * (isSmall ? 1.05 : 0.82);
      const camY = 1.55 + pointer.y * 0.12;
      const sway = pointer.x * 0.8;
      // Opposite direction to the hero: the dunes recede towards the moon.
      const travel = -time * 0.42;
      const cx = width / 2;
      const moonX = cx - pointer.x * 6;
      const moonY = height * moon;
      const beam = width * (isSmall ? 0.2 : 0.13);

      for (const star of stars.current) {
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.8 + star.phase));
        ctx.fillStyle = `rgba(${star}, ${0.5 * twinkle})`;
        ctx.fillRect(star.x * width, star.y * height, star.r, star.r);
      }

      drawMeteor(ctx, width, horizonY, time, meteor);

      // Moon: a breathing halo, then the disc.
      const breath = 0.5 + 0.5 * Math.sin(time * 0.5);
      const halo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, height * 0.42);
      halo.addColorStop(0, `rgba(${lightRgb}, ${0.12 + 0.03 * breath})`);
      halo.addColorStop(0.25, `rgba(${lightRgb}, 0.035)`);
      halo.addColorStop(1, `rgba(${lightRgb}, 0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      const disc = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 16);
      disc.addColorStop(0, `rgba(${lightRgb}, 1)`);
      disc.addColorStop(0.44, `rgba(${lightRgb}, 1)`);
      disc.addColorStop(0.5, `rgba(${lightRgb}, 0.55)`);
      disc.addColorStop(1, `rgba(${lightRgb}, 0)`);
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 16, 0, Math.PI * 2);
      ctx.fill();

      const litLists = lit.current;
      const plainLists = plain.current;
      for (const list of litLists) list.length = 0;
      for (const list of plainLists) list.length = 0;

      for (const p of points.current) {
        const halfSpan = ((width / 2) * p.z) / focal;
        const x = (p.u + p.jx) * halfSpan * 2.3;
        const h = terrainHeight(x + sway, p.z, travel);
        const sx = cx + ((x - sway * 0.15) * focal) / p.z;
        if (sx < -2 || sx > width + 2) continue;
        const sy = horizonY + (((camY - h) * focal) / p.z) * 0.55;
        if (sy < 0 || sy > height + 2) continue;

        const depth = 1 - p.z / Z_FAR;
        const fog = Math.min(1, depth * 1.35);
        const crest = Math.min(1, h / 4);
        // Moonlight: a soft column under the moon, strongest on the crests.
        const dx = (sx - moonX) / beam;
        const glint = Math.exp(-dx * dx) * (0.3 + 0.7 * crest) * (0.5 + 0.5 * p.seed);
        const base = 0.1 + 0.5 * fog * (0.5 + 0.5 * crest) + 0.22 * p.seed * fog;
        const light = Math.min(0.999, base + 0.75 * glint);
        const bucket = Math.floor(light * BUCKETS);
        const size = Math.max(0.6, Math.min(2.1, 2.4 / Math.sqrt(p.z)));
        (glint > 0.35 ? litLists : plainLists)[bucket].push(sx, sy, size);
      }

      for (let b = 0; b < BUCKETS; b++) {
        const alpha = ((b + 1) / BUCKETS) * 0.85;
        const plainList = plainLists[b];
        ctx.fillStyle = `rgba(${dot}, ${alpha})`;
        for (let i = 0; i < plainList.length; i += 3) ctx.fillRect(plainList[i], plainList[i + 1], plainList[i + 2], plainList[i + 2]);
        const litList = litLists[b];
        ctx.fillStyle = `rgba(${lightRgb}, ${Math.min(1, alpha * 1.1)})`;
        for (let i = 0; i < litList.length; i += 3) ctx.fillRect(litList[i], litList[i + 1], litList[i + 2], litList[i + 2]);
      }
    },
  );

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

/** One faint meteor every few seconds, always in the upper sky. */
function drawMeteor(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  time: number,
  meteor: { current: Meteor | null },
) {
  const cycle = Math.floor(time / METEOR_EVERY);
  const cycleStart = cycle * METEOR_EVERY + 3;
  if (time >= cycleStart && (!meteor.current || meteor.current.start !== cycleStart)) {
    // A shallow fall, 20–35° below the horizontal, to either side.
    const angle = Math.PI * (0.11 + Math.random() * 0.08);
    meteor.current = {
      start: cycleStart,
      x: width * (0.15 + Math.random() * 0.7),
      y: horizonY * (0.05 + Math.random() * 0.3),
      dirX: Math.cos(angle) * (Math.random() < 0.5 ? -1 : 1),
      dirY: Math.sin(angle),
      length: Math.min(width * 0.18, 220),
    };
  }
  const m = meteor.current;
  if (!m) return;
  const t = (time - m.start) / METEOR_LIFE;
  if (t < 0 || t > 1) return;
  const ease = 1 - Math.pow(1 - t, 3);
  const { dirX, dirY } = m;
  const headX = m.x + dirX * m.length * ease;
  const headY = m.y + dirY * m.length * ease;
  const tail = m.length * 0.45 * (1 - t * 0.6);
  const fade = Math.sin(Math.PI * t);
  const lightRgb = cssRgb(ctx.canvas, "--light-rgb", "255, 250, 240");
  const gradient = ctx.createLinearGradient(headX, headY, headX - dirX * tail, headY - dirY * tail);
  gradient.addColorStop(0, `rgba(${lightRgb}, ${0.55 * fade})`);
  gradient.addColorStop(1, `rgba(${lightRgb}, 0)`);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(headX, headY);
  ctx.lineTo(headX - dirX * tail, headY - dirY * tail);
  ctx.stroke();
}
