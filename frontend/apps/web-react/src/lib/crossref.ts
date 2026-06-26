import type { ProjectSummary } from '@portfolio/api-client';

export interface ProjectRef {
  slug: string;
  title: string;
  /** How the skill was used in this project (from the project↔technology note). */
  note: string | null;
}

/**
 * Projects that use the technology with the given slug, each with the
 * per-project usage note. Backs the Skills page "used in" links via the real
 * project↔technology relation (no fragile name matching).
 */
export function projectsUsingTech(
  projects: readonly ProjectSummary[],
  techSlug: string,
): ProjectRef[] {
  const refs: ProjectRef[] = [];
  for (const project of projects) {
    const match = project.technologies.find((tech) => tech.slug === techSlug);
    if (match) {
      refs.push({ slug: project.slug, title: project.title, note: match.note });
    }
  }
  return refs;
}

/** Filters projects to those using the technology with the given slug. */
export function projectsUsingTechSlug(
  projects: readonly ProjectSummary[],
  techSlug: string,
): readonly ProjectSummary[] {
  return projects.filter((project) => project.technologies.some((tech) => tech.slug === techSlug));
}

/** Resolves a technology slug to its display name from a project set. */
export function techNameForSlug(
  projects: readonly ProjectSummary[],
  techSlug: string,
): string | null {
  for (const project of projects) {
    const match = project.technologies.find((tech) => tech.slug === techSlug);
    if (match) {
      return match.name;
    }
  }
  return null;
}

