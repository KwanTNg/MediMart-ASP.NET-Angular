namespace Core.Entities;

//Join table for Product ↔ Symptom (many-to-many)
public class ProductSymptom : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int SymptomId { get; set; }
    public Symptom Symptom { get; set; } = null!;
}
