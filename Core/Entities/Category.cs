namespace Core.Entities;

public class Category : BaseEntity
{
    public required string CategoryName { get; set; }
    public required string Description { get; set; }
    //Navigation property for related products
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
