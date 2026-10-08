import { useEffect, useRef, useState } from 'react';
import { projects } from './data/projects';
import { articles } from './data/writing';
import { experience } from './data/experience';
import { profile } from './data/profile';
import { about } from './data/about';
import './desk.css';
import { deskTargets } from './data/deskTargets';
import ResumeDocument from './components/ResumeDocument';

type View = 'desk' | 'projects' | 'research' | 'about' | 'experience' | 'resume' | 'contact';
const views: View[] = ['projects', 'research', 'about', 'experience', 'resume', 'contact'];
const labels: Record<View, string> = { desk: 'Desk', projects: 'Projects', research: 'Research', about: 'About me', experience: 'Experience', resume: 'Resume', contact: 'Contact' };
function currentView(): View {
  const hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
  if (hash === 'writing') return 'research';
  return views.includes(hash as View) ? hash as View : 'desk';
}

function Content({ view }: { view: View }) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [paperIndex, setPaperIndex] = useState(0);
  const orderedPapers = [...articles].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const paper = orderedPapers[paperIndex];
  if (view === 'projects') return <div className="laptop-reader"><img src="/subpage-art/projects-v3.png" className="laptop-reader-art" alt="" /><div className="laptop-scroll" tabIndex={0} role="region" aria-label="Projects, scroll to explore"><h2 className="screen-heading">Projects</h2>{projects.map((p, i) => <article className="screen-project" key={p.title}><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {p.category} / {p.year}</span><h3>{p.title}</h3><p>{p.description}</p><div className="tag-row">{p.tags.map(t => <span key={t}>{t}</span>)}</div>{p.link && <a className="text-link" href={p.link} target="_blank" rel="noopener noreferrer">{p.linkLabel || 'Read paper'} ↗</a>}</article>)}</div></div>;
  if (view === 'research') return <div className="single-research"><nav className="paper-picker" aria-label="Choose a research paper">{orderedPapers.map((a, i) => <button type="button" key={a.title} aria-pressed={paperIndex === i} onClick={() => setPaperIndex(i)}>{a.featured ? 'LLM forecasting' : a.category === 'Policy Research' ? 'Homelessness policy' : 'AI bias'}</button>)}</nav><article className="research-object"><img className="object-background" src="/subpage-art/research.png" alt="" width="1536" height="1024" /><div className="research-left"><span className="eyebrow">{paper.featured ? 'Primary research' : `Paper ${String(paperIndex + 1).padStart(2, '0')}`} · {paper.category}{paper.date && ` · ${paper.date}`}</span><h2>{paper.title}</h2><div className="paper-foot"><span>{paper.venue}{paper.readTime && ` · ${paper.readTime} read`}</span></div></div><div className="research-right" aria-live="polite"><p>{paper.excerpt}</p>{paper.link && <a className="text-link" href={paper.link} target="_blank" rel="noopener noreferrer">Read paper ↗</a>}</div></article></div>;
  if (view === 'about') return <div className="about-book"><img className="about-book-image" src="/subpage-art/about.png" alt="" width="1536" height="1024" /><div className="about-story"><h2>About me</h2>{about.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="about-facts">{about.current.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<div className="about-fact-list"><h3>At a glance</h3><dl><dt>School</dt><dd>{profile.school}</dd><dt>Studying</dt><dd>{profile.degree}</dd><dt>Location</dt><dd>{profile.location}</dd><dt>Looking for</dt><dd>{profile.availability}</dd></dl><a className="text-link" href="#experience">View my experience →</a></div></div></div>;
  if (view === 'experience') return <div className="manuscript"><nav className="experience-tabs" aria-label="Experience categories">{(['research', 'work', 'club'] as const).map(type => <button type="button" key={type} onClick={() => { const section = document.getElementById(`experience-${type}`); section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); section?.focus({ preventScroll: true }); }}>{type === 'club' ? 'Community' : type === 'work' ? 'Work' : 'Research'}</button>)}</nav>{(['research', 'work', 'club'] as const).map(type => <section key={type} id={`experience-${type}`} tabIndex={-1}><h2 className="subheading">{type === 'club' ? 'Community' : type === 'work' ? 'Work' : 'Research'}</h2>{experience.filter(e => e.type === type).map(e => <article className="experience-entry" key={e.org}><span className="eyebrow">{e.period}</span><h3>{e.org}</h3><strong>{e.role}</strong><p>{e.description}</p></article>)}</section>)}</div>;
  if (view === 'resume') return <div className="resume-view"><ResumeDocument /></div>;
  if (view === 'contact') return <div className="postcard-scroll"><div className="postcard-view"><div className="postcard-message"><h2>Contact</h2><p>{about.contact}</p></div><address className="postcard-links"><span className="postcard-email">{profile.email}</span><a href={`mailto:${profile.email}`}>Send an email ↗</a><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(profile.email); setEmailCopied(true); } catch { setEmailCopied(false); } }} aria-live="polite">{emailCopied ? 'Email copied' : 'Copy email'}</button><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></address></div></div>;
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
      <div className="desk-intro"><h1>Hayden Fu</h1><p>{about.intro}</p></div>
      <div className="workspace-illustration">
        <img className="workspace-art" src="/Assets%20Masked/Base.png" alt="Hayden's sunlit desk with a laptop labeled Projects, books labeled Research, notebook, papers, postcard, resume drawer, and sleeping Snorlax" width="2846" height="1602" draggable={false} />
        <svg className="workspace-selectors" viewBox="0 0 2846 1602" role="group" aria-label="Explore the objects on the desk">
          {deskTargets.map(target => <a key={target.view} href={`#${target.view}`} aria-label={`Open ${labels[target.view]} using the ${target.object}`} className={`workspace-selector selector-${target.view}`}><path d={target.path} /></a>)}
        </svg>
      </div>
      <nav className="desk-index" aria-label="Desk index"><span>EXPLORE</span>{views.map(v => <a href={`#${v}`} key={v}>{labels[v]}</a>)}</nav>
    </main> : <main className={`reading-view reading-${view}`}>
      <header className="reading-header"><a href="#" className="return-link">Back to desk</a><nav aria-label="Content navigation">{views.map(v => <a key={v} href={`#${v}`} aria-current={view === v ? 'page' : undefined}>{labels[v]}</a>)}</nav></header>
      <div className="reading-shell">{view === 'about' || view === 'contact' || view === 'projects' ? <h1 className="sr-only" ref={headingRef} tabIndex={-1}>{labels[view]}</h1> : <div className="chapter-art"><img src={`/subpage-art/${view}.png`} alt="" width="1536" height="1024" /><div className="chapter-title"><div className="reading-kicker">HAYDEN FU / {labels[view].toUpperCase()}</div><h1 ref={headingRef} tabIndex={-1}>{labels[view]}</h1></div></div>}<div className="chapter-content"><Content view={view} /></div></div>
      <footer className="reading-footer"><a href="#">Back to desk</a><span>© 2026 Hayden Fu</span></footer>
    </main>}
  </div>;
}
