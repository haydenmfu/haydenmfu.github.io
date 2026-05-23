export interface Project {
  title: string;
  description: string;
  category: string;
  tags: string[];
  year: string;
  accent?: boolean;
  pattern?: 'halftone' | 'checker' | 'diagonal' | 'dot-grid' | 'plus';
  link?: string;
}

export const projects: Project[] = [
  {
    title: 'Lake-Effect Snow Forecasting',
    description:
      'Correctional ML model integrating HRRR numerical weather predictions with ground-truth sensor data from Finger Lakes buoys, optimized with a GAN-based approach.',
    category: 'ML / Climate',
    tags: ['Python', 'PyTorch', 'GAN', 'HRRR'],
    year: '2025',
    pattern: 'halftone',
  },
  {
    title: 'Constitutional AI Bias Reduction',
    description:
      'Developed 5 custom Constitutional AI principles to reduce political bias in LLMs, tested across 300+ expert-approved prompts. Published in Journal of Emerging Investigators.',
    category: 'AI Research',
    tags: ['Python', 'NLP', 'Constitutional AI'],
    year: '2024',
    accent: true,
    pattern: 'checker',
  },
  {
    title: 'I3 Cultural Resources Map',
    description:
      'Customizable map app for UIUC\'s I3 project enabling K–12 teachers to access 1000+ cultural and historical resources for inquiry-driven curricula. ChatGPT-powered tagging.',
    category: 'Web / Ed-Tech',
    tags: ['JavaScript', 'Maps API', 'ChatGPT'],
    year: '2024',
    pattern: 'diagonal',
  },
  {
    title: 'COMPAS Bias Audit',
    description:
      'Analyzed racial, gender, and age bias in the COMPAS recidivism prediction system using logistic regression to assess accuracy, precision, and recall across demographic groups.',
    category: 'Fairness / ML',
    tags: ['Python', 'R', 'Logistic Regression'],
    year: '2024',
    pattern: 'plus',
  },
];
