namespace Portfolio.Infrastructure.Identity;

/// <summary>JWT signing/validation settings, bound from the <c>Jwt</c> config section.</summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>
    /// Insecure development fallback used only when no signing key is configured,
    /// so the app boots in dev. Production MUST supply <c>Jwt:SigningKey</c> via config/env.
    /// </summary>
    public const string DevFallbackKey = "portfolio-dev-insecure-signing-key-change-me";

    public string Issuer { get; init; } = "portfolio-api";
    public string Audience { get; init; } = "portfolio-web";

    /// <summary>HMAC signing key. Must be at least 32 chars. Never hardcode — supply via config/env.</summary>
    public string SigningKey { get; init; } = string.Empty;

    /// <summary>Access-token lifetime in minutes.</summary>
    public int ExpiryMinutes { get; init; } = 120;
}

/// <summary>Seeded admin credentials, bound from the <c>Admin</c> config section.</summary>
public sealed class AdminOptions
{
    public const string SectionName = "Admin";

    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
