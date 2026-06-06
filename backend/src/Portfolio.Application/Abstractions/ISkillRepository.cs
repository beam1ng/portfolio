using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Write access to individual <see cref="Skill"/> rows.</summary>
public interface ISkillRepository
{
    public Task<Skill?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    public Task AddAsync(Skill skill, CancellationToken cancellationToken);

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    public Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
