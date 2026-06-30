using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;

namespace Portfolio.Api.Endpoints;

/// <summary>Public read endpoint for recommendations / testimonials.</summary>
public static class TestimonialEndpoints
{
    public static RouteGroupBuilder MapTestimonialEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/testimonials", async (ITestimonialRepository repository, CancellationToken cancellationToken) =>
        {
            var items = await repository.ListAsync(cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<TestimonialDto>>.Ok(items.Select(e => e.ToDto()).ToList()));
        })
        .WithName("ListTestimonials")
        .WithSummary("Lists recommendations / testimonials.");

        return group;
    }
}
