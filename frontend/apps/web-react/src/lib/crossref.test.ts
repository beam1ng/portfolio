import { describe, expect, it } from 'vitest';
import type { ProjectSummary, ProjectTechnology } from '@portfolio/api-client';
import {
  projectsUsingSkill,
  projectsUsingTechSlug,
  techNameForSlug,
  techSlugForSkill,
} from './crossref';

function tech(name: string, slug: string, note: string | null = null): ProjectTechnology {
  return { id: slug, name, slug, category: null, iconUrl: null, proficiency: 4, note };
}

function project(title: string, slug: string, techs: ProjectTechnology[]): ProjectSummary {
  return {
    id: slug,
    title,
    slug,
    summary: '',
    imageUrl: null,
    liveUrl: null,
    repoUrl: null,
    isFeatured: false,
    technologies: techs,
  };
}

const react = tech('React', 'react', 'SPA frontend');
const csharp = tech('C#', 'csharp');
const projects: ProjectSummary[] = [
  project('Web App', 'web-app', [react, csharp]),
  project('API', 'api', [csharp]),
  project('Game', 'game', [tech('Unity', 'unity')]),
];

describe('projectsUsingSkill', () => {
  it('matches by technology name, case-insensitively', () => {
    expect(projectsUsingSkill(projects, 'react').map((p) => p.slug)).toEqual(['web-app']);
    expect(projectsUsingSkill(projects, 'c#').map((p) => p.slug)).toEqual(['web-app', 'api']);
  });

  it('returns empty when no technology name matches the skill', () => {
    expect(projectsUsingSkill(projects, 'SQL')).toEqual([]);
  });

  it('carries the per-project usage note when present', () => {
    expect(projectsUsingSkill(projects, 'React')[0]?.note).toBe('SPA frontend');
    expect(projectsUsingSkill(projects, 'C#')[0]?.note).toBeNull();
  });
});

describe('projectsUsingTechSlug', () => {
  it('filters projects to those using the slug', () => {
    expect(projectsUsingTechSlug(projects, 'csharp').map((p) => p.slug)).toEqual(['web-app', 'api']);
    expect(projectsUsingTechSlug(projects, 'unknown')).toEqual([]);
  });
});

describe('techNameForSlug', () => {
  it('resolves a slug to its display name, or null', () => {
    expect(techNameForSlug(projects, 'react')).toBe('React');
    expect(techNameForSlug(projects, 'nope')).toBeNull();
  });
});

describe('techSlugForSkill', () => {
  it('resolves a skill name to its matching technology slug, case-insensitively', () => {
    expect(techSlugForSkill(projects, 'C#')).toBe('csharp');
    expect(techSlugForSkill(projects, 'react')).toBe('react');
  });

  it('returns null when no technology matches the skill name', () => {
    expect(techSlugForSkill(projects, 'SQL')).toBeNull();
  });
});
