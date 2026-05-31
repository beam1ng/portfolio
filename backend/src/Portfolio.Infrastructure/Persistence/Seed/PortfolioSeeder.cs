using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;

namespace Portfolio.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent seed of placeholder portfolio content for local development.
/// Real content is managed later via the admin panel (Phase 4).
/// </summary>
public static class PortfolioSeeder
{
    public static async Task SeedAsync(PortfolioDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Profiles.AnyAsync(cancellationToken))
        {
            return; // already seeded
        }

        db.Profiles.Add(new Profile
        {
            FullName = "Jakub Augustyniak",
            Headline = "Full-stack Software Engineer",
            Bio = "Placeholder bio. Replace via the admin panel once Phase 4 ships.",
            Location = "Poland",
            Email = "you@example.com",
            GitHubUrl = "https://github.com/your-handle",
            LinkedInUrl = "https://www.linkedin.com/in/your-handle",
        });

        var dotnet = new Technology { Name = "ASP.NET Core", Slug = "asp-net-core", Category = "Backend", Proficiency = ProficiencyLevel.Advanced };
        var csharp = new Technology { Name = "C#", Slug = "csharp", Category = "Languages", Proficiency = ProficiencyLevel.Advanced };
        var react = new Technology { Name = "React", Slug = "react", Category = "Frontend", Proficiency = ProficiencyLevel.Advanced };
        var ts = new Technology { Name = "TypeScript", Slug = "typescript", Category = "Languages", Proficiency = ProficiencyLevel.Advanced };
        var sql = new Technology { Name = "MS SQL Server", Slug = "ms-sql-server", Category = "Database", Proficiency = ProficiencyLevel.Intermediate };
        var docker = new Technology { Name = "Docker", Slug = "docker", Category = "DevOps", Proficiency = ProficiencyLevel.Intermediate };
        var python = new Technology { Name = "Python", Slug = "python", Category = "Languages", Proficiency = ProficiencyLevel.Advanced };
        var click = new Technology { Name = "Click", Slug = "click", Category = "CLI", Proficiency = ProficiencyLevel.Intermediate };
        var reportlab = new Technology { Name = "ReportLab", Slug = "reportlab", Category = "PDF", Proficiency = ProficiencyLevel.Intermediate };
        var pillow = new Technology { Name = "Pillow", Slug = "pillow", Category = "Imaging", Proficiency = ProficiencyLevel.Intermediate };
        var pycairo = new Technology { Name = "pycairo", Slug = "pycairo", Category = "Graphics", Proficiency = ProficiencyLevel.Intermediate };
        db.Technologies.AddRange(dotnet, csharp, react, ts, sql, docker, python, click, reportlab, pillow, pycairo);

        db.Projects.Add(new Project
        {
            Title = "Portfolio Platform",
            Slug = "portfolio-platform",
            Summary = "This site — ASP.NET Core API + React/TS frontend, Dockerized, on Azure.",
            Description = "Placeholder description. A DB-driven portfolio with an admin panel.",
            IsFeatured = true,
            SortOrder = 0,
            StartDate = new DateOnly(2026, 5, 1),
            ProjectTechnologies =
            [
                new ProjectTechnology { Technology = dotnet },
                new ProjectTechnology { Technology = react },
                new ProjectTechnology { Technology = ts },
                new ProjectTechnology { Technology = sql },
                new ProjectTechnology { Technology = docker },
            ],
        });

        db.Projects.Add(new Project
        {
            Title = "Flashcard Generator",
            Slug = "flashcard-generator",
            Summary = "A Python CLI that turns JSON config + live API data into print-ready flashcard PDFs.",
            Description =
                "A command-line tool for generating print-ready flashcard PDFs entirely from JSON " +
                "configuration — no code required to create a new set.\n\n" +
                "The architecture cleanly separates two phases. The generate phase fetches data from " +
                "external APIs, resolves field values, and builds card data structures into an " +
                "intermediate flashcards-input.json. The render phase then merges that data with " +
                "layout templates, applies per-card overrides, and renders to PDF via ReportLab and " +
                "Cairo (pycairo / rlPyCairo).\n\n" +
                "Built as an installable package exposing an `fcpdf` command (Click), with an " +
                "interactive prompt-driven UX — new / generate / render / preview. Supports custom " +
                "TrueType fonts (freetype-py), QR codes, and on-the-fly translation (deep-translator). " +
                "Covered by a pytest suite.\n\n" +
                "Private repository — source and run instructions are not public.",
            IsFeatured = true,
            SortOrder = 1,
            ProjectTechnologies =
            [
                new ProjectTechnology { Technology = python },
                new ProjectTechnology { Technology = click },
                new ProjectTechnology { Technology = reportlab },
                new ProjectTechnology { Technology = pillow },
                new ProjectTechnology { Technology = pycairo },
            ],
        });

        var languages = new SkillCategory
        {
            Name = "Languages",
            Slug = "languages",
            SortOrder = 0,
            Skills =
            [
                new Skill { Name = "C#", Level = ProficiencyLevel.Advanced, SortOrder = 0 },
                new Skill { Name = "TypeScript", Level = ProficiencyLevel.Advanced, SortOrder = 1 },
                new Skill { Name = "Python", Level = ProficiencyLevel.Advanced, SortOrder = 2 },
                new Skill { Name = "SQL", Level = ProficiencyLevel.Intermediate, SortOrder = 3 },
            ],
        };
        var frameworks = new SkillCategory
        {
            Name = "Frameworks",
            Slug = "frameworks",
            SortOrder = 1,
            Skills =
            [
                new Skill { Name = "ASP.NET Core", Level = ProficiencyLevel.Advanced, SortOrder = 0 },
                new Skill { Name = "React", Level = ProficiencyLevel.Advanced, SortOrder = 1 },
                new Skill { Name = "Entity Framework Core", Level = ProficiencyLevel.Intermediate, SortOrder = 2 },
            ],
        };
        db.SkillCategories.AddRange(languages, frameworks);

        await db.SaveChangesAsync(cancellationToken);
    }
}
