using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.IntegrationTests.Api;

public sealed class ProjectEndpointTests(PortfolioApiFactory factory) : IClassFixture<PortfolioApiFactory>
{
    [Fact]
    public async Task ListProjectsReturnsOnlyFeaturedWhenFeaturedFilterIsTrue()
    {
        factory.Projects.Reset(
            Project("featured", isFeatured: true, sortOrder: 1),
            Project("regular", isFeatured: false, sortOrder: 0));
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/projects?featured=true");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<ProjectSummaryDto>>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data.Should().ContainSingle(p => p.Slug == "featured");
        body.Data.Should().NotContain(p => p.Slug == "regular");
    }

    [Fact]
    public async Task GetProjectReturnsNotFoundEnvelopeWhenSlugDoesNotExist()
    {
        factory.Projects.Reset();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/projects/missing-project");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDetailDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeFalse();
        body.Error.Should().Be("Project 'missing-project' not found.");
    }

    private static Project Project(string slug, bool isFeatured, int sortOrder) => new()
    {
        Title = slug,
        Slug = slug,
        Summary = $"Summary for {slug}",
        IsFeatured = isFeatured,
        SortOrder = sortOrder,
        StartDate = new DateOnly(2026, 1, 1),
    };
}
