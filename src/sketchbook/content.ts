import { about } from '../data/about';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

export interface Art {
  sketch: string;   // pencil render, or any picture that should stand at the stop
  photo?: string;   // the photograph a pencil render was drawn from, same size, shown as a strip of colour
  ratio: number;    // width / height
  sheet?: boolean;  // a document page: stands with crisp edges instead of fading out like a drawing
  caption?: string; // what this picture is, shown under it when a stop has several
}

export interface Stop {
  title: string;
  meta: string;
  body: string[];
  when?: string;    // shown in place of the stop's number where the date says more
  tags?: string[];
  links?: { href: string; label: string }[];
  team?: string;    // how the stop is tied to Cornell Geo Data, shown beside the team's mark and linked to its site
  art?: Art;        // the picture that stands beside the line; stops without one stand as blank sheets
  more?: Art[];     // further pictures, turned to once the stop is open
}

export interface Section {
  id: SectionId;
  label: string;
  color: string;    // the ribbon, and the line you walk
  backdrop?: { src: string; ratio: number };   // a faint pencil skyline at the horizon of the line
  stops: Stop[];
}

export type SectionId = 'about' | 'projects' | 'research' | 'resume';

const plate = (name: string, ratio = 0.75, caption?: string): Art => ({
  sketch: `/sketchbook/plates/${name}_s.webp`,
  photo: `/sketchbook/plates/${name}_p.webp`,
  ratio,
  caption,
});
// A plot or a screenshot: shown whole and in its own colours. Its colours carry its meaning, so it is the one
// kind of picture here that is not turned to pencil.
const figure = (name: string, ratio: number, caption?: string): Art => ({ sketch: `/sketchbook/plates/${name}.webp`, ratio, caption, sheet: true });
export const pictures = (stop: Stop): Art[] => (stop.art ? [stop.art, ...(stop.more ?? [])] : []);

// Cornell Geo Data: the project team I am part of.
export const geoData = { name: 'Cornell Geo Data', href: 'https://cornellgeodata.com/', logo: '/sketchbook/geodata.png' };

// When each piece of work was done, from the résumés and the dates on the photographs.
const WHEN: Record<string, string> = {
  'SASH: Search Across Six Hops': 'Oct 2026',
  'LLM Prediction Markets': 'May – Aug 2026',
  'Irrigation Data Assimilation': 'Jun – Aug 2026',
  'Lake-Effect Snow Forecasting': 'Since Nov 2025',
};

const project = (title: string): Stop => {
  const p = projects.find(q => q.title === title)!;
  return { title: p.title, when: WHEN[p.title], meta: `${p.category} / ${p.year}`, body: [p.description], tags: p.tags, links: p.link ? [{ href: p.link, label: p.linkLabel ?? 'Read more' }] : undefined };
};
const sentences = (text: string) => text.split(/(?<=\.)\s+/);

// About: who, what, lately, where, what next, and how to reach me. One thing per stop.
const aboutStops: Stop[] = [
  { title: profile.name, meta: `${profile.school} / ${profile.degree}`, body: [about.story[0]], art: plate('portrait') },
  { title: 'What I build', meta: 'Software, data pipelines, AI evaluation', body: [about.story[1]], art: plate('build') },
  { title: 'Lately', meta: '2026', body: [about.current[0]], art: plate('lately') },
  { title: 'Where I am', meta: profile.location, body: [`I study ${profile.degree.toLowerCase()} at ${profile.school}. I'm in ${profile.location.replace('; the', ', and the')}.`, `On campus I'm part of ${geoData.name}, a Cornell project team.`], team: 'Member of Cornell Geo Data', art: plate('tower') },
  { title: 'What I am looking for', meta: profile.availability, body: [about.current[1]], art: plate('window') },
  {
    title: 'Grab me a coffee',
    meta: profile.email,
    body: [sentences(about.contact).slice(-1)[0]],
    art: plate('coffee'),
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
    when: 'Nov 2026',
    meta: 'MIT Energy & Climate Hack / November 2026',
    body: [
      'Our team built a connectivity system for fleets of robots building remote solar sites, with a deterministic 3D simulator that runs in the browser. A Wi-Fi HaLow mesh carries data and LoRa carries safety messages.',
      'I built the simulation engine and framework, the task coordination, and the visual models. In simulation, disconnections fell from as much as 61% to 2% or less.',
    ],
    tags: ['TypeScript', 'three.js', 'Vite', 'Cloudflare Workers'],
    links: [{ href: 'https://thehive.boston/', label: 'See The Hive' }],
    team: 'Built with teammates from Cornell Geo Data',
    art: plate('hack', 0.667, 'At the hack'),
    more: [
      figure('hive1', 1.982, 'The simulator: scouting a site'),
      figure('hive3', 1.962, 'A scout on its survey path'),
    ],
  },
  {
    ...project('SASH: Search Across Six Hops'),
    art: plate('sash_team', 0.75, 'The team at Big Red Hacks'),
    more: [figure('sixhops', 1.957, 'The demo screen'), plate('sash_raffle', 0.75, 'Winning the raffle at the closing ceremony'), plate('sash', 0.75, 'The prize')],
  },
  {
    title: 'Pencil sketches from photographs',
    when: 'Nov 2026',
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
    when: 'Since Oct 2026',
    meta: 'Personal project / ongoing',
    body: [
      'A matchmaking app where you design your own matching algorithm. You build a formula, a graph of questions that leads from a start to an end, and it decides who is compatible with you. Your rules stay private.',
      'It is a personal prototype, not a live service: accounts, a visual formula editor with four kinds of question, a review queue and mutual matching, with an auto-layout of my own for the graph. I am reworking its design now.',
    ],
    tags: ['JavaScript', 'Node.js', 'SQLite', 'SVG'],
    art: figure('dive1', 1.6, "A step on someone's path"),
    more: [figure('dive2', 1.6, 'Picking your fish: all anyone sees of you before a match')],
  },
];

// Research: work done with a lab or a research group.
const researchStops: Stop[] = [
  {
    ...project('LLM Prediction Markets'),
    art: figure('drift', 1.437, 'Mean forecast as the evidence arrives'),
    more: [
      figure('drift2', 1.714, 'Forecasts split by how each market resolved'),
      figure('drift3', 2.878, 'How strongly an earlier forecast anchors the next'),
    ],
  },
  {
    title: 'Weather Quant',
    when: 'Nov 2026',
    meta: 'Forecasting / Commodity Markets / 2026',
    body: [
      'Do weather forecasts give an edge in December corn futures? I built an engine that turns a weather forecast over US corn acreage into news about the national corn yield. A county-level yield model, fitted walk-forward on 1981–2025 USDA yields and gridMET weather, gives the expected yield from the weather so far, and every member of a forecast ensemble is run through it to give the expected revision a week ahead.',
      'Pre-registered tests then asked whether that news predicts corn futures returns, using GEFS, ECMWF and the AI weather model Aurora. Mostly it does not: the market prices public forecast news the day it arrives, and a better weather model disagreeing with GEFS did not predict returns. The monitor shown here replays any season from 2000 to 2025 day by day.',
    ],
    tags: ['Python', 'NetCDF', 'SLURM', 'Aurora 1.5'],
    team: 'A Cornell Geo Data project',
    art: figure('corn1', 1.746, 'The signal monitor, replaying July 2012'),
    more: [figure('corn2', 2.926, 'How well each forecast matches the weather over corn, by lead time')],
  },
  {
    ...project('Irrigation Data Assimilation'),
    art: figure('particles', 1.423, 'Soil moisture and inferred irrigation'),
    more: [figure('workflow', 2.217, 'The estimation loop, window by window')],
  },
  {
    ...project('Lake-Effect Snow Forecasting'),
    team: 'A Cornell Geo Data project',
    art: figure('scatter', 1.6, 'Wind speed against temperature'),
    more: [plate('snow', 1.333, 'First snow on campus')],
  },
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

const ABOUT_SKY = 10.3, RESEARCH_SKY = 9.6, PROJECTS_SKY = 5.7;   // width / height of the two skyline strips

// Ribbon colours: the mustard and blue are sampled from the photographs, the green and rust are close to them.
export const sections: Record<SectionId, Section> = {
  about: { id: 'about', label: 'About', color: '#5f7d3c', stops: aboutStops, backdrop: { src: '/sketchbook/backdrops/about.webp', ratio: ABOUT_SKY } },
  projects: { id: 'projects', label: 'Projects', color: '#c9960f', stops: projectStops, backdrop: { src: '/sketchbook/backdrops/projects.webp', ratio: PROJECTS_SKY } },
  research: { id: 'research', label: 'Research', color: '#b6532a', stops: researchStops, backdrop: { src: '/sketchbook/backdrops/research.webp', ratio: RESEARCH_SKY } },
  resume: { id: 'resume', label: 'Résumé', color: '#2f4a8a', stops: resumeStops },
};

export const sectionOrder: SectionId[] = ['about', 'projects', 'research', 'resume'];
export const ownerName = profile.name;
