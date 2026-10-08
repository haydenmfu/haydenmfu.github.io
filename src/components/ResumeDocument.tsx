import { useState } from 'react';
import resumeText from '../data/resumeText.json';
import '../resume.css';

const versions = {
  swe: { label: 'Software Engineering', pdf: '/resumes/Hayden-Fu-SWE.pdf', image: '/resumes/swe.png' },
  analytics: { label: 'Data Analytics', pdf: '/resumes/Hayden-Fu-Data-Analytics.pdf', image: '/resumes/data-analytics.png' },
};
type Version = keyof typeof versions;

export default function ResumeDocument() {
  const [version, setVersion] = useState<Version>('swe');
  const [reading, setReading] = useState(false);
  const selected = versions[version];
  const other: Version = version === 'swe' ? 'analytics' : 'swe';
  return <section className="resume-folio" aria-label="Hayden Fu resumes">
    <div className="resume-controls">
      <div className="resume-version-group" role="group" aria-label="Resume version">
        {(Object.keys(versions) as Version[]).map(key => <button key={key} type="button" aria-pressed={key === version} onClick={() => setVersion(key)}>{versions[key].label}</button>)}
      </div>
      <button className="resume-flip" type="button" onClick={() => setVersion(other)}>Flip to {versions[other].label} ↻</button>
      <div className="resume-file-actions"><a href={selected.pdf} download>Download PDF ↓</a><a href={selected.pdf} target="_blank" rel="noopener noreferrer">Open PDF ↗</a><button type="button" aria-pressed={reading} onClick={() => setReading(!reading)}>{reading ? 'Show original layout' : 'Readable text view'}</button></div>
    </div>
    <p className="sr-only" role="status">Showing {selected.label} resume</p>
    <div className="resume-original-sheet" key={version}>
      {reading ? <div className="resume-readable"><h2>{selected.label} résumé</h2><div>{resumeText[version].text}</div></div> : <img src={selected.image} width="1469" height="1900" alt={`Hayden Fu's ${selected.label} resume. Use Readable text view for selectable text, or open the PDF.`} />}
    </div>
  </section>;
}
