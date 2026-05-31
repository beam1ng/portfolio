using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ProjectTechnologyConfiguration : IEntityTypeConfiguration<ProjectTechnology>
{
    public void Configure(EntityTypeBuilder<ProjectTechnology> builder)
    {
        builder.ToTable("ProjectTechnologies");
        builder.HasKey(pt => new { pt.ProjectId, pt.TechnologyId });

        builder.HasOne(pt => pt.Project)
            .WithMany(p => p.ProjectTechnologies)
            .HasForeignKey(pt => pt.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pt => pt.Technology)
            .WithMany(t => t.ProjectTechnologies)
            .HasForeignKey(pt => pt.TechnologyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
