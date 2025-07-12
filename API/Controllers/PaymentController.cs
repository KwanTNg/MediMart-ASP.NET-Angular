using API.SignalR;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Stripe;
using API.Extensions;

namespace API.Controllers;

public class PaymentsController(IPaymentService paymentService, IOrderService orderService,
    IUnitOfWork unit, ILogger<PaymentsController> logger, IConfiguration config,
    IHubContext<NotificationHub> hubContext) : BaseApiController
{
    private readonly string _whSecret = config["StripeSettings:WhSecret"]!;

    [Authorize]
    [HttpPost("{cartId}")]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
    {
        var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);
        //if client change the product id or delivery method id, it will return null
        if (cart == null) return BadRequest("Some items are sold out!");
        return Ok(cart);
    }

    [HttpGet("delivery-methods")]
    public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
    {
        return Ok(await unit.Repository<DeliveryMethod>().ListAllAsync());
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();
        try
        {
            var stripeEvent = ConstructStripeEvent(json);
            //Check what object it is, we only interest in payment intent
            if (stripeEvent.Data.Object is not PaymentIntent intent)
            {
                return BadRequest("Invalid event data");
            }
            await HandlePaymentIntentSucceeded(intent);
            return Ok();
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Stripe webhook error");
            return StatusCode(StatusCodes.Status500InternalServerError, "Webhook error");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred");
            return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred");
        }
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status == "succeeded")
        {
            var spec = new OrderSpecification(intent.Id, true);
            var order = await unit.Repository<Order>().GetEntityWithSpec(spec)
            ?? throw new Exception("Order not found");
            
            var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);

            //check if the amount in stripe is same as in the database
            if ((long)(order.GetTotal() * 100) != intent.Amount)
            {
                //it will update in db
                order.Status = OrderStatus.PaymentMismatch;
            }
            else
            {
                try
                {
                    await orderService.ConfirmOrderAndReduceStockAsync(order);
                }
                catch (InvalidOperationException ex)
                {
                    logger.LogError(ex, "Stock issue after payment succeeded");

                    // Update order status and persist
                    order.Status = OrderStatus.StockIssue;
                    await unit.Complete();

                    // Notify user via SignalR
                    
                    if (!string.IsNullOrEmpty(connectionId))
                    {
                        await hubContext.Clients.Client(connectionId).SendAsync("OrderStockIssue", ex.Message);
                    }
            
                }

            }
            
            await unit.Complete();

            //TODO: SignalR
            if (!string.IsNullOrEmpty(connectionId))
            {
                await hubContext.Clients.Client(connectionId).SendAsync("OrderCompleteNotification", order.ToDto());
            }
        }
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _whSecret);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to constrcut stripe event");
            throw new StripeException("Invalid signature");
        }
    }


}