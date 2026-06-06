using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Infrastructure.Identity;

namespace Portfolio.Api.Endpoints;

/// <summary>
/// Admin authentication. The JWT is delivered as an httpOnly cookie so the SPA
/// never handles the raw token (mitigates XSS token theft).
/// </summary>
public static class AuthEndpoints
{
    /// <summary>Name of the httpOnly cookie carrying the access token.</summary>
    public const string CookieName = "access_token";

    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        var auth = group.MapGroup("/auth").WithTags("Auth");

        auth.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> users,
            ITokenService tokens,
            HttpContext context,
            CancellationToken cancellationToken) =>
        {
            cancellationToken.ThrowIfCancellationRequested();

            var user = await users.FindByEmailAsync(request.Email);
            if (user?.Email is null || !await users.CheckPasswordAsync(user, request.Password))
            {
                return Results.Json(
                    ApiResponse<AuthUserDto>.Fail("Invalid email or password."),
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            var token = tokens.Create(user.Id, user.Email);
            context.Response.Cookies.Append(CookieName, token.Value, BuildCookieOptions(context, token.ExpiresAtUtc));
            return Results.Ok(ApiResponse<AuthUserDto>.Ok(new AuthUserDto(user.Email)));
        })
        .WithName("Login")
        .WithSummary("Authenticates the admin and sets the auth cookie.");

        auth.MapPost("/logout", (HttpContext context) =>
        {
            context.Response.Cookies.Delete(CookieName, BuildCookieOptions(context, DateTimeOffset.UnixEpoch));
            return Results.Ok(ApiResponse<bool>.Ok(true));
        })
        .WithName("Logout")
        .RequireAuthorization();

        auth.MapGet("/me", (ClaimsPrincipal principal) =>
        {
            var email = principal.FindFirstValue("email") ?? principal.FindFirstValue(ClaimTypes.Email);
            return email is null
                ? Results.Json(ApiResponse<AuthUserDto>.Fail("Not authenticated."), statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(ApiResponse<AuthUserDto>.Ok(new AuthUserDto(email)));
        })
        .WithName("Me")
        .RequireAuthorization();

        return group;
    }

    private static CookieOptions BuildCookieOptions(HttpContext context, DateTimeOffset expires) => new()
    {
        HttpOnly = true,
        Secure = context.Request.IsHttps,
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = expires,
    };
}
