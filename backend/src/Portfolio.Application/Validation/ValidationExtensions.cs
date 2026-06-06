using FluentValidation;

namespace Portfolio.Application.Validation;

/// <summary>Convenience for running a validator and flattening errors to a single message.</summary>
public static class ValidationExtensions
{
    /// <summary>Returns null when valid, otherwise a "; "-joined error message.</summary>
    public static string? Check<T>(this IValidator<T> validator, T instance)
    {
        var result = validator.Validate(instance);
        return result.IsValid ? null : string.Join("; ", result.Errors.Select(e => e.ErrorMessage));
    }
}
