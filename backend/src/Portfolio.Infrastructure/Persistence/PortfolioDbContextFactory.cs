using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Portfolio.Infrastructure.Persistence;

/// <summary>
/// Design-time factory used by <c>dotnet ef</c> (migrations, scaffolding).
/// Reads the connection string from the <c>ConnectionStrings__Default</c>
/// environment variable, or builds a local dev string from
/// <c>MSSQL_SA_PASSWORD</c>. No credentials are hardcoded in source.
/// </summary>
public sealed class PortfolioDbContextFactory : IDesignTimeDbContextFactory<PortfolioDbContext>
{
    public PortfolioDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? BuildLocalConnection();

        var options = new DbContextOptionsBuilder<PortfolioDbContext>()
            .UseSqlServer(connection, sql => sql.MigrationsAssembly(typeof(PortfolioDbContext).Assembly.FullName))
            .Options;

        return new PortfolioDbContext(options);
    }

    private static string BuildLocalConnection()
    {
        var password = Environment.GetEnvironmentVariable("MSSQL_SA_PASSWORD")
            ?? throw new InvalidOperationException(
                "Set ConnectionStrings__Default or MSSQL_SA_PASSWORD before running dotnet ef.");

        return $"Server=localhost,1433;Database=PortfolioDb;User Id=sa;Password={password};TrustServerCertificate=True;";
    }
}
