using Portfolio.Domain.Common;
using Portfolio.Domain.Enums;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A single skill belonging to a <see cref="SkillCategory"/>.
/// </summary>
public class Skill : BaseEntity
{
    public required string Name { get; set; }

    public ProficiencyLevel Level { get; set; } = ProficiencyLevel.Intermediate;

    public int SortOrder { get; set; }

    public Guid SkillCategoryId { get; set; }
    public SkillCategory SkillCategory { get; set; } = null!;
}
