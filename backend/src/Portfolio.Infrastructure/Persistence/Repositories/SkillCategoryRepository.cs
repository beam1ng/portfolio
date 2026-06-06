using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class SkillCategoryRepository(PortfolioDbContext db) : ISkillCategoryRepository
{
    public async Task<IReadOnlyList<SkillCategory>> ListWithSkillsAsync(CancellationToken cancellationToken) =>
        await db.SkillCategories
            .AsNoTracking()
            .Include(c => c.Skills)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);

    public Task<SkillCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.SkillCategories
            .Include(c => c.Skills)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task AddAsync(SkillCategory category, CancellationToken cancellationToken) =>
        await db.SkillCategories.AddAsync(category, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await db.SkillCategories.FindAsync([id], cancellationToken);
        if (category is null)
        {
            return false;
        }

        db.SkillCategories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken) =>
        db.SkillCategories.AnyAsync(c => c.Slug == slug && (excludeId == null || c.Id != excludeId), cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
