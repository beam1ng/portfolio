using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class SkillCategoryConfiguration : IEntityTypeConfiguration<SkillCategory>
{
    public void Configure(EntityTypeBuilder<SkillCategory> builder)
    {
        builder.ToTable("SkillCategories");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(120).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(140).IsRequired();
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.HasMany(c => c.Skills)
            .WithOne(s => s.SkillCategory)
            .HasForeignKey(s => s.SkillCategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.ToTable("Skills");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).HasMaxLength(120).IsRequired();
        builder.Property(s => s.Level).HasConversion<int>();
    }
}
