using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class ProjectRepository(PortfolioDbContext db) : IProjectRepository
{
    public async Task<IReadOnlyList<Project>> ListAsync(bool featuredOnly, CancellationToken cancellationToken)
    {
        var query = db.Projects
            .AsNoTracking()
            .Include(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .AsQueryable();

        if (featuredOnly)
        {
            query = query.Where(p => p.IsFeatured);
        }

        return await query
            .OrderBy(p => p.SortOrder)
            .ThenByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);
    }

    public Task<Project?> GetBySlugAsync(string slug, CancellationToken cancellationToken) =>
        db.Projects
            .AsNoTracking()
            .Include(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
}
