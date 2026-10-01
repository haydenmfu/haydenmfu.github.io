import { useEffect, useRef, useState } from 'react';
import { projects } from './data/projects';
import { articles } from './data/writing';
import { experience } from './data/experience';
import { profile } from './data/profile';
import './desk.css';
import { deskTargets } from './data/deskTargets';

type View = 'desk' | 'projects' | 'research' | 'about' | 'experience' | 'resume' | 'contact';
const views: View[] = ['projects', 'research', 'about', 'experience', 'resume', 'contact'];
const labels: Record<View, string> = { desk: 'Desk', projects: 'Projects', research: 'Research', about: 'About', experience: 'Experience', resume: 'Résumé', contact: 'Contact' };
function currentView(): View {
  const hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
  if (hash === 'writing') return 'research';
  return views.includes(hash as View) ? hash as View : 'desk';
}

function Content({ view }: { view: View }) {
  if (view === 'projects') return <div className="content-grid project-list">{projects.map((p, i) => <article className="project-entry" key={p.title}>
    <div className="project-cover">{p.coverImage && <img src={p.coverImage} alt={p.coverAlt || ''} loading="lazy" />}</div>
    <div><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {p.category} / {p.year}</span><h2>{p.title}</h2><p>{p.description}</p><div className="tag-row">{p.tags.map(t => <span key={t}>{t}</span>)}</div>{p.link && <a className="text-link" href={p.link} target="_blank" rel="noopener noreferrer">Explore project ↗</a>}</div>
  </article>)}</div>;
  if (view === 'research') return <div className="manuscript"><p className="lede">Published writing and the questions I keep returning to.</p>{articles.map((a, i) => <article className="paper-entry" key={a.title}><span className="eyebrow">Paper {String(i + 1).padStart(2, '0')} · {a.category} · {a.date}</span><h2>{a.title}</h2><p>{a.excerpt}</p><div className="paper-foot"><span>{a.venue} · {a.readTime} read</span>{a.link && <a className="text-link" href={a.link} target="_blank" rel="noopener noreferrer">Read publication ↗</a>}</div></article>)}<h2 className="subheading">Current research</h2>{experience.filter(e => e.type === 'research').map(e => <article className="experience-entry" key={e.org}><span className="eyebrow">{e.period}</span><h3>{e.org}</h3><strong>{e.role}</strong><ul>{e.bullets.map(b => <li key={b}>{b}</li>)}</ul></article>)}</div>;
  if (view === 'about') return <div className="notebook-pages"><div><span className="eyebrow">A note from Hayden</span><h2>Curiosity is a good reason to stay awake.</h2><p>I'm a CS + Statistics student at Cornell building research software for messy, real-world systems: environmental sensing, water-resource modeling, LLM behavior, policy analysis, and algorithmic fairness.</p><p>Recent work includes particle-based irrigation inference with satellite and land-surface data, long-horizon LLM forecasting-agent evaluation, lake-effect snow correction models, and educational mapping tools for K-12 social studies curricula.</p></div><aside><h3>At a glance</h3><dl><dt>School</dt><dd>{profile.school}</dd><dt>Studying</dt><dd>{profile.degree}</dd><dt>Based in</dt><dd>{profile.location}</dd><dt>Open to</dt><dd>{profile.availability}</dd></dl><a className="text-link" href="#experience">See experience →</a></aside></div>;
  if (view === 'experience') return <div className="manuscript"><p className="lede">Research, work, and the teams I have learned from.</p>{(['research', 'work', 'club'] as const).map(type => <section key={type}><h2 className="subheading">{type === 'club' ? 'Community' : type === 'work' ? 'Work' : 'Research'}</h2>{experience.filter(e => e.type === type).map(e => <article className="experience-entry" key={e.org}><span className="eyebrow">{e.period}</span><h3>{e.org}</h3><strong>{e.role}</strong><ul>{e.bullets.map(b => <li key={b}>{b}</li>)}</ul></article>)}</section>)}</div>;
  if (view === 'resume') return <div className="resume-view"><p className="lede">A portable version of my work and experience.</p><div className="resume-actions"><a className="primary-link" href={profile.resume} download>Download résumé ↓</a><a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">Open PDF in a new tab ↗</a></div><iframe title="Hayden Fu résumé preview" src={profile.resume} /></div>;
  if (view === 'contact') return <div className="postcard-view"><div className="postcard-stamp">HF<br /><small>ITHACA, NY</small></div><span className="eyebrow">A postcard from the desk</span><h2>Let's compare notes.</h2><p>Open to research internships, SWE roles, and interesting problems. Email is the fastest way to reach me.</p><address><a href={`mailto:${profile.email}`}>{profile.email} ↗</a><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></address></div>;
  return null;
}

export default function App() {
  const [view, setView] = useState<View>(currentView);
  const deskFocus = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const sync = () => setView(currentView());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => { if (view !== 'desk') { window.scrollTo(0, 0); requestAnimationFrame(() => headingRef.current?.focus()); } else { requestAnimationFrame(() => deskFocus.current?.focus()); } }, [view]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && view !== 'desk') window.location.hash = ''; };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);
  return <div className="workspace-app">
    {view === 'desk' ? <main className="desk-page" ref={deskFocus} tabIndex={-1}>
      <div className="scene-topline"><span>HAYDEN FU / RESEARCH WORKSPACE</span><span>ITHACA, NEW YORK · 2026</span></div>
      <div className="workspace-illustration">
        <img className="workspace-art" src="/Assets%20Masked/Base.png" alt="Hayden's sunlit desk with a laptop labeled Projects, books labeled Research, notebook, papers, postcard, résumé drawer, and sleeping Snorlax" width="2846" height="1602" draggable={false} />
        <svg className="workspace-selectors" viewBox="0 0 2846 1602" role="group" aria-label="Explore the objects on the desk">
          {deskTargets.map(target => <a key={target.view} href={`#${target.view}`} aria-label={`Open ${labels[target.view]} using the ${target.object}`} className={`workspace-selector selector-${target.view}`}><path d={target.path} /></a>)}
        </svg>
      </div>
      <nav className="desk-index" aria-label="Desk index"><span>EXPLORE THE WORKSPACE</span>{views.map(v => <a href={`#${v}`} key={v}>{labels[v]}</a>)}</nav>
      <p className="desk-footnote">A research workspace, currently occupied by one very sleepy visitor.</p>
    </main> : <main className={`reading-view reading-${view}`}>
      <header className="reading-header"><a href="#" className="return-link">← Back to desk</a><nav aria-label="Content navigation">{views.map(v => <a key={v} href={`#${v}`} aria-current={view === v ? 'page' : undefined}>{labels[v]}</a>)}</nav></header>
      <div className="reading-shell"><div className="reading-kicker">HAYDEN FU / {labels[view].toUpperCase()}</div><h1 ref={headingRef} tabIndex={-1}>{labels[view]}</h1><Content view={view} /></div>
      <footer className="reading-footer"><a href="#">Return to the desk ↑</a><span>© 2026 Hayden Fu</span></footer>
    </main>}
  </div>;
}
