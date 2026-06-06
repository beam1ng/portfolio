using Microsoft.AspNetCore.Identity;

namespace Portfolio.Infrastructure.Identity;

/// <summary>Seeds the single admin user from configuration, if not already present.</summary>
public static class IdentitySeeder
{
    public static async Task SeedAdminAsync(
        UserManager<ApplicationUser> userManager,
        AdminOptions admin,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(admin.Email) || string.IsNullOrWhiteSpace(admin.Password))
        {
            return; // No admin configured — skip (e.g. non-dev without secrets).
        }

        if (await userManager.FindByEmailAsync(admin.Email) is not null)
        {
            return;
        }

        var user = new ApplicationUser
        {
            UserName = admin.Email,
            Email = admin.Email,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, admin.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to seed admin user: {errors}");
        }
    }
}
