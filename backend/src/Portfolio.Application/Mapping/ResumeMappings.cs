using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.Application.Mapping;

/// <summary>Maps Experience and Education entities to/from their DTOs.</summary>
public static class ResumeMappings
{
    public static ExperienceDto ToDto(this ExperienceItem item) =>
        new(item.Id, item.Company, item.Role, item.Location, item.StartDate, item.EndDate, item.Summary, item.SortOrder);

    public static EducationDto ToDto(this EducationItem item) =>
        new(item.Id, item.School, item.Credential, item.Field, item.StartDate, item.EndDate, item.Url, item.SortOrder);

    public static ExperienceItem ToEntity(this UpsertExperienceRequest request)
    {
        var item = new ExperienceItem { Company = request.Company, Role = request.Role };
        request.ApplyTo(item);
        return item;
    }

    public static void ApplyTo(this UpsertExperienceRequest request, ExperienceItem target)
    {
        target.Company = request.Company.Trim();
        target.Role = request.Role.Trim();
        target.Location = Clean(request.Location);
        target.StartDate = request.StartDate;
        target.EndDate = request.EndDate;
        target.Summary = Clean(request.Summary);
        target.SortOrder = request.SortOrder;
    }

    public static EducationItem ToEntity(this UpsertEducationRequest request)
    {
        var item = new EducationItem { School = request.School, Credential = request.Credential };
        request.ApplyTo(item);
        return item;
    }

    public static void ApplyTo(this UpsertEducationRequest request, EducationItem target)
    {
        target.School = request.School.Trim();
        target.Credential = request.Credential.Trim();
        target.Field = Clean(request.Field);
        target.StartDate = request.StartDate;
        target.EndDate = request.EndDate;
        target.Url = Clean(request.Url);
        target.SortOrder = request.SortOrder;
    }

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
