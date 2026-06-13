namespace Portfolio.Domain.Entities;

/// <summary>
/// Join entity for the many-to-many relation between projects and technologies.
/// </summary>
public class ProjectTechnology
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid TechnologyId { get; set; }
    public Technology Technology { get; set; } = null!;

    /// <summary>Optional short note describing how this technology was used in the project.</summary>
    public string? Note { get; set; }
}
