using System.Text.Json.Serialization;

namespace Core.Entities;

public class Product : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public required string PictureUrl { get; set; }
    public required string Type { get; set; }
    public required string Brand { get; set; }
    public int QuantityInStock { get; set; }
    public required string Category { get; set; }
    //One to one
    [JsonIgnore]
    public Photo? Photo { get; set; }

    //Navigation property for many-to-many symptoms
    public ICollection<ProductSymptom> ProductSymptoms { get; set; } = new List<ProductSymptom>();

}
