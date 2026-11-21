import type { CSSProperties } from "react";
import aiProjects from "@/content/ai-projects.json";
import iconPaths from "@/content/skill-icon-paths.json";
import skills from "@/content/skills.json";
import { Dunes } from "./Dunes";
import { MobileDunes } from "./MobileDunes";
import s from "./skills.module.css";

const agentTools = [...new Set(aiProjects.flatMap(project => project.tools))];
const groups = skills.map(({ id, category, items }) => ({
  id,
  title: category.pt,
  items: id === "tools" ? items.filter(tool => !agentTools.includes(tool)) : items,
}));
groups.push({ id: "ia", title: "IA no desenvolvimento", items: agentTools });

// Local Simple Icons silhouettes from the original portfolio (CC0).
const symbols: Record<string, string> = {
  SQL: "M4 5c0-4 16-4 16 0s-16 4-16 0Zm0 0v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0",
  "APIs REST": "m8 6-6 6 6 6m8-12 6 6-6 6m-6 1 4-14",
  "Code review": "M3 4h18v13H10l-5 4v-4H3Zm5 7 3 3 5-6",
  Codex: "M2 4h20v16H2Zm4 4 4 4-4 4m7 0h5",
  "Claude Code": "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
};

function TechIcon({ name }: { name: string }) {
  const brand = (iconPaths as Record<string, string>)[name];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {brand ? <path fill="currentColor" d={brand} /> :
        <path fill="none" stroke="currentColor" strokeWidth="1.6" d={symbols[name]} />}
    </svg>
  );
}

// Spectrum colour for each row: the prism splits the beam and every category
// keeps its own ray colour (also used to tint the skill tokens).
const rayColors = ["#ecc196", "#e7d39f", "#d2ddb1", "#b8d8cc", "#b3c9e3", "#cabbe2"];

// Prism geometry (own viewBox 0 0 260 240, never stretched). E is where the
// beam leaves the glass; CSS places E on the rays' origin (210, 220 of 400×420).
const A = "95,22";
const A2 = "133,12";
const B = "28,200";
const B2 = "66,190";
const C = "150,214";
const C2 = "188,204";
const P_IN = "55,129";
const E = "150,124";

// Desktop light: it comes from off-screen along one straight line S → P_IN.
const S = { x: -460, y: 176 };
const IN = { x: 55, y: 129 };
const BEAM_LEN = Math.hypot(IN.x - S.x, IN.y - S.y);
const DIR = { x: (IN.x - S.x) / BEAM_LEN, y: (IN.y - S.y) / BEAM_LEN };
const NRM = { x: -DIR.y, y: DIR.x };
const onBeam = (t: number, off = 0) => ({
  x: S.x + (IN.x - S.x) * t + NRM.x * off,
  y: S.y + (IN.y - S.y) * t + NRM.y * off,
});
const pt = (p: { x: number; y: number }) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
// volumetric shaft: wide and faint where it enters the frame, a thread at the glass
const SHAFT = [
  onBeam(0, -96), onBeam(0.55, -48), onBeam(0.85, -16), onBeam(1, -2),
  onBeam(1, 2), onBeam(0.85, 16), onBeam(0.55, 48), onBeam(0, 96),
].map(pt).join(" ");
// dust motes suspended in the shaft (deterministic, so server and client agree)
const MOTES = Array.from({ length: 16 }, (_, i) => {
  const t = 0.12 + ((i * 0.618) % 1) * 0.74;
  const spread = (1 - t) * 80 + 3;
  const off = (((i * 0.382 + 0.17) % 1) * 2 - 1) * spread * 0.8;
  return { ...onBeam(t, off), r: 0.7 + ((i * 7) % 5) * 0.22, dur: 8 + ((i * 5) % 7), delay: -((i * 1.7) % 9) };
});

function Glass() {
  return (
    <svg className={s.glass} viewBox="0 0 260 240" aria-hidden="true" focusable="false" data-glass>
      <defs>
        <linearGradient id="glass-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6dfd1" stopOpacity=".34" />
          <stop offset=".3" stopColor="#6b675e" stopOpacity=".26" />
          <stop offset=".62" stopColor="#1d1e1f" stopOpacity=".5" />
          <stop offset="1" stopColor="#9a8d79" stopOpacity=".42" />
        </linearGradient>
        <linearGradient id="glass-side" x1="0" y1="0" x2="1" y2=".4">
          <stop offset="0" stopColor="#f7ecd6" stopOpacity=".46" />
          <stop offset=".45" stopColor="#8a7e6a" stopOpacity=".28" />
          <stop offset="1" stopColor="#2a2724" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="glass-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8ea" />
          <stop offset=".55" stopColor="#bdb4a3" stopOpacity=".75" />
          <stop offset="1" stopColor="#6d665a" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="glass-beam-in" x1="0" x2="1">
          <stop offset="0" stopColor="#f6ead2" stopOpacity="0" />
          <stop offset=".75" stopColor="#f6ead2" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff6e2" stopOpacity=".95" />
        </linearGradient>
        <linearGradient id="glass-sweep" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff8ec" stopOpacity=".22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glass-shaft" gradientUnits="userSpaceOnUse" x1={S.x} y1={S.y} x2={IN.x} y2={IN.y}>
          <stop offset=".1" stopColor="#f6e7c8" stopOpacity="0" />
          <stop offset=".45" stopColor="#f6e7c8" stopOpacity=".1" />
          <stop offset=".8" stopColor="#f8ead0" stopOpacity=".18" />
          <stop offset="1" stopColor="#fff3da" stopOpacity=".4" />
        </linearGradient>
        <radialGradient id="glass-glow">
          <stop offset="0" stopColor="#fff4d8" stopOpacity=".55" />
          <stop offset=".3" stopColor="#e8cfa6" stopOpacity=".2" />
          <stop offset="1" stopColor="#c9a16c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glass-caustic">
          <stop offset="0" stopColor="#f2d9ad" stopOpacity=".38" />
          <stop offset="1" stopColor="#f2d9ad" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glass-exit" cx="150" cy="124" r="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff1d2" stopOpacity=".42" />
          <stop offset="1" stopColor="#fff1d2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glass-inner" x1="0" y1="1" x2=".6" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".55" stopColor="#f4ead8" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glass-fan" x1="0" y1="0" x2="0" y2="1">
          {rayColors.map((color, i) => (
            <stop key={color} offset={i / (rayColors.length - 1)} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id="glass-fan-alpha" x1="150" x2="240" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="glass-fan-fade" maskUnits="userSpaceOnUse" x="140" y="60" width="110" height="130">
          <rect x="140" y="60" width="110" height="130" fill="url(#glass-fan-alpha)" />
        </mask>
        <filter id="glass-haze" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id="glass-front-clip">
          <polygon points={`${A} ${C} ${B}`} />
        </clipPath>
        <filter id="glass-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="glass-bloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      {/* contact shadow and the warm caustic thrown on the "floor" */}
      <ellipse cx="108" cy="216" rx="92" ry="9" fill="#000" opacity=".55" filter="url(#glass-soft)" />
      <ellipse className={s.caustic} cx="214" cy="214" rx="34" ry="5" fill="url(#glass-caustic)" />

      {/* desktop: light arriving from off-screen — a faint volumetric shaft with
          suspended dust, one aligned core beam and a pulse that travels into the glass */}
      <g className={s.beamDesk}>
        <polygon points={SHAFT} fill="url(#glass-shaft)" filter="url(#glass-haze)" />
        <path d={`M${pt(S)} L${pt(IN)}`} stroke="#fff3da" strokeWidth="5" opacity=".14" fill="none" filter="url(#glass-soft)" />
        <path d={`M${pt(S)} L${pt(IN)}`} stroke="url(#glass-beam-in)" strokeWidth="1.3" fill="none" />
        <g className={s.motes}>
          {MOTES.map((m, i) => (
            <circle
              key={i}
              cx={m.x}
              cy={m.y}
              r={m.r}
              fill="#fff6e2"
              style={{ "--dx": `${DIR.x * 70}px`, "--dy": `${DIR.y * 70}px`, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` } as CSSProperties}
            />
          ))}
        </g>
        <path className={s.pulse} d={`M${pt(S)} L${pt(IN)}`} pathLength={1} stroke="#fffaf0" strokeWidth="2.4" strokeLinecap="round" fill="none" filter="url(#glass-bloom)" />
      </g>

      {/* phones: the original incoming beam */}
      <g className={`${s.beamIn} ${s.beamPhone}`}>
        <path d={`M-460 176 L${P_IN}`} stroke="url(#glass-beam-in)" strokeWidth="1.3" fill="none" />
        <path d={`M-120 158 L${P_IN}`} stroke="#fff3da" strokeWidth="4" opacity=".1" fill="none" filter="url(#glass-soft)" />
      </g>

      {/* hidden back edges seen through the glass */}
      <path d={`M${B} L${B2} L${A2} M${B2} L${C2}`} fill="none" stroke="#d8d0c0" strokeWidth=".6" opacity=".16" />

      {/* faces */}
      <polygon points={`${A} ${A2} ${C2} ${C}`} fill="url(#glass-side)" />
      <polygon points={`${A} ${A2} ${C2} ${C}`} fill="url(#glass-exit)" />
      <polygon points={`${A} ${C} ${B}`} fill="url(#glass-front)" />
      {/* internal reflection: a fainter triangle seen through the body */}
      <polygon points="92,58 132,196 50,186" fill="url(#glass-inner)" />
      {/* bevel: a second, inset line along each edge gives the glass thickness */}
      <path d="M95 33 L41 194 M101 34 L143 205 M45 196 L141 208 M138 22 L183 196" fill="none" stroke="#e9e1d1" strokeWidth=".5" opacity=".3" />

      {/* light travelling inside the glass */}
      <g className={s.beamInside}>
        <path d={`M${P_IN} Q105 132 ${E}`} stroke="#fff1d4" strokeWidth="7" opacity=".16" fill="none" filter="url(#glass-soft)" />
        <path d={`M${P_IN} Q105 132 ${E}`} stroke="#fff6e4" strokeWidth="1.2" fill="none" />
      </g>

      {/* a slow highlight sweeping across the front face */}
      <g clipPath="url(#glass-front-clip)">
        <rect className={s.sweep} x="-60" y="0" width="46" height="240" fill="url(#glass-sweep)" transform="skewX(-18)" />
      </g>

      {/* edges: bloom underneath, crisp line on top (brighter where light hits) */}
      <g filter="url(#glass-bloom)" opacity=".55">
        <path d={`M${B} L${A} L${C} M${A} L${A2} L${C2} L${C}`} fill="none" stroke="#fff4df" strokeWidth="1.6" />
      </g>
      <path d={`M${B} L${A} L${C} Z M${A} L${A2} L${C2} L${C}`} fill="none" stroke="url(#glass-edge)" strokeWidth=".9" strokeLinejoin="round" />

      {/* specular glints on the apex and along the lit edge */}
      <path d="M97 30 L112 86" stroke="#fffaf0" strokeWidth="1.4" strokeLinecap="round" opacity=".85" />
      <path d="M136 20 L150 70" stroke="#fffaf0" strokeWidth="1" strokeLinecap="round" opacity=".5" />
      <circle cx="96" cy="24" r="1.6" fill="#fffaf0" />

      {/* dispersion: a soft, edgeless fan of spectrum light that melts into the dust */}
      <g className={s.spectrum} mask="url(#glass-fan-fade)" filter="url(#glass-haze)">
        <path d={`M${E} L240 74 L240 178 Z`} fill="url(#glass-fan)" />
      </g>
      <g className={s.glint}>
        <circle cx="150" cy="124" r="26" fill="url(#glass-glow)" />
        <circle cx="150" cy="124" r="1.8" fill="#fff8e6" />
      </g>
    </svg>
  );
}

// The six outgoing rays meet the centers of the six rows in the skills index.
function Prism() {
  return (
    <div className={s.prism} aria-hidden="true">
      <Dunes colors={rayColors} count={groups.length} />
      <Glass />
    </div>
  );
}

export function Skills() {
  return (
    <section id="habilidades" aria-labelledby="skills-title" className={s.section}>
      <div className={s.plate}>
        <h2 id="skills-title">Habilidades</h2>
        <Prism />
      </div>
      <div className={s.grid}>
        <MobileDunes colors={rayColors} />
        {groups.map(({ id, title, items }, i) => (
          <section
            key={id}
            aria-labelledby={`skills-${id}`}
            className={s.group}
            style={{ "--ray": rayColors[i % rayColors.length] } as CSSProperties}
          >
            <h3 id={`skills-${id}`}>
              {title}
              <span className={s.count}>{String(items.length).padStart(2, "0")}</span>
            </h3>
            <ul>
              {items.map(item => (
                <li key={item}>
                  <span className={s.icon}><TechIcon name={item} /></span>
                  <span className={s.name}>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
