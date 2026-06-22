using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ExperienceItemConfiguration : IEntityTypeConfiguration<ExperienceItem>
{
    public void Configure(EntityTypeBuilder<ExperienceItem> builder)
    {
        builder.ToTable("ExperienceItems");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Company).HasMaxLength(160).IsRequired();
        builder.Property(e => e.Role).HasMaxLength(160).IsRequired();
        builder.Property(e => e.Location).HasMaxLength(160);
        builder.Property(e => e.Summary).HasMaxLength(4000);
        builder.HasIndex(e => e.SortOrder);
    }
}
