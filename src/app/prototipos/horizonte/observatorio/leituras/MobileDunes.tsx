"use client";

import { useEffect, useRef, useState } from "react";
import s from "./skills.module.css";

type Pt = { x: number; y: number };
type Branch = { y: number; half: number; x: number };
type Layout = { w: number; top: number; bottom: number; exit: Pt; channel: number; titleRight: number; branches: Branch[] };

const SPINE_X = 2; // the vertical dust river along the left edge of the list
const MQ = "(max-width: 680px)";

/** A dune that peels off the river, narrows to the card's height and enters it. */
function branchPath({ y, half, x }: Branch, riverTop: number) {
  const sx = SPINE_X;
  // leaves the river well above the card (never above the river itself)
  const sy = Math.max(y - 66, riverTop + 18);
  const top = y - half;
  const bottom = y + half;
  return [
    `M${sx - 2} ${sy - 14}`,
    `C${sx + 4} ${sy + 14} ${x - 30} ${top - 8} ${x - 6} ${top - 1}`,
    `C${x + 8} ${top + 1} ${x + 24} ${top + 1} ${x + 46} ${top + 2}`,
    `L${x + 46} ${bottom - 2}`,
    `C${x + 24} ${bottom - 1} ${x + 8} ${bottom - 1} ${x - 6} ${bottom + 1}`,
    `C${x - 34} ${bottom + 4} ${sx + 4} ${sy + 40} ${sx - 2} ${sy + 12}Z`,
  ].join(" ");
}

type Cubic = [Pt, Pt, Pt, Pt];

function cubicAt([p0, c1, c2, p1]: Cubic, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  };
}

/** Closed ribbon around a chain of cubic Bézier segments, with a width profile along it. */
function ribbon(segments: Cubic[], width: (t: number) => number, steps = 40) {
  const centre: Pt[] = [];
  segments.forEach((seg, s) => {
    for (let i = s === 0 ? 0 : 1; i <= steps; i++) centre.push(cubicAt(seg, i / steps));
  });
  const left: Pt[] = [];
  const right: Pt[] = [];
  centre.forEach((c, i) => {
    const a = centre[Math.max(0, i - 1)];
    const b = centre[Math.min(centre.length - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const hw = width(i / (centre.length - 1)) / 2;
    left.push({ x: c.x + nx * hw, y: c.y + ny * hw });
    right.push({ x: c.x - nx * hw, y: c.y - ny * hw });
  });
  const pts = [...left, ...right.reverse()];
  return "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L") + "Z";
}

/** Straight segment expressed as a cubic, so it chains smoothly with curves. */
function line(a: Pt, b: Pt): Cubic {
  return [a, { x: a.x + (b.x - a.x) / 3, y: a.y + (b.y - a.y) / 3 }, { x: a.x + ((b.x - a.x) * 2) / 3, y: a.y + ((b.y - a.y) * 2) / 3 }, b];
}

// Slope of the incoming beam in the glass (from -460,176 to 55,129): it rises to the right.
const BEAM_SLOPE = (129 - 176) / (55 + 460);

/**
 * Phone-only light path. The prism sits beside the title, so its light curves
 * down under the title into a river on the left of the list; the river carries
 * each category's colour and branches into the first card of every row.
 * Hidden (and never measured) on wider screens — the desktop is untouched.
 */
export function MobileDunes({ colors }: { colors: string[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const svg = ref.current;
    const grid = svg?.parentElement;
    const section = svg?.closest("section");
    if (!svg || !grid || !section) return;
    const mq = window.matchMedia(MQ);

    const measure = () => {
      if (!mq.matches) {
        setLayout(null);
        return;
      }
      const box = grid.getBoundingClientRect();
      const glass = section.querySelector<SVGElement>("[data-glass]")?.getBoundingClientRect();
      const title = section.querySelector("h2")?.getBoundingClientRect();
      const firsts = [...grid.querySelectorAll("ul")].map((ul) => ul.firstElementChild as HTMLElement | null);
      if (!box.width || !glass || !title || firsts.some((li) => !li)) return;
      // exit point E of the glass (150, 124 in its 260 × 240 viewBox)
      const exit = {
        x: glass.left + (glass.width * 150) / 260 - box.left,
        y: glass.top + (glass.height * 124) / 240 - box.top,
      };
      const branches = firsts.map((li) => {
        const r = li!.getBoundingClientRect();
        return { x: r.left - box.left, y: r.top + r.height / 2 - box.top, half: (r.height / 2) * 0.9 };
      });
      // the light travels in the gap between the title and the first category label
      const label = grid.querySelector("h3")?.getBoundingClientRect();
      const titleBottom = title.bottom - box.top;
      const labelTop = label ? label.top - box.top : 0;
      // keep well clear of the title's letters: run closer to the label than to the title
      const channel = titleBottom + (labelTop - titleBottom) * 0.62;
      const titleRight = title.right - box.left;
      setLayout({ w: box.width, top: Math.min(exit.y - 24, -40), bottom: box.height, exit, channel, titleRight, branches });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    mq.addEventListener("change", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  if (!layout) {
    return <svg ref={ref} className={s.mobileDunes} aria-hidden="true" focusable="false" />;
  }

  const { w, top, bottom, exit, channel, titleRight, branches } = layout;
  const h = bottom - top;
  const cardX = branches[0]?.x ?? 40;
  const join = { x: SPINE_X, y: channel + 16 };
  const riverEnd = (branches.at(-1)?.y ?? bottom) + 8;

  // From the prism: the dune leaves the glass on the line of the incoming beam,
  // turns down in a soft loop while still to the right of the title, passes
  // under the title with room to spare and turns down into the river.
  const reach = Math.min(30, w - exit.x - 10); // how far it travels on the beam's line
  const out = { x: exit.x + reach, y: exit.y + BEAM_SLOPE * reach };
  const loopX = Math.min(out.x + 16, w - 4);
  const under = { x: Math.max(titleRight - 10, join.x + 60), y: channel };
  const feeder = ribbon(
    [
      line(exit, out),
      [out, { x: loopX, y: out.y }, { x: loopX, y: channel }, { x: out.x - 14, y: channel }],
      line({ x: out.x - 14, y: channel }, under),
      [under, { x: join.x + 40, y: channel }, { x: join.x + 2, y: channel + 2 }, join],
    ],
    (t) => 1.4 + 8 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7) + 3 * t,
  );
  // The river: a slim dust stream running down past every category.
  const river = ribbon(
    [line(join, { x: join.x, y: riverEnd })],
    (t) => 3.6 + 1.6 * Math.sin(t * Math.PI * 7) - 2.6 * Math.pow(t, 6),
  );

  return (
    <svg
      ref={ref}
      className={s.mobileDunes}
      style={{ top, width: w, height: h }}
      viewBox={`0 ${top} ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="mobile-dust" filterUnits="userSpaceOnUse" x="-12" y={top} width={w + 12} height={h} colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="8" result="drift" />
          <feDisplacementMap in="SourceGraphic" in2="drift" scale="6" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="1" result="ribbons" />
          <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="1" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4 0 0 0 -1.94" result="grains" />
          <feComposite in="ribbons" in2="grains" operator="in" />
        </filter>
        {/* the feeder carries white light that warms into the first category's colour */}
        <linearGradient id="mobile-feeder" gradientUnits="userSpaceOnUse" x1={exit.x} y1={exit.y} x2={join.x} y2={join.y}>
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset="1" stopColor={colors[0]} />
        </linearGradient>
        {/* down the river, each category's colour arrives where its branch leaves */}
        <linearGradient id="mobile-river" gradientUnits="userSpaceOnUse" x1="0" y1={join.y} x2="0" y2={riverEnd}>
          <stop offset="0" stopColor={colors[0]} />
          {branches.map((b, i) => (
            <stop
              key={i}
              offset={Math.min(1, Math.max(0, (Math.max(b.y - 66, join.y + 18) - join.y) / (riverEnd - join.y)))}
              stopColor={colors[i % colors.length]}
            />
          ))}
        </linearGradient>
        {/* branches: full density until the card's edge, then the dust thins out inside it */}
        <linearGradient id="mobile-dune-fade" x1="0" x2={w} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset={Math.max(0, (cardX - 6) / w)} stopColor="#fff" />
          <stop offset={(cardX + 16) / w} stopColor="#fff" stopOpacity=".45" />
          <stop offset={(cardX + 42) / w} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="mobile-dune-mask" maskUnits="userSpaceOnUse" x="-12" y={top} width={w + 12} height={h}>
          <rect x="-12" y={top} width={w + 12} height={h} fill="url(#mobile-dune-fade)" />
        </mask>
      </defs>

      <g className={s.rays} filter="url(#mobile-dust)">
        <path d={feeder} fill="url(#mobile-feeder)" />
        <path d={river} fill="url(#mobile-river)" />
        <g mask="url(#mobile-dune-mask)">
          {branches.map((branch, i) => (
            <path key={i} fill={colors[i % colors.length]} d={branchPath(branch, join.y)} />
          ))}
        </g>
      </g>
    </svg>
  );
}
