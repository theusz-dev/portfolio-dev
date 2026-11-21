"use client";

import { useEffect, useRef } from "react";
import { useCanvasLoop, type FrameInfo } from "@/components/prototypes/useCanvasLoop";
import styles from "./firmament.module.css";

/**
 * Firmamento, the portfolio's ambient sky, adapted for this blog: a sparse sky
 * turning about a pole above the page, stars near a moving mouse joining faintly
 * into figures, a rare meteor.
 *
 * - `page`: fixed over the whole viewport (the post list), like the portfolio.
 * - `band`: only behind the article title, fading out before the text starts,
 *   so reading stays clean.
 *
 * It draws light stars with `mix-blend-mode: difference`, so they turn dark
 * on the light theme without knowing which theme is on.
 */

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const RGB = "245, 245, 245";

type FixedStar = { r: number; a: number; size: number; alpha: number; tw: number; phase: number };
type Meteor = { start: number; x: number; y: number; angle: number; length: number };

const LINK_DISTANCE = 95;
const LINK_REACH = 170;
const SKY_SPEED = 0.0025;

export function Firmament({ variant = "page" }: { variant?: "page" | "band" }) {
  const stars = useRef<FixedStar[]>([]);
  const pairs = useRef<[number, number][]>([]);
  const geometry = useRef({ px: 0, py: 0, span: 1 });
  const meteor = useRef<Meteor | null>(null);
  const nextMeteor = useRef(rand(10, 20));
  const mouse = useRef({ x: 0, y: 0, at: -Infinity });
  const band = variant === "band";

  const ref = useCanvasLoop(
    ({ width, height, isSmall }) => {
      const px = width / 2;
      // A band is short and wide; keep the pole far enough that the sky still turns gently.
      const py = -Math.max(height * 1.2, band ? width * 0.7 : 0);
      const r0 = -py;
      const r1 = Math.hypot(width / 2, height - py);
      const span = Math.atan2(width / 2, r0) + 0.35;
      geometry.current = { px, py, span };
      const area = span * (r1 * r1 - r0 * r0);
      const count = Math.round(area / (isSmall ? 7000 : 5000));
      stars.current = Array.from({ length: count }, () => {
        const bright = Math.random() < 0.06;
        return {
          r: Math.sqrt(rand(r0 * r0, r1 * r1)),
          a: rand(-span, span),
          size: bright ? rand(1.2, 1.7) : rand(0.55, 1.05),
          alpha: bright ? rand(0.55, 0.75) : rand(0.18, 0.42),
          tw: rand(0.05, 0.25),
          phase: rand(0, TAU),
        };
      });
      // The sky turns rigidly, so neighbours never change.
      const list: [number, number][] = [];
      const s = stars.current;
      for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j < s.length; j++) {
          const dx = s[i].r * Math.sin(s[i].a) - s[j].r * Math.sin(s[j].a);
          const dy = s[i].r * Math.cos(s[i].a) - s[j].r * Math.cos(s[j].a);
          if (dx * dx + dy * dy < LINK_DISTANCE * LINK_DISTANCE) list.push([i, j]);
        }
      }
      pairs.current = list;
    },
    ({ ctx, width, height, time, pointer }: FrameInfo) => {
      const { px, py, span } = geometry.current;
      const turn = time * SKY_SPEED;
      const ox = pointer.x * -10;
      const oy = pointer.y * -6;
      const pos = new Float32Array(stars.current.length * 2);

      stars.current.forEach((s, i) => {
        const a = ((((s.a + turn + span) % (2 * span)) + 2 * span) % (2 * span)) - span;
        const x = px + s.r * Math.sin(a) + ox;
        const y = py + s.r * Math.cos(a) + oy;
        pos[i * 2] = x;
        pos[i * 2 + 1] = y;
        if (x < -4 || x > width + 4 || y < -4 || y > height + 4) return;
        const twinkle = 0.6 + 0.4 * Math.sin(time * s.tw * TAU + s.phase);
        ctx.fillStyle = `rgba(${RGB}, ${s.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, TAU);
        ctx.fill();
      });

      // Faint figures near a moving mouse; they fade 2 s after it stops.
      const idle = (performance.now() - mouse.current.at) / 1000;
      const presence = idle < 2 ? 1 : Math.max(0, 1 - (idle - 2) / 1.5);
      if (presence > 0) {
        // The band scrolls with the page: measure where it is now.
        const rect = band ? ref.current?.getBoundingClientRect() : null;
        const mx = mouse.current.x - (rect?.left ?? 0);
        const my = mouse.current.y - (rect?.top ?? 0);
        ctx.lineWidth = 0.8;
        for (const [i, j] of pairs.current) {
          const x1 = pos[i * 2], y1 = pos[i * 2 + 1], x2 = pos[j * 2], y2 = pos[j * 2 + 1];
          const d = Math.hypot((x1 + x2) / 2 - mx, (y1 + y2) / 2 - my);
          if (d > LINK_REACH) continue;
          ctx.strokeStyle = `rgba(${RGB}, ${(1 - d / LINK_REACH) ** 1.2 * 0.4 * presence})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // A rare, faint meteor (kept in the upper part of a band, away from the fade).
      if (!meteor.current && time > nextMeteor.current) {
        meteor.current = {
          start: time,
          x: rand(width * 0.1, width * 0.9),
          y: rand(height * 0.05, height * (band ? 0.3 : 0.5)),
          angle: rand(0.35, 0.65) * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2,
          length: rand(90, 160),
        };
      }
      const m = meteor.current;
      if (m) {
        const p = (time - m.start) / 1.1;
        if (p >= 1) {
          meteor.current = null;
          nextMeteor.current = time + rand(18, 34);
        } else {
          const travel = p * 260;
          const hx = m.x + Math.cos(m.angle) * travel;
          const hy = m.y + Math.sin(m.angle) * travel;
          const tx = hx - Math.cos(m.angle) * m.length;
          const ty = hy - Math.sin(m.angle) * m.length;
          const g = ctx.createLinearGradient(tx, ty, hx, hy);
          g.addColorStop(0, `rgba(${RGB}, 0)`);
          g.addColorStop(1, `rgba(${RGB}, ${Math.sin(p * Math.PI) * 0.45})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.stroke();
        }
      }
    },
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.current = { x: e.clientX, y: e.clientY, at: performance.now() };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className={band ? styles.band : styles.page} aria-hidden="true">
      <canvas ref={ref} className={styles.canvas} />
    </div>
  );
}
