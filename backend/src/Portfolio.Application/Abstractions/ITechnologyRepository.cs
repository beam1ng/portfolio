using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to <see cref="Technology"/> entities.</summary>
public interface ITechnologyRepository
{
    public Task<IReadOnlyList<Technology>> ListAsync(CancellationToken cancellationToken);

    public Task<Technology?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    public Task AddAsync(Technology technology, CancellationToken cancellationToken);

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
