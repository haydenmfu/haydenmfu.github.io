import { useRef, useState } from 'react';
import '../resume.css';

const versions = {
  swe: { label: 'Software Engineering', pdf: '/resumes/Hayden-Fu-SWE.pdf', image: '/resumes/swe.png' },
  analytics: { label: 'Data Analytics', pdf: '/resumes/Hayden-Fu-Data-Analytics.pdf', image: '/resumes/data-analytics.png' },
};
type Version = keyof typeof versions;
const order = Object.keys(versions) as Version[];

/* Two résumés lie on the desk, one slightly under the other. Clicking the lower sheet slides it
   on top. The DOM order never changes, so the sheets transition instead of remounting. */
export default function ResumeDocument() {
  const [top, setTop] = useState<Version>('swe');
  const folio = useRef<HTMLElement | null>(null);
  const bringUp = (version: Version) => {
    setTop(version);
    requestAnimationFrame(() => folio.current?.querySelector<HTMLElement>('.sheet-pick')?.focus());
  };
  return <section className="resume-folio" aria-label="Hayden Fu resumes" data-object="" ref={folio}>
    <p className="sr-only" role="status">Showing the {versions[top].label} résumé</p>
    <div className="resume-stack">
      {order.map(key => {
        const v = versions[key], isTop = key === top;
        return <div key={key} className={`resume-sheet sheet-${key} ${isTop ? 'is-top' : 'is-under'}`}>
          <span className="sheet-tab" aria-hidden="true">{v.label}</span>
          <img src={v.image} width="1469" height="1900" alt={isTop ? `Hayden Fu's ${v.label} résumé. Download or open the PDF for selectable text.` : ''} />
          {isTop ? <>
            <a className="resume-clip" href={v.pdf} download aria-label={`Download the ${v.label} résumé PDF`}>
              <svg viewBox="0 0 24 64" aria-hidden="true"><path d="M8 20 V50 a4 4 0 0 0 8 0 V12 a7 7 0 0 0 -14 0 V48 a10 10 0 0 0 20 0 V20" /></svg>
              <span className="clip-tag">download ↓</span>
            </a>
            <a className="resume-stamp" href={v.pdf} target="_blank" rel="noopener noreferrer" aria-label={`Open the ${v.label} résumé PDF in a new tab`}><span aria-hidden="true">OPEN<br />PDF ↗</span></a>
          </> : <button type="button" className="sheet-pick" onClick={() => bringUp(key)} aria-label={`Show the ${v.label} résumé`} />}
        </div>;
      })}
    </div>
  </section>;
}
