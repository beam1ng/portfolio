using Portfolio.Api.Uploads;
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
        admin.MapProfileAdmin();
        admin.MapExperienceAdmin();
        admin.MapEducationAdmin();
        admin.MapTestimonialAdmin();
        admin.MapUploadAdmin();

        return admin;
    }

    private static void MapUploadAdmin(this RouteGroupBuilder admin)
    {
        // Drag-and-drop gallery uploads. The file lands in the bind-mounted
        // public/images dir, so it serves immediately and is committed for the
        // static deploy. Cookie auth (the admin group) gates this; antiforgery
        // is disabled because the payload is multipart form data.
        admin.MapPost("/uploads/images", async (IFormFile? file, IConfiguration config, CancellationToken ct) =>
        {
            if (file is null)
            {
                return BadRequest<UploadResult>("No file was uploaded.");
            }

            var outcome = await ImageUploadHandler.SaveAsync(file, config, ct);
            return outcome.Success
                ? Results.Ok(ApiResponse<UploadResult>.Ok(new UploadResult(outcome.Url!)))
                : BadRequest<UploadResult>(outcome.Error!);
        }).DisableAntiforgery();

        // Résumé / CV PDF upload — same bind-mounted dir, no image processing.
        admin.MapPost("/uploads/documents", async (IFormFile? file, IConfiguration config, CancellationToken ct) =>
        {
            if (file is null)
            {
                return BadRequest<UploadResult>("No file was uploaded.");
            }

            var outcome = await DocumentUploadHandler.SaveAsync(file, config, ct);
            return outcome.Success
                ? Results.Ok(ApiResponse<UploadResult>.Ok(new UploadResult(outcome.Url!)))
                : BadRequest<UploadResult>(outcome.Error!);
        }).DisableAntiforgery();
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

    private static void MapExperienceAdmin(this RouteGroupBuilder admin)
    {
        admin.MapGet("/experience", async (IExperienceRepository repo, CancellationToken ct) =>
        {
            var all = await repo.ListAsync(ct);
            return Results.Ok(ApiResponse<IReadOnlyList<ExperienceDto>>.Ok(all.Select(e => e.ToDto()).ToList()));
        });

        admin.MapPost("/experience", async (UpsertExperienceRequest request, IExperienceRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertExperienceRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<ExperienceDto>(error);
            }

            var item = request.ToEntity();
            await repo.AddAsync(item, ct);
            await repo.SaveChangesAsync(ct);
            return Results.Created("/api/v1/experience", ApiResponse<ExperienceDto>.Ok(item.ToDto()));
        });

        admin.MapPut("/experience/{id:guid}", async (Guid id, UpsertExperienceRequest request, IExperienceRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertExperienceRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<ExperienceDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<ExperienceDto>($"Experience {id} not found.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<ExperienceDto>.Ok(existing.ToDto()));
        });

        admin.MapDelete("/experience/{id:guid}", async (Guid id, IExperienceRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Experience {id} not found."));
    }

    private static void MapEducationAdmin(this RouteGroupBuilder admin)
    {
        admin.MapGet("/education", async (IEducationRepository repo, CancellationToken ct) =>
        {
            var all = await repo.ListAsync(ct);
            return Results.Ok(ApiResponse<IReadOnlyList<EducationDto>>.Ok(all.Select(e => e.ToDto()).ToList()));
        });

        admin.MapPost("/education", async (UpsertEducationRequest request, IEducationRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertEducationRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<EducationDto>(error);
            }

            var item = request.ToEntity();
            await repo.AddAsync(item, ct);
            await repo.SaveChangesAsync(ct);
            return Results.Created("/api/v1/education", ApiResponse<EducationDto>.Ok(item.ToDto()));
        });

        admin.MapPut("/education/{id:guid}", async (Guid id, UpsertEducationRequest request, IEducationRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertEducationRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<EducationDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<EducationDto>($"Education {id} not found.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<EducationDto>.Ok(existing.ToDto()));
        });

        admin.MapDelete("/education/{id:guid}", async (Guid id, IEducationRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Education {id} not found."));
    }

    // ---- envelope helpers ----
    private static void MapTestimonialAdmin(this RouteGroupBuilder admin)
    {
        admin.MapGet("/testimonials", async (ITestimonialRepository repo, CancellationToken ct) =>
        {
            var all = await repo.ListAsync(ct);
            return Results.Ok(ApiResponse<IReadOnlyList<TestimonialDto>>.Ok(all.Select(e => e.ToDto()).ToList()));
        });

        admin.MapPost("/testimonials", async (UpsertTestimonialRequest request, ITestimonialRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertTestimonialRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<TestimonialDto>(error);
            }

            var item = request.ToEntity();
            await repo.AddAsync(item, ct);
            await repo.SaveChangesAsync(ct);
            return Results.Created("/api/v1/testimonials", ApiResponse<TestimonialDto>.Ok(item.ToDto()));
        });

        admin.MapPut("/testimonials/{id:guid}", async (Guid id, UpsertTestimonialRequest request, ITestimonialRepository repo, CancellationToken ct) =>
        {
            var error = new UpsertTestimonialRequestValidator().Check(request);
            if (error is not null)
            {
                return BadRequest<TestimonialDto>(error);
            }

            var existing = await repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return NotFound<TestimonialDto>($"Testimonial {id} not found.");
            }

            request.ApplyTo(existing);
            await repo.SaveChangesAsync(ct);
            return Results.Ok(ApiResponse<TestimonialDto>.Ok(existing.ToDto()));
        });

        admin.MapDelete("/testimonials/{id:guid}", async (Guid id, ITestimonialRepository repo, CancellationToken ct) =>
            await repo.DeleteAsync(id, ct)
                ? Results.Ok(ApiResponse<bool>.Ok(true))
                : NotFound<bool>($"Testimonial {id} not found."));
    }

    private static IResult BadRequest<T>(string message) =>
        Results.BadRequest(ApiResponse<T>.Fail(message));

    private static IResult NotFound<T>(string message) =>
        Results.NotFound(ApiResponse<T>.Fail(message));

    private static IResult Conflict<T>(string message) =>
        Results.Json(ApiResponse<T>.Fail(message), statusCode: StatusCodes.Status409Conflict);
}
