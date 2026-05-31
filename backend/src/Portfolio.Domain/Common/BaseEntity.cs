namespace Portfolio.Domain.Common;

/// <summary>
/// Base type for all persisted entities. Carries identity and audit timestamps.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; } = Guid.CreateVersion7();

    /// <summary>UTC creation timestamp, set on insert.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>UTC last-update timestamp, set on insert and update.</summary>
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
