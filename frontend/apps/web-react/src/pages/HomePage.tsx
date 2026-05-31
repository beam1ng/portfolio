import { Link } from 'react-router-dom';
import { useProfile, useProjects } from '../api/queries';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ErrorState, LoadingState } from '../components/ui/States';
import './pages.css';

export function HomePage() {
  const profileQuery = useProfile();
  const featuredQuery = useProjects(true);

  if (profileQuery.isPending) {
    return <LoadingState label="Loading profile…" />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        message={profileQuery.error.message}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;
  const featured = featuredQuery.data ?? [];

  return (
    <>
      <section className="container hero">
        <div className="reveal">
          <span className="eyebrow">{profile.headline}</span>
          <h1 className="display hero__headline">{profile.fullName}</h1>
          <p className="lead hero__lead">{profile.bio}</p>
          <div className="hero__actions">
            <Link to="/projects" className="btn btn--primary">
              View projects
            </Link>
            <Link to="/contact" className="btn btn--ghost">
              Get in touch
            </Link>
          </div>
          <div className="hero__meta" style={{ marginTop: 'var(--space-6)' }}>
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.websiteUrl && (
              <a className="text-link" href={profile.websiteUrl} target="_blank" rel="noreferrer">
                {profile.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <h2 className="section-title">Featured work</h2>
            <Link to="/projects" className="text-link">
              All projects →
            </Link>
          </div>
          <div className="project-grid">
            {featured.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
