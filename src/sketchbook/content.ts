import { about } from '../data/about';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

export interface Art {
  sketch: string;   // pencil render, or any picture that should stand at the stop
  photo?: string;   // the photograph a pencil render was drawn from, same size, shown as a strip of colour
  ratio: number;    // width / height
  sheet?: boolean;  // a document page: stands with crisp edges instead of fading out like a drawing
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
  backdrop?: { src: string; ratio: number };   // a faint pencil skyline at the horizon of the line
  stops: Stop[];
}

export type SectionId = 'about' | 'projects' | 'research' | 'resume';

const plate = (name: string, ratio = 0.75): Art => ({
  sketch: `/sketchbook/plates/${name}_s.webp`,
  photo: `/sketchbook/plates/${name}_p.webp`,
  ratio,
});

const project = (title: string): Stop => {
  const p = projects.find(q => q.title === title)!;
  return { title: p.title, meta: `${p.category} / ${p.year}`, body: [p.description], tags: p.tags, links: p.link ? [{ href: p.link, label: p.linkLabel ?? 'Read more' }] : undefined };
};
const sentences = (text: string) => text.split(/(?<=\.)\s+/);

// About: who, what, lately, where, what next, and how to reach me. One thing per stop.
const aboutStops: Stop[] = [
  { title: profile.name, meta: `${profile.school} / ${profile.degree}`, body: [about.story[0]], art: plate('portrait') },
  { title: 'What I build', meta: 'Software, data pipelines, AI evaluation', body: [about.story[1]], art: plate('build') },
  { title: 'Lately', meta: '2026', body: [about.current[0]], art: plate('lately') },
  { title: 'Where I am', meta: profile.location, body: [`I study ${profile.degree.toLowerCase()} at ${profile.school}. I'm in ${profile.location.replace('; the', ', and the')}.`], art: plate('tower') },
  { title: 'What I am looking for', meta: profile.availability, body: [about.current[1]], art: plate('window') },
  {
    title: 'Say hello',
    meta: profile.email,
    body: [sentences(about.contact).slice(-1)[0]],
    art: plate('hello'),
    links: [
      { href: `mailto:${profile.email}`, label: profile.email },
      { href: profile.github, label: 'GitHub' },
      { href: profile.linkedin, label: 'LinkedIn' },
    ],
  },
];

// Projects: things built for their own sake, and at hackathons.
const projectStops: Stop[] = [
  {
    title: 'The Hive',
    meta: 'MIT Energy & Climate Hack / November 2026',
    body: [
      'Our team built a connectivity system for fleets of robots building remote solar sites, with a deterministic 3D simulator that runs in the browser. A Wi-Fi HaLow mesh carries data and LoRa carries safety messages.',
      'I built the simulation engine and framework, the task coordination, and the visual models. In simulation, disconnections fell from as much as 61% to 2% or less.',
    ],
    tags: ['TypeScript', 'three.js', 'Vite', 'Cloudflare Workers'],
    links: [{ href: 'https://thehive.boston/', label: 'See The Hive' }],
    art: plate('hack', 0.667),
  },
  { ...project('SASH: Search Across Six Hops'), art: plate('sash') },
  {
    title: 'Pencil sketches from photographs',
    meta: 'Personal project / 2026',
    body: [
      'A tool that turns a photograph into a pencil drawing without changing anything in it. A line-art network traces the edges, and the shading is laid in shape by shape with straight strokes, the way it is done by hand. No generative model is involved, so nothing is invented.',
      'Every drawing on this site came out of it, including the book on the cover. Move across this one to see the photograph underneath.',
    ],
    tags: ['Python', 'PyTorch', 'OpenCV'],
    art: plate('street'),
  },
  {
    title: 'Dive',
    meta: 'Personal project / ongoing',
    body: [
      'A matchmaking app where you design your own matching algorithm. You build a formula, a graph of questions that leads from a start to an end, and it decides who is compatible with you. Your rules stay private.',
      'It is a personal prototype, not a live service: accounts, a visual formula editor with four kinds of question, a review queue and mutual matching, with an auto-layout of my own for the graph. I am reworking its design now.',
    ],
    tags: ['JavaScript', 'Node.js', 'SQLite', 'SVG'],
  },
];

// Research: work done with a lab or a research group.
const researchStops: Stop[] = [
  project('LLM Prediction Markets'),
  { ...project('Irrigation Data Assimilation'), art: plate('irrigation') },
  { ...project('Lake-Effect Snow Forecasting'), art: plate('snow', 1.333) },
];

// Résumé: the two documents, nothing else. Everything in them is already on the other lines.
const resumeStops: Stop[] = [
  {
    title: 'Software engineering',
    meta: 'Résumé / PDF',
    body: ['One page, written for software engineering roles.'],
    links: [{ href: profile.resume, label: 'Open the PDF' }],
    art: { sketch: '/resumes/swe.png', ratio: 0.773, sheet: true },
  },
  {
    title: 'Data analytics',
    meta: 'Résumé / PDF',
    body: ['One page, written for data and analytics roles.'],
    links: [{ href: profile.resumeDataAnalytics, label: 'Open the PDF' }],
    art: { sketch: '/resumes/data-analytics.png', ratio: 0.773, sheet: true },
  },
];

const ABOUT_SKY = 10.3, RESEARCH_SKY = 9.6;   // width / height of the two skyline strips

// Ribbon colours: the mustard and blue are sampled from the photographs, the green and rust are close to them.
export const sections: Record<SectionId, Section> = {
  about: { id: 'about', label: 'About', color: '#5f7d3c', stops: aboutStops, backdrop: { src: '/sketchbook/backdrops/about.webp', ratio: ABOUT_SKY } },
  projects: { id: 'projects', label: 'Projects', color: '#c9960f', stops: projectStops },
  research: { id: 'research', label: 'Research', color: '#b6532a', stops: researchStops, backdrop: { src: '/sketchbook/backdrops/research.webp', ratio: RESEARCH_SKY } },
  resume: { id: 'resume', label: 'Résumé', color: '#2f4a8a', stops: resumeStops },
};

export const sectionOrder: SectionId[] = ['about', 'projects', 'research', 'resume'];
export const ownerName = profile.name;
