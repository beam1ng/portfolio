using Portfolio.Domain.Common;
using Portfolio.Domain.Enums;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A technology or tool (e.g. "ASP.NET Core", "React"). Linked to projects via
/// <see cref="ProjectTechnology"/>.
/// </summary>
public class Technology : BaseEntity
{
    public required string Name { get; set; }

    /// <summary>URL-safe unique identifier, e.g. "asp-net-core".</summary>
    public required string Slug { get; set; }

    /// <summary>Grouping label, e.g. "Backend", "Frontend", "DevOps".</summary>
    public string? Category { get; set; }

    public string? IconUrl { get; set; }

    public ProficiencyLevel Proficiency { get; set; } = ProficiencyLevel.Intermediate;

    public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = [];
}
