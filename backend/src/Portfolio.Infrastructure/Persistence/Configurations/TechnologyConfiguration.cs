using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class TechnologyConfiguration : IEntityTypeConfiguration<Technology>
{
    public void Configure(EntityTypeBuilder<Technology> builder)
    {
        builder.ToTable("Technologies");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(120).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(140).IsRequired();
        builder.HasIndex(t => t.Slug).IsUnique();
        builder.Property(t => t.Category).HasMaxLength(80);
        builder.Property(t => t.IconUrl).HasMaxLength(2048);
        builder.Property(t => t.Proficiency).HasConversion<int>();
    }
}
