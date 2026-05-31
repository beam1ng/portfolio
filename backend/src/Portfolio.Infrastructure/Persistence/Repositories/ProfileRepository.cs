using Microsoft.EntityFrameworkCore;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class ProfileRepository(PortfolioDbContext db) : IProfileRepository
{
    public Task<Profile?> GetAsync(CancellationToken cancellationToken) =>
        db.Profiles.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
}
