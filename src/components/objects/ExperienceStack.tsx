import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { experience, type ExperienceType } from '../../data/experience';
import { prefersReducedMotion } from '../Stage';
import Dogear from '../Dogear';

const sheets: { type: ExperienceType; label: string }[] = [
  { type: 'research', label: 'Research' },
  { type: 'work', label: 'Work' },
  { type: 'club', label: 'Community' },
];

/* One sheet per category, clipped in a stack. Lifting the corner slides the top sheet down and
   behind the others, so the stack cycles. */
export default function ExperienceStack() {
  const [index, setIndex] = useState(0);
  const sheet = useRef<HTMLDivElement | null>(null);
  const leaving = useRef(false);
  const arriving = useRef<Animation | null>(null);
  const queued = useRef(false);
  const current = sheets[index], next = sheets[(index + 1) % sheets.length];

  // A click while the new sheet is still settling lands it at once and flips again;
  // a click while the old sheet is sliding away is queued for when it is gone.
  const flip = () => {
    const el = sheet.current;
    if (!el) return;
    if (leaving.current) { queued.current = true; return; }
    arriving.current?.finish();
    leaving.current = true;
    const reduce = prefersReducedMotion();
    const leave = el.animate(reduce ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 24px' }], { duration: reduce ? 100 : 300, easing: 'ease-out' });
    leave.onfinish = () => {
      leaving.current = false;
      flushSync(() => setIndex(i => (i + 1) % sheets.length));
      window.scrollTo({ top: 0, behavior: 'instant' });
      el.querySelector<HTMLElement>('.sheet-title')?.focus({ preventScroll: true });
      const arrive = el.animate(reduce ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: '0 -8px' }, { opacity: 1, translate: '0 0' }], { duration: reduce ? 100 : 300, easing: 'ease-out' });
      arriving.current = arrive;
      arrive.onfinish = () => { if (arriving.current === arrive) arriving.current = null; };
      if (queued.current) { queued.current = false; flip(); }
    };
  };

  return <div className="manuscript">
    <div className="experience-sheet" ref={sheet}>
      <header className="sheet-head">
        <h2 className="sheet-title" tabIndex={-1}>{current.label}</h2>
        <span className="sheet-count">sheet {index + 1} of {sheets.length}</span>
      </header>
      {experience.filter(e => e.type === current.type).map(e => <article className="experience-entry" key={e.org}><span className="eyebrow">{e.period}</span><h3>{e.org}</h3><strong>{e.role}</strong><p>{e.description}</p></article>)}
    </div>
    {/* Outside the animated sheet, so it stays pinned to the paper's real corner while the sheet moves. */}
    <button type="button" className="sheet-corner" onClick={flip}><span className="sheet-corner-label">Next: {next.label}</span><Dogear radius={4} /></button>
  </div>;
}
