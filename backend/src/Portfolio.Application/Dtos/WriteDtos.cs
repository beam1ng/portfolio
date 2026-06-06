namespace Portfolio.Application.Dtos;

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
    IReadOnlyList<Guid> TechnologyIds);

/// <summary>Create/replace payload for a technology. <c>Proficiency</c> is 1–5.</summary>
public sealed record UpsertTechnologyRequest(
    string Name,
    string Slug,
    string? Category,
    string? IconUrl,
    int Proficiency);

/// <summary>Create/replace payload for a skill category.</summary>
public sealed record UpsertSkillCategoryRequest(
    string Name,
    string Slug,
    int SortOrder);

/// <summary>Create/replace payload for a skill. <c>Level</c> is 1–5.</summary>
public sealed record UpsertSkillRequest(
    Guid SkillCategoryId,
    string Name,
    int Level,
    int SortOrder);

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
