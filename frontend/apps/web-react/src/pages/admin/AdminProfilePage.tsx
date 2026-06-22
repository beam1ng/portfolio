import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { ApiError, type UpsertProfileRequest } from '@portfolio/api-client';
import { useProfile } from '../../api/queries';
import { useProfileMutation } from '../../admin/queries';
import { api } from '../../lib/apiClient';
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
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

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

  // Upload a single image and set it as the avatar (same endpoint as project covers).
  const uploadAvatar = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsAvatarUploading(true);
    setAvatarError(null);
    try {
      const { url } = await api.admin.uploadImage(file);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      setSaved(false);
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const onAvatarDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsAvatarDragOver(false);
    void uploadAvatar(event.dataTransfer.files?.[0]);
  };

  // Upload the résumé PDF and set it as the CV link.
  const uploadResume = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setResumeError('Please choose a PDF file.');
      return;
    }
    setIsResumeUploading(true);
    setResumeError(null);
    try {
      const { url } = await api.admin.uploadDocument(file);
      setForm((prev) => ({ ...prev, resumeUrl: url }));
      setSaved(false);
    } catch (err) {
      setResumeError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setIsResumeUploading(false);
    }
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
        </div>

        <div className="field">
          <label>
            Avatar <span className="muted">(shown in the home hero; optional)</span>
          </label>
          <div className="cover-uploader">
            {form.avatarUrl
              ? <img className="cover-uploader__thumb cover-uploader__thumb--round" src={form.avatarUrl} alt="" />
              : <div className="cover-uploader__thumb cover-uploader__thumb--round cover-uploader__thumb--empty">No avatar</div>}
            <div className="cover-uploader__body">
              <div
                className={`dropzone dropzone--compact${isAvatarDragOver ? ' dropzone--over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsAvatarDragOver(true); }}
                onDragLeave={() => setIsAvatarDragOver(false)}
                onDrop={onAvatarDrop}
                onClick={() => avatarInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avatarInputRef.current?.click(); } }}
              >
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { void uploadAvatar(e.target.files?.[0]); e.target.value = ''; }}
                />
                <span className="dropzone__label">
                  {isAvatarUploading ? 'Uploading…' : 'Drag a photo here, or click to choose.'}
                </span>
              </div>
              <input
                type="text"
                placeholder="…or paste an image URL"
                value={form.avatarUrl ?? ''}
                onChange={(e) => set('avatarUrl', e.target.value)}
              />
              {form.avatarUrl && (
                <button type="button" className="btn btn--danger btn--sm" onClick={() => set('avatarUrl', '')}>
                  Remove avatar
                </button>
              )}
            </div>
          </div>
          {avatarError && <p className="form-error">{avatarError}</p>}
        </div>

        <div className="field">
          <label>
            Résumé / CV <span className="muted">(PDF; shown as “Download CV”)</span>
          </label>
          <div
            className="dropzone dropzone--compact"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void uploadResume(e.dataTransfer.files?.[0]); }}
            onClick={() => resumeInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resumeInputRef.current?.click(); } }}
          >
            <input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => { void uploadResume(e.target.files?.[0]); e.target.value = ''; }}
            />
            <span className="dropzone__label">
              {isResumeUploading ? 'Uploading…' : 'Drop a PDF here, or click to choose.'}
            </span>
          </div>
          {form.resumeUrl && (
            <div className="field--row" style={{ marginTop: 'var(--space-2)' }}>
              <a className="text-link" href={form.resumeUrl} target="_blank" rel="noreferrer noopener">
                View current résumé ↗
              </a>
              <button type="button" className="btn btn--danger btn--sm" onClick={() => set('resumeUrl', '')}>
                Remove
              </button>
            </div>
          )}
          {resumeError && <p className="form-error">{resumeError}</p>}
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
