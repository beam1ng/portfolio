using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read access to the single portfolio <see cref="Profile"/>.</summary>
public interface IProfileRepository
{
    public Task<Profile?> GetAsync(CancellationToken cancellationToken);
}
