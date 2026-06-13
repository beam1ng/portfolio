import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, type UpsertProjectRequest } from '@portfolio/api-client';
import { useAdminProject, useAdminTechnologies, useProjectMutations } from '../../admin/queries';
import { ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

interface ProjectForm {
  title: string;
  slug: string;
  summary: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  imageUrl: string;
  isFeatured: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  technologyIds: string[];
  /** Per-technology usage note, keyed by technology id. */
  techNotes: Record<string, string>;
}

const EMPTY: ProjectForm = {
  title: '', slug: '', summary: '', description: '',
  repoUrl: '', liveUrl: '', imageUrl: '',
  isFeatured: false, sortOrder: 0, startDate: '', endDate: '',
  technologyIds: [], techNotes: {},
};

function toRequest(form: ProjectForm): UpsertProjectRequest {
  const trim = (s: string): string | null => (s.trim().length > 0 ? s.trim() : null);
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    summary: form.summary.trim(),
    description: form.description,
    repoUrl: trim(form.repoUrl),
    liveUrl: trim(form.liveUrl),
    imageUrl: trim(form.imageUrl),
    isFeatured: form.isFeatured,
    sortOrder: Number(form.sortOrder) || 0,
    startDate: trim(form.startDate),
    endDate: trim(form.endDate),
    technologies: form.technologyIds.map((technologyId) => ({
      technologyId,
      note: trim(form.techNotes[technologyId] ?? ''),
    })),
  };
}

export function AdminProjectFormPage() {
  const navigate = useNavigate();
  const { id = 'new' } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const existing = useAdminProject(isNew ? '' : id);
  const technologies = useAdminTechnologies();
  const { create, update } = useProjectMutations();

  const [form, setForm] = useState<ProjectForm>(EMPTY);

  useEffect(() => {
    if (!isNew && existing.data) {
      const p = existing.data;
      setForm({
        title: p.title, slug: p.slug, summary: p.summary, description: p.description,
        repoUrl: p.repoUrl ?? '', liveUrl: p.liveUrl ?? '', imageUrl: p.imageUrl ?? '',
        isFeatured: p.isFeatured, sortOrder: 0,
        startDate: p.startDate ?? '', endDate: p.endDate ?? '',
        technologyIds: p.technologies.map((t) => t.id),
        techNotes: Object.fromEntries(p.technologies.map((t) => [t.id, t.note ?? ''])),
      });
    }
  }, [isNew, existing.data]);

  if (!isNew && existing.isPending) return <LoadingState label="Loading project…" />;
  if (!isNew && existing.isError) {
    return <ErrorState message={existing.error.message} onRetry={() => void existing.refetch()} />;
  }

  const set = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTech = (techId: string) =>
    setForm((prev) => ({
      ...prev,
      technologyIds: prev.technologyIds.includes(techId)
        ? prev.technologyIds.filter((t) => t !== techId)
        : [...prev.technologyIds, techId],
    }));

  const mutation = isNew ? create : update;
  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError ? mutation.error.message : 'Save failed.'
    : null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body = toRequest(form);
    const onSuccess = () => navigate('/admin/projects');
    if (isNew) create.mutate(body, { onSuccess });
    else update.mutate({ id, body }, { onSuccess });
  };

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">{isNew ? 'Create' : 'Edit'}</span>
          <h1 className="section-title">{isNew ? 'New project' : form.title || 'Project'}</h1>
        </div>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <div className="field-grid">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" type="text" required value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="summary">Summary</label>
          <input id="summary" type="text" required value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="repoUrl">Repo URL</label>
            <input id="repoUrl" type="url" value={form.repoUrl} onChange={(e) => set('repoUrl', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="liveUrl">Live URL</label>
            <input id="liveUrl" type="url" value={form.liveUrl} onChange={(e) => set('liveUrl', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="imageUrl">Image URL</label>
            <input id="imageUrl" type="url" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sortOrder">Sort order</label>
            <input id="sortOrder" type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="startDate">Start date</label>
            <input id="startDate" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="endDate">End date</label>
            <input id="endDate" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </div>
        </div>

        <div className="field field--row">
          <input id="isFeatured" type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
          <label htmlFor="isFeatured">Featured on home page</label>
        </div>

        <div className="field">
          <label>Technologies</label>
          <div className="checkbox-grid">
            {(technologies.data ?? []).map((tech) => (
              <label key={tech.id}>
                <input
                  type="checkbox"
                  checked={form.technologyIds.includes(tech.id)}
                  onChange={() => toggleTech(tech.id)}
                />
                {tech.name}
              </label>
            ))}
          </div>
        </div>

        {form.technologyIds.length > 0 && (
          <div className="field">
            <label>Usage notes <span className="muted">(optional — how each technology was used)</span></label>
            <div className="tech-notes">
              {form.technologyIds.map((techId) => {
                const tech = technologies.data?.find((t) => t.id === techId);
                if (!tech) return null;
                return (
                  <div key={techId} className="tech-notes__row">
                    <span className="tech-notes__name">{tech.name}</span>
                    <input
                      type="text"
                      maxLength={500}
                      placeholder="e.g. Background jobs and scheduling"
                      value={form.techNotes[techId] ?? ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          techNotes: { ...prev.techNotes, [techId]: e.target.value },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save project'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/projects')}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
