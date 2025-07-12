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

    [HttpGet("top-selling-products")]
    public async Task<ActionResult<List<TopSellingProductDto>>> GetTopSellingProducts()
    {
        var orders = await unit.Repository<Order>()
            .ListAsync(new OrderSpecification(OrderStatus.PaymentReceived));

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
            .ListAsync(new OrderSpecification(OrderStatus.PaymentReceived));

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




}



