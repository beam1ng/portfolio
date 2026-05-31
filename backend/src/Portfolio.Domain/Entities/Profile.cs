using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// The portfolio owner's summary. Expected to be a single row.
/// </summary>
public class Profile : BaseEntity
{
    public required string FullName { get; set; }

    /// <summary>Short tagline shown under the name (e.g. "Full-stack engineer").</summary>
    public required string Headline { get; set; }

    /// <summary>Long-form biography / summary (Markdown allowed).</summary>
    public string Bio { get; set; } = string.Empty;

    public string? Location { get; set; }
    public string? AvatarUrl { get; set; }
    public string? ResumeUrl { get; set; }

    // ---- Contact / social links ----
    public string? Email { get; set; }
    public string? GitHubUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? WebsiteUrl { get; set; }
}
