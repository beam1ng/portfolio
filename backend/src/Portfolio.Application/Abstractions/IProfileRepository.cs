using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to the single portfolio <see cref="Profile"/>.</summary>
public interface IProfileRepository
{
    /// <summary>Reads the profile without tracking (for public queries).</summary>
    public Task<Profile?> GetAsync(CancellationToken cancellationToken);

    /// <summary>Reads the tracked profile for editing, or null if none exists yet.</summary>
    public Task<Profile?> GetTrackedAsync(CancellationToken cancellationToken);

    /// <summary>Stages a new profile for insert. Call <see cref="SaveChangesAsync"/> to commit.</summary>
    public Task AddAsync(Profile profile, CancellationToken cancellationToken);

    /// <summary>Commits pending changes (unit of work).</summary>
    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
