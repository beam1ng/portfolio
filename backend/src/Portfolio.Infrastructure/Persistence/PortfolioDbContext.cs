using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Common;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Identity;

namespace Portfolio.Infrastructure.Persistence;

/// <summary>
/// EF Core database context for portfolio content and admin identity.
/// </summary>
public class PortfolioDbContext(DbContextOptions<PortfolioDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Technology> Technologies => Set<Technology>();
    public DbSet<ProjectTechnology> ProjectTechnologies => Set<ProjectTechnology>();
    public DbSet<SkillCategory> SkillCategories => Set<SkillCategory>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<ExperienceItem> ExperienceItems => Set<ExperienceItem>();
    public DbSet<EducationItem> EducationItems => Set<EducationItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(PortfolioDbContext).Assembly);
    }

    /// <summary>Stamps audit timestamps on insert/update.</summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = now;
                entry.Entity.UpdatedAtUtc = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
