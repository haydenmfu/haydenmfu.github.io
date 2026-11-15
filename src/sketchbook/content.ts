import { about } from '../data/about';
import { experience } from '../data/experience';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

export interface Art {
  sketch: string;   // pencil render
  photo?: string;   // the photograph it was drawn from, same size, shown as a strip of colour
  ratio: number;    // width / height
}

export interface Stop {
  title: string;
  meta: string;
  body: string[];
  tags?: string[];
  links?: { href: string; label: string }[];
  art?: Art;        // stops without art stand as blank sheets until a drawing exists
}

export interface Section {
  id: SectionId;
  label: string;
  color: string;    // the ribbon, and the line you walk
  stops: Stop[];
}

export type SectionId = 'about' | 'projects' | 'events' | 'resume';

const plate = (name: string, ratio = 0.75): Art => ({
  sketch: `/sketchbook/plates/${name}_s.webp`,
  photo: `/sketchbook/plates/${name}_p.webp`,
  ratio,
});

const aboutStops: Stop[] = [
  { title: profile.name, meta: `${profile.school} / ${profile.degree}`, body: about.story, art: plate('killian') },
  { title: 'Right now', meta: profile.location, body: about.current },
  {
    title: 'Say hello',
    meta: profile.availability,
    body: [about.contact],
    links: [
      { href: `mailto:${profile.email}`, label: profile.email },
      { href: profile.github, label: 'GitHub' },
      { href: profile.linkedin, label: 'LinkedIn' },
    ],
  },
];

const projectStops: Stop[] = projects.map(p => ({
  title: p.title,
  meta: `${p.category} / ${p.year}`,
  body: [p.description],
  tags: p.tags,
  links: p.link ? [{ href: p.link, label: p.linkLabel ?? 'Read more' }] : undefined,
}));

const eventStops: Stop[] = [
  {
    title: 'MIT Energy & Climate Hack',
    meta: '6 to 8 November 2026 / Exowatt track',
    body: [
      'Our team built The Hive: a connectivity system for fleets of robots building remote solar sites, with a deterministic 3D simulator that runs in the browser. A Wi-Fi HaLow mesh carries data and LoRa carries safety messages.',
      'I built the simulation engine and framework, the task coordination, and the visual models. In simulation, disconnections fell from as much as 61% to 2% or less.',
    ],
    tags: ['TypeScript', 'three.js', 'Vite', 'Cloudflare Workers'],
    links: [{ href: 'https://thehive.boston/', label: 'See The Hive' }],
    art: plate('hack', 0.667),
  },
  { title: 'Dusk, the first evening', meta: '6 November 2026', body: ['From the weekend of the hack.'], art: plate('dusk') },
  { title: 'The last afternoon', meta: '8 November 2026', body: ['From the weekend of the hack.'], art: plate('street') },
  {
    title: 'Big Red Hacks',
    meta: 'October 2026 / Capital One and Solana track winner',
    body: ['Our team built SASH, Search Across Six Hops: it finds a person by their attributes through a chain of referral links and splits a reward across the chain. It won the Capital One Nessie track and the Solana track.'],
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Solana devnet'],
  },
  {
    title: 'BSides NYC CTF',
    meta: 'Cornell Cybersecurity Club',
    body: ['Our team placed first. I have also competed in AmateursCTF, OSU CTF and BuckeyeCTF with the club.'],
  },
];

const resumeStops: Stop[] = [
  ...experience.map(e => ({ title: e.org, meta: `${e.role} / ${e.period}`, body: [e.description] })),
  {
    title: 'The résumé itself',
    meta: 'PDF',
    body: ['The same story on one page.'],
    links: [
      { href: profile.resume, label: 'Software engineering résumé' },
      { href: profile.resumeDataAnalytics, label: 'Data analytics résumé' },
    ],
  },
];

// Ribbon colours: the mustard and blue are sampled from the photographs, the green and rust are close to them.
export const sections: Record<SectionId, Section> = {
  about: { id: 'about', label: 'About', color: '#5f7d3c', stops: aboutStops },
  projects: { id: 'projects', label: 'Projects', color: '#c9960f', stops: projectStops },
  events: { id: 'events', label: 'Events', color: '#b6532a', stops: eventStops },
  resume: { id: 'resume', label: 'Résumé', color: '#2f4a8a', stops: resumeStops },
};

export const sectionOrder: SectionId[] = ['about', 'projects', 'events', 'resume'];
export const ownerName = profile.name;
