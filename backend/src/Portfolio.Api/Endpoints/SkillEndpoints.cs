using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;

namespace Portfolio.Api.Endpoints;

public static class SkillEndpoints
{
    public static RouteGroupBuilder MapSkillEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/skills", async (
            ISkillCategoryRepository repository,
            CancellationToken cancellationToken) =>
        {
            var categories = await repository.ListWithSkillsAsync(cancellationToken);
            var dtos = categories.Select(c => c.ToDto()).ToList();
            return Results.Ok(ApiResponse<IReadOnlyList<SkillCategoryDto>>.Ok(dtos));
        })
        .WithName("ListSkills")
        .WithSummary("Lists skills grouped by category.");

        return group;
    }
}
