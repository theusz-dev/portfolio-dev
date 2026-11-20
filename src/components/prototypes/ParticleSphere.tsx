"use client";

import { useRef } from "react";
import { useCanvasLoop } from "./useCanvasLoop";

type Dot = { x: number; y: number; z: number; theta: number; phi: number };

const BUCKETS = 6;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** A slowly turning sphere of points whose surface swells in soft lobes. */
export function ParticleSphere({
  className,
  color = "220, 226, 255",
  wobble = 1,
}: {
  className?: string;
  /** RGB triplet used for the dots. */
  color?: string;
  /** Strength of the surface lobes (0 = perfect sphere). */
  wobble?: number;
}) {
  const dots = useRef<Dot[]>([]);
  const buckets = useRef<number[][]>([]);

  const canvasRef = useCanvasLoop(
    ({ isSmall }) => {
      const count = isSmall ? 2200 : 4200;
      dots.current = Array.from({ length: count }, (_, i) => {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = GOLDEN * i;
        return {
          x: Math.cos(theta) * radius,
          y,
          z: Math.sin(theta) * radius,
          theta: Math.atan2(Math.sin(theta) * radius, Math.cos(theta) * radius),
          phi: Math.acos(y),
        };
      });
      buckets.current = Array.from({ length: BUCKETS }, () => []);
    },
    ({ ctx, width, height, time, pointer }) => {
      const cx = width / 2;
      const cy = height / 2;
      const base = Math.min(width, height) * 0.36;
      const yaw = time * 0.18 + pointer.x * 0.5;
      const pitch = -0.32 + pointer.y * 0.25;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const lists = buckets.current;
      for (const list of lists) list.length = 0;

      for (const d of dots.current) {
        const lobe =
          1 +
          wobble *
            (0.055 * Math.sin(d.theta * 6 + time * 0.9) * Math.sin(d.phi * 5) +
              0.03 * Math.sin(d.phi * 11 - time * 0.6));
        const x0 = d.x * lobe;
        const y0 = d.y * lobe;
        const z0 = d.z * lobe;
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;
        const y2 = y0 * cosP - z1 * sinP;
        const z2 = y0 * sinP + z1 * cosP;
        const perspective = 2.8 / (2.8 - z2);
        const sx = cx + x1 * base * perspective;
        const sy = cy + y2 * base * perspective;
        const facing = (z2 + 1) / 2;
        const rim = Math.pow(Math.sqrt(x1 * x1 + y2 * y2), 6) * 0.45;
        const light = Math.min(0.999, 0.12 + facing * 0.8 + rim);
        const bucket = Math.floor(light * BUCKETS);
        const size = 0.8 + facing * 1.2;
        lists[bucket].push(sx, sy, size);
      }

      for (let b = 0; b < BUCKETS; b++) {
        const list = lists[b];
        if (!list.length) continue;
        ctx.fillStyle = `rgba(${color}, ${((b + 1) / BUCKETS) * 0.95})`;
        for (let i = 0; i < list.length; i += 3) {
          ctx.fillRect(list[i], list[i + 1], list[i + 2], list[i + 2]);
        }
      }
    },
  );

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
