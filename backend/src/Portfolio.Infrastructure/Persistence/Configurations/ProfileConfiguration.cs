using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.ToTable("Profiles");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.FullName).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Headline).HasMaxLength(300).IsRequired();
        builder.Property(p => p.Bio).HasColumnType("nvarchar(max)");
        builder.Property(p => p.Location).HasMaxLength(200);
        builder.Property(p => p.AvatarUrl).HasMaxLength(2048);
        builder.Property(p => p.ResumeUrl).HasMaxLength(2048);
        builder.Property(p => p.Email).HasMaxLength(320);
        builder.Property(p => p.GitHubUrl).HasMaxLength(2048);
        builder.Property(p => p.LinkedInUrl).HasMaxLength(2048);
        builder.Property(p => p.WebsiteUrl).HasMaxLength(2048);
    }
}
