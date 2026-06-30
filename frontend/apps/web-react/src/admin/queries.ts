import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  EducationItem,
  ExperienceItem,
  ProjectDetail,
  ProjectSummary,
  Technology,
  Testimonial,
  UpsertEducationRequest,
  UpsertExperienceRequest,
  UpsertProfileRequest,
  UpsertProjectRequest,
  UpsertTechnologyRequest,
  UpsertTestimonialRequest,
} from '@portfolio/api-client';
import { api } from '../lib/apiClient';

export const adminKeys = {
  projects: ['admin', 'projects'] as const,
  project: (id: string) => ['admin', 'project', id] as const,
  technologies: ['admin', 'technologies'] as const,
  experience: ['admin', 'experience'] as const,
  education: ['admin', 'education'] as const,
  testimonials: ['admin', 'testimonials'] as const,
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

export function useAdminTestimonials(): UseQueryResult<readonly Testimonial[]> {
  return useQuery({ queryKey: adminKeys.testimonials, queryFn: ({ signal }) => api.admin.listTestimonials(signal) });
}

export function useTestimonialMutations() {
  const invalidate = useInvalidateAll();
  const create = useMutation({
    mutationFn: (body: UpsertTestimonialRequest) => api.admin.createTestimonial(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertTestimonialRequest }) => api.admin.updateTestimonial(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteTestimonial(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
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


export function useProfileMutation() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (body: UpsertProfileRequest) => api.admin.updateProfile(body),
    onSuccess: invalidate,
  });
}

export function useAdminExperience(): UseQueryResult<readonly ExperienceItem[]> {
  return useQuery({ queryKey: adminKeys.experience, queryFn: ({ signal }) => api.admin.listExperience(signal) });
}

export function useExperienceMutations() {
  const invalidate = useInvalidateAll();
  const create = useMutation({
    mutationFn: (body: UpsertExperienceRequest) => api.admin.createExperience(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertExperienceRequest }) => api.admin.updateExperience(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteExperience(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useAdminEducation(): UseQueryResult<readonly EducationItem[]> {
  return useQuery({ queryKey: adminKeys.education, queryFn: ({ signal }) => api.admin.listEducation(signal) });
}

export function useEducationMutations() {
  const invalidate = useInvalidateAll();
  const create = useMutation({
    mutationFn: (body: UpsertEducationRequest) => api.admin.createEducation(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertEducationRequest }) => api.admin.updateEducation(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteEducation(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
