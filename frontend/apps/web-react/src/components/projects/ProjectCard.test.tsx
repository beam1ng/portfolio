import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ProjectSummary } from '@portfolio/api-client';
import { ProjectCard } from './ProjectCard';

function makeProject(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    id: '1',
    title: 'Portfolio Platform',
    slug: 'portfolio-platform',
    summary: 'A full-stack portfolio.',
    imageUrl: null,
    liveUrl: null,
    repoUrl: null,
    isFeatured: false,
    technologies: [
      { id: 't1', name: 'React', slug: 'react', category: null, iconUrl: null, proficiency: 5, note: null },
      { id: 't2', name: 'C#', slug: 'csharp', category: null, iconUrl: null, proficiency: 5, note: null },
    ],
    ...overrides,
  };
}

function renderCard(project: ProjectSummary) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} index={0} />
    </MemoryRouter>,
  );
}

describe('ProjectCard', () => {
  it('links to the project detail route by slug', () => {
    renderCard(makeProject());
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/portfolio-platform');
  });

  it('renders title, summary and technology tags', () => {
    renderCard(makeProject());
    expect(screen.getByRole('heading', { name: 'Portfolio Platform' })).toBeInTheDocument();
    expect(screen.getByText('A full-stack portfolio.')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('C#')).toBeInTheDocument();
  });

  it('shows a Featured badge only for featured projects', () => {
    const { rerender } = renderCard(makeProject({ isFeatured: true }));
    expect(screen.getByText('Featured')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ProjectCard project={makeProject({ isFeatured: false })} index={0} />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('collapses overflow technologies into a +N tag', () => {
    const many = makeProject({
      technologies: Array.from({ length: 7 }, (_, i) => ({
        id: `t${i}`,
        name: `Tech${i}`,
        slug: `tech-${i}`,
        category: null,
        iconUrl: null,
        proficiency: 3,
        note: null,
      })),
    });
    renderCard(many);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
});
