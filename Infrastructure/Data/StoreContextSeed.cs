using System.Reflection;
using System.Text.Json;
using Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context, UserManager<AppUser> userManager)
    {
        if (!userManager.Users.Any(x => x.UserName == "admin@medimart.com"))
        {
            var user = new AppUser
            {
                UserName = "admin@medimart.com",
                Email = "admin@medimart.com"
            };
            await userManager.CreateAsync(user, "Pa$$w0rd");
            await userManager.AddToRoleAsync(user, "Admin");
        }

        var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

        if (!context.Symptoms.Any())
        {
            var symptomsData = await File.ReadAllTextAsync(path + @"/Data/SeedData/symptoms.json");
            var symptoms = JsonSerializer.Deserialize<List<Symptom>>(symptomsData);
            if (symptoms == null) return;
            context.Symptoms.AddRange(symptoms);
            await context.SaveChangesAsync();
        }
        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync(path + @"/Data/SeedData/products.json");
            var products = JsonSerializer.Deserialize<List<Product>>(productsData);
            if (products == null) return;
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }
        if (!context.ProductSymptoms.Any())
        {
            var productSymptomData = await File.ReadAllTextAsync(path + @"/Data/SeedData/productSymptoms.json");
            var productSymptoms = JsonSerializer.Deserialize<List<ProductSymptom>>(productSymptomData);
            if (productSymptoms == null) return;
            context.ProductSymptoms.AddRange(productSymptoms);
            await context.SaveChangesAsync();
        }
        if (!context.DeliveryMethods.Any())
        {
            var dmData = await File.ReadAllTextAsync(path + @"/Data/SeedData/delivery.json");
            var methods = JsonSerializer.Deserialize<List<DeliveryMethod>>(dmData);
            if (methods == null) return;
            context.DeliveryMethods.AddRange(methods);
            await context.SaveChangesAsync();
        }
    }
}
