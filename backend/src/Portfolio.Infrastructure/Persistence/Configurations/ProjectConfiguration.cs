using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(220).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Summary).HasMaxLength(500).IsRequired();
        builder.Property(p => p.Description).HasColumnType("nvarchar(max)");
        builder.Property(p => p.RepoUrl).HasMaxLength(2048);
        builder.Property(p => p.LiveUrl).HasMaxLength(2048);
        builder.Property(p => p.ImageUrl).HasMaxLength(2048);
        builder.HasIndex(p => new { p.IsFeatured, p.SortOrder });
    }
}
