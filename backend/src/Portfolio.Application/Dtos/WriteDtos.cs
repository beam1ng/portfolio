namespace Portfolio.Application.Dtos;

/// <summary>A technology reference within a project payload, with an optional usage note.</summary>
public sealed record UpsertProjectTechnology(Guid TechnologyId, string? Note);

/// <summary>A gallery screenshot within a project payload, in display order.</summary>
public sealed record UpsertProjectImage(string ImageUrl, string? Caption);

/// <summary>Create/replace payload for a project. Technologies are referenced by id.</summary>
public sealed record UpsertProjectRequest(
    string Title,
    string Slug,
    string Summary,
    string Description,
    string? RepoUrl,
    string? LiveUrl,
    string? ImageUrl,
    bool IsFeatured,
    int SortOrder,
    DateOnly? StartDate,
    DateOnly? EndDate,
    IReadOnlyList<UpsertProjectTechnology> Technologies,
    IReadOnlyList<UpsertProjectImage> Images);

/// <summary>Create/replace payload for a technology. <c>Proficiency</c> is 1–5.</summary>
public sealed record UpsertTechnologyRequest(
    string Name,
    string Slug,
    string? Category,
    string? IconUrl,
    int Proficiency);

/// <summary>Replace payload for the single profile.</summary>
public sealed record UpsertProfileRequest(
    string FullName,
    string Headline,
    string Bio,
    string? Location,
    string? AvatarUrl,
    string? ResumeUrl,
    string? Email,
    string? GitHubUrl,
    string? LinkedInUrl,
    string? WebsiteUrl);
