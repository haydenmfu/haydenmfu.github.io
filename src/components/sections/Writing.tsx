import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';
import { articles } from '../../data/writing';

function FeaturedArticle({ article }: { article: (typeof articles)[number] }) {
  const isLinked = Boolean(article.link);

  const card = (
    <article className={`relative bg-ink text-white border-2 border-ink card-offset overflow-hidden h-full ${isLinked ? 'group cursor-pointer' : ''}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)',
        }}
      />

      <div className="relative p-8 flex flex-col h-full gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="accent">{article.category}</Badge>
          <span className="font-mono text-xs text-gray-400">{article.venue}</span>
        </div>

        <h3 className="font-display font-bold text-white leading-tight text-2xl lg:text-3xl">
          {article.title}
        </h3>

        <p className="font-body text-gray-400 text-sm leading-relaxed flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-500">{article.date}</span>
            <span className="text-gray-700">&middot;</span>
            <span className="font-mono text-xs text-gray-500">{article.readTime} read</span>
          </div>
          {article.link && (
            <span className="font-display font-bold text-xs text-gray-400 group-hover:text-accent transition-colors">
              READ &rarr;
            </span>
          )}
        </div>
      </div>
    </article>
  );

  if (!article.link) {
    return card;
  }

  return (
    <a href={article.link} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={`Read ${article.title}`}>
      {card}
    </a>
  );
}

function ArticleCard({ article }: { article: (typeof articles)[number] }) {
  const isLinked = Boolean(article.link);

  const card = (
    <article className={`bg-paper border-2 border-ink card-offset flex flex-col p-5 gap-3 h-full ${isLinked ? 'group cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between flex-wrap gap-1">
        <Badge>{article.category}</Badge>
        <span className="font-mono text-xs text-gray-300">{article.readTime}</span>
      </div>

      <div className="font-mono text-xs text-gray-400 italic">{article.venue}</div>

      <h3 className={`font-display font-semibold text-ink text-base leading-snug transition-colors ${isLinked ? 'group-hover:text-accent' : ''}`}>
        {article.title}
      </h3>

      <p className="font-body text-xs text-gray-500 leading-relaxed flex-1">
        {article.excerpt}
      </p>

      <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
        <span className="font-mono text-xs text-gray-400">{article.date}</span>
        {article.link && (
          <span className="font-display font-bold text-xs text-gray-300 group-hover:text-ink transition-colors">&rarr;</span>
        )}
      </div>
    </article>
  );

  if (!article.link) {
    return card;
  }

  return (
    <a href={article.link} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={`Read ${article.title}`}>
      {card}
    </a>
  );
}

export function Writing() {
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <section id="writing" className="py-24 bg-paper border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <SectionHeader index="03" title="Writing" subtitle="Published research" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-l-2 border-t-2 border-ink">
          {featured && (
            <div className="lg:col-span-2 border-r-2 border-b-2 border-ink">
              <FeaturedArticle article={featured} />
            </div>
          )}
          <div className="lg:col-span-1 grid grid-cols-1 border-b-2 border-ink">
            {rest.map((article) => (
              <div key={article.title} className="border-b border-r-2 border-ink last:border-b-0 h-full">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <a href="#contact" className="link-angular font-display font-bold text-sm text-ink flex items-center gap-2">
            Discuss research <span className="ml-1">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
