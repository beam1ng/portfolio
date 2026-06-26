using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;

namespace Portfolio.Infrastructure.Persistence.Seed;

/// <summary>
/// Seeds the database from an exported <c>content.json</c> (the same file the
/// static site uses) so real content survives a volume reset without manual
/// re-entry. Used when <c>SEED_CONTENT_PATH</c> points at an existing file.
/// </summary>
public static class ContentImporter
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    /// <summary>Seeds from the JSON file if the database is empty. No-op otherwise.</summary>
    public static async Task SeedAsync(PortfolioDbContext db, string path, CancellationToken cancellationToken = default)
    {
        if (await db.Profiles.AnyAsync(cancellationToken))
        {
            return; // already seeded
        }

        var json = await File.ReadAllTextAsync(path, cancellationToken);
        var content = JsonSerializer.Deserialize<ContentFile>(json, JsonOptions)
            ?? throw new InvalidOperationException($"Seed content at '{path}' is empty or invalid.");

        if (content.Profile is { } profile)
        {
            db.Profiles.Add(new Profile
            {
                FullName = profile.FullName,
                Headline = profile.Headline,
                Bio = profile.Bio ?? string.Empty,
                Location = profile.Location,
                AvatarUrl = profile.AvatarUrl,
                ResumeUrl = profile.ResumeUrl,
                Email = profile.Email,
                GitHubUrl = profile.GitHubUrl,
                LinkedInUrl = profile.LinkedInUrl,
                WebsiteUrl = profile.WebsiteUrl,
            });
        }

        // Technologies, keyed by slug so projects can reference shared instances.
        var technologies = new Dictionary<string, Technology>(StringComparer.OrdinalIgnoreCase);
        foreach (var tech in content.Technologies ?? [])
        {
            technologies[tech.Slug] = ToTechnology(tech);
        }

        var sortOrder = 0;
        foreach (var project in content.Projects ?? [])
        {
            var entity = new Project
            {
                Title = project.Title,
                Slug = project.Slug,
                Summary = project.Summary ?? string.Empty,
                Description = project.Description ?? string.Empty,
                ImageUrl = project.ImageUrl,
                LiveUrl = project.LiveUrl,
                RepoUrl = project.RepoUrl,
                IsFeatured = project.IsFeatured,
                SortOrder = sortOrder++,
                StartDate = ParseDate(project.StartDate),
                EndDate = ParseDate(project.EndDate),
            };

            foreach (var tech in project.Technologies ?? [])
            {
                if (!technologies.TryGetValue(tech.Slug, out var technology))
                {
                    technology = ToTechnology(tech);
                    technologies[tech.Slug] = technology;
                }

                entity.ProjectTechnologies.Add(new ProjectTechnology
                {
                    Technology = technology,
                    Note = string.IsNullOrWhiteSpace(tech.Note) ? null : tech.Note,
                });
            }

            var imageOrder = 0;
            foreach (var image in project.Images ?? [])
            {
                entity.Images.Add(new ProjectImage
                {
                    ImageUrl = image.ImageUrl,
                    Caption = string.IsNullOrWhiteSpace(image.Caption) ? null : image.Caption,
                    SortOrder = imageOrder++,
                });
            }

            db.Projects.Add(entity);
        }

        var experienceOrder = 0;
        foreach (var experience in content.Experience ?? [])
        {
            db.ExperienceItems.Add(new ExperienceItem
            {
                Company = experience.Company,
                Role = experience.Role,
                Location = experience.Location,
                StartDate = ParseDate(experience.StartDate) ?? default,
                EndDate = ParseDate(experience.EndDate),
                Summary = experience.Summary,
                SortOrder = experienceOrder++,
            });
        }

        var educationOrder = 0;
        foreach (var education in content.Education ?? [])
        {
            db.EducationItems.Add(new EducationItem
            {
                School = education.School,
                Credential = education.Credential,
                Field = education.Field,
                StartDate = ParseDate(education.StartDate),
                EndDate = ParseDate(education.EndDate),
                Url = education.Url,
                SortOrder = educationOrder++,
            });
        }

        db.Technologies.AddRange(technologies.Values);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static Technology ToTechnology(ContentTechnology tech) => new()
    {
        Name = tech.Name,
        Slug = tech.Slug,
        Category = tech.Category,
        IconUrl = tech.IconUrl,
        Proficiency = (ProficiencyLevel)tech.Proficiency,
    };

    private static DateOnly? ParseDate(string? value) =>
        DateOnly.TryParse(value, out var date) ? date : null;

    // ---- JSON shape (matches the exported content.json / API DTOs) ----
    private sealed record ContentFile(
        ContentProfile? Profile,
        IReadOnlyList<ContentProject>? Projects,
        IReadOnlyList<ContentTechnology>? Technologies,
        IReadOnlyList<ContentExperience>? Experience,
        IReadOnlyList<ContentEducation>? Education);

    private sealed record ContentExperience(
        string Company,
        string Role,
        string? Location,
        string? StartDate,
        string? EndDate,
        string? Summary);

    private sealed record ContentEducation(
        string School,
        string Credential,
        string? Field,
        string? StartDate,
        string? EndDate,
        string? Url);

    private sealed record ContentProfile(
        string FullName,
        string Headline,
        string? Bio,
        string? Location,
        string? AvatarUrl,
        string? ResumeUrl,
        string? Email,
        string? GitHubUrl,
        string? LinkedInUrl,
        string? WebsiteUrl);

    private sealed record ContentTechnology(
        string Name,
        string Slug,
        string? Category,
        string? IconUrl,
        int Proficiency,
        string? Note);

    private sealed record ContentProject(
        string Title,
        string Slug,
        string? Summary,
        string? Description,
        string? ImageUrl,
        string? LiveUrl,
        string? RepoUrl,
        bool IsFeatured,
        string? StartDate,
        string? EndDate,
        IReadOnlyList<ContentTechnology>? Technologies,
        IReadOnlyList<ContentImage>? Images);

    private sealed record ContentImage(string ImageUrl, string? Caption);
}
