import { profile } from '../../data/profile';
import { ButtonLink } from '../ui/Button';
import { SectionHeader } from '../ui/SectionHeader';

const contactLinks = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'GitHub', value: '@haydenmfu', href: profile.github },
  { label: 'LinkedIn', value: '/in/hayden-fu', href: profile.linkedin },
];

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-paper">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <SectionHeader index="05" title="Contact" />

        <div className="relative border-2 border-ink overflow-hidden">
          <div className="absolute inset-0 pattern-halftone" style={{ opacity: 0.06 }} />
          <div
            className="absolute top-0 right-0 w-32 h-32 bg-accent"
            style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-ink">
              <h2 className="font-display font-bold text-ink leading-none mb-6 text-4xl sm:text-5xl lg:text-6xl">
                Let's build
                <br />
                something
                <br />
                <span className="text-accent">sharp.</span>
              </h2>
              <p className="font-body text-gray-500 text-base leading-relaxed max-w-sm">
                Open to research internships, SWE roles, and interesting problems. Email is the
                fastest way to reach me.
              </p>
            </div>

            <div className="p-10 lg:p-16 flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-5">
                {contactLinks.map(({ label, value, href }) => {
                  const isExternal = href.startsWith('http');

                  return (
                    <div key={label} className="flex flex-col gap-1 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">{label}</span>
                      <a
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="link-angular font-display font-semibold text-ink text-base"
                      >
                        {value}
                      </a>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 flex-wrap">
                <ButtonLink size="md" href={`mailto:${profile.email}`}>
                  Send a Message <span aria-hidden>&rarr;</span>
                </ButtonLink>
                <ButtonLink variant="outline" size="md" href={profile.resume} target="_blank" rel="noopener noreferrer">
                  Resume
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-ink flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="label-strip">{profile.name}</span>
            <span className="font-mono text-xs text-gray-400">&copy; 2026</span>
          </div>
          <div className="font-mono text-xs text-gray-300 tracking-widest">
            MADE WITH PRECISION
          </div>
        </div>
      </div>
    </section>
  );
}
