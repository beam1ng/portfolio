using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddResumeItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EducationItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    School = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Credential = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Field = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EducationItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExperienceItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Company = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExperienceItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EducationItems_SortOrder",
                table: "EducationItems",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_ExperienceItems_SortOrder",
                table: "ExperienceItems",
                column: "SortOrder");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EducationItems");

            migrationBuilder.DropTable(
                name: "ExperienceItems");
        }
    }
}
