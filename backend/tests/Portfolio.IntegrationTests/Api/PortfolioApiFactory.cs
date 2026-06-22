using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Portfolio.Application.Abstractions;
using Portfolio.Domain.Entities;

namespace Portfolio.IntegrationTests.Api;

public sealed class PortfolioApiFactory : WebApplicationFactory<Program>
{
    public FakeProjectRepository Projects { get; } = new();
    public FakeExperienceRepository Experience { get; } = new();
    public FakeEducationRepository Education { get; } = new();

    /// <summary>Throwaway directory the upload endpoint writes to during tests.</summary>
    public string UploadsPath { get; } =
        Path.Combine(Path.GetTempPath(), $"portfolio-test-uploads-{Guid.NewGuid():N}");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = "Server=(localdb)\\mssqllocaldb;Database=PortfolioTests;Trusted_Connection=True;",
                ["SkipDatabaseSetup"] = "true",
                ["Uploads:Path"] = UploadsPath,
                ["Jwt:Issuer"] = "portfolio-tests",
                ["Jwt:Audience"] = "portfolio-tests",
                ["Jwt:SigningKey"] = "portfolio-tests-signing-key-with-enough-length",
            });
        });

        builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<IProjectRepository>(Projects);
            services.AddSingleton<IExperienceRepository>(Experience);
            services.AddSingleton<IEducationRepository>(Education);
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }

    public HttpClient CreateAuthenticatedClient()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(TestAuthHandler.SchemeName);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && Directory.Exists(UploadsPath))
        {
            Directory.Delete(UploadsPath, recursive: true);
        }
    }
}

public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (Request.Headers.Authorization != SchemeName)
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "admin"),
            new Claim(ClaimTypes.Email, "admin@example.test"),
            new Claim("email", "admin@example.test"),
        };
        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public sealed class FakeProjectRepository : IProjectRepository
{
    private readonly List<Project> _projects = [];

    public void Reset(params Project[] projects)
    {
        _projects.Clear();
        _projects.AddRange(projects);
    }

    public Task<IReadOnlyList<Project>> ListAsync(bool featuredOnly, CancellationToken cancellationToken)
    {
        var projects = _projects
            .Where(p => !featuredOnly || p.IsFeatured)
            .OrderBy(p => p.SortOrder)
            .ThenByDescending(p => p.StartDate)
            .ToList();
        return Task.FromResult<IReadOnlyList<Project>>(projects);
    }

    public Task<Project?> GetBySlugAsync(string slug, CancellationToken cancellationToken) =>
        Task.FromResult(_projects.FirstOrDefault(p => p.Slug == slug));

    public Task<IReadOnlyList<Project>> ListAllAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<Project>>(_projects.OrderBy(p => p.SortOrder).ToList());

    public Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        Task.FromResult(_projects.FirstOrDefault(p => p.Id == id));

    public Task AddAsync(Project project, CancellationToken cancellationToken)
    {
        _projects.Add(project);
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = _projects.FirstOrDefault(p => p.Id == id);
        if (project is null)
        {
            return Task.FromResult(false);
        }

        _projects.Remove(project);
        return Task.FromResult(true);
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken) =>
        Task.FromResult(_projects.Any(p => p.Slug == slug && (excludeId is null || p.Id != excludeId)));

    public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class FakeExperienceRepository : IExperienceRepository
{
    private readonly List<ExperienceItem> _items = [];

    public void Reset(params ExperienceItem[] items)
    {
        _items.Clear();
        _items.AddRange(items);
    }

    public Task<IReadOnlyList<ExperienceItem>> ListAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<ExperienceItem>>(_items.OrderBy(e => e.SortOrder).ToList());

    public Task<ExperienceItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        Task.FromResult(_items.FirstOrDefault(e => e.Id == id));

    public Task AddAsync(ExperienceItem item, CancellationToken cancellationToken)
    {
        _items.Add(item);
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = _items.FirstOrDefault(e => e.Id == id);
        if (item is null)
        {
            return Task.FromResult(false);
        }

        _items.Remove(item);
        return Task.FromResult(true);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class FakeEducationRepository : IEducationRepository
{
    private readonly List<EducationItem> _items = [];

    public void Reset(params EducationItem[] items)
    {
        _items.Clear();
        _items.AddRange(items);
    }

    public Task<IReadOnlyList<EducationItem>> ListAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<EducationItem>>(_items.OrderBy(e => e.SortOrder).ToList());

    public Task<EducationItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        Task.FromResult(_items.FirstOrDefault(e => e.Id == id));

    public Task AddAsync(EducationItem item, CancellationToken cancellationToken)
    {
        _items.Add(item);
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = _items.FirstOrDefault(e => e.Id == id);
        if (item is null)
        {
            return Task.FromResult(false);
        }

        _items.Remove(item);
        return Task.FromResult(true);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
