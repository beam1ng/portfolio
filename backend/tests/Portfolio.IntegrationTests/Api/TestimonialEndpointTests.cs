using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.IntegrationTests.Api;

public sealed class TestimonialEndpointTests(PortfolioApiFactory factory) : IClassFixture<PortfolioApiFactory>
{
    // ---- Public reads ----

    [Fact]
    public async Task ListTestimonialsReturnsItemsInSortOrder()
    {
        factory.Testimonials.Reset(
            new Testimonial { Author = "Second", Quote = "q2", SortOrder = 1 },
            new Testimonial { Author = "First", Quote = "q1", SortOrder = 0 });
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/testimonials");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<TestimonialDto>>>();
        body!.Success.Should().BeTrue();
        body.Data!.Select(t => t.Author).Should().Equal("First", "Second");
    }

    // ---- Admin auth boundary ----

    [Fact]
    public async Task AdminTestimonialsReturnsUnauthorizedWhenAnonymous()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/admin/testimonials");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ---- Writes ----

    [Fact]
    public async Task CreateTestimonialReturnsCreatedWhenValid()
    {
        factory.Testimonials.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/testimonials", ValidTestimonial());

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<TestimonialDto>>();
        body!.Success.Should().BeTrue();
        body.Data!.Author.Should().Be("Jane Doe");
    }

    [Fact]
    public async Task CreateTestimonialReturnsBadRequestWhenAuthorMissing()
    {
        factory.Testimonials.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/testimonials", ValidTestimonial() with { Author = "" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTestimonialReturnsBadRequestWhenQuoteMissing()
    {
        factory.Testimonials.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/admin/testimonials", ValidTestimonial() with { Quote = "" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTestimonialReturnsNotFoundWhenMissing()
    {
        factory.Testimonials.Reset();
        var client = factory.CreateAuthenticatedClient();

        var response = await client.PutAsJsonAsync($"/api/v1/admin/testimonials/{Guid.NewGuid()}", ValidTestimonial());

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTestimonialRemovesItemThenReturnsNotFound()
    {
        var item = new Testimonial { Author = "Jane Doe", Quote = "Great engineer." };
        factory.Testimonials.Reset(item);
        var client = factory.CreateAuthenticatedClient();

        (await client.DeleteAsync($"/api/v1/admin/testimonials/{item.Id}")).StatusCode.Should().Be(HttpStatusCode.OK);
        (await client.DeleteAsync($"/api/v1/admin/testimonials/{item.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private static UpsertTestimonialRequest ValidTestimonial() => new(
        Author: "Jane Doe",
        Role: "Engineering Manager",
        Company: "Acme",
        Relationship: "Managed Jakub directly",
        Quote: "One of the most reliable engineers I have worked with.",
        AvatarUrl: null,
        SourceUrl: "https://www.linkedin.com/in/janedoe",
        ReceivedDate: new DateOnly(2025, 3, 1),
        SortOrder: 0);
}
