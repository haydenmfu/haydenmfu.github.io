import { profile } from '../../data/profile';
import { Button, ButtonLink } from '../ui/Button';

function SleepyDisplay() {
  return (
    <div id="snorlax-display" className="snorlax-stage" aria-label="A sleeping Snorlax inspired illustration, with space for a future interactive display">
      <span className="sleep-z sleep-z-one" aria-hidden="true">z</span>
      <span className="sleep-z sleep-z-two" aria-hidden="true">z</span>
      <span className="sleep-z sleep-z-three" aria-hidden="true">Z</span>
      <svg className="snorlax-art" viewBox="0 0 520 500" role="img" aria-label="Sleeping Snorlax illustration">
        <ellipse cx="260" cy="445" rx="185" ry="27" fill="#203b43" opacity=".12" />
        <path d="M109 230 Q66 213 65 279 Q63 338 112 360 L150 334Z" fill="#357d85" stroke="#203b43" strokeWidth="8" />
        <path d="M411 230 Q454 213 455 279 Q457 338 408 360 L370 334Z" fill="#357d85" stroke="#203b43" strokeWidth="8" />
        <ellipse cx="260" cy="295" rx="158" ry="143" fill="#357d85" stroke="#203b43" strokeWidth="9" />
        <ellipse cx="260" cy="319" rx="111" ry="105" fill="#f4edda" />
        <path d="M153 95 L137 28 Q177 30 202 70Z" fill="#357d85" stroke="#203b43" strokeWidth="8" strokeLinejoin="round" />
        <path d="M367 95 L383 28 Q343 30 318 70Z" fill="#357d85" stroke="#203b43" strokeWidth="8" strokeLinejoin="round" />
        <ellipse cx="260" cy="137" rx="116" ry="100" fill="#357d85" stroke="#203b43" strokeWidth="9" />
        <path d="M165 151 Q260 106 355 151 Q345 223 260 227 Q175 223 165 151" fill="#f4edda" />
        <path d="M190 140 Q209 155 228 139 M292 139 Q311 155 330 140" fill="none" stroke="#203b43" strokeWidth="7" strokeLinecap="round" />
        <path d="M247 167 Q260 177 273 167 M232 189 Q260 208 288 189" fill="none" stroke="#203b43" strokeWidth="6" strokeLinecap="round" />
        <path d="M225 188 L233 209 L240 194 M280 194 L287 209 L295 188" fill="#fffaf0" stroke="#203b43" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="135" cy="394" rx="67" ry="45" transform="rotate(-25 135 394)" fill="#f4edda" stroke="#203b43" strokeWidth="8" />
        <ellipse cx="385" cy="394" rx="67" ry="45" transform="rotate(25 385 394)" fill="#f4edda" stroke="#203b43" strokeWidth="8" />
        <g fill="#9d7377"><ellipse cx="111" cy="389" rx="13" ry="17"/><ellipse cx="134" cy="371" rx="11" ry="15"/><ellipse cx="158" cy="382" rx="11" ry="15"/><ellipse cx="129" cy="410" rx="23" ry="15"/><ellipse cx="409" cy="389" rx="13" ry="17"/><ellipse cx="386" cy="371" rx="11" ry="15"/><ellipse cx="362" cy="382" rx="11" ry="15"/><ellipse cx="391" cy="410" rx="23" ry="15"/></g>
      </svg>
      <span className="stage-caption">A little room to recharge</span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[92svh] flex flex-col justify-center overflow-hidden bg-paper border-b-3 border-ink">
      <div className="absolute inset-0 pointer-events-none opacity-20 pattern-halftone" />
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 pb-12">
        <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="label-strip">Open to {profile.availability}</span>
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span className="font-mono text-xs text-ink/60 tracking-widest">2026</span>
            </div>
            <h1 className="font-display font-black text-ink leading-[.95] mb-6 text-6xl sm:text-7xl lg:text-8xl xl:text-9xl">
              Hayden<br /><span className="text-accent">Fu.</span>
            </h1>
            <p className="font-body text-lg lg:text-xl text-ink/75 max-w-xl leading-relaxed mb-10">
              CS + Statistics at Cornell. I research and build at the intersection of machine learning, water systems, policy data analysis, and cybersecurity.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="lg" type="button" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>View Work <span aria-hidden>&rarr;</span></Button>
              <ButtonLink variant="outline" size="lg" href={profile.resume} target="_blank" rel="noopener noreferrer">Resume</ButtonLink>
            </div>
          </div>
          <SleepyDisplay />
        </div>
        <div className="mt-14 pt-6 border-t-2 border-ink flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-angular font-body font-bold text-sm text-ink/70 hover:text-ink transition-colors">GitHub</a>
            <a href={`mailto:${profile.email}`} className="link-angular font-body font-bold text-sm text-ink/70 hover:text-ink transition-colors">Email</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="link-angular font-body font-bold text-sm text-ink/70 hover:text-ink transition-colors">LinkedIn</a>
          </div>
          <div className="font-mono text-xs text-ink/50 tracking-widest hidden sm:block">SCROLL &darr;</div>
        </div>
      </div>
    </section>
  );
}
