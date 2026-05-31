using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read access to <see cref="Project"/> aggregates.</summary>
public interface IProjectRepository
{
    /// <summary>
    /// Lists projects ordered by <see cref="Project.SortOrder"/>, including technologies.
    /// When <paramref name="featuredOnly"/> is true, returns only featured projects.
    /// </summary>
    public Task<IReadOnlyList<Project>> ListAsync(bool featuredOnly, CancellationToken cancellationToken);

    /// <summary>Finds a single project by slug, including its technologies.</summary>
    public Task<Project?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
}
