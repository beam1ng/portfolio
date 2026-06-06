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

    public async Task<IReadOnlyList<Project>> ListAllAsync(CancellationToken cancellationToken) =>
        await db.Projects
            .AsNoTracking()
            .Include(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .OrderBy(p => p.SortOrder)
            .ThenByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);

    public Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Projects
            .Include(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task AddAsync(Project project, CancellationToken cancellationToken) =>
        await db.Projects.AddAsync(project, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = await db.Projects.FindAsync([id], cancellationToken);
        if (project is null)
        {
            return false;
        }

        db.Projects.Remove(project);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken) =>
        db.Projects.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
