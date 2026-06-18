using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Api.Endpoints;
using Portfolio.Api.Middleware;
using Portfolio.Infrastructure;
using Portfolio.Infrastructure.Identity;
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
        .AllowAnyMethod()
        .AllowCredentials())); // cookie-based auth requires credentialed CORS

// ---- Authentication: JWT carried in an httpOnly cookie ----
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = string.IsNullOrWhiteSpace(jwt.SigningKey) ? JwtOptions.DevFallbackKey : jwt.SigningKey;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue(AuthEndpoints.CookieName, out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            },
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // interactive API docs at /scalar/v1
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" })).WithName("HealthCheck");
app.MapPortfolioApi();

await ApplyDatabaseSetupAsync(app);

app.Run();

// Applies pending migrations, seeds the admin user, and seeds content.
// Content source preference (only ever seeds an empty DB):
//   1. SEED_CONTENT_PATH → import the exported content.json (real content,
//      survives a volume reset);
//   2. otherwise, placeholder seed in Development.
static async Task ApplyDatabaseSetupAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    var db = services.GetRequiredService<PortfolioDbContext>();
    await db.Database.MigrateAsync();

    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var admin = services.GetRequiredService<IOptions<AdminOptions>>().Value;
    await IdentitySeeder.SeedAdminAsync(userManager, admin);

    var seedContentPath = Environment.GetEnvironmentVariable("SEED_CONTENT_PATH");
    if (!string.IsNullOrWhiteSpace(seedContentPath) && File.Exists(seedContentPath))
    {
        await ContentImporter.SeedAsync(db, seedContentPath);
    }
    else if (app.Environment.IsDevelopment())
    {
        await PortfolioSeeder.SeedAsync(db);
    }
}

/// <summary>
/// Exposed so the integration test project can reference the API entry point
/// via <c>WebApplicationFactory&lt;Program&gt;</c>.
/// </summary>
public partial class Program;
