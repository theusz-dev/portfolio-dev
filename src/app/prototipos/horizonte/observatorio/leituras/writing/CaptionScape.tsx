"use client";

import { useRef } from "react";
import { cssRgb } from "@/components/prototypes/cssRgb";
import { useCanvasLoop } from "@/components/prototypes/useCanvasLoop";
import { seeded } from "./seed";
import s from "./scape.module.css";

/** A living particle landscape behind a plate's caption: the text rests in a valley of dunes. */
export function CaptionScape({ seed }: { seed: string }) {
  return (
    <div className={s.scape} aria-hidden="true">
      <Valley seed={seed} />
    </div>
  );
}

const BUCKETS = 7;

type Grain = { u: number; layer: number; k: number; depth: number; jx: number; seed: number };
type Blown = { born: number; u: number; layer: number; vx: number; vy: number };

/**
 * Dunes rising at both sides and underneath, the text resting in the valley
 * between them. Lit from the left; now and then sand blows off a crest.
 */
function Valley({ seed }: { seed: string }) {
  const grains = useRef<Grain[]>([]);
  const blown = useRef<Blown[]>([]);
  const stars = useRef<{ x: number; y: number; phase: number }[]>([]);
  const shape = useRef({ centre: 0.5, phase: 0 });

  const ref = useCanvasLoop(
    ({ width, height }) => {
      const rand = seeded(seed);
      shape.current = { centre: 0.42 + rand() * 0.16, phase: rand() * Math.PI * 2 };
      const cols = Math.round(width / 3.6);
      const next: Grain[] = [];
      for (let layer = 0; layer < 3; layer++)
        for (let c = 0; c < cols; c++)
          for (let k = 0; k < 13; k++)
            next.push({
              u: (c + rand()) / cols,
              layer,
              k,
              depth: k === 0 ? 0 : Math.pow(rand(), 2.2),
              jx: (rand() - 0.5) * 2,
              seed: rand(),
            });
      grains.current = next;
      blown.current = [];
      stars.current = Array.from({ length: Math.round((width * height) / 9000) }, () => ({
        x: rand(),
        y: rand() * 0.45,
        phase: rand() * Math.PI * 2,
      }));
    },
    ({ ctx, width, height, time }) => {
      const dot = cssRgb(ctx.canvas, "--particle-rgb", "236, 232, 224");
      const light = cssRgb(ctx.canvas, "--light-rgb", "255, 250, 240");
      const { centre, phase } = shape.current;
      const lift = [0.12, 0.06, 0];
      const strength = [0.45, 0.7, 1];

      // Height of a layer's crest at u (0..1 across), measured up from the bottom:
      // dunes that climb towards both sides, leaving a valley for the text.
      const ridge = (u: number, layer: number) => {
        const off = Math.abs(u - (centre + (layer - 1) * 0.07)) / 0.5;
        const e = Math.min(1, off);
        const side = e * e * (3 - 2 * e);
        const dunes =
          Math.sin(u * 7.3 + phase + layer * 1.9) * 0.6 +
          Math.sin(u * 13.1 + phase * 1.7 + layer) * 0.3 +
          Math.sin(u * 3.1 - time * 0.04 + layer) * 0.4;
        const up = 0.3 + lift[layer] + 0.5 * side + 0.08 * dunes;
        const ripple = 1.6 * Math.sin(u * 30 + layer * 1.7 - time * 0.7);
        return height - height * up + ripple;
      };

      for (const star of stars.current) {
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.9 + star.phase));
        ctx.fillStyle = `rgba(${light}, ${0.45 * twinkle})`;
        ctx.fillRect(star.x * width, star.y * height, 1, 1);
      }

      const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
      const du = 0.004;
      for (const g of grains.current) {
        const top = ridge(g.u, g.layer);
        const slope = (ridge(g.u + du, g.layer) - ridge(g.u - du, g.layer)) / (2 * du * width);
        const lit = Math.min(1, Math.max(0, 0.5 - slope * 2.4));
        const y = top + g.depth * (height - top);
        const base = g.k === 0 ? 0.35 + 0.5 * lit : (0.12 + 0.6 * lit) * (1 - g.depth * 0.8);
        const alpha = base * strength[g.layer] * (0.7 + 0.3 * g.seed);
        const bucket = Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS));
        buckets[bucket].push(g.u * width + g.jx, y, g.k === 0 ? 1.3 : 1.1);
      }
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = `rgba(${dot}, ${((b + 1) / BUCKETS) * 0.9})`;
        const list = buckets[b];
        for (let i = 0; i < list.length; i += 3) ctx.fillRect(list[i], list[i + 1], list[i + 2], list[i + 2]);
      }

      // Sand blown off the crests, drifting right and up, fading.
      const list = blown.current;
      if (list.length < 26 && Math.random() < 0.18) {
        const side = Math.random() < 0.5 ? Math.random() * 0.25 : 0.75 + Math.random() * 0.25;
        list.push({ born: time, u: side, layer: 1 + Math.round(Math.random()), vx: 10 + Math.random() * 16, vy: 3 + Math.random() * 6 });
      }
      for (let i = list.length - 1; i >= 0; i--) {
        const b = list[i];
        const age = time - b.born;
        if (age > 2.6 || age < 0) {
          list.splice(i, 1);
          continue;
        }
        const x = b.u * width + b.vx * age;
        const y = ridge(b.u, b.layer) - b.vy * age - 6 * age * age * 0.2;
        ctx.fillStyle = `rgba(${light}, ${0.6 * Math.sin((Math.PI * age) / 2.6)})`;
        ctx.fillRect(x, y, 1.1, 1.1);
      }
    },
  );

  return <canvas ref={ref} className={s.canvas} />;
}
