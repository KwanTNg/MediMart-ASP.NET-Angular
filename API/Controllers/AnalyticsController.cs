using API.DTOs;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AnalyticsController(IUnitOfWork unit) : BaseApiController
{
    [HttpGet("sales-over-time")]
    public async Task<ActionResult<List<SalesOverTimeDto>>> GetSalesOverTime()
    {
        var spec = new OrderSpecification(OrderStatus.PaymentReceived);
        // Get orders with status = PaymentReceived
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
}



