using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to <see cref="SkillCategory"/> aggregates with their skills.</summary>
public interface ISkillCategoryRepository
{
    public Task<IReadOnlyList<SkillCategory>> ListWithSkillsAsync(CancellationToken cancellationToken);

    public Task<SkillCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    public Task AddAsync(SkillCategory category, CancellationToken cancellationToken);

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
