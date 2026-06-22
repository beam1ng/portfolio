using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.IntegrationTests.Api;

public sealed class ResumeEndpointTests(PortfolioApiFactory factory) : IClassFixture<PortfolioApiFactory>
{
    // ---- Public reads ----

    [Fact]
    public async Task ListExperienceReturnsItemsInSortOrder()
    {
        factory.Experience.Reset(
            new ExperienceItem { Company = "Second", Role = "Dev", SortOrder = 1 },
            new ExperienceItem { Company = "First", Role = "Dev", SortOrder = 0 });
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/experience");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<ExperienceDto>>>();
        body!.Success.Should().BeTrue();
        body.Data!.Select(e => e.Company).Should().Equal("First", "Second");
    }

    [Fact]
    public async Task ListEducationReturnsItems()
    {
        factory.Education.Reset(new EducationItem { School = "AGH", Credential = "BSc", SortOrder = 0 });
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/education");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<EducationDto>>>();
        body!.Data.Should().ContainSingle(e => e.School == "AGH" && e.Credential == "BSc");
    }

    // ---- Admin auth boundary ----

    [Fact]
    public async Task AdminExperienceReturnsUnauthorizedWhenAnonymous()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/admin/experience");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ---- Experience write ----

    [Fact]
    public async Task CreateExperienceReturnsCreatedWhenValid()
    {
        factory.Experience.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/experience", ValidExperience());

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ExperienceDto>>();
        body!.Success.Should().BeTrue();
        body.Data!.Company.Should().Be("Acme");
    }

    [Fact]
    public async Task CreateExperienceReturnsBadRequestWhenCompanyMissing()
    {
        factory.Experience.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/experience", ValidExperience() with { Company = "" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateExperienceReturnsNotFoundWhenMissing()
    {
        factory.Experience.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PutAsJsonAsync($"/api/v1/admin/experience/{Guid.NewGuid()}", ValidExperience());

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteExperienceRemovesItemThenReturnsNotFound()
    {
        var item = new ExperienceItem { Company = "Acme", Role = "Dev" };
        factory.Experience.Reset(item);
        var client = factory.CreateAuthenticatedClient();

        (await client.DeleteAsync($"/api/v1/admin/experience/{item.Id}")).StatusCode.Should().Be(HttpStatusCode.OK);
        (await client.DeleteAsync($"/api/v1/admin/experience/{item.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ---- Education write ----

    [Fact]
    public async Task CreateEducationReturnsCreatedWhenValid()
    {
        factory.Education.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/education", ValidEducation());

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<EducationDto>>();
        body!.Data!.Credential.Should().Be("BSc Computer Science");
    }

    [Fact]
    public async Task CreateEducationReturnsBadRequestWhenSchoolMissing()
    {
        factory.Education.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/education", ValidEducation() with { School = "" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private static UpsertExperienceRequest ValidExperience() => new(
        Company: "Acme",
        Role: "Backend Engineer",
        Location: "Remote",
        StartDate: new DateOnly(2023, 4, 1),
        EndDate: null,
        Summary: "Built APIs.",
        SortOrder: 0);

    private static UpsertEducationRequest ValidEducation() => new(
        School: "AGH University",
        Credential: "BSc Computer Science",
        Field: "Software Engineering",
        StartDate: new DateOnly(2019, 10, 1),
        EndDate: new DateOnly(2023, 6, 30),
        Url: null,
        SortOrder: 0);
}
