using API.DTOs;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;
using Core.Entities;
using Core.Specifications;
using Microsoft.AspNetCore.Identity;
using Infrastructure.Services;

namespace API.Controllers;

[Authorize]
public class OrdersController(ICartService cartService, IUnitOfWork unit, IPaymentService paymentService,
    UserManager<AppUser> userManager, IEmailService emailService) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        var email = User.GetEmail();
        // Step 1: Check if the cart exists and has a PaymentIntentId
        var cart = await cartService.GetCartAsync(orderDto.CartId);
        if (cart == null || string.IsNullOrEmpty(cart.PaymentIntentId))
            return BadRequest("Cart or PaymentIntent not found");

        // Step 2: Check for existing order wuth same PaymentIntentId
        var existingOrderSpec = new OrderSpecification(cart.PaymentIntentId, true);
        var existingOrder = await unit.Repository<Order>().GetEntityWithSpec(existingOrderSpec);
        if (existingOrder != null) return Ok(existingOrder);

        var items = new List<OrderItem>();
        foreach (var item in cart.Items)
        {
            var productItem = await unit.Repository<Product>().GetByIdAsync(item.ProductId);
            if (productItem == null) return BadRequest("Problem with the order");
            var itemOrdered = new ProductItemOrdered
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                PictureUrl = item.PictureUrl
            };
            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity
            };
            items.Add(orderItem);
        }
        var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync(orderDto.DeliveryMethodId);
        if (deliveryMethod == null) return BadRequest("No delivery method selected");

        var order = new Order
        {
            OrderItems = items,
            DeliveryMethod = deliveryMethod,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = items.Sum(x => x.Price * x.Quantity),
            Discount = orderDto.Discount,
            PaymentSummary = orderDto.PaymentSummary,
            PaymentIntentId = cart.PaymentIntentId,
            BuyerEmail = email,
            Status = OrderStatus.AwaitingPayment
        };

        unit.Repository<Order>().Add(order);
        if (await unit.Complete())
        {
        //     var user = await userManager.FindByEmailAsync(email);

        //     var placeHolders = new List<KeyValuePair<string, string>>()
        // {
        //     new("{{UserName}}", user.FirstName),
        //     new("{{OrderId}}", order.Id.ToString()),
        //     new("{{OrderStatus}}", order.Status.ToString()),
        //     new("{{OrderStatusMessage}}", order.Status == OrderStatus.StockIssue 
        //                            ? "We received your payment, but some items are out of stock. Our team will contact you."
        //                            : "Your order has been successfully placed."),
        //     new("{{OrderDate}}", order.OrderDate.ToString("f")),
        //     new("{{PhoneNumber}}", order.ShippingAddress.PhoneNumber ?? "N/A"),
        //     new("{{Email}}", order.BuyerEmail),
        //     new("{{Subtotal}}", order.Subtotal.ToString("C")),
        //     new("{{Discount}}", "-£0.00"), 
        //     new("{{ShippingPrice}}", order.DeliveryMethod.Price.ToString("C")),
        //     new("{{Total}}", order.GetTotal().ToString("C")),
        //     new("{{OrderItems}}", string.Join("", order.OrderItems.Select(item =>
        //     $"<tr>" +
        //     $"<td><img src='{item.ItemOrdered.PictureUrl}' width='40' height='40' />{item.ItemOrdered.ProductName}</td>" +
        //     $"<td>{item.Quantity}</td>" +
        //     $"<td>{item.Price:C}</td>" +
        //     $"</tr>")))
        //  };
        //      await emailService.SendOrderConfirmationEmail(new UserEmailOptions
        // {
        //     ToEmails = new List<string> { order.BuyerEmail },
        //     PlaceHolders = placeHolders
        // });
            return order;
        }
        return BadRequest("Problem creating order");
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
    {
        var spec = new OrderSpecification(User.GetEmail());
        var orders = await unit.Repository<Order>().ListAsync(spec);
         //select all from orders, return a list of order
        var ordersToReturn = orders.Select(o => o.ToDto()).ToList();
        return Ok(ordersToReturn);
    }

    //This uses User.GetEmail() to only return an order if it belongs to the currently logged-in user.
    //Even if a user manually changes the URL to /orders/123, they will only get that order if it matches their email.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(User.GetEmail(), id);
        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);
        if (order == null) return NotFound();
        return order.ToDto();
    }
}
