import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type {
  EducationItem,
  ExperienceItem,
  Profile,
  ProjectDetail,
  ProjectSummary,
  SkillCategory,
  Technology,
} from '@portfolio/api-client';
import { api } from '../lib/apiClient';

/** Centralized query keys so caches and invalidation stay consistent. */
export const queryKeys = {
  profile: ['profile'] as const,
  projects: (featured: boolean) => ['projects', { featured }] as const,
  project: (slug: string) => ['project', slug] as const,
  skills: ['skills'] as const,
  technologies: ['technologies'] as const,
  experience: ['experience'] as const,
  education: ['education'] as const,
};

export function useProfile(): UseQueryResult<Profile> {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: ({ signal }) => api.getProfile(signal),
  });
}

export function useProjects(featured = false): UseQueryResult<readonly ProjectSummary[]> {
  return useQuery({
    queryKey: queryKeys.projects(featured),
    queryFn: ({ signal }) => api.listProjects(featured, signal),
  });
}

export function useProject(slug: string): UseQueryResult<ProjectDetail> {
  return useQuery({
    queryKey: queryKeys.project(slug),
    queryFn: ({ signal }) => api.getProject(slug, signal),
    enabled: slug.length > 0,
  });
}

export function useSkills(): UseQueryResult<readonly SkillCategory[]> {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: ({ signal }) => api.listSkills(signal),
  });
}

export function useTechnologies(): UseQueryResult<readonly Technology[]> {
  return useQuery({
    queryKey: queryKeys.technologies,
    queryFn: ({ signal }) => api.listTechnologies(signal),
  });
}

export function useExperience(): UseQueryResult<readonly ExperienceItem[]> {
  return useQuery({
    queryKey: queryKeys.experience,
    queryFn: ({ signal }) => api.listExperience(signal),
  });
}

export function useEducation(): UseQueryResult<readonly EducationItem[]> {
  return useQuery({
    queryKey: queryKeys.education,
    queryFn: ({ signal }) => api.listEducation(signal),
  });
}
