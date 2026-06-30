import { useState, type FormEvent } from 'react';
import { ApiError, type UpsertTestimonialRequest } from '@portfolio/api-client';
import { useAdminTestimonials, useTestimonialMutations } from '../../admin/queries';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

interface TestimonialForm {
  author: string;
  role: string;
  company: string;
  relationship: string;
  quote: string;
  avatarUrl: string;
  sourceUrl: string;
  receivedDate: string;
  sortOrder: number;
}

const EMPTY: TestimonialForm = {
  author: '', role: '', company: '', relationship: '', quote: '',
  avatarUrl: '', sourceUrl: '', receivedDate: '', sortOrder: 0,
};

export function AdminTestimonialsPage() {
  const query = useAdminTestimonials();
  const { create, update, remove } = useTestimonialMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(EMPTY);

  const set = <K extends keyof TestimonialForm>(key: K, value: TestimonialForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const startEdit = (id: string) => {
    const item = query.data?.find((t) => t.id === id);
    if (!item) return;
    setEditingId(id);
    setForm({
      author: item.author, role: item.role ?? '', company: item.company ?? '',
      relationship: item.relationship ?? '', quote: item.quote,
      avatarUrl: item.avatarUrl ?? '', sourceUrl: item.sourceUrl ?? '',
      receivedDate: item.receivedDate ?? '', sortOrder: item.sortOrder,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body: UpsertTestimonialRequest = {
      author: form.author.trim(),
      role: form.role.trim() || null,
      company: form.company.trim() || null,
      relationship: form.relationship.trim() || null,
      quote: form.quote.trim(),
      avatarUrl: form.avatarUrl.trim() || null,
      sourceUrl: form.sourceUrl.trim() || null,
      receivedDate: form.receivedDate || null,
      sortOrder: Number(form.sortOrder) || 0,
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
          <h1 className="section-title">Testimonials</h1>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2 className="muted">{editingId ? 'Edit recommendation' : 'Add recommendation'}</h2>
          {editingId && <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>Cancel edit</button>}
        </div>
        <form className="admin-form" onSubmit={onSubmit}>
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="t-author">Author</label>
              <input id="t-author" type="text" required value={form.author} onChange={(e) => set('author', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-role">Role</label>
              <input id="t-role" type="text" value={form.role} onChange={(e) => set('role', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-company">Company</label>
              <input id="t-company" type="text" value={form.company} onChange={(e) => set('company', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-order">Sort order</label>
              <input id="t-order" type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="t-rel">Relationship <span className="muted">(e.g. "Managed Jakub directly")</span></label>
              <input id="t-rel" type="text" value={form.relationship} onChange={(e) => set('relationship', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-date">Date received</label>
              <input id="t-date" type="date" value={form.receivedDate} onChange={(e) => set('receivedDate', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-avatar">Avatar URL</label>
              <input id="t-avatar" type="url" value={form.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-source">Source URL <span className="muted">(LinkedIn link)</span></label>
              <input id="t-source" type="url" value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="t-quote">Quote <span className="muted">(markdown)</span></label>
            <textarea id="t-quote" required value={form.quote} onChange={(e) => set('quote', e.target.value)} />
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
      {query.isSuccess && query.data.length === 0 && <EmptyState message="No testimonials yet." />}
      {query.isSuccess && query.data.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr><th>Author</th><th>Role / company</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {query.data.map((item) => (
              <tr key={item.id}>
                <td>{item.author}</td>
                <td className="muted">{[item.role, item.company].filter(Boolean).join(' · ')}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(item.id)}>Edit</button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => window.confirm(`Delete recommendation from "${item.author}"?`) && remove.mutate(item.id)}
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
