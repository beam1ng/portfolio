using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A role in the work-history timeline (company, title, dates, summary).
/// Ordered by <see cref="SortOrder"/> then most-recent start date.
/// </summary>
public class ExperienceItem : BaseEntity
{
    public required string Company { get; set; }

    /// <summary>Job title / role, e.g. "Backend Engineer".</summary>
    public required string Role { get; set; }

    public string? Location { get; set; }

    public DateOnly StartDate { get; set; }

    /// <summary>Null means the role is current ("Present").</summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>Optional markdown summary / bullet points.</summary>
    public string? Summary { get; set; }

    public int SortOrder { get; set; }
}
