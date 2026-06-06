import { useState, type FormEvent } from 'react';
import { ApiError, type UpsertTechnologyRequest } from '@portfolio/api-client';
import { useAdminTechnologies, useTechnologyMutations } from '../../admin/queries';
import { proficiencyLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

interface TechForm {
  name: string;
  slug: string;
  category: string;
  iconUrl: string;
  proficiency: number;
}

const EMPTY: TechForm = { name: '', slug: '', category: '', iconUrl: '', proficiency: 3 };

export function AdminTechnologiesPage() {
  const query = useAdminTechnologies();
  const { create, update, remove } = useTechnologyMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TechForm>(EMPTY);

  const set = <K extends keyof TechForm>(key: K, value: TechForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const startEdit = (id: string) => {
    const tech = query.data?.find((t) => t.id === id);
    if (!tech) return;
    setEditingId(id);
    setForm({
      name: tech.name, slug: tech.slug,
      category: tech.category ?? '', iconUrl: tech.iconUrl ?? '',
      proficiency: tech.proficiency,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body: UpsertTechnologyRequest = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category.trim() || null,
      iconUrl: form.iconUrl.trim() || null,
      proficiency: Number(form.proficiency),
    };
    if (editingId) update.mutate({ id: editingId, body }, { onSuccess: reset });
    else create.mutate(body, { onSuccess: reset });
  };

  const mutation = editingId ? update : create;
  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError ? mutation.error.message : 'Save failed.'
    : null;

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">Content</span>
          <h1 className="section-title">Technologies</h1>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2 className="muted">{editingId ? 'Edit technology' : 'Add technology'}</h2>
          {editingId && <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>Cancel edit</button>}
        </div>
        <form className="admin-form" onSubmit={onSubmit}>
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="t-name">Name</label>
              <input id="t-name" type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-slug">Slug</label>
              <input id="t-slug" type="text" required value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-cat">Category</label>
              <input id="t-cat" type="text" value={form.category} onChange={(e) => set('category', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-prof">Proficiency</label>
              <select id="t-prof" value={form.proficiency} onChange={(e) => set('proficiency', Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} — {proficiencyLabel(n)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </section>

      {query.isPending && <LoadingState label="Loading…" />}
      {query.isError && <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />}
      {query.isSuccess && query.data.length === 0 && <EmptyState message="No technologies yet." />}
      {query.isSuccess && query.data.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Slug</th><th>Category</th><th>Level</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {query.data.map((tech) => (
              <tr key={tech.id}>
                <td>{tech.name}</td>
                <td className="muted">{tech.slug}</td>
                <td className="muted">{tech.category ?? '—'}</td>
                <td>{proficiencyLabel(tech.proficiency)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(tech.id)}>Edit</button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => window.confirm(`Delete "${tech.name}"?`) && remove.mutate(tech.id)}
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
