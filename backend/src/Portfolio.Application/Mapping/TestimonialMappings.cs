using Portfolio.Application.Dtos;
using Portfolio.Domain.Entities;

namespace Portfolio.Application.Mapping;

/// <summary>Maps Testimonial entities to/from their DTOs.</summary>
public static class TestimonialMappings
{
    public static TestimonialDto ToDto(this Testimonial item) =>
        new(
            item.Id,
            item.Author,
            item.Role,
            item.Company,
            item.Relationship,
            item.Quote,
            item.AvatarUrl,
            item.SourceUrl,
            item.ReceivedDate,
            item.SortOrder);

    public static Testimonial ToEntity(this UpsertTestimonialRequest request)
    {
        var item = new Testimonial { Author = request.Author, Quote = request.Quote };
        request.ApplyTo(item);
        return item;
    }

    public static void ApplyTo(this UpsertTestimonialRequest request, Testimonial target)
    {
        target.Author = request.Author.Trim();
        target.Role = request.Role?.Trim();
        target.Company = request.Company?.Trim();
        target.Relationship = request.Relationship?.Trim();
        target.Quote = request.Quote.Trim();
        target.AvatarUrl = request.AvatarUrl?.Trim();
        target.SourceUrl = request.SourceUrl?.Trim();
        target.ReceivedDate = request.ReceivedDate;
        target.SortOrder = request.SortOrder;
    }
}
