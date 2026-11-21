import type { CSSProperties } from "react";
import s from "./cover.module.css";

/**
 * A post's cover: a small technical drawing, generated from its slug so it is
 * the same on every render and different from post to post. Six kinds, in the
 * spirit of the portfolio's sky: a star chart, orbits, a spectrum, a character
 * matrix, a wireframe globe and a ridgeline. They are still until the card is
 * hovered or focused (any ancestor with `data-cover-host`), then they move.
 */

const W = 400;
const H = 225;
const TAU = Math.PI * 2;

const MOTIFS = ["chart", "orbits", "spectrum", "matrix", "globe", "ridges"] as const;
export type Motif = (typeof MOTIFS)[number];

/** Deterministic randomness from a string (FNV-1a + mulberry32). */
export function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const r1 = (n: number) => Math.round(n * 10) / 10;
const between = (rand: Rand, a: number, b: number) => a + rand() * (b - a);
/** A paused animation shows the frame at `-delay`; hover only lets it run. */
const phase = (seconds: number): CSSProperties => ({ animationDelay: `-${r1(seconds)}s` });

export function motifOf(slug: string): Motif {
  return MOTIFS[Math.floor(seeded(`${slug}:motif`)() * MOTIFS.length)];
}

export function Cover({ slug, motif = motifOf(slug), className }: { slug: string; motif?: Motif; className?: string }) {
  const rand = seeded(slug);
  return (
    <svg className={`${s.cover} ${className ?? ""}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" data-motif={motif}>
      {motif === "chart" && <Chart rand={rand} />}
      {motif === "orbits" && <Orbits rand={rand} />}
      {motif === "spectrum" && <Spectrum rand={rand} id={slug} />}
      {motif === "matrix" && <Matrix rand={rand} />}
      {motif === "globe" && <Globe rand={rand} />}
      {motif === "ridges" && <Ridges rand={rand} />}
    </svg>
  );
}

function Dust({ rand, count }: { rand: Rand; count: number }) {
  return (
    <g className={s.dust}>
      {Array.from({ length: count }, (_, i) => {
        const big = rand() < 0.08;
        const twinkle = rand() < 0.12;
        return (
          <circle
            key={i}
            className={twinkle ? s.twinkle : undefined}
            cx={r1(between(rand, 8, W - 8))}
            cy={r1(between(rand, 8, H - 8))}
            r={r1(big ? between(rand, 0.9, 1.3) : between(rand, 0.35, 0.7))}
            opacity={r1(big ? between(rand, 0.6, 0.9) : between(rand, 0.15, 0.45))}
            style={twinkle ? phase(rand() * 4) : undefined}
          />
        );
      })}
    </g>
  );
}

/* 1. A charted figure on a coordinate grid, like the portfolio's plates. */
function Chart({ rand }: { rand: Rand }) {
  type P = { x: number; y: number };
  const centre = { x: between(rand, 150, 250), y: between(rand, 90, 135) };
  const picks: P[] = [];
  for (let tries = 0; picks.length < 7 && tries < 300; tries++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand());
    const p = { x: r1(centre.x + Math.cos(a) * d * 130), y: r1(centre.y + Math.sin(a) * d * 70) };
    if (picks.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 34)) picks.push(p);
  }
  const chain = [picks.reduce((a, b) => (a.x < b.x ? a : b))];
  const left = picks.filter((p) => p !== chain[0]);
  while (left.length) {
    const last = chain[chain.length - 1];
    left.sort((a, b) => Math.hypot(last.x - a.x, last.y - a.y) - Math.hypot(last.x - b.x, last.y - b.y));
    chain.push(left.shift()!);
  }
  const points = chain.map((p) => `${p.x},${p.y}`).join(" ");
  const head = chain[0];
  const ra = `α ${String(Math.floor(rand() * 24)).padStart(2, "0")}h ${String(Math.floor(rand() * 60)).padStart(2, "0")}m`;
  const dec = `δ ${rand() < 0.5 ? "+" : "−"}${Math.floor(rand() * 80)}°`;

  return (
    <>
      <g className={s.grid}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`v${i}`} x1={50 + i * 50} x2={50 + i * 50} y1="0" y2={H} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`h${i}`} x1="0" x2={W} y1={45 + i * 45} y2={45 + i * 45} />
        ))}
      </g>
      <Dust rand={rand} count={70} />
      <polyline className={s.figure} points={points} />
      <polyline className={`${s.trace} ${s.slow}`} points={points} pathLength={1} />
      {chain.map((p, i) => (
        <circle key={i} className={s.node} cx={p.x} cy={p.y} r={i === 0 ? 2.2 : 1.6} />
      ))}
      <g className={s.reticle} style={{ transformOrigin: `${head.x}px ${head.y}px` }}>
        <circle cx={head.x} cy={head.y} r="10" />
        <path d={`M${head.x - 17} ${head.y}h5m24 0h5M${head.x} ${head.y - 17}v5m0 24v5`} />
      </g>
      <text className={s.label} x="14" y={H - 14}>
        {ra} · {dec}
      </text>
    </>
  );
}

/* 2. Orbits around a small star; a bright arc runs along each on hover. */
function Orbits({ rand }: { rand: Rand }) {
  const cx = 200;
  const cy = 112;
  const tilt = r1(between(rand, -16, -6));
  const orbits = [62, 100, 138, 176].map((rx, i) => ({
    rx,
    ry: r1(rx * 0.3),
    at: rand() * TAU,
    size: r1(between(rand, 1.6, 2.8)),
    period: 4 + i * 3.5,
  }));
  return (
    <>
      <Dust rand={rand} count={40} />
      <g transform={`rotate(${tilt} ${cx} ${cy})`}>
        {orbits.map((o, i) => (
          <g key={i}>
            <ellipse className={s.orbit} cx={cx} cy={cy} rx={o.rx} ry={o.ry} />
            <ellipse
              className={s.trace}
              cx={cx}
              cy={cy}
              rx={o.rx}
              ry={o.ry}
              pathLength={1}
              style={{ ...phase((o.at / TAU) * o.period), animationDuration: `${o.period}s` }}
            />
            <circle className={s.node} cx={r1(cx + o.rx * Math.cos(o.at))} cy={r1(cy + o.ry * Math.sin(o.at))} r={o.size} />
          </g>
        ))}
      </g>
      <circle className={s.halo} cx={cx} cy={cy} r="11" />
      <circle className={s.sun} cx={cx} cy={cy} r="3.6" />
    </>
  );
}

/* 3. Spectral lines with a scanner that sweeps across on hover. */
function Spectrum({ rand, id }: { rand: Rand; id: string }) {
  const centre = between(rand, 150, 250);
  const spread = between(rand, 50, 80);
  const lines: { x: number; o: number; top: number }[] = [];
  for (let x = 36; x < W - 36; ) {
    const near = Math.exp(-(((x - centre) / spread) ** 2));
    lines.push({ x: r1(x), o: r1(0.22 + near * 0.6 + rand() * 0.15), top: rand() < 0.15 ? 54 : 44 });
    x += 1.6 + (1 - near) * between(rand, 6, 14) + rand() * 2;
  }
  const bright = lines[Math.floor(rand() * lines.length)];
  const gradient = `scan-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={gradient}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset=".5" stopColor="currentColor" stopOpacity=".22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {lines.map((l, i) => (
        <line key={i} className={s.line} x1={l.x} x2={l.x} y1={l.top} y2="172" opacity={Math.min(l.o, 0.9)} />
      ))}
      <line className={s.emission} x1={bright.x} x2={bright.x} y1="30" y2="180" />
      <g className={s.scale}>
        <line x1="36" x2={W - 36} y1="186" y2="186" />
        {/* 32 steps over 328 px; a label every 8 steps. */}
        {Array.from({ length: 33 }, (_, i) => (
          <line key={i} x1={r1(36 + i * 10.25)} x2={r1(36 + i * 10.25)} y1="186" y2={i % 8 ? 189 : 193} />
        ))}
        {[400, 500, 600, 700].map((nm, i) => (
          <text key={nm} className={s.label} x={36 + i * 82} y="204" textAnchor="middle">
            {nm}
          </text>
        ))}
        <text className={s.label} x={W - 36} y="204" textAnchor="end">
          nm
        </text>
      </g>
      <rect className={s.scan} x="0" y="30" width="44" height="150" fill={`url(#${gradient})`} />
    </>
  );
}

/* 4. A grid of characters: dots, a divider, runs of + and − that flicker on hover. */
function Matrix({ rand }: { rand: Rand }) {
  const cols = 25;
  const rows = 8;
  const dx = 13;
  const dy = 17;
  const x0 = (W - (cols - 1) * dx) / 2;
  const y0 = (H - (rows - 1) * dy) / 2;
  const divider = Math.floor(cols / 2);
  const cells: { x: number; y: number; ch: string; on: boolean; flick: boolean; delay: number }[] = [];
  for (let row = 0; row < rows; row++) {
    // A run or two of signs per row, like a diff.
    const runs = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => {
      const start = Math.floor(rand() * cols);
      return [start, start + 2 + Math.floor(rand() * 5)] as const;
    });
    for (let col = 0; col < cols; col++) {
      const x = x0 + col * dx;
      const y = y0 + row * dy;
      if (col === divider) {
        cells.push({ x, y, ch: "|", on: true, flick: false, delay: 0 });
        continue;
      }
      const inRun = runs.some(([a, b]) => col >= a && col < b);
      const ch = inRun ? (rand() < 0.6 ? "+" : "−") : "·";
      cells.push({ x, y, ch, on: inRun, flick: inRun ? rand() < 0.35 : rand() < 0.03, delay: rand() * 3 });
    }
  }
  return (
    <g className={s.matrix}>
      {cells.map((c, i) => (
        <text
          key={i}
          x={r1(c.x)}
          y={r1(c.y)}
          className={`${c.on ? s.on : s.off} ${c.flick ? s.flick : ""}`}
          style={c.flick ? phase(c.delay) : undefined}
        >
          {c.ch}
        </text>
      ))}
    </g>
  );
}

/* 5. A wireframe globe whose meridians turn on hover, with a satellite. */
function Globe({ rand }: { rand: Rand }) {
  const cx = 200;
  const cy = 112;
  const R = 76;
  const tilt = r1(between(rand, -24, -10));
  const meridians = 8;
  const spin = 18;
  const sat = rand() * TAU;
  return (
    <>
      <Dust rand={rand} count={36} />
      <line className={s.horizon} x1="24" x2={W - 24} y1={cy} y2={cy} />
      <g transform={`rotate(${tilt} ${cx} ${cy})`}>
        <ellipse className={s.orbit} cx={cx} cy={cy} rx="132" ry="30" />
        <circle className={s.globeEdge} cx={cx} cy={cy} r={R} />
        {[-60, -30, 0, 30, 60].map((lat) => {
          const a = (lat * Math.PI) / 180;
          return (
            <ellipse
              key={lat}
              className={s.wire}
              cx={cx}
              cy={r1(cy - R * Math.sin(a))}
              rx={r1(R * Math.cos(a))}
              ry={r1(R * Math.cos(a) * 0.2)}
            />
          );
        })}
        {Array.from({ length: meridians }, (_, k) => {
          const theta = (k / meridians) * Math.PI;
          return (
            <ellipse
              key={k}
              className={`${s.wire} ${s.meridian}`}
              cx={cx}
              cy={cy}
              rx={R}
              ry={R}
              style={{
                transform: `scaleX(${r1(Math.cos(theta) * 100) / 100})`,
                animationDuration: `${spin}s`,
                ...phase((theta / TAU) * spin),
              }}
            />
          );
        })}
        <path className={s.orbit} d={`M${cx - 132} ${cy} A132 30 0 0 0 ${cx + 132} ${cy}`} />
        <ellipse className={`${s.trace} ${s.slow}`} cx={cx} cy={cy} rx="132" ry="30" pathLength={1} style={phase((sat / TAU) * 6)} />
        <circle className={s.node} cx={r1(cx + 132 * Math.cos(sat))} cy={r1(cy + 30 * Math.sin(sat))} r="2.2" />
      </g>
    </>
  );
}

/* 6. Stacked ridgelines (the portfolio's dunes, as a plot); one line is traced. */
function Ridges({ rand }: { rand: Rand }) {
  const count = 10;
  const bumps = Array.from({ length: 3 }, () => ({
    x: between(rand, 90, 310),
    w: between(rand, 22, 55),
    h: between(rand, 18, 52),
  }));
  // Relief grows towards the front, so the front ridge is never hidden: that one is traced.
  const hi = count - 1;
  const lines = Array.from({ length: count }, (_, i) => {
    const base = 66 + i * 11.5;
    const shift = (i - count / 2) * between(rand, 2, 5);
    const pts: [number, number][] = [];
    for (let x = 28; x <= W - 28; x += 4) {
      let lift = 0;
      for (const b of bumps) lift += b.h * Math.exp(-(((x - b.x - shift) / b.w) ** 2)) * (0.3 + 0.7 * (i / (count - 1)));
      const edge = Math.min(1, (x - 28) / 40, (W - 28 - x) / 40);
      pts.push([x, r1(base - (lift + Math.sin(x * 0.07 + i) * 1.4) * edge)]);
    }
    return pts;
  });
  // Scale the relief so the tallest crest (and its label) stays inside the frame.
  const top = Math.min(...lines.flatMap((pts, i) => pts.map(([, y]) => y - (66 + i * 11.5))));
  const fit = top < -58 ? -58 / top : 1;
  lines.forEach((pts, i) => pts.forEach((p) => (p[1] = r1(66 + i * 11.5 + (p[1] - (66 + i * 11.5)) * fit))));
  const peak = lines[hi].reduce((a, b) => (b[1] < a[1] ? b : a));
  const d = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${x} ${y}`).join(" L")}`;
  return (
    <>
      <Dust rand={rand} count={24} />
      {/* Back to front: each ridge's fill hides the lines behind it. */}
      {lines.map((pts, i) => (
        <g key={i}>
          <path className={s.ridgeFill} d={`${d(pts)} L${W - 28} ${H} L28 ${H} Z`} />
          <path className={i === hi ? s.ridgeHi : s.ridge} d={d(pts)} />
        </g>
      ))}
      <path className={`${s.trace} ${s.slow}`} d={d(lines[hi])} pathLength={1} />
      <circle className={s.node} cx={peak[0]} cy={peak[1]} r="2" />
      <line className={s.leader} x1={peak[0]} x2={peak[0]} y1={peak[1] - 6} y2={peak[1] - 22} />
      <text className={s.label} x={peak[0]} y={peak[1] - 27} textAnchor="middle">
        p99
      </text>
    </>
  );
}
