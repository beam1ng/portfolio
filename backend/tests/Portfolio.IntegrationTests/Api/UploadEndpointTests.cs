using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Portfolio.Application.Common;
using Portfolio.Application.Dtos;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace Portfolio.IntegrationTests.Api;

public sealed class UploadEndpointTests(PortfolioApiFactory factory) : IClassFixture<PortfolioApiFactory>
{
    [Fact]
    public async Task UploadImageReturnsUnauthorizedWhenAnonymous()
    {
        var client = factory.CreateClient();
        using var content = ImageContent(8, 8, "shot.png");

        var response = await client.PostAsync("/api/v1/admin/uploads/images", content);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UploadImageRejectsNonImageFile()
    {
        var client = factory.CreateAuthenticatedClient();
        using var content = new MultipartFormDataContent();
        var file = new ByteArrayContent("not an image"u8.ToArray());
        file.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        content.Add(file, "file", "notes.txt");

        var response = await client.PostAsync("/api/v1/admin/uploads/images", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<UploadResult>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeFalse();
        body.Error.Should().Contain("Unsupported file type");
    }

    [Fact]
    public async Task UploadImageReturnsPublicUrlAndWritesFile()
    {
        var client = factory.CreateAuthenticatedClient();
        using var content = ImageContent(16, 16, "My Cover.png");

        var response = await client.PostAsync("/api/v1/admin/uploads/images", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<UploadResult>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data!.Url.Should().StartWith("/images/").And.EndWith(".png");

        var savedPath = Path.Combine(factory.UploadsPath, body.Data.Url["/images/".Length..]);
        File.Exists(savedPath).Should().BeTrue();
    }

    [Fact]
    public async Task UploadImageDownscalesOversizedImage()
    {
        var client = factory.CreateAuthenticatedClient();
        using var content = ImageContent(3000, 120, "wide.png");

        var response = await client.PostAsync("/api/v1/admin/uploads/images", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<UploadResult>>();
        var savedPath = Path.Combine(factory.UploadsPath, body!.Data!.Url["/images/".Length..]);

        using var saved = await Image.LoadAsync(savedPath);
        Math.Max(saved.Width, saved.Height).Should().BeLessThanOrEqualTo(2000);
    }

    private static MultipartFormDataContent ImageContent(int width, int height, string fileName)
    {
        using var image = new Image<Rgba32>(width, height);
        using var buffer = new MemoryStream();
        image.SaveAsPng(buffer);

        var file = new ByteArrayContent(buffer.ToArray());
        file.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        var content = new MultipartFormDataContent { { file, "file", fileName } };
        return content;
    }
}
