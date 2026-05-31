using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Application.Abstractions;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Infrastructure.Persistence.Repositories;

namespace Portfolio.Infrastructure;

/// <summary>
/// Registers infrastructure services (EF Core, repositories) into DI.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException(
                "Connection string 'Default' is not configured.");

        services.AddDbContext<PortfolioDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsAssembly(typeof(PortfolioDbContext).Assembly.FullName)));

        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<ISkillCategoryRepository, SkillCategoryRepository>();
        services.AddScoped<ITechnologyRepository, TechnologyRepository>();

        return services;
    }
}
