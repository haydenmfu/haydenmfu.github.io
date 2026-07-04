import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';
import { projects } from '../../data/projects';

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const isLinked = Boolean(project.link);

  const card = (
    <article className={`relative bg-paper border-2 border-ink card-offset flex flex-col h-full ${isLinked ? 'group cursor-pointer' : ''}`}>
      <div className="relative h-36 border-b-2 border-ink overflow-hidden bg-paper-mid">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.coverAlt ?? ''}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`absolute inset-0 pattern-${project.pattern ?? 'dot-grid'}`}
            style={{ opacity: 0.12 }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-white/15 pointer-events-none" />
        <span className="absolute top-3 right-3 font-mono text-xs text-gray-500 border border-ink/20 px-2 py-0.5 bg-paper/90">
          {project.year}
        </span>
        {project.accent && (
          <div
            className="absolute bottom-0 left-0 w-12 h-12 bg-accent"
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
          />
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge>{project.category}</Badge>
        </div>

        <h3 className={`font-display font-bold text-xl text-ink leading-tight transition-colors ${isLinked ? 'group-hover:text-accent' : ''}`}>
          {project.title}
        </h3>

        <p className="font-body text-sm text-gray-500 leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {project.tags.map((tag) => (
            <span key={tag} className="font-mono text-xs text-gray-400 border border-gray-200 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {project.link && (
        <div className="absolute bottom-4 right-4 font-display text-xs font-bold text-gray-300 group-hover:text-ink transition-colors">
          VIEW &rarr;
        </div>
      )}
    </article>
  );

  if (!project.link) {
    return card;
  }

  return (
    <a href={project.link} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={`Open ${project.title}`}>
      {card}
    </a>
  );
}

export function Projects() {
  return (
    <section id="projects" className="py-24 bg-paper border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <SectionHeader index="01" title="Featured Work" subtitle="Selected projects" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l-2 border-t-2 border-ink">
          {projects.map((project) => (
            <div key={project.title} className="border-r-2 border-b-2 border-ink">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <a href="#experience" className="link-angular font-display font-bold text-sm text-ink flex items-center gap-2">
            See experience <span className="ml-1">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
