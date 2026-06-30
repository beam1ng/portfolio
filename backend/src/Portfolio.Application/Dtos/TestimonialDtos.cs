namespace Portfolio.Application.Dtos;

/// <summary>A recommendation / testimonial for public display.</summary>
public sealed record TestimonialDto(
    Guid Id,
    string Author,
    string? Role,
    string? Company,
    string? Relationship,
    string Quote,
    string? AvatarUrl,
    string? SourceUrl,
    DateOnly? ReceivedDate,
    int SortOrder);

public sealed record UpsertTestimonialRequest(
    string Author,
    string? Role,
    string? Company,
    string? Relationship,
    string Quote,
    string? AvatarUrl,
    string? SourceUrl,
    DateOnly? ReceivedDate,
    int SortOrder);
