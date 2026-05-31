namespace Portfolio.Application.Dtos;

public sealed record TechnologyDto(
    Guid Id,
    string Name,
    string Slug,
    string? Category,
    string? IconUrl,
    int Proficiency);
