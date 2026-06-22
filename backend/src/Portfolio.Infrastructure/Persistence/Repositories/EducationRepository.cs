using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class EducationRepository(PortfolioDbContext db) : IEducationRepository
{
    public async Task<IReadOnlyList<EducationItem>> ListAsync(CancellationToken cancellationToken) =>
        await db.EducationItems
            .AsNoTracking()
            .OrderBy(e => e.SortOrder)
            .ThenByDescending(e => e.EndDate)
            .ToListAsync(cancellationToken);

    public Task<EducationItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.EducationItems.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task AddAsync(EducationItem item, CancellationToken cancellationToken) =>
        await db.EducationItems.AddAsync(item, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await db.EducationItems.FindAsync([id], cancellationToken);
        if (item is null)
        {
            return false;
        }

        db.EducationItems.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
