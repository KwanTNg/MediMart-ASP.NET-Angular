using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

// public class PaymentService(IConfiguration config, ICartService cartService,
//     IUnitOfWork unit) : IPaymentService
// {
//     public async Task<ShoppingCart> CreateOrUpdatePaymentIntent(string cartId)
//     {
//         StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];
//         var cart = await cartService.GetCartAsync(cartId);
//         if (cart == null) return null;
//         //m means decimal
//         var shippingPrice = 0m;
//         if (cart.DeliveryMethodId.HasValue)
//         {
//             var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync((int)cart.DeliveryMethodId);
//             if (deliveryMethod == null) return null;
//             shippingPrice = deliveryMethod.Price;
//         }

//         foreach (var item in cart.Items)
//         {
//             //get product data from product database base on cart
//             var productItem = await unit.Repository<Core.Entities.Product>().GetByIdAsync(item.ProductId);
//             if (productItem == null) return null;
//             if (item.Price != productItem.Price)
//             {
//                 item.Price = productItem.Price;
//             }
//             var service = new PaymentIntentService();
//             PaymentIntent? intent = null;

//             //if paymentintentid is null or empty
//             if (string.IsNullOrEmpty(cart.PaymentIntentId))
//             {
//                 var options = new PaymentIntentCreateOptions
//                 {
//                     Amount = (long)cart.Items.Sum(x => x.Quantity * (x.Price * 100))
//                     + (long)shippingPrice * 100,
//                     Currency = "usd",
//                     PaymentMethodTypes = ["card"]
//                 };
//                 intent = await service.CreateAsync(options);
//                 cart.PaymentIntentId = intent.Id;
//                 cart.ClientSecret = intent.ClientSecret;
//             }
//             else
//             //if paymentintentid exist 
//             {
//                 var options = new PaymentIntentUpdateOptions
//                 {
//                     Amount = (long)cart.Items.Sum(x => x.Quantity * (x.Price * 100))
//                     + (long)shippingPrice * 100
//                 };
//                 intent = await service.UpdateAsync(cart.PaymentIntentId, options);
//             }
//         }
//         await cartService.SetCartAsync(cart);
//         return cart;
//     }
// }
public class PaymentService(IConfiguration config, ICartService cartService, IUnitOfWork unit) : IPaymentService
{
    public async Task<ShoppingCart> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];

        var cart = await cartService.GetCartAsync(cartId);
        if (cart == null) return null;

        decimal shippingPrice = 0m;

        if (cart.DeliveryMethodId.HasValue)
        {
            var deliveryMethod = await unit.Repository<DeliveryMethod>()
                .GetByIdAsync(cart.DeliveryMethodId.Value);
            if (deliveryMethod == null) return null;
            shippingPrice = deliveryMethod.Price;
        }

        // Sync item prices with product catalog
        foreach (var item in cart.Items)
        {
            var product = await unit.Repository<Core.Entities.Product>().GetByIdAsync(item.ProductId);
            if (product == null) return null;

            if (item.Price != product.Price)
            {
                item.Price = product.Price;
            }
        }

        var amount = (long)cart.Items.Sum(x => x.Quantity * x.Price * 100) + (long)(shippingPrice * 100);

        var service = new PaymentIntentService();
        PaymentIntent intent;

        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            // Create new PaymentIntent
            var createOptions = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = "gbp",
                PaymentMethodTypes = ["card"]
            };

            intent = await service.CreateAsync(createOptions);
            cart.PaymentIntentId = intent.Id;
            cart.ClientSecret = intent.ClientSecret;
        }
        else
        {
            // Check existing intent status before updating
            intent = await service.GetAsync(cart.PaymentIntentId);

            if (intent.Status is "requires_payment_method" or "requires_confirmation" or "requires_action")
            {
                var updateOptions = new PaymentIntentUpdateOptions
                {
                    Amount = amount
                };

                intent = await service.UpdateAsync(cart.PaymentIntentId, updateOptions);
            }
            else if (intent.Status == "succeeded")
            {
                // Optionally: return as-is or create new intent
                // You could also throw an exception or log it depending on your flow
                return cart; // Don't update succeeded intents
            }
        }

        await cartService.SetCartAsync(cart);
        return cart;
    }
}

