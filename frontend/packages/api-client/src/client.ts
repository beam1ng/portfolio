import type {
  ApiResponse,
  Profile,
  ProjectDetail,
  ProjectSummary,
  SkillCategory,
  Technology,
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

export interface PortfolioClient {
  getProfile(signal?: AbortSignal): Promise<Profile>;
  listProjects(featured: boolean, signal?: AbortSignal): Promise<readonly ProjectSummary[]>;
  getProject(slug: string, signal?: AbortSignal): Promise<ProjectDetail>;
  listSkills(signal?: AbortSignal): Promise<readonly SkillCategory[]>;
  listTechnologies(signal?: AbortSignal): Promise<readonly Technology[]>;
}

/** Removes a single trailing slash so `${base}/path` never doubles up. */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (cause) {
    throw new ApiError(
      `Network request to ${url} failed: ${(cause as Error).message}`,
      0,
    );
  }

  let envelope: ApiResponse<T> | null = null;
  try {
    envelope = (await response.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON body (e.g. an unexpected proxy error page).
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

/**
 * Builds a typed client bound to a base URL such as
 * `http://localhost:5050/api/v1`.
 */
export function createPortfolioClient(baseUrl: string): PortfolioClient {
  const base = normalizeBaseUrl(baseUrl);

  return {
    getProfile: (signal) => request<Profile>(`${base}/profile`, signal),
    listProjects: (featured, signal) =>
      request<readonly ProjectSummary[]>(
        `${base}/projects${featured ? '?featured=true' : ''}`,
        signal,
      ),
    getProject: (slug, signal) =>
      request<ProjectDetail>(`${base}/projects/${encodeURIComponent(slug)}`, signal),
    listSkills: (signal) => request<readonly SkillCategory[]>(`${base}/skills`, signal),
    listTechnologies: (signal) =>
      request<readonly Technology[]>(`${base}/technologies`, signal),
  };
}
