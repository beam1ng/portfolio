using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// Grouping for related skills, e.g. "Languages", "Frameworks", "Tooling".
/// </summary>
public class SkillCategory : BaseEntity
{
    public required string Name { get; set; }

    /// <summary>URL-safe unique identifier, e.g. "languages".</summary>
    public required string Slug { get; set; }

    public int SortOrder { get; set; }

    public ICollection<Skill> Skills { get; set; } = [];
}
