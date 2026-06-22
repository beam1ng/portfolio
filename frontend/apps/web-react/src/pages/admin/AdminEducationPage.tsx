import { useState, type FormEvent } from 'react';
import { ApiError, type UpsertEducationRequest } from '@portfolio/api-client';
import { useAdminEducation, useEducationMutations } from '../../admin/queries';
import { formatDateRange, formatMonthYear } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

interface EducationForm {
  school: string;
  credential: string;
  field: string;
  startDate: string;
  endDate: string;
  url: string;
  sortOrder: number;
}

const EMPTY: EducationForm = {
  school: '', credential: '', field: '', startDate: '', endDate: '', url: '', sortOrder: 0,
};

export function AdminEducationPage() {
  const query = useAdminEducation();
  const { create, update, remove } = useEducationMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EducationForm>(EMPTY);

  const set = <K extends keyof EducationForm>(key: K, value: EducationForm[K]) =>
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
      school: item.school, credential: item.credential, field: item.field ?? '',
      startDate: item.startDate ?? '', endDate: item.endDate ?? '',
      url: item.url ?? '', sortOrder: item.sortOrder,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body: UpsertEducationRequest = {
      school: form.school.trim(),
      credential: form.credential.trim(),
      field: form.field.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      url: form.url.trim() || null,
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
          <h1 className="section-title">Education &amp; certifications</h1>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2 className="muted">{editingId ? 'Edit entry' : 'Add entry'}</h2>
          {editingId && <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>Cancel edit</button>}
        </div>
        <form className="admin-form" onSubmit={onSubmit}>
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="e-school">School / issuer</label>
              <input id="e-school" type="text" required value={form.school} onChange={(e) => set('school', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="e-cred">Credential</label>
              <input id="e-cred" type="text" required value={form.credential} onChange={(e) => set('credential', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="e-field">Field</label>
              <input id="e-field" type="text" value={form.field} onChange={(e) => set('field', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="e-order">Sort order</label>
              <input id="e-order" type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="e-start">Start date</label>
              <input id="e-start" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="e-end">End date</label>
              <input id="e-end" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="e-url">Credential URL <span className="muted">(optional)</span></label>
            <input id="e-url" type="url" value={form.url} onChange={(e) => set('url', e.target.value)} />
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
      {query.isSuccess && query.data.length === 0 && <EmptyState message="No education entries yet." />}
      {query.isSuccess && query.data.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr><th>Credential</th><th>School</th><th>Dates</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {query.data.map((item) => (
              <tr key={item.id}>
                <td>{item.credential}</td>
                <td className="muted">{item.school}</td>
                <td className="muted">{formatDateRange(item.startDate, item.endDate) ?? formatMonthYear(item.endDate)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(item.id)}>Edit</button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => window.confirm(`Delete "${item.credential}"?`) && remove.mutate(item.id)}
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
