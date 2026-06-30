using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class TestimonialRepository(PortfolioDbContext db) : ITestimonialRepository
{
    public async Task<IReadOnlyList<Testimonial>> ListAsync(CancellationToken cancellationToken) =>
        await db.Testimonials
            .AsNoTracking()
            .OrderBy(e => e.SortOrder)
            .ThenByDescending(e => e.ReceivedDate)
            .ToListAsync(cancellationToken);

    public Task<Testimonial?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Testimonials.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task AddAsync(Testimonial item, CancellationToken cancellationToken) =>
        await db.Testimonials.AddAsync(item, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await db.Testimonials.FindAsync([id], cancellationToken);
        if (item is null)
        {
            return false;
        }

        db.Testimonials.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
