"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import s from "./painel.module.css";

const TZ = "America/Sao_Paulo";
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });

/** Re-renders every `ms` once mounted; returns null on the server and first paint. */
function useNow(ms: number) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

/** Grid wrapper that feeds the pointer position to each card for a soft spotlight. */
export function SpotlightGrid({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (!card || !ref.current?.contains(card)) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };
  return (
    <div ref={ref} className={className} onPointerMove={onMove}>
      {children}
    </div>
  );
}

export function GoianiaTime() {
  const now = useNow(15_000);
  return (
    <div className={s.timeBlock}>
      <time className={s.bigTime}>{now ? timeFmt.format(now) : "--:--"}</time>
      <p className={s.date}>{now ? dateFmt.format(now) : " "}</p>
    </div>
  );
}

// ---------- Moon phase (as seen from the southern hemisphere) ----------

const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

function moonPhase(date: Date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86_400_000;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
  const phase = age / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const names: [number, string][] = [
    [1.85, "Lua nova"],
    [7.38, "Lua crescente"],
    [9.23, "Quarto crescente"],
    [14.77, "Crescente gibosa"],
    [16.61, "Lua cheia"],
    [22.15, "Minguante gibosa"],
    [23.99, "Quarto minguante"],
    [27.68, "Lua minguante"],
    [SYNODIC + 1, "Lua nova"],
  ];
  const name = names.find(([limit]) => age < limit)![1];
  return { phase, illumination, name };
}

function litPath(phase: number, r: number) {
  const rx = Math.abs(Math.cos(2 * Math.PI * phase)) * r;
  if (phase < 0.5) {
    // waxing: lit on the right (northern view)
    const sweep = phase < 0.25 ? 0 : 1;
    return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${sweep} 0 ${-r} Z`;
  }
  const sweep = phase < 0.75 ? 0 : 1;
  return `M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} A ${rx} ${r} 0 0 ${sweep} 0 ${-r} Z`;
}

export function MoonToday() {
  const now = useNow(60 * 60 * 1000);
  const moon = now ? moonPhase(now) : null;
  const r = 34;
  return (
    <div className={s.moon}>
      <svg viewBox="-44 -44 88 88" aria-hidden="true">
        <circle r={r} className={s.moonDark} />
        {/* mirrored: in Goiânia the waxing moon is lit on the left */}
        {moon && <path d={litPath(moon.phase, r)} className={s.moonLit} transform="scale(-1 1)" />}
        <circle r={r} className={s.moonRim} />
      </svg>
      <p className={s.moonName}>{moon ? moon.name : " "}</p>
      <p className={s.moonMeta}>{moon ? `${Math.round(moon.illumination * 100)}% iluminada` : " "}</p>
    </div>
  );
}

export function GraduationProgress({ start, endLabel }: { start: number; endLabel: string }) {
  const now = useNow(60 * 60 * 1000);
  const from = Date.UTC(start, 0, 1);
  const to = Date.UTC(2026, 11, 31);
  const pct = now ? Math.min(100, Math.max(0, ((now.getTime() - from) / (to - from)) * 100)) : 0;
  return (
    <div className={s.progress}>
      <div className={s.bar} role="img" aria-label={`Curso ${Math.round(pct)}% concluído no tempo`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className={s.barLegend}>
        <span>{start}</span>
        <span>{now ? `${Math.round(pct)}% do caminho` : " "}</span>
        <span>{endLabel}</span>
      </p>
    </div>
  );
}
