using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.IntegrationTests.Api;

public sealed class AdminProjectEndpointTests(PortfolioApiFactory factory) : IClassFixture<PortfolioApiFactory>
{
    [Fact]
    public async Task AdminProjectsReturnsUnauthorizedWhenRequestIsAnonymous()
    {
        factory.Projects.Reset();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/admin/projects");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateProjectReturnsBadRequestWhenPayloadFailsValidation()
    {
        factory.Projects.Reset();
        var client = factory.CreateAuthenticatedClient();
        var request = ValidRequest() with { Slug = "Bad Slug" };

        var response = await client.PostAsJsonAsync("/api/v1/admin/projects", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDetailDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeFalse();
        body.Error.Should().Contain("Slug must be lowercase kebab-case");
    }

    [Fact]
    public async Task CreateProjectReturnsConflictWhenSlugAlreadyExists()
    {
        factory.Projects.Reset(new Project
        {
            Title = "Existing",
            Slug = "portfolio-platform",
            Summary = "Existing summary",
        });
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/projects", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDetailDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeFalse();
        body.Error.Should().Be("Slug 'portfolio-platform' is already in use.");
    }

    [Fact]
    public async Task CreateProjectReturnsCreatedEnvelopeWhenPayloadIsValid()
    {
        factory.Projects.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/projects", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location?.ToString().Should().Be("/api/v1/projects/portfolio-platform");
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDetailDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data!.Slug.Should().Be("portfolio-platform");
    }

    [Fact]
    public async Task UpdateProjectReturnsNotFoundWhenProjectMissing()
    {
        factory.Projects.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PutAsJsonAsync($"/api/v1/admin/projects/{Guid.NewGuid()}", ValidRequest());

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateProjectReturnsConflictWhenSlugBelongsToAnotherProject()
    {
        var target = SeededProject("alpha");
        factory.Projects.Reset(target, SeededProject("beta"));
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PutAsJsonAsync(
            $"/api/v1/admin/projects/{target.Id}", ValidRequest() with { Slug = "beta" });

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task UpdateProjectAppliesChangesAndKeepsItsOwnSlug()
    {
        var target = SeededProject("portfolio-platform");
        factory.Projects.Reset(target);
        var client = factory.CreateAuthenticatedClient();
        var request = ValidRequest() with
        {
            Summary = "Updated summary",
            Images = [new UpsertProjectImage("/images/shot.png", "Dashboard")],
        };

        var response = await client.PutAsJsonAsync($"/api/v1/admin/projects/{target.Id}", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDetailDto>>();
        body!.Success.Should().BeTrue();
        body.Data!.Summary.Should().Be("Updated summary");
        body.Data.Images.Should().ContainSingle(i => i.ImageUrl == "/images/shot.png" && i.Caption == "Dashboard");
    }

    private static Project SeededProject(string slug) => new()
    {
        Title = slug,
        Slug = slug,
        Summary = $"Summary for {slug}",
    };

    private static UpsertProjectRequest ValidRequest() => new(
        "Portfolio Platform",
        "portfolio-platform",
        "A portfolio with admin-managed content.",
        "Longer project description.",
        RepoUrl: null,
        LiveUrl: null,
        ImageUrl: null,
        IsFeatured: true,
        SortOrder: 0,
        StartDate: null,
        EndDate: null,
        Technologies: [],
        Images: []);
}
