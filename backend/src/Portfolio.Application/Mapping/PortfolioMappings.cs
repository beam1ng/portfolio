using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.Application.Mapping;

/// <summary>
/// Explicit entity-to-DTO projections. Manual mapping keeps the contract visible
/// and avoids reflection-based mapper surprises.
/// </summary>
public static class PortfolioMappings
{
    public static ProfileDto ToDto(this Profile profile) => new(
        profile.FullName,
        profile.Headline,
        profile.Bio,
        profile.Location,
        profile.AvatarUrl,
        profile.ResumeUrl,
        profile.Email,
        profile.GitHubUrl,
        profile.LinkedInUrl,
        profile.WebsiteUrl);

    public static TechnologyDto ToDto(this Technology technology) => new(
        technology.Id,
        technology.Name,
        technology.Slug,
        technology.Category,
        technology.IconUrl,
        (int)technology.Proficiency);

    public static ProjectSummaryDto ToSummaryDto(this Project project) => new(
        project.Id,
        project.Title,
        project.Slug,
        project.Summary,
        project.ImageUrl,
        project.LiveUrl,
        project.RepoUrl,
        project.IsFeatured,
        project.ProjectTechnologies
            .Select(pt => pt.Technology.ToDto())
            .ToList());

    public static ProjectDetailDto ToDetailDto(this Project project) => new(
        project.Id,
        project.Title,
        project.Slug,
        project.Summary,
        project.Description,
        project.ImageUrl,
        project.LiveUrl,
        project.RepoUrl,
        project.IsFeatured,
        project.StartDate,
        project.EndDate,
        project.ProjectTechnologies
            .Select(pt => pt.Technology.ToDto())
            .ToList());

    public static SkillCategoryDto ToDto(this SkillCategory category) => new(
        category.Id,
        category.Name,
        category.Slug,
        category.Skills
            .OrderBy(s => s.SortOrder)
            .Select(s => new SkillDto(s.Id, s.Name, (int)s.Level))
            .ToList());
}
