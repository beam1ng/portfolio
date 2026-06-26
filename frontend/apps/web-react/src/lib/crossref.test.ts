import { describe, expect, it } from 'vitest';
import type { ProjectSummary, ProjectTechnology } from '@portfolio/api-client';
import { projectsUsingTech, projectsUsingTechSlug, techNameForSlug } from './crossref';

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

describe('projectsUsingTech', () => {
  it('returns projects using the slug, in order', () => {
    expect(projectsUsingTech(projects, 'csharp').map((p) => p.slug)).toEqual(['web-app', 'api']);
    expect(projectsUsingTech(projects, 'react').map((p) => p.slug)).toEqual(['web-app']);
  });

  it('returns empty when no project uses the slug', () => {
    expect(projectsUsingTech(projects, 'sql')).toEqual([]);
  });

  it('carries the per-project usage note when present', () => {
    expect(projectsUsingTech(projects, 'react')[0]?.note).toBe('SPA frontend');
    expect(projectsUsingTech(projects, 'csharp')[0]?.note).toBeNull();
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
