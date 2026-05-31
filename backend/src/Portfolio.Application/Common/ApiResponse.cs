namespace Portfolio.Application.Common;

/// <summary>
/// Consistent envelope for every API response.
/// </summary>
/// <typeparam name="T">Payload type.</typeparam>
public sealed record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Error = null,
    object? Meta = null)
{
    public static ApiResponse<T> Ok(T data, object? meta = null) => new(true, data, null, meta);

    public static ApiResponse<T> Fail(string error) => new(false, default, error);
}
