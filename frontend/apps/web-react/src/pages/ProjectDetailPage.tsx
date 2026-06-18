import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@portfolio/api-client';
import { TechTag } from '../components/projects/TechTag';
import { useProject } from '../api/queries';
import { ErrorState, LoadingState } from '../components/ui/States';
import { formatDateRange } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import './pages.css';

export function ProjectDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const query = useProject(slug);
  useDocumentTitle(query.data?.title ?? 'Project');

  if (query.isPending) {
    return <LoadingState label="Loading project…" />;
  }

  if (query.isError) {
    // A 404 is a missing page, not a transient failure — no point retrying.
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <section className="container notfound">
          <span className="eyebrow">404</span>
          <h1 className="display" style={{ fontSize: 'var(--text-hero)' }}>
            Project not found.
          </h1>
          <p className="lead">No project lives at “{slug}” — it may have been renamed.</p>
          <Link to="/projects" className="btn btn--primary">
            All projects
          </Link>
        </section>
      );
    }

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

      {(project.images ?? []).length > 0 && (
        <section className="gallery" aria-label="Screenshots">
          {(project.images ?? []).map((image, index) => (
            <figure key={`${image.imageUrl}-${index}`} className="gallery__item">
              <img src={image.imageUrl} alt={image.caption ?? project.title} loading="lazy" />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ))}
        </section>
      )}

      <div className="detail__body">
        <div className="detail__description">{project.description}</div>
        <aside className="detail__aside">
          <h2>Built with</h2>
          <div className="tag-row">
            {project.technologies.map((tech) => (
              <TechTag key={tech.id} tech={tech} to={`/projects?tech=${tech.slug}`} />
            ))}
          </div>

          {project.technologies.some((tech) => tech.note) && (
            <dl className="detail__notes">
              {project.technologies
                .filter((tech) => tech.note)
                .map((tech) => (
                  <div key={tech.id} className="detail__note">
                    <dt>{tech.name}</dt>
                    <dd>{tech.note}</dd>
                  </div>
                ))}
            </dl>
          )}
        </aside>
      </div>
    </article>
  );
}
