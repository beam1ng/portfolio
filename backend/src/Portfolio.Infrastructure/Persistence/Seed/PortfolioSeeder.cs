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

        // Technology logos served from the public devicon CDN (jsDelivr).
        const string icon = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";

        var dotnet = new Technology { Name = "ASP.NET Core", Slug = "asp-net-core", Category = "Backend", Proficiency = ProficiencyLevel.Advanced, IconUrl = icon + "dotnetcore/dotnetcore-original.svg" };
        var csharp = new Technology { Name = "C#", Slug = "csharp", Category = "Languages", Proficiency = ProficiencyLevel.Advanced, IconUrl = icon + "csharp/csharp-original.svg" };
        var react = new Technology { Name = "React", Slug = "react", Category = "Frontend", Proficiency = ProficiencyLevel.Advanced, IconUrl = icon + "react/react-original.svg" };
        var ts = new Technology { Name = "TypeScript", Slug = "typescript", Category = "Languages", Proficiency = ProficiencyLevel.Advanced, IconUrl = icon + "typescript/typescript-original.svg" };
        var sql = new Technology { Name = "MS SQL Server", Slug = "ms-sql-server", Category = "Database", Proficiency = ProficiencyLevel.Intermediate, IconUrl = icon + "microsoftsqlserver/microsoftsqlserver-plain.svg" };
        var docker = new Technology { Name = "Docker", Slug = "docker", Category = "DevOps", Proficiency = ProficiencyLevel.Intermediate, IconUrl = icon + "docker/docker-original.svg" };
        var python = new Technology { Name = "Python", Slug = "python", Category = "Languages", Proficiency = ProficiencyLevel.Advanced, IconUrl = icon + "python/python-original.svg" };
        var click = new Technology { Name = "Click", Slug = "click", Category = "CLI", Proficiency = ProficiencyLevel.Intermediate };
        var reportlab = new Technology { Name = "ReportLab", Slug = "reportlab", Category = "PDF", Proficiency = ProficiencyLevel.Intermediate };
        var pillow = new Technology { Name = "Pillow", Slug = "pillow", Category = "Imaging", Proficiency = ProficiencyLevel.Intermediate };
        var pycairo = new Technology { Name = "pycairo", Slug = "pycairo", Category = "Graphics", Proficiency = ProficiencyLevel.Intermediate };
        var vue = new Technology { Name = "Vue 3", Slug = "vue", Category = "Frontend", Proficiency = ProficiencyLevel.Advanced, IconUrl = icon + "vuejs/vuejs-original.svg" };
        var bun = new Technology { Name = "Bun", Slug = "bun", Category = "Runtime", Proficiency = ProficiencyLevel.Intermediate, IconUrl = icon + "bun/bun-original.svg" };
        var elysia = new Technology { Name = "Elysia", Slug = "elysia", Category = "Backend", Proficiency = ProficiencyLevel.Intermediate };
        var redis = new Technology { Name = "Redis", Slug = "redis", Category = "Database", Proficiency = ProficiencyLevel.Intermediate, IconUrl = icon + "redis/redis-original.svg" };
        var bullmq = new Technology { Name = "BullMQ", Slug = "bullmq", Category = "Jobs", Proficiency = ProficiencyLevel.Intermediate };
        var unity = new Technology { Name = "Unity", Slug = "unity", Category = "Game Engine", Proficiency = ProficiencyLevel.Intermediate, IconUrl = icon + "unity/unity-original.svg" };
        var hlsl = new Technology { Name = "HLSL / Compute Shaders", Slug = "hlsl", Category = "Graphics", Proficiency = ProficiencyLevel.Intermediate };
        db.Technologies.AddRange(
            dotnet, csharp, react, ts, sql, docker, python, click, reportlab, pillow, pycairo,
            vue, bun, elysia, redis, bullmq, unity, hlsl);

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

        db.Projects.Add(new Project
        {
            Title = "CS2 Trader Ultimate",
            Slug = "cs2-trader-ultimate",
            Summary = "A self-hosted full-stack tool for tracking CS2 skin prices and discovering profitable trade-up contracts.",
            Description =
                "A self-hosted web app for trading CS2 (Counter-Strike 2) skins. It tracks market " +
                "prices across every wear condition and StatTrak variant, charts price history over " +
                "time, surfaces profitable trade-up contracts filtered by risk, profitability, and " +
                "rarity, and maps which contracts the owned inventory is eligible for.\n\n" +
                "The backend is a type-safe Bun + Elysia API; an Eden Treaty client carries end-to-end " +
                "types straight into the Vue 3 + Vite frontend. Redis — with its JSON, Search, and " +
                "TimeSeries modules — stores skins, price series, and pre-computed trade-up data, while " +
                "BullMQ runs background scraping jobs. The whole stack is orchestrated with Docker " +
                "Compose.\n\n" +
                "Private repository — source and run instructions are not public.",
            IsFeatured = true,
            SortOrder = 2,
            ProjectTechnologies =
            [
                new ProjectTechnology { Technology = vue },
                new ProjectTechnology { Technology = ts },
                new ProjectTechnology { Technology = bun },
                new ProjectTechnology { Technology = elysia },
                new ProjectTechnology { Technology = redis },
                new ProjectTechnology { Technology = bullmq },
                new ProjectTechnology { Technology = docker },
            ],
        });

        db.Projects.Add(new Project
        {
            Title = "Real-time Room Reverb Simulation",
            Slug = "realtime-room-reverb",
            Summary = "A Unity implementation of a research paper on geometry-aware real-time reverb via transport-path precomputation.",
            Description =
                "A Unity implementation of the technique from the paper \"Real-time Room Reverb in " +
                "Large Scenes using Transport Path Precomputation\" by Gregor Mückl and Carsten " +
                "Dachsbacher (JCGT, 2020).\n\n" +
                "The method makes reverb geometry-aware: instead of faking room acoustics, it models " +
                "how sound actually propagates through a scene. The pipeline samples surface points " +
                "across scene geometry, then precomputes sound-transport paths between them so the " +
                "acoustic response can be evaluated in real time even in large environments.\n\n" +
                "Implemented stages so far: surface-point generation across mesh geometry, and " +
                "transport-path precomputation for sound propagation — driven on the GPU with compute " +
                "shaders.",
            IsFeatured = true,
            SortOrder = 3,
            RepoUrl = "https://github.com/beam1ng/TransportPathPrecomputation",
            ImageUrl = "/images/reverb-card.png",
            StartDate = new DateOnly(2024, 7, 1),
            ProjectTechnologies =
            [
                new ProjectTechnology { Technology = unity },
                new ProjectTechnology { Technology = csharp },
                new ProjectTechnology { Technology = hlsl },
            ],
        });

        db.Projects.Add(new Project
        {
            Title = "Boids 2D — Flocking Simulation",
            Slug = "boids-2d",
            Summary = "A Unity flocking simulation of birds/fish from three simple rules, with an interactive control UI.",
            Description =
                "A 2D Unity simulation of the flocking behaviour seen in flocks of birds and shoals of " +
                "fish. The emergent group motion comes from three simple per-agent rules: separation " +
                "(avoid crowding neighbours), cohesion (steer toward the local group centre), and " +
                "alignment (match neighbours' heading).\n\n" +
                "An interactive UI lets you tune how strongly each of the three factors influences " +
                "movement in real time, and a debug view visualises every boid's vision radius and the " +
                "individual steering contribution of each factor.",
            IsFeatured = true,
            SortOrder = 4,
            RepoUrl = "https://github.com/beam1ng/Boids2D",
            ImageUrl = "https://user-images.githubusercontent.com/68951232/179068903-c6ff503b-d35b-43c4-ba52-d5447bc1d920.png",
            StartDate = new DateOnly(2022, 7, 1),
            ProjectTechnologies =
            [
                new ProjectTechnology { Technology = unity },
                new ProjectTechnology { Technology = csharp },
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
                new Skill { Name = "Vue 3", Level = ProficiencyLevel.Advanced, SortOrder = 2 },
                new Skill { Name = "Entity Framework Core", Level = ProficiencyLevel.Intermediate, SortOrder = 3 },
            ],
        };
        db.SkillCategories.AddRange(languages, frameworks);

        await db.SaveChangesAsync(cancellationToken);
    }
}
