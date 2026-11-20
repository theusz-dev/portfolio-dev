"use client";

import { useRef } from "react";
import { useCanvasLoop } from "./useCanvasLoop";

type Point = { u: number; z: number; jx: number; seed: number };
type Star = { x: number; y: number; r: number; phase: number };

const Z_NEAR = 1.2;
const Z_FAR = 46;
const BUCKETS = 7;

function terrainHeight(x: number, z: number, travel: number) {
  const zz = z + travel;
  const ridge = Math.min(1, Math.max(0, (z - 8) / 24));
  const amp = 0.3 + 5.6 * Math.pow(ridge, 1.5);
  // Ridged component gives the far range sharp crests; the rest rolls softly.
  const crest = 1 - Math.abs(Math.sin(x * 0.15 + zz * 0.05));
  const roll = 0.5 + 0.5 * Math.sin(x * 0.47 - zz * 0.19 + 1.3);
  const grain = 0.5 + 0.5 * Math.sin(x * 1.3 + zz * 0.7 + 0.4);
  return amp * (0.6 * crest * crest + 0.28 * roll + 0.12 * grain);
}

/** A field of dust-like particles shaped into slow, rolling dunes. */
export function ParticleTerrain({ className }: { className?: string }) {
  const points = useRef<Point[]>([]);
  const stars = useRef<Star[]>([]);
  const buckets = useRef<number[][]>([]);

  const canvasRef = useCanvasLoop(
    ({ width, height, isSmall }) => {
      const cols = isSmall ? 90 : 170;
      const rows = isSmall ? 64 : 96;
      const next: Point[] = [];
      for (let r = 0; r < rows; r++) {
        // Rows are spaced so they compress towards the horizon.
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

      const starCount = Math.round((width * height) / (isSmall ? 5200 : 7800));
      stars.current = Array.from({ length: starCount }, () => ({
        x: Math.random(),
        y: Math.random() * 0.55,
        r: Math.random() < 0.08 ? 1.3 : 0.7,
        phase: Math.random() * Math.PI * 2,
      }));
      buckets.current = Array.from({ length: BUCKETS }, () => []);
    },
    ({ ctx, width, height, time, pointer, isSmall }) => {
      const horizon = height * (isSmall ? 0.66 : 0.62);
      const focal = Math.min(width, height * 1.6) * (isSmall ? 1.05 : 0.82);
      const camY = 1.55 + pointer.y * 0.12;
      const sway = pointer.x * 0.8;
      const travel = time * 0.55;
      const cx = width / 2;

      for (const star of stars.current) {
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.8 + star.phase));
        ctx.fillStyle = `rgba(232, 228, 220, ${0.5 * twinkle})`;
        ctx.fillRect(star.x * width, star.y * height, star.r, star.r);
      }

      const lists = buckets.current;
      for (const list of lists) list.length = 0;

      for (const p of points.current) {
        const halfSpan = ((width / 2) * p.z) / focal;
        const x = (p.u + p.jx) * halfSpan * 2.3;
        const h = terrainHeight(x + sway, p.z, travel);
        const sx = cx + ((x - sway * 0.15) * focal) / p.z;
        if (sx < -2 || sx > width + 2) continue;
        const sy = horizon + (((camY - h) * focal) / p.z) * 0.55;
        if (sy < 0 || sy > height + 2) continue;

        const depth = 1 - p.z / Z_FAR;
        const fog = Math.min(1, depth * 1.35);
        const crest = Math.min(1, h / 4);
        const light = 0.12 + 0.6 * fog * (0.55 + 0.45 * crest) + 0.28 * p.seed * fog;
        const bucket = Math.min(BUCKETS - 1, Math.floor(light * BUCKETS));
        const size = Math.max(0.6, Math.min(2.1, 2.4 / Math.sqrt(p.z)));
        lists[bucket].push(sx, sy, size);
      }

      for (let b = 0; b < BUCKETS; b++) {
        const list = lists[b];
        if (!list.length) continue;
        ctx.fillStyle = `rgba(236, 232, 224, ${((b + 1) / BUCKETS) * 0.85})`;
        for (let i = 0; i < list.length; i += 3) {
          ctx.fillRect(list[i], list[i + 1], list[i + 2], list[i + 2]);
        }
      }
    },
  );

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
