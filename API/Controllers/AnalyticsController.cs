using API.DTOs;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin,Analyst,Director")]
public class AnalyticsController(IUnitOfWork unit, UserManager<AppUser> userManager) : BaseApiController
{
    [HttpGet("sales-over-time")]
    public async Task<ActionResult<List<SalesOverTimeDto>>> GetSalesOverTime()
    {
        var spec = new OrderSpecification(OrderStatus.Delivered);
        
        var orders = await unit.Repository<Order>()
            .ListAsync(spec);

        var sales = orders
            .SelectMany(o => o.OrderItems.Select(oi => new
            {
                o.OrderDate,
                Revenue = oi.Price * oi.Quantity
            }))
            .GroupBy(x => x.OrderDate.Date)
            .Select(g => new SalesOverTimeDto
            {
                Date = g.Key,
                TotalRevenue = g.Sum(x => x.Revenue)
            })
            .OrderBy(x => x.Date)
            .ToList();

        return Ok(sales);
    }

    [HttpGet("top-selling-products")]
    public async Task<ActionResult<List<TopSellingProductDto>>> GetTopSellingProducts()
    {
        var orders = await unit.Repository<Order>()
            .ListAsync(new OrderSpecification(OrderStatus.Delivered));

        var productSales = orders
            .SelectMany(o => o.OrderItems)
            .GroupBy(oi => oi.ItemOrdered.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                ProductName = g.First().ItemOrdered.ProductName,
                TotalQuantitySold = g.Sum(oi => oi.Quantity)
            })
            .OrderByDescending(x => x.TotalQuantitySold)
            .Take(5)
            .Select(x => new TopSellingProductDto
            {
                ProductName = x.ProductName,
                TotalQuantitySold = x.TotalQuantitySold
            })
            .ToList();

        return Ok(productSales);
    }

    [HttpGet("sales-by-status")]
    public async Task<ActionResult<List<SalesByStatusDto>>> GetSalesByStatus()
    {
        var orders = await unit.Repository<Order>().ListAsync(new OrderSpecification());

        var salesByStatus = orders
            .SelectMany(o => o.OrderItems.Select(oi => new
            {
                Status = o.Status.ToString(),
                Revenue = oi.Price * oi.Quantity
            }))
            .GroupBy(x => x.Status)
            .Select(g => new SalesByStatusDto
            {
                Status = g.Key,
                TotalRevenue = g.Sum(x => x.Revenue)
            })
            .OrderByDescending(x => x.TotalRevenue)
            .ToList();

        return Ok(salesByStatus);
    }

    [HttpGet("revenue-per-product")]
    public async Task<ActionResult<List<RevenuePerProductDto>>> GetRevenuePerProduct()
    {
        var orders = await unit.Repository<Order>()
            .ListAsync(new OrderSpecification(OrderStatus.Delivered));

        var revenueByProduct = orders
            .SelectMany(o => o.OrderItems.Select(oi => new
            {
                ProductName = oi.ItemOrdered.ProductName,
                Revenue = oi.Price * oi.Quantity
            }))
                 .GroupBy(x => x.ProductName)
                .Select(g => new RevenuePerProductDto
                {
                    ProductName = g.Key,
                    TotalRevenue = g.Sum(x => x.Revenue)
                })
            .OrderByDescending(x => x.TotalRevenue)
            .ToList();

        return Ok(revenueByProduct);
    }

    [HttpGet("delivery-distribution")]
    public async Task<ActionResult<List<DeliveryDistributionDto>>> GetDeliveryDistribution()
    {
        var spec = new OrderSpecification(OrderStatus.Delivered);
        var orders = await unit.Repository<Order>().ListAsync(spec);

        var distribution = orders
            .Where(o => o.DeliveryDate != null)
             .Select(o => new
             {
                 DaysToDeliver = (o.DeliveryDate!.Value.Date - o.OrderDate.Date).Days
             })
            .GroupBy(x =>
                x.DaysToDeliver == 0 ? "Same-day" :
                x.DaysToDeliver == 1 ? "Next-day" : "Standard"
            )
            .Select(g => new DeliveryDistributionDto
            {
                DeliveryType = g.Key,
                Count = g.Count()
            })
            .ToList();

        return Ok(distribution);
    }

    [HttpGet("on-time-dispatch-rate")]
public async Task<ActionResult<OnTimeDispatchDto>> GetOnTimeDispatchRate()
{
    var spec = new OrderSpecification(OrderStatus.Delivered);
    var orders = await unit.Repository<Order>().ListAsync(spec);

    var eligible = orders.ToList();

    var onTime = eligible.Count(o =>
    {
        if (o.DeliveryDate == null) return false;

        var orderTime = o.OrderDate.TimeOfDay;
        var orderDate = o.OrderDate.Date;
        var deliveryDate = o.DeliveryDate.Value.Date;

        // If ordered before 2 PM, must be delivered same day
        if (orderTime < new TimeSpan(14, 0, 0))
        {
            return deliveryDate == orderDate;
        }
        // If ordered after 2 PM, must be delivered the next day
        else
        {
            return deliveryDate == orderDate.AddDays(1);
        }
    });

    var dto = new OnTimeDispatchDto
    {
        EligibleOrders = eligible.Count,
        OnTimeDeliveries = onTime,
        OnTimeRate = eligible.Count == 0 ? 0 : (double)onTime / eligible.Count * 100
    };

    return Ok(dto);
}


    [HttpGet("average-delivery-time")]
    public async Task<ActionResult<double>> GetAverageDeliveryTime()
    {
        var spec = new OrderSpecification(OrderStatus.Delivered);
        var orders = await unit.Repository<Order>().ListAsync(spec);

        var avgDays = orders
        .Where(o => o.DeliveryDate != null)
        .Select(o => (o.DeliveryDate!.Value.Date - o.OrderDate.Date).TotalDays)
        .DefaultIfEmpty(0)
        .Average();

        return Ok(Math.Round(avgDays, 2));
    }

    [HttpGet("role-distribution")]
    public async Task<ActionResult> GetUserRoleDistribution()
    {
        var roles = new[] { "Patient", "Pharmacist", "Analyst", "Director", "Admin" };
        var roleCounts = new Dictionary<string, int>();

        foreach (var role in roles)
        {
            var usersInRole = await userManager.GetUsersInRoleAsync(role);
            roleCounts[role] = usersInRole.Count;
        }

        return Ok(roleCounts);
    }

    [HttpGet("registrations-over-time")]
    public async Task<ActionResult> GetUserRegistrationsOverTime()
    {
        var allUsers = await userManager.Users.ToListAsync();

        var grouped = allUsers
            .GroupBy(u => u.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Count = g.Count()
            });

        return Ok(grouped);
    }

}



