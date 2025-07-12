using Core.Entities.OrderAggregate;

namespace Core.Interfaces;

public interface IOrderService
{
    Task ConfirmOrderAndReduceStockAsync(Order order);
}
