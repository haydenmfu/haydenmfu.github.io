export type ExperienceType = 'research' | 'work' | 'club';

export interface ExperienceEntry {
  org: string;
  role: string;
  period: string;
  description: string;
  type: ExperienceType;
}

export const experience: ExperienceEntry[] = [
  {
    org: "Algoverse LLM Research Group",
    role: "Applied AI Engineer",
    period: "May 2026 – Present",
    description: "I built the forecasting pipeline for our study of how LLM predictions change over time, using Python and Azure AI Foundry to align prediction-market data with news evidence. I evaluated three open-weight models across 100 sequential forecasting tasks, using linear probes and counterfactual interventions to examine calibration and drift. The resulting paper was accepted to the IAB workshop at NeurIPS 2026.",
    type: 'research',
  },
  {
    org: "Cornell University, Civil Engineering",
    role: "Data Specialist",
    period: "Jun 2026 – Present",
    description: "I develop Python workflows for estimating irrigation from satellite observations and model outputs. I built the particle-based inference pipeline and the preprocessing and calibration steps needed to align the datasets across time and location, using tools including xarray, pandas, and NetCDF. I also used Claude Code to help debug and refactor the diagnostics, making the experiments easier to understand and reproduce.",
    type: 'research',
  },
  {
    org: "Cornell Geo Data",
    role: "ML Research Engineer",
    period: "Nov 2025 – Present",
    description: "I work with sensor observations and numerical weather predictions to improve short-term forecasting. I built a GAN-based correction model in Python and PyTorch, and prepared the sensor data used to evaluate it by cleaning and validating the raw time series.",
    type: 'research',
  },
  {
    org: "Harvard Institute of Quantitative Social Sciences",
    role: "Research Intern",
    period: "Jun 2024 – Aug 2024",
    description: "I studied the effects of encampment-ban policies using housing and policy data. I applied difference-in-differences regression to estimate how outcomes changed following the policies, with the findings published in the Journal of Student Research.",
    type: 'research',
  },
  {
    org: "Aspiring Scholars Directed Research Program",
    role: "Independent LLM Researcher",
    period: "Jan 2023 – Jun 2024",
    description: "I researched whether prompting strategies could reduce political bias in ChatGPT. I designed five approaches and evaluated them across more than 300 prompts, comparing how the model's responses changed under different instructions. The results were published in the Journal of Emerging Investigators.",
    type: 'research',
  },
  {
    org: "Inspirit AI",
    role: "Student Researcher",
    period: "Apr 2024 – Jun 2024",
    description: "I used Python and logistic regression to examine differences in COMPAS predictions across demographic groups, including where the system made different kinds of errors.",
    type: 'research',
  },
  {
    org: "University of California, Davis",
    role: "Undergraduate Researcher",
    period: "Feb 2022 – Feb 2023",
    description: "Working with Professor Drew Halfmann, I analyzed newspaper coverage of abortion policy from 1870 to 2021. I used Python to organize articles and visualize how often different organizations appeared in the coverage over time.",
    type: 'research',
  },
  {
    org: "Fremont LEAF Garden",
    role: "Student Researcher",
    period: "Feb 2022 – Aug 2022",
    description: "I built a Raspberry Pi program to analyze soil measurements and explored machine-learning models for predicting garden yields.",
    type: 'research',
  },
  {
    org: "Mathnasium Learning Center",
    role: "Math Instructor",
    period: "Feb 2025 – Aug 2025",
    description: "I taught math to small groups of two or three students, adjusting explanations and practice problems to what each student needed help with.",
    type: 'work',
  },
  {
    org: "University of Illinois Urbana-Champaign, College of Education",
    role: "Applied AI Developer",
    period: "Sep 2023 – May 2024",
    description: "I worked with Professor Asif Wilson to build a map app giving K–12 educators access to more than 1,000 cultural and historical resources. My work included a Python and ChatGPT-powered classification pipeline to organize the resources for the app.",
    type: 'work',
  },
  {
    org: "Cornell Cybersecurity Club",
    role: "Competition Team Member",
    period: "Sep 2025 – Present",
    description: "I compete with Cornell's cybersecurity team in Capture-the-Flag competitions, working on challenges in areas such as binary exploitation, cryptography, and reverse engineering. Our team placed first at BSides NYC CTF, and I've also competed in AmateursCTF, OSU CTF, and Buckeye CTF.",
    type: 'club',
  },
];
