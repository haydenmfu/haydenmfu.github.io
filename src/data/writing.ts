export interface Article {
  title: string;
  excerpt: string;
  category: string;
  date?: string;
  readTime?: string;
  venue: string;
  featured?: boolean;
  link?: string;
}

export const articles: Article[] = [
  {
    title: 'Linking Trajectory Drift to Representational Degradation in Sequential LLM Forecasting',
    excerpt: "We built an evaluation workflow to study how three open-weight LLMs update predictions across 100 Kalshi markets as timestamped news arrives. By varying access to earlier forecasts, probing internal representations, and rewriting prior predictions, we found that self-generated history can anchor later forecasts and distort belief updating in ways that final accuracy alone misses. Accepted to the Interpreting Agent Behavior workshop at NeurIPS 2026.",
    category: 'AI Research',
    venue: 'Interpreting Agent Behavior workshop at NeurIPS 2026',
    featured: true,
    link: 'https://openreview.net/forum?id=UXthrIAHqX',
  },
  {
    title: 'Why Encampment Bans Don\'t Reduce Homelessness',
    excerpt:
      'Applied difference-in-differences regressions to assess encampment-ban policy impacts across urban counties using HUD homeless data and Census statistics. Identifies penalties, enforcement constraints, and shelter access as key determinants of outcomes.',
    category: 'Policy Research',
    date: 'Nov 2024',
    readTime: '12 min',
    venue: 'Journal of Student Research',
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
