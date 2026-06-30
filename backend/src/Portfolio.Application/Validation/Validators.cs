using FluentValidation;
using Portfolio.Application.Dtos;

namespace Portfolio.Application.Validation;

/// <summary>Shared rules for URL-safe slugs.</summary>
internal static class SlugRules
{
    public const string Pattern = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    public const string Message = "Slug must be lowercase kebab-case (letters, digits, hyphens).";
}

public sealed class UpsertProjectRequestValidator : AbstractValidator<UpsertProjectRequest>
{
    public UpsertProjectRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(120).Matches(SlugRules.Pattern).WithMessage(SlugRules.Message);
        RuleFor(x => x.Summary).NotEmpty().MaximumLength(500);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleForEach(x => x.Technologies).ChildRules(tech =>
        {
            tech.RuleFor(t => t.TechnologyId).NotEmpty();
            tech.RuleFor(t => t.Note).MaximumLength(500);
        });
        RuleForEach(x => x.Images).ChildRules(image =>
        {
            image.RuleFor(i => i.ImageUrl).NotEmpty().MaximumLength(2048);
            image.RuleFor(i => i.Caption).MaximumLength(300);
        });
        When(x => x.StartDate.HasValue && x.EndDate.HasValue, () =>
            RuleFor(x => x.EndDate!.Value)
                .GreaterThanOrEqualTo(x => x.StartDate!.Value)
                .WithMessage("End date must be on or after the start date."));
    }
}

public sealed class UpsertTechnologyRequestValidator : AbstractValidator<UpsertTechnologyRequest>
{
    public UpsertTechnologyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(100).Matches(SlugRules.Pattern).WithMessage(SlugRules.Message);
        RuleFor(x => x.Proficiency).InclusiveBetween(1, 5);
    }
}

public sealed class UpsertProfileRequestValidator : AbstractValidator<UpsertProfileRequest>
{
    public UpsertProfileRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Headline).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public sealed class UpsertExperienceRequestValidator : AbstractValidator<UpsertExperienceRequest>
{
    public UpsertExperienceRequestValidator()
    {
        RuleFor(x => x.Company).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Role).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Location).MaximumLength(160);
        RuleFor(x => x.Summary).MaximumLength(4000);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        When(x => x.EndDate.HasValue, () =>
            RuleFor(x => x.EndDate!.Value)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .WithMessage("End date must be on or after the start date."));
    }
}

public sealed class UpsertTestimonialRequestValidator : AbstractValidator<UpsertTestimonialRequest>
{
    public UpsertTestimonialRequestValidator()
    {
        RuleFor(x => x.Author).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Role).MaximumLength(160);
        RuleFor(x => x.Company).MaximumLength(160);
        RuleFor(x => x.Relationship).MaximumLength(240);
        RuleFor(x => x.Quote).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.AvatarUrl).MaximumLength(500);
        RuleFor(x => x.SourceUrl).MaximumLength(500);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpsertEducationRequestValidator : AbstractValidator<UpsertEducationRequest>
{
    public UpsertEducationRequestValidator()
    {
        RuleFor(x => x.School).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Credential).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Field).MaximumLength(160);
        RuleFor(x => x.Url).MaximumLength(2048);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        When(x => x.StartDate.HasValue && x.EndDate.HasValue, () =>
            RuleFor(x => x.EndDate!.Value)
                .GreaterThanOrEqualTo(x => x.StartDate!.Value)
                .WithMessage("End date must be on or after the start date."));
    }
}
