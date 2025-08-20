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
        var spec = new OrderSpecification(OrderStatus.Dispatched);
        
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
            .ListAsync(new OrderSpecification(OrderStatus.Dispatched));

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
            .ListAsync(new OrderSpecification(OrderStatus.Dispatched));

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
        var spec = new OrderSpecification(OrderStatus.Dispatched);
        var orders = await unit.Repository<Order>().ListAsync(spec);

        var distribution = orders
            .Where(o => o.DispatchDate != null)
             .Select(o => new
             {
                 DaysToDeliver = (o.DispatchDate!.Value.Date - o.OrderDate.Date).Days
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
        var spec = new OrderSpecification(OrderStatus.Dispatched);
        var orders = await unit.Repository<Order>().ListAsync(spec);

        var eligible = orders.ToList();

        var onTime = eligible.Count(o =>
        {
            if (o.DispatchDate == null) return false;

            var orderTime = o.OrderDate.TimeOfDay;
            var orderDate = o.OrderDate.Date;
            var dispatchDate = o.DispatchDate.Value.Date;

            // If ordered before 2 PM, must be delivered same day
            if (orderTime < new TimeSpan(14, 0, 0))
            {
                return dispatchDate == orderDate;
            }
            // If ordered after 2 PM, must be delivered the next day
            else
            {
                return dispatchDate == orderDate.AddDays(1);
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


    [HttpGet("dispatch-time-distribution")]
    public async Task<ActionResult<object>> GetDispatchTimeDistribution()
    {
        var spec = new OrderSpecification(OrderStatus.Dispatched);
        var orders = await unit.Repository<Order>().ListAsync(spec);

        var dispatchTimes = orders
            .Where(o => o.DispatchDate != null)
            .Select(o => (o.DispatchDate!.Value - o.OrderDate).TotalHours)
            .ToList();
        var buckets = new List<DispatchTimeBucket>
       {
            new DispatchTimeBucket { Label = "0-12h", Min = 0, Max = 12 },
            new DispatchTimeBucket { Label = "12-24h", Min = 12, Max = 24 },
            new DispatchTimeBucket { Label = "1-2d", Min = 24, Max = 48 },
            new DispatchTimeBucket { Label = "2-3d", Min = 48, Max = 72 },
            new DispatchTimeBucket { Label = "3-5d", Min = 72, Max = 120 },
            new DispatchTimeBucket { Label = "5d+", Min = 120, Max = double.MaxValue }
        };
        var result = buckets.Select(b => new
        {
            label = b.Label,
            count = dispatchTimes.Count(t => t >= b.Min && t < b.Max)
        });

        return Ok(result);

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



