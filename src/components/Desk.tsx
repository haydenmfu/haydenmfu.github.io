import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { about } from '../data/about';
import { deskTargets, snorlax } from '../data/deskTargets';
import { Stage, prefersReducedMotion } from './Stage';

const ART_W = 2846, ART_H = 1602;
const bounds = (path: string) => {
  const nums = path.match(/\d+/g)!.map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
};
const targets = deskTargets.map(target => ({ ...target, box: bounds(target.path) }));
const snorlaxBox = bounds(snorlax.path);

// The idle shimmer plays at most once per page load, and never after an object has been opened.
let shimmerSpent = false;
export const spendShimmer = () => { shimmerSpent = true; };

type Caption = { key: string; text: string; arrow: boolean; left: number; top: number; visible: boolean };

export default function Desk({ labels }: { labels: Record<string, string> }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useRef<SVGSVGElement | null>(null);
  const stir = useRef<SVGGElement | null>(null);
  const [caption, setCaption] = useState<Caption | null>(null);
  const [bubble, setBubble] = useState<{ text: string; visible: boolean } | null>(null);
  const pokes = useRef(0);
  const bubbleTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);

  // After 4s with no input, a light sweeps once across each clickable object in turn.
  useEffect(() => {
    if (shimmerSpent) return;
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;
    let timer = 0;
    const stop = () => { window.clearTimeout(timer); events.forEach(name => window.removeEventListener(name, arm)); };
    const play = () => {
      stop();
      if (shimmerSpent) return;
      shimmerSpent = true;
      const reduce = prefersReducedMotion();
      targets.forEach((target, i) => {
        const delay = i * 100;
        // The outline pulse carries the cue on white paper, where a white glint barely shows.
        svg.current?.querySelector(`.selector-${target.view} path`)?.animate([{ strokeOpacity: 0 }, { strokeOpacity: 0.6, offset: 0.3 }, { strokeOpacity: 0 }], { duration: 700, delay, easing: 'ease-out' });
        if (!reduce) svg.current?.querySelector(`#${uid}-sheen-${target.view}`)?.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: 600, delay, easing: 'ease-in-out' });
      });
    };
    function arm() { window.clearTimeout(timer); timer = window.setTimeout(play, 4000); }
    events.forEach(name => window.addEventListener(name, arm, { passive: true }));
    arm();
    return stop;
  }, [uid]);

  const at = (box: { x: number; y: number; w: number }) => ({ left: (box.x + box.w / 2) / ART_W * 100, top: box.y / ART_H * 100 });
  const showCaption = (key: string, text: string, arrow: boolean, box: { x: number; y: number; w: number }) => setCaption({ key, text, arrow, ...at(box), visible: true });
  const hideCaption = () => setCaption(c => c && { ...c, visible: false });

  // Snorlax stirs and mumbles a line; repeat pokes cycle through what he says.
  const poke = () => {
    const text = snorlax.lines[pokes.current++ % snorlax.lines.length];
    hideCaption();
    setBubble({ text, visible: true });
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(b => b && { ...b, visible: false }), 2500);
    if (!prefersReducedMotion()) stir.current?.animate([{ rotate: '0deg' }, { rotate: '-2deg', offset: 0.3 }, { rotate: '2deg', offset: 0.65 }, { rotate: '0deg' }], { duration: 300, easing: 'ease-out' });
  };
  const onPokeKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); } };

  return <Stage ratio={ART_W / ART_H} focus={[0.5, 0.52]} maxLeft={0.04} maxTop={0.03} className="desk-stage">
    <div className="intro-card">
      <h1>Hayden Fu</h1>
      <p>{about.intro}</p>
      <small>Ithaca, NY · 2026</small>
    </div>
    <div className="workspace-illustration">
      <img className="workspace-art" src="/Assets%20Masked/Base.png" alt="Hayden's sunlit desk with a laptop labeled Projects, books labeled Research, notebook, papers, postcard, resume drawer, and sleeping Snorlax" width={ART_W} height={ART_H} draggable={false} />
      <svg className="workspace-selectors" viewBox={`0 0 ${ART_W} ${ART_H}`} role="group" aria-label="Explore the objects on the desk" ref={svg}>
        <defs>
          <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff8e1" stopOpacity="0.55" />
            <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {targets.map(target => <clipPath key={target.view} id={`${uid}-clip-${target.view}`}><path d={target.path} /></clipPath>)}
          <clipPath id={`${uid}-clip-snorlax`}><path d={snorlax.path} /></clipPath>
        </defs>
        {/* A cut-out copy of Snorlax that rocks over the painting when poked. */}
        <g className="snorlax-stir" ref={stir} style={{ transformOrigin: `${snorlax.pivot.x}px ${snorlax.pivot.y}px` } as CSSProperties} aria-hidden="true">
          <g clipPath={`url(#${uid}-clip-snorlax)`}><image href="/Assets%20Masked/Base.png" width={ART_W} height={ART_H} /></g>
        </g>
        <g className="desk-sheen" aria-hidden="true">
          {targets.map(({ view, box }) => <g key={view} clipPath={`url(#${uid}-clip-${view})`}><rect id={`${uid}-sheen-${view}`} x={box.x} y={box.y} width={box.w} height={box.h} fill={`url(#${uid}-sheen)`} /></g>)}
        </g>
        {targets.map(({ view, object, path, box }) => <a key={view} href={`#${view}`} aria-label={`Open ${labels[view]} using the ${object}`} className={`workspace-selector selector-${view}`} onPointerEnter={() => showCaption(view, `Open ${labels[view]}`, true, box)} onPointerLeave={hideCaption} onFocus={() => showCaption(view, `Open ${labels[view]}`, true, box)} onBlur={hideCaption}><path d={path} /></a>)}
        {/* After the six destinations in tab order; it overlaps none of them. */}
        <g role="button" tabIndex={0} aria-label="Poke the sleeping Snorlax" className="workspace-selector selector-snorlax" onClick={poke} onKeyDown={onPokeKey} onPointerEnter={() => showCaption('snorlax', 'Poke Snorlax', false, snorlaxBox)} onPointerLeave={hideCaption} onFocus={() => showCaption('snorlax', 'Poke Snorlax', false, snorlaxBox)} onBlur={hideCaption}><path d={snorlax.path} /></g>
      </svg>
      {caption && <span className="desk-caption" aria-hidden="true" data-visible={caption.visible} style={{ left: `${caption.left}%`, top: `${caption.top}%` }}>{caption.text}{caption.arrow && <span> →</span>}</span>}
      {bubble && <span className="snorlax-bubble" aria-hidden="true" data-visible={bubble.visible} style={{ left: `${snorlax.bubble.x / ART_W * 100}%`, top: `${snorlax.bubble.y / ART_H * 100}%` }}>{bubble.text}</span>}
      <span className="sr-only" aria-live="polite">{bubble?.visible ? `Snorlax mumbles: ${bubble.text}` : ''}</span>
    </div>
  </Stage>;
}
