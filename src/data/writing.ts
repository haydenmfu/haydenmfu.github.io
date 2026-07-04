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
    date: 'Nov 2024',
    readTime: '12 min',
    venue: 'Journal of Student Research',
    featured: true,
    link: 'https://www.researchgate.net/publication/394963694_Why_Encampment_Bans_Don%27t_Reduce_Homelessness',
  },
  {
    title: 'Unveiling Bias in ChatGPT-3.5',
    excerpt:
      'Developed and tested 5 custom Constitutional AI principles to reduce political bias in ChatGPT-3.5, evaluated across 300+ expert-approved political prompts. Presented at Southern California\'s Conference for Undergraduate Research.',
    category: 'AI Research',
    date: 'Oct 2024',
    readTime: '10 min',
    venue: 'Journal of Emerging Investigators',
    link: 'https://emerginginvestigators.org/articles/24-047',
  },
];
