namespace Portfolio.Api.Endpoints;

/// <summary>
/// Aggregates all public read endpoints under the versioned <c>/api/v1</c> group.
/// </summary>
public static class PortfolioEndpoints
{
    public static IEndpointRouteBuilder MapPortfolioApi(this IEndpointRouteBuilder app)
    {
        var v1 = app.MapGroup("/api/v1").WithTags("Portfolio");

        v1.MapProfileEndpoints();
        v1.MapProjectEndpoints();
        v1.MapTechnologyEndpoints();
        v1.MapResumeEndpoints();
        v1.MapTestimonialEndpoints();

        v1.MapAuthEndpoints();
        v1.MapAdminEndpoints();

        return app;
    }
}
