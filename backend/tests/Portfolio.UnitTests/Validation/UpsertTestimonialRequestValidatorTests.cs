using FluentAssertions;
using Portfolio.Application.Dtos;
using Portfolio.Application.Validation;

namespace Portfolio.UnitTests.Validation;

public sealed class UpsertTestimonialRequestValidatorTests
{
    private readonly UpsertTestimonialRequestValidator _sut = new();

    [Fact]
    public void ValidatePassesWhenRequestIsValid()
    {
        var result = _sut.Validate(ValidRequest());

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void ValidateFailsWhenAuthorIsEmpty()
    {
        var result = _sut.Validate(ValidRequest() with { Author = "" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpsertTestimonialRequest.Author));
    }

    [Fact]
    public void ValidateFailsWhenQuoteIsEmpty()
    {
        var result = _sut.Validate(ValidRequest() with { Quote = "" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpsertTestimonialRequest.Quote));
    }

    [Fact]
    public void ValidateFailsWhenQuoteExceedsMaxLength()
    {
        var result = _sut.Validate(ValidRequest() with { Quote = new string('x', 4001) });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpsertTestimonialRequest.Quote));
    }

    [Fact]
    public void ValidateFailsWhenSortOrderIsNegative()
    {
        var result = _sut.Validate(ValidRequest() with { SortOrder = -1 });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpsertTestimonialRequest.SortOrder));
    }

    private static UpsertTestimonialRequest ValidRequest() => new(
        Author: "Jane Doe",
        Role: "Engineering Manager",
        Company: "Acme",
        Relationship: "Managed Jakub directly",
        Quote: "One of the most reliable engineers I have worked with.",
        AvatarUrl: "https://example.com/jane.png",
        SourceUrl: "https://www.linkedin.com/in/janedoe",
        ReceivedDate: new DateOnly(2025, 3, 1),
        SortOrder: 0);
}
