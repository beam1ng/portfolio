using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class SkillRepository(PortfolioDbContext db) : ISkillRepository
{
    public Task<Skill?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Skills.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task AddAsync(Skill skill, CancellationToken cancellationToken) =>
        await db.Skills.AddAsync(skill, cancellationToken);

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var skill = await db.Skills.FindAsync([id], cancellationToken);
        if (skill is null)
        {
            return false;
        }

        db.Skills.Remove(skill);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken) =>
        db.SkillCategories.AnyAsync(c => c.Id == categoryId, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
