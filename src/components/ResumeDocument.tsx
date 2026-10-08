import { profile } from '../data/profile';

const roles = [
  {
    org: 'Algoverse LLM Research Group', role: 'Applied AI Engineer', period: 'May 2026 – Present',
    bullets: [
      'Built a time-aligned LLM forecasting pipeline (Python, Azure AI Foundry) combining prediction-market prices, order-book data, and news evidence to measure model calibration and drift.',
      'Evaluated 3 open-weight LLMs across 100 sequential forecasting tasks using linear probes and counterfactual interventions; resulting paper accepted to the IAB workshop at NeurIPS 2026.',
    ],
  },
  {
    org: 'Cornell University, Civil Engineering', role: 'Data Specialist', period: 'Jun 2026 – Present',
    bullets: [
      'Built a particle-filter pipeline in Python (xarray, pandas, NetCDF, scikit-learn) for probabilistic inference over large-scale, multi-source time-series data.',
      'Designed preprocessing and calibration workflows to align noisy satellite observations, model outputs, and geospatial boundaries across multi-day inference windows.',
      "Leveraged Claude Code to debug and refactor the pipeline's diagnostics, improving readability and reproducibility.",
    ],
  },
  {
    org: 'Cornell Geo Data', role: 'ML Research Engineer', period: 'Nov 2025 – Present',
    bullets: [
      'Built a GAN-based corrective ML model (Python, PyTorch) to improve short-term forecast accuracy using sensor and numerical prediction data.',
      'Cleaned and validated raw sensor time-series data to support model evaluation.',
    ],
  },
  {
    org: 'Harvard Institute of Quantitative Social Sciences', role: 'Research Intern', period: 'Jun 2024 – Aug 2024',
    bullets: ['Applied difference-in-differences regression to housing and policy data to evaluate causal effects; published in the Journal of Student Research.'],
  },
  {
    org: 'University of Illinois Urbana-Champaign, College of Education', role: 'Applied AI Developer', period: 'Sep 2023 – May 2024',
    bullets: ['Built a data-driven map app (Python, ChatGPT-powered classification pipeline) giving K-12 educators access to 1,000+ resources.'],
  },
  {
    org: 'Aspiring Scholars Directed Research Program', role: 'Independent LLM Researcher', period: 'Jan 2023 – Jun 2024',
    bullets: ['Designed and evaluated 5 bias-mitigation prompting strategies on ChatGPT across 300+ prompts; published in JEI.'],
  },
  {
    org: 'Cornell Cybersecurity Club', role: 'Competition Team Member', period: 'Sep 2025 – Present',
    bullets: ['Competed in international Capture-the-Flag competitions; placed 1st at BSides NYC CTF (also AmateursCTF, OSU CTF, Buckeye CTF).'],
  },
];

export default function ResumeDocument() {
  return <article className="resume-document" aria-label="Hayden Fu resume">
    <header className="resume-document-head">
      <h2>Hayden Fu</h2>
      <p><a href={`mailto:${profile.email}`}>{profile.email}</a><span aria-hidden="true"> · </span><a href="tel:+16692361795">(669) 236-1795</a><span aria-hidden="true"> · </span><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><span aria-hidden="true"> · </span><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a></p>
    </header>
    <section><h3>Professional summary</h3><p>Computer Science and Statistics student at Cornell University with experience building data pipelines and applying statistical and machine learning methods to heterogeneous, real-world datasets. Skilled in Python, probabilistic modeling, and forecasting.</p></section>
    <section><h3>Education</h3><div className="resume-role-head"><strong>Cornell University, College of Arts &amp; Sciences</strong><span>Expected May 2028</span></div><p>B.S., Computer Science and Statistics</p><p><strong>Relevant coursework:</strong> Probability Models &amp; Inference, Applied Linear Statistics, Categorical Data Analysis, Machine Learning, Algorithms, Computer Architecture, Functional Programming, Discrete Math, Linear Algebra, Multivariable Calculus</p></section>
    <section><h3>Experience</h3>{roles.map(entry => <div className="resume-role" key={entry.org}><div className="resume-role-head"><strong>{entry.org} <span>· {entry.role}</span></strong><span>{entry.period}</span></div><ul>{entry.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul></div>)}</section>
    <section><h3>Skills</h3><p><strong>Languages:</strong> Python, SQL, R, Java, JavaScript, C/C++, OCaml, LaTeX</p><p><strong>Data &amp; ML:</strong> pandas, NumPy, scikit-learn, PyTorch, TensorFlow, matplotlib, xarray, NetCDF</p><p><strong>Methods:</strong> Regression analysis, hypothesis testing, probabilistic inference, statistical modeling, data pipeline design</p><p><strong>Tools:</strong> Git, Claude Code, Azure AI Foundry, Jupyter, Linux/Unix</p></section>
  </article>;
}
