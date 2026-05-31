using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Endpoints;
using Portfolio.Api.Middleware;
using Portfolio.Infrastructure;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Infrastructure.Persistence.Seed;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "PortfolioFrontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // interactive API docs at /scalar/v1
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);

app.MapGet("/health", () => Results.Ok(new { status = "healthy" })).WithName("HealthCheck");
app.MapPortfolioApi();

await ApplyDatabaseSetupAsync(app);

app.Run();

// Applies pending migrations, and seeds placeholder content in Development.
static async Task ApplyDatabaseSetupAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<PortfolioDbContext>();
    await db.Database.MigrateAsync();

    if (app.Environment.IsDevelopment())
    {
        await PortfolioSeeder.SeedAsync(db);
    }
}

/// <summary>
/// Exposed so the integration test project can reference the API entry point
/// via <c>WebApplicationFactory&lt;Program&gt;</c>.
/// </summary>
public partial class Program;
