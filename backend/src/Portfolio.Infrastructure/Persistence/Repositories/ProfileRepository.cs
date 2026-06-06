using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class ProfileRepository(PortfolioDbContext db) : IProfileRepository
{
    public Task<Profile?> GetAsync(CancellationToken cancellationToken) =>
        db.Profiles.AsNoTracking().FirstOrDefaultAsync(cancellationToken);

    public Task<Profile?> GetTrackedAsync(CancellationToken cancellationToken) =>
        db.Profiles.FirstOrDefaultAsync(cancellationToken);

    public async Task AddAsync(Profile profile, CancellationToken cancellationToken) =>
        await db.Profiles.AddAsync(profile, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
