// The drawn part of the site: the pencilled book, its opening, and the line you walk.
// One canvas, no dependencies. React (Sketchbook.tsx) owns the type and the controls around it.
import type { Section, SectionId, Stop } from './content';

interface RibbonFrame { name: SectionId; parts: number[][][]; end: [number, number] }
interface Frame { ribbons: RibbonFrame[]; label: { quad: number[][]; shown: boolean } }
interface Book { size: [number, number]; order: SectionId[]; ribbonPx: number; anims: Record<SectionId, Frame[]> }

export type Mode = 'loading' | 'cover' | 'opening' | 'entering' | 'path' | 'closing';
export interface Rect { x: number; y: number; w: number; h: number }
export interface Callbacks {
  mode(mode: Mode, section: SectionId): void;
  openStop(index: number, from: Rect): void;
  progress(u: number, range: number): void;
}

type Vec = { x: number; y: number; z: number };
type Screen = { x: number; y: number; z: number; s: number };
interface Card { sketch: HTMLCanvasElement; photo?: HTMLCanvasElement; ratio: number; open: number }

const GRAPHITE = '38,38,42';
const BASE = '/sketchbook';
// Must match tools/manga/book_frames.py: ribbon width, page height, where each ribbon leaves the foot.
const RIBBON_W = 0.62, PAGE_H = 21, STRAIGHT = 0.36;
const EXIT: Record<SectionId, number> = { about: 3.4, projects: 6.2, events: 8.8, resume: 11.4 };
// The walk.
const LINE_W = 0.06, CARD_H = 2.9, FIRST = 13, STEP = 8, SIDE = 2.75, CAM0 = 3, VIEW = 6.4;
const TOP = { y: 10.5, z: 3.2 };   // where the camera hangs, looking straight down, when the book hands over
const OPEN_MS = 1750, ENTER_MS = 2000, CLOSE_MS = 1000;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** How long a line with this many stops is, and where along it you stand to look at stop i. */
export const lineRange = (count: number) => FIRST + count * STEP - VIEW - CAM0;
export const lineView = (i: number, count: number) => clamp(FIRST + i * STEP - VIEW - CAM0, 0, lineRange(count));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => { t = clamp(t); return t * t * t * (t * (6 * t - 15) + 10); };
function rng(seed: number) {
  return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src;
});
function tint(hex: string, toWhite: number) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(v + (255 - v) * toWhite));
  return `rgb(${c.join(',')})`;
}

// A drawing on a page does not end in a rectangle: fade it out to an uneven edge.
function feather(img: CanvasImageSource, w: number, h: number, seed: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!, r = rng(seed), m = w * 0.065, pts: number[][] = [];
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2, k = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))), j = (1 - 0.15 * r()) * (1 - 0.1 * Math.abs(Math.sin(2 * a)));
    pts.push([w / 2 + Math.cos(a) * k * (w / 2 - m) * j, h / 2 + Math.sin(a) * k * (h / 2 - m) * j]);
  }
  g.drawImage(img, 0, 0, w, h);
  g.globalCompositeOperation = 'destination-in';
  g.filter = `blur(${Math.round(w * 0.028)}px)`;
  g.beginPath();
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (i) g.quadraticCurveTo(p[0], p[1], mx, my); else g.moveTo(mx, my); });
  g.closePath(); g.fill();
  return c;
}

// A stop with no drawing yet: a blank sheet standing by the line, numbered.
function blankSheet(index: number, color: string) {
  const c = document.createElement('canvas'), w = c.width = 540, h = c.height = 720, g = c.getContext('2d')!, r = rng(90 + index);
  g.fillStyle = '#fff'; g.fillRect(26, 26, w - 52, h - 52);
  g.strokeStyle = `rgba(${GRAPHITE},.55)`; g.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {   // the edge, gone over twice by hand
    g.lineWidth = 1.6 - pass * 0.6; g.beginPath();
    const j = () => (r() - 0.5) * 7;
    g.moveTo(28 + j(), 28 + j()); g.lineTo(w - 28 + j(), 28 + j()); g.lineTo(w - 28 + j(), h - 28 + j()); g.lineTo(28 + j(), h - 28 + j()); g.closePath(); g.stroke();
  }
  g.strokeStyle = `rgba(${GRAPHITE},.28)`; g.lineWidth = 1.2; g.beginPath();   // a little tone in one corner
  for (let i = 0; i < 26; i++) { const x = w - 60 - i * 9 + r() * 4, len = 40 + r() * 70 - i * 2; if (len > 8) { g.moveTo(x, h - 44); g.lineTo(x + len * 0.64, h - 44 - len * 0.77); } }
  g.stroke();
  g.fillStyle = color; g.font = 'italic 400 190px Newsreader, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = 0.9; g.fillText(String(index + 1).padStart(2, '0'), w / 2, h * 0.44);
  g.globalAlpha = 1; g.fillStyle = `rgba(${GRAPHITE},.5)`; g.font = '500 17px "IBM Plex Mono", monospace';
  try { (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '3px'; } catch { /* older browsers */ }
  g.fillText('NOT YET DRAWN', w / 2, h * 0.62);
  return c;
}

export class Engine {
  mode: Mode = 'loading';
  section: SectionId = 'about';
  u = 0;
  private ctx: CanvasRenderingContext2D;
  private vw = 0; private vh = 0; private dpr = 1;
  private book!: Book;
  private frames: Partial<Record<SectionId, HTMLImageElement[]>> = {};
  private framesLoading: Partial<Record<SectionId, Promise<void>>> = {};
  private cards = new Map<string, Card>();
  private endCard?: Card;
  private shadow: HTMLCanvasElement;
  private glowA = document.createElement('canvas');   // the line, small
  private glowB = document.createElement('canvas');   // the same, blurred
  private marks: { x: number; z: number; n: number; len: number; a: number; w: number }[];
  private t0 = 0; private uTarget = 0;
  private tween: { from: number; to: number; t0: number; ms: number; done: () => void } | null = null;
  private hover: SectionId | number | 'end' | null = null;
  private rects: { key: number | 'end'; rect: Rect }[] = [];
  private cam = { pos: { x: 0, y: 0, z: 0 }, f: 1, fwd: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] };
  private raf = 0; private dirty = true; private paused = false; private veil = 0; private touchY: number | null = null;
  private off: (() => void)[] = [];
  private dead = false;   // torn down: late image loads must not draw or call back

  constructor(private canvas: HTMLCanvasElement, private sections: Record<SectionId, Section>, private name: string, private cb: Callbacks) {
    this.ctx = canvas.getContext('2d')!;
    const r = rng(5);
    this.marks = Array.from({ length: 320 }, () => {
      const z = -6 + r() * 150, off = (0.8 + r() * 15) * (r() < 0.5 ? -1 : 1);
      return { x: off, z, n: 3 + (r() * 3 | 0), len: 0.22 + r() * 0.4, a: (50 + (r() - 0.5) * 12) * Math.PI / 180, w: 0.5 + r() * 0.5 };
    });
    this.shadow = document.createElement('canvas'); this.shadow.width = 128; this.shadow.height = 32;
    const sg = this.shadow.getContext('2d')!, grad = sg.createRadialGradient(64, 16, 0, 64, 16, 64);
    grad.addColorStop(0, `rgba(${GRAPHITE},.22)`); grad.addColorStop(1, `rgba(${GRAPHITE},0)`);
    sg.setTransform(1, 0, 0, 0.25, 0, 12); sg.fillStyle = grad; sg.fillRect(0, -48, 128, 128);

    const on = <K extends keyof WindowEventMap>(t: EventTarget, k: K | string, f: (e: never) => void, o?: AddEventListenerOptions) => {
      t.addEventListener(k, f as EventListener, o); this.off.push(() => t.removeEventListener(k, f as EventListener, o));
    };
    on(window, 'resize', () => this.resize());
    on(canvas, 'pointermove', (e: PointerEvent) => this.point(e.clientX, e.clientY));
    on(canvas, 'pointerleave', () => { this.hover = null; this.dirty = true; });
    on(canvas, 'click', (e: MouseEvent) => this.click(e.clientX, e.clientY));
    on(canvas, 'wheel', (e: WheelEvent) => { if (this.mode !== 'path') return; e.preventDefault(); this.walkBy(e.deltaY * (e.deltaMode === 1 ? 16 : 1) * 0.011); }, { passive: false });
    on(canvas, 'touchstart', (e: TouchEvent) => { this.touchY = e.touches[0].clientY; }, { passive: true });
    on(canvas, 'touchmove', (e: TouchEvent) => {
      if (this.mode !== 'path' || this.touchY == null) return;
      e.preventDefault(); const y = e.touches[0].clientY; this.walkBy((this.touchY - y) * 0.03); this.touchY = y;
    }, { passive: false });
    this.resize();
    this.raf = requestAnimationFrame(this.tick);
    void this.load();
  }

  destroy() { this.dead = true; cancelAnimationFrame(this.raf); this.off.forEach(f => f()); }

  // ---------- loading ----------
  private async load() {
    this.book = await (await fetch(`${BASE}/book/frames.json`)).json();
    const first = this.book.order[0];
    const [cover] = await Promise.all([loadImage(`${BASE}/book/${first}/f00.webp`), document.fonts?.load('italic 40px Newsreader').catch(() => undefined)]);
    if (this.dead) return;
    this.frames[first] = [cover];
    const w = Math.round(this.book.size[0] * 0.5), h = Math.round(this.book.size[1] * 0.5);
    this.endCard = { sketch: feather(cover, w, h, 3), ratio: w / h, open: 0 };
    this.setMode('cover');
    for (const id of this.book.order) await this.ensureFrames(id);   // the rest arrive behind the cover
  }

  private ensureFrames(id: SectionId) {
    return this.framesLoading[id] ??= (async () => {
      const n = this.book.anims[id].length;
      const all = await Promise.all(Array.from({ length: n }, (_, i) => loadImage(`${BASE}/book/${id}/f${String(i).padStart(2, '0')}.webp`)));
      await Promise.all(all.map(im => im.decode?.().catch(() => undefined)));
      this.frames[id] = all;
    })();
  }

  private ensureCards(id: SectionId) {
    this.sections[id].stops.forEach((stop, i) => {
      const key = `${id}:${i}`;
      if (this.cards.has(key)) return;
      if (!stop.art) { this.cards.set(key, { sketch: blankSheet(i, this.sections[id].color), ratio: 0.75, open: 0 }); return; }
      const art = stop.art, h = 980, w = Math.round(h * art.ratio);
      this.cards.set(key, { sketch: blankSheet(i, this.sections[id].color), ratio: art.ratio, open: 0 });   // until the drawing arrives
      void Promise.all([loadImage(art.sketch), art.photo ? loadImage(art.photo) : null]).then(([s, p]) => {
        this.cards.set(key, { sketch: feather(s, w, h, 11 + i), photo: p ? feather(p, w, h, 11 + i) : undefined, ratio: art.ratio, open: 0 });
        this.dirty = true;
      });
    });
  }

  // ---------- public controls ----------
  private setMode(m: Mode) { if (this.dead) return; this.mode = m; this.dirty = true; this.cb.mode(m, this.section); }
  private begin(id: SectionId) { this.section = id; this.u = this.uTarget = 0; this.tween = null; this.hover = null; this.ensureCards(id); }

  async open(id: SectionId) {
    if (this.mode !== 'cover') return;
    this.begin(id); this.canvas.style.cursor = 'progress';
    await this.ensureFrames(id);
    this.canvas.style.cursor = ''; this.t0 = performance.now(); this.setMode('opening');
  }
  /** Start inside a section with no animation (deep links). */
  jump(id: SectionId, u = 0) { this.begin(id); this.u = this.uTarget = clamp(u, 0, this.range); this.setMode('path'); }
  /** Step onto another line without going back to the cover. React keeps its controls up, so it is told 'path'. */
  switchTo(id: SectionId) { if (id === this.section || this.mode !== 'path') return; this.veil = 1; this.begin(id); this.t0 = performance.now(); this.mode = 'entering'; this.cb.mode('path', id); }
  async close() {
    if (this.mode !== 'path') return;
    this.tween = null; this.hover = null; this.mode = 'entering';   // hold still while the frames arrive, if they have not yet
    await this.ensureFrames(this.section);
    this.t0 = performance.now(); this.setMode('closing');
  }
  pause(paused: boolean) { this.paused = paused; this.dirty = true; }

  get stops(): Stop[] { return this.sections[this.section].stops; }
  private stopZ(i: number) { return FIRST + i * STEP; }
  get range() { return lineRange(this.stops.length); }
  /** How far along the line you stand to look at stop i (i = stops.length is the book at the end). */
  viewOf(i: number) { return lineView(i, this.stops.length); }
  walkBy(d: number) { this.tween = null; this.uTarget = clamp(this.uTarget + d, 0, this.range); }
  goTo(u: number, ms = 1400) {
    return new Promise<void>(done => { this.tween = { from: this.u, to: clamp(u, 0, this.range), t0: performance.now(), ms: Math.max(ms, 1), done }; });
  }
  /** Where stop i stands on screen right now, for growing its page out of it. */
  rectOf(i: number): Rect | undefined { this.drawWorld(1, 0); return this.rects.find(r => r.key === i)?.rect; }

  // ---------- geometry ----------
  private resize() {
    this.vw = window.innerWidth; this.vh = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.6e6 / (this.vw * this.vh)));   // cap the pixels drawn per frame
    this.canvas.width = Math.round(this.vw * this.dpr); this.canvas.height = Math.round(this.vh * this.dpr);
    for (const c of [this.glowA, this.glowB]) { c.width = Math.ceil(this.vw / 5); c.height = Math.ceil(this.vh / 5); }
    this.dirty = true;
  }
  private fit(grow = 0) {   // 0: the whole frame in view; 1: the frame fills the window
    const [fw, fh] = this.book.size, k = lerp(Math.min(this.vw / fw, this.vh / fh), Math.max(this.vw / fw, this.vh / fh), grow);
    return { k, ox: (this.vw - fw * k) / 2, oy: (this.vh - fh * k) / 2 };
  }
  // How the last frame of the book maps onto the ground seen from above, so the ribbon carries straight on as the line.
  private handover() {
    const per = (this.vh * 1.05) / TOP.y, k = this.fit(1).k, r = (this.book.ribbonPx / RIBBON_W) * k / per;
    return { width: this.book.ribbonPx * k / per, bend: TOP.z - PAGE_H * (0.5 - STRAIGHT) * r, len: PAGE_H * STRAIGHT * r, exit: EXIT[this.section] * r };
  }
  private pathX(z: number, h = this.handover()) {
    if (z < h.bend) { const v = clamp((h.bend - z) / h.len); return h.exit * v * v * (3 - 2 * v); }   // the ribbon crossing the page to the foot
    const w = ease((z - 6) / 10), q = z - 6;
    return w * (2.5 * Math.sin(q / 6.5) + 0.9 * Math.sin(q / 2.9 + 1.3));
  }
  private side(z: number, off: number, h = this.handover()): Vec {
    const d = (this.pathX(z + 0.05, h) - this.pathX(z - 0.05, h)) / 0.1, n = Math.hypot(1, d);
    return { x: this.pathX(z, h) + off / n, y: 0, z: z - off * d / n };
  }
  private setCamera(u: number, e: number) {
    const m = ease(e), zc = CAM0 + u, h = this.handover();
    const pos = { x: lerp(0, this.pathX(zc, h), m), y: lerp(TOP.y, 1.5, m), z: lerp(TOP.z, zc, m) };
    const yaw = Math.atan2(this.pathX(zc + 7, h) - this.pathX(zc, h), 7) * m, pitch = lerp(-Math.PI / 2, -0.12, m);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    this.cam = { pos, f: this.vh * 1.05, fwd: [sy * cp, sp, cy * cp], right: [cy, 0, -sy], up: [-sy * sp, cp, -cy * sp] };
  }
  private project(p: Vec): Screen {
    const c = this.cam, d = [p.x - c.pos.x, p.y - c.pos.y, p.z - c.pos.z], dot = (v: number[]) => d[0] * v[0] + d[1] * v[1] + d[2] * v[2], z = dot(c.fwd);
    return { x: this.vw / 2 + c.f * dot(c.right) / z, y: this.vh / 2 - c.f * dot(c.up) / z, z, s: c.f / z };
  }

  // ---------- the book ----------
  private tracePart(part: number[][]) { const g = this.ctx; g.beginPath(); part.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
  private drawBook(id: SectionId, i: number, alpha: number, chosen: SectionId | null, fade: number, grow: number) {
    const img = this.frames[id]?.[i]; if (!img) return;
    const g = this.ctx, fit = this.fit(grow), fr = this.book.anims[id][i];
    g.save();
    g.globalAlpha = alpha;
    g.setTransform(this.dpr * fit.k, 0, 0, this.dpr * fit.k, this.dpr * fit.ox, this.dpr * fit.oy);
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'multiply';
    for (const r of fr.ribbons) {   // colour laid over the drawn ribbons; the chosen one never fades
      const hot = this.hover === r.name, mine = chosen === r.name;
      g.globalAlpha = mine ? 1 : alpha * (chosen ? 1 - fade : hot ? 1 : 0.86);
      if (g.globalAlpha < 0.01) continue;
      g.fillStyle = this.sections[r.name].color;
      for (const part of r.parts) { this.tracePart(part); g.fill(); if (hot && !chosen) g.fill(); }
    }
    g.globalCompositeOperation = 'source-over';
    if (fr.label.shown) {   // the name, set in type on the drawn label (the label is close to affine at this distance)
      const [a, b, , d] = fr.label.quad, LW = 980, LH = 520;
      g.globalAlpha = alpha * 0.92;
      g.transform((b[0] - a[0]) / LW, (b[1] - a[1]) / LW, (d[0] - a[0]) / LH, (d[1] - a[1]) / LH, a[0], a[1]);
      g.fillStyle = `rgb(${GRAPHITE})`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = 'italic 400 168px Newsreader, Georgia, serif';
      g.fillText(this.name, LW / 2, LH / 2 + 8);
    }
    g.restore();
    if (i === 0 && !chosen) {   // what each ribbon is, set at its end
      g.save(); g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.textAlign = 'center'; g.textBaseline = 'top';
      g.font = '500 12px "IBM Plex Mono", monospace';
      for (const r of fr.ribbons) {
        const x = fit.ox + r.end[0] * fit.k, y = fit.oy + r.end[1] * fit.k + 18, hot = this.hover === r.name, label = this.sections[r.name].label.toUpperCase();
        g.fillStyle = hot ? this.sections[r.name].color : `rgba(${GRAPHITE},.8)`;
        g.fillText(label.split('').join(' '), x, y);
        if (hot) g.fillRect(x - 22, y + 19, 44, 2);
      }
      g.restore();
    }
  }
  private ribbonAt(x: number, y: number): SectionId | null {
    const fit = this.fit(), fx = (x - fit.ox) / fit.k, fy = (y - fit.oy) / fit.k, g = this.ctx;
    const fr = this.book.anims[this.book.order[0]][0];
    let hit: SectionId | null = null;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.lineWidth = 34;
    for (const r of fr.ribbons) {
      if (Math.hypot(fx - r.end[0], fy - r.end[1] - 24 / fit.k) < 48 / fit.k) hit = r.name;
      for (const part of r.parts) { this.tracePart(part); if (g.isPointInPath(fx, fy) || g.isPointInStroke(fx, fy)) hit = r.name; }
    }
    g.restore();
    return hit;
  }

  // ---------- the line ----------
  private fog(z: number) { const a = clamp(1 - (z - 9) / 40); return a * a * (3 - 2 * a); }

  /** e: 0 looking straight down at the page, 1 walking. */
  private drawWorld(e: number, alpha: number) {
    const g = this.ctx, m = ease(e), sec = this.sections[this.section], color = sec.color, h = this.handover();
    this.setCamera(this.u, e);
    this.rects = [];
    if (alpha <= 0) { this.layout(m, 0); return; }
    g.save(); g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.lineCap = 'round';

    // loose pencil marks on the ground: they are what makes the walking visible. Drawn in a few batches.
    const camZ = this.cam.pos.z, buckets: number[][] = [[], [], [], []];
    for (const k of this.marks) {
      if (k.z < camZ - 4 || k.z > camZ + 50) continue;
      const cx = this.pathX(k.z, h) + k.x, c = this.project({ x: cx, y: 0, z: k.z });
      if (c.z < 2.4 || c.z > 50) continue;
      const a = this.fog(c.z) * clamp((c.z - 2.4) / 2.5) * k.w;
      if (a < 0.06) continue;
      const b = buckets[Math.min(3, a * 4 | 0)];
      for (let i = 0; i < k.n; i++) {
        const ox = i * 0.08 * Math.sin(k.a), oz = -i * 0.08 * Math.cos(k.a), L = k.len * (1 - 0.12 * i);
        const p = this.project({ x: cx + ox, y: 0, z: k.z + oz }), q = this.project({ x: cx + ox + Math.cos(k.a) * L, y: 0, z: k.z + oz + Math.sin(k.a) * L });
        if (p.z > 0.3 && q.z > 0.3) b.push(p.x, p.y, q.x, q.y);
      }
    }
    buckets.forEach((b, i) => {
      if (!b.length) return;
      g.strokeStyle = `rgba(${GRAPHITE},${(0.14 + i * 0.11) * alpha * (0.25 + 0.75 * m)})`; g.lineWidth = 0.6 + i * 0.25;
      g.beginPath(); for (let j = 0; j < b.length; j += 4) { g.moveTo(b[j], b[j + 1]); g.lineTo(b[j + 2], b[j + 3]); } g.stroke();
    });

    // the line: a ribbon when the book hands it over, thinning to a line of light as you come down to walk it
    const width = lerp(h.width, LINE_W, m), glow = m, pts: ({ x: number; y: number; nx: number; ny: number; a: number } | null)[] = [];
    for (let z = camZ - 12; z < camZ + 56; z += 0.4) {
      const l = this.project(this.side(z, -0.5, h)), r = this.project(this.side(z, 0.5, h));
      pts.push(l.z > 0.25 && r.z > 0.25 ? { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2, nx: r.x - l.x, ny: r.y - l.y, a: Math.round(this.fog(l.z) * 12) / 12 } : null);
    }
    // one unbroken shape per fog level; minPx keeps the far end from vanishing, maxPx keeps the near end a line
    const band = (c: CanvasRenderingContext2D, half: number, minPx: number, maxPx: number, style: string, opacity: number, from = 0, to = pts.length - 1) => {
      c.fillStyle = style;
      for (let i = from; i < to;) {
        const p = pts[i]; if (!p || !pts[i + 1]) { i++; continue; }
        let j = i + 1; while (j < to && pts[j + 1] && pts[j]!.a === p.a) j++;
        c.globalAlpha = p.a * opacity;
        if (c.globalAlpha > 0.004) {
          const edge = (q: NonNullable<typeof p>, sign: number, lift: number) => {
            const len = Math.hypot(q.nx, q.ny) || 1, k = Math.min(Math.max(half, minPx / len), maxPx / len) * sign;
            c.lineTo(q.x + q.nx * k, q.y + q.ny * k - lift);
          };
          c.beginPath();
          for (let k = i; k <= j; k++) edge(pts[k]!, -1, k === j ? 0.8 : 0);
          for (let k = j; k >= i; k--) edge(pts[k]!, 1, k === j ? 0.8 : 0);
          c.fill();
        }
        i = j;
      }
    };
    const cap = lerp(60, 4.5, m);   // widest the line may be on screen, in pixels: a ribbon above the page, a line once walking
    const t = performance.now() / 1000, gap = 9, first = Math.floor((camZ - 4) / gap) * gap + (t * 3.2) % gap;
    const pulses: number[] = [];   // light running ahead of you along the line
    for (let z = first; z < camZ + 44; z += gap) { const i0 = Math.round((z - (camZ - 12)) / 0.4); if (i0 >= 1 && i0 + 4 < pts.length) pulses.push(i0); }
    if (glow > 0.02) {
      // the glow: the line drawn small, blurred, and laid back under the line itself
      const a = this.glowA.getContext('2d')!, bq = this.glowB.getContext('2d')!, S = this.glowA.width / this.vw;
      a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, this.glowA.width, this.glowA.height); a.setTransform(S, 0, 0, S, 0, 0);
      band(a, width * 1.5, 2.2, cap * 2, color, 1);
      for (const i0 of pulses) band(a, width * 5, 7, cap * 4.5, tint(color, 0.15), 1, i0, i0 + 4);
      for (const [blur, strength] of [[1.6, 0.6], [5, 0.45]]) {
        bq.setTransform(1, 0, 0, 1, 0, 0); bq.clearRect(0, 0, this.glowB.width, this.glowB.height);
        bq.filter = `blur(${blur}px)`; bq.drawImage(this.glowA, 0, 0); bq.filter = 'none';
        g.globalAlpha = alpha * glow * strength; g.drawImage(this.glowB, 0, 0, this.vw, this.vh);
      }
    }
    band(g, width / 2, 0.55, cap, color, alpha);
    if (glow > 0.02) for (const i0 of pulses) band(g, width * 0.62, 0.8, cap * 0.7, tint(color, 0.6), alpha * glow, i0, i0 + 4);
    g.globalAlpha = 1;
    this.layout(m, alpha);
    g.restore();
  }

  /** Stops beside the line, far to near. With alpha 0 it only measures where they stand. */
  private layout(m: number, alpha: number) {
    const g = this.ctx, sec = this.sections[this.section], h = this.handover();
    const all = [...sec.stops.map((stop, i) => ({ stop, i, key: i as number | 'end' })), { stop: null, i: sec.stops.length, key: 'end' as const }]
      .map(s => { const z = this.stopZ(s.i), side = s.i % 2 ? 1 : -1, base = this.side(z, side * SIDE, h);
        return { ...s, side, on: this.project(this.side(z, 0, h)), b: this.project(base), t: this.project({ ...base, y: CARD_H * (s.stop ? 1 : 0.62) }) }; })
      .filter(s => s.b.z > 0.6 && s.on.z > 0.3).sort((p, q) => q.b.z - p.b.z);
    for (const s of all) {
      const a = this.fog(s.b.z) * alpha * m, sc = s.b.s;
      const card = s.stop ? this.cards.get(`${this.section}:${s.i}`) : this.endCard;
      if (!card) continue;
      const w = (s.t.y < s.b.y ? CARD_H * (s.stop ? 1 : 0.62) : 0) * card.ratio * sc;
      const rect = { x: s.t.x - w / 2, y: s.t.y, w, h: s.b.y - s.t.y };
      if (this.fog(s.b.z) > 0.05) this.rects.push({ key: s.key, rect });
      if (a < 0.02) continue;
      const hot = this.hover === s.key && this.mode === 'path';
      card.open = lerp(card.open, hot ? 1 : 0, 0.16);
      if (Math.abs(card.open - (hot ? 1 : 0)) > 0.01) this.dirty = true;
      g.globalAlpha = a;
      // a dotted pencil lead from the line to the stop, and a ring on the line
      g.strokeStyle = `rgba(${GRAPHITE},.5)`; g.lineWidth = clamp(0.012 * sc, 0.5, 1.3);
      g.setLineDash([0.05 * sc, 0.09 * sc]); g.beginPath(); g.moveTo(s.on.x, s.on.y); g.lineTo(s.b.x, s.b.y); g.stroke(); g.setLineDash([]);
      g.strokeStyle = sec.color; g.lineWidth = clamp(0.028 * s.on.s, 0.8, 3);
      g.beginPath(); g.ellipse(s.on.x, s.on.y, 0.2 * s.on.s, 0.2 * s.on.s * Math.abs(this.cam.fwd[1]) + 0.02 * s.on.s, 0, 0, 7); g.stroke();
      g.drawImage(this.shadow, s.b.x - w * 0.6, s.b.y - w * 0.08, w * 1.2, w * 0.16);
      // the drawing stands upright on the ground: map the image onto top edge -> foot
      const iw = card.sketch.width, ih = card.sketch.height, lift = card.open * 0.05 * sc;
      g.save();
      g.transform(w / iw, 0, (s.b.x - s.t.x) / ih, (s.b.y - s.t.y) / ih, s.t.x - w / 2, s.t.y - lift);
      g.drawImage(card.sketch, 0, 0);
      if (card.photo) {   // one streak of the photograph, parallel to the pencil strokes
        const half = iw * (0.014 + 0.075 * card.open), cx = iw * (0.5 + 0.1 * Math.sin(s.i * 2.4)), dx = Math.cos(50 * Math.PI / 180), dy = -Math.sin(50 * Math.PI / 180), R = ih;
        g.beginPath(); g.moveTo(cx - dx * R + dy * half, ih / 2 - dy * R - dx * half); g.lineTo(cx + dx * R + dy * half, ih / 2 + dy * R - dx * half);
        g.lineTo(cx + dx * R - dy * half, ih / 2 + dy * R + dx * half); g.lineTo(cx - dx * R - dy * half, ih / 2 - dy * R + dx * half); g.clip();
        g.drawImage(card.photo, 0, 0);
      }
      g.restore();
      if (sc > 24 && s.b.z > 3.2) {   // caption on the ground, between the drawing and the line
        const inner = -s.side, x = s.b.x + inner * (w / 2 + 0.16 * sc), cs = Math.min(sc, 190);
        g.globalAlpha = a * clamp((s.b.z - 3.2) / 1.6);
        g.textAlign = inner > 0 ? 'left' : 'right'; g.textBaseline = 'alphabetic';
        g.fillStyle = `rgb(${GRAPHITE})`; g.font = `italic 400 ${0.17 * cs}px Newsreader, Georgia, serif`;
        const title = s.stop ? s.stop.title : 'Close the book', label = title.length > 26 ? `${title.slice(0, 25)}…` : title;
        const room = Math.abs(s.on.x - x) - 0.14 * cs, wide = g.measureText(label).width;   // keep the title clear of the line
        if (wide > room) g.font = `italic 400 ${0.17 * cs * Math.max(0.6, room / wide)}px Newsreader, Georgia, serif`;
        g.fillText(label, x, s.b.y - 0.15 * cs);
        g.font = `500 ${Math.max(0.06 * cs, 7)}px "IBM Plex Mono", monospace`;
        g.fillStyle = sec.color; g.fillText(s.stop ? `NO. ${String(s.i + 1).padStart(2, '0')}` : 'THE END OF THE LINE', x, s.b.y - 0.37 * cs);
        if (hot) { const tw = Math.min(0.9 * cs, 120); g.fillRect(inner > 0 ? x : x - tw, s.b.y - 0.09 * cs, tw, Math.max(1.5, 0.012 * cs)); }
      }
    }
    g.globalAlpha = 1;
  }

  // ---------- frame loop ----------
  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick);
    if (this.mode === 'loading' || this.paused) return;
    if (this.mode === 'cover' && !this.dirty) return;   // a still drawing: nothing to redo
    this.dirty = false;
    const g = this.ctx, t = now - this.t0, id = this.section;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fff'; g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.mode === 'cover') this.drawBook(this.book.order[0], 0, 1, null, 0, 0);
    else if (this.mode === 'opening') {
      const n = this.book.anims[id].length, p = clamp(t / OPEN_MS), out = clamp((p - 0.8) / 0.2);
      if (out > 0) this.drawWorld(0, out);
      this.drawBook(id, Math.min(n - 1, Math.floor(p * n)), 1 - out, id, clamp(p * 2.5), ease(p * 1.7));
      if (p >= 1) { this.t0 = now; this.mode = 'entering'; }
    } else if (this.mode === 'entering') {
      const e = clamp(t / ENTER_MS);
      this.drawWorld(e, 1);
      if (e >= 1) this.setMode('path');
    } else if (this.mode === 'closing') {
      const n = this.book.anims[id].length, p = clamp(t / CLOSE_MS), back = 1 - ease(p);
      this.drawBook(id, Math.max(0, Math.round(back * (n - 1))), 1, id, back, back);
      if (p >= 1) this.setMode('cover');
    } else {
      if (this.tween) {
        const tw = this.tween, k = clamp((now - tw.t0) / tw.ms);
        this.u = this.uTarget = lerp(tw.from, tw.to, ease(k));
        if (k >= 1) { this.tween = null; tw.done(); }
      } else this.u = Math.abs(this.uTarget - this.u) < 0.002 ? this.uTarget : lerp(this.u, this.uTarget, 0.13);
      this.drawWorld(1, 1);
      this.cb.progress(this.u, this.range);
    }
    if (this.veil > 0.01) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(255,255,255,${this.veil})`; g.fillRect(0, 0, this.canvas.width, this.canvas.height); this.veil *= 0.9; }
  };

  // ---------- pointer ----------
  private cardAt(x: number, y: number) { for (let i = this.rects.length - 1; i >= 0; i--) { const r = this.rects[i].rect; if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return this.rects[i]; } return undefined; }
  private point(x: number, y: number) {
    const before = this.hover;
    if (this.mode === 'cover') this.hover = this.ribbonAt(x, y);
    else if (this.mode === 'path') this.hover = this.cardAt(x, y)?.key ?? null;
    else return;
    this.canvas.style.cursor = this.hover != null ? 'pointer' : '';
    if (before !== this.hover) this.dirty = true;
  }
  private click(x: number, y: number) {
    if (this.mode === 'cover') { const r = this.ribbonAt(x, y); if (r) void this.open(r); }
    else if (this.mode === 'path') {
      const hit = this.cardAt(x, y); if (!hit) return;
      if (hit.key === 'end') void this.close(); else this.cb.openStop(hit.key, hit.rect);
    }
  }
}
