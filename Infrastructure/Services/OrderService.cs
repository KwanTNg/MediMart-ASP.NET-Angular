using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class OrderService(IUnitOfWork unit, ILogger<OrderService> logger) : IOrderService
{
    public async Task ConfirmOrderAndReduceStockAsync(Order order)
    {
        foreach (var item in order.OrderItems)
        {
            var product = await unit.Repository<Product>().GetByIdAsync(item.ItemOrdered.ProductId);
            if (product == null)
                throw new Exception($"Product with ID {item.ItemOrdered.ProductId} not found");

            if (product.QuantityInStock < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for {product.Name}");

            product.QuantityInStock -= item.Quantity;
            unit.Repository<Product>().Update(product);
        }

        order.Status = OrderStatus.PaymentReceived;

        await unit.Complete();
    }
}

