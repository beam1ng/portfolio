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
}
