import Link from "next/link";
import { format, href } from "@/i18n/config";
import { CaptionScape } from "./CaptionScape";
import type { Post } from "@/lib/blog/posts";
import { round, seeded } from "./seed";
import { postPath, type WritingProps } from "./types";
import s from "./plates.module.css";

const W = 300;
const H = 225;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** "2026 · V · 15", the way old observatory plates were dated. */
function plateDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${year} · ${ROMAN[Number(month) - 1]} · ${Number(day)}`;
}

type Point = { x: number; y: number };
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * The sky on a post's plate, from its slug: a star field, a charted figure
 * (engineering) or a nebula (reflections), and one object that moved between
 * two exposures (shown on hover, like a blink comparator).
 */
function sky(post: Post) {
  const rand = seeded(post.slug);

  const stars = Array.from({ length: 90 }, () => {
    const big = rand() < 0.07;
    return {
      x: round(6 + rand() * (W - 12)),
      y: round(6 + rand() * (H - 12)),
      r: round(big ? 1.1 + rand() * 0.8 : 0.3 + rand() * 0.5),
      o: round(big ? 0.85 + rand() * 0.15 : 0.25 + rand() * 0.5),
      twinkle: rand() < 0.07 ? round(rand() * 4) : null,
    };
  });
  const bright = stars.filter((star) => star.r > 1).slice(0, 3);

  // The figure: well-spaced stars around a centre, joined nearest-first like a real asterism.
  const centre = { x: W * (0.32 + rand() * 0.36), y: H * (0.34 + rand() * 0.32) };
  const picks: Point[] = [];
  for (let tries = 0; picks.length < 6 && tries < 200; tries++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand());
    const p = { x: round(centre.x + Math.cos(angle) * radius * 88), y: round(centre.y + Math.sin(angle) * radius * 58) };
    if (picks.every((q) => dist(p, q) > 26)) picks.push(p);
  }
  const chain = [picks.reduce((a, b) => (a.x < b.x ? a : b))];
  const left = picks.filter((p) => p !== chain[0]);
  while (left.length) {
    const last = chain[chain.length - 1];
    left.sort((a, b) => dist(last, a) - dist(last, b));
    chain.push(left.shift()!);
  }
  const branch = chain.length > 4 ? [chain[1], chain[chain.length - 1]] : null;

  const nebula = {
    x: round(W * (0.35 + rand() * 0.3)),
    y: round(H * (0.38 + rand() * 0.24)),
    rx: round(70 + rand() * 30),
    ry: round(40 + rand() * 20),
    rotate: round(-30 + rand() * 60),
    seed: Math.floor(rand() * 1000),
  };

  // The moving object: somewhere clear of the figure.
  let object = { x: 0, y: 0 };
  for (let tries = 0; tries < 50; tries++) {
    // Keep clear of the plate number (top right) and the date stamp (bottom left).
    object = { x: round(55 + rand() * (W - 110)), y: round(42 + rand() * (H - 100)) };
    if (dist(object, centre) > 80) break;
  }
  const drift = { x: round(4 + rand() * 3), y: round(-2 + rand() * 4) };

  // A hand-drawn ring: not quite round, not quite closed.
  const ring: string[] = [];
  const start = rand() * Math.PI * 2;
  for (let i = 0; i <= 26; i++) {
    const a = start + (i / 26) * (Math.PI * 2 + 0.5);
    const r = 11 + Math.sin(a * 3 + start) * 1.2 + (i / 26) * 1.6;
    ring.push(`${round(object.x + drift.x / 2 + Math.cos(a) * r * 1.15)},${round(object.y + drift.y / 2 + Math.sin(a) * r)}`);
  }

  const number = String(Math.floor(seeded(`${post.slug}:n`)() * 9000) + 1000);
  return { stars, bright, chain, branch, nebula, object, drift, ring: `M${ring.join(" L")}`, number };
}

export function Plates({ lang, posts, t }: WritingProps) {
  return (
    <ol className={s.grid}>
      {posts.map((post) => {
        const { stars, bright, chain, branch, nebula, object, drift, ring, number } = sky(post);
        const id = `${post.collection}-${post.slug}`;
        return (
          <li key={id} className={s.plate} data-blog={post.collection}>
            <div className={s.glass}>
              <svg className={s.sky} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                <defs>
                  {/* Photographic grain. */}
                  <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed={number} stitchTiles="stitch" />
                    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0 0 0 -0.42" />
                  </filter>
                  <radialGradient id={`vignette-${id}`} r=".75">
                    <stop offset=".55" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity=".7" />
                  </radialGradient>
                  {post.collection === "reflections" && (
                    <>
                      <radialGradient id={`cloud-${id}`}>
                        <stop offset="0" stopColor="#fff" stopOpacity="1" />
                        <stop offset=".5" stopColor="#fff" stopOpacity=".45" />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                      </radialGradient>
                      {/* Wisps: turbulence shaped by the soft cloud. */}
                      <filter id={`gas-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="4" seed={nebula.seed} result="noise" />
                        <feColorMatrix
                          in="noise"
                          values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.4 0 0 0 -0.95"
                          result="wisps"
                        />
                        <feComposite in="wisps" in2="SourceGraphic" operator="in" />
                        <feGaussianBlur stdDeviation=".6" />
                      </filter>
                    </>
                  )}
                </defs>

                {/* Measuring scale along two edges. */}
                <g className={s.scale}>
                  {Array.from({ length: 31 }, (_, i) => (
                    <line key={`t${i}`} x1={i * 10} x2={i * 10} y1="0" y2={i % 5 ? 3 : 7} />
                  ))}
                  {Array.from({ length: 23 }, (_, i) => (
                    <line key={`l${i}`} x1="0" x2={i % 5 ? 3 : 7} y1={i * 10} y2={i * 10} />
                  ))}
                </g>

                {post.collection === "reflections" && (
                  <g className={s.nebula} transform={`rotate(${nebula.rotate} ${nebula.x} ${nebula.y})`}>
                    <ellipse cx={nebula.x} cy={nebula.y} rx={nebula.rx * 0.5} ry={nebula.ry * 0.45} fill={`url(#cloud-${id})`} opacity=".18" />
                    <ellipse
                      cx={nebula.x}
                      cy={nebula.y}
                      rx={nebula.rx}
                      ry={nebula.ry}
                      fill={`url(#cloud-${id})`}
                      filter={`url(#gas-${id})`}
                    />
                  </g>
                )}

                {stars.map((star, i) => (
                  <circle
                    key={i}
                    className={star.twinkle === null ? s.star : `${s.star} ${s.twinkle}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.r}
                    opacity={star.o}
                    style={star.twinkle === null ? undefined : { animationDelay: `-${star.twinkle}s` }}
                  />
                ))}

                {/* Diffraction spikes on the brightest stars. */}
                <g className={s.spikes}>
                  {bright.map((star, i) => (
                    <path key={i} d={`M${star.x - 7} ${star.y}H${star.x + 7}M${star.x} ${star.y - 7}V${star.y + 7}`} />
                  ))}
                </g>

                {post.collection === "engineering" && chain.length > 1 && (
                  <g className={s.chart}>
                    <polyline points={chain.map((n) => `${n.x},${n.y}`).join(" ")} />
                    {branch && <line x1={branch[0].x} y1={branch[0].y} x2={branch[1].x} y2={branch[1].y} />}
                    {chain.map((n, i) => (
                      <circle key={i} className={s.node} cx={n.x} cy={n.y} r={i === 0 ? 1.9 : 1.4} />
                    ))}
                    <path
                      className={s.reticle}
                      d={`M${chain[0].x - 14} ${chain[0].y}h9m10 0h9M${chain[0].x} ${chain[0].y - 14}v9m0 10v9`}
                    />
                  </g>
                )}

                {/* The object that moved between exposures, and the ink ring around it. */}
                <g className={s.find}>
                  <circle className={s.before} cx={object.x} cy={object.y} r="1.3" />
                  <circle className={s.after} cx={object.x + drift.x} cy={object.y + drift.y} r="1.3" />
                  <path className={s.ink} d={ring} pathLength={1} />
                  <path className={s.ink} d={`M${object.x + 16} ${object.y - 16}l7 -7`} pathLength={1} />
                </g>

                <rect className={s.grain} width={W} height={H} filter={`url(#grain-${id})`} />
                <rect width={W} height={H} fill={`url(#vignette-${id})`} />
              </svg>

              <span className={s.number}>
                {t.plate} {number}
              </span>
              <span className={s.stamp}>{plateDate(post.date)}</span>
            </div>

            <CaptionScape seed={post.slug} />
            <div className={s.caption}>
              <p className={s.meta}>
                <span>{t.blogs[post.collection]}</span>
                <span>{format(t.readingTime, { minutes: post.readingMinutes })}</span>
              </p>
              <h3 className={s.title}>
                <Link href={href(lang, postPath(post))} className={s.link}>
                  {post.title}
                </Link>
              </h3>
              <p className={s.text}>{post.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
