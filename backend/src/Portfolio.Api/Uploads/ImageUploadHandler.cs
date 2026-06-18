using System.Text;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Portfolio.Api.Uploads;

/// <summary>
/// Validates an uploaded gallery image, downscales/recompresses it to a
/// web-friendly size, and saves it to the configured uploads directory,
/// returning the public URL path. The directory is bind-mounted to the web
/// app's <c>public/images</c> in local authoring (see docker-compose), so saved
/// files are served immediately and committed to the repo for the static deploy.
/// </summary>
public static class ImageUploadHandler
{
    // Cap the *source* upload generously — phone photos are large; we shrink them
    // on save. Must stay under nginx client_max_body_size and Kestrel's limit.
    private const long MaxBytes = 25 * 1024 * 1024; // 25 MB
    private const int MaxDimension = 2000; // longest side, px — retina-sharp in the gallery
    private const int JpegQuality = 82;
    private const string PublicPrefix = "/images";
    private const int MaxStemLength = 40;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif" };

    public static async Task<UploadOutcome> SaveAsync(IFormFile file, IConfiguration config, CancellationToken ct)
    {
        if (file.Length == 0)
        {
            return UploadOutcome.Fail("The uploaded file is empty.");
        }

        if (file.Length > MaxBytes)
        {
            return UploadOutcome.Fail($"File exceeds the {MaxBytes / (1024 * 1024)} MB limit.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            return UploadOutcome.Fail(
                $"Unsupported file type. Allowed: {string.Join(", ", AllowedExtensions.Order())}.");
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return UploadOutcome.Fail("The uploaded file is not an image.");
        }

        var directory = config["Uploads:Path"]
            ?? Path.Combine(AppContext.BaseDirectory, "wwwroot", "images");
        Directory.CreateDirectory(directory);

        var fileName = BuildFileName(file.FileName, extension);
        var fullPath = Path.Combine(directory, fileName);

        // Buffer once so we can fall back to the raw bytes if the format can't be
        // decoded (e.g. AVIF, which ImageSharp does not load).
        using var buffer = new MemoryStream();
        await file.CopyToAsync(buffer, ct);
        buffer.Position = 0;

        try
        {
            using var image = await Image.LoadAsync(buffer, ct);
            if (image.Width > MaxDimension || image.Height > MaxDimension)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(MaxDimension, MaxDimension),
                    Mode = ResizeMode.Max, // preserve aspect ratio; fit within the box
                }));
            }

            await SaveEncodedAsync(image, fullPath, extension, ct);
        }
        catch (Exception ex) when (ex is UnknownImageFormatException or NotSupportedException or InvalidImageContentException)
        {
            // Decoder unavailable for this format — store the validated original.
            buffer.Position = 0;
            await using var output = File.Create(fullPath);
            await buffer.CopyToAsync(output, ct);
        }

        return UploadOutcome.Ok($"{PublicPrefix}/{fileName}");
    }

    // Re-encodes in the original format so the URL extension stays accurate.
    private static Task SaveEncodedAsync(Image image, string path, string extension, CancellationToken ct) =>
        extension.ToLowerInvariant() switch
        {
            ".png" => image.SaveAsPngAsync(path, ct),
            ".gif" => image.SaveAsGifAsync(path, ct),
            ".webp" => image.SaveAsWebpAsync(path, new WebpEncoder { Quality = JpegQuality }, ct),
            _ => image.SaveAsJpegAsync(path, new JpegEncoder { Quality = JpegQuality }, ct), // jpg/jpeg
        };

    /// <summary>
    /// Slugifies the original name and appends a short unique suffix. The client
    /// filename is never used as a path, which removes any path-traversal or
    /// overwrite risk.
    /// </summary>
    private static string BuildFileName(string originalName, string extension)
    {
        var stem = Path.GetFileNameWithoutExtension(originalName).ToLowerInvariant();
        var slug = new StringBuilder(stem.Length);
        foreach (var ch in stem)
        {
            if (char.IsLetterOrDigit(ch))
            {
                slug.Append(ch);
            }
            else if (slug.Length > 0 && slug[^1] != '-')
            {
                slug.Append('-');
            }
        }

        var trimmed = slug.ToString().Trim('-');
        if (trimmed.Length == 0)
        {
            trimmed = "image";
        }
        else if (trimmed.Length > MaxStemLength)
        {
            trimmed = trimmed[..MaxStemLength].TrimEnd('-');
        }

        var suffix = Guid.NewGuid().ToString("N")[..8];
        return $"{trimmed}-{suffix}{extension.ToLowerInvariant()}";
    }
}

/// <summary>Result of an image upload attempt.</summary>
public readonly record struct UploadOutcome(bool Success, string? Url, string? Error)
{
    public static UploadOutcome Ok(string url) => new(true, url, null);
    public static UploadOutcome Fail(string error) => new(false, null, error);
}
