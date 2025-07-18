using Core.Entities;

namespace Core.Specifications;

public class ProductWithSymptomsSpecification : BaseSpecification<Product>
{
    public ProductWithSymptomsSpecification(int id)
        : base(p => p.Id == id)
    {
        AddInclude(p => p.ProductSymptoms);
        AddThenInclude("ProductSymptoms.Symptom");
        AddInclude(p => p.Photo); 
    }
}
