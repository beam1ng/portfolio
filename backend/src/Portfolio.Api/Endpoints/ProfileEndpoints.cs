using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;

namespace Portfolio.Api.Endpoints;

public static class ProfileEndpoints
{
    public static RouteGroupBuilder MapProfileEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/profile", async (
            IProfileRepository repository,
            CancellationToken cancellationToken) =>
        {
            var profile = await repository.GetAsync(cancellationToken);
            return profile is null
                ? Results.NotFound(ApiResponse<ProfileDto>.Fail("Profile not found."))
                : Results.Ok(ApiResponse<ProfileDto>.Ok(profile.ToDto()));
        })
        .WithName("GetProfile")
        .WithSummary("Returns the portfolio owner's profile/summary.");

        return group;
    }
}
