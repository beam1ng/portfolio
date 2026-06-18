using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A screenshot in a project's gallery, with an optional caption.
/// </summary>
public class ProjectImage : BaseEntity
{
    public required string ImageUrl { get; set; }

    /// <summary>Optional short caption describing the screenshot.</summary>
    public string? Caption { get; set; }

    /// <summary>Ascending display order within the project's gallery.</summary>
    public int SortOrder { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
