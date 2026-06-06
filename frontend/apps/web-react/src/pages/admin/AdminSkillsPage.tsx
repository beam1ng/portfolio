import { useState, type FormEvent } from 'react';
import { ApiError } from '@portfolio/api-client';
import { useAdminSkills, useSkillMutations } from '../../admin/queries';
import { proficiencyLabel } from '../../lib/format';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

export function AdminSkillsPage() {
  const query = useAdminSkills();
  const m = useSkillMutations();

  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [skillDraft, setSkillDraft] = useState<Record<string, { name: string; level: number }>>({});

  const draftFor = (id: string) => skillDraft[id] ?? { name: '', level: 3 };
  const setDraft = (id: string, value: { name: string; level: number }) =>
    setSkillDraft((prev) => ({ ...prev, [id]: value }));

  const addCategory = (event: FormEvent) => {
    event.preventDefault();
    m.createCategory.mutate(
      { name: catName.trim(), slug: catSlug.trim(), sortOrder: query.data?.length ?? 0 },
      { onSuccess: () => { setCatName(''); setCatSlug(''); } },
    );
  };

  const addSkill = (categoryId: string) => {
    const draft = draftFor(categoryId);
    if (draft.name.trim().length === 0) return;
    m.createSkill.mutate(
      { skillCategoryId: categoryId, name: draft.name.trim(), level: draft.level, sortOrder: 0 },
      { onSuccess: () => setDraft(categoryId, { name: '', level: 3 }) },
    );
  };

  const catError = m.createCategory.isError
    ? m.createCategory.error instanceof ApiError ? m.createCategory.error.message : 'Failed.'
    : null;

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">Content</span>
          <h1 className="section-title">Skills</h1>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section__head"><h2 className="muted">Add category</h2></div>
        <form className="admin-form" onSubmit={addCategory}>
          {catError && <p className="form-error">{catError}</p>}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="c-name">Name</label>
              <input id="c-name" type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="c-slug">Slug</label>
              <input id="c-slug" type="text" required value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={m.createCategory.isPending}>Add category</button>
          </div>
        </form>
      </section>

      {query.isPending && <LoadingState label="Loading skills…" />}
      {query.isError && <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />}
      {query.isSuccess && query.data.length === 0 && <EmptyState message="No skill categories yet." />}

      {query.isSuccess && query.data.map((category) => {
        const draft = draftFor(category.id);
        return (
          <section key={category.id} className="admin-section">
            <div className="admin-section__head">
              <h2 className="section-title">{category.name} <span className="muted">/ {category.slug}</span></h2>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => window.confirm(`Delete category "${category.name}" and its skills?`) && m.removeCategory.mutate(category.id)}
              >
                Delete category
              </button>
            </div>

            <table className="admin-table">
              <tbody>
                {category.skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.name}</td>
                    <td className="muted">{proficiencyLabel(skill.level)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => m.removeSkill.mutate(skill.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="field--row" style={{ marginTop: 'var(--space-3)' }}>
              <input
                type="text"
                placeholder="New skill name"
                value={draft.name}
                onChange={(e) => setDraft(category.id, { ...draft, name: e.target.value })}
              />
              <select value={draft.level} onChange={(e) => setDraft(category.id, { ...draft, level: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{proficiencyLabel(n)}</option>)}
              </select>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => addSkill(category.id)} disabled={m.createSkill.isPending}>
                Add skill
              </button>
            </div>
          </section>
        );
      })}
    </>
  );
}
