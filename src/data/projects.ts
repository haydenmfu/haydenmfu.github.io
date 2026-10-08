export interface Project {
  title: string;
  description: string;
  category: string;
  tags: string[];
  year: string;
  accent?: boolean;
  pattern?: 'halftone' | 'checker' | 'diagonal' | 'dot-grid' | 'plus';
  link?: string;
  linkLabel?: string;
  coverImage?: string;
  coverAlt?: string;
}

export const projects: Project[] = [
  {
    title: 'LLM Prediction Markets',
    description: "I built a Python forecasting pipeline that combines prediction-market data, historical order books, timestamped news, and LLM inference. Time-aware retrieval uses embeddings and cross-encoder reranking to select relevant news without introducing future information. We tested three open-weight models across 100 Kalshi markets, using linear probes and altered prior forecasts to understand anchoring and drift. The work connects data engineering with model evaluation: making experiments reproducible and distinguishing reliable predictions from misleading confidence. Our paper was accepted to the Interpreting Agent Behavior workshop at NeurIPS 2026.",
    category: 'AI Research / Forecasting',
    tags: ['Python', 'LLMs', 'Kalshi', 'Linear Probes'],
    year: '2026',
    accent: true,
    pattern: 'checker',
    link: 'https://openreview.net/forum?id=UXthrIAHqX',
    linkLabel: 'Read the paper',
  },
  {
    title: 'SASH: Search Across Six Hops',
    description: "We built a full-stack referral search platform at Big Red Hacks 2026 using Next.js, TypeScript, and PostgreSQL. A search moves through friends of friends until someone opts in with an introduction. I built interactive network visualizations and multi-hop search features to trace those connections, and co-developed the platform's iMessage and Solana devnet payout flow. SQL dashboards let us examine search propagation and reward strategies across one million simulated events. The prototype used Nessie in mock mode for banking flows and won Capital One's Nessie Track and the Solana Track.",
    category: 'Hackathon / Social Computing',
    tags: ['Next.js', 'TypeScript', 'Solana', 'PostgreSQL'],
    year: '2026',
    pattern: 'plus',
  },
  {
    title: 'Irrigation Data Assimilation',
    description: "I built a Python pipeline that turns satellite observations, simulation outputs, and geospatial datasets into estimates of irrigation. Reusable modules handle spatial matching, time-series alignment, validation, and NetCDF extraction. I automated experiments on Cornell's SLURM cluster, from generating candidate inputs and launching simulations to scoring results against observations. The work centers on dependable data processing and experiment orchestration, with probabilistic sampling to refine estimates and temporal and geographic holdouts to evaluate bias correction.",
    category: 'Data Pipelines / Scientific Computing',
    tags: ['Python', 'xarray', 'NetCDF', 'Geospatial'],
    year: '2026',
    pattern: 'dot-grid',
    coverImage: '/work-covers/irrigation-cover.png',
    coverAlt: 'Satellite and watershed visualization for irrigation inference',
  },
  {
    title: 'Lake-Effect Snow Forecasting',
    description: "I built reusable Python tools to extract, align, and validate weather-model outputs and sensor observations for forecast analysis. The pipeline samples locations, computes temperature and wind features, and reduces repeated spatial lookups. I also developed a PyTorch model to correct short-term forecasts, bringing data preparation and model evaluation into the same workflow.",
    category: 'Data Engineering / ML',
    tags: ['Python', 'PyTorch', 'GAN', 'HRRR'],
    year: '2025',
    pattern: 'halftone',
    coverImage: '/work-covers/lake-effect-cover.png',
    coverAlt: 'Lake-effect snow forecasting cover image',
  },
  {
    title: 'Constitutional AI Bias Reduction',
    description: "I investigated whether changes to ChatGPT's instructions could reduce political bias in its responses. I designed five prompting strategies and tested them across more than 300 prompts to compare their effects. The work was published in the Journal of Emerging Investigators.",
    category: 'AI Research',
    tags: ['Python', 'NLP', 'Constitutional AI'],
    year: '2024',
    pattern: 'checker',
    link: 'https://emerginginvestigators.org/articles/24-047',
    coverImage: '/work-covers/chatgpt-bias-cover.png',
    coverAlt: 'ChatGPT political bias research cover image',
  },
  {
    title: 'I3 Cultural Resources Map',
    description: "I built a map application that helps K–12 educators explore more than 1,000 cultural and historical resources. Working with Professor Asif Wilson at the University of Illinois Urbana-Champaign, I connected a JavaScript map interface with a Python and ChatGPT-powered classification pipeline. The project brought together data organization, applied AI, and a usable interface for finding teaching resources.",
    category: 'Web / Ed-Tech',
    tags: ['JavaScript', 'Maps API', 'ChatGPT'],
    year: '2024',
    pattern: 'diagonal',
    coverImage: '/work-covers/i3-cover.png',
    coverAlt: 'Interactive cultural resources map interface',
  },
  {
    title: 'COMPAS Bias Audit',
    description: "I analyzed how the COMPAS recidivism prediction system performed across racial, gender, and age groups. Using logistic regression and measures such as precision and recall, I examined differences in its predictions and the kinds of errors it made.",
    category: 'Fairness / ML',
    tags: ['Python', 'R', 'Logistic Regression'],
    year: '2024',
    pattern: 'plus',
    coverImage: '/work-covers/compas-cover.jpg',
    coverAlt: 'COMPAS fairness audit cover image',
  },
];
