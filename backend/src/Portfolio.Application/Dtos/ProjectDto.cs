namespace Portfolio.Application.Dtos;

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
    IReadOnlyList<TechnologyDto> Technologies);

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
    IReadOnlyList<TechnologyDto> Technologies);
