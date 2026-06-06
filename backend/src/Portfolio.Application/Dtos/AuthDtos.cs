namespace Portfolio.Application.Dtos;

/// <summary>Admin login credentials.</summary>
public sealed record LoginRequest(string Email, string Password);

/// <summary>The authenticated admin identity returned to the client.</summary>
public sealed record AuthUserDto(string Email);
