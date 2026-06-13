import type { ProjectSummary } from '@portfolio/api-client';

export interface ProjectRef {
  slug: string;
  title: string;
  /** How the skill was used in this project (from the project↔technology note). */
  note: string | null;
}

/**
 * Projects whose technologies include one matching the given name
 * (case-insensitive). Used to link a skill to the projects it appears in,
 * without a stored skill↔project relation. Carries the per-project usage note.
 */
export function projectsUsingSkill(
  projects: readonly ProjectSummary[],
  skillName: string,
): ProjectRef[] {
  const needle = skillName.trim().toLowerCase();
  const refs: ProjectRef[] = [];
  for (const project of projects) {
    const match = project.technologies.find(
      (tech) => tech.name.trim().toLowerCase() === needle,
    );
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

/**
 * Resolves a skill name to the slug of the technology with the same name, so a
 * skill links to the same "projects using X" view as a project's tech pill.
 * Returns null when no project technology matches the skill name.
 */
export function techSlugForSkill(
  projects: readonly ProjectSummary[],
  skillName: string,
): string | null {
  const needle = skillName.trim().toLowerCase();
  for (const project of projects) {
    const match = project.technologies.find((tech) => tech.name.trim().toLowerCase() === needle);
    if (match) {
      return match.slug;
    }
  }
  return null;
}
