import { Link } from 'react-router-dom';
import { useProfile, useProjects } from '../api/queries';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ErrorState, LoadingState } from '../components/ui/States';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { splitBio } from '../lib/format';
import './pages.css';

export function HomePage() {
  const profileQuery = useProfile();
  const featuredQuery = useProjects(true);
  useDocumentTitle(null);

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
  const { lead, rest } = splitBio(profile.bio);

  return (
    <>
      <section className="container hero">
        <div className={`hero__inner reveal${profile.avatarUrl ? ' hero__inner--avatar' : ''}`}>
          <div>
            <span className="eyebrow">{profile.headline}</span>
            <h1 className="display hero__headline">{profile.fullName}</h1>
            {lead && <p className="lead hero__lead">{lead}</p>}
            <div className="hero__actions">
              <Link to="/projects" className="btn btn--primary">
                View projects
              </Link>
              {profile.resumeUrl && (
                <a className="btn btn--ghost" href={profile.resumeUrl} target="_blank" rel="noreferrer noopener">
                  Download CV ↓
                </a>
              )}
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

          {profile.avatarUrl && (
            <img
              className="hero__avatar"
              src={profile.avatarUrl}
              alt={profile.fullName}
              width={220}
              height={220}
              loading="eager"
            />
          )}
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

      {rest.length > 0 && (
        <section className="container section" id="about" aria-labelledby="about-heading">
          <div className="section-head">
            <h2 className="section-title" id="about-heading">About</h2>
            <Link to="/resume" className="text-link">
              Full background →
            </Link>
          </div>
          <p className="lead about-teaser reveal">{rest[0]}</p>
        </section>
      )}
    </>
  );
}
