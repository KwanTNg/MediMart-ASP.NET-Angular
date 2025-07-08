using System.Text.Json;
using Core.Entities;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context)
    {
        if (!context.Symptoms.Any())
        {
            var symptomsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/symptoms.json");
            var symptoms = JsonSerializer.Deserialize<List<Symptom>>(symptomsData);
            if (symptoms == null) return;
            context.Symptoms.AddRange(symptoms);
            await context.SaveChangesAsync();
        }
        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");
            var products = JsonSerializer.Deserialize<List<Product>>(productsData);
            if (products == null) return;
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }  
        if (!context.ProductSymptoms.Any())
        {
            var productSymptomData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/productSymptoms.json");
            var productSymptoms = JsonSerializer.Deserialize<List<ProductSymptom>>(productSymptomData);
            if (productSymptoms == null) return;
            context.ProductSymptoms.AddRange(productSymptoms);
            await context.SaveChangesAsync();
        }    

    }
    
}
