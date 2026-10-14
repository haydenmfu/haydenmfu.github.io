import { useRef, useState, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { articles, type Article } from '../../data/writing';
import { objectRegions } from '../../data/objectRegions';
import { ObjectRegion, Stage, inStageMode, prefersReducedMotion } from '../Stage';
import Dogear from '../Dogear';

const papers = [...articles].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
const shortTitle = (paper: Article) => paper.featured ? 'LLM forecasting' : paper.category === 'Policy Research' ? 'Homelessness policy' : 'AI bias';

function LeftPage({ index }: { index: number }) {
  const paper = papers[index];
  return <div className="research-left"><span className="eyebrow">{paper.featured ? 'Primary research' : `Paper ${String(index + 1).padStart(2, '0')}`} · {paper.category}{paper.date && ` · ${paper.date}`}</span><h2>{paper.title}</h2><div className="paper-foot"><span>{paper.venue}{paper.readTime && ` · ${paper.readTime} read`}</span></div></div>;
}
function RightPage({ index }: { index: number }) {
  const paper = papers[index];
  return <div className="research-right"><p>{paper.excerpt}</p>{paper.link && <a className="text-link" href={paper.link} target="_blank" rel="noopener noreferrer">Read paper ↗</a>}</div>;
}

type Turn = { from: number; to: number };

/* One paper per spread. Turning forward lifts the right page over the spine: its front still shows
   the current abstract, its back carries the next title. Underneath, the next abstract is already
   waiting, so the spread is whole again the moment the page lands. */
export default function ResearchBook() {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const target = useRef(0);
  const leaf = useRef<HTMLDivElement | null>(null);
  const flight = useRef<Animation | null>(null);
  const book = useRef<HTMLDivElement | null>(null);

  const go = (dir: 1 | -1) => {
    const from = target.current, to = from + dir;
    if (to < 0 || to >= papers.length) return;
    target.current = to;
    // The last page has no forward corner; keep keyboard focus inside the book when one vanishes.
    const hadFocus = book.current?.contains(document.activeElement);
    const keepFocus = () => { if (hadFocus && !book.current?.contains(document.activeElement)) book.current?.querySelector<HTMLElement>('.page-corner')?.focus(); };
    // A turn already in the air is abandoned; the new one starts from where it was heading.
    flight.current?.cancel();
    flight.current = null;
    if (prefersReducedMotion() || !inStageMode()) {
      flushSync(() => { setTurn(null); setIndex(to); });
      keepFocus();
      book.current?.querySelectorAll('.research-left, .research-right').forEach(page => page.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' }));
      return;
    }
    flushSync(() => { setIndex(from); setTurn({ from, to }); });
    keepFocus();
    const animation = leaf.current!.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${dir * -180}deg)` }], { duration: 450, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
    flight.current = animation;
    animation.onfinish = () => {
      if (flight.current !== animation) return;
      flight.current = null;
      setTurn(null);
      setIndex(to);
    };
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  const forward = turn ? turn.to > turn.from : true;
  const left = turn ? Math.min(turn.from, turn.to) : index;
  const right = turn ? Math.max(turn.from, turn.to) : index;
  const shown = target.current;
  return <div className="single-research" ref={book} onKeyDown={onKeyDown} data-turning={turn ? "" : undefined}>
    <p className="sr-only" role="status">Paper {shown + 1} of {papers.length}: {papers[shown].title}</p>
    <Stage ratio={1.5} className="research-object">
      <img className="object-background" src="/subpage-art/research.png" alt="" width="1536" height="1024" />
      <ObjectRegion region={objectRegions.research} />
      <LeftPage index={left} />
      <RightPage index={right} />
      {turn && <div className={`book-leaf ${forward ? 'leaf-forward' : 'leaf-back'}`} ref={leaf} aria-hidden="true">
        <div className="leaf-face leaf-front">{forward ? <RightPage index={turn.from} /> : <LeftPage index={turn.from} />}</div>
        <div className="leaf-face leaf-reverse">{forward ? <LeftPage index={turn.to} /> : <RightPage index={turn.to} />}</div>
      </div>}
      <div className="book-turns">
        {shown > 0 && <button type="button" className="page-corner corner-prev" onClick={() => go(-1)} aria-label={`Previous paper: ${shortTitle(papers[shown - 1])}`}><Dogear side="left" radius={20} /><span className="corner-label" aria-hidden="true">← {shortTitle(papers[shown - 1])}</span></button>}
        <span className="page-count" aria-hidden="true">{shown + 1} / {papers.length}</span>
        {shown < papers.length - 1 && <button type="button" className="page-corner corner-next" onClick={() => go(1)} aria-label={`Next paper: ${shortTitle(papers[shown + 1])}`}><Dogear radius={20} /><span className="corner-label" aria-hidden="true">{shortTitle(papers[shown + 1])} →</span></button>}
      </div>
    </Stage>
  </div>;
}
