using Core.Entities;

namespace Core.Specifications;

public class ProductSpecification : BaseSpecification<Product>
{
    public ProductSpecification(ProductSpecParams specParams) : base(x =>
        (string.IsNullOrWhiteSpace(specParams.Search) || x.Name.ToLower().Contains(specParams.Search)) &&
        (!specParams.Brands.Any() || specParams.Brands.Contains(x.Brand)) &&
        (!specParams.Types.Any() || specParams.Types.Contains(x.Type)) &&
        (!specParams.Categories.Any() || specParams.Categories.Contains(x.Category)) &&
        (!specParams.SymptomIds.Any() || x.ProductSymptoms.Any(ps => specParams.SymptomIds.Contains(ps.SymptomId)))
    )
    {
        //eager loading
        AddInclude(p => p.ProductSymptoms);                     // Include the join table
        AddThenInclude("ProductSymptoms.Symptom"); // Include the related Symptom entity
        //skip and take
        ApplyPaging(specParams.PageSize * (specParams.PageIndex - 1), specParams.PageSize);

        switch (specParams.Sort)
        {
            case "priceAsc":
                AddOrderBy(x => x.Price);
                break;
            case "priceDesc":
                AddOrderByDescending(x => x.Price);
                break;
            default:
                AddOrderBy(x => x.Name);
                break;
        }

    }
    
    // Constructor for fetching a single product by ID
    public ProductSpecification(int id)
        : base(p => p.Id == id)
    {
        AddInclude(p => p.ProductSymptoms);
        AddThenInclude("ProductSymptoms.Symptom");
        AddInclude(p => p.Photo); 
    }

}
