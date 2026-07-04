import { profile } from '../../data/profile';
import { SectionHeader } from '../ui/SectionHeader';

const traits = [
  { label: 'Degree', value: profile.degree },
  { label: 'GPA', value: '3.78' },
  { label: 'Based in', value: profile.location },
  { label: 'Open to', value: profile.availability },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-paper-mid border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <SectionHeader index="04" title="About" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-2 border-ink">
          <div className="lg:col-span-4 relative min-h-64 bg-ink border-b-2 lg:border-b-0 lg:border-r-2 border-ink overflow-hidden">
            <div className="absolute inset-0 pattern-halftone-lg" style={{ opacity: 0.15 }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(155,48,255,0.06) 20px, rgba(155,48,255,0.06) 22px)',
              }}
            />
            <div
              className="absolute top-0 left-0 w-16 h-16 bg-accent opacity-80"
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-display font-bold text-white text-6xl lg:text-7xl leading-none">
                  4+
                </div>
                <div className="font-mono text-xs text-gray-400 tracking-widest mt-2 uppercase">
                  Years researching
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-accent text-white px-5 py-2 font-display font-bold text-xs tracking-widest uppercase">
              Researcher / Engineer
            </div>
          </div>

          <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col justify-between gap-10">
            <div>
              <p className="font-body text-base lg:text-lg text-gray-600 leading-relaxed max-w-prose mb-6">
                I'm a CS + Statistics student at Cornell building research software for messy,
                real-world systems: environmental sensing, water-resource modeling, LLM behavior,
                policy analysis, and algorithmic fairness.
              </p>
              <p className="font-body text-base text-gray-500 leading-relaxed max-w-prose">
                Recent work includes particle-based irrigation inference with satellite and
                land-surface data, long-horizon LLM forecasting-agent evaluation, lake-effect snow
                correction models, and educational mapping tools for K-12 social studies curricula.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-0 border-t-2 border-ink">
              {traits.map((trait, i) => (
                <div
                  key={trait.label}
                  className={`p-4 border-b border-gray-200 ${i % 2 === 0 ? 'border-r' : ''}`}
                >
                  <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-1">
                    {trait.label}
                  </div>
                  <div className="font-display font-semibold text-ink text-sm">{trait.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
