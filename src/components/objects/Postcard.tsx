import { useEffect, useRef, useState } from 'react';
import { about } from '../../data/about';
import { profile } from '../../data/profile';
import { objectRegions } from '../../data/objectRegions';
import { ObjectRegion, Stage } from '../Stage';

type Mark = { text: string; status: string };

/* The address side carries the links; the stamp copies the email and gets postmarked. */
export default function Postcard() {
  const [mark, setMark] = useState<Mark | null>(null);
  const [inked, setInked] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let next: Mark;
    try {
      await navigator.clipboard.writeText(profile.email);
      next = { text: 'COPIED · ITHACA · COPIED · ITHACA ·', status: 'Email address copied' };
    } catch {
      next = { text: 'COPY FAILED · USE THE LINK · ', status: 'Copying failed. Use the email link instead.' };
    }
    setMark(next);
    setInked(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setInked(false), 2000);
  };

  return <Stage ratio={1.5} className="postcard-view">
    <ObjectRegion region={objectRegions.contact} />
    <div className="postcard-message"><h2>Contact</h2><p>{about.contact}</p></div>
    <address className="postcard-links">
      <a href={`mailto:${profile.email}`}>{profile.email}</a>
      <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
    </address>
    <button type="button" className="stamp-button" onClick={copy} aria-label="Copy email address">
      <span className="stamp-face" aria-hidden="true">✉<small>copy</small></span>
      <svg className="postmark-ink" data-inked={inked} viewBox="0 0 120 120" aria-hidden="true">
        <defs><path id="postmark-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
        <circle cx="60" cy="60" r="54" />
        <circle cx="60" cy="60" r="34" />
        <text><textPath href="#postmark-ring">{mark?.text}</textPath></text>
        <path d="M30 56 q8 -6 15 0 t15 0 t15 0 t15 0 M30 66 q8 -6 15 0 t15 0 t15 0 t15 0" />
      </svg>
    </button>
    <span className="stamp-caption" aria-hidden="true">the stamp copies my email ↑</span>
    <span className="sr-only" aria-live="polite">{inked ? mark?.status : ''}</span>
  </Stage>;
}
