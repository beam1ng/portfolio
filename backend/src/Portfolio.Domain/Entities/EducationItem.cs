using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A degree, course, or certification. One entity covers both education and
/// certifications; <see cref="Url"/> can link to a credential. Ordered by
/// <see cref="SortOrder"/> then most-recent end date.
/// </summary>
public class EducationItem : BaseEntity
{
    /// <summary>Institution or issuer, e.g. "AGH University" or "Microsoft".</summary>
    public required string School { get; set; }

    /// <summary>Degree or credential name, e.g. "BSc Computer Science" or "AZ-204".</summary>
    public required string Credential { get; set; }

    /// <summary>Field of study or specialization (optional).</summary>
    public string? Field { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    /// <summary>Link to the credential or institution (optional).</summary>
    public string? Url { get; set; }

    public int SortOrder { get; set; }
}
