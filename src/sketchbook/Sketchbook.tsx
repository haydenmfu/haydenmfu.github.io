import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ownerName, sectionOrder, sections, type SectionId } from './content';
import { Engine, lineRange, lineView, type Mode, type Rect } from './engine';
import './sketchbook.css';

const isSection = (s: string): s is SectionId => (sectionOrder as string[]).includes(s);
const number = (i: number) => String(i + 1).padStart(2, '0');

export default function Sketchbook() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const marker = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const from = useRef<Rect | null>(null);
  const pointer = useRef({ x: 0, y: 0, held: false });
  const [mode, setMode] = useState<Mode>('loading');
  const [section, setSection] = useState<SectionId>('about');
  const [stop, setStop] = useState(0);          // the stop whose page is (or was last) open
  const [open, setOpen] = useState(false);
  const [walked, setWalked] = useState(false);
  const [travelling, setTravelling] = useState(false);

  useEffect(() => {
    let started = false, moved = false;
    const e = new Engine(canvas.current!, sections, ownerName, {
      mode(m, s) {
        setMode(m); setSection(s);
        if (m === 'cover' && !started) {   // a link straight to a section skips the cover
          started = true;
          const hash = decodeURIComponent(location.hash.slice(1)).toLowerCase();
          if (isSection(hash)) {   // ?at=12 starts that far along the line, ?stop=2 with that stop's page open
            const q = new URLSearchParams(location.search), n = Number(q.get('stop'));
            e.jump(hash, q.has('stop') ? lineView(n - 1, sections[hash].stops.length) : Number(q.get('at')) || 0);
            if (q.has('stop') && sections[hash].stops[n - 1]) { setStop(n - 1); setOpen(true); }
          }
        }
        if (m === 'path') history.replaceState(null, '', `#${s}`);
        if (m === 'cover' && started) history.replaceState(null, '', location.pathname);
        if (m === 'entering' || m === 'opening') { moved = false; setWalked(false); }
      },
      openStop(i, rect) { from.current = rect; setStop(i); setOpen(true); },
      progress(u, range) {
        marker.current?.style.setProperty('--p', String(range ? u / range : 0));
        if (!moved && u > 1.2) { moved = true; setWalked(true); }
      },
    });
    engine.current = e;
    if (import.meta.env.DEV) (window as unknown as { __engine?: Engine }).__engine = e;   // for driving it from tests
    return () => { e.destroy(); engine.current = null; };
  }, []);

  // The line stops being drawn while a page covers it.
  useEffect(() => { engine.current?.pause(open); }, [open]);

  const sec = sections[section], stops = sec.stops, current = stops[Math.min(stop, stops.length - 1)];
  const inPath = mode === 'path';

  // Leave this stop, walk the line, and arrive in another.
  const travel = useCallback(async (to: number) => {
    const e = engine.current; if (!e) return;
    setOpen(false); setTravelling(true); e.pause(false);
    const target = e.viewOf(to);
    await e.goTo(target, 650 + Math.abs(target - e.u) * 120);
    setTravelling(false);
    if (to >= e.stops.length) return;   // the end of the line: the book stands there
    from.current = e.rectOf(to) ?? null; setStop(to); setOpen(true);
  }, []);

  useEffect(() => {
    const key = (ev: KeyboardEvent) => {
      const e = engine.current; if (!e) return;
      if (ev.key === 'Escape') { if (open) setOpen(false); else void e.close(); return; }
      if (open) { if (ev.key === 'ArrowRight' && stop < stops.length) void travel(stop + 1); if (ev.key === 'ArrowLeft' && stop > 0) void travel(stop - 1); return; }
      if (e.mode !== 'path') return;
      const step: Record<string, number> = { ArrowDown: 1.6, ArrowUp: -1.6, PageDown: 6, PageUp: -6, ' ': 6, Home: -1e3, End: 1e3 };
      if (ev.key in step) { ev.preventDefault(); e.walkBy(step[ev.key]); }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [open, stop, stops.length, travel]);

  // The page grows out of the drawing that stood beside the line.
  useLayoutEffect(() => {
    const fig = figure.current; if (!fig || !open) return;
    fig.style.transition = 'none'; fig.style.transform = '';
    const to = fig.getBoundingClientRect(), f = from.current;
    if (f && to.height) fig.style.transform = `translate(${f.x + f.w / 2 - to.x - to.width / 2}px, ${f.y + f.h / 2 - to.y - to.height / 2}px) scale(${f.h / to.height})`;
    pointer.current = { x: to.width * 0.55, y: to.height * 0.5, held: false };
    band(26);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => { fig.style.transition = ''; fig.style.transform = ''; }));
    return () => cancelAnimationFrame(id);
  }, [open, stop, section]);

  // A strip of the photograph through the drawing, parallel to the pencil strokes.
  function band(half: number, animate = false) {
    const el = photo.current; if (!el) return;
    const { x, y } = pointer.current, dx = Math.cos(50 * Math.PI / 180), dy = -Math.sin(50 * Math.PI / 180), R = 4000;
    const pt = (a: number, b: number) => `${x + dx * a + dy * b}px ${y + dy * a - dx * b}px`;
    el.classList.toggle('sweep', animate);
    el.style.clipPath = `polygon(${pt(-R, half)}, ${pt(R, half)}, ${pt(R, -half)}, ${pt(-R, -half)})`;
  }
  const move = (ev: PointerEvent<HTMLElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    pointer.current.x = ev.clientX - r.x; pointer.current.y = ev.clientY - r.y;
    if (!pointer.current.held) band(46);
  };
  const hold = (ev: PointerEvent<HTMLElement>) => { pointer.current.held = true; ev.currentTarget.setPointerCapture(ev.pointerId); band(2600, true); };
  const release = () => { if (pointer.current.held) { pointer.current.held = false; band(46, true); } };

  const last = stop >= stops.length - 1;
  return (
    <div className="sb" data-mode={mode} data-open={open} style={{ '--line': sec.color } as CSSProperties}>
      <canvas ref={canvas} className="sb-stage" aria-hidden="true" />

      {mode === 'loading' && <p className="sb-loading sb-mono">Opening the sketchbook</p>}
      {mode === 'cover' && <p className="sb-prompt sb-mono"><i />Choose a ribbon</p>}

      <header className="sb-mast sb-hud"><b>{ownerName}</b><span className="sb-mono">{sec.label}</span></header>
      <button className="sb-close sb-hud sb-mono" onClick={() => void engine.current?.close()}><span aria-hidden="true">←</span> Close the book</button>

      <nav className="sb-lines sb-hud" aria-label="Sections">
        {sectionOrder.map(id => (
          <button key={id} className="sb-mono" aria-current={id === section} style={{ '--c': sections[id].color } as CSSProperties} onClick={() => engine.current?.switchTo(id)}>
            <i />{sections[id].label}
          </button>
        ))}
      </nav>

      {/* where you are on the line, and a way to jump along it */}
      <nav className="sb-map sb-hud" aria-label="Stops on this line">
        <div className="sb-map-line" ref={marker}>
          {stops.map((s, i) => (
            <button key={s.title} style={{ '--at': lineView(i, stops.length) / lineRange(stops.length) } as CSSProperties}
              onClick={() => void engine.current?.goTo(lineView(i, stops.length))}><span className="sb-mono">{s.title}</span></button>
          ))}
          <button className="sb-map-end" style={{ '--at': 1 } as CSSProperties} onClick={() => void engine.current?.goTo(1e3)}><span className="sb-mono">Close the book</span></button>
          <em />
        </div>
      </nav>

      <div className="sb-hint sb-hud" data-show={inPath && !walked && !travelling}>
        <svg viewBox="0 0 24 38" aria-hidden="true"><rect x="1.5" y="1.5" width="21" height="35" rx="10.5" /><circle cx="12" cy="11" r="2.4" /></svg>
        <span className="sb-mono">Scroll to walk the line</span>
        <svg className="sb-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8l7 7 7-7" /></svg>
      </div>

      <aside className="sb-plate" aria-hidden={!open}>
        <figure ref={figure} data-photo={!!current?.art?.photo} style={{ '--ar': current?.art?.ratio ?? 0.75 } as CSSProperties}
          onPointerMove={move} onPointerDown={hold} onPointerUp={release} onPointerCancel={release}>
          {current?.art
            ? <><img src={current.art.sketch} alt={`Pencil drawing: ${current.title}`} draggable={false} />{current.art.photo && <img ref={photo} className="sb-photo" src={current.art.photo} alt="" draggable={false} />}</>
            : <div className="sb-blank"><b>{number(stop)}</b><span className="sb-mono">Not yet drawn</span></div>}
        </figure>
        {current && (
          <div className="sb-notes">
            <p className="sb-mono sb-no">No. {number(stop)} / {sec.label}</p>
            <h2>{current.title}</h2>
            <p className="sb-mono sb-when">{current.meta}</p>
            {current.body.map(p => <p className="sb-body" key={p}>{p}</p>)}
            {current.tags && <p className="sb-mono sb-tags">{current.tags.join(' · ')}</p>}
            {current.links && <p className="sb-links">{current.links.map(l => <a key={l.href} href={l.href} target={l.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}</p>}
            <div className="sb-rule" />
            {current.art?.photo && <p className="sb-mono sb-how">Move across the drawing. Hold to see the photograph.</p>}
            <div className="sb-walk">
              {stop > 0 && <button className="sb-mono" onClick={() => void travel(stop - 1)}><span aria-hidden="true">←</span> {stops[stop - 1].title}</button>}
              <button className="sb-mono sb-next" onClick={() => void travel(stop + 1)}>{last ? 'Walk to the end of the line' : <>Next: {stops[stop + 1].title}</>} <span aria-hidden="true">→</span></button>
            </div>
          </div>
        )}
        <button className="sb-back sb-mono" onClick={() => setOpen(false)}>Back to the line <span aria-hidden="true">×</span></button>
      </aside>

      {/* the same content as plain text, for screen readers and search engines */}
      <div className="sb-plain">
        <h1>{ownerName}</h1>
        {sectionOrder.map(id => (
          <section key={id}><h2>{sections[id].label}</h2>
            {sections[id].stops.map(s => <article key={s.title}><h3>{s.title}</h3><p>{s.meta}</p>{s.body.map(p => <p key={p}>{p}</p>)}{s.links?.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}</article>)}
          </section>
        ))}
      </div>
    </div>
  );
}
