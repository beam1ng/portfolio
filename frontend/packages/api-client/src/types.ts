/**
 * Wire types mirroring the backend DTOs and response envelope.
 * Backend serializes with System.Text.Json defaults (camelCase).
 * Keep these in sync with `Portfolio.Application/Dtos` and `ApiResponse<T>`.
 */

/** Consistent envelope returned by every API endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: unknown;
}

export interface Profile {
  fullName: string;
  headline: string;
  bio: string;
  location: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  email: string | null;
  gitHubUrl: string | null;
  linkedInUrl: string | null;
  websiteUrl: string | null;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  iconUrl: string | null;
  /** ProficiencyLevel enum as int (1=Beginner … 5=Expert). */
  proficiency: number;
}

/** A technology as used by a specific project, with an optional usage note. */
export interface ProjectTechnology extends Technology {
  note: string | null;
}

export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  isFeatured: boolean;
  technologies: readonly ProjectTechnology[];
}

export interface ProjectDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  isFeatured: boolean;
  startDate: string | null;
  endDate: string | null;
  technologies: readonly ProjectTechnology[];
}

export interface Skill {
  id: string;
  name: string;
  /** 1–5 proficiency scale. */
  level: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  skills: readonly Skill[];
}

// ---- Static hosting ----
/** The whole portfolio baked into one JSON file for static (no-API) hosting. */
export interface PortfolioContent {
  profile: Profile;
  projects: readonly ProjectDetail[];
  skills: readonly SkillCategory[];
  technologies: readonly Technology[];
}

// ---- Auth ----
export interface AuthUser {
  email: string;
}

// ---- Admin write payloads (mirror the backend Upsert*Request records) ----
export interface UpsertProjectTechnology {
  technologyId: string;
  note: string | null;
}

export interface UpsertProjectRequest {
  title: string;
  slug: string;
  summary: string;
  description: string;
  repoUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  technologies: readonly UpsertProjectTechnology[];
}

export interface UpsertTechnologyRequest {
  name: string;
  slug: string;
  category: string | null;
  iconUrl: string | null;
  proficiency: number;
}

export interface UpsertSkillCategoryRequest {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface UpsertSkillRequest {
  skillCategoryId: string;
  name: string;
  level: number;
  sortOrder: number;
}

export interface UpsertProfileRequest {
  fullName: string;
  headline: string;
  bio: string;
  location: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  email: string | null;
  gitHubUrl: string | null;
  linkedInUrl: string | null;
  websiteUrl: string | null;
}
