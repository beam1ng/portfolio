using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;

namespace Portfolio.Application.Mapping;

/// <summary>
/// Maps write DTOs onto domain entities. <c>ToEntity</c> builds a new entity;
/// <c>ApplyTo</c> mutates an existing (tracked) entity in place.
/// </summary>
public static class WriteMappings
{
    // ---- Project ----
    public static Project ToEntity(this UpsertProjectRequest request)
    {
        var project = new Project
        {
            Title = request.Title,
            Slug = request.Slug,
            Summary = request.Summary,
            Description = request.Description,
        };
        request.ApplyTo(project);
        return project;
    }

    public static void ApplyTo(this UpsertProjectRequest request, Project target)
    {
        target.Title = request.Title;
        target.Slug = request.Slug;
        target.Summary = request.Summary;
        target.Description = request.Description;
        target.RepoUrl = request.RepoUrl;
        target.LiveUrl = request.LiveUrl;
        target.ImageUrl = request.ImageUrl;
        target.IsFeatured = request.IsFeatured;
        target.SortOrder = request.SortOrder;
        target.StartDate = request.StartDate;
        target.EndDate = request.EndDate;

        target.ProjectTechnologies.Clear();
        foreach (var tech in request.Technologies.DistinctBy(t => t.TechnologyId))
        {
            target.ProjectTechnologies.Add(new ProjectTechnology
            {
                TechnologyId = tech.TechnologyId,
                Note = string.IsNullOrWhiteSpace(tech.Note) ? null : tech.Note.Trim(),
            });
        }
    }

    // ---- Technology ----
    public static Technology ToEntity(this UpsertTechnologyRequest request)
    {
        var technology = new Technology { Name = request.Name, Slug = request.Slug };
        request.ApplyTo(technology);
        return technology;
    }

    public static void ApplyTo(this UpsertTechnologyRequest request, Technology target)
    {
        target.Name = request.Name;
        target.Slug = request.Slug;
        target.Category = request.Category;
        target.IconUrl = request.IconUrl;
        target.Proficiency = (ProficiencyLevel)request.Proficiency;
    }

    // ---- SkillCategory ----
    public static SkillCategory ToEntity(this UpsertSkillCategoryRequest request)
    {
        var category = new SkillCategory { Name = request.Name, Slug = request.Slug };
        request.ApplyTo(category);
        return category;
    }

    public static void ApplyTo(this UpsertSkillCategoryRequest request, SkillCategory target)
    {
        target.Name = request.Name;
        target.Slug = request.Slug;
        target.SortOrder = request.SortOrder;
    }

    // ---- Skill ----
    public static Skill ToEntity(this UpsertSkillRequest request)
    {
        var skill = new Skill { Name = request.Name };
        request.ApplyTo(skill);
        return skill;
    }

    public static void ApplyTo(this UpsertSkillRequest request, Skill target)
    {
        target.Name = request.Name;
        target.Level = (ProficiencyLevel)request.Level;
        target.SortOrder = request.SortOrder;
        target.SkillCategoryId = request.SkillCategoryId;
    }

    // ---- Profile ----
    public static Profile ToEntity(this UpsertProfileRequest request)
    {
        var profile = new Profile { FullName = request.FullName, Headline = request.Headline };
        request.ApplyTo(profile);
        return profile;
    }

    public static void ApplyTo(this UpsertProfileRequest request, Profile target)
    {
        target.FullName = request.FullName;
        target.Headline = request.Headline;
        target.Bio = request.Bio;
        target.Location = request.Location;
        target.AvatarUrl = request.AvatarUrl;
        target.ResumeUrl = request.ResumeUrl;
        target.Email = request.Email;
        target.GitHubUrl = request.GitHubUrl;
        target.LinkedInUrl = request.LinkedInUrl;
        target.WebsiteUrl = request.WebsiteUrl;
    }
}
