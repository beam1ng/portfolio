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
}
