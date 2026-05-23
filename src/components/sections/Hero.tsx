import { Button } from '../ui/Button';

function CornerTriangle({
  position,
  size = 'w-64 h-64',
  color = 'rgba(20, 15, 25, 0.2)',
  pattern = 'pattern-halftone',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  size?: string;
  color?: string;
  pattern?: string;
}) {
  const clipPath = {
    tl: 'polygon(0 0, 100% 0, 0 100%)',
    tr: 'polygon(100% 0, 0 0, 100% 100%)',
    bl: 'polygon(0 100%, 100% 100%, 0 0)',
    br: 'polygon(100% 100%, 0 100%, 100% 0)',
  }[position];

  const gradientDir = {
    tl: '135deg',
    tr: '225deg',
    bl: '45deg',
    br: '315deg',
  }[position];

  const posClass = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }[position];

  return (
    <div className={`absolute ${posClass} ${size} pointer-events-none`} style={{ clipPath }}>
      {/* Solid fill — opaque at corner, transparent toward hypotenuse */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(${gradientDir}, ${color} 0%, transparent 65%)` }}
      />
      {/* Pattern overlay — appears in the mid-zone, fades at both ends */}
      <div
        className={`absolute inset-0 ${pattern}`}
        style={{
          opacity: 0.12,
          maskImage: `linear-gradient(${gradientDir}, transparent 15%, rgba(0,0,0,0.85) 42%, transparent 72%)`,
          WebkitMaskImage: `linear-gradient(${gradientDir}, transparent 15%, rgba(0,0,0,0.85) 42%, transparent 72%)`,
        }}
      />
    </div>
  );
}

function InkSpark({ type, className }: { type: 'diamond' | 'cross' | 'dashes'; className?: string }) {
  if (type === 'diamond') {
    return (
      <svg className={`absolute pointer-events-none ${className}`} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <polygon points="11,2 20,11 11,20 2,11" stroke="#0a0a0a" strokeWidth="1.5" fill="none" />
        <polygon points="11,6 16,11 11,16 6,11" stroke="#0a0a0a" strokeWidth="0.75" fill="none" opacity="0.4" />
      </svg>
    );
  }
  if (type === 'cross') {
    return (
      <svg className={`absolute pointer-events-none ${className}`} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <line x1="2" y1="2" x2="16" y2="16" stroke="#0a0a0a" strokeWidth="1.5" />
        <line x1="16" y1="2" x2="2" y2="16" stroke="#0a0a0a" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg className={`absolute pointer-events-none ${className}`} width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden>
      <line x1="0" y1="16" x2="8" y2="2" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="10" y1="16" x2="18" y2="2" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="20" y1="16" x2="28" y2="2" stroke="#0a0a0a" strokeWidth="1.5" />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-paper border-b-3 border-ink"
    >
      {/* Corner triangle decorations */}
      <CornerTriangle position="tr" size="w-80 h-80" color="rgba(22, 16, 30, 0.18)" pattern="pattern-halftone" />
      <CornerTriangle position="bl" size="w-56 h-56" color="rgba(38, 18, 20, 0.15)" pattern="pattern-checker" />

      {/* Ink spark accents */}
      <InkSpark type="diamond" className="top-[18%] left-[42%] opacity-20" />
      <InkSpark type="cross"   className="top-[65%] right-[28%] opacity-15 hidden lg:block" />
      <InkSpark type="dashes"  className="bottom-[22%] left-[18%] opacity-20 hidden sm:block" />

      {/* Accent color bar — top left */}
      <div className="absolute top-0 left-0 w-1 h-full bg-accent hidden lg:block" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">

          {/* Left — main copy */}
          <div className="flex-1 max-w-3xl">
            {/* Status badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="label-strip">Open to Internships</span>
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span className="font-mono text-xs text-gray-400 tracking-widest">2026</span>
            </div>

            {/* Name */}
            <h1
              className="font-display font-bold text-ink leading-none mb-6"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '-0.02em' }}
            >
              Hayden
              <br />
              <span className="relative inline-block">
                Fu
                <span
                  className="absolute left-0 bottom-1 h-3 bg-accent"
                  style={{ width: '100%', zIndex: -1, opacity: 0.35 }}
                />
              </span>
              <span className="text-accent">.</span>
            </h1>

            <p className="font-body text-lg lg:text-xl text-gray-500 max-w-xl leading-relaxed mb-10">
              CS + Statistics at Cornell. I research and build at the intersection of machine
              learning, policy data analysis, and cybersecurity — from climate forecasting
              models to algorithmic fairness audits.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Button size="lg" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
                View Work →
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Get in Touch
              </Button>
            </div>
          </div>

          {/* Right — decorative panel stack */}
          <div className="relative w-full lg:w-72 h-72 flex-shrink-0 hidden lg:block">
            <div className="absolute inset-0 border-2 border-ink bg-paper-mid translate-x-3 translate-y-3" />
            <div className="absolute inset-0 pattern-dot-grid border-2 border-ink" style={{ opacity: 0.12 }} />
            <div className="absolute bottom-4 left-4 right-4 bg-ink text-white p-5 font-display">
              <div className="text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Languages</div>
              <div className="flex flex-wrap gap-2">
                {['Python', 'C++', 'Java', 'R', 'SQL', 'OCaml'].map((tag) => (
                  <span key={tag} className="border border-gray-600 text-gray-200 text-xs px-2 py-0.5 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-accent" />
          </div>
        </div>

        {/* Bottom decoration row */}
        <div className="mt-16 pt-6 border-t-2 border-ink flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="https://github.com/haydenmfu" target="_blank" rel="noopener noreferrer"
              className="link-angular font-mono text-xs text-gray-400 hover:text-ink transition-colors">
              GitHub
            </a>
            <a href="mailto:haydenmfu@gmail.com"
              className="link-angular font-mono text-xs text-gray-400 hover:text-ink transition-colors">
              Email
            </a>
            <a href="#" className="link-angular font-mono text-xs text-gray-400 hover:text-ink transition-colors">
              LinkedIn
            </a>
          </div>
          <div className="font-mono text-xs text-gray-300 tracking-widest hidden sm:block">
            SCROLL ↓
          </div>
        </div>
      </div>
    </section>
  );
}
