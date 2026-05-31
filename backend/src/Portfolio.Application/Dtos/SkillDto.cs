namespace Portfolio.Application.Dtos;

public sealed record SkillDto(
    Guid Id,
    string Name,
    int Level);

public sealed record SkillCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    IReadOnlyList<SkillDto> Skills);
