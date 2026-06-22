using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;

namespace Portfolio.Api.Endpoints;

/// <summary>Public read endpoints for the work-history and education timelines.</summary>
public static class ResumeEndpoints
{
    public static RouteGroupBuilder MapResumeEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/experience", async (IExperienceRepository repository, CancellationToken cancellationToken) =>
        {
            var items = await repository.ListAsync(cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<ExperienceDto>>.Ok(items.Select(e => e.ToDto()).ToList()));
        })
        .WithName("ListExperience")
        .WithSummary("Lists work-history entries.");

        group.MapGet("/education", async (IEducationRepository repository, CancellationToken cancellationToken) =>
        {
            var items = await repository.ListAsync(cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<EducationDto>>.Ok(items.Select(e => e.ToDto()).ToList()));
        })
        .WithName("ListEducation")
        .WithSummary("Lists education and certification entries.");

        return group;
    }
}
