using Core.Entities;
using Core.Entities.OrderAggregate;
using Infrastructure.Config;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class StoreContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Product> Products { get; set; }
    public DbSet<Symptom> Symptoms { get; set; }
    public DbSet<ProductSymptom> ProductSymptoms { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<DeliveryMethod> DeliveryMethods { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductConfiguration).Assembly);

        modelBuilder.Entity<ProductSymptom>()
            .HasKey(ps => new { ps.ProductId, ps.SymptomId });

        modelBuilder.Entity<ProductSymptom>()
            .HasOne(ps => ps.Product)
            .WithMany(p => p.ProductSymptoms)
            .HasForeignKey(ps => ps.ProductId);

        modelBuilder.Entity<ProductSymptom>()
            .HasOne(ps => ps.Symptom)
            .WithMany(s => s.ProductSymptoms)
            .HasForeignKey(ps => ps.SymptomId);

        modelBuilder.Entity<Message>()
            .HasOne(x => x.Recipient)
            .WithMany(m => m.MessagesReceived)
            // Message will not be deleted if user is removed
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(x => x.Sender)
            .WithMany(m => m.MessageSent)
            .OnDelete(DeleteBehavior.Restrict);

    }
}
