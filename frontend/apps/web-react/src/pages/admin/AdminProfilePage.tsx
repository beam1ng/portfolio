import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, type UpsertProfileRequest } from '@portfolio/api-client';
import { useProfile } from '../../api/queries';
import { useProfileMutation } from '../../admin/queries';
import { ErrorState, LoadingState } from '../../components/ui/States';
import './admin.css';

type ProfileForm = {
  [K in keyof UpsertProfileRequest]: string;
} & { fullName: string; headline: string; bio: string };

const EMPTY: ProfileForm = {
  fullName: '', headline: '', bio: '', location: '', avatarUrl: '', resumeUrl: '',
  email: '', gitHubUrl: '', linkedInUrl: '', websiteUrl: '',
};

export function AdminProfilePage() {
  const query = useProfile();
  const mutation = useProfileMutation();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (query.data) {
      const p = query.data;
      setForm({
        fullName: p.fullName, headline: p.headline, bio: p.bio,
        location: p.location ?? '', avatarUrl: p.avatarUrl ?? '', resumeUrl: p.resumeUrl ?? '',
        email: p.email ?? '', gitHubUrl: p.gitHubUrl ?? '', linkedInUrl: p.linkedInUrl ?? '', websiteUrl: p.websiteUrl ?? '',
      });
    }
  }, [query.data]);

  if (query.isPending) return <LoadingState label="Loading profile…" />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;

  const set = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trim = (s: string): string | null => (s.trim().length > 0 ? s.trim() : null);
    const body: UpsertProfileRequest = {
      fullName: form.fullName.trim(),
      headline: form.headline.trim(),
      bio: form.bio,
      location: trim(form.location ?? ''),
      avatarUrl: trim(form.avatarUrl ?? ''),
      resumeUrl: trim(form.resumeUrl ?? ''),
      email: trim(form.email ?? ''),
      gitHubUrl: trim(form.gitHubUrl ?? ''),
      linkedInUrl: trim(form.linkedInUrl ?? ''),
      websiteUrl: trim(form.websiteUrl ?? ''),
    };
    mutation.mutate(body, { onSuccess: () => setSaved(true) });
  };

  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError ? mutation.error.message : 'Save failed.'
    : null;

  return (
    <>
      <div className="admin__header">
        <div>
          <span className="eyebrow">Content</span>
          <h1 className="section-title">Profile</h1>
        </div>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {saved && <p className="muted">Saved ✓</p>}

        <div className="field-grid">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="headline">Headline</label>
            <input id="headline" type="text" required value={form.headline} onChange={(e) => set('headline', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" type="text" value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="gitHubUrl">GitHub URL</label>
            <input id="gitHubUrl" type="url" value={form.gitHubUrl ?? ''} onChange={(e) => set('gitHubUrl', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="linkedInUrl">LinkedIn URL</label>
            <input id="linkedInUrl" type="url" value={form.linkedInUrl ?? ''} onChange={(e) => set('linkedInUrl', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="websiteUrl">Website URL</label>
            <input id="websiteUrl" type="url" value={form.websiteUrl ?? ''} onChange={(e) => set('websiteUrl', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="avatarUrl">Avatar URL</label>
            <input id="avatarUrl" type="url" value={form.avatarUrl ?? ''} onChange={(e) => set('avatarUrl', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </>
  );
}
