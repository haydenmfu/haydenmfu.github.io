export interface Article {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  venue: string;
  featured?: boolean;
  link?: string;
}

export const articles: Article[] = [
  {
    title: 'Why Encampment Bans Don\'t Reduce Homelessness',
    excerpt:
      'Applied difference-in-differences regressions to assess encampment-ban policy impacts across urban counties using HUD homeless data and Census statistics. Identifies penalties, enforcement constraints, and shelter access as key determinants of outcomes.',
    category: 'Policy Research',
    date: 'Aug 2024',
    readTime: '12 min',
    venue: 'Journal of Student Research',
    featured: true,
  },
  {
    title: 'Analyzing Constitutional AI Principles for Politically-Biased Responses',
    excerpt:
      'Developed and tested 5 custom Constitutional AI principles to reduce political bias in ChatGPT-3.5, evaluated across 300+ expert-approved political prompts. Presented at Southern California\'s Conference for Undergraduate Research.',
    category: 'AI Research',
    date: 'Jun 2024',
    readTime: '10 min',
    venue: 'Journal of Emerging Investigators',
  },
];
