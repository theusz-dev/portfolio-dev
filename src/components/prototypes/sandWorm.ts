/**
 * A colossal sand creature built from the same white particles as the dunes.
 * It shows up now and then, one behaviour at a time:
 *
 * - erguida: rises straight out of the sand, bows its head towards the viewer,
 *   opens a maw of counter-rotating tooth rings, then sinks back.
 * - salto: breaches in the distance and arcs over like a whale, every segment
 *   following the same path back under.
 * - travessia: tunnels just under the surface; only the swell of sand it
 *   pushes ahead of itself (and the dust it throws up) gives it away.
 *
 * The body is a real tube in world space, seen through the dunes' camera:
 * back-lit by the moon (bright rims, dark belly), ringed with grooves and
 * plates, occluded by nearer dunes, and shedding sand as it moves.
 */

export type WormKind = "erguida" | "salto" | "travessia";
export const WORM_KINDS: readonly WormKind[] = ["erguida", "salto", "travessia"];

export type WormView = {
  width: number;
  height: number;
  cx: number;
  horizon: number;
  focal: number;
  camY: number;
  sway: number;
  time: number;
  isSmall: boolean;
  /** Sand height at world (x, z). */
  ground: (x: number, z: number) => number;
};

type WormEvent = {
  kind: WormKind;
  start: number;
  duration: number;
  /** Anchor in world space: where it breaches, or where the burrow runs. */
  x: number;
  z: number;
  dir: number;
  radius: number;
  length: number;
  speed: number;
  fired: number;
};

type Grain = { x: number; y: number; z: number; vx: number; vy: number; vz: number; age: number; life: number };

const NODES = 110;
const BUCKETS = 8;
const SEGMENT = 1.05; // spacing of the body rings, in world units
const ARC_TIME = 5.2;
const ARC_HEIGHT = 9;
const ARC_DEPTH = 3;
const GRAVITY = 5.5; // low, so falling sand reads at this colossal scale
const MAX_GRAINS = 1100;
const LIGHT = normalize(-0.25, 0.6, 1); // towards the moon, high and behind

function normalize(x: number, y: number, z: number): [number, number, number] {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export class SandWorm {
  /** Ripples the creature sends through the sand, drained by the terrain. */
  readonly ripples: { x: number; z: number; strength: number }[] = [];

  private force: WormKind | null;
  private event: WormEvent | null = null;
  private nextAt: number;
  private lastKind: WormKind | null = null;
  private lastTime = -1;
  private dt = 0;
  private local = 0;
  private open = 0;
  private bodyVisible = false;
  private puff = 0;

  // Burrow state.
  private headX = 0;
  private envelope = 0;

  // Spine nodes (head first): position, forward tangent, cross-section frame.
  private px = new Float32Array(NODES);
  private py = new Float32Array(NODES);
  private pz = new Float32Array(NODES);
  private tx = new Float32Array(NODES);
  private ty = new Float32Array(NODES);
  private tz = new Float32Array(NODES);
  private ax = new Float32Array(NODES);
  private ay = new Float32Array(NODES);
  private az = new Float32Array(NODES);
  private bx = new Float32Array(NODES);
  private by = new Float32Array(NODES);
  private bz = new Float32Array(NODES);
  private rad = new Float32Array(NODES);

  // Skin particles, fixed to the body so its texture travels with it.
  private skinSmall: boolean | null = null;
  private skinS = new Float32Array(0);
  private skinCos = new Float32Array(0);
  private skinSin = new Float32Array(0);
  private skinPlate = new Float32Array(0);
  private skinSeed = new Float32Array(0);
  private lists: number[][] = Array.from({ length: BUCKETS }, () => []);
  private grains: Grain[] = [];

  constructor(force: WormKind | null) {
    this.force = force;
    this.nextAt = force ? 2 : 1.5;
  }

  get burrowing() {
    return this.event?.kind === "travessia";
  }

  update(view: WormView) {
    const { time } = view;
    this.dt = this.lastTime < 0 ? 0 : Math.min(0.05, Math.max(0, time - this.lastTime));
    this.lastTime = time;
    if (this.skinSmall !== view.isSmall) this.buildSkin(view.isSmall);

    if (!this.event && time >= this.nextAt) this.event = this.begin(view);
    this.bodyVisible = false;
    this.open = 0;
    const ev = this.event;
    if (ev) {
      this.local = time - ev.start;
      if (this.local > ev.duration) {
        this.event = null;
        this.nextAt = time + (this.force ? 3 : 20 + Math.random() * 20);
      } else if (ev.kind === "erguida") {
        this.spineRise(ev, view);
      } else if (ev.kind === "salto") {
        this.spineArc(ev, view);
      } else {
        this.burrow(ev, view);
      }
    }
    this.stepGrains(view);
  }

  /** How much the burrowing creature lifts the sand at world (x, z). */
  terrainLift(x: number, z: number, time: number) {
    const ev = this.event;
    if (!ev || ev.kind !== "travessia" || this.envelope <= 0) return 0;
    const along = (this.headX - x) * ev.dir; // > 0 behind the head
    if (along < -3 || along > 20) return 0;
    const lat = z - ev.z;
    if (lat > 6 || lat < -6) return 0;
    const profile = along < 0 ? Math.exp(-(along * along) / 0.7) : Math.exp(-along / 5.5);
    const width = 1.25 + 0.07 * Math.max(0, along);
    // Its rings rolling under the sand leave a faint pulse along the swell.
    const rings = 1 + 0.22 * Math.sin(along * 1.7 - time * 5);
    return this.envelope * 2.1 * profile * rings * Math.exp(-(lat * lat) / (width * width));
  }

  draw(ctx: CanvasRenderingContext2D, view: WormView, rgb: string, bg: string) {
    if (this.bodyVisible && this.event) this.drawBody(ctx, view, this.event, rgb, bg);
    this.drawGrains(ctx, view, rgb);
  }

  // --- Lifecycle -------------------------------------------------------------

  private begin(view: WormView): WormEvent {
    const pool = this.force ? [this.force] : WORM_KINDS.filter((k) => k !== this.lastKind);
    const kind = pool[Math.floor(Math.random() * pool.length)];
    this.lastKind = kind;
    const side = Math.random() < 0.5 ? -1 : 1;
    const worldX = (u: number, z: number) => ((u * view.width) / 2 / view.focal) * z * 2.3;
    const start = view.time;

    if (kind === "erguida") {
      const z = view.isSmall ? 19 : 21 + Math.random() * 5;
      const u = side * (view.isSmall ? 0.15 : 0.23 + Math.random() * 0.03);
      return { kind, start, duration: 11, x: worldX(u, z), z, dir: side, radius: 1.5, length: 24, speed: 0, fired: 0 };
    }
    if (kind === "salto") {
      const z = 30 + Math.random() * 4;
      const speed = view.isSmall ? 2.6 : 3.1;
      const length = 30;
      return {
        kind,
        start,
        duration: 0.3 + ARC_TIME + length / speed + 0.8,
        x: worldX(side * (view.isSmall ? 0.12 : 0.3), z),
        z,
        dir: Math.random() < 0.5 ? -1 : 1,
        radius: 1.25,
        length,
        speed,
        fired: 0,
      };
    }
    const z = 10 + Math.random() * 6;
    const speed = 4.6;
    const span = (view.width * z) / view.focal;
    return {
      kind,
      start,
      duration: (span + 8) / speed,
      x: -side * (span / 2 + 4),
      z,
      dir: side,
      radius: 1.4,
      length: 14,
      speed,
      fired: 0,
    };
  }

  private fire(ev: WormEvent, bit: number, x: number, z: number, strength: number) {
    if (ev.fired & bit) return;
    ev.fired |= bit;
    this.ripples.push({ x, z, strength });
  }

  // --- Spines ----------------------------------------------------------------

  private spineRise(ev: WormEvent, view: WormView) {
    const t = this.local;
    const rise = 1 - Math.pow(1 - clamp01(t / 2.6), 3);
    const sink = Math.pow(clamp01((t - 7.6) / 3.2), 3);
    const tilt = 1.1 * smooth(3, 4.4, t) * (1 - smooth(7, 8.2, t));
    this.open = smooth(3.9, 4.9, t) * (1 - smooth(6.6, 7.4, t));
    const base = view.ground(ev.x, ev.z);
    const top = base - 2 + 13 * rise - 16 * sink + 0.3 * Math.sin(t * 1.7) * (rise - sink);

    const ds = ev.length / (NODES - 1);
    let x = ev.x + 0.35 * Math.sin(t * 0.6) * rise;
    let y = top;
    let z = ev.z - tilt * 3.2;
    for (let i = 0; i < NODES; i++) {
      this.px[i] = x;
      this.py[i] = y;
      this.pz[i] = z;
      const s = i * ds;
      // The neck bends towards the viewer; the rest hangs straight down,
      // with a slow S-shaped undulation running through it.
      const phi = tilt * Math.max(0, 1 - s / 7);
      const wave = 0.1 * Math.sin(view.time * 1.3 + s * 0.35);
      const [dx, dy, dz] = normalize(wave, -Math.cos(phi), Math.sin(phi));
      x += dx * ds;
      y += dy * ds;
      z += dz * ds;
    }
    this.finishSpine(ev, view);

    if (t > 0.35) this.fire(ev, 1, ev.x, ev.z, 1.5);
    if (t > 9.4) this.fire(ev, 2, ev.x, ev.z, 1.1);
  }

  private arcPath(ev: WormEvent, base: number, tp: number): [number, number, number] {
    const q = tp / ARC_TIME;
    const off = (tp - ARC_TIME / 2) * ev.speed;
    let y: number;
    if (q < 0) y = base - ARC_DEPTH + q * ARC_TIME * ev.speed * 0.8;
    else if (q > 1) y = base - ARC_DEPTH - (q - 1) * ARC_TIME * ev.speed * 0.8;
    else y = base - ARC_DEPTH + (ARC_HEIGHT + ARC_DEPTH) * Math.sin(Math.PI * q);
    return [ev.x + ev.dir * off, y, ev.z + 0.1 * off + 0.3 * Math.sin(tp * 1.2)];
  }

  private spineArc(ev: WormEvent, view: WormView) {
    const t = this.local - 0.3;
    const base = view.ground(ev.x, ev.z);
    const ds = ev.length / (NODES - 1);
    for (let i = 0; i < NODES; i++) {
      // Every part of the body follows the path the head took.
      const [x, y, z] = this.arcPath(ev, base, t - (i * ds) / ev.speed);
      this.px[i] = x;
      this.py[i] = y;
      this.pz[i] = z;
    }
    this.finishSpine(ev, view);

    const breach = (Math.asin(ARC_DEPTH / (ARC_HEIGHT + ARC_DEPTH)) / Math.PI) * ARC_TIME;
    if (t > breach) {
      const [x, , z] = this.arcPath(ev, base, breach);
      this.fire(ev, 1, x, z, 1.3);
    }
    if (t > ARC_TIME - breach) {
      const [x, , z] = this.arcPath(ev, base, ARC_TIME - breach);
      this.fire(ev, 2, x, z, 1.3);
    }
  }

  private finishSpine(ev: WormEvent, view: WormView) {
    const ds = ev.length / (NODES - 1);
    for (let i = 0; i < NODES; i++) {
      const a = Math.max(0, i - 1);
      const b = Math.min(NODES - 1, i + 1);
      const [tx, ty, tz] = normalize(this.px[a] - this.px[b], this.py[a] - this.py[b], this.pz[a] - this.pz[b]);
      this.tx[i] = tx;
      this.ty[i] = ty;
      this.tz[i] = tz;
      // Cross-section frame: one axis across the view, one completing it.
      let [nx, ny, nz] = [ty, -tx, 0];
      const l = Math.hypot(nx, ny);
      if (l < 0.2) [nx, ny, nz] = [1, 0, 0];
      else [nx, ny] = [nx / l, ny / l];
      this.ax[i] = nx;
      this.ay[i] = ny;
      this.az[i] = nz;
      this.bx[i] = ty * nz - tz * ny;
      this.by[i] = tz * nx - tx * nz;
      this.bz[i] = tx * ny - ty * nx;

      const s = i * ds;
      const closed = 0.35 + 0.65 * smooth(0, 4, s);
      const flared = 0.92 + 0.08 * smooth(0, 2, s);
      const tail = 1 - 0.45 * smooth(ev.length - 6, ev.length, s);
      this.rad[i] = ev.radius * (closed + (flared - closed) * this.open) * tail;
    }
    this.bodyVisible = true;

    // Dust bursts where the body cuts through the surface.
    this.puff += this.dt * (view.isSmall ? 45 : 100);
    const bursts = Math.floor(this.puff);
    this.puff -= bursts;
    if (!bursts) return;
    for (let i = 0; i < NODES - 1; i++) {
      const g0 = view.ground(this.px[i], this.pz[i]);
      const g1 = view.ground(this.px[i + 1], this.pz[i + 1]);
      if ((this.py[i] - g0) * (this.py[i + 1] - g1) >= 0) continue;
      for (let k = 0; k < bursts; k++) {
        const angle = Math.random() * Math.PI * 2;
        const reach = this.rad[i] * (0.9 + 0.7 * Math.random());
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const kick = 0.8 + 2 * Math.random();
        this.spawn(
          this.px[i] + c * reach,
          g0 + 0.1,
          this.pz[i] + s * reach * 0.6,
          c * kick,
          0.8 + 2.4 * Math.random(),
          s * kick * 0.6,
          1 + 1.6 * Math.random(),
        );
      }
    }
  }

  private burrow(ev: WormEvent, view: WormView) {
    const t = this.local;
    this.headX = ev.x + ev.dir * ev.speed * t;
    this.envelope = smooth(0, 1.5, t) * (1 - smooth(ev.duration - 1.5, ev.duration, t));
    this.puff += this.dt * (view.isSmall ? 90 : 160) * this.envelope;
    while (this.puff >= 1) {
      this.puff -= 1;
      const x = this.headX + ev.dir * Math.random() * 0.6;
      const z = ev.z + (Math.random() - 0.5) * 1.8;
      this.spawn(
        x,
        view.ground(x, z) + this.terrainLift(x, z, view.time),
        z,
        ev.dir * (0.6 + 1.6 * Math.random()) + (Math.random() - 0.5),
        1.2 + 2.6 * Math.random(),
        (Math.random() - 0.5) * 1.6,
        0.9 + 1.4 * Math.random(),
      );
    }
  }

  // --- Particles -------------------------------------------------------------

  private buildSkin(isSmall: boolean) {
    const count = isSmall ? 6000 : 15000;
    this.skinSmall = isSmall;
    this.skinS = new Float32Array(count);
    this.skinCos = new Float32Array(count);
    this.skinSin = new Float32Array(count);
    this.skinPlate = new Float32Array(count);
    this.skinSeed = new Float32Array(count);
    for (let k = 0; k < count; k++) {
      const theta = Math.random() * Math.PI * 2;
      // Grains gather on the ring crests and thin out in the grooves, so the
      // segments read even though the skin is only dots. Stored as a 0..1
      // fraction of a 40-unit body; longer than any event, clipped at draw.
      const ring = Math.floor(Math.random() * 40 / SEGMENT);
      const offset = (Math.random() + Math.random() - 1) * 0.5;
      this.skinS[k] = Math.max(0, ((ring + 0.5 + offset) * SEGMENT) / 40);
      this.skinCos[k] = Math.cos(theta);
      this.skinSin[k] = Math.sin(theta);
      // Long armour plates run down the body between the rings.
      this.skinPlate[k] = 0.84 + 0.16 * Math.cos(theta * 11);
      this.skinSeed[k] = Math.random();
    }
  }

  private spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number) {
    if (this.grains.length >= MAX_GRAINS) return;
    this.grains.push({ x, y, z, vx, vy, vz, age: 0, life });
  }

  private stepGrains(view: WormView) {
    const dt = this.dt;
    const list = this.grains;
    for (let i = list.length - 1; i >= 0; i--) {
      const g = list[i];
      g.age += dt;
      g.vy -= GRAVITY * dt;
      const drag = 1 - 0.7 * dt;
      g.vx *= drag;
      g.vz *= drag;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.z += g.vz * dt;
      if (g.age >= g.life || g.z < 2 || (g.vy < 0 && g.y < view.ground(g.x, g.z))) {
        list[i] = list[list.length - 1];
        list.pop();
      }
    }
  }

  private drawGrains(ctx: CanvasRenderingContext2D, view: WormView, rgb: string) {
    if (!this.grains.length) return;
    const { cx, horizon, focal, camY, sway } = view;
    const camX = sway * 0.15;
    ctx.fillStyle = `rgb(${rgb})`;
    for (const g of this.grains) {
      const sx = cx + ((g.x - camX) * focal) / g.z;
      const sy = horizon + (((camY - g.y) * focal) / g.z) * 0.55;
      if (sx < 0 || sx > view.width || sy < 0 || sy > view.height) continue;
      const t = g.age / g.life;
      ctx.globalAlpha = 0.55 * Math.pow(1 - t, 0.7) * Math.min(1, t * 6) * (0.55 + 0.45 * (1 - g.z / 46));
      const size = g.z < 14 ? 1.3 : 1;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;
  }

  // --- Body ------------------------------------------------------------------

  private drawBody(ctx: CanvasRenderingContext2D, view: WormView, ev: WormEvent, rgb: string, bg: string) {
    const { cx, horizon, focal, camY, sway, ground, width, height } = view;
    const camX = sway * 0.15;
    const base = ground(ev.x, ev.z);
    const sxOf = (x: number, z: number) => cx + ((x - camX) * focal) / z;
    const syOf = (y: number, z: number) => horizon + (((camY - y) * focal) / z) * 0.55;

    // Hidden behind a nearer dune? March the view ray through the sand.
    const occluded = (sx: number, y: number, z: number) => {
      if (y - base > 5) return false;
      for (let k = 1; k <= 5; k++) {
        const zz = z * (0.35 + 0.12 * k);
        const xw = ((sx - cx) * zz) / focal + camX;
        if (ground(xw, zz) > camY + (y - camY) * (zz / z)) return true;
      }
      return false;
    };

    // 1. The body's dark mass hides the stars and dunes behind it.
    ctx.lineCap = "round";
    ctx.strokeStyle = `rgba(${bg}, 0.82)`;
    // Start a little below the tip, so the dark mass never peeks past the skin.
    for (let i = Math.round(NODES * (1.2 / ev.length)); i < NODES - 1; i++) {
      const j = i + 1;
      if (this.py[i] < ground(this.px[i], this.pz[i]) + 0.3) continue;
      if (this.py[j] < ground(this.px[j], this.pz[j]) + 0.3) continue;
      const ax = sxOf(this.px[i], this.pz[i]);
      const ay = syOf(this.py[i], this.pz[i]);
      if (occluded(ax, this.py[i], this.pz[i])) continue;
      const bx = sxOf(this.px[j], this.pz[j]);
      const by = syOf(this.py[j], this.pz[j]);
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / len;
      const ny = (bx - ax) / len;
      const a = (this.rad[i] * focal) / this.pz[i];
      const b = a * 0.55;
      ctx.lineWidth = 2 * Math.sqrt(a * a * nx * nx + b * b * ny * ny) * 0.8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // 2. Skin: front-facing particles only, lit from behind by the moon.
    const lists = this.lists;
    for (const list of lists) list.length = 0;
    const count = this.skinS.length;
    const ds = ev.length / (NODES - 1);
    const shedding = ev.kind === "erguida" && this.local > 2.6 && this.local < 7.6 ? 50 : 140;
    const shed = (this.dt * shedding) / (count * 0.35);

    for (let k = 0; k < count; k++) {
      const s = this.skinS[k] * 40;
      if (s >= ev.length) continue;
      const fi = s / ds;
      const i = Math.min(NODES - 2, fi | 0);
      const f = fi - i;
      const c = this.skinCos[k];
      const sn = this.skinSin[k];
      const nx = c * this.ax[i] + sn * this.bx[i];
      const ny = c * this.ay[i] + sn * this.by[i];
      const nz = c * this.az[i] + sn * this.bz[i];
      const ring = s / SEGMENT;
      const ridge = Math.pow(Math.sin(Math.PI * (ring - Math.floor(ring))), 0.7);
      const seed = this.skinSeed[k];
      const r = this.rad[i] * (1 + 0.07 * ridge + (seed - 0.5) * 0.05);
      const x = this.px[i] + (this.px[i + 1] - this.px[i]) * f + nx * r;
      const y = this.py[i] + (this.py[i + 1] - this.py[i]) * f + ny * r;
      const z = this.pz[i] + (this.pz[i + 1] - this.pz[i]) * f + nz * r;
      if (z < 2) continue;
      const g = ground(x, z);
      if (y < g) continue;

      let vx = camX - x;
      let vy = camY - y;
      let vz = -z;
      const vl = Math.hypot(vx, vy, vz);
      vx /= vl;
      vy /= vl;
      vz /= vl;
      const facing = nx * vx + ny * vy + nz * vz;
      if (facing < -0.02) continue;

      const sx = sxOf(x, z);
      const sy = syOf(y, z);
      if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;
      if (occluded(sx, y, z)) continue;

      const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const rim = Math.pow(1 - Math.max(0, facing), 2.5);
      const dusted = 0.3 * Math.exp(-(y - g) * 0.9); // sand clinging near the surface
      const light =
        (0.1 + 0.32 * facing + 0.36 * diffuse + 0.58 * rim) *
          (0.3 + 0.7 * ridge) *
          this.skinPlate[k] *
          (0.75 + 0.5 * seed) +
        dusted;
      const bucket = Math.min(BUCKETS - 1, Math.floor(clamp01(light) * BUCKETS));
      const size = Math.min(2, Math.max(0.8, 2.8 / Math.sqrt(z))) * (0.85 + 0.4 * seed);
      lists[bucket].push(sx, sy, size);

      if (Math.random() < shed) {
        this.spawn(x, y, z, nx * 0.35, 0.15, nz * 0.35, 1.4 + 1.6 * Math.random());
      }
    }

    for (let b = 0; b < BUCKETS; b++) {
      const list = lists[b];
      if (!list.length) continue;
      ctx.fillStyle = `rgba(${rgb}, ${((b + 1) / BUCKETS) * 0.95})`;
      for (let i = 0; i < list.length; i += 3) ctx.fillRect(list[i], list[i + 1], list[i + 2], list[i + 2]);
    }

    if (this.open > 0.02) this.drawMaw(ctx, view, ev, rgb, sxOf, syOf);
  }

  /** Concentric rings of inward-pointing teeth, turning against each other. */
  private drawMaw(
    ctx: CanvasRenderingContext2D,
    view: WormView,
    ev: WormEvent,
    rgb: string,
    sxOf: (x: number, z: number) => number,
    syOf: (y: number, z: number) => number,
  ) {
    const hx = this.px[0];
    const hy = this.py[0];
    const hz = this.pz[0];
    const [vx, vy, vz] = normalize(view.sway * 0.15 - hx, view.camY - hy, -hz);
    const facing = this.tx[0] * vx + this.ty[0] * vy + this.tz[0] * vz;
    if (facing < 0.05) return;
    const strength = this.open * Math.min(1, facing * 1.6);
    const rings = 7;

    for (let k = 0; k < rings; k++) {
      const depth = k * 0.42 * (ev.radius / 1.5);
      const cxw = hx - this.tx[0] * depth;
      const cyw = hy - this.ty[0] * depth;
      const czw = hz - this.tz[0] * depth;
      const rr = this.rad[0] * (k === 0 ? 1 : (0.92 - 0.1 * k) * (0.45 + 0.55 * this.open));
      const teeth = k === 0 ? 90 : Math.max(12, 46 - 5 * k);
      const bright = k === 0 ? 0.85 : 0.8 * (1 - k / (rings + 1));
      const spin = view.time * 0.18 * (k % 2 ? 1 : -1) + k * 0.37;
      ctx.fillStyle = `rgba(${rgb}, ${bright * strength})`;

      for (let j = 0; j < teeth; j++) {
        const angle = (j / teeth) * Math.PI * 2 + spin;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const dx = c * this.ax[0] + s * this.bx[0];
        const dy = c * this.ay[0] + s * this.by[0];
        const dz = c * this.az[0] + s * this.bz[0];
        const steps = k === 0 ? 1 : 4;
        for (let m = 0; m < steps; m++) {
          // Each tooth runs from the ring towards the centre and into the throat.
          const reach = rr * (1 - m * 0.09);
          const sink = m * 0.08;
          const x = cxw + dx * reach - this.tx[0] * sink;
          const y = cyw + dy * reach - this.ty[0] * sink;
          const z = czw + dz * reach - this.tz[0] * sink;
          const size = k === 0 ? 1.4 : 1.2 - m * 0.15;
          ctx.fillRect(sxOf(x, z), syOf(y, z), size, size);
        }
      }
    }
  }
}
