using FluentAssertions;
using Portfolio.Application.Dtos;
using Portfolio.Application.Mapping;
using Portfolio.Domain.Entities;

namespace Portfolio.UnitTests.Mapping;

public sealed class WriteMappingsTests
{
    [Fact]
    public void ApplyToDiffsProjectTechnologiesAndTrimsNotes()
    {
        var keptTechnologyId = Guid.NewGuid();
        var removedTechnologyId = Guid.NewGuid();
        var addedTechnologyId = Guid.NewGuid();
        var project = new Project
        {
            Title = "Old",
            Slug = "old",
            Summary = "Old summary",
            ProjectTechnologies =
            [
                new ProjectTechnology { TechnologyId = keptTechnologyId, Note = "old note" },
                new ProjectTechnology { TechnologyId = removedTechnologyId, Note = "remove me" },
            ],
        };
        var request = ValidRequest() with
        {
            Technologies =
            [
                new UpsertProjectTechnology(keptTechnologyId, "  updated note  "),
                new UpsertProjectTechnology(addedTechnologyId, "  "),
            ],
        };

        request.ApplyTo(project);

        project.ProjectTechnologies.Should().HaveCount(2);
        project.ProjectTechnologies.Should().ContainSingle(pt =>
            pt.TechnologyId == keptTechnologyId && pt.Note == "updated note");
        project.ProjectTechnologies.Should().ContainSingle(pt =>
            pt.TechnologyId == addedTechnologyId && pt.Note == null);
        project.ProjectTechnologies.Should().NotContain(pt => pt.TechnologyId == removedTechnologyId);
    }

    [Fact]
    public void ApplyToReplacesGalleryImagesInRequestOrder()
    {
        var project = new Project
        {
            Title = "Old",
            Slug = "old",
            Summary = "Old summary",
            Images = [new ProjectImage { ImageUrl = "/old.png", SortOrder = 5 }],
        };
        var request = ValidRequest() with
        {
            Images =
            [
                new UpsertProjectImage(" /images/one.png ", "  One  "),
                new UpsertProjectImage("/images/two.png", " "),
            ],
        };

        request.ApplyTo(project);

        project.Images.Should().HaveCount(2);
        project.Images.Select(i => i.SortOrder).Should().Equal(0, 1);
        project.Images.Select(i => i.ImageUrl).Should().Equal("/images/one.png", "/images/two.png");
        project.Images.First().Caption.Should().Be("One");
        project.Images.Last().Caption.Should().BeNull();
    }

    private static UpsertProjectRequest ValidRequest() => new(
        "Portfolio Platform",
        "portfolio-platform",
        "A portfolio with admin-managed content.",
        "Longer project description.",
        RepoUrl: null,
        LiveUrl: null,
        ImageUrl: null,
        IsFeatured: true,
        SortOrder: 0,
        StartDate: null,
        EndDate: null,
        Technologies: [],
        Images: []);
}
