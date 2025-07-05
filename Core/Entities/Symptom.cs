namespace Core.Entities;

public class Symptom : BaseEntity
{
    public required string SymptomName { get; set; }
    public required string Description { get; set; }

    //Navigation property for many-to-many products
    public ICollection<ProductSymptom> ProductSymptoms { get; set; } = new List<ProductSymptom>();

}
