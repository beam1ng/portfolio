namespace Portfolio.Application.Dtos;

// ---- Read DTOs ----

/// <summary>A work-history entry for public display.</summary>
public sealed record ExperienceDto(
    Guid Id,
    string Company,
    string Role,
    string? Location,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Summary,
    int SortOrder);

/// <summary>An education / certification entry for public display.</summary>
public sealed record EducationDto(
    Guid Id,
    string School,
    string Credential,
    string? Field,
    DateOnly? StartDate,
    DateOnly? EndDate,
    string? Url,
    int SortOrder);

// ---- Write DTOs (admin upsert) ----

public sealed record UpsertExperienceRequest(
    string Company,
    string Role,
    string? Location,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Summary,
    int SortOrder);

public sealed record UpsertEducationRequest(
    string School,
    string Credential,
    string? Field,
    DateOnly? StartDate,
    DateOnly? EndDate,
    string? Url,
    int SortOrder);
