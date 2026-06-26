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

    public static ProjectTechnologyDto ToDto(this ProjectTechnology projectTechnology) => new(
        projectTechnology.Technology.Id,
        projectTechnology.Technology.Name,
        projectTechnology.Technology.Slug,
        projectTechnology.Technology.Category,
        projectTechnology.Technology.IconUrl,
        (int)projectTechnology.Technology.Proficiency,
        projectTechnology.Note);

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
            .Select(pt => pt.ToDto())
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
            .Select(pt => pt.ToDto())
            .ToList(),
        project.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => new ProjectImageDto(i.ImageUrl, i.Caption))
            .ToList());

}
