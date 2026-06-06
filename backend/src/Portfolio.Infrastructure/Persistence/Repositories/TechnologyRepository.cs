using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class TechnologyRepository(PortfolioDbContext db) : ITechnologyRepository
{
    public async Task<IReadOnlyList<Technology>> ListAsync(CancellationToken cancellationToken) =>
        await db.Technologies
            .AsNoTracking()
            .OrderBy(t => t.Category)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);

    public Task<Technology?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Technologies.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task AddAsync(Technology technology, CancellationToken cancellationToken) =>
        await db.Technologies.AddAsync(technology, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var technology = await db.Technologies.FindAsync([id], cancellationToken);
        if (technology is null)
        {
            return false;
        }

        db.Technologies.Remove(technology);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken) =>
        db.Technologies.AnyAsync(t => t.Slug == slug && (excludeId == null || t.Id != excludeId), cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
