using Core.Entities;

namespace Core.Specifications;

public class ProductWithPhotoSpecification : BaseSpecification<Product>
{
    public ProductWithPhotoSpecification(int id)
        : base(p => p.Id == id)
    {
        AddInclude(p => p.Photo);
    }
}
