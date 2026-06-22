using System.Text;

namespace Portfolio.Api.Uploads;

/// <summary>
/// Validates and saves an uploaded document (currently the résumé / CV PDF) to
/// the configured uploads directory, returning its public URL. Reuses the same
/// bind-mounted directory as images, so the file serves immediately and is
/// committed to the repo for the static deploy.
/// </summary>
public static class DocumentUploadHandler
{
    private const long MaxBytes = 10 * 1024 * 1024; // 10 MB
    private const string PublicPrefix = "/images";
    private const int MaxStemLength = 50;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf" };

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
            return UploadOutcome.Fail("Only PDF files are supported.");
        }

        if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            return UploadOutcome.Fail("The uploaded file is not a PDF.");
        }

        var directory = config["Uploads:Path"]
            ?? Path.Combine(AppContext.BaseDirectory, "wwwroot", "images");
        Directory.CreateDirectory(directory);

        var fileName = BuildFileName(file.FileName);
        var fullPath = Path.Combine(directory, fileName);

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream, ct);

        return UploadOutcome.Ok($"{PublicPrefix}/{fileName}");
    }

    /// <summary>
    /// Slugifies the original name and appends a short unique suffix. The client
    /// filename is never used as a path (no traversal / overwrite risk).
    /// </summary>
    private static string BuildFileName(string originalName)
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
            trimmed = "document";
        }
        else if (trimmed.Length > MaxStemLength)
        {
            trimmed = trimmed[..MaxStemLength].TrimEnd('-');
        }

        var suffix = Guid.NewGuid().ToString("N")[..8];
        return $"{trimmed}-{suffix}.pdf";
    }
}
