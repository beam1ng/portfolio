using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read access to <see cref="Technology"/> entities.</summary>
public interface ITechnologyRepository
{
    public Task<IReadOnlyList<Technology>> ListAsync(CancellationToken cancellationToken);
}
