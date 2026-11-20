"use client";

import { useState, type KeyboardEvent } from "react";
import { LocalClock } from "@/components/prototypes/LocalClock";
import { profile } from "@/content/portfolio";
import s from "./carta.module.css";

type Ring = "agora" | "ferramentas" | "base";

type Point = {
  id: string;
  ring: Ring;
  angle: number;
  title: string;
  meta: string;
  text: string;
  clock?: boolean;
};

const C = 300;
const RINGS: Record<Ring, { r: number; label: string }> = {
  agora: { r: 92, label: "Agora" },
  ferramentas: { r: 172, label: "Ferramentas" },
  base: { r: 250, label: "Base" },
};

// Facts come from main: profile.json, experience.json and projects.json.
const POINTS: Point[] = [
  {
    id: "umobi",
    ring: "agora",
    angle: -52,
    title: profile.company,
    meta: "Agora · desde 2026",
    text: "Desenvolvedor full stack: Flutter em produção para Android e iOS, interfaces em Angular e back-end em PHP/Laravel.",
  },
  {
    id: "ufg",
    ring: "agora",
    angle: 128,
    title: profile.education.short,
    meta: `Agora · ${profile.education.start} — ${profile.education.expectedShort}`,
    text: `${profile.education.degree} na ${profile.education.institution}, com conclusão prevista para ${profile.education.expected}.`,
  },
  {
    id: "ts",
    ring: "ferramentas",
    angle: 8,
    title: "TypeScript",
    meta: "Ferramentas · stack principal",
    text: "Base dos projetos web recentes, como o Orbitarium e o Lumen.",
  },
  {
    id: "react",
    ring: "ferramentas",
    angle: 74,
    title: "React / Next.js",
    meta: "Ferramentas · stack principal",
    text: "Interfaces do Orbit e do Orbitarium; Next.js 16 no SaaS multi-tenant Lumen.",
  },
  {
    id: "flutter",
    ring: "ferramentas",
    angle: 152,
    title: "Flutter",
    meta: "Ferramentas · stack principal",
    text: "Apps em produção na Umobi, o Revela Fácil da Fujioka e o Memora.",
  },
  {
    id: "django",
    ring: "ferramentas",
    angle: 214,
    title: "Python / Django",
    meta: "Ferramentas · stack principal",
    text: "Sistemas web com PostgreSQL e APIs REST no CETT/UFG.",
  },
  {
    id: "laravel",
    ring: "ferramentas",
    angle: 318,
    title: "Laravel",
    meta: "Ferramentas · stack principal",
    text: "Back-end e painéis administrativos com Filament na Umobi.",
  },
  {
    id: "goiania",
    ring: "base",
    angle: 232,
    title: "Goiânia, GO",
    meta: `Base · ${profile.coordinates}`,
    text: `Base no Brasil, no fuso ${profile.timezone}.`,
    clock: true,
  },
  {
    id: "remoto",
    ring: "base",
    angle: 36,
    title: "100% remoto",
    meta: "Base · disponibilidade",
    text: `${profile.availability}.`,
  },
];

function polar(r: number, angle: number) {
  const a = (angle * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

const toolPath = POINTS.filter((p) => p.ring === "ferramentas")
  .map((p) => polar(RINGS[p.ring].r, p.angle))
  .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
  .join(" ");

/** Star chart (left) and focus panel (right of the text column) sharing one selection. */
export function CartaCeleste() {
  const [activeId, setActiveId] = useState(POINTS[0].id);
  const active = POINTS.find((p) => p.id === activeId) ?? POINTS[0];
  const activePos = polar(RINGS[active.ring].r, active.angle);

  const onKey = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveId(id);
    }
  };

  return (
    <>
      <div className={s.chartWrap}>
        <svg viewBox="0 0 600 600" className={s.chart} aria-label="Carta celeste: trabalho atual, ferramentas e base">
          <defs>
            <radialGradient id="carta-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,250,240,0.9)" />
              <stop offset="40%" stopColor="rgba(255,250,240,0.18)" />
              <stop offset="100%" stopColor="rgba(255,250,240,0)" />
            </radialGradient>
          </defs>

          <circle cx={C} cy={C} r={286} className={s.outer} />
          <circle cx={C} cy={C} r={278} className={s.ticks} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const a = polar(286, deg);
            const b = polar(110, deg);
            return <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={s.spoke} />;
          })}
          {[0, 90, 180, 270].map((deg) => {
            const p = polar(298, deg - 90);
            return (
              <text key={deg} x={p.x} y={p.y + 4} className={s.degree} textAnchor="middle">
                {deg}°
              </text>
            );
          })}

          {(Object.keys(RINGS) as Ring[]).map((ring) => (
            <g key={ring} className={s.ringGroup} data-active={active.ring === ring || undefined}>
              <circle cx={C} cy={C} r={RINGS[ring].r} className={s.ring} />
              <text x={C} y={C - RINGS[ring].r - 8} textAnchor="middle" className={s.ringLabel}>
                {RINGS[ring].label}
              </text>
            </g>
          ))}

          <polyline points={toolPath} className={s.constellation} />

          <line x1={C} y1={C} x2={activePos.x} y2={activePos.y} className={s.beam} key={active.id} />

          <circle cx={C} cy={C} r={34} fill="url(#carta-core)" />
          <circle cx={C} cy={C} r={3.5} className={s.coreDot} />
          <text x={C} y={C + 26} textAnchor="middle" className={s.coreLabel}>
            {profile.initials}
          </text>

          {POINTS.map((point, i) => {
            const pos = polar(RINGS[point.ring].r, point.angle);
            const isActive = point.id === active.id;
            // Outer-ring labels point inwards so they never touch the tick ring.
            const below = point.ring === "base" ? pos.y < C : pos.y > C;
            return (
              <g
                key={point.id}
                className={s.star}
                data-active={isActive || undefined}
                style={{ animationDelay: `${i * -0.6}s` }}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={point.title}
                onMouseEnter={() => setActiveId(point.id)}
                onFocus={() => setActiveId(point.id)}
                onClick={() => setActiveId(point.id)}
                onKeyDown={(event) => onKey(event, point.id)}
              >
                <circle cx={pos.x} cy={pos.y} r={20} className={s.hit} />
                <circle cx={pos.x} cy={pos.y} r={11} className={s.halo} />
                <circle cx={pos.x} cy={pos.y} r={point.ring === "agora" ? 4.2 : 3} className={s.dot} />
                <text x={pos.x} y={pos.y + (below ? 24 : -16)} textAnchor="middle" className={s.starLabel}>
                  {point.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={s.panel} aria-live="polite">
        <p className={s.panelMeta}>{active.meta}</p>
        <p className={s.panelTitle}>{active.title}</p>
        <p className={s.panelText}>{active.text}</p>
        {active.clock && (
          <p className={s.panelMeta}>
            Agora: <LocalClock className={s.clock} />
          </p>
        )}
        <ul className={s.index} aria-label="Pontos da carta">
          {POINTS.map((point) => (
            <li key={point.id}>
              <button
                type="button"
                data-active={point.id === active.id || undefined}
                onClick={() => setActiveId(point.id)}
                onMouseEnter={() => setActiveId(point.id)}
              >
                {point.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
