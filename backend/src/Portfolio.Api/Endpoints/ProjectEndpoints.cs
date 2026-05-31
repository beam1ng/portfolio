using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;

namespace Portfolio.Api.Endpoints;

public static class ProjectEndpoints
{
    public static RouteGroupBuilder MapProjectEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/projects", async (
            IProjectRepository repository,
            CancellationToken cancellationToken,
            bool? featured) =>
        {
            var projects = await repository.ListAsync(featured ?? false, cancellationToken);
            var dtos = projects.Select(p => p.ToSummaryDto()).ToList();
            return Results.Ok(ApiResponse<IReadOnlyList<ProjectSummaryDto>>.Ok(
                dtos,
                meta: new { count = dtos.Count }));
        })
        .WithName("ListProjects")
        .WithSummary("Lists projects; pass ?featured=true for featured only.");

        group.MapGet("/projects/{slug}", async (
            string slug,
            IProjectRepository repository,
            CancellationToken cancellationToken) =>
        {
            var project = await repository.GetBySlugAsync(slug, cancellationToken);
            return project is null
                ? Results.NotFound(ApiResponse<ProjectDetailDto>.Fail($"Project '{slug}' not found."))
                : Results.Ok(ApiResponse<ProjectDetailDto>.Ok(project.ToDetailDto()));
        })
        .WithName("GetProjectBySlug")
        .WithSummary("Returns a single project by slug.");

        return group;
    }
}
