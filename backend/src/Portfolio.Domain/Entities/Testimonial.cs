using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

/// <summary>
/// A recommendation / testimonial from a colleague or client (e.g. a LinkedIn
/// recommendation). Ordered by <see cref="SortOrder"/>.
/// </summary>
public class Testimonial : BaseEntity
{
    /// <summary>Name of the person giving the recommendation.</summary>
    public required string Author { get; set; }

    /// <summary>The recommender's job title, e.g. "Engineering Manager".</summary>
    public string? Role { get; set; }

    public string? Company { get; set; }

    /// <summary>How they know the subject, e.g. "Managed Jakub directly".</summary>
    public string? Relationship { get; set; }

    /// <summary>The recommendation text (markdown).</summary>
    public required string Quote { get; set; }

    public string? AvatarUrl { get; set; }

    /// <summary>Link to the original (e.g. the LinkedIn recommendation/profile).</summary>
    public string? SourceUrl { get; set; }

    /// <summary>When the recommendation was given.</summary>
    public DateOnly? ReceivedDate { get; set; }

    public int SortOrder { get; set; }
}
