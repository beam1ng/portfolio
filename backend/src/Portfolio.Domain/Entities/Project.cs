using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A portfolio project / case study.
/// </summary>
public class Project : BaseEntity
{
    public required string Title { get; set; }

    /// <summary>URL-safe unique identifier, e.g. "portfolio-platform".</summary>
    public required string Slug { get; set; }

    /// <summary>One-line summary for cards/lists.</summary>
    public required string Summary { get; set; }

    /// <summary>Long-form description (Markdown allowed).</summary>
    public string Description { get; set; } = string.Empty;

    public string? RepoUrl { get; set; }
    public string? LiveUrl { get; set; }
    public string? ImageUrl { get; set; }

    /// <summary>Highlighted on the home page when true.</summary>
    public bool IsFeatured { get; set; }

    /// <summary>Ascending display order; lower shows first.</summary>
    public int SortOrder { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = [];

    /// <summary>Gallery screenshots shown on the project detail page.</summary>
    public ICollection<ProjectImage> Images { get; set; } = [];
}
