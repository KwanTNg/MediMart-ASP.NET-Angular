using Core.Entities;

namespace Core.Specifications;

public class ContactMessageSpecification : BaseSpecification<ContactMessage>
{
    public ContactMessageSpecification(PagingParams pagingParams)
    {
        ApplyPaging(pagingParams.PageSize * (pagingParams.PageIndex - 1), pagingParams.PageSize);
        AddOrderByDescending(x => x.CreatedAt);
    }
}
