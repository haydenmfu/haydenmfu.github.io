import { SectionHeader } from '../ui/SectionHeader';
import { experience, type ExperienceEntry } from '../../data/experience';

function ExperienceCard({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display font-bold text-ink text-base leading-tight">{entry.org}</h3>
          <span className="label-strip self-start">{entry.role}</span>
        </div>
        <span className="font-mono text-xs text-gray-400 whitespace-nowrap pt-0.5">{entry.period}</span>
      </div>

      <ul className="flex flex-col gap-1.5 mt-1">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="font-body text-sm text-gray-600 flex gap-2 leading-relaxed">
            <span className="text-gray-300 flex-shrink-0 mt-0.5">–</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubsectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-0">
      <span className="label-strip">{children}</span>
      <div className="flex-1 border-t border-gray-300" />
    </div>
  );
}

export function Experience() {
  const research = experience.filter((e) => e.type === 'research');
  const work = experience.filter((e) => e.type === 'work');
  const clubs = experience.filter((e) => e.type === 'club');

  return (
    <section id="experience" className="py-24 bg-paper-mid border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <SectionHeader index="02" title="Experience" subtitle="Research, work & activities" />

        {/* Research — 2-column grid */}
        <div className="mb-10">
          <SubsectionLabel>Research</SubsectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-l-2 border-t-2 border-ink mt-4">
            {research.map((entry) => (
              <div key={entry.org + entry.period} className="border-r-2 border-b-2 border-ink">
                <ExperienceCard entry={entry} />
              </div>
            ))}
          </div>
        </div>

        {/* Work + Clubs — 2-column grid */}
        <div>
          <SubsectionLabel>Work & Activities</SubsectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-l-2 border-t-2 border-ink mt-4">
            {[...work, ...clubs].map((entry) => (
              <div key={entry.org + entry.period} className="border-r-2 border-b-2 border-ink">
                <ExperienceCard entry={entry} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
