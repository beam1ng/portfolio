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

export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  isFeatured: boolean;
  technologies: readonly Technology[];
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
  technologies: readonly Technology[];
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
