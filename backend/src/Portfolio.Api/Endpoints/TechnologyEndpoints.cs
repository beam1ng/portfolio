using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;

namespace Portfolio.Api.Endpoints;

public static class TechnologyEndpoints
{
    public static RouteGroupBuilder MapTechnologyEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/technologies", async (
            ITechnologyRepository repository,
            CancellationToken cancellationToken) =>
        {
            var technologies = await repository.ListAsync(cancellationToken);
            var dtos = technologies.Select(t => t.ToDto()).ToList();
            return Results.Ok(ApiResponse<IReadOnlyList<TechnologyDto>>.Ok(dtos));
        })
        .WithName("ListTechnologies")
        .WithSummary("Lists all technologies.");

        return group;
    }
}
