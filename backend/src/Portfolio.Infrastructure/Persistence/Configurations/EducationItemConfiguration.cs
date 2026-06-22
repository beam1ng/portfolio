using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class EducationItemConfiguration : IEntityTypeConfiguration<EducationItem>
{
    public void Configure(EntityTypeBuilder<EducationItem> builder)
    {
        builder.ToTable("EducationItems");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.School).HasMaxLength(160).IsRequired();
        builder.Property(e => e.Credential).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Field).HasMaxLength(160);
        builder.Property(e => e.Url).HasMaxLength(2048);
        builder.HasIndex(e => e.SortOrder);
    }
}
