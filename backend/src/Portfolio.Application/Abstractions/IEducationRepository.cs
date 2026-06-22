using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to <see cref="EducationItem"/> entities.</summary>
public interface IEducationRepository
{
    public Task<IReadOnlyList<EducationItem>> ListAsync(CancellationToken cancellationToken);

    public Task<EducationItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    public Task AddAsync(EducationItem item, CancellationToken cancellationToken);

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
