import { profile } from '../../data/profile';
import { Button, ButtonLink } from '../ui/Button';

function SleepyDisplay() {
  return (
    <div id="snorlax-display" className="snorlax-stage" aria-label="A sleeping Snorlax inspired illustration, with space for a future interactive display">
      <span className="sleep-z sleep-z-one" aria-hidden="true">z</span>
      <span className="sleep-z sleep-z-two" aria-hidden="true">z</span>
      <span className="sleep-z sleep-z-three" aria-hidden="true">Z</span>
      <svg className="snorlax-art" viewBox="0 0 700 560" role="img" aria-label="Sleeping Snorlax at a laptop">
        <ellipse cx="356" cy="525" rx="307" ry="22" fill="#203b43" opacity=".16" />
        {/* The extended arm and uneven silhouette give the figure some movement. */}
        <path d="M247 226C174 225 92 252 48 292c-20 19-20 53 15 65 50 18 110 2 168-26l65-63Z" fill="#2c7296" stroke="#193d51" strokeWidth="7" strokeLinejoin="round" />
        <path d="M56 327c45 20 113 5 161-22" fill="none" stroke="#1e5875" strokeWidth="8" strokeLinecap="round" />
        <path d="M57 323l-14-8 5 17-14 5 18 4 2 15 10-15" fill="#f6efc5" stroke="#193d51" strokeWidth="4" strokeLinejoin="round" />
        <path d="M217 244c-45 40-65 112-40 176 27 67 99 93 187 92 103-1 191-17 231-91 34-62 16-147-32-193-71-65-265-72-346 16Z" fill="#2b7398" stroke="#193d51" strokeWidth="8" />
        <path d="M234 356c-14-71 28-128 103-151 97-30 187 11 214 95 26 82-10 165-85 191-78 27-176 11-211-49-12-20-18-49-21-86Z" fill="#f1e9b9" stroke="#193d51" strokeWidth="6" />
        <path d="M275 268c-41 46-43 113-20 168 17 38 50 57 77 64-44-6-77-26-94-60-31-60-30-133 37-172Z" fill="#d9d0a7" opacity=".85" />
        {/* Ears, rounded face, and tiny teeth. */}
        <path d="M216 120c-17-35-25-71-19-96 32-3 64 10 97 31 39-16 87-16 125-1 35-25 62-36 91-34 4 32-2 70-14 100 30 58 15 110-33 137-68 38-188 32-239-20-34-35-39-76-8-117Z" fill="#2c769c" stroke="#193d51" strokeWidth="8" strokeLinejoin="round" />
        <path d="M210 39c18 0 36 8 55 18-7 22-18 38-39 52-10-24-16-47-16-70Zm289-2c-22 0-44 10-60 23 12 14 23 30 40 44 11-22 18-46 20-67Z" fill="#205b7e" />
        <path d="M246 156c32-12 60-13 76-11 12 24 31 35 43 39 15-11 25-27 32-41 42-6 79 10 96 46-1 36-28 67-69 81-55 20-140 12-185-21-26-19-32-68 7-93Z" fill="#f1e9b9" stroke="#193d51" strokeWidth="6" strokeLinejoin="round" />
        <path d="M258 181c16 13 43 18 65 10m76-2c23 7 47 2 65-11" fill="none" stroke="#193d51" strokeWidth="5" strokeLinecap="round" />
        <path d="M339 230c18 7 37 7 55-1" fill="none" stroke="#193d51" strokeWidth="5" strokeLinecap="round" />
        <path d="m340 229 7 13 8-12m29 0 8 12 6-15" fill="#fffaf0" stroke="#193d51" strokeWidth="3" strokeLinejoin="round" />
        <path d="M224 188c-20 36-10 65 13 81m260-81c17 35 7 66-18 81" fill="none" stroke="#184964" strokeWidth="5" />
        {/* One arm rests across the belly; the other drops beside it. */}
        <path d="M266 270c57 24 91 65 75 95-13 24-48 19-80-3-32-22-49-54-43-74 5-17 22-24 48-18Z" fill="#f1e9b9" stroke="#193d51" strokeWidth="6" />
        <path d="M548 259c46 8 64 53 56 109-5 38-30 69-58 60-33-10-43-49-37-88 5-44 14-74 39-81Z" fill="#2c7296" stroke="#193d51" strokeWidth="7" />
        <path d="m552 422-5 17 13-10 6 15 5-17" fill="#f1e9b9" stroke="#193d51" strokeWidth="3" strokeLinejoin="round" />
        {/* The large paws frame the laptop. */}
        <path d="M185 420c-34-10-67 4-77 34-13 39 18 72 68 83 45 10 73-13 76-43 4-30-27-63-67-74Z" fill="#f1e9b9" stroke="#193d51" strokeWidth="7" />
        <path d="M170 469c-20-1-34 11-35 26-1 17 15 31 37 34 26 3 41-9 40-26-1-18-18-33-42-34Z" fill="#956e4a" stroke="#193d51" strokeWidth="4" />
        <path d="M120 434l-8-20 18 10m22-7-3-22 17 18m19 1 5-21 11 26" fill="#f1e9b9" stroke="#193d51" strokeWidth="4" strokeLinejoin="round" />
        <path d="M603 422c35-11 67 4 76 35 12 41-17 74-65 82-46 7-75-15-76-47-1-32 26-59 65-70Z" fill="#f1e9b9" stroke="#193d51" strokeWidth="7" />
        <path d="M612 469c20 0 35 11 36 27 1 17-15 30-38 32-26 2-40-11-39-27 1-18 17-31 41-32Z" fill="#956e4a" stroke="#193d51" strokeWidth="4" />
        <path d="m562 425 5-22 13 20m20-20 11-21 7 24m18 0 18-17-1 24" fill="#f1e9b9" stroke="#193d51" strokeWidth="4" strokeLinejoin="round" />
        {/* Plain laptop, coffee, and a small ball echo the supplied reference. */}
        <path d="M280 390h278l-18 126H302Z" fill="#a4adb0" stroke="#193d51" strokeWidth="6" strokeLinejoin="round" />
        <path d="M300 515h250l-9 9H309Z" fill="#879396" stroke="#193d51" strokeWidth="4" />
        <path d="M82 475h55l-6 50H88Z" fill="#b58a60" stroke="#193d51" strokeWidth="4" />
        <path d="M76 470h67l-6 12H82Z" fill="#f8f5e9" stroke="#193d51" strokeWidth="4" />
        <path d="M84 459c12-10 42-11 52-1l2 12H82Z" fill="#f8f5e9" stroke="#193d51" strokeWidth="4" />
        <circle cx="553" cy="515" r="27" fill="#f8f5e9" stroke="#193d51" strokeWidth="5" />
        <path d="M527 511a27 27 0 0 1 52 0Z" fill="#d75b50" stroke="#193d51" strokeWidth="4" />
        <path d="M527 511h52" stroke="#193d51" strokeWidth="5" /><circle cx="553" cy="513" r="7" fill="#f8f5e9" stroke="#193d51" strokeWidth="3" />
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
