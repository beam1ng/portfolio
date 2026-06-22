using FluentAssertions;
using Portfolio.Application.Dtos;
using Portfolio.Application.Validation;

namespace Portfolio.UnitTests.Validation;

public sealed class UpsertProjectRequestValidatorTests
{
    private readonly UpsertProjectRequestValidator _sut = new();

    [Fact]
    public void ValidatePassesWhenRequestIsValid()
    {
        var result = _sut.Validate(ValidRequest());

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("Portfolio Platform")]
    [InlineData("portfolio_platform")]
    [InlineData("portfolio-")]
    [InlineData("-portfolio")]
    public void ValidateFailsWhenSlugIsNotLowercaseKebabCase(string slug)
    {
        var result = _sut.Validate(ValidRequest() with { Slug = slug });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpsertProjectRequest.Slug));
    }

    [Fact]
    public void ValidateFailsWhenEndDateIsBeforeStartDate()
    {
        var result = _sut.Validate(ValidRequest() with
        {
            StartDate = new DateOnly(2026, 6, 1),
            EndDate = new DateOnly(2026, 5, 31),
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "End date must be on or after the start date.");
    }

    [Fact]
    public void ValidateFailsWhenGalleryImageUrlIsEmpty()
    {
        var result = _sut.Validate(ValidRequest() with
        {
            Images = [new UpsertProjectImage("", "Dashboard")],
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Images[0].ImageUrl");
    }

    private static UpsertProjectRequest ValidRequest() => new(
        "Portfolio Platform",
        "portfolio-platform",
        "A portfolio with admin-managed content.",
        "Longer project description.",
        RepoUrl: "https://github.com/example/portfolio",
        LiveUrl: "https://example.com",
        ImageUrl: "/images/portfolio.png",
        IsFeatured: true,
        SortOrder: 0,
        StartDate: new DateOnly(2026, 1, 1),
        EndDate: new DateOnly(2026, 6, 1),
        Technologies: [new UpsertProjectTechnology(Guid.NewGuid(), "API and admin UI")],
        Images: [new UpsertProjectImage("/images/gallery.png", "Gallery")]);
}
