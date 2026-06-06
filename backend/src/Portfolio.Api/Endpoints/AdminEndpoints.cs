using Portfolio.Application.Abstractions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;
using Portfolio.Application.Validation;

namespace Portfolio.Api.Endpoints;

/// <summary>
/// Authenticated admin CRUD for portfolio content, under <c>/api/v1/admin</c>.
/// Every route requires a valid auth cookie.
/// </summary>
public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder group)
    {
        var admin = group.MapGroup("/admin").WithTags("Admin").RequireAuthorization();

        admin.MapProjectAdmin();
        admin.MapTechnologyAdmin();
        admin.MapSkillAdmin();
        admin.MapProfileAdmin();

        return admin;
    }

    private static void MapProjectAdmin(this RouteGroupBuilder admin)
    {
        admin.MapGet("/projects", async (IProjectRepository repo, CancellationToken ct) =>
        {
            var all = await repo.ListAllAsync(ct);
            return Results.Ok(ApiResponse<IReadOnlyList<ProjectSummaryDto>>.Ok(
                all.Select(p => p.ToSummaryDto()).ToList()));
        });

        admin.MapGet("/projects/{id:guid}", async (Guid id, IProjectRepository repo, CancellationToken ct) =>
        {
            var project = await repo.GetByIdAsync(id, ct);
            return project is null
                ? NotFound<ProjectDetailDto>($"Project {id} not found.")
                : Results.Ok(ApiResponse<ProjectDetailDto>.Ok(project.ToDetailDto()));
        });

        admin.MapPost("/projects", async (UpsertProjectRequest request, IProjectRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertProjectRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<ProjectDetailDto>(error);
            }

            if (await repo.SlugExistsAsync(request.Slug, null, ct))
            {
                return Conflict<ProjectDetailDto>($"Slug '{request.Slug}' is already in use.");
            }

            var project = request.ToEntity();
            await repo.AddAsync(project, ct);
            await repo.SaveChangesAsync(ct);

            var saved = await repo.GetByIdAsync(project.Id, ct);
            return Results.Created($"/api/v1/projects/{project.Slug}",
                ApiResponse<ProjectDetailDto>.Ok(saved!.ToDetailDto()));
        });

        admin.MapPut("/projects/{id:guid}", async (Guid id, UpsertProjectRequest request, IProjectRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertProjectRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<ProjectDetailDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<ProjectDetailDto>($"Project {id} not found.");
            }

            if (await repo.SlugExistsAsync(request.Slug, id, ct))
            {
                return Conflict<ProjectDetailDto>($"Slug '{request.Slug}' is already in use.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);

            var saved = await repo.GetByIdAsync(id, ct);
            return Results.Ok(ApiResponse<ProjectDetailDto>.Ok(saved!.ToDetailDto()));
        });

        admin.MapDelete("/projects/{id:guid}", async (Guid id, IProjectRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Project {id} not found."));
    }

    private static void MapTechnologyAdmin(this RouteGroupBuilder admin)
    {
        admin.MapGet("/technologies", async (ITechnologyRepository repo, CancellationToken ct) =>
        {
            var all = await repo.ListAsync(ct);
            return Results.Ok(ApiResponse<IReadOnlyList<TechnologyDto>>.Ok(all.Select(t => t.ToDto()).ToList()));
        });

        admin.MapPost("/technologies", async (UpsertTechnologyRequest request, ITechnologyRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertTechnologyRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<TechnologyDto>(error);
            }

            if (await repo.SlugExistsAsync(request.Slug, null, ct))
            {
                return Conflict<TechnologyDto>($"Slug '{request.Slug}' is already in use.");
            }

            var technology = request.ToEntity();
            await repo.AddAsync(technology, ct);
            await repo.SaveChangesAsync(ct);
            return Results.Created("/api/v1/technologies", ApiResponse<TechnologyDto>.Ok(technology.ToDto()));
        });

        admin.MapPut("/technologies/{id:guid}", async (Guid id, UpsertTechnologyRequest request, ITechnologyRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertTechnologyRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<TechnologyDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<TechnologyDto>($"Technology {id} not found.");
            }

            if (await repo.SlugExistsAsync(request.Slug, id, ct))
            {
                return Conflict<TechnologyDto>($"Slug '{request.Slug}' is already in use.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<TechnologyDto>.Ok(existing.ToDto()));
        });

        admin.MapDelete("/technologies/{id:guid}", async (Guid id, ITechnologyRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Technology {id} not found."));
    }

    private static void MapSkillAdmin(this RouteGroupBuilder admin)
    {
        admin.MapGet("/skills", async (ISkillCategoryRepository repo, CancellationToken ct) =>
        {
            var all = await repo.ListWithSkillsAsync(ct);
            return Results.Ok(ApiResponse<IReadOnlyList<SkillCategoryDto>>.Ok(all.Select(c => c.ToDto()).ToList()));
        });

        admin.MapPost("/skill-categories", async (UpsertSkillCategoryRequest request, ISkillCategoryRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertSkillCategoryRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<SkillCategoryDto>(error);
            }

            if (await repo.SlugExistsAsync(request.Slug, null, ct))
            {
                return Conflict<SkillCategoryDto>($"Slug '{request.Slug}' is already in use.");
            }

            var category = request.ToEntity();
            await repo.AddAsync(category, ct);
            await repo.SaveChangesAsync(ct);
            return Results.Created("/api/v1/skills", ApiResponse<SkillCategoryDto>.Ok(category.ToDto()));
        });

        admin.MapPut("/skill-categories/{id:guid}", async (Guid id, UpsertSkillCategoryRequest request, ISkillCategoryRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertSkillCategoryRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<SkillCategoryDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<SkillCategoryDto>($"Skill category {id} not found.");
            }

            if (await repo.SlugExistsAsync(request.Slug, id, ct))
            {
                return Conflict<SkillCategoryDto>($"Slug '{request.Slug}' is already in use.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<SkillCategoryDto>.Ok(existing.ToDto()));
        });

        admin.MapDelete("/skill-categories/{id:guid}", async (Guid id, ISkillCategoryRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Skill category {id} not found."));

        admin.MapPost("/skills", async (UpsertSkillRequest request, ISkillRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertSkillRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<SkillDto>(error);
            }

            if (!await repo.CategoryExistsAsync(request.SkillCategoryId, ct))
            {
                return BadRequest<SkillDto>($"Skill category {request.SkillCategoryId} does not exist.");
            }

            var skill = request.ToEntity();
            await repo.AddAsync(skill, ct);
            await repo.SaveChangesAsync(ct);
            return Results.Created("/api/v1/skills", ApiResponse<SkillDto>.Ok(skill.ToDto()));
        });

        admin.MapPut("/skills/{id:guid}", async (Guid id, UpsertSkillRequest request, ISkillRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertSkillRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<SkillDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<SkillDto>($"Skill {id} not found.");
            }

            if (!await repo.CategoryExistsAsync(request.SkillCategoryId, ct))
            {
                return BadRequest<SkillDto>($"Skill category {request.SkillCategoryId} does not exist.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<SkillDto>.Ok(existing.ToDto()));
        });

        admin.MapDelete("/skills/{id:guid}", async (Guid id, ISkillRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Skill {id} not found."));
    }

    private static void MapProfileAdmin(this RouteGroupBuilder admin)
    {
        admin.MapPut("/profile", async (UpsertProfileRequest request, IProfileRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertProfileRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<ProfileDto>(error);
            }

            var existing = await repo.GetTrackedAsync(ct);
            if (existing is null)
            {
                var created = request.ToEntity();
                await repo.AddAsync(created, ct);
                await repo.SaveChangesAsync(ct);
                return Results.Ok(ApiResponse<ProfileDto>.Ok(created.ToDto()));
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<ProfileDto>.Ok(existing.ToDto()));
        });
    }

    // ---- envelope helpers ----
    private static IResult BadRequest<T>(string message) =>
        Results.BadRequest(ApiResponse<T>.Fail(message));

    private static IResult NotFound<T>(string message) =>
        Results.NotFound(ApiResponse<T>.Fail(message));

    private static IResult Conflict<T>(string message) =>
        Results.Json(ApiResponse<T>.Fail(message), statusCode: StatusCodes.Status409Conflict);
}
