using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read access to <see cref="SkillCategory"/> aggregates with their skills.</summary>
public interface ISkillCategoryRepository
{
    public Task<IReadOnlyList<SkillCategory>> ListWithSkillsAsync(CancellationToken cancellationToken);
}
