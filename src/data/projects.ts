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
    description: "How do an AI forecaster's earlier predictions shape its next one? I built a Python pipeline to bring together prediction-market data and news available at each forecast date. We evaluated three open-weight models on 100 Kalshi markets, each with 30 timestamped news steps, while varying how much of their own forecast history they could see. Linear probes and deliberately rewritten prior forecasts showed that this history can anchor later predictions and weaken internal representations of the outcome, with different effects across models. Our paper was accepted to the Interpreting Agent Behavior workshop at NeurIPS 2026.",
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
    description: "At Big Red Hacks 2026, we built a way to reach someone through friends of friends when you know their background but not their name. A search travels through personal referral links until someone opts in with an introduction; once the poster confirms the match, the successful chain shares a reward. We connected a Next.js web app, a Photon-powered iMessage agent, and Solana devnet payouts, with a reward split designed to remove the financial incentive for inserting fake referral hops. The prototype modeled banking flows with Nessie in mock mode and visualized network activity using replay data. SASH won Capital One's Nessie Track and the Solana Track.",
    category: 'Hackathon / Social Computing',
    tags: ['Next.js', 'TypeScript', 'Solana', 'PostgreSQL'],
    year: '2026',
    pattern: 'plus',
  },
  {
    title: 'Irrigation Data Assimilation',
    description: "I'm working on estimating irrigation from satellite soil-moisture observations and land-surface model outputs. The Python pipeline compares possible irrigation histories with the observations to estimate how much water was applied. Much of my work involves making those comparisons reliable: aligning datasets across time and location, filtering noisy observations, and testing calibration choices.",
    category: 'ML / Water Systems',
    tags: ['Python', 'xarray', 'NetCDF', 'Geospatial'],
    year: '2026',
    pattern: 'dot-grid',
    coverImage: '/work-covers/irrigation-cover.png',
    coverAlt: 'Satellite and watershed visualization for irrigation inference',
  },
  {
    title: 'Lake-Effect Snow Forecasting',
    description: "With Cornell Geo Data, I'm working on correcting short-term weather forecasts using local sensor observations. I built a GAN-based model in Python and PyTorch that combines sensor data with numerical weather predictions. I also cleaned and validated the sensor time series used to evaluate the model.",
    category: 'ML / Climate',
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
    description: "Working with Professor Asif Wilson at the University of Illinois Urbana-Champaign, I built a map app to help K–12 educators find cultural and historical resources for their lessons. The app brings together more than 1,000 resources, with a Python and ChatGPT-powered classification pipeline to help organize them.",
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
