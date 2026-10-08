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
    description: "I built a Python and Azure AI Foundry pipeline connecting market data, historical order books, news retrieval, and LLM inference. I designed time-aware evidence selection with embeddings and reranking, then built evaluation workflows to compare forecast behavior across context conditions. Our study evaluated three open-weight models on 100 markets and used linear probes and counterfactual interventions to investigate calibration and drift. The paper was accepted to the Interpreting Agent Behavior workshop at NeurIPS 2026.",
    type: 'research',
  },
  {
    org: "Cornell University, Civil Engineering",
    role: "Data Specialist",
    period: "Jun 2026 – Present",
    description: "I build reusable Python modules for processing multi-source data and automating experiments. My pipeline aligns satellite observations, simulation outputs, and geospatial boundaries, launches simulations on Cornell's SLURM cluster, and scores their outputs against observations. I implemented probabilistic sampling and particle-weighting algorithms, added validation and extraction workflows, and refactored diagnostics to make results easier to reproduce. The application is estimating irrigation from incomplete observations.",
    type: 'research',
  },
  {
    org: "Cornell Geo Data",
    role: "ML Research Engineer",
    period: "Nov 2025 – Present",
    description: "I develop Python tools for extracting and validating model outputs and sensor time series. I organized spatial sampling and feature extraction into reusable functions and reduced redundant lookups. I also built a PyTorch forecasting model and prepared the evaluation data, applying these tools to lake-effect snow and short-term weather forecasts.",
    type: 'research',
  },
  {
    org: "Harvard Institute of Quantitative Social Sciences",
    role: "Research Intern",
    period: "Jun 2024 – Aug 2024",
    description: "I analyzed housing and policy datasets with difference-in-differences regression to evaluate policy effects. The work involved translating a policy question into a statistical comparison and interpreting the resulting evidence. The findings were published in the Journal of Student Research.",
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
    description: "I built a data-driven map app with Professor Asif Wilson to help K–12 educators find more than 1,000 teaching resources. I developed a Python and ChatGPT-powered classification pipeline to organize the underlying records and connect them to an accessible map interface.",
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
