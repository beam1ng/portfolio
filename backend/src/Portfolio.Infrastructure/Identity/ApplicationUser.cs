using Microsoft.AspNetCore.Identity;

namespace Portfolio.Infrastructure.Identity;

/// <summary>
/// Application user for admin authentication. Single seeded admin in practice,
/// but modelled through ASP.NET Core Identity for hashing and validation.
/// </summary>
public sealed class ApplicationUser : IdentityUser;
