import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { projects } from './data/projects';
import { profile } from './data/profile';
import { about } from './data/about';
import './desk.css';
import { objectRegions } from './data/objectRegions';
import ResumeDocument from './components/ResumeDocument';
import { ObjectRegion, Stage } from './components/Stage';
import ResearchBook from './components/objects/ResearchBook';
import ExperienceStack from './components/objects/ExperienceStack';
import Postcard from './components/objects/Postcard';
import Desk, { spendShimmer } from './components/Desk';

type View = 'desk' | 'projects' | 'research' | 'about' | 'experience' | 'resume' | 'contact';
const views: View[] = ['projects', 'research', 'about', 'experience', 'resume', 'contact'];
const labels: Record<View, string> = { desk: 'Desk', projects: 'Projects', research: 'Research', about: 'About me', experience: 'Experience', resume: 'Resume', contact: 'Contact' };
function currentView(): View {
  const hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
  if (hash === 'writing') return 'research';
  return views.includes(hash as View) ? hash as View : 'desk';
}

function SiteNav({ view }: { view: View }) {
  return <nav className={`site-nav${view === 'desk' ? ' site-nav-desk' : ''}`} aria-label="Desk objects">
    <span className="site-nav-title" aria-hidden="true">Explore</span>
    {view !== 'desk' && <a href="#">Back to desk</a>}
    {views.map(v => <a key={v} href={`#${v}`} aria-current={view === v ? 'page' : undefined}>{labels[v]}</a>)}
  </nav>;
}

function Content({ view }: { view: View }) {
  if (view === 'projects') return <Stage ratio={1.5} focus={[0.5, 0.45]} className="laptop-reader"><img src="/subpage-art/projects-v3.png" className="laptop-reader-art" alt="" /><ObjectRegion region={objectRegions.projects} /><div className="laptop-scroll" tabIndex={0} role="region" aria-label="Projects, scroll to explore"><h2 className="screen-heading">Projects</h2>{projects.map((p, i) => <article className="screen-project" key={p.title}><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {p.category} / {p.year}</span><h3>{p.title}</h3><p>{p.description}</p><div className="tag-row">{p.tags.map(t => <span key={t}>{t}</span>)}</div>{p.link && <a className="text-link" href={p.link} target="_blank" rel="noopener noreferrer">{p.linkLabel || 'Read paper'} ↗</a>}</article>)}</div></Stage>;
  if (view === 'research') return <ResearchBook />;
  if (view === 'about') return <Stage ratio={1.5} className="about-book"><img className="about-book-image" src="/subpage-art/about.png" alt="" width="1536" height="1024" /><ObjectRegion region={objectRegions.about} /><div className="about-story"><h2>About me</h2>{about.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="about-facts">{about.current.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<div className="about-fact-list"><h3>At a glance</h3><dl><dt>School</dt><dd>{profile.school}</dd><dt>Studying</dt><dd>{profile.degree}</dd><dt>Location</dt><dd>{profile.location}</dd><dt>Looking for</dt><dd>{profile.availability}</dd></dl></div></div></Stage>;
  if (view === 'experience') return <ExperienceStack />;
  if (view === 'resume') return <div className="resume-view"><ResumeDocument /></div>;
  if (view === 'contact') return <Postcard />;
  return null;
}

// Inside an element's border, so a decorative frame (the experience clipboard) reads as desk.
function insideObject(el: Element, x: number, y: number) {
  const r = el.getBoundingClientRect(), box = el as HTMLElement;
  const left = r.left + box.clientLeft, top = r.top + box.clientTop;
  return x >= left && x <= left + box.clientWidth && y >= top && y <= top + box.clientHeight;
}

export default function App() {
  const [view, setView] = useState<View>(currentView);
  const [playIntro, setPlayIntro] = useState(true);
  const deskFocus = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const viewRef = useRef(view);
  const objectOrigins = useRef<Partial<Record<View, string>>>({});
  const press = useRef<{ x: number; y: number; dismissing: boolean } | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = currentView(), prev = viewRef.current;
      if (next === prev) return;
      viewRef.current = next;
      if (!document.startViewTransition) { setView(next); return; }
      // Zoom into the object being opened, or back out toward the object being closed.
      const root = document.documentElement;
      const object = next === 'desk' ? prev : prev === 'desk' ? next : null;
      const rect = prev === 'desk' && object ? document.querySelector(`.selector-${object}`)?.getBoundingClientRect() : undefined;
      if (object && rect) objectOrigins.current[object] = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
      const origin = object ? objectOrigins.current[object] : undefined;
      root.style.setProperty('--vt-origin', origin ?? '50% 30%');
      root.dataset.vt = !origin ? 'swap' : next === 'desk' ? 'exit' : 'enter';
      document.startViewTransition(() => flushSync(() => setView(next))).finished.finally(() => { delete root.dataset.vt; });
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); if (view !== 'desk') { setPlayIntro(false); spendShimmer(); requestAnimationFrame(() => headingRef.current?.focus()); } else { requestAnimationFrame(() => deskFocus.current?.focus({ preventScroll: true })); } }, [view]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && view !== 'desk') window.location.hash = ''; };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);

  // Putting the object down: a clean click on the desk around it. Drags, text selections,
  // and clicks that only dismiss a selection never count.
  const onPointerDown = (e: PointerEvent) => {
    const selection = window.getSelection();
    press.current = e.button === 0 ? { x: e.clientX, y: e.clientY, dismissing: Boolean(selection && !selection.isCollapsed) } : null;
  };
  const onDeskClick = (e: MouseEvent<HTMLElement>) => {
    const start = press.current;
    press.current = null;
    if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) >= 4) return;
    if (start.dismissing) { window.getSelection()?.removeAllRanges(); return; }
    if (!window.getSelection()?.isCollapsed) return;
    if ((e.target as Element).closest('a, button, input, textarea, select, summary, label, [tabindex]:not(main)')) return;
    if ([...e.currentTarget.querySelectorAll('[data-object]')].some(el => insideObject(el, e.clientX, e.clientY))) return;
    window.location.hash = '';
  };

  return <div className="workspace-app">
    {view === 'desk' ? <main className={`desk-page${playIntro ? ' play-intro' : ''}`} ref={deskFocus} tabIndex={-1}>
      <SiteNav view="desk" />
      <Desk labels={labels} />
    </main> : <main className={`reading-view reading-${view}`} onPointerDown={onPointerDown} onClick={onDeskClick}>
      <h1 className="sr-only" ref={headingRef} tabIndex={-1}>{labels[view]}</h1>
      <SiteNav view={view} />
      <div className="reading-shell" data-object={view === 'experience' ? '' : undefined}>
        <div className="chapter-content"><Content view={view} /></div>
      </div>
      <a href="#" className="snorlax-peek" aria-label="Back to desk"><img src="/snorlax-peek.png" alt="" width="360" height="179" /><span className="peek-tag" aria-hidden="true">back to desk</span></a>
    </main>}
  </div>;
}
