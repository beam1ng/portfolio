using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class ExperienceRepository(PortfolioDbContext db) : IExperienceRepository
{
    public async Task<IReadOnlyList<ExperienceItem>> ListAsync(CancellationToken cancellationToken) =>
        await db.ExperienceItems
            .AsNoTracking()
            .OrderBy(e => e.SortOrder)
            .ThenByDescending(e => e.StartDate)
            .ToListAsync(cancellationToken);

    public Task<ExperienceItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.ExperienceItems.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task AddAsync(ExperienceItem item, CancellationToken cancellationToken) =>
        await db.ExperienceItems.AddAsync(item, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await db.ExperienceItems.FindAsync([id], cancellationToken);
        if (item is null)
        {
            return false;
        }

        db.ExperienceItems.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
