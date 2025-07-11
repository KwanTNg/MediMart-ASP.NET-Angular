using Core.Entities.OrderAggregate;

namespace Core.Specifications;

public class OrderSpecification : BaseSpecification<Order>
{
    //we will use this specification to get the list of orders
    public OrderSpecification(string email) : base(x => x.BuyerEmail == email)
    {
        AddInclude(x => x.OrderItems);
        AddInclude(x => x.DeliveryMethod);
    }
    public OrderSpecification(string email, int id) : base(x => x.BuyerEmail == email && x.Id == id)
    {
        AddInclude(x => x.OrderItems);
        AddInclude(x => x.DeliveryMethod);
    }
}
