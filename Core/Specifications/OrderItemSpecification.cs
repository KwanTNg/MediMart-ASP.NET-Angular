using System;
using Core.Entities.OrderAggregate;

namespace Core.Specifications;

public class OrderItemSpecification : BaseSpecification<OrderItem>
{
    public OrderItemSpecification(PagingParams pagingParams)
    {
        AddInclude(o => o.ItemOrdered);
        ApplyPaging(pagingParams.PageSize * (pagingParams.PageIndex - 1), pagingParams.PageSize);
        AddOrderByDescending(x => x.Id);
    }

}
