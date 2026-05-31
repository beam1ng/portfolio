import { useState } from 'react';
import { useProjects } from '../api/queries';
import { ProjectCard } from '../components/projects/ProjectCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import './pages.css';

export function ProjectsPage() {
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const query = useProjects(featuredOnly);

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Selected work</span>
          <h1 className="section-title">Projects</h1>
        </div>
      </div>

      <div className="filter-row" role="group" aria-label="Filter projects">
        <button
          type="button"
          className="chip"
          aria-pressed={!featuredOnly}
          onClick={() => setFeaturedOnly(false)}
        >
          All
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={featuredOnly}
          onClick={() => setFeaturedOnly(true)}
        >
          Featured
        </button>
      </div>

      {query.isPending && <LoadingState label="Loading projects…" />}
      {query.isError && (
        <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
      )}
      {query.isSuccess && query.data.length === 0 && (
        <EmptyState message="No projects to show yet." />
      )}
      {query.isSuccess && query.data.length > 0 && (
        <div className="project-grid">
          {query.data.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
