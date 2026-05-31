import { Link, useParams } from 'react-router-dom';
import { useProject } from '../api/queries';
import { ErrorState, LoadingState } from '../components/ui/States';
import { formatDateRange } from '../lib/format';
import './pages.css';

export function ProjectDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const query = useProject(slug);

  if (query.isPending) {
    return <LoadingState label="Loading project…" />;
  }

  if (query.isError) {
    return (
      <div className="container section">
        <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
        <div style={{ textAlign: 'center' }}>
          <Link to="/projects" className="text-link">
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const project = query.data;
  const range = formatDateRange(project.startDate, project.endDate);

  return (
    <article className="container section reveal">
      <Link to="/projects" className="detail__back">
        ← Projects
      </Link>

      <header className="detail__header">
        <span className="eyebrow">{range ?? 'Project'}</span>
        <h1 className="display" style={{ fontSize: 'var(--text-hero)' }}>
          {project.title}
        </h1>
        <p className="lead">{project.summary}</p>
        <div className="detail__actions">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              className="btn btn--primary"
              target="_blank"
              rel="noreferrer noopener"
            >
              Live site ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              className="btn btn--ghost"
              target="_blank"
              rel="noreferrer noopener"
            >
              Source ↗
            </a>
          )}
        </div>
      </header>

      {project.imageUrl && (
        <div className="detail__media">
          <img src={project.imageUrl} alt={project.title} />
        </div>
      )}

      <div className="detail__body">
        <div className="detail__description">{project.description}</div>
        <aside className="detail__aside">
          <h2>Built with</h2>
          <div className="tag-row">
            {project.technologies.map((tech) => (
              <span key={tech.id} className="tag">
                {tech.name}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}
