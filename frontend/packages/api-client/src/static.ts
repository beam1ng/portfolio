import { ApiError, type PortfolioClient } from './client.js';
import type {
  PortfolioContent,
  ProjectDetail,
  ProjectSummary,
} from './types.js';

function toSummary(project: ProjectDetail): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    imageUrl: project.imageUrl,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    isFeatured: project.isFeatured,
    technologies: project.technologies,
  };
}

function notAvailable(): never {
  throw new ApiError('This is a static build — the admin API is not available.', 0);
}

/**
 * A read-only {@link PortfolioClient} backed by a bundled `content.json` instead
 * of a live API. Auth/admin methods are inert stubs (admin routes are not shipped
 * in static builds). The content is fetched once and cached.
 */
export function createStaticPortfolioClient(contentUrl: string): PortfolioClient {
  let cache: Promise<PortfolioContent> | null = null;

  const load = (signal?: AbortSignal): Promise<PortfolioContent> => {
    cache ??= fetch(contentUrl, { signal, headers: { Accept: 'application/json' } }).then(
      async (response) => {
        if (!response.ok) {
          throw new ApiError(`Failed to load content (${response.status}).`, response.status);
        }
        return (await response.json()) as PortfolioContent;
      },
    );
    return cache;
  };

  return {
    getProfile: async (signal) => (await load(signal)).profile,

    listProjects: async (featured, signal) => {
      const { projects } = await load(signal);
      const summaries = projects.map(toSummary);
      return featured ? summaries.filter((p) => p.isFeatured) : summaries;
    },

    getProject: async (slug, signal) => {
      const { projects } = await load(signal);
      const match = projects.find((p) => p.slug === slug);
      if (!match) {
        throw new ApiError(`Project '${slug}' not found.`, 404);
      }
      return match;
    },

    listSkills: async (signal) => (await load(signal)).skills,
    listTechnologies: async (signal) => (await load(signal)).technologies,
    listExperience: async (signal) => (await load(signal)).experience ?? [],
    listEducation: async (signal) => (await load(signal)).education ?? [],

    auth: {
      login: notAvailable,
      logout: notAvailable,
      me: notAvailable,
    },
    admin: {
      listProjects: notAvailable,
      getProject: notAvailable,
      createProject: notAvailable,
      updateProject: notAvailable,
      deleteProject: notAvailable,
      listTechnologies: notAvailable,
      createTechnology: notAvailable,
      updateTechnology: notAvailable,
      deleteTechnology: notAvailable,
      listSkills: notAvailable,
      createSkillCategory: notAvailable,
      updateSkillCategory: notAvailable,
      deleteSkillCategory: notAvailable,
      createSkill: notAvailable,
      updateSkill: notAvailable,
      deleteSkill: notAvailable,
      updateProfile: notAvailable,
      listExperience: notAvailable,
      createExperience: notAvailable,
      updateExperience: notAvailable,
      deleteExperience: notAvailable,
      listEducation: notAvailable,
      createEducation: notAvailable,
      updateEducation: notAvailable,
      deleteEducation: notAvailable,
      uploadImage: notAvailable,
      uploadDocument: notAvailable,
    },
  };
}
