export type ExperienceType = 'research' | 'work' | 'club';

export interface ExperienceEntry {
  org: string;
  role: string;
  period: string;
  bullets: string[];
  type: ExperienceType;
}

export const experience: ExperienceEntry[] = [
  // ── Research ──────────────────────────────────────────────────────────────
  {
    org: 'Cornell Geo Data',
    role: 'Researcher',
    period: 'Nov 2025 – Present',
    type: 'research',
    bullets: [
      'Developing a correctional ML model for lake-effect snow forecasting near the Finger Lakes using HRRR numerical weather predictions and GAN-based optimization.',
      'Conducting fieldwork to deploy, maintain, and collect data from buoys and tree sap flow sensors.',
      'Designed water buoy schematic using Autodesk Inventor.',
    ],
  },
  {
    org: 'Harvard Institute of Quantitative Social Sciences',
    role: 'Research Intern',
    period: 'Jun 2024 – Aug 2024',
    type: 'research',
    bullets: [
      'Applied difference-in-differences regressions to assess encampment-ban policy impacts using HUD homeless data and Census statistics.',
      'Identified penalties, enforcement constraints, and shelter access as key determinants of homelessness outcomes.',
      'Published findings in Journal of Student Research.',
    ],
  },
  {
    org: 'Aspiring Scholars Directed Research Program',
    role: 'Research Intern',
    period: 'Jan 2023 – Jun 2024',
    type: 'research',
    bullets: [
      'Developed 5 custom Constitutional AI principles to reduce political bias in ChatGPT-3.5, tested across 300+ expert-approved political prompts.',
      'Published in Journal of Emerging Investigators; presented at Southern California Conference for Undergraduate Research.',
    ],
  },
  {
    org: 'Inspirit AI',
    role: 'Student Researcher',
    period: 'Apr 2024 – Jun 2024',
    type: 'research',
    bullets: [
      'Analyzed bias in the COMPAS recidivism prediction system using logistic regression across age, gender, and racial groups.',
    ],
  },
  {
    org: 'University of California, Davis',
    role: 'Undergraduate Researcher',
    period: 'Feb 2022 – Feb 2023',
    type: 'research',
    bullets: [
      'Studied media coverage of abortion policies under Prof. Drew Halfmann. Mined TDM archive articles to track trends from 1870–2021.',
      'Used Python (matplotlib) to extract, categorize, and visualize abortion organization prominence over time.',
    ],
  },
  {
    org: 'Fremont LEAF Garden',
    role: 'Student Researcher',
    period: 'Feb 2022 – Aug 2022',
    type: 'research',
    bullets: [
      'Built a Raspberry Pi-based program to analyze soil elemental composition.',
      'Built an ML model to forecast garden yield and optimize regenerative gardening strategies.',
    ],
  },
  // ── Work ──────────────────────────────────────────────────────────────────
  {
    org: 'University of Illinois, Urbana-Champaign',
    role: 'Research Intern, College of Education',
    period: 'Sep 2023 – May 2024',
    type: 'work',
    bullets: [
      'Built a customizable map app for the I3 project under Prof. Asif Wilson, giving K–12 teachers access to 1000+ cultural and historical resources.',
      'Automated resource classification and tag precision using ChatGPT-powered pre/post-processing.',
    ],
  },
  {
    org: 'Mathnasium Learning Center',
    role: 'Math Instructor',
    period: 'Feb 2025 – Aug 2025',
    type: 'work',
    bullets: [
      'Delivered individualized instruction to small groups (2–3 students), adapting problem-solving strategies to diverse learning styles.',
    ],
  },
  // ── Clubs ─────────────────────────────────────────────────────────────────
  {
    org: 'Cornell Cybersecurity Club',
    role: 'Competition Team Member',
    period: 'Sep 2025 – Present',
    type: 'club',
    bullets: [
      'Competed in CTF competitions spanning binary exploitation, cryptography, reverse engineering, and network security.',
      'Placed 1st at Bsides NYC CTF; also competed in AmateursCTF, OSU CTF, and Buckeye CTF.',
    ],
  },
];
