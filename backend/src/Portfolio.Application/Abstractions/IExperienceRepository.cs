using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to <see cref="ExperienceItem"/> entities.</summary>
public interface IExperienceRepository
{
    public Task<IReadOnlyList<ExperienceItem>> ListAsync(CancellationToken cancellationToken);

    public Task<ExperienceItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    public Task AddAsync(ExperienceItem item, CancellationToken cancellationToken);

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
