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

public sealed class UpsertSkillCategoryRequestValidator : AbstractValidator<UpsertSkillCategoryRequest>
{
    public UpsertSkillCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(100).Matches(SlugRules.Pattern).WithMessage(SlugRules.Message);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpsertSkillRequestValidator : AbstractValidator<UpsertSkillRequest>
{
    public UpsertSkillRequestValidator()
    {
        RuleFor(x => x.SkillCategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Level).InclusiveBetween(1, 5);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
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
