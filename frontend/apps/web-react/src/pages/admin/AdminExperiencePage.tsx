import { useState, type FormEvent } from 'react';
import { ApiError, type UpsertExperienceRequest } from '@portfolio/api-client';
import { useAdminExperience, useExperienceMutations } from '../../admin/queries';
import { formatDateRange } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

interface ExperienceForm {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  summary: string;
  sortOrder: number;
}

const EMPTY: ExperienceForm = {
  company: '', role: '', location: '', startDate: '', endDate: '', summary: '', sortOrder: 0,
};

export function AdminExperiencePage() {
  const query = useAdminExperience();
  const { create, update, remove } = useExperienceMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceForm>(EMPTY);

  const set = <K extends keyof ExperienceForm>(key: K, value: ExperienceForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const startEdit = (id: string) => {
    const item = query.data?.find((e) => e.id === id);
    if (!item) return;
    setEditingId(id);
    setForm({
      company: item.company, role: item.role, location: item.location ?? '',
      startDate: item.startDate ?? '', endDate: item.endDate ?? '',
      summary: item.summary ?? '', sortOrder: item.sortOrder,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body: UpsertExperienceRequest = {
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || null,
      startDate: form.startDate,
      endDate: form.endDate || null,
      summary: form.summary.trim() || null,
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
          <h1 className="section-title">Experience</h1>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2 className="muted">{editingId ? 'Edit role' : 'Add role'}</h2>
          {editingId && <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>Cancel edit</button>}
        </div>
        <form className="admin-form" onSubmit={onSubmit}>
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="x-company">Company</label>
              <input id="x-company" type="text" required value={form.company} onChange={(e) => set('company', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="x-role">Role</label>
              <input id="x-role" type="text" required value={form.role} onChange={(e) => set('role', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="x-loc">Location</label>
              <input id="x-loc" type="text" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="x-order">Sort order</label>
              <input id="x-order" type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="x-start">Start date</label>
              <input id="x-start" type="date" required value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="x-end">End date <span className="muted">(empty = present)</span></label>
              <input id="x-end" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="x-summary">Summary <span className="muted">(markdown — bullets supported)</span></label>
            <textarea id="x-summary" value={form.summary} onChange={(e) => set('summary', e.target.value)} />
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
      {query.isSuccess && query.data.length === 0 && <EmptyState message="No experience entries yet." />}
      {query.isSuccess && query.data.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr><th>Role</th><th>Company</th><th>Dates</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {query.data.map((item) => (
              <tr key={item.id}>
                <td>{item.role}</td>
                <td className="muted">{item.company}</td>
                <td className="muted">{formatDateRange(item.startDate, item.endDate)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(item.id)}>Edit</button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => window.confirm(`Delete "${item.role} @ ${item.company}"?`) && remove.mutate(item.id)}
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
