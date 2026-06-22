import type {
  ApiResponse,
  AuthUser,
  EducationItem,
  ExperienceItem,
  ImageUploadResult,
  Profile,
  ProjectDetail,
  ProjectSummary,
  Skill,
  SkillCategory,
  Technology,
  UpsertProfileRequest,
  UpsertEducationRequest,
  UpsertExperienceRequest,
  UpsertProjectRequest,
  UpsertSkillCategoryRequest,
  UpsertSkillRequest,
  UpsertTechnologyRequest,
} from './types.js';

/** Thrown when the API returns a non-2xx status or an unsuccessful envelope. */
export class ApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface AdminClient {
  listProjects(signal?: AbortSignal): Promise<readonly ProjectSummary[]>;
  getProject(id: string, signal?: AbortSignal): Promise<ProjectDetail>;
  createProject(body: UpsertProjectRequest): Promise<ProjectDetail>;
  updateProject(id: string, body: UpsertProjectRequest): Promise<ProjectDetail>;
  deleteProject(id: string): Promise<boolean>;

  listTechnologies(signal?: AbortSignal): Promise<readonly Technology[]>;
  createTechnology(body: UpsertTechnologyRequest): Promise<Technology>;
  updateTechnology(id: string, body: UpsertTechnologyRequest): Promise<Technology>;
  deleteTechnology(id: string): Promise<boolean>;

  listSkills(signal?: AbortSignal): Promise<readonly SkillCategory[]>;
  createSkillCategory(body: UpsertSkillCategoryRequest): Promise<SkillCategory>;
  updateSkillCategory(id: string, body: UpsertSkillCategoryRequest): Promise<SkillCategory>;
  deleteSkillCategory(id: string): Promise<boolean>;
  createSkill(body: UpsertSkillRequest): Promise<Skill>;
  updateSkill(id: string, body: UpsertSkillRequest): Promise<Skill>;
  deleteSkill(id: string): Promise<boolean>;

  updateProfile(body: UpsertProfileRequest): Promise<Profile>;

  listExperience(signal?: AbortSignal): Promise<readonly ExperienceItem[]>;
  createExperience(body: UpsertExperienceRequest): Promise<ExperienceItem>;
  updateExperience(id: string, body: UpsertExperienceRequest): Promise<ExperienceItem>;
  deleteExperience(id: string): Promise<boolean>;

  listEducation(signal?: AbortSignal): Promise<readonly EducationItem[]>;
  createEducation(body: UpsertEducationRequest): Promise<EducationItem>;
  updateEducation(id: string, body: UpsertEducationRequest): Promise<EducationItem>;
  deleteEducation(id: string): Promise<boolean>;

  /** Uploads an image file (multipart) and returns its public URL. */
  uploadImage(file: File): Promise<ImageUploadResult>;

  /** Uploads a document (PDF, e.g. the résumé) and returns its public URL. */
  uploadDocument(file: File): Promise<ImageUploadResult>;
}

export interface AuthClient {
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<boolean>;
  me(signal?: AbortSignal): Promise<AuthUser>;
}

export interface PortfolioClient {
  getProfile(signal?: AbortSignal): Promise<Profile>;
  listProjects(featured: boolean, signal?: AbortSignal): Promise<readonly ProjectSummary[]>;
  getProject(slug: string, signal?: AbortSignal): Promise<ProjectDetail>;
  listSkills(signal?: AbortSignal): Promise<readonly SkillCategory[]>;
  listTechnologies(signal?: AbortSignal): Promise<readonly Technology[]>;
  listExperience(signal?: AbortSignal): Promise<readonly ExperienceItem[]>;
  listEducation(signal?: AbortSignal): Promise<readonly EducationItem[]>;
  readonly auth: AuthClient;
  readonly admin: AdminClient;
}

/** Removes a single trailing slash so `${base}/path` never doubles up. */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined
        ? { Accept: 'application/json' }
        : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include', // send/receive the httpOnly auth cookie
      signal,
    });
  } catch (cause) {
    throw new ApiError(`Network request to ${url} failed: ${(cause as Error).message}`, 0);
  }

  return unwrap<T>(response);
}

/** Parses the standard envelope, throwing {@link ApiError} on any failure. */
async function unwrap<T>(response: Response): Promise<T> {
  let envelope: ApiResponse<T> | null = null;
  try {
    envelope = (await response.json()) as ApiResponse<T>;
  } catch {
    envelope = null;
  }

  if (!response.ok || envelope === null || !envelope.success) {
    const message = envelope?.error ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  if (envelope.data === null) {
    throw new ApiError('API returned a successful response with no data.', response.status);
  }

  return envelope.data;
}

/** POSTs multipart form data (e.g. a file). The browser sets the boundary. */
async function requestForm<T>(url: string, form: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form,
      credentials: 'include',
    });
  } catch (cause) {
    throw new ApiError(`Network request to ${url} failed: ${(cause as Error).message}`, 0);
  }

  return unwrap<T>(response);
}

/** Builds a typed client bound to a base URL such as `/api/v1`. */
export function createPortfolioClient(baseUrl: string): PortfolioClient {
  const base = normalizeBaseUrl(baseUrl);

  const auth: AuthClient = {
    login: (email, password) =>
      request<AuthUser>(`${base}/auth/login`, { method: 'POST', body: { email, password } }),
    logout: () => request<boolean>(`${base}/auth/logout`, { method: 'POST' }),
    me: (signal) => request<AuthUser>(`${base}/auth/me`, { signal }),
  };

  const admin: AdminClient = {
    listProjects: (signal) => request<readonly ProjectSummary[]>(`${base}/admin/projects`, { signal }),
    getProject: (id, signal) => request<ProjectDetail>(`${base}/admin/projects/${id}`, { signal }),
    createProject: (body) => request<ProjectDetail>(`${base}/admin/projects`, { method: 'POST', body }),
    updateProject: (id, body) => request<ProjectDetail>(`${base}/admin/projects/${id}`, { method: 'PUT', body }),
    deleteProject: (id) => request<boolean>(`${base}/admin/projects/${id}`, { method: 'DELETE' }),

    listTechnologies: (signal) => request<readonly Technology[]>(`${base}/admin/technologies`, { signal }),
    createTechnology: (body) => request<Technology>(`${base}/admin/technologies`, { method: 'POST', body }),
    updateTechnology: (id, body) => request<Technology>(`${base}/admin/technologies/${id}`, { method: 'PUT', body }),
    deleteTechnology: (id) => request<boolean>(`${base}/admin/technologies/${id}`, { method: 'DELETE' }),

    listSkills: (signal) => request<readonly SkillCategory[]>(`${base}/admin/skills`, { signal }),
    createSkillCategory: (body) => request<SkillCategory>(`${base}/admin/skill-categories`, { method: 'POST', body }),
    updateSkillCategory: (id, body) => request<SkillCategory>(`${base}/admin/skill-categories/${id}`, { method: 'PUT', body }),
    deleteSkillCategory: (id) => request<boolean>(`${base}/admin/skill-categories/${id}`, { method: 'DELETE' }),
    createSkill: (body) => request<Skill>(`${base}/admin/skills`, { method: 'POST', body }),
    updateSkill: (id, body) => request<Skill>(`${base}/admin/skills/${id}`, { method: 'PUT', body }),
    deleteSkill: (id) => request<boolean>(`${base}/admin/skills/${id}`, { method: 'DELETE' }),

    updateProfile: (body) => request<Profile>(`${base}/admin/profile`, { method: 'PUT', body }),

    listExperience: (signal) => request<readonly ExperienceItem[]>(`${base}/admin/experience`, { signal }),
    createExperience: (body) => request<ExperienceItem>(`${base}/admin/experience`, { method: 'POST', body }),
    updateExperience: (id, body) => request<ExperienceItem>(`${base}/admin/experience/${id}`, { method: 'PUT', body }),
    deleteExperience: (id) => request<boolean>(`${base}/admin/experience/${id}`, { method: 'DELETE' }),

    listEducation: (signal) => request<readonly EducationItem[]>(`${base}/admin/education`, { signal }),
    createEducation: (body) => request<EducationItem>(`${base}/admin/education`, { method: 'POST', body }),
    updateEducation: (id, body) => request<EducationItem>(`${base}/admin/education/${id}`, { method: 'PUT', body }),
    deleteEducation: (id) => request<boolean>(`${base}/admin/education/${id}`, { method: 'DELETE' }),

    uploadImage: (file) => {
      const form = new FormData();
      form.append('file', file);
      return requestForm<ImageUploadResult>(`${base}/admin/uploads/images`, form);
    },

    uploadDocument: (file) => {
      const form = new FormData();
      form.append('file', file);
      return requestForm<ImageUploadResult>(`${base}/admin/uploads/documents`, form);
    },
  };

  return {
    getProfile: (signal) => request<Profile>(`${base}/profile`, { signal }),
    listProjects: (featured, signal) =>
      request<readonly ProjectSummary[]>(`${base}/projects${featured ? '?featured=true' : ''}`, { signal }),
    getProject: (slug, signal) =>
      request<ProjectDetail>(`${base}/projects/${encodeURIComponent(slug)}`, { signal }),
    listSkills: (signal) => request<readonly SkillCategory[]>(`${base}/skills`, { signal }),
    listTechnologies: (signal) => request<readonly Technology[]>(`${base}/technologies`, { signal }),
    listExperience: (signal) => request<readonly ExperienceItem[]>(`${base}/experience`, { signal }),
    listEducation: (signal) => request<readonly EducationItem[]>(`${base}/education`, { signal }),
    auth,
    admin,
  };
}
