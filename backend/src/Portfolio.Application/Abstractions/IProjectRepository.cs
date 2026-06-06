using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to <see cref="Project"/> aggregates.</summary>
public interface IProjectRepository
{
    /// <summary>
    /// Lists projects ordered by <see cref="Project.SortOrder"/>, including technologies.
    /// When <paramref name="featuredOnly"/> is true, returns only featured projects.
    /// </summary>
    public Task<IReadOnlyList<Project>> ListAsync(bool featuredOnly, CancellationToken cancellationToken);

    /// <summary>Finds a single project by slug, including its technologies.</summary>
    public Task<Project?> GetBySlugAsync(string slug, CancellationToken cancellationToken);

    /// <summary>Lists every project (admin view), including technologies.</summary>
    public Task<IReadOnlyList<Project>> ListAllAsync(CancellationToken cancellationToken);

    /// <summary>Finds a tracked project by id (with technologies) for editing.</summary>
    public Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>Stages a new project for insert. Call <see cref="SaveChangesAsync"/> to commit.</summary>
    public Task AddAsync(Project project, CancellationToken cancellationToken);

    /// <summary>Deletes a project by id; returns false when it does not exist.</summary>
    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>True when another project already uses the slug (optionally excluding one id).</summary>
    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken);

    /// <summary>Commits pending changes (unit of work).</summary>
    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
