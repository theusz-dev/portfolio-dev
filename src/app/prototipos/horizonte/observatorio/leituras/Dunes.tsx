"use client";

import { useEffect, useRef, useState } from "react";
import s from "./skills.module.css";

// Ray space: the plate is 400 × 420 units; the SVG is 480 wide so each dune can
// run a little way under the first card of its row and dissolve there.
const W = 480;
const H = 420;
const ORIGIN = { x: 210, y: 220 };

type Target = { y: number; half: number; x: number };

function fallbackTargets(count: number): Target[] {
  return Array.from({ length: count }, (_, i) => ({ y: (i + 0.5) * (H / count), half: 9.5, x: 426 }));
}

/** Dune shape: opens from the prism, then narrows to the card's height and enters it. */
function dunePath({ y, half, x }: Target) {
  const { x: ox, y: oy } = ORIGIN;
  const top = y - half;
  const bottom = y + half;
  return [
    `M${ox} ${oy}`,
    `C263 216 ${x - 110} ${top - 7} ${x - 34} ${top - 4}`,
    `C${x - 12} ${top - 1} ${x + 14} ${top} ${x + 54} ${top + 1}`,
    `L${x + 54} ${bottom - 1}`,
    `C${x + 14} ${bottom} ${x - 12} ${bottom + 1} ${x - 34} ${bottom + 4}`,
    `C${x - 110} ${bottom + 7} 263 ${oy + 4} ${ox} ${oy}Z`,
  ].join(" ");
}

/**
 * The dust dunes. After mount they measure the first card of every row and aim
 * at it exactly (centre and height), so the dune can turn into the card.
 */
export function Dunes({ colors, count }: { colors: string[]; count: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [targets, setTargets] = useState<Target[]>(() => fallbackTargets(count));

  useEffect(() => {
    const svg = ref.current;
    const plate = svg?.parentElement;
    const section = svg?.closest("section");
    if (!svg || !plate || !section) return;

    const measure = () => {
      const box = plate.getBoundingClientRect();
      const firsts = [...section.querySelectorAll("ul")].map((ul) => ul.firstElementChild as HTMLElement | null);
      if (!box.width || !box.height || firsts.length !== count || firsts.some((li) => !li)) return;
      const rects = firsts.map((li) => li!.getBoundingClientRect());
      // Only meaningful when the cards sit to the right of the plate (desktop/tablet).
      if (rects.some((r) => r.left < box.right - 4)) {
        setTargets(fallbackTargets(count));
        return;
      }
      const ux = 400 / box.width;
      const uy = H / box.height;
      setTargets(
        rects.map((r) => ({
          x: (r.left - box.left) * ux,
          y: (r.top + r.height / 2 - box.top) * uy,
          half: (r.height / 2) * uy * 0.92,
        })),
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [count]);

  const cardX = targets[0]?.x ?? 426;

  return (
    <svg ref={ref} className={s.raysSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
      <defs>
        <filter id="prism-dust" filterUnits="userSpaceOnUse" x="204" y="0" width={W - 204} height={H} colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="8" result="drift" />
          <feDisplacementMap in="SourceGraphic" in2="drift" scale="8" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="1.2" result="ribbons" />
          <feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="1" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4 0 0 0 -1.94" result="grains" />
          <feComposite in="ribbons" in2="grains" operator="in" />
        </filter>
        {/* full density up to the card's edge, then the dust thins out inside it */}
        <linearGradient id="prism-dune-fade" x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset={(cardX - 6) / W} stopColor="#fff" />
          <stop offset={(cardX + 18) / W} stopColor="#fff" stopOpacity=".45" />
          <stop offset={(cardX + 46) / W} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="prism-dune-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="url(#prism-dune-fade)" />
        </mask>
      </defs>
      <g mask="url(#prism-dune-mask)">
        <g className={s.rays} filter="url(#prism-dust)">
          {targets.map((target, i) => (
            <path key={i} fill={colors[i % colors.length]} d={dunePath(target)} />
          ))}
        </g>
      </g>
    </svg>
  );
}
