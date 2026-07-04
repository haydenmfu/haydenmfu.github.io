export interface Project {
  title: string;
  description: string;
  category: string;
  tags: string[];
  year: string;
  accent?: boolean;
  pattern?: 'halftone' | 'checker' | 'diagonal' | 'dot-grid' | 'plus';
  link?: string;
  coverImage?: string;
  coverAlt?: string;
}

export const projects: Project[] = [
  {
    title: 'Irrigation Data Assimilation',
    description:
      'Particle-based inference pipeline estimating unobserved irrigation inputs by combining satellite observations, land-surface model outputs, and watershed boundaries across multi-day windows.',
    category: 'ML / Water Systems',
    tags: ['Python', 'xarray', 'NetCDF', 'Geospatial'],
    year: '2026',
    accent: true,
    pattern: 'dot-grid',
    coverImage: '/work-covers/irrigation-cover.png',
    coverAlt: 'Satellite and watershed visualization for irrigation inference',
  },
  {
    title: 'LLM Forecasting Drift',
    description:
      'Research on whether linear probes can detect representation-level drift in long-horizon forecasting agents before forecast outputs become visibly miscalibrated or unstable.',
    category: 'AI Forecasting',
    tags: ['LLMs', 'Linear Probes', 'Forecasting'],
    year: '2026',
    pattern: 'checker',
    coverImage: '/work-covers/algoverse-cover.jpg',
    coverAlt: 'Forecasting and model-evaluation graphic for Algoverse LLM research',
  },
  {
    title: 'Lake-Effect Snow Forecasting',
    description:
      'Correctional ML model integrating HRRR numerical weather predictions with ground-truth sensor data from Finger Lakes buoys, field sensors, and local hydrological models.',
    category: 'ML / Climate',
    tags: ['Python', 'PyTorch', 'GAN', 'HRRR'],
    year: '2025',
    pattern: 'halftone',
    coverImage: '/work-covers/lake-effect-cover.png',
    coverAlt: 'Lake-effect snow forecasting cover image',
  },
  {
    title: 'Constitutional AI Bias Reduction',
    description:
      'Developed 5 custom Constitutional AI principles to reduce political bias in LLMs, tested across 300+ expert-approved prompts. Published in Journal of Emerging Investigators.',
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
    description:
      'Customizable map app for UIUC\'s I3 project enabling K–12 teachers to access 1000+ cultural and historical resources for inquiry-driven curricula. ChatGPT-powered tagging.',
    category: 'Web / Ed-Tech',
    tags: ['JavaScript', 'Maps API', 'ChatGPT'],
    year: '2024',
    pattern: 'diagonal',
    coverImage: '/work-covers/i3-cover.png',
    coverAlt: 'Interactive cultural resources map interface',
  },
  {
    title: 'COMPAS Bias Audit',
    description:
      'Analyzed racial, gender, and age bias in the COMPAS recidivism prediction system using logistic regression to assess accuracy, precision, and recall across demographic groups.',
    category: 'Fairness / ML',
    tags: ['Python', 'R', 'Logistic Regression'],
    year: '2024',
    pattern: 'plus',
    coverImage: '/work-covers/compas-cover.jpg',
    coverAlt: 'COMPAS fairness audit cover image',
  },
];
