namespace Portfolio.Application.Dtos;

/// <summary>
/// A technology as used by a specific project: the technology fields plus an
/// optional per-project usage note.
/// </summary>
public sealed record ProjectTechnologyDto(
    Guid Id,
    string Name,
    string Slug,
    string? Category,
    string? IconUrl,
    int Proficiency,
    string? Note);

/// <summary>A gallery screenshot with an optional caption.</summary>
public sealed record ProjectImageDto(string ImageUrl, string? Caption);

/// <summary>Condensed project shape for lists and cards.</summary>
public sealed record ProjectSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string Summary,
    string? ImageUrl,
    string? LiveUrl,
    string? RepoUrl,
    bool IsFeatured,
    IReadOnlyList<ProjectTechnologyDto> Technologies);

/// <summary>Full project shape for the detail view.</summary>
public sealed record ProjectDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Summary,
    string Description,
    string? ImageUrl,
    string? LiveUrl,
    string? RepoUrl,
    bool IsFeatured,
    DateOnly? StartDate,
    DateOnly? EndDate,
    IReadOnlyList<ProjectTechnologyDto> Technologies,
    IReadOnlyList<ProjectImageDto> Images);
