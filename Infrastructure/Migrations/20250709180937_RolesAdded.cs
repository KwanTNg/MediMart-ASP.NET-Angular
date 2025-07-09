using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RolesAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "3c8f59e7-56de-4bc5-bf71-2e29b1a70000", null, "Pharmacist", "PHARMACIST" },
                    { "3c8f59e7-56de-4bc5-bf71-2e29b1a769f9", null, "Patient", "PATIENT" },
                    { "d2d8f7e1-f63c-46f1-b8b4-43c5f3c2f3e1", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "3c8f59e7-56de-4bc5-bf71-2e29b1a70000");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "3c8f59e7-56de-4bc5-bf71-2e29b1a769f9");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "d2d8f7e1-f63c-46f1-b8b4-43c5f3c2f3e1");
        }
    }
}
