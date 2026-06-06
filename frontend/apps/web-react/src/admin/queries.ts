import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  ProjectDetail,
  ProjectSummary,
  SkillCategory,
  Technology,
  UpsertProfileRequest,
  UpsertProjectRequest,
  UpsertSkillCategoryRequest,
  UpsertSkillRequest,
  UpsertTechnologyRequest,
} from '@portfolio/api-client';
import { api } from '../lib/apiClient';

export const adminKeys = {
  projects: ['admin', 'projects'] as const,
  project: (id: string) => ['admin', 'project', id] as const,
  technologies: ['admin', 'technologies'] as const,
  skills: ['admin', 'skills'] as const,
};

// ---- Queries ----
export function useAdminProjects(): UseQueryResult<readonly ProjectSummary[]> {
  return useQuery({ queryKey: adminKeys.projects, queryFn: ({ signal }) => api.admin.listProjects(signal) });
}

export function useAdminProject(id: string): UseQueryResult<ProjectDetail> {
  return useQuery({
    queryKey: adminKeys.project(id),
    queryFn: ({ signal }) => api.admin.getProject(id, signal),
    enabled: id.length > 0,
  });
}

export function useAdminTechnologies(): UseQueryResult<readonly Technology[]> {
  return useQuery({ queryKey: adminKeys.technologies, queryFn: ({ signal }) => api.admin.listTechnologies(signal) });
}

export function useAdminSkills(): UseQueryResult<readonly SkillCategory[]> {
  return useQuery({ queryKey: adminKeys.skills, queryFn: ({ signal }) => api.admin.listSkills(signal) });
}

// ---- Mutations (invalidate everything so admin + public stay fresh) ----
function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}

export function useProjectMutations() {
  const invalidate = useInvalidateAll();
  const create = useMutation({
    mutationFn: (body: UpsertProjectRequest) => api.admin.createProject(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertProjectRequest }) => api.admin.updateProject(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteProject(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useTechnologyMutations() {
  const invalidate = useInvalidateAll();
  const create = useMutation({
    mutationFn: (body: UpsertTechnologyRequest) => api.admin.createTechnology(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertTechnologyRequest }) => api.admin.updateTechnology(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteTechnology(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useSkillMutations() {
  const invalidate = useInvalidateAll();
  const createCategory = useMutation({
    mutationFn: (body: UpsertSkillCategoryRequest) => api.admin.createSkillCategory(body),
    onSuccess: invalidate,
  });
  const updateCategory = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertSkillCategoryRequest }) =>
      api.admin.updateSkillCategory(id, body),
    onSuccess: invalidate,
  });
  const removeCategory = useMutation({
    mutationFn: (id: string) => api.admin.deleteSkillCategory(id),
    onSuccess: invalidate,
  });
  const createSkill = useMutation({
    mutationFn: (body: UpsertSkillRequest) => api.admin.createSkill(body),
    onSuccess: invalidate,
  });
  const updateSkill = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertSkillRequest }) => api.admin.updateSkill(id, body),
    onSuccess: invalidate,
  });
  const removeSkill = useMutation({
    mutationFn: (id: string) => api.admin.deleteSkill(id),
    onSuccess: invalidate,
  });
  return { createCategory, updateCategory, removeCategory, createSkill, updateSkill, removeSkill };
}

export function useProfileMutation() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (body: UpsertProfileRequest) => api.admin.updateProfile(body),
    onSuccess: invalidate,
  });
}
