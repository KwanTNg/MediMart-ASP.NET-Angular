using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole>
{
    public void Configure(EntityTypeBuilder<IdentityRole> builder)
    {
          builder.HasData(
            new IdentityRole { Id = "d2d8f7e1-f63c-46f1-b8b4-43c5f3c2f3e1", Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = "3c8f59e7-56de-4bc5-bf71-2e29b1a70000", Name = "Pharmacist", NormalizedName = "PHARMACIST" },
            new IdentityRole { Id = "3c8f59e7-56de-4bc5-bf71-2e29b1a769f9", Name = "Patient", NormalizedName = "PATIENT" }
        );
    }
}

