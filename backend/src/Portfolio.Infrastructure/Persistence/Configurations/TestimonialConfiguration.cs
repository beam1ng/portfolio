using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
{
    public void Configure(EntityTypeBuilder<Testimonial> builder)
    {
        builder.ToTable("Testimonials");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Author).HasMaxLength(160).IsRequired();
        builder.Property(e => e.Role).HasMaxLength(160);
        builder.Property(e => e.Company).HasMaxLength(160);
        builder.Property(e => e.Relationship).HasMaxLength(240);
        builder.Property(e => e.Quote).HasMaxLength(4000).IsRequired();
        builder.Property(e => e.AvatarUrl).HasMaxLength(500);
        builder.Property(e => e.SourceUrl).HasMaxLength(500);
        builder.HasIndex(e => e.SortOrder);
    }
}
