using Portfolio.Domain.Entities;

namespace Portfolio.Application.Abstractions;

/// <summary>Read and write access to <see cref="Testimonial"/> entities.</summary>
public interface ITestimonialRepository
{
    public Task<IReadOnlyList<Testimonial>> ListAsync(CancellationToken cancellationToken);

    public Task<Testimonial?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    public Task AddAsync(Testimonial item, CancellationToken cancellationToken);

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken);
}
