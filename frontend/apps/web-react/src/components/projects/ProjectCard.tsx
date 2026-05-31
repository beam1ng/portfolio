import { Link } from 'react-router-dom';
import type { ProjectSummary } from '@portfolio/api-client';
import './project-card.css';

const MAX_TAGS = 4;

export function ProjectCard({ project, index }: { project: ProjectSummary; index: number }) {
  const visibleTech = project.technologies.slice(0, MAX_TAGS);
  const overflow = project.technologies.length - visibleTech.length;

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="card project-card reveal"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="project-card__media" aria-hidden="true">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt="" loading="lazy" />
        ) : (
          <span className="project-card__glyph">{project.title.charAt(0)}</span>
        )}
        {project.isFeatured && <span className="project-card__badge">Featured</span>}
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">{project.title}</h3>
        <p className="muted project-card__summary">{project.summary}</p>
        <div className="tag-row project-card__tags">
          {visibleTech.map((tech) => (
            <span key={tech.id} className="tag">
              {tech.name}
            </span>
          ))}
          {overflow > 0 && <span className="tag">+{overflow}</span>}
        </div>
      </div>
    </Link>
  );
}
