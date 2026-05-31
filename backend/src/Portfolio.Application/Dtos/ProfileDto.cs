namespace Portfolio.Application.Dtos;

public sealed record ProfileDto(
    string FullName,
    string Headline,
    string Bio,
    string? Location,
    string? AvatarUrl,
    string? ResumeUrl,
    string? Email,
    string? GitHubUrl,
    string? LinkedInUrl,
    string? WebsiteUrl);
