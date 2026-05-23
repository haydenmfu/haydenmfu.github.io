import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';
import { projects } from '../../data/projects';

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="relative bg-paper border-2 border-ink card-offset group cursor-pointer flex flex-col">
      {/* Pattern header block */}
      <div
        className={`relative h-28 border-b-2 border-ink overflow-hidden`}
      >
        <div
          className={`absolute inset-0 pattern-${project.pattern ?? 'dot-grid'}`}
          style={{ opacity: 0.12 }}
        />
        {/* Year tag */}
        <span className="absolute top-3 right-3 font-mono text-xs text-gray-400 border border-gray-300 px-2 py-0.5 bg-paper">
          {project.year}
        </span>
        {/* Accent corner triangle */}
        {project.accent && (
          <div
            className="absolute bottom-0 left-0 w-12 h-12 bg-accent"
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
          />
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge>{project.category}</Badge>
        </div>

        <h3 className="font-display font-bold text-xl text-ink tracking-tight leading-tight group-hover:text-accent transition-colors">
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

      <div className="absolute bottom-4 right-4 font-display text-xs font-bold text-gray-300 group-hover:text-ink transition-colors">
        VIEW →
      </div>
    </article>
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
          <a href="#" className="link-angular font-display font-bold text-sm text-ink flex items-center gap-2">
            All projects <span className="ml-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
