"use client";

import { useEffect, useRef } from "react";
import { cssRgb } from "./cssRgb";
import { useCanvasLoop } from "./useCanvasLoop";

type Point = { u: number; z: number; jx: number; seed: number };
type Star = { x: number; y: number; r: number; phase: number };

/** A pulse spreading through the sand in rings, centred at world (x, z). */
type Ripple = { x: number; z: number; start: number };
/** A handful of stars joined into a figure, drawn one segment at a time. */
type Constellation = { stars: number[]; edges: [number, number][]; start: number; label: string };
/** A spot the cursor (or the wandering wind) passed over, in canvas pixels. */
type Trace = { x: number; y: number; t: number };

export type DuneEffect = "ondas" | "constelacoes" | "rastro";
const EFFECTS: DuneEffect[] = ["ondas", "constelacoes", "rastro"];

const Z_NEAR = 1.2;
const Z_FAR = 46;
const BUCKETS = 7;

const RIPPLE_SPEED = 3; // world units per second
const RIPPLE_LIFE = 11;
const SEGMENT_TIME = 0.42;
const CONSTELLATION_HOLD = 3.6;
const CONSTELLATION_FADE = 1.6;
const TRACE_LIFE = 1.5;

export function terrainHeight(x: number, z: number, travel: number) {
  const zz = z + travel;
  const ridge = Math.min(1, Math.max(0, (z - 8) / 24));
  const amp = 0.3 + 5.6 * Math.pow(ridge, 1.5);
  // Ridged component gives the far range sharp crests; the rest rolls softly.
  const crest = 1 - Math.abs(Math.sin(x * 0.15 + zz * 0.05));
  const roll = 0.5 + 0.5 * Math.sin(x * 0.47 - zz * 0.19 + 1.3);
  const grain = 0.5 + 0.5 * Math.sin(x * 1.3 + zz * 0.7 + 0.4);
  return amp * (0.6 * crest * crest + 0.28 * roll + 0.12 * grain);
}

function effectFromUrl(): DuneEffect {
  const value = new URLSearchParams(window.location.search).get("efeito");
  return EFFECTS.includes(value as DuneEffect) ? (value as DuneEffect) : "ondas";
}

/**
 * A field of dust-like particles shaped into slow, rolling dunes, with one
 * ambient effect on top (picked with `?efeito=` while we compare them).
 */
export function ParticleTerrain({ className }: { className?: string }) {
  const points = useRef<Point[]>([]);
  const stars = useRef<Star[]>([]);
  const buckets = useRef<number[][]>([]);
  const effect = useRef<DuneEffect>("ondas");

  const ripples = useRef<Ripple[]>([]);
  const nextRipple = useRef(1.2);
  const taps = useRef<{ x: number; y: number }[]>([]);

  const figures = useRef<Constellation[]>([]);
  const nextFigure = useRef(1.5);

  const traces = useRef<Trace[]>([]);
  const lastMove = useRef(-Infinity);
  const clock = useRef(0);

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
      figures.current = [];
      traces.current = [];
    },
    ({ ctx, width, height, time, pointer, isSmall }) => {
      clock.current = time;
      const mode = effect.current;
      const dot = cssRgb(ctx.canvas, "--particle-rgb", "236, 232, 224");
      const starRgb = cssRgb(ctx.canvas, "--particle-star-rgb", "232, 228, 220");
      const horizon = height * (isSmall ? 0.66 : 0.62);
      const focal = Math.min(width, height * 1.6) * (isSmall ? 1.05 : 0.82);
      const camY = 1.55 + pointer.y * 0.12;
      const sway = pointer.x * 0.8;
      const travel = time * 0.55;
      const cx = width / 2;

      // --- Sky ---------------------------------------------------------------
      const lit = mode === "constelacoes" ? updateConstellations(width, height, time, isSmall) : null;
      for (let i = 0; i < stars.current.length; i++) {
        const s = stars.current[i];
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.8 + s.phase));
        const boost = lit?.get(i) ?? 0;
        ctx.fillStyle = `rgba(${starRgb}, ${Math.min(1, 0.85 * twinkle + boost)})`;
        const r = s.r + boost * 0.9;
        ctx.fillRect(s.x * width - (r - s.r) / 2, s.y * height - (r - s.r) / 2, r, r);
      }
      if (lit) drawConstellations(ctx, width, height, time, starRgb);

      // --- Effect state ------------------------------------------------------
      const rippleList = ripples.current;
      if (mode === "ondas") {
        // Taps arrive in canvas pixels; drop them onto the sand.
        for (const tap of taps.current.splice(0)) {
          if (tap.y < horizon + 6) continue;
          const z = Math.min(32, Math.max(2.5, (camY * focal * 0.55) / (tap.y - horizon)));
          rippleList.push({ x: ((tap.x - cx) * z) / focal + sway * 0.15, z, start: time });
        }
        if (time >= nextRipple.current) {
          const z = 6 + Math.random() * 16;
          const u = (Math.random() - 0.5) * 0.6;
          rippleList.push({ x: ((u * (width / 2) * z) / focal) * 2.3, z, start: time });
          nextRipple.current = time + 5 + Math.random() * 3;
        }
        for (let i = rippleList.length - 1; i >= 0; i--) {
          if (time - rippleList[i].start > RIPPLE_LIFE) rippleList.splice(i, 1);
        }
        if (rippleList.length > 5) rippleList.splice(0, rippleList.length - 5);
      }

      const trail = traces.current;
      let box: [number, number, number, number] | null = null;
      if (mode === "rastro") {
        // With no cursor around, an invisible wind wanders over the dunes.
        if (time - lastMove.current > 3.5) {
          const wx = cx + width * 0.4 * Math.sin(time * 0.21) * Math.cos(time * 0.07);
          const wy = horizon + (height - horizon) * (0.42 + 0.28 * Math.sin(time * 0.33 + 1.1));
          pushTrace(trail, wx, wy, time);
        }
        while (trail.length && time - trail[0].t > TRACE_LIFE) trail.shift();
        if (trail.length) {
          box = [Infinity, Infinity, -Infinity, -Infinity];
          for (const n of trail) {
            box[0] = Math.min(box[0], n.x - 90);
            box[1] = Math.min(box[1], n.y - 90);
            box[2] = Math.max(box[2], n.x + 90);
            box[3] = Math.max(box[3], n.y + 90);
          }
        }
      }

      // --- Dunes -------------------------------------------------------------
      const lists = buckets.current;
      for (const list of lists) list.length = 0;

      for (const p of points.current) {
        const halfSpan = ((width / 2) * p.z) / focal;
        const x = (p.u + p.jx) * halfSpan * 2.3;
        const h = terrainHeight(x + sway, p.z, travel);
        let sx = cx + ((x - sway * 0.15) * focal) / p.z;
        if (sx < -2 || sx > width + 2) continue;
        let sy = horizon + (((camY - h) * focal) / p.z) * 0.55;
        let glow = 0;

        if (rippleList.length && mode === "ondas") {
          for (const r of rippleList) {
            const age = time - r.start;
            const dx = x - r.x;
            const dz = p.z - r.z;
            const d = Math.sqrt(dx * dx + dz * dz) - age * RIPPLE_SPEED;
            if (d > 4 || d < -4) continue;
            const damp = Math.exp(-age * 0.3) / (1 + age * RIPPLE_SPEED * 0.06);
            const wave = Math.exp(-(d * d) / 3.2) * Math.cos(d * 2.4) * damp;
            sy -= wave * 20 * (1 - 0.45 * (p.z / Z_FAR));
            if (wave > 0) glow += wave;
          }
        } else if (box && sx > box[0] && sx < box[2] && sy > box[1] && sy < box[3]) {
          // The sand parts around the cursor's path and slowly settles back.
          let pushX = 0;
          let pushY = 0;
          for (const n of trail) {
            const a = (time - n.t) / TRACE_LIFE;
            const radius = (isSmall ? 40 : 54) + 40 * a;
            const dx = sx - n.x;
            const dy = sy - n.y;
            if (dx > radius || dx < -radius || dy > radius || dy < -radius) continue;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist >= radius) continue;
            const f = (1 - dist / radius) ** 2 * (1 - a) ** 2;
            pushX += (dx / dist) * f;
            pushY += (dy / dist) * f;
            glow += f * 1.1;
          }
          sx += Math.max(-1.5, Math.min(1.5, pushX)) * 22;
          sy += Math.max(-1.5, Math.min(1.5, pushY)) * 12 - Math.min(1, glow) * 5;
        }
        if (sy < 0 || sy > height + 2) continue;

        const depth = 1 - p.z / Z_FAR;
        const fog = Math.min(1, depth * 1.35);
        const crest = Math.min(1, h / 4);
        const light =
          0.12 + 0.6 * fog * (0.55 + 0.45 * crest) + 0.28 * p.seed * fog + Math.min(0.6, glow) * (0.5 + 0.5 * p.seed);
        const bucket = Math.min(BUCKETS - 1, Math.floor(light * BUCKETS));
        // Disturbed grains catch more light and read slightly larger.
        const size = Math.max(0.6, Math.min(2.1, 2.4 / Math.sqrt(p.z))) * (1 + Math.min(1, glow) * 0.9);
        lists[bucket].push(sx, sy, size);
      }

      for (let b = 0; b < BUCKETS; b++) {
        const list = lists[b];
        if (!list.length) continue;
        ctx.fillStyle = `rgba(${dot}, ${((b + 1) / BUCKETS) * 0.85})`;
        for (let i = 0; i < list.length; i += 3) {
          ctx.fillRect(list[i], list[i + 1], list[i + 2], list[i + 2]);
        }
      }
    },
  );

  /** Starts a new figure when it's time, and returns how lit each star is. */
  function updateConstellations(width: number, height: number, time: number, isSmall: boolean) {
    const list = figures.current;
    for (let i = list.length - 1; i >= 0; i--) {
      if (time - list[i].start > figureLength(list[i]) + CONSTELLATION_HOLD + CONSTELLATION_FADE) list.splice(i, 1);
    }
    if (time >= nextFigure.current && list.length < 2) {
      const used = new Set(list.flatMap((f) => f.stars));
      const figure = buildConstellation(stars.current, width, height, used, isSmall);
      if (figure) list.push({ ...figure, start: time });
      nextFigure.current = time + 4.5 + Math.random() * 2.5;
    }

    const lit = new Map<number, number>();
    for (const f of list) {
      const alpha = figureAlpha(f, time);
      const reached = (time - f.start) / SEGMENT_TIME;
      f.stars.forEach((star, order) => {
        // A star lights up as the line reaches it.
        const on = order === 0 ? 1 : Math.min(1, Math.max(0, reached - (order - 1)));
        lit.set(star, Math.max(lit.get(star) ?? 0, 0.55 * on * alpha));
      });
    }
    return lit;
  }

  function drawConstellations(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, rgb: string) {
    ctx.lineWidth = 0.7;
    for (const f of figures.current) {
      const alpha = figureAlpha(f, time);
      const progress = (time - f.start) / SEGMENT_TIME;
      ctx.strokeStyle = `rgba(${rgb}, ${0.32 * alpha})`;
      ctx.beginPath();
      f.edges.forEach(([from, to], i) => {
        const t = Math.min(1, Math.max(0, progress - i));
        if (t <= 0) return;
        const a = stars.current[from];
        const b = stars.current[to];
        const ax = a.x * width;
        const ay = a.y * height;
        const ease = 1 - Math.pow(1 - t, 3);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (b.x * width - ax) * ease, ay + (b.y * height - ay) * ease);
      });
      ctx.stroke();

      // Small rings around the stars that have been reached.
      ctx.strokeStyle = `rgba(${rgb}, ${0.22 * alpha})`;
      ctx.beginPath();
      f.stars.forEach((star, order) => {
        if (progress < order) return;
        const s = stars.current[star];
        ctx.moveTo(s.x * width + 4, s.y * height);
        ctx.arc(s.x * width, s.y * height, 4, 0, Math.PI * 2);
      });
      ctx.stroke();

      // A chart coordinate under the figure, once it is complete.
      const labelAlpha = Math.min(1, Math.max(0, progress - f.edges.length)) * alpha;
      if (labelAlpha > 0) {
        let left = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        for (const star of f.stars) {
          left = Math.min(left, stars.current[star].x * width);
          right = Math.max(right, stars.current[star].x * width);
          bottom = Math.max(bottom, stars.current[star].y * height);
        }
        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(${rgb}, ${0.45 * labelAlpha})`;
        const labelX = Math.min(width - 70, Math.max(70, (left + right) / 2));
        ctx.fillText(f.label, labelX, bottom + 18);
        ctx.textAlign = "start";
      }
    }
  }

  // Effect choice, taps and cursor trail.
  useEffect(() => {
    effect.current = effectFromUrl();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return x < 0 || y < 0 || x > rect.width || y > rect.height ? null : { x, y };
    };
    const onDown = (event: PointerEvent) => {
      if (effect.current !== "ondas") return;
      if ((event.target as Element | null)?.closest("a, button")) return;
      const at = local(event);
      if (at) taps.current.push(at);
    };
    const onMove = (event: PointerEvent) => {
      if (effect.current !== "rastro") return;
      const at = local(event);
      if (!at) return;
      lastMove.current = clock.current;
      pushTrace(traces.current, at.x, at.y, clock.current);
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function pushTrace(trail: Trace[], x: number, y: number, t: number) {
  const last = trail[trail.length - 1];
  if (last && Math.hypot(x - last.x, y - last.y) < 7) return;
  trail.push({ x, y, t });
  if (trail.length > 48) trail.shift();
}

function figureLength(f: Constellation) {
  return (f.edges.length + 1) * SEGMENT_TIME;
}

function figureAlpha(f: Constellation, time: number) {
  const fadeStart = f.start + figureLength(f) + CONSTELLATION_HOLD;
  return time < fadeStart ? 1 : Math.max(0, 1 - (time - fadeStart) / CONSTELLATION_FADE);
}

/**
 * Grows a figure from a random star by repeatedly joining the nearest free
 * star to any star already in it. Keeps clear of the moon and the title.
 */
function buildConstellation(
  stars: Star[],
  width: number,
  height: number,
  used: Set<number>,
  isSmall: boolean,
): Omit<Constellation, "start"> | null {
  const free = (i: number) => {
    if (used.has(i)) return false;
    const x = stars[i].x * width;
    const y = stars[i].y * height;
    const nearMoon = Math.hypot(x - width / 2, y - height * 0.22) < 70;
    const behindTitle = Math.abs(x - width / 2) < width * (isSmall ? 0.5 : 0.36) && y > height * 0.32;
    return !nearMoon && !behindTitle && x > 24 && x < width - 24 && y > 70;
  };
  const candidates = stars.map((_, i) => i).filter(free);
  const reach = Math.max(60, Math.min(width * 0.11, 150));

  for (let attempt = 0; attempt < 8; attempt++) {
    const first = candidates[Math.floor(Math.random() * candidates.length)];
    if (first === undefined) return null;
    const chosen = [first];
    const edges: [number, number][] = [];
    const target = 4 + Math.floor(Math.random() * 4);
    while (chosen.length < target) {
      let best = -1;
      let from = -1;
      let bestDist = Infinity;
      // Prefer extending from the newest star, so figures read as paths with
      // the odd branch rather than tight clumps.
      for (const c of candidates) {
        if (chosen.includes(c)) continue;
        for (let k = 0; k < chosen.length; k++) {
          const a = stars[chosen[k]];
          const d = Math.hypot((stars[c].x - a.x) * width, (stars[c].y - a.y) * height);
          const bias = k === chosen.length - 1 ? 0.8 : 1;
          if (d > 24 && d < reach && d * bias < bestDist) {
            bestDist = d * bias;
            best = c;
            from = chosen[k];
          }
        }
      }
      if (best < 0) break;
      chosen.push(best);
      edges.push([from, best]);
    }
    if (chosen.length >= 4) {
      const head = stars[first];
      const ra = Math.floor(head.x * 24);
      const minutes = Math.floor((head.x * 24 - ra) * 60);
      const dec = Math.round(60 - head.y * 160);
      const label = `AR ${ra}h${String(minutes).padStart(2, "0")}m · δ ${dec >= 0 ? "+" : "−"}${Math.abs(dec)}°`;
      return { stars: chosen, edges, label };
    }
  }
  return null;
}
