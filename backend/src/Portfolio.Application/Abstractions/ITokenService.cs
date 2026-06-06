namespace Portfolio.Application.Abstractions;

/// <summary>A signed access token and its expiry.</summary>
public sealed record AccessToken(string Value, DateTimeOffset ExpiresAtUtc);

/// <summary>Issues signed access tokens for authenticated admin users.</summary>
public interface ITokenService
{
    public AccessToken Create(string userId, string email);
}
