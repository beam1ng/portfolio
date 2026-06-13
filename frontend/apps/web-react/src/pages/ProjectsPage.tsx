import { useSearchParams } from 'react-router-dom';
import { useProjects } from '../api/queries';
import { ProjectCard } from '../components/projects/ProjectCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { projectsUsingTechSlug, techNameForSlug } from '../lib/crossref';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import './pages.css';

export function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const techFilter = params.get('tech');
  const featuredOnly = params.get('featured') === 'true';
  useDocumentTitle('Projects');

  // A tech filter spans all projects; the featured toggle only applies otherwise.
  const query = useProjects(techFilter ? false : featuredOnly);

  const all = query.data ?? [];
  const projects = techFilter ? projectsUsingTechSlug(all, techFilter) : all;
  const techName = techFilter ? (techNameForSlug(all, techFilter) ?? techFilter) : null;

  const setFeatured = (value: boolean) => {
    setParams(value ? { featured: 'true' } : {}, { replace: true });
  };

  const clearTech = () => setParams({}, { replace: true });

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Selected work</span>
          <h1 className="section-title">Projects</h1>
        </div>
      </div>

      {techFilter ? (
        <div className="filter-row">
          <span className="muted">Filtered by technology:</span>
          <button type="button" className="chip" aria-pressed="true" onClick={clearTech}>
            {techName} <span aria-hidden="true">✕</span>
          </button>
        </div>
      ) : (
        <div className="filter-row" role="group" aria-label="Filter projects">
          <button type="button" className="chip" aria-pressed={!featuredOnly} onClick={() => setFeatured(false)}>
            All
          </button>
          <button type="button" className="chip" aria-pressed={featuredOnly} onClick={() => setFeatured(true)}>
            Featured
          </button>
        </div>
      )}

      {query.isPending && <LoadingState label="Loading projects…" />}
      {query.isError && (
        <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
      )}
      {query.isSuccess && projects.length === 0 && (
        <EmptyState
          message={techFilter ? `No projects use ${techName}.` : 'No projects to show yet.'}
        />
      )}
      {query.isSuccess && projects.length > 0 && (
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
