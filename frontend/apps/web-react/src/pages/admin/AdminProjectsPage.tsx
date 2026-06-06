import { Link, useNavigate } from 'react-router-dom';
import { useAdminProjects, useProjectMutations } from '../../admin/queries';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

export function AdminProjectsPage() {
  const navigate = useNavigate();
  const query = useAdminProjects();
  const { remove } = useProjectMutations();

  const onDelete = (id: string, title: string) => {
    if (window.confirm(`Delete project "${title}"? This cannot be undone.`)) {
      remove.mutate(id);
    }
  };

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">Content</span>
          <h1 className="section-title">Projects</h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/admin/projects/new')}>
          + New project
        </button>
      </div>

      {query.isPending && <LoadingState label="Loading projects…" />}
      {query.isError && <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />}
      {query.isSuccess && query.data.length === 0 && <EmptyState message="No projects yet." />}
      {query.isSuccess && query.data.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Featured</th>
              <th>Tech</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {query.data.map((project) => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td className="muted">{project.slug}</td>
                <td>{project.isFeatured ? 'Yes' : '—'}</td>
                <td className="muted">{project.technologies.length}</td>
                <td>
                  <div className="row-actions">
                    <Link to={`/admin/projects/${project.id}`} className="btn btn--ghost btn--sm">Edit</Link>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => onDelete(project.id, project.title)}
                      disabled={remove.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
