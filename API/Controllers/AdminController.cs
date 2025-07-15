using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unit) : BaseApiController
{
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery] OrderSpecParams specParams)
    {
        var spec = new OrderSpecification(specParams);
        return await CreatePagedResult(unit.Repository<Order>(), spec, specParams.PageIndex,
            specParams.PageSize, o => o.ToDto());
    }

    [HttpGet("orders/{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(id);
        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);
        if (order == null) return BadRequest("No order with that id");
        return order.ToDto();
    }

    [HttpGet("order-items")]
    public async Task<ActionResult<IReadOnlyList<OrderItemDto>>> GetOrderItems([FromQuery] PagingParams specParams)
    {
        var spec = new OrderItemSpecification(specParams);
        return await CreatePagedResult(unit.Repository<OrderItem>(), spec, specParams.PageIndex,
            specParams.PageSize, o => o.ToDto());
    }

}
