import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, type UpsertProjectRequest } from '@portfolio/api-client';
import { useAdminProject, useAdminTechnologies, useProjectMutations } from '../../admin/queries';
import { api } from '../../lib/apiClient';
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
  /** Gallery screenshots, in display order. */
  images: GalleryRow[];
}

interface GalleryRow {
  imageUrl: string;
  caption: string;
}

const EMPTY: ProjectForm = {
  title: '', slug: '', summary: '', description: '',
  repoUrl: '', liveUrl: '', imageUrl: '',
  isFeatured: false, sortOrder: 0, startDate: '', endDate: '',
  technologyIds: [], techNotes: {}, images: [],
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
    images: form.images
      .filter((i) => i.imageUrl.trim().length > 0)
      .map((i) => ({ imageUrl: i.imageUrl.trim(), caption: i.caption.trim() || null })),
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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
        images: (p.images ?? []).map((i) => ({ imageUrl: i.imageUrl, caption: i.caption ?? '' })),
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

  const updateImages = (next: GalleryRow[]) => setForm((prev) => ({ ...prev, images: next }));

  const addImage = () => updateImages([...form.images, { imageUrl: '', caption: '' }]);

  const setImage = (index: number, patch: Partial<GalleryRow>) =>
    updateImages(form.images.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeImage = (index: number) => updateImages(form.images.filter((_, i) => i !== index));

  const moveImage = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[target]] = [next[target]!, next[index]!];
    updateImages(next);
  };

  // Upload dropped/selected files, then append a gallery row per uploaded image.
  const uploadFiles = async (files: FileList | null) => {
    const images = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded: GalleryRow[] = [];
      for (const file of images) {
        const { url } = await api.admin.uploadImage(file);
        uploaded.push({ imageUrl: url, caption: '' });
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    void uploadFiles(event.dataTransfer.files);
  };

  // Upload a single cover image and set it as the project's imageUrl.
  const uploadCover = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsCoverUploading(true);
    setCoverError(null);
    try {
      const { url } = await api.admin.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setCoverError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setIsCoverUploading(false);
    }
  };

  const onCoverDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsCoverDragOver(false);
    void uploadCover(event.dataTransfer.files?.[0]);
  };

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

        <div className="field">
          <label>
            Cover image <span className="muted">(card thumbnail; optional)</span>
          </label>
          <div className="cover-uploader">
            {form.imageUrl
              ? <img className="cover-uploader__thumb" src={form.imageUrl} alt="" />
              : <div className="cover-uploader__thumb cover-uploader__thumb--empty">No cover</div>}
            <div className="cover-uploader__body">
              <div
                className={`dropzone dropzone--compact${isCoverDragOver ? ' dropzone--over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsCoverDragOver(true); }}
                onDragLeave={() => setIsCoverDragOver(false)}
                onDrop={onCoverDrop}
                onClick={() => coverInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); coverInputRef.current?.click(); } }}
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { void uploadCover(e.target.files?.[0]); e.target.value = ''; }}
                />
                <span className="dropzone__label">
                  {isCoverUploading ? 'Uploading…' : 'Drag a cover here, or click to choose.'}
                </span>
              </div>
              <input
                type="text"
                placeholder="…or paste an image URL"
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
              />
              {form.imageUrl && (
                <button type="button" className="btn btn--danger btn--sm" onClick={() => set('imageUrl', '')}>
                  Remove cover
                </button>
              )}
            </div>
          </div>
          {coverError && <p className="form-error">{coverError}</p>}
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

        <div className="field">
          <label>
            Screenshots <span className="muted">(gallery — URL + optional caption, in order)</span>
          </label>
          <div className="gallery-editor">
            <div
              className={`dropzone${isDragOver ? ' dropzone--over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => { void uploadFiles(e.target.files); e.target.value = ''; }}
              />
              <span className="dropzone__label">
                {isUploading ? 'Uploading…' : 'Drag images here, or click to choose. Files are saved to public/images/.'}
              </span>
            </div>
            {uploadError && <p className="form-error">{uploadError}</p>}

            {form.images.map((row, index) => (
              <div key={index} className="gallery-editor__row">
                {row.imageUrl && (
                  <img className="gallery-editor__thumb" src={row.imageUrl} alt="" loading="lazy" />
                )}
                <div className="gallery-editor__fields">
                  <input
                    type="text"
                    placeholder="/images/my-project-1.png"
                    value={row.imageUrl}
                    onChange={(e) => setImage(index, { imageUrl: e.target.value })}
                  />
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Caption (optional)"
                    value={row.caption}
                    onChange={(e) => setImage(index, { caption: e.target.value })}
                  />
                </div>
                <div className="gallery-editor__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => moveImage(index, 1)} disabled={index === form.images.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => removeImage(index)} aria-label="Remove">✕</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn--ghost btn--sm" onClick={addImage}>+ Add screenshot (manual URL)</button>
          </div>
        </div>

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
